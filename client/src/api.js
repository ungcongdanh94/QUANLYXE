const base = "/api";

async function req(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API loi ${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  getCars: () => req("/cars"),
  addCar: (data) => req("/cars", { method: "POST", body: JSON.stringify(data) }),
  deleteCar: (id) => req(`/cars/${id}`, { method: "DELETE" }),

  getTrips: () => req("/trips"),
  addTrip: (data) => req("/trips", { method: "POST", body: JSON.stringify(data) }),
  deleteTrip: (id) => req(`/trips/${id}`, { method: "DELETE" }),

  getDaily: () => req("/daily"),
  addDaily: (data) => req("/daily", { method: "POST", body: JSON.stringify(data) }),
  deleteDaily: (id) => req(`/daily/${id}`, { method: "DELETE" }),

  getExpenses: () => req("/expenses"),
  addExpense: (data) => req("/expenses", { method: "POST", body: JSON.stringify(data) }),
  deleteExpense: (id) => req(`/expenses/${id}`, { method: "DELETE" }),
};
