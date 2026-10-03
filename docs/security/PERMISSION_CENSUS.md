# Permission Census

Status: Initial inventory

The census records actions before role design. It does not grant permissions by itself.

## Organization and identity
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
- artist_authority.review

## Catalog and release
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

## Distribution and protection
- qc.review
- authority.review
- protection.request
- protection.transition_controller
- authorization.issue
- authorization.revoke
- distribution.deliver
- distribution.retry
- distribution.update
- distribution.takedown
- transfer.initiate
- transfer.review

## Finance
- analytics.read
- statement.import
- royalty.read
- split.create_version
- reconciliation.review
- ledger.read
- ledger.post_adjustment
- wallet.read
- beneficiary.manage
- compliance.review
- payout.request
- payout.approve
- payout.execute

## Marketing and integrations
- marketing.manage
- creators.connect
- creators.disconnect
- creators.checkout.create
- creators.campaign.read
- partner_api.manage

## Risk, support and operations
- risk.read
- risk.review
- support.ticket.create
- support.ticket.manage
- operations.work_item.manage
- operations.override.execute
- automation.run
- automation.approve

## Scope dimensions
Every permission evaluation may additionally require organization membership, resource ownership or relationship, current authority evidence, territory, destination, financial eligibility, risk/compliance state, and feature/configuration state. Permission does not replace domain authority.
