import { useCallback, useEffect, useMemo, useState } from "react";
import AppleMail from "../AppleMail/AppleMail";
import Finder from "../Filemanager/react";
import AppleAppStore from "../Applestore/AppleAppStore";
import MessagePage from "../message/message";
import {
  AboutApp,
  BrowserApp,
  SettingsApp,
} from "./DesktopApps";
import "./Landing.css";

import aboutIcon from "../../assets/about_icon.jpg";
import appStoreIcon from "../../assets/appstore_icon.jpg";
import browserIcon from "../../assets/browser_icon.jpg";
import mailIcon from "../../assets/message_icon.jpg";
import macIcon from "../../assets/macos_logo.webp";
import messagesIcon from "../../assets/message.jpg";
import settingsIcon from "../../assets/settings_icon.jpg";
import trashIcon from "../../assets/trash_4.png";
import desktopWallpaper from "../../assets/mac_wallpaper.jpg";
import mobileWallpaper from "./bg-img/iphone.jpg";

const APPLICATIONS = [
  { id: "finder", label: "Finder", icon: macIcon },
  { id: "about", label: "About Me", icon: aboutIcon },
  { id: "projects", label: "Projects", icon: appStoreIcon },
  { id: "mail", label: "Mail", icon: mailIcon },
  { id: "messages", label: "Messages", icon: messagesIcon },
  { id: "safari", label: "Safari", icon: browserIcon },
  { id: "settings", label: "Settings", icon: settingsIcon },
];

const WINDOW_TITLES = {
  finder: "Finder",
  trash: "Trash",
  about: "About Promise",
  projects: "Projects",
  mail: "Mail",
  messages: "Messages",
  safari: "Safari",
  settings: "System Settings",
};

