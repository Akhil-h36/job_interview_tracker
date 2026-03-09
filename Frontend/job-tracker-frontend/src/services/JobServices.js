const BASE_URL = "http://localhost:8000/api"; // adjust to your Django URL

export const getAllRecords = async () => {
  const res = await fetch(`${BASE_URL}/records/`);
  return res.json();
};

export const getStats = async () => {
  const res = await fetch(`${BASE_URL}/stats/`);
  return res.json();
};

export const applyJob = async (platform) => {
  const res = await fetch(`${BASE_URL}/apply/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform }),
  });
  return res.json();
};


// Deletes ALL application records from the database
export const resetAll = async () => {
  const res = await fetch(`${BASE_URL}/reset/`, {
    method: "DELETE",
  });
  return res.json();
};

export const getDayReport = async (date) => {
  const res = await fetch(`${BASE_URL}/report/${date}/`);
  if (!res.ok) return null;
  return res.json();
};

// Sets the today count for a platform to an explicit number
export const setCount = async (platform, count) => {
  const res = await fetch(`${BASE_URL}/set-count/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform, count }),
  });
  return res.json();
};