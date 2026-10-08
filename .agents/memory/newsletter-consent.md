---
name: Newsletter consent
description: Keep newsletter consent authoritative and preserve the user's distinct contact-message deletion rule.
---

Keep CitiZarm's own subscriber list authoritative for newsletter consent. Do not introduce an independent external mailing list without an explicit unsubscribe synchronization design.

**Why:** The requested footer and mailbox unsubscribe mechanisms must stop future mail from the existing CitiZarm subscriptions, not just remove a recipient from a disconnected provider list.

**How to apply:** Future sending tools must recheck current consent, not send blindly from stale exports. If adopting Resend Broadcasts or another mailing platform, define both directions of consent synchronization before using it for campaigns.

Lors des prises de contact, la désinscription doit supprimer simplement l'enregistrement dans la table `contact_messages`.

**Why:** The user explicitly requested deletion of the contact record, not the newsletter's inactive-subscriber behavior.

**How to apply:** Keep contact deletion separate from newsletter consent and target the corresponding message, not every message sharing its email address.
