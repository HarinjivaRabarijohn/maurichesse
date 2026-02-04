-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Feb 01, 2026 at 06:05 PM
-- Server version: 11.4.9-MariaDB
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mauheritage`
--

CREATE DATABASE IF NOT EXISTS `mauheritage`;
USE `mauheritage`;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
CREATE TABLE IF NOT EXISTS `admin` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `username`, `email`, `password_hash`, `created_at`) VALUES
(3, 'admin2', 'admin@mauheritage.mu', '$2y$10$s8AX.4R.IvJGDnivNdK9/eMkKwyOIYFmVgQdI6Ia2Sd6qGZ6EulBK', '2026-01-19 22:02:27');

-- --------------------------------------------------------

--
-- Table structure for table `badge`
--

DROP TABLE IF EXISTS `badge`;
CREATE TABLE IF NOT EXISTS `badge` (
  `badge_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `criteria_type` varchar(50) DEFAULT NULL COMMENT 'e.g. first_finder, scan_5, complete_trail',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`badge_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `badge`
--

INSERT INTO `badge` (`badge_id`, `name`, `description`, `image_path`, `criteria_type`, `created_at`) VALUES
(1, 'First Finder', 'First to claim a hidden item at a heritage site', NULL, 'first_finder', '2026-01-30 15:41:59'),
(2, 'Explorer', 'Scanned 5 QR codes at heritage sites', NULL, 'scan_5', '2026-01-30 15:41:59'),
(3, 'Trail Blazer', 'Completed a heritage trail', NULL, 'complete_trail', '2026-01-30 15:41:59');

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
CREATE TABLE IF NOT EXISTS `category` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(50) NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`category_id`, `category_name`) VALUES
(2, 'Heritage'),
(9, 'Historical Site'),
(10, 'Museum'),
(11, 'Nature'),
(13, 'Historical'),
(14, 'UNESCO Site'),
(15, 'Cultural');

-- --------------------------------------------------------

--
-- Table structure for table `fun_fact`
--

DROP TABLE IF EXISTS `fun_fact`;
CREATE TABLE IF NOT EXISTS `fun_fact` (
  `fun_fact_id` int(11) NOT NULL AUTO_INCREMENT,
  `qr_id` int(11) DEFAULT NULL,
  `fact_text` text DEFAULT NULL,
  `hint_text` text DEFAULT NULL,
  PRIMARY KEY (`fun_fact_id`),
  KEY `qr_id` (`qr_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fun_fact`
--

INSERT INTO `fun_fact` (`fun_fact_id`, `qr_id`, `fact_text`, `hint_text`) VALUES
(1, 4, 'I am the gateway where thousands stepped onto the island to work the sugar fields. My name sounds like \"first arrival\". Who am I?', 'Look for the building by the harbour in Port Louis.'),
(2, 5, 'I am a mountain that became a symbol of freedom. Runaway slaves once hid on my slopes. My name includes \"the sad\". Who am I?', 'I stand in the south-west, near the sea.'),
(3, 6, 'I am a grand house built in the age of sugar. Today you can taste rum where I stand. My name includes \"labour\". Who am I?', 'Find me in the north, in Mapou.'),
(4, 4, 'I am the gateway where thousands stepped onto the island to work the sugar fields. My name sounds like \"first arrival\". Who am I?', 'Look for the building by the harbour in Port Louis.'),
(5, 5, 'I am a mountain that became a symbol of freedom. Runaway slaves once hid on my slopes. My name includes \"the sad\". Who am I?', 'I stand in the south-west, near the sea.'),
(6, 6, 'I am a grand house built in the age of sugar. Today you can taste rum where I stand. My name includes \"labour\". Who am I?', 'Find me in the north, in Mapou.');

-- --------------------------------------------------------

--
-- Table structure for table `gallery`
--

DROP TABLE IF EXISTS `gallery`;
CREATE TABLE IF NOT EXISTS `gallery` (
  `gallery_id` int(11) NOT NULL AUTO_INCREMENT,
  `location_id` int(11) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `caption` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`gallery_id`),
  KEY `location_id` (`location_id`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gallery`
--

