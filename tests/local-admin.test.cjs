const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(
  path.join(__dirname, "..", "docs", "js", "local-admin.js"),
  "utf8"
);

function loadAdmin(hostname, port, fetchMock) {
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
    window: {}
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
