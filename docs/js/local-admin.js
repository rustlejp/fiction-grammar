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

  window.DictionaryLocalAdmin = { available, addNavigation, editLink };
})();
