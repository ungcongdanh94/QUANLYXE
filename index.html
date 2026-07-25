const base = "/api";

async function req(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    let message = `Loi ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch (e) {
      // ignore
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  login: (username, password) => req("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: () => req("/auth/logout", { method: "POST" }),
  me: () => req("/auth/me"),
  changePassword: (oldPassword, newPassword) =>
    req("/auth/change-password", { method: "POST", body: JSON.stringify({ oldPassword, newPassword }) }),

  getUsers: () => req("/users"),
  addUser: (data) => req("/users", { method: "POST", body: JSON.stringify(data) }),
  deleteUser: (id) => req(`/users/${id}`, { method: "DELETE" }),

  getCars: () => req("/cars"),
  addCar: (data) => req("/cars", { method: "POST", body: JSON.stringify(data) }),
  deleteCar: (id) => req(`/cars/${id}`, { method: "DELETE" }),

  getTrips: () => req("/trips"),
  addTrip: (data) => req("/trips", { method: "POST", body: JSON.stringify(data) }),
  updateTrip: (id, data) => req(`/trips/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTrip: (id) => req(`/trips/${id}`, { method: "DELETE" }),

  getDaily: () => req("/daily"),
  addDaily: (data) => req("/daily", { method: "POST", body: JSON.stringify(data) }),
  updateDaily: (id, data) => req(`/daily/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDaily: (id) => req(`/daily/${id}`, { method: "DELETE" }),

  getExpenses: () => req("/expenses"),
  addExpense: (data) => req("/expenses", { method: "POST", body: JSON.stringify(data) }),
  deleteExpense: (id) => req(`/expenses/${id}`, { method: "DELETE" }),
};
