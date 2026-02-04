-- PostgreSQL Schema for MauHeritage
-- Converted from MySQL/MariaDB

-- Create admin table
CREATE TABLE IF NOT EXISTS admin (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin (username, email, password_hash) VALUES
('admin2', 'admin@mauheritage.mu', '$2y$10$s8AX.4R.IvJGDnivNdK9/eMkKwyOIYFmVgQdI6Ia2Sd6qGZ6EulBK');

-- Create badge table
CREATE TABLE IF NOT EXISTS badge (
    badge_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_path VARCHAR(255),
    criteria_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO badge (name, description, criteria_type) VALUES
('First Finder', 'First to claim a hidden item at a heritage site', 'first_finder'),
('Explorer', 'Scanned 5 QR codes at heritage sites', 'scan_5'),
('Trail Blazer', 'Completed a heritage trail', 'complete_trail');

-- Create category table
CREATE TABLE IF NOT EXISTS category (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL
);

INSERT INTO category (category_name) VALUES
('Heritage'),
('Historical Site');

-- Create fun_fact table
CREATE TABLE IF NOT EXISTS fun_fact (
    fact_id SERIAL PRIMARY KEY,
    fact_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
    gallery_id SERIAL PRIMARY KEY,
    location_id INTEGER,
    image_path VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create hidden_item table
CREATE TABLE IF NOT EXISTS hidden_item (
    hidden_id SERIAL PRIMARY KEY,
    location_id INTEGER,
    item_description TEXT,
    clue TEXT,
    qr_code VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create location table
CREATE TABLE IF NOT EXISTS location (
    location_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INTEGER,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT,
    image_path VARCHAR(255),
    qr_code VARCHAR(255),
    qr_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trail table
CREATE TABLE IF NOT EXISTS trail (
    trail_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    distance_km DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trail_location table
CREATE TABLE IF NOT EXISTS trail_location (
    trail_location_id SERIAL PRIMARY KEY,
    trail_id INTEGER,
    location_id INTEGER,
    sequence_order INTEGER
);

-- Create user table
CREATE TABLE IF NOT EXISTS \"user\" (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_badge table
CREATE TABLE IF NOT EXISTS user_badge (
    user_badge_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    badge_id INTEGER,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_points table
CREATE TABLE IF NOT EXISTS user_points (
    points_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    location_id INTEGER,
    points_earned INTEGER DEFAULT 10,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_visit table
CREATE TABLE IF NOT EXISTS user_visit (
    visit_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, location_id)
);

-- Create visit_photo table
CREATE TABLE IF NOT EXISTS visit_photo (
    photo_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    photo_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending'
);

-- Add foreign key constraints
ALTER TABLE gallery ADD CONSTRAINT fk_gallery_location 
    FOREIGN KEY (location_id) REFERENCES location(location_id) ON DELETE CASCADE;
    
ALTER TABLE hidden_item ADD CONSTRAINT fk_hidden_location 
    FOREIGN KEY (location_id) REFERENCES location(location_id) ON DELETE CASCADE;
    
ALTER TABLE location ADD CONSTRAINT fk_location_category 
    FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE SET NULL;
    
ALTER TABLE trail_location ADD CONSTRAINT fk_trail_location_trail 
    FOREIGN KEY (trail_id) REFERENCES trail(trail_id) ON DELETE CASCADE;
    
ALTER TABLE trail_location ADD CONSTRAINT fk_trail_location_location 
    FOREIGN KEY (location_id) REFERENCES location(location_id) ON DELETE CASCADE;
    
ALTER TABLE user_badge ADD CONSTRAINT fk_user_badge_user 
    FOREIGN KEY (user_id) REFERENCES \"user\"(user_id) ON DELETE CASCADE;
    
ALTER TABLE user_badge ADD CONSTRAINT fk_user_badge_badge 
    FOREIGN KEY (badge_id) REFERENCES badge(badge_id) ON DELETE CASCADE;
    
ALTER TABLE user_points ADD CONSTRAINT fk_user_points_user 
    FOREIGN KEY (user_id) REFERENCES \"user\"(user_id) ON DELETE CASCADE;
    
ALTER TABLE user_points ADD CONSTRAINT fk_user_points_location 
    FOREIGN KEY (location_id) REFERENCES location(location_id) ON DELETE CASCADE;
    
ALTER TABLE user_visit ADD CONSTRAINT fk_user_visit_user 
    FOREIGN KEY (user_id) REFERENCES \"user\"(user_id) ON DELETE CASCADE;
    
ALTER TABLE user_visit ADD CONSTRAINT fk_user_visit_location 
    FOREIGN KEY (location_id) REFERENCES location(location_id) ON DELETE CASCADE;
    
ALTER TABLE visit_photo ADD CONSTRAINT fk_visit_photo_user 
    FOREIGN KEY (user_id) REFERENCES \"user\"(user_id) ON DELETE CASCADE;
    
ALTER TABLE visit_photo ADD CONSTRAINT fk_visit_photo_location 
    FOREIGN KEY (location_id) REFERENCES location(location_id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_location_category ON location(category_id);
CREATE INDEX idx_user_points_user ON user_points(user_id);
CREATE INDEX idx_user_visit_user ON user_visit(user_id);
CREATE INDEX idx_visit_photo_user ON visit_photo(user_id);
