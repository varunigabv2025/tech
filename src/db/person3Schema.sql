-- Person 3 schema (TReDS packaging, disbursements, AA consent)
-- Additive only. Does not alter Person 1 tables.

CREATE TABLE IF NOT EXISTS treds_packages (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL UNIQUE,
  exchange TEXT DEFAULT 'RXIL',
  payload TEXT NOT NULL,
  status TEXT DEFAULT 'LISTED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS disbursements (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL UNIQUE,
  package_id TEXT,
  invoice_amount REAL NOT NULL,
  advance_rate REAL NOT NULL DEFAULT 0.90,
  disbursed_amount REAL NOT NULL,
  holdback_amount REAL NOT NULL,
  discount_rate REAL,
  discount_fee REAL,
  financier_name TEXT DEFAULT 'Alchemy Finance Partners',
  disbursed_at DATETIME,
  settled_at DATETIME,
  settlement_amount REAL,
  status TEXT DEFAULT 'DISBURSED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES treds_packages(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS aa_consents (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL,
  unit_name TEXT,
  fiu_name TEXT DEFAULT 'TrustFlow',
  purpose TEXT NOT NULL,
  data_types TEXT NOT NULL,
  fips TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME,
  rejected_at DATETIME,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);
