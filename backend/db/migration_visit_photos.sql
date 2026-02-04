-- Migration: Add photo upload and points system tables

-- Create visit_photo table for storing user-uploaded location photos
CREATE TABLE IF NOT EXISTS `visit_photo` (
  `photo_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `verified_by_admin` int(11) DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`photo_id`),
  KEY `user_id` (`user_id`),
  KEY `location_id` (`location_id`),
  KEY `verified` (`verified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user_points table to track points awarded to users
CREATE TABLE IF NOT EXISTS `user_points` (
  `point_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `points` int(11) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`point_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for faster lookups
CREATE INDEX idx_user_points_user ON user_points(user_id);
CREATE INDEX idx_visit_photo_verified ON visit_photo(verified, user_id);
