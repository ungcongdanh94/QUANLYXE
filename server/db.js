const { Pool } = require("pg");
const crypto = require("crypto");

if (!process.env.DATABASE_URL) {
  console.warn(
    "[canh bao] Khong tim thay DATABASE_URL. Hay them Postgres plugin tren Railway hoac dat bien moi truong DATABASE_URL."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost")
      ? { rejectUnauthorized: false }
      : false,
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cars (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      plate TEXT
    );

    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      date DATE NOT NULL,
      car_id TEXT REFERENCES cars(id) ON DELETE SET NULL,
      customer TEXT,
      revenue NUMERIC DEFAULT 0,
      driver_cost NUMERIC DEFAULT 0,
      fuel_cost NUMERIC DEFAULT 0,
      other_cost NUMERIC DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS daily_rentals (
      id TEXT PRIMARY KEY,
      date DATE NOT NULL,
      car_id TEXT REFERENCES cars(id) ON DELETE SET NULL,
      customer TEXT,
      price_per_day NUMERIC DEFAULT 0,
      days INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      month TEXT NOT NULL,
      category TEXT,
      amount NUMERIC DEFAULT 0,
      note TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS c FROM cars");
  if (rows[0].c === 0) {
    for (const name of ["Xe 01", "Xe 02", "Xe 03"]) {
      await pool.query("INSERT INTO cars (id, name) VALUES ($1, $2)", [
        crypto.randomUUID(),
        name,
      ]);
    }
  }
}

module.exports = { pool, init };
