CREATE DATABASE IF NOT EXISTS pasugo_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE pasugo_db;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  firebase_uid VARCHAR(128) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(32) NULL,
  full_name VARCHAR(160) NOT NULL,
  status ENUM('active', 'suspended', 'deleted') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_firebase_uid (firebase_uid),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone),
  KEY idx_users_status_created (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE pending_registrations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  registration_id_hash CHAR(64) NOT NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  status ENUM('initiated', 'otp_verified', 'completing', 'completed', 'expired', 'failed')
    NOT NULL DEFAULT 'initiated',
  attempt_count INT UNSIGNED NOT NULL DEFAULT 0,
  resend_count INT UNSIGNED NOT NULL DEFAULT 1,
  last_otp_sent_at TIMESTAMP NOT NULL,
  resend_window_started_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP NULL,
  completing_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  firebase_uid VARCHAR(128) NULL,
  user_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pending_registration_id_hash (registration_id_hash),
  UNIQUE KEY uq_pending_registration_email (email),
  KEY idx_pending_registrations_expiry (expires_at),
  KEY idx_pending_registrations_rate_limit (email, resend_window_started_at),
  CONSTRAINT chk_pending_registration_attempts CHECK (attempt_count <= 5),
  CONSTRAINT fk_pending_registrations_user FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE user_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('customer', 'rider', 'administrator') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role),
  KEY idx_user_roles_role (role, user_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE customers (
  user_id BIGINT UNSIGNED NOT NULL,
  profile_photo_url VARCHAR(512) NULL,
  default_address VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE riders (
  user_id BIGINT UNSIGNED NOT NULL,
  verification_status ENUM('pending', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'pending',
  availability_status ENUM('offline', 'online', 'busy') NOT NULL DEFAULT 'offline',
  rating_average DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  completed_bookings INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT chk_riders_rating_average CHECK (rating_average BETWEEN 0.00 AND 5.00),
  CONSTRAINT fk_riders_user FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE administrators (
  user_id BIGINT UNSIGNED NOT NULL,
  admin_level ENUM('standard', 'super') NOT NULL DEFAULT 'standard',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_administrators_user FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE service_categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500) NULL,
  base_fee DECIMAL(10,2) NOT NULL,
  per_kilometer_fee DECIMAL(10,2) NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_service_categories_name (name),
  KEY idx_service_categories_status (status),
  CONSTRAINT chk_service_categories_fees CHECK (base_fee >= 0 AND per_kilometer_fee >= 0)
) ENGINE=InnoDB;

CREATE TABLE rider_documents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  rider_id BIGINT UNSIGNED NOT NULL,
  document_type ENUM('government_id', 'drivers_license', 'vehicle_registration') NOT NULL,
  file_url VARCHAR(1024) NOT NULL,
  verification_status ENUM('pending', 'approved', 'rejected', 'expired') NOT NULL DEFAULT 'pending',
  rejection_reason VARCHAR(500) NULL,
  expires_at DATE NULL,
  reviewed_by BIGINT UNSIGNED NULL,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_rider_documents_rider_status (rider_id, verification_status),
  KEY idx_rider_documents_reviewer (reviewed_by),
  CONSTRAINT fk_rider_documents_rider FOREIGN KEY (rider_id) REFERENCES riders (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rider_documents_reviewer FOREIGN KEY (reviewed_by) REFERENCES administrators (user_id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE vehicles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  rider_id BIGINT UNSIGNED NOT NULL,
  vehicle_type ENUM('motorcycle', 'car', 'van', 'bicycle', 'other') NOT NULL,
  make VARCHAR(80) NULL,
  model VARCHAR(80) NULL,
  plate_number VARCHAR(32) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehicles_plate_number (plate_number),
  KEY idx_vehicles_rider_status (rider_id, status),
  CONSTRAINT fk_vehicles_rider FOREIGN KEY (rider_id) REFERENCES riders (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE rider_service_categories (
  rider_id BIGINT UNSIGNED NOT NULL,
  service_category_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (rider_id, service_category_id),
  CONSTRAINT fk_rider_categories_rider FOREIGN KEY (rider_id) REFERENCES riders (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rider_categories_category FOREIGN KEY (service_category_id) REFERENCES service_categories (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE rider_verification_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  rider_id BIGINT UNSIGNED NOT NULL,
  verification_status ENUM('pending', 'approved', 'rejected', 'suspended') NOT NULL,
  reason VARCHAR(500) NULL,
  reviewed_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_rider_verification_history_rider_created (rider_id, created_at),
  CONSTRAINT fk_rider_verification_history_rider FOREIGN KEY (rider_id) REFERENCES riders (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rider_verification_history_reviewer FOREIGN KEY (reviewed_by) REFERENCES administrators (user_id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE bookings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id BIGINT UNSIGNED NOT NULL,
  service_category_id BIGINT UNSIGNED NOT NULL,
  assigned_rider_id BIGINT UNSIGNED NULL,
  status ENUM('requested', 'matching', 'rider_selected', 'confirmed', 'en_route_pickup', 'arrived_pickup', 'in_progress', 'en_route_destination', 'completed_by_rider', 'awaiting_customer_confirmation', 'payment_pending', 'paid', 'rated', 'cancelled', 'expired', 'failed', 'disputed') NOT NULL DEFAULT 'requested',
  details TEXT NOT NULL,
  estimated_distance_km DECIMAL(10,2) NULL,
  estimated_duration_minutes INT UNSIGNED NULL,
  estimated_fee DECIMAL(10,2) NULL,
  final_fee DECIMAL(10,2) NULL,
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bookings_customer_status (customer_id, status, requested_at),
  KEY idx_bookings_rider_status (assigned_rider_id, status),
  KEY idx_bookings_status_requested (status, requested_at),
  KEY idx_bookings_category_status (service_category_id, status),
  CONSTRAINT chk_bookings_distance CHECK (estimated_distance_km IS NULL OR estimated_distance_km >= 0),
  CONSTRAINT chk_bookings_fees CHECK ((estimated_fee IS NULL OR estimated_fee >= 0) AND (final_fee IS NULL OR final_fee >= 0)),
  CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES customers (user_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_bookings_category FOREIGN KEY (service_category_id) REFERENCES service_categories (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_bookings_assigned_rider FOREIGN KEY (assigned_rider_id) REFERENCES riders (user_id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE booking_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  estimated_price DECIMAL(10,2) NULL,
  actual_price DECIMAL(10,2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_booking_items_booking (booking_id),
  CONSTRAINT chk_booking_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_booking_items_prices CHECK ((estimated_price IS NULL OR estimated_price >= 0) AND (actual_price IS NULL OR actual_price >= 0)),
  CONSTRAINT fk_booking_items_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE booking_locations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  location_type ENUM('pickup', 'destination') NOT NULL,
  address VARCHAR(500) NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  place_id VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_booking_locations_type (booking_id, location_type),
  KEY idx_booking_locations_coordinates (latitude, longitude),
  CONSTRAINT chk_booking_locations_latitude CHECK (latitude BETWEEN -90.00000000 AND 90.00000000),
  CONSTRAINT chk_booking_locations_longitude CHECK (longitude BETWEEN -180.00000000 AND 180.00000000),
  CONSTRAINT fk_booking_locations_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE booking_status_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  from_status VARCHAR(40) NULL,
  to_status VARCHAR(40) NOT NULL,
  changed_by BIGINT UNSIGNED NULL,
  reason VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_booking_status_history_booking_created (booking_id, created_at),
  KEY idx_booking_status_history_actor (changed_by),
  CONSTRAINT fk_booking_status_history_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_booking_status_history_actor FOREIGN KEY (changed_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE booking_pricing (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  service_category_id BIGINT UNSIGNED NOT NULL,
  pricing_basis ENUM('base_plus_distance', 'negotiated', 'manual_override') NOT NULL DEFAULT 'base_plus_distance',
  base_fee DECIMAL(10,2) NOT NULL,
  per_kilometer_fee DECIMAL(10,2) NOT NULL,
  distance_km DECIMAL(10,2) NOT NULL,
  computed_amount DECIMAL(10,2) NOT NULL,
  negotiated_amount DECIMAL(10,2) NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  adjustment_reason VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_booking_pricing_booking (booking_id),
  KEY idx_booking_pricing_booking_created (booking_id, created_at),
  CONSTRAINT chk_booking_pricing_values CHECK (base_fee >= 0 AND per_kilometer_fee >= 0 AND distance_km >= 0 AND computed_amount >= 0 AND (negotiated_amount IS NULL OR negotiated_amount >= 0) AND final_amount >= 0),
  CONSTRAINT fk_booking_pricing_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_booking_pricing_service_category FOREIGN KEY (service_category_id) REFERENCES service_categories (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE booking_fee_proposals (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  proposed_by_user_id BIGINT UNSIGNED NOT NULL,
  proposed_by_role ENUM('customer', 'rider') NOT NULL,
  proposed_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'countered', 'expired') NOT NULL DEFAULT 'pending',
  responded_by_user_id BIGINT UNSIGNED NULL,
  response_note VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY idx_booking_fee_proposals_booking_status (booking_id, status, created_at),
  KEY idx_booking_fee_proposals_proposer (proposed_by_user_id, status),
  CONSTRAINT chk_booking_fee_proposals_amount CHECK (proposed_amount >= 0),
  CONSTRAINT fk_booking_fee_proposals_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_booking_fee_proposals_proposer FOREIGN KEY (proposed_by_user_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_booking_fee_proposals_responder FOREIGN KEY (responded_by_user_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE rider_offers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  rider_id BIGINT UNSIGNED NOT NULL,
  match_score DECIMAL(7,4) NOT NULL,
  distance_to_pickup_km DECIMAL(10,2) NULL,
  status ENUM('offered', 'accepted', 'declined', 'expired', 'withdrawn') NOT NULL DEFAULT 'offered',
  offered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  responded_at TIMESTAMP NULL,
  UNIQUE KEY uq_rider_offers_booking_rider (booking_id, rider_id),
  PRIMARY KEY (id),
  KEY idx_rider_offers_rider_status (rider_id, status, offered_at),
  KEY idx_rider_offers_booking_status (booking_id, status),
  CONSTRAINT chk_rider_offers_score CHECK (match_score >= 0),
  CONSTRAINT chk_rider_offers_distance CHECK (distance_to_pickup_km IS NULL OR distance_to_pickup_km >= 0),
  CONSTRAINT fk_rider_offers_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rider_offers_rider FOREIGN KEY (rider_id) REFERENCES riders (user_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE rider_current_locations (
  rider_id BIGINT UNSIGNED NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  accuracy_meters DECIMAL(8,2) NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (rider_id),
  KEY idx_rider_current_locations_coordinates (latitude, longitude),
  CONSTRAINT chk_rider_current_locations_latitude CHECK (latitude BETWEEN -90.00000000 AND 90.00000000),
  CONSTRAINT chk_rider_current_locations_longitude CHECK (longitude BETWEEN -180.00000000 AND 180.00000000),
  CONSTRAINT chk_rider_current_locations_accuracy CHECK (accuracy_meters IS NULL OR accuracy_meters >= 0),
  CONSTRAINT fk_rider_current_locations_rider FOREIGN KEY (rider_id) REFERENCES riders (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE rider_location_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  rider_id BIGINT UNSIGNED NOT NULL,
  booking_id BIGINT UNSIGNED NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  accuracy_meters DECIMAL(8,2) NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_rider_location_history_rider_recorded (rider_id, recorded_at),
  KEY idx_rider_location_history_booking_recorded (booking_id, recorded_at),
  CONSTRAINT chk_rider_location_history_latitude CHECK (latitude BETWEEN -90.00000000 AND 90.00000000),
  CONSTRAINT chk_rider_location_history_longitude CHECK (longitude BETWEEN -180.00000000 AND 180.00000000),
  CONSTRAINT chk_rider_location_history_accuracy CHECK (accuracy_meters IS NULL OR accuracy_meters >= 0),
  CONSTRAINT fk_rider_location_history_rider FOREIGN KEY (rider_id) REFERENCES riders (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rider_location_history_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE conversations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_conversations_booking (booking_id),
  CONSTRAINT fk_conversations_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE conversation_participants (
  conversation_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (conversation_id, user_id),
  KEY idx_conversation_participants_user (user_id),
  CONSTRAINT fk_conversation_participants_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_conversation_participants_user FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  message_text TEXT NOT NULL,
  attachment_url VARCHAR(1024) NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_messages_conversation_created (conversation_id, created_at),
  KEY idx_messages_sender_created (sender_id, created_at),
  CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash', 'online') NOT NULL,
  status ENUM('pending', 'authorized', 'paid', 'failed', 'refunded', 'cancelled') NOT NULL DEFAULT 'pending',
  provider_reference VARCHAR(255) NULL,
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payments_booking (booking_id),
  UNIQUE KEY uq_payments_provider_reference (provider_reference),
  KEY idx_payments_customer_status (customer_id, status, created_at),
  KEY idx_payments_status_created (status, created_at),
  CONSTRAINT chk_payments_amount CHECK (amount >= 0),
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_payments_customer FOREIGN KEY (customer_id) REFERENCES customers (user_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE payment_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  payment_id BIGINT UNSIGNED NOT NULL,
  provider_event_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSON NULL,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payment_events_provider_event (provider_event_id),
  KEY idx_payment_events_payment_created (payment_id, created_at),
  CONSTRAINT fk_payment_events_payment FOREIGN KEY (payment_id) REFERENCES payments (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE receipts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  rider_id BIGINT UNSIGNED NOT NULL,
  file_url VARCHAR(1024) NOT NULL,
  amount DECIMAL(10,2) NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_receipts_booking_uploaded (booking_id, uploaded_at),
  KEY idx_receipts_rider_uploaded (rider_id, uploaded_at),
  CONSTRAINT chk_receipts_amount CHECK (amount IS NULL OR amount >= 0),
  CONSTRAINT fk_receipts_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_receipts_rider FOREIGN KEY (rider_id) REFERENCES riders (user_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ratings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  rider_id BIGINT UNSIGNED NOT NULL,
  score TINYINT UNSIGNED NOT NULL,
  feedback TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ratings_booking (booking_id),
  KEY idx_ratings_rider_created (rider_id, created_at),
  KEY idx_ratings_customer_created (customer_id, created_at),
  CONSTRAINT chk_ratings_score CHECK (score BETWEEN 1 AND 5),
  CONSTRAINT fk_ratings_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_ratings_customer FOREIGN KEY (customer_id) REFERENCES customers (user_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_ratings_rider FOREIGN KEY (rider_id) REFERENCES riders (user_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  booking_id BIGINT UNSIGNED NULL,
  notification_type VARCHAR(80) NOT NULL,
  title VARCHAR(160) NOT NULL,
  body VARCHAR(500) NOT NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user_read_created (user_id, read_at, created_at),
  KEY idx_notifications_booking (booking_id),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_notifications_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE device_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  fcm_token VARCHAR(512) NOT NULL,
  platform ENUM('android', 'ios', 'web') NOT NULL,
  last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_device_tokens_token (fcm_token),
  KEY idx_device_tokens_user (user_id),
  CONSTRAINT fk_device_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE notification_deliveries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  notification_id BIGINT UNSIGNED NOT NULL,
  device_token_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP NULL,
  error_message VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_notification_deliveries_target (notification_id, device_token_id),
  KEY idx_notification_deliveries_status (status, created_at),
  CONSTRAINT fk_notification_deliveries_notification FOREIGN KEY (notification_id) REFERENCES notifications (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_notification_deliveries_device_token FOREIGN KEY (device_token_id) REFERENCES device_tokens (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  actor_id BIGINT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_logs_actor_created (actor_id, created_at),
  KEY idx_audit_logs_entity_created (entity_type, entity_id, created_at),
  CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
