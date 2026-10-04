const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(
  path.join(__dirname, "..", "docs", "js", "local-admin.js"),
  "utf8"
);

function loadAdmin(hostname, port, fetchMock, extra = {}) {
  const links = [];
  const nav = {
    querySelector: () => links.find(link => link.className === "admin-nav-link"),
    append: link => links.push(link)
  };
  const context = {
    location: { protocol: "http:", hostname, port },
    fetch: fetchMock,
    document: {
      querySelector: selector => selector === ".site-header nav" ? nav : null,
      createElement: () => ({ setAttribute(name, value) { this[name] = value; } })
    },
    window: {},
    ...extra
  };
  vm.runInNewContext(source, context);
  return { admin: context.window.DictionaryLocalAdmin, links };
}

test("localhost:8080 shows entry-specific edit links", async () => {
  const calls = [];
  const { admin, links } = loadAdmin("localhost", "8080", async (url, options) => {
    calls.push({ url, method: options.method });
    return { ok: true };
  });
  assert.equal(await admin.available(), true);
  assert.deepEqual(calls, [{ url: "../local-editor/index.html", method: "HEAD" }]);
  admin.addNavigation();
  admin.addNavigation();
  assert.equal(links.length, 1);
  assert.equal(links[0].href, "../local-editor/");
  const edit = admin.editLink({ id: "sample-entry", title: "見本" });
  assert.equal(edit.href, "../local-editor/index.html?id=sample-entry");
  assert.equal(edit["aria-label"], "「見本」を編集");
});

test("public hostname never checks or shows the editor", async () => {
  const { admin } = loadAdmin("rustlejp.github.io", "", () => {
    throw new Error("public page must not request the local editor");
  });
  assert.equal(await admin.available(), false);
});

test("local reader combines saved edits and drafts with newer JSON entries without changing storage", async () => {
  const published = [{ id: "edited", title: "以前の本文", status: "published" }, { id: "newer-json", title: "追加済みの語", status: "published" }];
  const saved = JSON.stringify([{ id: "edited", title: "編集後の本文", status: "published" }, { id: "draft", title: "下書き", status: "draft" }]);
  const { admin } = loadAdmin("localhost", "8080", null, {
    localStorage: { getItem: () => saved, setItem: () => { throw Error("Must not alter saved work"); } },
    DictionaryData: { loadEntries: async () => published, normalizeEntry: entry => entry }
  });
  const entries = await admin.loadEntries();
  assert.equal(entries.length, 3);
  assert.equal(entries.find(entry => entry.id === "edited").title, "編集後の本文");
  assert.equal(entries.find(entry => entry.id === "draft").status, "draft");
  assert.ok(entries.some(entry => entry.id === "newer-json"));
});

test("public reader never reads editor storage or includes drafts", async () => {
  const published = [{ id: "public", title: "公開本文" }];
  const { admin } = loadAdmin("rustlejp.github.io", "", null, {
    localStorage: { getItem: () => { throw Error("Public reader must not access editor storage"); } },
    DictionaryData: { loadEntries: async includePrivate => { assert.equal(includePrivate, false); return published; } }
  });
  assert.equal(await admin.loadEntries(), published);
});

test("returning from cached history or editing in another tab refreshes the local reader", () => {
  const events = {};
  let reloads = 0;
  const { admin } = loadAdmin("localhost", "8080", null, {
    location: { protocol: "http:", hostname: "localhost", port: "8080", reload: () => reloads++ },
    window: { addEventListener: (event, handler) => { events[event] = handler; } }
  });
  admin.watchWorkspace();
  events.pageshow({ persisted: false });
  events.storage({ key: "other" });
  assert.equal(reloads, 0);
  events.pageshow({ persisted: true });
  events.storage({ key: "sousakuGrammar.editor.v1.workspace" });
  assert.equal(reloads, 2);
});
