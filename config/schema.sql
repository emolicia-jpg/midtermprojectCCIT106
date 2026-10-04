CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student','faculty','custodian','admin')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  asset_tag TEXT NOT NULL UNIQUE,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  item_condition TEXT NOT NULL DEFAULT 'Good',
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  equipment_id INTEGER NOT NULL REFERENCES equipment(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  purpose TEXT NOT NULL,
  start_at TEXT NOT NULL,
  due_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',  -- Pending, Approved, Denied, Returned for correction, Borrowed, Returned
  decided_by INTEGER REFERENCES users(id),
  decided_at TEXT,
  decision_reason TEXT,
  released_at TEXT,
  release_condition TEXT,
  returned_at TEXT,
  return_condition TEXT,
  return_note TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);