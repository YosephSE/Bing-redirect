const defaultRedirects = [
  { from: "bing.com", to: "google.com" },
  { from: "duckduckgo.com", to: "google.com" },
  { from: "yahoo.com", to: "google.com" },
  { from: "baidu.com", to: "google.com" },
];

function showStatus(message, type = "success") {
  const statusEl = document.getElementById("statusMessage");
  statusEl.textContent = message;
  statusEl.className = `status-message status-${type} show`;

  setTimeout(() => {
    statusEl.classList.remove("show");
  }, 3000);
}

function loadRedirects() {
  chrome.storage.sync.get(["redirects"], (result) => {
    let redirects = result.redirects || defaultRedirects;
    renderTable(redirects);
  });
}

function saveRedirects(redirects) {
  chrome.storage.sync.set({ redirects }, () => {
    if (chrome.runtime.lastError) {
      showStatus("Failed to save settings", "error");
    } else {
      showStatus("Settings saved successfully", "success");
    }
  });
}

function renderTable(redirects) {
  const tbody = document.querySelector("#redirectTable tbody");
  tbody.innerHTML = "";

  if (redirects.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3">
          <div class="empty-state">
            <p>No redirects configured yet</p>
            <p>Add your first redirect below to get started!</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  redirects.forEach((rule, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <input type="text" value="${rule.from}" data-idx="${idx}" data-type="from" placeholder="e.g., bing.com">
      </td>
      <td>
        <input type="text" value="${rule.to}" data-idx="${idx}" data-type="to" placeholder="e.g., google.com">
      </td>
      <td>
        <button data-idx="${idx}" class="btn btn-danger removeBtn">
          🗑️ Remove
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function setLoadingState(loading) {
  const btn = document.getElementById("addBtn");
  const btnText = btn.querySelector(".btn-text");
  const loadingSpinner = btn.querySelector(".loading");

  if (loading) {
    btn.disabled = true;
    btnText.style.display = "none";
    loadingSpinner.style.display = "inline-block";
  } else {
    btn.disabled = false;
    btnText.style.display = "inline";
    loadingSpinner.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadRedirects();

  document.getElementById("addBtn").addEventListener("click", () => {
    const from = document.getElementById("newFrom").value.trim();
    const to = document.getElementById("newTo").value.trim();

    if (!from || !to) {
      showStatus("Please fill in both fields", "error");
      return;
    }

    // Basic validation
    if (!from.includes(".") || !to.includes(".")) {
      showStatus("Please enter valid domain names (e.g., bing.com)", "error");
      return;
    }

    setLoadingState(true);

    chrome.storage.sync.get(["redirects"], (result) => {
      let redirects = result.redirects || defaultRedirects;

      // Check for duplicates
      if (redirects.some((r) => r.from === from)) {
        showStatus("A redirect for this domain already exists", "error");
        setLoadingState(false);
        return;
      }

      redirects.push({ from, to });
      saveRedirects(redirects);
      renderTable(redirects);

      // Clear form
      document.getElementById("newFrom").value = "";
      document.getElementById("newTo").value = "";

      setLoadingState(false);
      showStatus("Redirect added successfully", "success");
    });
  });

  // Handle Enter key in input fields
  document.getElementById("newFrom").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      document.getElementById("newTo").focus();
    }
  });

  document.getElementById("newTo").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      document.getElementById("addBtn").click();
    }
  });

  document
    .querySelector("#redirectTable tbody")
    .addEventListener("input", (e) => {
      if (e.target.tagName === "INPUT") {
        const idx = parseInt(e.target.dataset.idx);
        const type = e.target.dataset.type;

        chrome.storage.sync.get(["redirects"], (result) => {
          let redirects = result.redirects || defaultRedirects;
          if (redirects[idx]) {
            redirects[idx][type] = e.target.value;
            saveRedirects(redirects);
          }
        });
      }
    });

  document
    .querySelector("#redirectTable tbody")
    .addEventListener("click", (e) => {
      if (e.target.classList.contains("removeBtn")) {
        const idx = parseInt(e.target.dataset.idx);

        chrome.storage.sync.get(["redirects"], (result) => {
          let redirects = result.redirects || defaultRedirects;
          const removedRule = redirects[idx];
          redirects.splice(idx, 1);
          saveRedirects(redirects);
          renderTable(redirects);
          showStatus(
            `Removed redirect: ${removedRule.from} → ${removedRule.to}`,
            "success"
          );
        });
      }
    });
});
