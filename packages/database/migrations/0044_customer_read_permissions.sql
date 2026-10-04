BEGIN;

INSERT INTO permissions (permission_key, description, created_at, permission_scope)
VALUES
  ('rights.read', 'Read organization rights, representation, authority, protection and authorization projections', NOW(), 'ORGANIZATION'),
  ('content_id.read', 'Read organization Content ID and UGC projections', NOW(), 'ORGANIZATION'),
  ('marketing.read', 'Read native marketing resources and projections', NOW(), 'ORGANIZATION'),
  ('support.ticket.read', 'Read organization support tickets', NOW(), 'ORGANIZATION'),
  ('risk.summary.read', 'Read customer-safe anti-fraud summary for the organization', NOW(), 'ORGANIZATION')
ON CONFLICT (permission_key) DO UPDATE
SET description = EXCLUDED.description,
    permission_scope = EXCLUDED.permission_scope;

INSERT INTO role_permissions (role_id, permission_key)
SELECT r.id, p.permission_key
FROM roles r
JOIN permissions p ON p.permission_key IN ('rights.read','content_id.read','marketing.read','support.ticket.read','risk.summary.read')
WHERE r.role_type = 'ORGANIZATION'
  AND r.name IN ('Organization Owner','Organization Admin','Organization Member')
ON CONFLICT DO NOTHING;

COMMIT;
