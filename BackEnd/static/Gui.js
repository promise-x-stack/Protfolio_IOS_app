const projectForm = document.querySelector("#project-form");
const projectList = document.querySelector("#project-list");
const adminToken = document.querySelector("#admin-token");
const statusMessage = document.querySelector("#status-message");
const formHeading = document.querySelector("#form-heading");
const saveButton = document.querySelector("#save-project");
const cancelButton = document.querySelector("#cancel-edit");

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, options);
  const result = response.status === 204
    ? null
    : await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.error || `Request failed (${response.status}).`);
  }
  return result;
}

function projectLink(value) {
  const link = document.createElement("a");
  link.textContent = value || "No link";
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      link.href = url.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  } catch {
    link.removeAttribute("href");
  }
  return link;
}

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card";

  const details = document.createElement("div");
  const name = document.createElement("h3");
  name.textContent = project.projectName;
  const category = document.createElement("p");
  category.textContent = `Category: ${project.category}`;
  const link = document.createElement("p");
  link.append(projectLink(project.link));
  const metadata = document.createElement("p");
  metadata.textContent = `Logo: ${project.logo || "—"} · Rating: ${project.ratings || "—"}`;
  details.append(name, category, link, metadata);

  const actions = document.createElement("div");
  actions.className = "project-actions";
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "secondary-button";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => beginEdit(project));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "danger-button";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => removeProject(project));
  actions.append(editButton, deleteButton);
  card.append(details, actions);
  return card;
}

async function loadProjects() {
  projectList.replaceChildren();
  const loading = document.createElement("p");
  loading.className = "empty-list";
  loading.textContent = "Loading projects…";
  projectList.append(loading);

  try {
    const projects = await requestJson("/api/products", { cache: "no-store" });
    if (!Array.isArray(projects)) {
      throw new Error("The project API returned an invalid response.");
    }
    projectList.replaceChildren();
    if (projects.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-list";
      empty.textContent = "No projects yet. Add one using the form.";
      projectList.append(empty);
      return;
    }
    projects.forEach((project) => projectList.append(createProjectCard(project)));
  } catch (error) {
    projectList.replaceChildren();
    showStatus(error.message || "Could not load projects.", true);
  }
}

function beginEdit(project) {
  projectForm.elements.projectId.value = project.id;
  projectForm.elements.projectName.value = project.projectName || "";
  projectForm.elements.category.value = project.category || "";
  projectForm.elements.link.value = project.link || "";
  projectForm.elements.logo.value = project.logo || "";
  projectForm.elements.ratings.value = project.ratings || "";
  formHeading.textContent = "Edit project";
  saveButton.textContent = "Save changes";
  cancelButton.hidden = false;
  projectForm.elements.projectName.focus();
}

function resetForm() {
  projectForm.reset();
  projectForm.elements.projectId.value = "";
  formHeading.textContent = "Add a project";
  saveButton.textContent = "Add project";
  cancelButton.hidden = true;
}

async function removeProject(project) {
  if (!window.confirm(`Delete "${project.projectName}"? This cannot be undone.`)) {
    return;
  }
  try {
    await requestJson(`/api/products/${encodeURIComponent(project.id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken.value}` },
    });
    if (projectForm.elements.projectId.value === String(project.id)) resetForm();
    showStatus("Project deleted.");
    await loadProjects();
  } catch (error) {
    showStatus(error.message || "Could not delete the project.", true);
  }
}

projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = adminToken.value.trim();
  if (!token) {
    showStatus("Enter the admin token before saving a project.", true);
    adminToken.focus();
    return;
  }

  const formData = new FormData(projectForm);
  const projectData = {
    projectName: formData.get("projectName").trim(),
    category: formData.get("category").trim(),
    link: formData.get("link").trim(),
    logo: formData.get("logo").trim(),
    ratings: formData.get("ratings").trim(),
  };
  const projectId = formData.get("projectId");
  const path = projectId
    ? `/api/products/${encodeURIComponent(projectId)}`
    : "/api/products";

  try {
    await requestJson(path, {
      method: projectId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });
    resetForm();
    showStatus(projectId ? "Project updated." : "Project added.");
    await loadProjects();
  } catch (error) {
    showStatus(error.message || "Could not save the project.", true);
  }
});

cancelButton.addEventListener("click", resetForm);
document.querySelector("#refresh-projects").addEventListener("click", loadProjects);
loadProjects();
