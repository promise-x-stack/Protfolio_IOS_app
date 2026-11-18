import { useState } from "react";

const skills = ["React", "JavaScript", "HTML & CSS", "Flask", "MySQL", "Responsive UI"];
const repositoryUrl = "https://github.com/promise-x-stack/Protfolio_IOS_app.git";
const browserHomeUrl = "https://www.google.com/webhp?igu=1";

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
        <a href={repositoryUrl} target="_blank" rel="noreferrer">
          <i className="fab fa-github" aria-hidden="true" /> GitHub
        </a>
        <button type="button" onClick={() => onOpen("projects")}>
          Explore projects <i className="fas fa-arrow-right" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export function BrowserApp() {
  const [address, setAddress] = useState(browserHomeUrl);
  const [pageUrl, setPageUrl] = useState(browserHomeUrl);
  const [navigationError, setNavigationError] = useState("");

  function navigate(event) {
    event.preventDefault();
    const value = address.trim();
    const hasProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(value);
    const isWebAddress = hasProtocol || (/^[\w-]+(?:\.[\w-]+)+(?:[/?#:]|$)/i.test(value));
    const candidate = isWebAddress
      ? (hasProtocol ? value : `https://${value}`)
      : `https://www.google.com/search?igu=1&q=${encodeURIComponent(value)}`;

    try {
      const url = new URL(candidate);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        setNavigationError("Only HTTP and HTTPS addresses are supported.");
        return;
      }
      setAddress(url.href);
      setPageUrl(url.href);
      setNavigationError("");
    } catch {
      setNavigationError("Enter a valid website address.");
    }
  }

  function goHome() {
    setAddress(browserHomeUrl);
    setPageUrl(browserHomeUrl);
    setNavigationError("");
  }

  return (
    <section className="browser-app">
      <form className="browser-toolbar" onSubmit={navigate}>
        <button type="button" aria-label="Back to repository" onClick={goHome}>
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
      {navigationError && <p className="browser-navigation-error" role="alert">{navigationError}</p>}
      <iframe className="browser-frame" src={pageUrl} title="Safari web page" referrerPolicy="no-referrer" />
      <div className="browser-frame-fallback">
        Some websites block embedded viewing. <a href={pageUrl} target="_blank" rel="noreferrer">Open this page in a new tab</a>.
      </div>
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
