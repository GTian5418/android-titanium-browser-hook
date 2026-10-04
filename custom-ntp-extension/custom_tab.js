// custom_tab.js — NTP override entry
//
// 关键：chrome-native:// 和 chrome:// 是特权 scheme，
// 不能用 location.replace() / location.href 导航（Renderer 进程无权限，会被当搜索词）。
// 必须用 chrome.tabs.update() API，它走扩展系统 → 浏览器主进程，有权限加载内部页面。
//
// 策略：
//   1. 如果目标是特权 URL (chrome://, chrome-native://, about:) → chrome.tabs.update()
//   2. 如果是普通 http(s) URL → location.replace()（更轻量，无额外权限开销）
//   3. iframe 模式 → 内嵌（仅适用于普通网页）

const DEFAULT_URL = "chrome-native://bookmarks/folder/10397"; // ← 你的书签文件夹

// 判断是否为特权内部 URL（不能从网页 JS 直接导航）
function isPrivilegedUrl(url) {
  const lower = url.toLowerCase();
  return lower.startsWith("chrome://") ||
         lower.startsWith("chrome-native://") ||
         lower.startsWith("chrome-extension://") ||
         lower.startsWith("about:");
}

chrome.storage.local.get(["targetUrl", "redirectMode"], (cfg) => {
  const targetUrl = (cfg.targetUrl && cfg.targetUrl.trim()) || DEFAULT_URL;
  const mode = cfg.redirectMode || "auto"; // "auto" | "replace" | "href" | "iframe"

  if (mode === "iframe" && !isPrivilegedUrl(targetUrl)) {
    // 内嵌模式（仅普通网页，特权 URL 无法 iframe）
    document.body.innerHTML =
      '<iframe src="' + targetUrl + '" ' +
      'style="border:0;width:100vw;height:100vh;" ' +
      'allow="fullscreen; clipboard-write"></iframe>';
    return;
  }

  if (isPrivilegedUrl(targetUrl)) {
    // ★ 特权 URL：必须用 chrome.tabs.update() 走浏览器主进程
    //   location.replace("chrome-native://...") 会失败 → 变成搜索
    console.log("[CustomNTP] Privileged URL, using chrome.tabs.update():", targetUrl);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { url: targetUrl }, () => {
          if (chrome.runtime.lastError) {
            // tabs.update 失败（可能权限不足），回退到 location.replace
            console.warn("[CustomNTP] tabs.update failed:", chrome.runtime.lastError.message);
            window.location.replace(targetUrl);
          }
        });
      } else {
        window.location.replace(targetUrl);
      }
    });
  } else {
    // 普通网页 URL
    if (mode === "href") {
      window.location.href = targetUrl;
    } else {
      // "auto" 或 "replace"：默认用 replace
      window.location.replace(targetUrl);
    }
  }
});
