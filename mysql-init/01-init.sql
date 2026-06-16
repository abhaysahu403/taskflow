-- TaskFlow Database Initialization
-- Run automatically by MySQL Docker container on first start

CREATE DATABASE IF NOT EXISTS taskflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE taskflow_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(10) DEFAULT '👤',
  role ENUM('admin','user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  category VARCHAR(100) DEFAULT 'General',
  stock INT DEFAULT 0,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('todo','in_progress','done') DEFAULT 'todo',
  priority ENUM('low','medium','high') DEFAULT 'medium',
  due_date DATE,
  assigned_to VARCHAR(36),
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- SEED DATA
-- =============================================

-- Seed admin user (password: admin1234)
INSERT IGNORE INTO users (id, name, email, password, avatar, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@taskflow.dev',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oO8T5lXdS', '🦁', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Demo User', 'demo@taskflow.dev',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oO8T5lXdS', '🦊', 'user'),
  ('00000000-0000-0000-0000-000000000003', 'Jane Smith', 'jane@taskflow.dev',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oO8T5lXdS', '🐺', 'user');

-- NOTE: All seed users have password: demo1234

-- Seed products
INSERT IGNORE INTO products (id, name, description, price, category, stock, created_by) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Mechanical Keyboard', 'RGB backlit 87-key TKL mechanical keyboard with Cherry MX switches', 4999.00, 'Electronics', 25, '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'Wireless Mouse', 'Ergonomic wireless mouse with 3-year battery life and 1600 DPI', 1299.00, 'Electronics', 50, '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000003', 'Monitor Stand', 'Adjustable aluminum monitor stand with USB hub and cable management', 2499.00, 'Tools', 12, '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000004', 'Developer T-Shirt', 'Premium cotton developer t-shirt with minimalist design', 799.00, 'Clothing', 100, '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000005', 'Clean Code Book', 'A Handbook of Agile Software Craftsmanship by Robert C. Martin', 899.00, 'Books', 8, '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000006', 'USB-C Hub 7-in-1', '7-port USB-C hub with HDMI, SD card, and PD charging', 3499.00, 'Electronics', 0, '00000000-0000-0000-0000-000000000001');

-- Seed tasks
INSERT IGNORE INTO tasks (id, title, description, status, priority, due_date, assigned_to, created_by) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Set up Kubernetes cluster on KIND', 'Install KIND, configure cluster with multiple nodes, test basic pod scheduling', 'todo', 'high', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', 'Write Kubernetes Deployments', 'Create Deployment manifests for frontend, backend, and MySQL services', 'in_progress', 'high', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', 'Configure ConfigMaps and Secrets', 'Move all env variables to ConfigMaps, store passwords in Kubernetes Secrets', 'todo', 'medium', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000004', 'Set up Persistent Volume for MySQL', 'Create PV, PVC, and StorageClass for MySQL data persistence', 'todo', 'high', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000005', 'Configure Ingress Controller', 'Install nginx-ingress, configure routes for frontend and backend', 'todo', 'medium', DATE_ADD(CURDATE(), INTERVAL 10 DAY), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000006', 'Build Docker images for all services', 'Build and push frontend, backend Docker images to Docker Hub', 'done', 'medium', DATE_ADD(CURDATE(), INTERVAL -1 DAY), '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000007', 'Set up Helm Chart', 'Package the entire application as a Helm chart for easy deployment', 'todo', 'low', DATE_ADD(CURDATE(), INTERVAL 14 DAY), '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000008', 'Configure HPA for backend', 'Set up Horizontal Pod Autoscaler based on CPU and memory metrics', 'todo', 'low', DATE_ADD(CURDATE(), INTERVAL 18 DAY), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000009', 'Install Prometheus and Grafana', 'Deploy monitoring stack and configure dashboards for the app', 'todo', 'medium', DATE_ADD(CURDATE(), INTERVAL 21 DAY), '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000010', 'Set up ArgoCD for GitOps', 'Install ArgoCD, configure app sync from GitHub repository', 'todo', 'medium', DATE_ADD(CURDATE(), INTERVAL 25 DAY), '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001');
