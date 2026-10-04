BEGIN;

ALTER TABLE permissions
  ADD COLUMN permission_scope text NOT NULL DEFAULT 'ORGANIZATION'
  CHECK (permission_scope IN ('ORGANIZATION','SYSTEM'));

UPDATE permissions
SET permission_scope = 'SYSTEM'
WHERE permission_key LIKE 'backoffice.%'
   OR permission_key LIKE 'automation.run.%';

INSERT INTO permissions (permission_key, description, created_at, permission_scope)
VALUES
  ('organization.read', 'Read organization profile and configuration', NOW(), 'ORGANIZATION'),
  ('organization.update', 'Update organization profile and configuration', NOW(), 'ORGANIZATION'),
  ('membership.invite', 'Invite organization members', NOW(), 'ORGANIZATION'),
  ('membership.update', 'Update organization memberships', NOW(), 'ORGANIZATION'),
  ('membership.revoke', 'Revoke organization memberships', NOW(), 'ORGANIZATION'),
  ('artist_identity.read', 'Read artist identities associated with the organization', NOW(), 'ORGANIZATION'),
  ('artist_identity.create', 'Create artist identities for the organization', NOW(), 'ORGANIZATION'),
  ('artist_identity.update', 'Update associated artist identity data', NOW(), 'ORGANIZATION'),
  ('artist_identity.associate', 'Associate an artist identity with the organization', NOW(), 'ORGANIZATION'),
  ('artist_authority.claim', 'Submit an artist authority claim', NOW(), 'ORGANIZATION'),
  ('catalog.read', 'Read organization catalog and release data', NOW(), 'ORGANIZATION'),
  ('release.create', 'Create draft releases', NOW(), 'ORGANIZATION'),
  ('release.update_draft', 'Update draft releases', NOW(), 'ORGANIZATION'),
  ('release.submit', 'Submit releases to validation and QC', NOW(), 'ORGANIZATION'),
  ('release.resubmit', 'Resubmit corrected releases', NOW(), 'ORGANIZATION'),
  ('release.request_update', 'Request updates to distributed releases', NOW(), 'ORGANIZATION'),
  ('release.request_takedown', 'Request release takedowns', NOW(), 'ORGANIZATION'),
  ('asset.upload', 'Upload release and recording assets', NOW(), 'ORGANIZATION'),
  ('asset.replace', 'Replace release and recording assets', NOW(), 'ORGANIZATION'),
  ('metadata.update', 'Update release and recording metadata', NOW(), 'ORGANIZATION'),
  ('rights.declare', 'Declare rights held by the organization', NOW(), 'ORGANIZATION'),
  ('protection.request', 'Request artist protection changes when domain authority permits it', NOW(), 'ORGANIZATION'),
  ('authorization.issue', 'Issue artist authorization when domain authority permits it', NOW(), 'ORGANIZATION'),
  ('authorization.revoke', 'Revoke artist authorization when domain authority permits it', NOW(), 'ORGANIZATION'),
  ('transfer.initiate', 'Initiate catalog or release transfer requests', NOW(), 'ORGANIZATION'),
  ('analytics.read', 'Read organization analytics', NOW(), 'ORGANIZATION'),
  ('royalty.read', 'Read organization royalty data', NOW(), 'ORGANIZATION'),
  ('split.create_version', 'Create a new royalty split version', NOW(), 'ORGANIZATION'),
  ('ledger.read', 'Read organization ledger entries', NOW(), 'ORGANIZATION'),
  ('wallet.read', 'Read organization wallet projections', NOW(), 'ORGANIZATION'),
  ('beneficiary.manage', 'Manage payout beneficiaries', NOW(), 'ORGANIZATION'),
  ('payout.request', 'Request a payout from eligible organization funds', NOW(), 'ORGANIZATION'),
  ('marketing.manage', 'Manage native distribution marketing resources', NOW(), 'ORGANIZATION'),
  ('creators.connect', 'Connect the organization to Lander Creators', NOW(), 'ORGANIZATION'),
  ('creators.disconnect', 'Disconnect the organization from Lander Creators', NOW(), 'ORGANIZATION'),
  ('creators.checkout.create', 'Create a Lander Creators checkout order', NOW(), 'ORGANIZATION'),
  ('creators.campaign.read', 'Read synchronized Lander Creators campaign projections', NOW(), 'ORGANIZATION'),
  ('support.ticket.create', 'Create organization support tickets', NOW(), 'ORGANIZATION'),
  ('artist_authority.review', 'Review artist authority claims', NOW(), 'SYSTEM'),
  ('qc.review', 'Review release QC results', NOW(), 'SYSTEM'),
  ('authority.review', 'Review representation and authority evidence', NOW(), 'SYSTEM'),
  ('protection.transition_controller', 'Transition artist protection controller state', NOW(), 'SYSTEM'),
  ('distribution.deliver', 'Deliver releases through configured providers', NOW(), 'SYSTEM'),
  ('distribution.retry', 'Retry failed provider delivery operations', NOW(), 'SYSTEM'),
  ('distribution.update', 'Execute distributed release updates', NOW(), 'SYSTEM'),
  ('distribution.takedown', 'Execute provider takedowns', NOW(), 'SYSTEM'),
  ('transfer.review', 'Review transfer requests', NOW(), 'SYSTEM'),
  ('statement.import', 'Import provider statements', NOW(), 'SYSTEM'),
  ('reconciliation.review', 'Review financial reconciliation exceptions', NOW(), 'SYSTEM'),
  ('ledger.post_adjustment', 'Post controlled ledger adjustments', NOW(), 'SYSTEM'),
  ('compliance.review', 'Review KYC and compliance cases', NOW(), 'SYSTEM'),
  ('payout.approve', 'Approve payout requests', NOW(), 'SYSTEM'),
  ('payout.execute', 'Execute approved payouts', NOW(), 'SYSTEM'),
  ('partner_api.manage', 'Manage partner API clients and credentials', NOW(), 'SYSTEM'),
  ('risk.read', 'Read risk cases and signals', NOW(), 'SYSTEM'),
  ('risk.review', 'Review and resolve risk cases', NOW(), 'SYSTEM'),
  ('support.ticket.manage', 'Manage customer support tickets', NOW(), 'SYSTEM'),
  ('operations.work_item.manage', 'Manage internal operation work items', NOW(), 'SYSTEM'),
  ('operations.override.execute', 'Execute explicitly controlled operational overrides', NOW(), 'SYSTEM'),
  ('automation.run', 'Request internal automation runs', NOW(), 'SYSTEM'),
  ('automation.approve', 'Approve approval-gated internal automation runs', NOW(), 'SYSTEM')
