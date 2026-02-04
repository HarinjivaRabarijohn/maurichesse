CREATE TABLE IF NOT EXISTS \user_visit\ (
  \isit_id\ int(11) NOT NULL AUTO_INCREMENT,
  \user_id\ int(11) NOT NULL,
  \location_id\ int(11) DEFAULT NULL,
  \qr_id\ int(11) DEFAULT NULL,
  \created_at\ datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\isit_id\),
  UNIQUE KEY \unique_user_location\ (\user_id\, \location_id\),
  KEY \user_id\ (\user_id\),
  KEY \location_id\ (\location_id\)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
