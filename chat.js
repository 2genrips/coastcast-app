/* CastVector v5.4 — Community Live
   Real-time text chat + online presence using the user's existing Supabase project.
   Does not store service-role/secret keys in the browser. */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const CHANNELS = {
    general: 'General',
    tips: 'Tips & Rigs',
    conditions: 'Local Conditions',
    help: 'App Help'
  };
  const PAGE_SIZE = 50;

  const state = {
    client: null,
    session: null,
    user: null,
    profile: null,
    channel: 'general',
    messages: [],
    blocked: new Set(),
    presenceChannel: null,
    messageChannel: null,
    isAdmin: false,
    backendReady: false,
    loading: false,
    oldest: null,
    hasOlder: true,
    reply: null,
    initialized: false,
    toastTimer: null
  };

  function cfg() {
    return window.COASTCAST_CONFIG || window.CASTVECTOR_CONFIG || {};
  }

  function findStoredSession() {
    let best = null;
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key) continue;
        const raw = localStorage.getItem(key);
        if (!raw || raw.length < 30) continue;
        let parsed;
        try { parsed = JSON.parse(raw); } catch { continue; }
        const candidates = [parsed, parsed?.currentSession, parsed?.session, parsed?.data?.session, parsed?.cloud?.session].filter(Boolean);
        for (const item of candidates) {
          if (item?.access_token && item?.refresh_token && item?.user?.id) {
            if (!best || Number(item.expires_at || 0) > Number(best.expires_at || 0)) best = item;
          }
        }
      }
    } catch (_) {}
    return best;
  }

  function showToast(text) {
    let el = document.querySelector('.cv-chat-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'cv-chat-toast';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  function setStatus(text, type = '') {
    const el = $('chatBackendStatus');
    if (!el) return;
    el.textContent = text;
    el.classList.remove('live', 'error');
    if (type) el.classList.add(type);
  }

  function setAuthUI(signedIn) {
    if ($('chatSignedOut')) $('chatSignedOut').hidden = !!signedIn;
    if ($('chatSignedIn')) $('chatSignedIn').hidden = !signedIn;
  }

  function generatedName() {
    return `Angler-${String(state.user?.id || 'USER').slice(0, 5).toUpperCase()}`;
  }

  function cleanName(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 32);
  }

  function initials(name) {
    const bits = String(name || 'A').trim().split(/\s+/).filter(Boolean);
    const val = bits.length > 1 ? bits[0][0] + bits[1][0] : String(bits[0] || 'A').slice(0, 2);
    return val.toUpperCase();
  }

  function timeLabel(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function safeSnippet(text, max = 90) {
    const value = String(text || '').replace(/\s+/g, ' ').trim();
    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
  }

  async function makeClient() {
    const config = cfg();
    if (!config.supabaseUrl || !config.supabasePublishableKey) {
      setStatus('Community Live needs the Supabase connection already used by CastVector accounts.', 'error');
      return false;
    }
    if (!window.supabase?.createClient) {
      setStatus('Community Live could not load its realtime library. Check your connection and reopen CastVector.', 'error');
      return false;
    }

    const stored = findStoredSession();
    if (!stored) {
      state.session = null;
      state.user = null;
      setAuthUI(false);
      setStatus('Sign in to your CastVector account to join Community Live.');
      return false;
    }

    try {
      state.client = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey, {
        auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: false },
        realtime: { params: { eventsPerSecond: 10 } }
      });
      const { data, error } = await state.client.auth.setSession({
        access_token: stored.access_token,
        refresh_token: stored.refresh_token
      });
      if (error || !data?.session?.user) throw error || new Error('No session');
      state.session = data.session;
      state.user = data.session.user;
      setAuthUI(true);
      return true;
    } catch (error) {
      console.warn('[Community Live] session setup failed', error);
      state.session = null;
      state.user = null;
      setAuthUI(false);
      setStatus('Your CastVector session needs to be refreshed. Open Profile, sign in again, then return to Community.', 'error');
      return false;
    }
  }

  async function checkBackend() {
    if (!state.client || !state.user) return false;
    const { error } = await state.client.from('castvector_chat_profiles').select('user_id').limit(1);
    if (error) {
      state.backendReady = false;
      setStatus('Community Live backend is not activated yet. Run CASTVECTOR_COMMUNITY_LIVE_SETUP_ANDROID.txt in Supabase, then tap Refresh.', 'error');
      if ($('chatSendBtn')) $('chatSendBtn').disabled = true;
      return false;
    }
    state.backendReady = true;
    if ($('chatSendBtn')) $('chatSendBtn').disabled = false;
    setStatus('LIVE • Messages and online presence are connected to CastVector accounts.', 'live');
    return true;
  }

  async function loadProfile() {
    if (!state.backendReady) return;
    const { data, error } = await state.client
      .from('castvector_chat_profiles')
      .select('user_id, display_name, created_at, updated_at')
      .eq('user_id', state.user.id)
      .maybeSingle();
    if (error) console.warn('[Community Live] profile', error);
    state.profile = data || null;
    const name = cleanName(data?.display_name) || generatedName();
    if ($('chatDisplayName')) $('chatDisplayName').value = name;
  }

  async function saveProfile(silent = false) {
    if (!state.backendReady || !state.user) return false;
    const name = cleanName($('chatDisplayName')?.value);
    if (name.length < 2) {
      showToast('Choose a public chat name with at least 2 characters.');
      return false;
    }
    const { data, error } = await state.client
      .from('castvector_chat_profiles')
      .upsert({ user_id: state.user.id, display_name: name, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      .select('user_id, display_name, updated_at')
      .single();
    if (error) {
      console.warn('[Community Live] save profile', error);
      showToast('Could not save chat name.');
      return false;
    }
    state.profile = data;
    if (!silent) showToast('Public chat name saved.');
    await trackPresence();
    return true;
  }

  async function loadBlocks() {
    if (!state.backendReady) return;
    const { data, error } = await state.client
      .from('castvector_chat_blocks')
      .select('blocked_user_id, blocked_display_name, created_at')
      .eq('blocker_user_id', state.user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('[Community Live] blocks', error);
      return;
    }
    state.blocked = new Set((data || []).map(row => row.blocked_user_id));
    renderBlockedList(data || []);
  }

  async function checkAdmin() {
    if (!state.client) return;
    const { data, error } = await state.client.rpc('coastcast_is_admin');
    state.isAdmin = !error && data === true;
  }

  function renderBlockedList(rows) {
    const box = $('chatBlockedList');
    if (!box) return;
    box.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No blocked anglers.';
      box.appendChild(empty);
      return;
    }
    rows.forEach(row => {
      const item = document.createElement('div');
      item.className = 'cv-blocked-item';
      const copy = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = row.blocked_display_name || 'Blocked angler';
      const small = document.createElement('small');
      small.textContent = 'Their messages are hidden from your chat.';
      copy.append(strong, small);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'secondary-button small';
      btn.textContent = 'Unblock';
      btn.addEventListener('click', () => unblockUser(row.blocked_user_id));
      item.append(copy, btn);
      box.appendChild(item);
    });
  }

  async function loadMessages({ older = false } = {}) {
    if (!state.backendReady || state.loading) return;
    state.loading = true;
    try {
      let query = state.client
        .from('castvector_chat_messages')
        .select('id,user_id,display_name,author_badge,channel,body,reply_to,created_at')
        .eq('channel', state.channel)
        .eq('is_removed', false)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);
      if (older && state.oldest) query = query.lt('created_at', state.oldest);
      const { data, error } = await query;
      if (error) throw error;
      const rows = (data || []).reverse();
      if (older) {
        const existing = new Set(state.messages.map(m => m.id));
        state.messages = [...rows.filter(m => !existing.has(m.id)), ...state.messages];
      } else {
        state.messages = rows;
      }
      state.oldest = state.messages[0]?.created_at || null;
      state.hasOlder = rows.length === PAGE_SIZE;
      if ($('chatLoadOlderBtn')) $('chatLoadOlderBtn').hidden = !state.hasOlder;
      renderMessages({ preserveBottom: older });
    } catch (error) {
      console.warn('[Community Live] load messages', error);
      setStatus('Live chat could not load. Tap Community Refresh or reopen the app.', 'error');
    } finally {
      state.loading = false;
    }
  }

  function messageById(id) {
    return state.messages.find(m => String(m.id) === String(id));
  }

  function renderMessages({ preserveBottom = false } = {}) {
    const list = $('chatMessages');
    if (!list) return;
    const previousHeight = list.scrollHeight;
    const previousTop = list.scrollTop;
    list.replaceChildren();
    const visible = state.messages.filter(m => !state.blocked.has(m.user_id));
    if (!visible.length) {
      const empty = document.createElement('div');
      empty.className = 'cv-chat-empty';
      const inner = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = `Start the ${CHANNELS[state.channel]} conversation.`;
      const span = document.createElement('span');
      span.textContent = state.channel === 'conditions' ? 'Share what the water, wind or bite looks like without exposing a private spot.' : 'Ask a fishing question or help another angler.';
      inner.append(strong, span);
      empty.appendChild(inner);
      list.appendChild(empty);
      return;
    }

    visible.forEach(msg => list.appendChild(buildMessageNode(msg)));
    if (preserveBottom) list.scrollTop = previousTop + (list.scrollHeight - previousHeight);
    else list.scrollTop = list.scrollHeight;
  }

  function buildMessageNode(msg) {
    const mine = msg.user_id === state.user?.id;
    const row = document.createElement('article');
    row.className = `cv-chat-message${mine ? ' mine' : ''}`;
    row.dataset.messageId = String(msg.id);

    const avatar = document.createElement('div');
    avatar.className = 'cv-chat-avatar';
    avatar.textContent = initials(msg.display_name);

    const wrap = document.createElement('div');
    wrap.className = 'cv-chat-bubble-wrap';

    const author = document.createElement('div');
    author.className = 'cv-chat-author';
    const name = document.createElement('strong');
    name.textContent = mine ? 'You' : msg.display_name;
    author.appendChild(name);
    if (msg.author_badge === 'STAFF') {
      const badge = document.createElement('span');
      badge.className = 'cv-chat-staff';
      badge.textContent = 'STAFF';
      author.appendChild(badge);
    }
    const time = document.createElement('span');
    time.className = 'cv-chat-time';
    time.textContent = timeLabel(msg.created_at);
    author.appendChild(time);

    const bubble = document.createElement('div');
    bubble.className = 'cv-chat-bubble';
    if (msg.reply_to) {
      const target = messageById(msg.reply_to);
      const quote = document.createElement('div');
      quote.className = 'cv-chat-quoted';
      const qn = document.createElement('strong');
      qn.textContent = target?.display_name || 'Earlier message';
      const qt = document.createElement('span');
      qt.textContent = target ? safeSnippet(target.body, 70) : 'Reply';
      quote.append(qn, qt);
      bubble.appendChild(quote);
    }
    const body = document.createElement('span');
    body.textContent = msg.body;
    bubble.appendChild(body);

    const actions = document.createElement('div');
    actions.className = 'cv-chat-actions';
    const replyBtn = document.createElement('button');
    replyBtn.type = 'button'; replyBtn.textContent = 'Reply';
    replyBtn.addEventListener('click', () => setReply(msg));
    actions.appendChild(replyBtn);

    if (mine) {
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button'; deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => deleteOwnMessage(msg));
      actions.appendChild(deleteBtn);
    } else {
      const reportBtn = document.createElement('button');
      reportBtn.type = 'button'; reportBtn.textContent = 'Report';
      reportBtn.addEventListener('click', () => reportMessage(msg));
      const blockBtn = document.createElement('button');
      blockBtn.type = 'button'; blockBtn.textContent = 'Block';
      blockBtn.addEventListener('click', () => blockUser(msg));
      actions.append(reportBtn, blockBtn);
      if (state.isAdmin) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button'; removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => adminRemoveMessage(msg));
        actions.appendChild(removeBtn);
      }
    }

    wrap.append(author, bubble, actions);
    row.append(avatar, wrap);
    return row;
  }

  function setReply(msg) {
    state.reply = msg;
    if ($('chatReplyBar')) $('chatReplyBar').hidden = false;
    if ($('chatReplyName')) $('chatReplyName').textContent = msg.display_name || 'angler';
    if ($('chatReplyText')) $('chatReplyText').textContent = safeSnippet(msg.body, 100);
    $('chatMessageInput')?.focus();
  }

  function cancelReply() {
    state.reply = null;
    if ($('chatReplyBar')) $('chatReplyBar').hidden = true;
  }

  async function sendMessage(event) {
    event?.preventDefault?.();
    if (!state.backendReady || !state.user) return;
    const input = $('chatMessageInput');
    const body = String(input?.value || '').trim();
    if (!body) return;
    if (body.length > 600) return showToast('Messages are limited to 600 characters.');
    if (!state.profile?.display_name) {
      const saved = await saveProfile(true);
      if (!saved) return;
    }
    const btn = $('chatSendBtn');
    if (btn) btn.disabled = true;
    const payload = {
      user_id: state.user.id,
      channel: state.channel,
      body,
      display_name: cleanName(state.profile?.display_name || $('chatDisplayName')?.value || generatedName()),
      reply_to: state.reply?.id || null
    };
    const { data, error } = await state.client
      .from('castvector_chat_messages')
      .insert(payload)
      .select('id,user_id,display_name,author_badge,channel,body,reply_to,created_at')
      .single();
    if (btn) btn.disabled = false;
    if (error) {
      console.warn('[Community Live] send', error);
      const text = String(error.message || '').toLowerCase();
      showToast(text.includes('slow down') ? 'Slow down a little before sending again.' : 'Message could not be sent.');
      return;
    }
    input.value = '';
    updateCharCount();
    cancelReply();
    if (data && !state.messages.some(m => m.id === data.id)) {
      state.messages.push(data);
      renderMessages();
    }
  }

  async function deleteOwnMessage(msg) {
    if (!window.confirm('Delete this message?')) return;
    const { error } = await state.client.from('castvector_chat_messages').delete().eq('id', msg.id).eq('user_id', state.user.id);
    if (error) return showToast('Could not delete message.');
    state.messages = state.messages.filter(m => m.id !== msg.id);
    renderMessages({ preserveBottom: true });
  }

  async function reportMessage(msg) {
    const details = window.prompt('What is wrong with this message?\nExamples: harassment, spam, unsafe advice, privacy, illegal activity', 'Inappropriate or unsafe content');
    if (details === null) return;
    const { error } = await state.client.from('castvector_chat_reports').insert({
      reporter_user_id: state.user.id,
      message_id: msg.id,
      reported_user_id: msg.user_id,
      reason: 'user_report',
      details: String(details || '').trim().slice(0, 300)
    });
    if (error) {
      console.warn('[Community Live] report', error);
      if (String(error.code || '') === '23505') return showToast('You already reported this message.');
      return showToast('Could not submit report.');
    }
    showToast('Report sent to CastVector moderation.');
  }

  async function blockUser(msg) {
    if (!window.confirm(`Block ${msg.display_name}? Their chat messages will be hidden for you.`)) return;
    const { error } = await state.client.from('castvector_chat_blocks').upsert({
      blocker_user_id: state.user.id,
      blocked_user_id: msg.user_id,
      blocked_display_name: msg.display_name
    }, { onConflict: 'blocker_user_id,blocked_user_id' });
    if (error) return showToast('Could not block this angler.');
    state.blocked.add(msg.user_id);
    await loadBlocks();
    renderMessages({ preserveBottom: true });
    showToast(`${msg.display_name} blocked.`);
  }

  async function unblockUser(userId) {
    const { error } = await state.client.from('castvector_chat_blocks')
      .delete().eq('blocker_user_id', state.user.id).eq('blocked_user_id', userId);
    if (error) return showToast('Could not unblock angler.');
    state.blocked.delete(userId);
    await loadBlocks();
    renderMessages({ preserveBottom: true });
    showToast('Angler unblocked.');
  }

  async function adminRemoveMessage(msg) {
    const reason = window.prompt('Owner moderation reason', 'Removed by CastVector moderation');
    if (reason === null) return;
    const { error } = await state.client.rpc('castvector_chat_remove_message', { p_message_id: msg.id, p_reason: String(reason || '').slice(0, 200) });
    if (error) return showToast('Could not remove message.');
    state.messages = state.messages.filter(m => m.id !== msg.id);
    renderMessages({ preserveBottom: true });
    showToast('Message removed.');
  }

  async function subscribeMessages() {
    if (!state.client || !state.backendReady) return;
    if (state.messageChannel) {
      await state.client.removeChannel(state.messageChannel).catch(() => {});
      state.messageChannel = null;
    }
    state.messageChannel = state.client.channel(`castvector-chat-${state.channel}-${Math.random().toString(36).slice(2, 7)}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'castvector_chat_messages', filter: `channel=eq.${state.channel}`
      }, payload => {
        if (payload.eventType === 'INSERT') {
          const msg = payload.new;
          if (!msg?.id || msg.is_removed || state.messages.some(m => m.id === msg.id)) return;
          state.messages.push(msg);
          if (state.messages.length > 160) state.messages = state.messages.slice(-160);
          renderMessages();
        } else if (payload.eventType === 'UPDATE') {
          const msg = payload.new;
          if (msg?.is_removed) state.messages = state.messages.filter(m => m.id !== msg.id);
          else state.messages = state.messages.map(m => m.id === msg.id ? msg : m);
          renderMessages({ preserveBottom: true });
        } else if (payload.eventType === 'DELETE') {
          state.messages = state.messages.filter(m => m.id !== payload.old?.id);
          renderMessages({ preserveBottom: true });
        }
      })
      .subscribe(status => {
        if (status === 'CHANNEL_ERROR') setStatus('Realtime message updates disconnected. You can still refresh manually.', 'error');
      });
  }

  async function subscribePresence() {
    if (!state.client || !state.user) return;
    if (state.presenceChannel) {
      await state.client.removeChannel(state.presenceChannel).catch(() => {});
      state.presenceChannel = null;
    }
    state.presenceChannel = state.client.channel('castvector-community-presence', {
      config: { presence: { key: state.user.id } }
    });
    state.presenceChannel
      .on('presence', { event: 'sync' }, updatePresenceCounts)
      .on('presence', { event: 'join' }, updatePresenceCounts)
      .on('presence', { event: 'leave' }, updatePresenceCounts)
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') await trackPresence();
      });
  }

  async function trackPresence() {
    if (!state.presenceChannel || !state.user) return;
    const payload = {
      user_id: state.user.id,
      display_name: cleanName(state.profile?.display_name || $('chatDisplayName')?.value || generatedName()),
      channel: state.channel,
      online_at: new Date().toISOString()
    };
    try { await state.presenceChannel.track(payload); } catch (_) {}
  }

  function updatePresenceCounts() {
    const presence = state.presenceChannel?.presenceState?.() || {};
    const userIds = Object.keys(presence);
    let inChannel = 0;
    userIds.forEach(id => {
      const metas = Array.isArray(presence[id]) ? presence[id] : [];
      if (metas.some(meta => meta.channel === state.channel)) inChannel += 1;
    });
    if ($('chatOnlineCount')) $('chatOnlineCount').textContent = String(userIds.length || 1);
    if ($('chatChannelOnline')) $('chatChannelOnline').textContent = `${inChannel || (state.user ? 1 : 0)} online in this channel`;
  }

  async function switchChannel(channel) {
    if (!CHANNELS[channel] || channel === state.channel) return;
    state.channel = channel;
    state.messages = [];
    state.oldest = null;
    state.hasOlder = true;
    cancelReply();
    document.querySelectorAll('[data-chat-channel]').forEach(btn => btn.classList.toggle('active', btn.dataset.chatChannel === channel));
    if ($('chatChannelTitle')) $('chatChannelTitle').textContent = CHANNELS[channel];
    if ($('chatMessages')) $('chatMessages').innerHTML = '<div class="cv-chat-empty"><div><strong>Loading live chat…</strong><span>One moment.</span></div></div>';
    await trackPresence();
    updatePresenceCounts();
    await loadMessages();
    await subscribeMessages();
  }

  function updateCharCount() {
    const input = $('chatMessageInput');
    const count = String(input?.value || '').length;
    if ($('chatCharCount')) $('chatCharCount').textContent = `${count} / 600`;
  }

  async function refreshAll() {
    setStatus('Refreshing Community Live…');
    if (!state.client || !state.user) {
      const ok = await makeClient();
      if (!ok) return;
    }
    if (!await checkBackend()) return;
    await Promise.all([loadProfile(), loadBlocks(), checkAdmin()]);
    await loadMessages();
    await subscribeMessages();
    if (!state.presenceChannel) await subscribePresence(); else await trackPresence();
    updatePresenceCounts();
  }

  function bindEvents() {
    $('chatOpenProfileBtn')?.addEventListener('click', () => $('profileBtn')?.click());
    $('chatSaveNameBtn')?.addEventListener('click', () => saveProfile(false));
    $('chatSafetyBtn')?.addEventListener('click', () => $('chatSafetyDialog')?.showModal());
    $('chatComposer')?.addEventListener('submit', sendMessage);
    $('chatMessageInput')?.addEventListener('input', updateCharCount);
    $('chatCancelReplyBtn')?.addEventListener('click', cancelReply);
    $('chatLoadOlderBtn')?.addEventListener('click', () => loadMessages({ older: true }));
    document.querySelectorAll('[data-chat-channel]').forEach(btn => btn.addEventListener('click', () => switchChannel(btn.dataset.chatChannel)));
    $('communityRefreshBtn')?.addEventListener('click', () => setTimeout(refreshAll, 0));

    // When the user returns from Profile after signing in/out, refresh the chat state.
    $('openCommunityBtn')?.addEventListener('click', () => setTimeout(refreshAll, 250));
    window.addEventListener('focus', () => {
      if (document.visibilityState === 'visible') setTimeout(refreshAll, 250);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') setTimeout(refreshAll, 250);
    });
  }

  async function init() {
    if (state.initialized || !$('communityLivePanel')) return;
    state.initialized = true;
    bindEvents();
    updateCharCount();
    const ok = await makeClient();
    if (!ok) return;
    if (!await checkBackend()) return;
    await Promise.all([loadProfile(), loadBlocks(), checkAdmin()]);
    await loadMessages();
    await subscribeMessages();
    await subscribePresence();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
