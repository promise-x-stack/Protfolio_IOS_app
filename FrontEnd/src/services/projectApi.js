const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
const CACHE_PREFIX = "portfolio-projects:";
const CACHE_TTL_MS = 60 * 1000;

function cacheKey(category) {
  return `${CACHE_PREFIX}${category || "all"}`;
}

function readCache(key) {
  try {
    const cached = window.localStorage.getItem(key);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (!Array.isArray(parsed.data) || typeof parsed.savedAt !== "number") {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn("Could not read the project browser cache.", error);
    return null;
  }
}

function writeCache(key, data) {
  try {
    window.localStorage.setItem(key, JSON.stringify({ data, savedAt: Date.now() }));
  } catch (error) {
    console.warn("Could not update the project browser cache.", error);
  }
}

function invalidateCache() {
  try {
    const keys = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key && key.startsWith(CACHE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch (error) {
    console.warn("Could not clear the project browser cache.", error);
  }
}

async function responseJson(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `Project request failed (${response.status}).`);
  }
  return body;
}

export async function fetchProjects(category) {
  const key = cacheKey(category);
  const cached = readCache(key);
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const route = category ? `/api/products/${encodeURIComponent(category)}` : "/api/products";
  try {
    const response = await fetch(`${API_BASE_URL}${route}`, { cache: "no-store" });
    const projects = await responseJson(response);
    if (!Array.isArray(projects)) {
      throw new Error("The project API returned an invalid response.");
    }
    writeCache(key, projects);
    return projects;
  } catch (error) {
    if (cached) {
      console.warn("Project API is unavailable; showing cached projects.", error);
      return cached.data;
    }
    throw error;
  }
}

async function mutateProject(method, projectId, projectData, adminToken) {
  if (!adminToken) {
    throw new Error("An admin token is required to change projects.");
  }
  const isCreate = method === "POST";
  const url = isCreate
    ? `${API_BASE_URL}/api/products`
    : `${API_BASE_URL}/api/products/${encodeURIComponent(projectId)}`;
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${adminToken}`,
      ...(projectData ? { "Content-Type": "application/json" } : {}),
    },
    ...(projectData ? { body: JSON.stringify(projectData) } : {}),
  });
  const result = response.status === 204 ? null : await responseJson(response);
  invalidateCache();
  return result;
}

export function createProject(projectData, adminToken) {
  return mutateProject("POST", null, projectData, adminToken);
}

export function updateProject(projectId, projectData, adminToken) {
  return mutateProject("PUT", projectId, projectData, adminToken);
}

export function deleteProject(projectId, adminToken) {
  return mutateProject("DELETE", projectId, null, adminToken);
}
