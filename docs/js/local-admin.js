(function () {
  "use strict";

  const isEditorOrigin = location.protocol === "http:"
    && location.hostname === "localhost"
    && location.port === "8080";

  async function available() {
    if (!isEditorOrigin) return false;
    try {
      const response = await fetch("../local-editor/index.html", {
        method: "HEAD",
        cache: "no-store"
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  function addNavigation() {
    const nav = document.querySelector(".site-header nav");
    if (!nav || nav.querySelector(".admin-nav-link")) return;
    const link = document.createElement("a");
    link.href = "../local-editor/";
    link.textContent = "編集画面";
    link.className = "admin-nav-link";
    nav.append(link);
  }

  function editLink(entry, label = "編集") {
    const link = document.createElement("a");
    link.href = `../local-editor/index.html?id=${encodeURIComponent(entry.id)}`;
    link.textContent = label;
    link.className = "admin-edit-link";
    link.setAttribute("aria-label", `「${entry.title}」を編集`);
    return link;
  }

  async function loadEntries() {
    if (!isEditorOrigin) return DictionaryData.loadEntries(false);
    const published = await DictionaryData.loadEntries(true);
    const saved = localStorage.getItem("sousakuGrammar.editor.v1.workspace");
    if (!saved) return published;
    let workspace;
    try {
      workspace = JSON.parse(saved);
      if (!Array.isArray(workspace) || workspace.some(entry => !entry || typeof entry.id !== "string")) {
        throw new Error("Invalid workspace");
      }
    } catch {
      throw new Error("保存済みの編集データを読み込めません。編集画面で作業データを確認してください。");
    }
    const merged = new Map(published.map(entry => [entry.id, entry]));
    workspace.forEach(entry => merged.set(entry.id, DictionaryData.normalizeEntry(entry)));
    return [...merged.values()];
  }

  function watchWorkspace() {
    if (!isEditorOrigin) return;
    window.addEventListener("pageshow", event => {
      if (event.persisted) location.reload();
    });
    window.addEventListener("storage", event => {
      if (event.key === "sousakuGrammar.editor.v1.workspace") location.reload();
    });
  }

  window.DictionaryLocalAdmin = { available, addNavigation, editLink, loadEntries, watchWorkspace };
})();
