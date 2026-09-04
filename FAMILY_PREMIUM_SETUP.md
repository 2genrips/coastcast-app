# CastVector Family Premium — v5.3

Family Premium is now backed by real database functions when `CASTVECTOR_LAUNCH_BACKEND.sql` is installed.

- A direct Premium owner can invite a family email.
- If that email already has a CastVector account, the membership can activate immediately.
- If not, the invitation remains pending. After the invitee creates/signs into CastVector, **Accept pending family invite** links the account.
- Effective access is resolved server-side by `coastcast_my_access()`.
- Family members do not need their own paid subscription.
- A Family Premium member cannot create a nested family group.
- Private catches and exact private waypoints remain excluded from automatic family sharing.

Before public launch, choose and enforce the maximum number of family seats and add email delivery for invitations. v5.3 deliberately does not invent an invitation email service.
