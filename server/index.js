require("dotenv").config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { pool, init } = require("./db");

const app = express();
app.use(express.json());

const uid = () => crypto.randomUUID();

// ---------- CARS ----------
app.get("/api/cars", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, name, plate FROM cars ORDER BY name");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/cars", async (req, res) => {
  try {
    const { name, plate } = req.body;
    if (!name) return res.status(400).json({ error: "Thieu ten xe" });
    const id = uid();
    await pool.query("INSERT INTO cars (id, name, plate) VALUES ($1,$2,$3)", [
      id,
      name,
      plate || null,
    ]);
    res.json({ id, name, plate: plate || null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/cars/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM cars WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- TRIPS ----------
app.get("/api/trips", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, to_char(date,'YYYY-MM-DD') AS date, car_id AS "carId", customer,
        revenue::float AS revenue, driver_cost::float AS "driverCost",
        fuel_cost::float AS "fuelCost", other_cost::float AS "otherCost"
      FROM trips ORDER BY date DESC, created_at DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/trips", async (req, res) => {
  try {
    const { date, carId, customer, revenue, driverCost, fuelCost, otherCost } = req.body;
    const id = uid();
    await pool.query(
      `INSERT INTO trips (id, date, car_id, customer, revenue, driver_cost, fuel_cost, other_cost)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, date, carId || null, customer || null, revenue || 0, driverCost || 0, fuelCost || 0, otherCost || 0]
    );
    res.json({ id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/trips/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM trips WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- DAILY RENTALS ----------
app.get("/api/daily", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, to_char(date,'YYYY-MM-DD') AS date, car_id AS "carId", customer,
        price_per_day::float AS "pricePerDay", days
      FROM daily_rentals ORDER BY date DESC, created_at DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/daily", async (req, res) => {
  try {
    const { date, carId, customer, pricePerDay, days } = req.body;
    const id = uid();
    await pool.query(
      `INSERT INTO daily_rentals (id, date, car_id, customer, price_per_day, days)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, date, carId || null, customer || null, pricePerDay || 0, days || 1]
    );
    res.json({ id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/daily/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM daily_rentals WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- EXPENSES ----------
app.get("/api/expenses", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, month, category, amount::float AS amount, note
      FROM expenses ORDER BY month DESC, created_at DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/expenses", async (req, res) => {
  try {
    const { month, category, amount, note } = req.body;
    const id = uid();
    await pool.query(
      `INSERT INTO expenses (id, month, category, amount, note) VALUES ($1,$2,$3,$4,$5)`,
      [id, month, category || null, amount || 0, note || null]
    );
    res.json({ id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM expenses WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- Serve frontend build ----------
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

const PORT = process.env.PORT || 3000;

init()
  .then(() => {
    app.listen(PORT, () => console.log(`Server dang chay tren port ${PORT}`));
  })
  .catch((err) => {
    console.error("Khoi tao database that bai:", err);
    process.exit(1);
  });
