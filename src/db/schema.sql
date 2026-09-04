PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gst_number TEXT NOT NULL,
  contact TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0.0,
  order_date DATE NOT NULL,
  delivery_status TEXT DEFAULT 'PENDING',
  delivery_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  unit_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0.0,
  invoice_date DATE,
  due_date DATE,
  delivered INTEGER DEFAULT 0,
  verified INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  trust_score REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  total_score REAL DEFAULT 0,
  gst_consistency_score REAL DEFAULT 0,
  buyer_verification_score REAL DEFAULT 0,
  delivery_confirmed_score REAL DEFAULT 0,
  days_outstanding_score REAL DEFAULT 0,
  cash_flow_stability_score REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('MSME', 'FINANCIER')),
  unit_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

