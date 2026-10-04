# Permission Census

Status: Enforced baseline

The permission census defines actions before role assignment. Permission grants never replace domain authority, financial eligibility, compliance state, or resource ownership checks.

## Organization-scoped permissions

### Organization and identity
- organization.read
- organization.update
- membership.invite
- membership.update
- membership.revoke
- artist_identity.read
- artist_identity.create
- artist_identity.update
- artist_identity.associate
- artist_authority.claim

### Catalog and release
- catalog.read
- release.create
- release.update_draft
- release.submit
- release.resubmit
- release.request_update
- release.request_takedown
- asset.upload
- asset.replace
- metadata.update
- rights.declare
- rights.read
- content_id.read
- risk.summary.read

### Protection and authorization
- protection.request
- authorization.issue
- authorization.revoke
- transfer.initiate

### Finance
- analytics.read
- royalty.read
- split.create_version
- ledger.read
- wallet.read
- beneficiary.manage
- payout.request

### Marketing and integrations
- marketing.read
- marketing.manage
- creators.connect
- creators.disconnect
- creators.checkout.create
- creators.campaign.read

### Support
- support.ticket.read
- support.ticket.create

## System-scoped permissions

These permissions are assignable only through system roles and are not inherited from customer organization membership.

### Distribution operations and review
- artist_authority.review
- qc.review
- authority.review
- protection.transition_controller
- distribution.deliver
- distribution.retry
- distribution.update
- distribution.takedown
- transfer.review

### Finance and compliance operations
- statement.import
- reconciliation.review
- ledger.post_adjustment
- compliance.review
- payout.approve
- payout.execute

### Platform integrations, risk, support and operations
- partner_api.manage
- risk.read
- risk.review
- support.ticket.manage
- operations.work_item.manage
- operations.override.execute
- backoffice.work.read
- backoffice.work.manage
- recovery.exercise.read
- recovery.exercise.manage

### Automation
- automation.run
- automation.approve
- automation.run.read
- automation.run.manage
- automation.run.approve

## Default organization roles

- Organization Owner: all organization-scoped permissions.
- Organization Admin: organization-scoped permissions except organization ownership changes, membership revocation, beneficiary management, and payout requests.
- Organization Member: read access plus routine catalog drafting, asset intake, metadata, marketing, Creators campaign projection, and support ticket creation.

System roles are independent from organization roles. A user may be an organization owner without having any internal platform permission.

## Scope dimensions

Every permission evaluation may additionally require organization membership, resource ownership or relationship, current authority evidence, territory, destination, financial eligibility, risk/compliance state, and feature/configuration state. Permission does not replace domain authority.

## Enforcement baseline

Organization-scoped API actions resolve the active organization, validate membership, then validate an organization role grant. Internal APIs validate system-role grants. Critical domain services continue to enforce authority, state-machine, optimistic-concurrency, risk, and financial invariants after access control succeeds.
