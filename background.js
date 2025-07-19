const SEARCH_ENGINES = [
    { from: "bing.com", to: "google.com" },
    { from: "duckduckgo.com", to: "google.com" },
    { from: "yahoo.com", to: "google.com" },
    { from: "baidu.com", to: "google.com" }
  ];
  
  function makeRule(id, from, to) {
    return {
      id,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          regexSubstitution: `https://${to}/search?q=\\1`
        }
      },
      condition: {
        regexFilter: `^https://www\\.${from}/search\\?q=([^&]+)`,
        resourceTypes: ["main_frame"]
      }
    };
  }
  
  async function updateRules() {
    const { redirects } = await chrome.storage.sync.get("redirects");
    const rules = (redirects || SEARCH_ENGINES).map((r, i) =>
      makeRule(i + 1, r.from, r.to)
    );
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map((r) => r.id),
      addRules: rules
    });
  }
  
  chrome.runtime.onInstalled.addListener(updateRules);
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.redirects) updateRules();
  });