INSERT INTO `gallery` (`gallery_id`, `location_id`, `image_path`, `caption`) VALUES
(5, 14, 'uploads/gallery/gal_1769802995_31d2163ff3a3.jpg', 'A step into another world: colorful temples, misty mountains, and calm waters 🌺'),
(6, 13, 'uploads/gallery/gal_1769803042_147bd074ea95.jpg', 'Stepping back into the 19th century at the stunning Eureka House.'),
(7, 12, 'uploads/gallery/gal_1769803096_1ea7ce09942d.jpg', 'Lost in the lush green heart of Mauritius 🇲🇺🌿'),
(8, 11, 'uploads/gallery/gal_1769803165_126c9ba6f891.jpg', 'The colourful heart of Mauritius: Port Louis Central Market.'),
(9, 10, 'uploads/gallery/gal_1769803232_56faaa10c77b.jpg', 'Unveiling the rich history of Mauritian sugar plantations. 📜✨'),
(10, 9, 'uploads/gallery/gal_1769803277_473d8ba6d271.jpg', 'Feeling on top of the world at Le Morne! 🌍'),
(11, 4, 'uploads/gallery/gal_1769803316_ac82f32b3d35.jpg', 'Walking in the footsteps of history. 👣');

-- --------------------------------------------------------

--
-- Table structure for table `hidden_item`
--

