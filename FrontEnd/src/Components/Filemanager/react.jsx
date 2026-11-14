import React, { useState, useEffect, useCallback } from 'react';


const Finder = (props) => {
  // ----- File System Data (mock) -----
  const fileSystem = [
    { id: "root", name: "Macintosh HD", type: "folder", parentId: null, size: null, modDate: "Today, 10:23 AM" },
    { id: "applications", name: "Applications", type: "folder", parentId: "root", size: null, modDate: "Yesterday" },
    { id: "users", name: "Users", type: "folder", parentId: "root", size: null, modDate: "Yesterday" },
    { id: "system", name: "System", type: "folder", parentId: "root", size: null, modDate: "Apr 10" },
    { id: "downloads", name: "Downloads", type: "folder", parentId: "users", size: null, modDate: "Today" },
    { id: "desktop", name: "Desktop", type: "folder", parentId: "users", size: null, modDate: "Today" },
    { id: "documents", name: "Documents", type: "folder", parentId: "users", size: null, modDate: "Yesterday" },
    { id: "movies", name: "Movies", type: "folder", parentId: "users", size: null, modDate: "Apr 8" },
    { id: "music", name: "Music", type: "folder", parentId: "users", size: null, modDate: "Apr 5" },
    { id: "pictures", name: "Pictures", type: "folder", parentId: "users", size: null, modDate: "Apr 2" },
    { id: "resume", name: "Resume.pdf", type: "file", parentId: "documents", size: "1.2 MB", modDate: "Apr 12" },
    { id: "notes", name: "Project_notes.txt", type: "file", parentId: "documents", size: "24 KB", modDate: "Apr 10" },
    { id: "budget", name: "Budget_2025.xlsx", type: "file", parentId: "documents", size: "98 KB", modDate: "Apr 9" },
    { id: "setup", name: "Installer.dmg", type: "file", parentId: "downloads", size: "234 MB", modDate: "Today" },
    { id: "image", name: "wallpaper.png", type: "file", parentId: "downloads", size: "4.2 MB", modDate: "Yesterday" },
    { id: "screenshot", name: "Screenshot.png", type: "file", parentId: "desktop", size: "512 KB", modDate: "Today" },
    { id: "readme", name: "README.md", type: "file", parentId: "desktop", size: "2 KB", modDate: "Apr 11" },
    { id: "safari", name: "Safari.app", type: "file", parentId: "applications", size: "45 MB", modDate: "Apr 1" },
    { id: "mail", name: "Mail.app", type: "file", parentId: "applications", size: "32 MB", modDate: "Mar 28" },
    { id: "finder", name: "Finder.app", type: "file", parentId: "applications", size: "28 MB", modDate: "Mar 20" },
    { id: "song1", name: "song.mp3", type: "file", parentId: "music", size: "7.8 MB", modDate: "Apr 6" },
    { id: "video", name: "clip.mov", type: "file", parentId: "movies", size: "156 MB", modDate: "Apr 4" }
  ];

  // Navigation state
  const [currentDirectoryId, setCurrentDirectoryId] = useState("users");
  const [historyStack, setHistoryStack] = useState([]);
  const [forwardStack, setForwardStack] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Helpers
  const getItemById = useCallback((id) => fileSystem.find(item => item.id === id), [fileSystem]);
  const getChildren = useCallback((folderId) => fileSystem.filter(item => item.parentId === folderId), [fileSystem]);

  // Breadcrumb path array
  const getPathArray = useCallback((folderId) => {
    let path = [];
    let current = getItemById(folderId);
    while (current && current.parentId !== null) {
      path.unshift(current);
      current = getItemById(current.parentId);
    }
    if (current && current.id === "root") path.unshift(current);
    return path;
  }, [getItemById]);

  // Navigate to a folder (adds to history)
  const navigateToFolder = useCallback((folderId) => {
    if (folderId === currentDirectoryId) return;
    setHistoryStack(prev => [...prev, currentDirectoryId]);
    setForwardStack([]);
    setCurrentDirectoryId(folderId);
    setSelectedItemId(null);
  }, [currentDirectoryId]);

  // Back/Forward handlers
  const goBack = useCallback(() => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setForwardStack(prev => [currentDirectoryId, ...prev]);
    setHistoryStack(prev => prev.slice(0, -1));
    setCurrentDirectoryId(previous);
    setSelectedItemId(null);
  }, [historyStack, currentDirectoryId]);

  const goForward = useCallback(() => {
    if (forwardStack.length === 0) return;
    const next = forwardStack[0];
    setHistoryStack(prev => [...prev, currentDirectoryId]);
    setForwardStack(prev => prev.slice(1));
    setCurrentDirectoryId(next);
    setSelectedItemId(null);
  }, [forwardStack, currentDirectoryId]);

  // File/folder click handler
  const handleItemClick = useCallback((item) => {
    if (item.type === "folder") {
      navigateToFolder(item.id);
    } else {
      setSelectedItemId(item.id);
      alert(`📄 Quick Look\nFile: ${item.name}\nSize: ${item.size || "unknown"}\nModified: ${item.modDate}\n(macOS preview style)`);
    }
  }, [navigateToFolder]);

  // Sidebar navigation (favorites & devices)
  const sidebarItems = [
    { id: "users", icon: "fas fa-user", label: "Users" },
    { id: "applications", icon: "fas fa-apple-alt", label: "Applications" },
    { id: "desktop", icon: "fas fa-desktop", label: "Desktop" },
    { id: "documents", icon: "fas fa-folder-open", label: "Documents" },
    { id: "downloads", icon: "fas fa-download", label: "Downloads" },
    { id: "root", icon: "fas fa-hdd", label: "Macintosh HD", isDevice: true }
  ];

  // Render file browser (grid or list)
  const renderFileBrowser = () => {
    const children = getChildren(currentDirectoryId);
    if (children.length === 0) {
      return (
        <div className="empty-folder">
          <i className="fas fa-folder-open" style={{ fontSize: 48 }}></i>
          <span>This folder is empty</span>
        </div>
      );
    }

    if (viewMode === "grid") {
      return (
        <div className="grid-view">
          {children.map(item => {
            const isFolder = item.type === "folder";
            const iconClass = isFolder ? "fas fa-folder folder-icon" : "far fa-file file-icon";
            return (
              <div
                key={item.id}
                className={`grid-item ${selectedItemId === item.id ? "selected" : ""}`}
                onClick={() => handleItemClick(item)}
              >
                <div className="grid-icon"><i className={iconClass} style={{ fontSize: 52 }}></i></div>
                <div className="grid-name">{escapeHtml(item.name)}</div>
              </div>
            );
          })}
        </div>
      );
    } else {
      return (
        <div className="list-view">
          <div className="list-header">
            <div></div><div>Name</div><div>Date Modified</div><div>Size</div>
          </div>
          {children.map(item => {
            const iconClass = item.type === "folder" ? "fas fa-folder folder-icon" : "far fa-file file-icon";
            return (
              <div
                key={item.id}
                className={`list-row ${selectedItemId === item.id ? "selected" : ""}`}
                onClick={() => handleItemClick(item)}
              >
                <div className="list-icon"><i className={iconClass}></i></div>
                <div className="list-name">{escapeHtml(item.name)}</div>
                <div className="list-date">{item.modDate || "--"}</div>
                <div className="list-size">{item.size || "--"}</div>
              </div>
            );
          })}
        </div>
      );
    }
  };

  const escapeHtml = (str) => {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  };

  // Current folder object
  const currentFolder = getItemById(currentDirectoryId);
  const pathArray = getPathArray(currentDirectoryId);
  const itemCount = getChildren(currentDirectoryId).length;

  return (
    <div className="finder-window">
      {/* Titlebar */}
      <div className="titlebar">
        <div className="traffic-lights">
          <div className="light close" onClick={props.func}></div>
          <div className="light minimize"></div>
          <div className="light zoom"></div>
        </div>
        <div className="window-title">
          <i className="fas fa-smile"></i> Finder
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <button className="tool-btn" onClick={goBack} disabled={historyStack.length === 0}>
          <i className="fas fa-chevron-left"></i> Back
        </button>
        <button className="tool-btn" onClick={goForward} disabled={forwardStack.length === 0}>
          <i className="fas fa-chevron-right"></i>
        </button>
        <div className="toolbar-spacer"></div>
        <div className="view-buttons">
          <button className={`view-option ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>
            <i className="fas fa-th-large"></i>
          </button>
          <button className={`view-option ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
            <i className="fas fa-list"></i>
          </button>
        </div>
        <div className="search-field">
          <i className="fas fa-search"></i> <span>Search</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-heading">Favorites</div>
            {sidebarItems.filter(i => !i.isDevice).map(item => (
              <div
                key={item.id}
                className={`sidebar-item ${currentDirectoryId === item.id ? "active" : ""}`}
                onClick={() => navigateToFolder(item.id)}
              >
                <i className={item.icon}></i><span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="sidebar-section">
            <div className="sidebar-heading">Devices</div>
            {sidebarItems.filter(i => i.isDevice).map(item => (
              <div
                key={item.id}
                className={`sidebar-item ${currentDirectoryId === item.id ? "active" : ""}`}
                onClick={() => navigateToFolder(item.id)}
              >
                <i className={item.icon}></i><span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="content-area">
          <div className="path-bar">
            <i className="fas fa-folder-open" style={{ marginRight: 6, color: "#5e9bff" }}></i>
            {pathArray.map((item, idx) => (
              <React.Fragment key={item.id}>
                <span className="path-item" onClick={() => navigateToFolder(item.id)}>{item.name}</span>
                {idx < pathArray.length - 1 && <i className="fas fa-chevron-right" style={{ fontSize: 9, margin: "0 4px" }}></i>}
              </React.Fragment>
            ))}
          </div>
          <div className="file-grid">
            {renderFileBrowser()}
          </div>
          <div className="footer-status">
            <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
            <span><i className="far fa-clock"></i> Today</span>
          </div>
        </div>
      </div>

      {/* Styles (inline) */}
      <style jsx>{`
        .finder-window {
          transform: translatex(0cm) translatey(-1.3cm);
          position: absolute;
          color: rgb(31, 31, 73);
          width: 1300px;
          max-width: 98vw;
          height: 85vh;
          min-height: 620px;
          background: rgba(255, 255, 255, 0.96);
          border-radius: 14px;
          box-shadow: 0 25px 45px -12px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: -apple-system, 'SF Pro Text', 'SF Pro Display', 'BlinkMacSystemFont', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .titlebar {
          background: #fcfcfd;
          padding: 12px 16px 10px 16px;
          border-bottom: 1px solid #e2e5e9;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .traffic-lights { display: flex; gap: 8px; }
        .light { width: 12px; height: 12px; border-radius: 50%; }
        .close { background: #ff5f56; cursor: pointer;}
        .minimize { background: #ffbd2e; }
        .zoom { background: #27c93f; }
        .window-title {
          font-size: 13px;
          font-weight: 590;
          color: #1c1e22;
          background: #f0f2f5;
          padding: 4px 12px;
          border-radius: 28px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .toolbar {
          background: #ffffff;
          border-bottom: 1px solid #e8ecef;
          padding: 6px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .tool-btn {
          background: transparent;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #2c3e50;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: 0.1s;
        }
        .tool-btn:hover:not(:disabled) { background: #eef2f7; }
        .tool-btn:disabled { opacity: 0.5; cursor: default; }
        .toolbar-spacer { flex: 1; }
        .view-buttons {
          display: flex;
          gap: 4px;
          background: #f0f2f5;
          border-radius: 10px;
          padding: 2px;
        }
        .view-option {
          background: transparent;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #5f6c84;
        }
        .view-option.active {
          background: white;
          color: #0066cc;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .search-field {
          background: #f0f2f5;
          border-radius: 24px;
          padding: 5px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #8e949e;
        }
        .main-layout { display: flex; flex: 1; overflow: hidden; }
        .sidebar {
          width: 240px;
          background: #f9fafc;
          border-right: 1px solid #e8ecef;
          overflow-y: auto;
          padding: 18px 12px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .sidebar-section { display: flex; flex-direction: column; gap: 6px; }
        .sidebar-heading {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: #8e9aaf;
          letter-spacing: 0.5px;
          padding-left: 10px;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
        }
        .sidebar-item:hover { background: #edf2f7; }
        .sidebar-item.active { background: #e1e9f5; color: #0066cc; }
        .content-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #fff; }
        .path-bar {
          padding: 10px 20px;
          background: #fefefe;
          border-bottom: 1px solid #eef2f6;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #475569;
        }
        .path-item { cursor: pointer; }
        .path-item:hover { text-decoration: underline; color: #0066cc; }
        .file-grid { flex: 1; overflow-y: auto; padding: 20px; }
        .grid-view {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 120px));
          gap: 20px 16px;
        }
        .grid-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 12px 6px;
          border-radius: 12px;
          cursor: pointer;
        }
        .grid-item:hover { background: #f0f4fa; }
        .grid-item.selected { background: #e1e9f5; }
        .grid-name {
          font-size: 12px;
          font-weight: 470;
          word-break: break-word;
          max-width: 100%;
          color: #1e2a3e;
        }
        .list-view { display: flex; flex-direction: column; width: 100%; }
        .list-header {
          display: grid;
          grid-template-columns: 40px 3fr 1.5fr 1.2fr;
          padding: 10px 16px;
          background: #f8fafd;
          border-bottom: 1px solid #e8ecef;
          font-size: 12px;
          font-weight: 600;
          color: #5f6c84;
          position: sticky;
          top: 0;
        }
        .list-row {
          display: grid;
          grid-template-columns: 40px 3fr 1.5fr 1.2fr;
          padding: 12px 16px;
          align-items: center;
          border-bottom: 1px solid #f0f4f9;
          cursor: pointer;
        }
        .list-row:hover { background: #f8fafd; }
        .list-row.selected { background: #eef3fc; }
        .list-icon { font-size: 20px; text-align: center; }
        .list-name { font-weight: 500; font-size: 13px; }
        .list-date, .list-size { font-size: 12px; color: #6c7a91; }
        .empty-folder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: #9aa3b5;
          gap: 12px;
        }
        .footer-status {
          padding: 6px 16px;
          font-size: 11px;
          color: #8c9bb0;
          border-top: 1px solid #eef2f8;
          background: #fbfdff;
          display: flex;
          justify-content: space-between;
        }
        ::-webkit-scrollbar { width: 7px; height: 7px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
      `}</style>
    </div>
  );
};

export default Finder;