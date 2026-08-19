const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }
  return data;
}

export const getStats = () => request("/stats");
export const getFaqs = () => request("/faqs");
export const getTeam = () => request("/team");
export const submitContact = (payload) =>
  request("/contact", { method: "POST", body: JSON.stringify(payload) });
