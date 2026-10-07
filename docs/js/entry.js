(async function () {
  "use strict";
  const host = document.getElementById("entryDetail");
  try {
    const hasAdmin = await DictionaryLocalAdmin.available();
    if (hasAdmin) {
      DictionaryLocalAdmin.addNavigation();
      DictionaryLocalAdmin.watchWorkspace();
    }
    const entries = hasAdmin
      ? await DictionaryLocalAdmin.loadEntries()
      : await DictionaryData.loadEntries(false);
    const id = new URLSearchParams(location.search).get("id");
    const entry = entries.find(item => item.id === id);
    if (!entry) throw new Error("指定された公開項目は見つかりませんでした。");

    host.replaceChildren(DictionaryRender.entryDetail(entry));
    if (hasAdmin) {
      host.querySelector("h1").after(DictionaryLocalAdmin.editLink(entry, "この語を編集"));
    }
    document.title = `${entry.title} | 創作文法辞典`;

    const related = [...new Set([
      ...(entry.related_ids || []),
      ...entries
        .filter(item => item.id !== entry.id && item.tags.some(tag => entry.tags.includes(tag)))
        .map(item => item.id)
    ])]
      .map(relatedId => entries.find(item => item.id === relatedId))
      .filter(Boolean)
      .slice(0, 3);

    if (related.length) {
      const cards = related.map(item => {
        const card = DictionaryRender.entryCard(item);
        if (hasAdmin) card.append(DictionaryLocalAdmin.editLink(item));
        return card;
      });
      document.getElementById("relatedEntries").append(...cards);
      document.getElementById("relatedSection").hidden = false;
    }
  } catch (error) {
    host.replaceChildren(
      DictionaryRender.el("h1", null, "項目を見つけられません"),
      DictionaryRender.el("p", null, error.message),
      DictionaryRender.link("index.html", "辞典へ戻る", "primary-button inline")
    );
  }
})();
