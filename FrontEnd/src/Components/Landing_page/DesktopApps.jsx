import { useState } from "react";

const skills = ["React", "JavaScript", "HTML & CSS", "Flask", "MySQL", "Responsive UI"];

export function AboutApp({ onOpen }) {
  return (
    <article className="about-app">
      <div className="about-hero">
        <div className="about-avatar" aria-hidden="true">PN</div>
        <div>
          <p className="about-kicker">A little about me</p>
          <h1>Promise Ndegwa</h1>
          <p className="about-role">Developer · Designer · Problem solver</p>
        </div>
      </div>
      <p className="about-copy">
        I enjoy turning ideas into approachable, useful digital experiences.
        I work across frontend interfaces and backend services, with a focus on
        thoughtful details and responsive design.
      </p>
      <h2>Things I work with</h2>
      <div className="skill-list">
        {skills.map((skill) => <span key={skill}>{skill}</span>)}
      </div>
      <div className="about-links">
        <a href="https://github.com/Promise254" target="_blank" rel="noreferrer">
          <i className="fab fa-github" aria-hidden="true" /> GitHub
        </a>
        <button type="button" onClick={() => onOpen("projects")}>
          Explore projects <i className="fas fa-arrow-right" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export function BrowserApp({ onOpen }) {
  const [address, setAddress] = useState("github.com/Promise254");
  const [page, setPage] = useState("profile");

  function navigate(event) {
    event.preventDefault();
    const value = address.trim();
    if (value.toLowerCase().includes("github")) {
      setPage("profile");
      setAddress("github.com/Promise254");
    } else {
      setPage("home");
    }
  }

  return (
    <section className="browser-app">
      <form className="browser-toolbar" onSubmit={navigate}>
        <button type="button" aria-label="Back" onClick={() => setPage("home")}>
          <i className="fas fa-chevron-left" aria-hidden="true" />
        </button>
        <label>
          <i className="fas fa-lock" aria-hidden="true" />
          <input value={address} onChange={(event) => setAddress(event.target.value)} aria-label="Address" />
          <button type="submit" aria-label="Go to address">
            <i className="fas fa-arrow-right" aria-hidden="true" />
          </button>
        </label>
      </form>
      {page === "profile" ? (
        <div className="browser-profile">
          <div className="browser-profile-icon"><i className="fab fa-github" aria-hidden="true" /></div>
          <p>DEVELOPER PROFILE</p>
          <h1>Promise Ndegwa</h1>
          <span>Explore source code and projects on GitHub.</span>
          <a href="https://github.com/Promise254" target="_blank" rel="noreferrer">
            Visit GitHub <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" />
          </a>
        </div>
      ) : (
        <div className="browser-start">
          <div className="browser-compass"><i className="fas fa-compass" aria-hidden="true" /></div>
          <h1>Where to next?</h1>
          <p>This browser is a small tour of Promise’s portfolio.</p>
          <button type="button" onClick={() => onOpen("projects")}>Browse projects</button>
        </div>
      )}
    </section>
  );
}

export function SettingsApp({ appearance, onToggleAppearance }) {
  return (
    <section className="settings-app">
      <aside className="settings-sidebar">
        <strong>System Settings</strong>
        <span className="settings-selected"><i className="fas fa-sun" /> Appearance</span>
        <span><i className="fas fa-desktop" /> Desktop & Dock</span>
        <span><i className="fas fa-bell" /> Notifications</span>
        <span><i className="fas fa-user-circle" /> About</span>
      </aside>
      <div className="settings-content">
        <p className="about-kicker">Personalization</p>
        <h1>Appearance</h1>
        <p>Choose the desktop color mode that feels right to you.</p>
        <div className="appearance-options">
          <button
            type="button"
            className={appearance === "light" ? "appearance-option selected" : "appearance-option"}
            onClick={() => appearance !== "light" && onToggleAppearance()}
            aria-pressed={appearance === "light"}
          >
            <span className="appearance-preview appearance-preview-light" />
            Light
          </button>
          <button
            type="button"
            className={appearance === "dark" ? "appearance-option selected" : "appearance-option"}
            onClick={() => appearance !== "dark" && onToggleAppearance()}
            aria-pressed={appearance === "dark"}
          >
            <span className="appearance-preview appearance-preview-dark" />
            Dark
          </button>
        </div>
      </div>
    </section>
  );
}
