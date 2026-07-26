(() => {
  "use strict";
  const entries = Array.isArray(window.LEGAL_ENGLISH_ENTRIES) ? window.LEGAL_ENGLISH_ENTRIES : [];
  const searchInput = document.querySelector("#searchInput");
  const weekFilter = document.querySelector("#weekFilter");
  const categoryFilter = document.querySelector("#categoryFilter");
  const clearButton = document.querySelector("#clearButton");
  const entryGrid = document.querySelector("#entryGrid");
  const emptyState = document.querySelector("#emptyState");
  const resultCount = document.querySelector("#resultCount");
  const lastUpdated = document.querySelector("#lastUpdated");

  const normalize = (value) => String(value ?? "").toLocaleLowerCase("zh-CN").trim();
  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function populateFilters() {
    [...new Set(entries.map((item) => item.week))].sort((a, b) => a - b).forEach((week) => {
      weekFilter.insertAdjacentHTML("beforeend", `<option value="${week}">第 ${week} 周</option>`);
    });
    [...new Set(entries.map((item) => item.category))].sort((a, b) => a.localeCompare(b, "zh-CN")).forEach((category) => {
      categoryFilter.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`);
    });
  }

  function searchableText(entry) {
    return normalize([
      entry.id, entry.titleZh, entry.titleEn, entry.category,
      entry.english, entry.chinese, entry.usage, ...(entry.keywords || [])
    ].join(" "));
  }

  function cardTemplate(entry) {
    const tags = (entry.keywords || []).slice(0, 6).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
    return `
      <article class="card">
        <div class="card-head">
          <div>
            <h2>${escapeHtml(entry.titleZh)}</h2>
            <p class="title-en">${escapeHtml(entry.titleEn)}</p>
          </div>
          <div>
            <span class="lesson-id">${escapeHtml(entry.id)}</span>
            <div class="category">${escapeHtml(entry.category)}</div>
          </div>
        </div>
        <div class="card-body">
          <div class="english-row">
            <p class="english" lang="en">${escapeHtml(entry.english)}</p>
            <button class="copy-button" type="button" data-copy="${escapeHtml(entry.english)}">复制英文</button>
          </div>
          <p class="chinese">${escapeHtml(entry.chinese)}</p>
          <p class="usage"><strong>适用场景：</strong>${escapeHtml(entry.usage)}</p>
          <div class="tags">${tags}</div>
        </div>
      </article>`;
  }

  function render() {
    const query = normalize(searchInput.value);
    const week = weekFilter.value;
    const category = categoryFilter.value;
    const filtered = entries.filter((entry) => {
      const queryMatches = !query || searchableText(entry).includes(query);
      const weekMatches = week === "all" || String(entry.week) === week;
      const categoryMatches = category === "all" || entry.category === category;
      return queryMatches && weekMatches && categoryMatches;
    });
    entryGrid.innerHTML = filtered.map(cardTemplate).join("");
    resultCount.textContent = `共 ${entries.length} 条，当前显示 ${filtered.length} 条`;
    emptyState.hidden = filtered.length !== 0;
    entryGrid.hidden = filtered.length === 0;
  }

  function showToast(message) {
    document.querySelector(".toast")?.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.append(toast);
    window.setTimeout(() => toast.remove(), 1600);
  }

  entryGrid.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-copy]");
    if (!button) return;
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      showToast("英文句子已复制");
    } catch {
      showToast("复制失败，请手动选择文本");
    }
  });
  [searchInput, weekFilter, categoryFilter].forEach((element) => element.addEventListener("input", render));
  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    weekFilter.value = "all";
    categoryFilter.value = "all";
    render();
    searchInput.focus();
  });

  populateFilters();
  render();
  lastUpdated.textContent = "数据库版本：已收录 W1-D1 至 W2-D2。";
})();
