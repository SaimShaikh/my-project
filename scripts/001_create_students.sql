-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS student_records CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Switch to the new database
USE student_records;

-- Create table if not exists
CREATE TABLE IF NOT EXISTS students (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  age INT NOT NULL,
  date_of_birth DATE NOT NULL,
  current_location VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_name (last_name, first_name),
  INDEX idx_location (current_location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
