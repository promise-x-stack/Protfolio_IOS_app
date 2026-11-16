import { useEffect, useState } from "react";
import { fetchProjects } from "../../../services/projectApi";
import "./projects.css";

function ProjectList({ category, title }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchProjects(category, {
      onUpdate: (updatedProjects) => {
        if (active) setProjects(updatedProjects);
      },
    })
      .then((data) => {
        if (active) setProjects(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Could not load projects.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category]);

  return (
    <section className="All-p-container" aria-label={title}>
      <div className="lable">
        <h2>{title}</h2>
      </div>
      <div className="product--container-c">
        {loading && <p className="project-message">Loading projects...</p>}
        {!loading && error && <p className="project-message project-error">{error}</p>}
        {!loading && !error && projects.length === 0 && (
          <p className="project-message">No projects yet.</p>
        )}
        {!loading &&
          !error &&
          projects.map((project) => (
            <article key={project.id} className="app-card">
              <div className="app-icon" aria-hidden="true">
                <span>{project.logo || "✦"}</span>
              </div>
              <div className="app-details">
                <h3 className="app-name">{project.projectName}</h3>
                <p className="app-category">{project.category}</p>
                {project.ratings && <p className="rating">{project.ratings}</p>}
              </div>
              <a
                className="download-btn"
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </a>
            </article>
          ))}
      </div>
    </section>
  );
}

export default ProjectList;
