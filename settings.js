const defaultRedirects = [
    { from: "bing.com", to: "google.com" },
    { from: "duckduckgo.com", to: "google.com" },
    { from: "yahoo.com", to: "google.com" },
    { from: "baidu.com", to: "google.com" }
  ];
  
  function loadRedirects() {
    chrome.storage.sync.get(["redirects"], (result) => {
      let redirects = result.redirects || defaultRedirects;
      renderTable(redirects);
    });
  }
  
  function saveRedirects(redirects) {
    chrome.storage.sync.set({ redirects });
  }
  
  function renderTable(redirects) {
    const tbody = document.querySelector("#redirectTable tbody");
    tbody.innerHTML = "";
    redirects.forEach((rule, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="text" value="${rule.from}" data-idx="${idx}" data-type="from"></td>
        <td><input type="text" value="${rule.to}" data-idx="${idx}" data-type="to"></td>
        <td><button data-idx="${idx}" class="removeBtn">Remove</button></td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    loadRedirects();
  
    document.getElementById("addBtn").addEventListener("click", () => {
      const from = document.getElementById("newFrom").value.trim();
      const to = document.getElementById("newTo").value.trim();
      if (from && to) {
        chrome.storage.sync.get(["redirects"], (result) => {
          let redirects = result.redirects || defaultRedirects;
          redirects.push({ from, to });
          saveRedirects(redirects);
          renderTable(redirects);
          document.getElementById("newFrom").value = "";
          document.getElementById("newTo").value = "";
        });
      }
    });
  
    document.querySelector("#redirectTable tbody").addEventListener("input", (e) => {
      if (e.target.tagName === "INPUT") {
        const idx = e.target.dataset.idx;
        const type = e.target.dataset.type;
        chrome.storage.sync.get(["redirects"], (result) => {
          let redirects = result.redirects || defaultRedirects;
          redirects[idx][type] = e.target.value;
          saveRedirects(redirects);
        });
      }
    });
  
    document.querySelector("#redirectTable tbody").addEventListener("click", (e) => {
      if (e.target.classList.contains("removeBtn")) {
        const idx = e.target.dataset.idx;
        chrome.storage.sync.get(["redirects"], (result) => {
          let redirects = result.redirects || defaultRedirects;
          redirects.splice(idx, 1);
          saveRedirects(redirects);
          renderTable(redirects);
        });
      }
    });
  });