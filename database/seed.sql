USE pasugo_db;

-- Development-only seed data. These are synthetic records and contain no credentials.

INSERT INTO service_categories (name, description, base_fee, per_kilometer_fee)
VALUES
  ('Delivery', 'Development service category for package and item delivery.', 50.00, 12.00),
  ('Shopping Errand', 'Development service category for customer shopping requests.', 75.00, 15.00),
  ('Document Errand', 'Development service category for document pickup and delivery.', 60.00, 10.00)
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  base_fee = VALUES(base_fee),
  per_kilometer_fee = VALUES(per_kilometer_fee),
  status = 'active';

INSERT INTO users (firebase_uid, email, full_name)
VALUES ('development-admin-firebase-uid', 'admin.development@pasugo.local', 'Development Administrator')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), status = 'active';

INSERT INTO user_roles (user_id, role)
SELECT id, 'administrator'
FROM users
WHERE firebase_uid = 'development-admin-firebase-uid'
ON DUPLICATE KEY UPDATE role = VALUES(role);

INSERT INTO administrators (user_id, admin_level)
SELECT id, 'super'
FROM users
WHERE firebase_uid = 'development-admin-firebase-uid'
ON DUPLICATE KEY UPDATE admin_level = VALUES(admin_level);