DROP TABLE IF EXISTS `hidden_item`;
CREATE TABLE IF NOT EXISTS `hidden_item` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `location_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `found_by_user_id` int(11) DEFAULT NULL,
  `found_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`item_id`),
  KEY `ix_location_id` (`location_id`),
  KEY `ix_found_by_user` (`found_by_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hidden_item`
--

INSERT INTO `hidden_item` (`item_id`, `location_id`, `name`, `description`, `latitude`, `longitude`, `found_by_user_id`, `found_at`, `created_at`) VALUES
(1, 4, 'Immigration Ledger', 'A replica of the old ledger book. Find it near the depot.', -20.16020000, 57.50200000, NULL, NULL, '2026-01-30 16:23:19'),
(2, 9, 'Freedom Stone', 'A small stone marking the maroons\' refuge. Near the mountain path.', -20.45280000, 57.32350000, NULL, NULL, '2026-01-30 16:23:19'),
(3, 10, 'Estate Key', 'An old key from the sugar era. Hidden in the garden.', -20.06520000, 57.58820000, NULL, NULL, '2026-01-30 16:23:19'),
(4, 4, 'Immigration Ledger', 'A replica of the old ledger book. Find it near the depot.', -20.16020000, 57.50200000, NULL, NULL, '2026-01-30 17:45:09'),
(5, 9, 'Freedom Stone', 'A small stone marking the maroons\' refuge. Near the mountain path.', -20.45280000, 57.32350000, NULL, NULL, '2026-01-30 17:45:09'),
(6, 10, 'Estate Key', 'An old key from the sugar era. Hidden in the garden.', -20.06520000, 57.58820000, NULL, NULL, '2026-01-30 17:45:09');

-- --------------------------------------------------------

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
CREATE TABLE IF NOT EXISTS `location` (
  `location_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `history` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`location_id`),
  KEY `category_id` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `location`
--

INSERT INTO `location` (`location_id`, `name`, `description`, `history`, `image`, `latitude`, `longitude`, `address`, `category_id`, `created_at`) VALUES
(4, 'Aapravasi Ghat', 'UNESCO World Heritage Site', NULL, 'uploads/locations/loc_1769797295_ff04539b9317.jpg', -20.16090000, 57.50120000, NULL, 2, '2026-01-20 07:05:09'),
(9, 'Le Morne Brabant', 'Mountain and UNESCO site symbolising the slaves\' struggle for freedom.', NULL, 'uploads/locations/loc_1769797399_1c67d2c18061.jpg', -20.45250000, 57.32330000, NULL, 14, '2026-01-30 16:23:18'),
(10, 'Château de Labourdonnais', 'Restored colonial mansion and estate in the north.', NULL, 'uploads/locations/loc_1769797422_cf56acaa8664.jpg', -20.06500000, 57.58800000, NULL, 13, '2026-01-30 16:23:18'),
(11, 'Port Louis Central Market', 'Vibrant market in the capital with local produce and crafts.', NULL, 'uploads/locations/loc_1769797437_67e413d7b91b.jpg', -20.16100000, 57.50100000, NULL, 15, '2026-01-30 17:45:07'),
(12, 'Black River Gorges National Park', 'Largest national park with endemic wildlife and hiking trails.', NULL, 'uploads/locations/loc_1769797450_a9e648c4938c.jpg', -20.40500000, 57.42800000, NULL, 11, '2026-01-30 17:45:07'),
(13, 'Eureka House', 'Creole house museum in Moka showing 19th-century island life.', NULL, 'uploads/locations/loc_1769797463_6155f8088ab4.jpg', -20.22800000, 57.55200000, NULL, 13, '2026-01-30 17:45:07'),
(14, 'Grand Bassin (Ganga Talao)', 'Sacred crater lake and Hindu pilgrimage site.', NULL, 'uploads/locations/loc_1769797474_9608c2d6b6bd.jpg', -20.41700000, 57.49200000, NULL, 15, '2026-01-30 17:45:08');

-- --------------------------------------------------------

--
-- Table structure for table `push_subscription`
--

DROP TABLE IF EXISTS `push_subscription`;
CREATE TABLE IF NOT EXISTS `push_subscription` (
  `sub_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `endpoint` varchar(500) NOT NULL,
  `p256dh` varchar(255) NOT NULL,
  `auth` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`sub_id`),
  UNIQUE KEY `uq_endpoint` (`endpoint`(255)),
  KEY `ix_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `qr`
--

DROP TABLE IF EXISTS `qr`;
CREATE TABLE IF NOT EXISTS `qr` (
  `qr_id` int(11) NOT NULL AUTO_INCREMENT,
  `qr_code` varchar(255) NOT NULL,
  `location_id` int(11) NOT NULL,
  PRIMARY KEY (`qr_id`),
  UNIQUE KEY `qr_code` (`qr_code`),
  UNIQUE KEY `qr_code_2` (`qr_code`),
  KEY `location_id` (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `qr`
--

INSERT INTO `qr` (`qr_id`, `qr_code`, `location_id`) VALUES
(4, 'MAU-APG-001', 4),
(5, 'MAU-LM-002', 9),
(6, 'MAU-CDL-003', 10),
(10, 'MAU-PLM-004', 11),
(11, 'MAU-BRG-005', 12),
(12, 'MAU-EUR-006', 13),
(13, 'MAU-GBT-007', 14),
(14, 'MAU-2D60C6-14', 14);

-- --------------------------------------------------------

--
-- Table structure for table `trails`
--

DROP TABLE IF EXISTS `trails`;
CREATE TABLE IF NOT EXISTS `trails` (
  `trail_id` int(11) NOT NULL AUTO_INCREMENT,
  `trail_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `start_lat` decimal(10,8) NOT NULL,
  `start_lng` decimal(11,8) NOT NULL,
  `end_lat` decimal(10,8) NOT NULL,
  `end_lng` decimal(11,8) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`trail_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trails`
--

INSERT INTO `trails` (`trail_id`, `trail_name`, `description`, `start_lat`, `start_lng`, `end_lat`, `end_lng`, `created_at`) VALUES
(1, 'Port Louis Heritage Walk', 'From Aapravasi Ghat to the waterfront.', -20.16000000, 57.50190000, -20.16190000, 57.49890000, '2026-01-30 16:23:19'),
(2, 'Le Morne Coastal Trail', 'From Le Morne village to the mountain base.', -20.45250000, 57.32330000, -20.45500000, 57.31800000, '2026-01-30 16:23:19'),
(3, 'Port Louis Heritage Walk', 'From Aapravasi Ghat to the waterfront.', -20.16000000, 57.50190000, -20.16190000, 57.49890000, '2026-01-30 17:45:09'),
(4, 'Le Morne Coastal Trail', 'From Le Morne village to the mountain base.', -20.45250000, 57.32330000, -20.45500000, 57.31800000, '2026-01-30 17:45:09');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `username`, `email`, `password_hash`, `created_at`) VALUES
(1, 'tester1', 'tester@gmail.com', '$2y$10$/OYqgyXyG45HrEcRvmlQZu5Xe8vTfMxTuGKRHFPYpyJeGWdZhABD.', '2026-01-29 03:43:58'),
(2, 'Kanto', 'kanto@gmail.com', '$2y$10$rrbU57DBnVGkEVnTrdKjkuT60uHiRyoGgxYnMtf29Jg5vDO4qM1Ui', '2026-01-30 19:18:37');

-- --------------------------------------------------------

--
-- Table structure for table `user_badge`
--

DROP TABLE IF EXISTS `user_badge`;
CREATE TABLE IF NOT EXISTS `user_badge` (
  `user_badge_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `badge_id` int(11) NOT NULL,
  `earned_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_badge_id`),
  UNIQUE KEY `uq_user_badge` (`user_id`,`badge_id`),
  KEY `ix_user_id` (`user_id`),
  KEY `ix_badge_id` (`badge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `location`
--
ALTER TABLE `location`
  ADD CONSTRAINT `location_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `qr`
--
ALTER TABLE `qr`
  ADD CONSTRAINT `qr_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