function getClock() {
  return new Intl.DateTimeFormat([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

function AppIcon({ app, onOpen, compact = false }) {
  return (
    <button
      className={`home-app ${compact ? "home-app-compact" : ""}`}
      type="button"
      onClick={() => onOpen(app.id)}
      aria-label={`Open ${app.label}`}
      title={app.label}
    >
      <span className="home-app-image">
        <img src={app.icon} alt="" draggable="false" />
      </span>
      <span className="home-app-label">{app.label}</span>
    </button>
  );
}

function TrafficLight({ color, label, onClick }) {
  return (
    <button
      className={`traffic-light traffic-light-${color}`}
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
    />
  );
}

function ApplicationContent({ app, onOpen, appearance, onToggleAppearance }) {
  switch (app) {
    case "finder":
      return <Finder key="finder" />;
    case "trash":
      return <Finder key="trash" initialDirectory="trash" />;
    case "about":
      return <AboutApp onOpen={onOpen} />;
    case "projects":
      return <AppleAppStore func={() => onOpen(null)} />;
    case "mail":
      return <AppleMail />;
    case "messages":
      return <MessagePage embedded />;
    case "safari":
      return <BrowserApp />;
    case "settings":
      return <SettingsApp appearance={appearance} onToggleAppearance={onToggleAppearance} />;
    default:
      return null;
  }
}

function LandingPage() {
  const [activeApp, setActiveApp] = useState(null);
  const [minimizedApps, setMinimizedApps] = useState([]);
  const [maximized, setMaximized] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [clock, setClock] = useState(getClock);
  const [appearance, setAppearance] = useState(() => {
    try {
      return window.localStorage.getItem("promise-desktop-appearance") || "dark";
    } catch {
      return "dark";
    }
  });

  const openApp = useCallback((app) => {
    if (!app) {
      setActiveApp(null);
      setMaximized(false);
      return;
    }
    setMinimizedApps((current) => current.filter((item) => item !== app));
    setActiveApp(app);
    setMaximized(false);
    setMenuOpen(false);
    setSpotlightOpen(false);
  }, []);

  const toggleAppearance = useCallback(() => {
    setAppearance((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem("promise-desktop-appearance", next);
      } catch {
        // The appearance still changes for this session if storage is unavailable.
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(getClock()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (spotlightOpen) setSpotlightOpen(false);
        else if (menuOpen) setMenuOpen(false);
        else if (activeApp) openApp(null);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSpotlightOpen((current) => !current);
        setSpotlightQuery("");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeApp, menuOpen, openApp, spotlightOpen]);

  const matchingApps = useMemo(() => {
    const query = spotlightQuery.trim().toLowerCase();
    return APPLICATIONS.filter((app) => !query || app.label.toLowerCase().includes(query));
  }, [spotlightQuery]);

  function minimizeApp() {
    if (activeApp) {
      setMinimizedApps((current) => [...new Set([...current, activeApp])]);
      setActiveApp(null);
      setMaximized(false);
    }
  }

  return (
    <main
      className={`portfolio-desktop appearance-${appearance} ${activeApp ? "app-is-open" : ""}`}
      style={{
        "--desktop-wallpaper": `url("${desktopWallpaper}")`,
        "--mobile-wallpaper": `url("${mobileWallpaper}")`,
      }}
    >
      <div className="desktop-menu-bar">
        <div className="menu-left">
          <button
            className="apple-menu-button"
            type="button"
            aria-label="Open Apple menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <i className="fab fa-apple" aria-hidden="true" />
          </button>
          <button className="menu-app-name" type="button" onClick={() => openApp("about")}>
            Promise Ndegwa
          </button>
          <button className="desktop-menu-item" type="button" onClick={() => openApp("finder")}>Finder</button>
          <button className="desktop-menu-item" type="button" onClick={() => openApp("projects")}>Projects</button>
          <button className="desktop-menu-item" type="button" onClick={() => openApp("about")}>About</button>
        </div>
        <div className="menu-right">
          <button
            className="menu-icon-button spotlight-button"
            type="button"
            aria-label="Search apps"
            title="Search apps (Ctrl/Command + K)"
            onClick={() => setSpotlightOpen(true)}
          >
            <i className="fas fa-search" aria-hidden="true" />
          </button>
          <button className="menu-icon-button" type="button" aria-label="Open settings" onClick={() => openApp("settings")}>
            <i className="fas fa-sliders-h" aria-hidden="true" />
          </button>
          <span className="menu-clock">{clock}</span>
        </div>
        {menuOpen && (
          <div className="apple-menu-popover">
            <strong>Promise Ndegwa</strong>
            <button type="button" onClick={() => openApp("about")}>About this portfolio</button>
            <button type="button" onClick={() => openApp("settings")}>System Settings</button>
            <button type="button" onClick={() => setMenuOpen(false)}>Close menu</button>
          </div>
        )}
      </div>

      <section className="desktop-workspace" aria-label="Portfolio desktop">
        <div className="desktop-icon-column" aria-label="Desktop apps">
          {APPLICATIONS.slice(0, 5).map((app) => (
            <AppIcon key={app.id} app={app} onOpen={openApp} />
          ))}
        </div>

        <section className="desktop-welcome" aria-label="Welcome">
          <span className="welcome-eyebrow">WELCOME TO MY DESKTOP</span>
          <h1>Hi, I’m <span>Promise Ndegwa.</span></h1>
          <p>
            Developer and designer building thoughtful digital experiences.
            Take a look around.
          </p>
          <div className="welcome-actions">
            <button type="button" className="welcome-primary" onClick={() => openApp("projects")}>
              <i className="fas fa-folder-open" aria-hidden="true" /> Explore my work
            </button>
            <button type="button" className="welcome-secondary" onClick={() => openApp("about")}>
              About me <i className="fas fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
          <div className="desktop-widget">
            <div className="widget-icon"><i className="fas fa-code" aria-hidden="true" /></div>
            <div>
              <strong>Currently creating</strong>
              <span>Web apps · UI/UX · Full-stack projects</span>
            </div>
            <i className="fas fa-sparkles widget-sparkle" aria-hidden="true" />
          </div>
        </section>

        {minimizedApps.length > 0 && (
          <div className="minimized-windows" aria-label="Minimized windows">
            {minimizedApps.map((app) => (
              <button type="button" key={app} onClick={() => openApp(app)}>
                <i className="fas fa-window-restore" aria-hidden="true" />
                {WINDOW_TITLES[app]}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="ios-home-screen" aria-label="iPhone home screen">
        <div className="ios-status-bar">
          <span>{new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" }).format(new Date())}</span>
          <span className="ios-island" aria-hidden="true" />
          <span className="ios-status-icons"><i className="fas fa-signal" /><i className="fas fa-wifi" /><i className="fas fa-battery-three-quarters" /></span>
        </div>

        <div className="ios-date">
          <span>{new Intl.DateTimeFormat([], { weekday: "long" }).format(new Date())}</span>
          <strong>{new Intl.DateTimeFormat([], { month: "long", day: "numeric" }).format(new Date())}</strong>
        </div>

        <section className="ios-welcome-widget">
          <span className="ios-widget-kicker">PORTFOLIO · 2026</span>
          <h1>Promise<br />Ndegwa</h1>
          <p>Developer · Designer · Creator</p>
          <button type="button" onClick={() => openApp("about")}>
            Discover my story <i className="fas fa-arrow-right" aria-hidden="true" />
          </button>
          <span className="ios-widget-orb" aria-hidden="true" />
        </section>

        <div className="ios-app-grid">
          {APPLICATIONS.map((app) => (
            <AppIcon key={app.id} app={app} onOpen={openApp} compact />
          ))}
        </div>

        <div className="ios-dock" aria-label="Favorite apps">
          {APPLICATIONS.filter((app) => ["finder", "projects", "mail", "messages"].includes(app.id)).map((app) => (
            <AppIcon key={app.id} app={app} onOpen={openApp} compact />
          ))}
        </div>
        <div className="ios-home-indicator" aria-hidden="true" />
      </section>

      <nav className="mac-dock" aria-label="Dock">
        {APPLICATIONS.filter((app) => ["finder", "projects", "mail", "messages", "safari", "settings"].includes(app.id)).map((app) => (
          <AppIcon key={app.id} app={app} onOpen={openApp} compact />
        ))}
        <span className="dock-divider" />
        <button className="dock-trash" type="button" onClick={() => openApp("trash")} aria-label="Open Trash">
          <img src={trashIcon} alt="" />
        </button>
      </nav>

      {activeApp && (
        <div
          className={`app-window-overlay ${maximized ? "window-is-maximized" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label={WINDOW_TITLES[activeApp]}
        >
          <section className="desktop-window">
            <div className="desktop-window-titlebar">
              <div className="traffic-lights">
                <TrafficLight color="red" label="Close window" onClick={() => openApp(null)} />
                <TrafficLight color="yellow" label="Minimize window" onClick={minimizeApp} />
                <TrafficLight
                  color="green"
                  label={maximized ? "Restore window" : "Maximize window"}
                  onClick={() => setMaximized((current) => !current)}
                />
              </div>
              <span className="desktop-window-title">{WINDOW_TITLES[activeApp]}</span>
              <button className="window-close-mobile" type="button" onClick={() => openApp(null)} aria-label="Close app">
                Done
              </button>
            </div>
            <div className={`desktop-window-content app-content-${activeApp}`}>
              <ApplicationContent
                app={activeApp}
                onOpen={openApp}
                appearance={appearance}
                onToggleAppearance={toggleAppearance}
              />
            </div>
          </section>
          <button className="window-scrim" type="button" onClick={() => openApp(null)} aria-label="Close active app" />
        </div>
      )}

      {spotlightOpen && (
        <div className="spotlight-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSpotlightOpen(false);
        }}>
          <section className="spotlight-panel" role="dialog" aria-modal="true" aria-label="Search apps">
            <label className="spotlight-search">
              <i className="fas fa-search" aria-hidden="true" />
              <input
                autoFocus
                value={spotlightQuery}
                onChange={(event) => setSpotlightQuery(event.target.value)}
                placeholder="Search apps and portfolio"
              />
              <kbd>ESC</kbd>
            </label>
            <div className="spotlight-results">
              {matchingApps.map((app) => (
                <button type="button" key={app.id} onClick={() => openApp(app.id)}>
                  <img src={app.icon} alt="" />
                  <span>{app.label}</span>
                  <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" />
                </button>
              ))}
              {matchingApps.length === 0 && <p>No apps found.</p>}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default LandingPage;
