const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function fetchApi(path: string, options: RequestInit = {}) {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || response.statusText);
  }

  return response.json();
}
