/* CastVector v5.5 — Community Pro
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
    notificationChannel: null,
    isAdmin: false,
    backendReady: false,
    loading: false,
    oldest: null,
    hasOlder: true,
    reply: null,
    pinned: null,
    unread: { general: 0, tips: 0, conditions: 0, help: 0 },
    typingUsers: new Map(),
    typingTimer: null,
    typingStopTimer: null,
    rulesAccepted: false,
    lastSeenWrite: 0,
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


  function communityIsActive() {
    return !!$('view-community')?.classList.contains('active');
  }

  function rulesKey() {
    return `castvector-chat-rules-v1:${state.user?.id || 'guest'}`;
  }

  function updateRulesState() {
    try { state.rulesAccepted = localStorage.getItem(rulesKey()) === 'accepted'; }
    catch (_) { state.rulesAccepted = false; }
  }

  function totalUnread() {
    return Object.values(state.unread).reduce((sum, value) => sum + Number(value || 0), 0);
  }

  function renderUnreadBadges() {
    document.querySelectorAll('[data-chat-channel]').forEach(btn => {
      const channel = btn.dataset.chatChannel;
      let badge = btn.querySelector('.cv-channel-unread');
      const count = Number(state.unread[channel] || 0);
      if (!badge && count > 0) {
        badge = document.createElement('span');
        badge.className = 'cv-channel-unread';
        btn.appendChild(badge);
      }
      if (badge) {
        badge.textContent = count > 99 ? '99+' : String(count);
        badge.hidden = count < 1;
      }
    });
    const total = totalUnread();
    const badge = $('communityUnreadBadge');
    if (badge) {
      badge.hidden = total < 1;
      badge.textContent = total > 99 ? '99+' : String(total);
    }
  }

  function markChannelRead(channel = state.channel) {
    if (!CHANNELS[channel]) return;
    state.unread[channel] = 0;
    renderUnreadBadges();
  }

  function addUnread(channel) {
    if (!CHANNELS[channel]) return;
    state.unread[channel] = Math.min(999, Number(state.unread[channel] || 0) + 1);
    renderUnreadBadges();
  }

  function relativeUntil(iso) {
    if (!iso) return 'Permanent';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Active';
    const ms = d.getTime() - Date.now();
    if (ms <= 0) return 'Expired';
    const minutes = Math.ceil(ms / 60000);
    if (minutes < 60) return `${minutes}m remaining`;
    const hours = Math.ceil(minutes / 60);
    if (hours < 48) return `${hours}h remaining`;
    return `${Math.ceil(hours / 24)}d remaining`;
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
      updateRulesState();
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
      .select('user_id, display_name, created_at, updated_at, last_seen_at')
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
    let result = await state.client.rpc('castvector_chat_is_admin');
    if (result.error) result = await state.client.rpc('coastcast_is_admin');
    state.isAdmin = !result.error && result.data === true;
    if ($('chatModerationSection')) $('chatModerationSection').hidden = !state.isAdmin;
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
    renderPinned();
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

  function renderPinned() {
    const box = $('chatPinned');
    if (!box) return;
    const pin = state.pinned || state.messages.find(m => m.is_pinned && !m.is_removed) || null;
    state.pinned = pin;
    box.replaceChildren();
    box.hidden = !pin;
    if (!pin) return;
    const top = document.createElement('div');
    top.className = 'pin-top';
    const label = document.createElement('span');
    label.className = 'pin-label';
    label.textContent = '📌 PINNED BY CASTVECTOR';
    const author = document.createElement('strong');
    author.textContent = pin.display_name || 'CastVector Staff';
    top.append(label, author);
    if (state.isAdmin) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Unpin';
      btn.addEventListener('click', () => adminPinMessage(pin, false));
      top.appendChild(btn);
    }
    const body = document.createElement('p');
    body.textContent = pin.body;
    box.append(top, body);
  }

  async function loadPinned() {
    if (!state.backendReady) return;
    const { data, error } = await state.client.from('castvector_chat_messages')
      .select('id,user_id,display_name,author_badge,channel,body,reply_to,is_pinned,created_at')
      .eq('channel', state.channel).eq('is_removed', false).eq('is_pinned', true)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!error) state.pinned = data || null;
    renderPinned();
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
        const pinBtn = document.createElement('button');
        const currentlyPinned = state.pinned?.id === msg.id || msg.is_pinned === true;
        pinBtn.type = 'button'; pinBtn.textContent = currentlyPinned ? 'Unpin' : 'Pin';
        pinBtn.className = 'cv-pin-action';
        pinBtn.addEventListener('click', () => adminPinMessage(msg, !currentlyPinned));
        const muteBtn = document.createElement('button');
        muteBtn.type = 'button'; muteBtn.textContent = 'Mute';
        muteBtn.className = 'cv-danger-action';
        muteBtn.addEventListener('click', () => adminMuteUser(msg));
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button'; removeBtn.textContent = 'Remove';
        removeBtn.className = 'cv-danger-action';
        removeBtn.addEventListener('click', () => adminRemoveMessage(msg));
        actions.append(pinBtn, muteBtn, removeBtn);
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
    if (!state.rulesAccepted) { $('chatRulesDialog')?.showModal(); return; }
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
      showToast(text.includes('slow down') ? 'Slow down a little before sending again.' : text.includes('restricted') ? 'Your Community Live posting access is currently restricted.' : 'Message could not be sent.');
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

  async function adminPinMessage(msg, shouldPin = true) {
    if (!state.isAdmin) return;
    const { error } = await state.client.rpc('castvector_chat_pin_message', { p_message_id: msg.id, p_pin: !!shouldPin });
    if (error) return showToast('Could not update pinned message. Run the v5.5 Community upgrade SQL first.');
    state.messages = state.messages.map(m => ({ ...m, is_pinned: m.channel === msg.channel ? (m.id === msg.id ? !!shouldPin : false) : m.is_pinned }));
    state.pinned = shouldPin ? { ...msg, is_pinned: true } : null;
    renderMessages({ preserveBottom: true });
    showToast(shouldPin ? 'Message pinned for this channel.' : 'Pinned message removed.');
  }

  async function adminMuteUser(msg, presetMinutes = null) {
    if (!state.isAdmin || !msg?.user_id) return;
    let minutes = presetMinutes;
    if (minutes === null) {
      const raw = window.prompt(`Mute ${msg.display_name} from posting for how many minutes?\n60 = 1 hour • 1440 = 1 day • 10080 = 7 days • 0 = permanent`, '1440');
      if (raw === null) return;
      minutes = Math.max(0, Math.min(525600, Number.parseInt(raw, 10) || 0));
    }
    const reason = window.prompt('Reason for chat restriction', 'Community rule violation');
    if (reason === null) return;
    const { error } = await state.client.rpc('castvector_chat_ban_user', { p_user_id: msg.user_id, p_minutes: minutes, p_reason: String(reason || '').slice(0, 200) });
    if (error) return showToast('Could not restrict this angler.');
    showToast(minutes > 0 ? `${msg.display_name} muted from posting.` : `${msg.display_name} permanently muted.`);
    await loadModeration();
  }

  async function loadModeration() {
    if (!state.isAdmin || !state.client) return;
    if ($('chatModerationSection')) $('chatModerationSection').hidden = false;
    const [reportsResult, bansResult] = await Promise.all([
      state.client.rpc('castvector_chat_admin_reports'),
      state.client.rpc('castvector_chat_admin_bans')
    ]);
    if (reportsResult.error || bansResult.error) {
      renderModerationUpgradeNeeded();
      return;
    }
    const reports = Array.isArray(reportsResult.data) ? reportsResult.data : [];
    const bans = Array.isArray(bansResult.data) ? bansResult.data : [];
    if ($('chatOpenReportCount')) $('chatOpenReportCount').textContent = String(reports.filter(r => r.status === 'open').length);
    if ($('chatActiveMuteCount')) $('chatActiveMuteCount').textContent = String(bans.length);
    renderReportQueue(reports);
    renderMuteList(bans);
  }

  function renderModerationUpgradeNeeded() {
    const text = 'Run CASTVECTOR_COMMUNITY_V5.5_UPGRADE_ANDROID.txt in Supabase to activate the moderation dashboard.';
    if ($('chatReportQueue')) $('chatReportQueue').innerHTML = `<div class="empty-state">${text}</div>`;
    if ($('chatMuteList')) $('chatMuteList').innerHTML = '<div class="empty-state">Community v5.5 upgrade required.</div>';
  }

  function renderReportQueue(rows) {
    const box = $('chatReportQueue');
    if (!box) return;
    box.replaceChildren();
    const openRows = rows.filter(row => row.status === 'open' || row.status === 'reviewed');
    if (!openRows.length) {
      const empty = document.createElement('div'); empty.className = 'empty-state'; empty.textContent = 'No open reports.'; box.appendChild(empty); return;
    }
    openRows.forEach(row => {
      const card = document.createElement('div'); card.className = 'cv-report-card';
      const title = document.createElement('strong'); title.textContent = row.reported_display_name || 'Reported angler';
      const body = document.createElement('p'); body.textContent = row.message_body ? `“${safeSnippet(row.message_body, 180)}”` : 'Reported message is unavailable.';
      const meta = document.createElement('small'); meta.textContent = `${CHANNELS[row.channel] || row.channel || 'Chat'} • ${timeLabel(row.created_at)} • ${row.details || 'No details provided'}`;
      const actions = document.createElement('div'); actions.className = 'cv-mod-actions';
      const remove = document.createElement('button'); remove.type='button'; remove.className='danger-button'; remove.textContent='Remove message'; remove.addEventListener('click', async () => {
        if (row.message_id) await state.client.rpc('castvector_chat_remove_message', { p_message_id: row.message_id, p_reason: 'Removed from report queue' });
        await resolveReport(row.id, 'actioned');
      });
      const mute = document.createElement('button'); mute.type='button'; mute.className='secondary-button'; mute.textContent='Mute 24h'; mute.addEventListener('click', async () => {
        const fake = { user_id: row.reported_user_id, display_name: row.reported_display_name || 'Angler' };
        const { error } = await state.client.rpc('castvector_chat_ban_user', { p_user_id: fake.user_id, p_minutes: 1440, p_reason: '24h mute from report queue' });
        if (error) return showToast('Could not mute angler.');
        await resolveReport(row.id, 'actioned');
      });
      const dismiss = document.createElement('button'); dismiss.type='button'; dismiss.className='ghost-button'; dismiss.textContent='Dismiss'; dismiss.addEventListener('click', () => resolveReport(row.id, 'dismissed'));
      actions.append(remove, mute, dismiss); card.append(title, body, meta, actions); box.appendChild(card);
    });
  }

  function renderMuteList(rows) {
    const box = $('chatMuteList');
    if (!box) return;
    box.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement('div'); empty.className='empty-state'; empty.textContent='No active chat mutes.'; box.appendChild(empty); return;
    }
    rows.forEach(row => {
      const card = document.createElement('div'); card.className='cv-mute-card';
      const title = document.createElement('strong'); title.textContent = row.display_name || 'Restricted angler';
      const detail = document.createElement('p'); detail.textContent = row.reason || 'Chat restriction';
      const meta = document.createElement('small'); meta.textContent = relativeUntil(row.banned_until);
      const actions = document.createElement('div'); actions.className='cv-mod-actions';
      const unmute = document.createElement('button'); unmute.type='button'; unmute.className='secondary-button'; unmute.textContent='Unmute'; unmute.addEventListener('click', async () => {
        const { error } = await state.client.rpc('castvector_chat_unban_user', { p_user_id: row.user_id });
        if (error) return showToast('Could not remove chat restriction.');
        showToast('Chat restriction removed.'); await loadModeration();
      });
      actions.appendChild(unmute); card.append(title, detail, meta, actions); box.appendChild(card);
    });
  }

  async function resolveReport(reportId, status) {
    const { error } = await state.client.rpc('castvector_chat_resolve_report', { p_report_id: reportId, p_status: status });
    if (error) return showToast('Could not update report.');
    showToast(status === 'dismissed' ? 'Report dismissed.' : 'Report action recorded.');
    await loadModeration();
  }

  async function subscribeNotifications() {
    if (!state.client || !state.backendReady || state.notificationChannel) return;
    state.notificationChannel = state.client.channel(`castvector-chat-notify-${Math.random().toString(36).slice(2,7)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'castvector_chat_messages' }, payload => {
        const msg = payload.new;
        if (!msg?.id || msg.user_id === state.user?.id || msg.is_removed) return;
        const activeHere = communityIsActive() && msg.channel === state.channel && document.visibilityState === 'visible';
        if (!activeHere) addUnread(msg.channel);
      })
      .subscribe();
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
          if (msg.is_pinned) state.pinned = msg;
          if (state.messages.length > 160) state.messages = state.messages.slice(-160);
          renderMessages();
        } else if (payload.eventType === 'UPDATE') {
          const msg = payload.new;
          if (msg?.is_removed) { state.messages = state.messages.filter(m => m.id !== msg.id); if (state.pinned?.id === msg.id) state.pinned = null; }
          else {
            state.messages = state.messages.map(m => m.id === msg.id ? msg : m);
            if (msg.is_pinned) state.pinned = msg; else if (state.pinned?.id === msg.id) state.pinned = null;
          }
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
      .on('broadcast', { event: 'typing' }, ({ payload }) => handleTypingBroadcast(payload))
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
    if (state.backendReady && Date.now() - state.lastSeenWrite > 60000) {
      state.lastSeenWrite = Date.now();
      state.client.from('castvector_chat_profiles').update({ last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('user_id', state.user.id).then(() => {}).catch(() => {});
    }
  }

  function handleTypingBroadcast(payload) {
    if (!payload || payload.user_id === state.user?.id) return;
    if (payload.channel !== state.channel) return;
    if (payload.typing) state.typingUsers.set(payload.user_id, { name: cleanName(payload.display_name) || 'An angler', expires: Date.now() + 3500 });
    else state.typingUsers.delete(payload.user_id);
    renderTypingIndicator();
  }

  function renderTypingIndicator() {
    const el = $('chatTypingIndicator');
    if (!el) return;
    const now = Date.now();
    for (const [id, item] of state.typingUsers.entries()) if (item.expires <= now) state.typingUsers.delete(id);
    const names = [...state.typingUsers.values()].map(item => item.name);
    el.textContent = names.length === 1 ? `${names[0]} is typing…` : names.length === 2 ? `${names[0]} and ${names[1]} are typing…` : names.length > 2 ? `${names.length} anglers are typing…` : '';
  }

  function emitTyping() {
    if (!state.presenceChannel || !state.user) return;
    clearTimeout(state.typingTimer);
    clearTimeout(state.typingStopTimer);
    const payload = { user_id: state.user.id, display_name: cleanName(state.profile?.display_name || $('chatDisplayName')?.value || generatedName()), channel: state.channel, typing: true };
    state.presenceChannel.send({ type: 'broadcast', event: 'typing', payload }).catch(() => {});
    state.typingStopTimer = setTimeout(() => {
      state.presenceChannel?.send({ type: 'broadcast', event: 'typing', payload: { ...payload, typing: false } }).catch(() => {});
    }, 1800);
    state.typingTimer = setTimeout(renderTypingIndicator, 3600);
  }

  function updatePresenceCounts() {
    const presence = state.presenceChannel?.presenceState?.() || {};
    const userIds = Object.keys(presence);
    let inChannel = 0;
    userIds.forEach(id => {
      const metas = Array.isArray(presence[id]) ? presence[id] : [];
      if (metas.some(meta => meta.channel === state.channel)) inChannel += 1;
    });
    const total = userIds.length || (state.user ? 1 : 0);
    if ($('chatOnlineCount')) $('chatOnlineCount').textContent = String(total);
    if ($('communityMiniOnlineCount')) $('communityMiniOnlineCount').textContent = String(total);
    if ($('chatChannelOnline')) $('chatChannelOnline').textContent = `${inChannel || (state.user ? 1 : 0)} online in this channel`;
  }

  async function switchChannel(channel) {
    if (!CHANNELS[channel] || channel === state.channel) return;
    state.channel = channel;
    state.messages = [];
    state.oldest = null;
    state.hasOlder = true;
    cancelReply();
    state.typingUsers.clear();
    renderTypingIndicator();
    markChannelRead(channel);
    document.querySelectorAll('[data-chat-channel]').forEach(btn => btn.classList.toggle('active', btn.dataset.chatChannel === channel));
    if ($('chatChannelTitle')) $('chatChannelTitle').textContent = CHANNELS[channel];
    if ($('chatMessages')) $('chatMessages').innerHTML = '<div class="cv-chat-empty"><div><strong>Loading live chat…</strong><span>One moment.</span></div></div>';
    await trackPresence();
    updatePresenceCounts();
    await Promise.all([loadMessages(), loadPinned()]);
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
    await Promise.all([loadMessages(), loadPinned()]);
    await subscribeMessages();
    await subscribeNotifications();
    if (!state.presenceChannel) await subscribePresence(); else await trackPresence();
    if (state.isAdmin) await loadModeration();
    if (communityIsActive()) markChannelRead();
    updatePresenceCounts();
  }

  function bindEvents() {
    $('chatOpenProfileBtn')?.addEventListener('click', () => $('profileBtn')?.click());
    $('chatSaveNameBtn')?.addEventListener('click', () => saveProfile(false));
    $('chatSafetyBtn')?.addEventListener('click', () => $('chatSafetyDialog')?.showModal());
    $('chatRulesBtn')?.addEventListener('click', () => $('chatRulesDialog')?.showModal());
    $('chatAcceptRulesBtn')?.addEventListener('click', () => {
      try { localStorage.setItem(rulesKey(), 'accepted'); } catch (_) {}
      state.rulesAccepted = true;
      $('chatRulesDialog')?.close();
      showToast('Community rules accepted.');
    });
    $('chatComposer')?.addEventListener('submit', sendMessage);
    $('chatMessageInput')?.addEventListener('input', () => { updateCharCount(); emitTyping(); });
    $('chatCancelReplyBtn')?.addEventListener('click', cancelReply);
    $('chatLoadOlderBtn')?.addEventListener('click', () => loadMessages({ older: true }));
    document.querySelectorAll('[data-chat-channel]').forEach(btn => btn.addEventListener('click', () => switchChannel(btn.dataset.chatChannel)));
    $('communityRefreshBtn')?.addEventListener('click', () => setTimeout(refreshAll, 0));
    $('chatModerationRefreshBtn')?.addEventListener('click', loadModeration);
    $('openAdminConsoleBtn')?.addEventListener('click', () => setTimeout(loadModeration, 250));
    $('adminRefreshBtn')?.addEventListener('click', () => setTimeout(loadModeration, 150));

    // When the user returns from Profile after signing in/out, refresh the chat state.
    $('openCommunityBtn')?.addEventListener('click', () => { markChannelRead(); setTimeout(refreshAll, 250); });
    window.addEventListener('focus', () => {
      if (document.visibilityState === 'visible') { if (communityIsActive()) markChannelRead(); setTimeout(refreshAll, 250); }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') { if (communityIsActive()) markChannelRead(); setTimeout(refreshAll, 250); }
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
    await Promise.all([loadMessages(), loadPinned()]);
    await subscribeMessages();
    await subscribeNotifications();
    await subscribePresence();
    if (state.isAdmin) await loadModeration();
    renderUnreadBadges();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
