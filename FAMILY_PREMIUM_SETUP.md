# CoastCast Family Premium — Production Plan

CoastCast 4.0 contains the **Family Crew UI preview**. It is not a real invitation system yet.

## Production rules
- A normal subscriber pays **$4.99/month** for CoastCast Premium.
- Invited family members receive a **Family Premium entitlement** and do not purchase another subscription.
- Family access is resolved on the server. The public app never decides Premium by changing local storage.
- If the owner loses eligible Premium access, the backend should recalculate linked Family Premium entitlements.
- Complimentary and lifetime grants are independent entitlement sources and can continue even if a family relationship changes.

## Privacy defaults
- Shared trip plans: optional.
- Shared named favorite waters: optional.
- Exact private waypoints: **off by default and never automatically shared**.
- Private catches: **never automatically shared**.

Use `ENTITLEMENT_SETUP.sql` as the entitlement foundation. Trusted backend/service-role code should own all writes to entitlement records.