ON CONFLICT (permission_key) DO UPDATE
SET description = EXCLUDED.description,
    permission_scope = EXCLUDED.permission_scope;

INSERT INTO roles (id, organization_id, name, role_type, created_at, updated_at)
SELECT md5(o.id::text || ':owner')::uuid, o.id, 'Organization Owner', 'ORGANIZATION', NOW(), NOW()
FROM organizations o
ON CONFLICT (organization_id, name) DO NOTHING;

INSERT INTO roles (id, organization_id, name, role_type, created_at, updated_at)
SELECT md5(o.id::text || ':admin')::uuid, o.id, 'Organization Admin', 'ORGANIZATION', NOW(), NOW()
FROM organizations o
ON CONFLICT (organization_id, name) DO NOTHING;

INSERT INTO roles (id, organization_id, name, role_type, created_at, updated_at)
SELECT md5(o.id::text || ':member')::uuid, o.id, 'Organization Member', 'ORGANIZATION', NOW(), NOW()
FROM organizations o
ON CONFLICT (organization_id, name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_key)
SELECT r.id, p.permission_key
FROM roles r
JOIN permissions p ON p.permission_scope = 'ORGANIZATION'
WHERE r.role_type = 'ORGANIZATION' AND r.name = 'Organization Owner'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_key)
SELECT r.id, p.permission_key
FROM roles r
JOIN permissions p ON p.permission_scope = 'ORGANIZATION'
WHERE r.role_type = 'ORGANIZATION'
  AND r.name = 'Organization Admin'
  AND p.permission_key NOT IN ('organization.update','membership.revoke','beneficiary.manage','payout.request')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_key)
SELECT r.id, p.permission_key
FROM roles r
JOIN permissions p ON p.permission_key IN (
  'organization.read','artist_identity.read','catalog.read','release.create','release.update_draft',
  'asset.upload','metadata.update','analytics.read','royalty.read','ledger.read','wallet.read',
  'marketing.manage','creators.campaign.read','support.ticket.create'
)
WHERE r.role_type = 'ORGANIZATION' AND r.name = 'Organization Member'
ON CONFLICT DO NOTHING;

INSERT INTO membership_roles (membership_id, role_id, assigned_at)
SELECT m.id, r.id, NOW()
FROM organization_memberships m
JOIN roles r
  ON r.organization_id = m.organization_id
 AND r.role_type = 'ORGANIZATION'
 AND r.name = CASE m.role
   WHEN 'OWNER' THEN 'Organization Owner'
   WHEN 'ADMIN' THEN 'Organization Admin'
   ELSE 'Organization Member'
 END
WHERE m.status = 'ACTIVE'
ON CONFLICT DO NOTHING;

CREATE INDEX permissions_scope_idx ON permissions(permission_scope, permission_key);
CREATE INDEX membership_roles_membership_idx ON membership_roles(membership_id, role_id);

COMMIT;
