CREATE DATABASE IF NOT EXISTS form_generator;

USE form_generator;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS form_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  json_schema JSON NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_form_templates_created_by
    FOREIGN KEY (created_by) REFERENCES admins(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  submitted_by VARCHAR(255) NULL,
  submission_data JSON NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_form_submissions_form_id
    FOREIGN KEY (form_id) REFERENCES form_templates(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);