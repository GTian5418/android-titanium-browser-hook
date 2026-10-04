// options.js — settings page logic

const $url = document.getElementById("url");
const $mode = document.getElementById("mode");
const $status = document.getElementById("status");
const $warn = document.getElementById("warn");

function isPrivilegedUrl(url) {
  const lower = url.toLowerCase();
  return lower.startsWith("chrome://") ||
         lower.startsWith("chrome-native://") ||
         lower.startsWith("chrome-extension://") ||
         lower.startsWith("about:");
}

function updateWarning() {
  const url = $url.value.trim();
  const mode = $mode.value;
  // 特权 URL + 非 auto/非 iframe → 警告
  if (isPrivilegedUrl(url) && (mode === "replace" || mode === "href")) {
    $warn.style.display = "block";
  } else if (isPrivilegedUrl(url) && mode === "iframe") {
    $warn.textContent = "⚠ iframe 模式不支持 chrome-native:// 内部 URL！请选 auto。";
    $warn.style.display = "block";
  } else {
    $warn.style.display = "none";
  }
}

// Load current config
chrome.storage.local.get(["targetUrl", "redirectMode"], (cfg) => {
  $url.value = cfg.targetUrl || "chrome-native://bookmarks/folder/10397";
  $mode.value = cfg.redirectMode || "auto";
  updateWarning();
});

$url.addEventListener("input", updateWarning);
$mode.addEventListener("change", updateWarning);

document.getElementById("save").addEventListener("click", () => {
  let url = $url.value.trim();
  if (!url) {
    $status.textContent = "URL 不能为空";
    return;
  }
  // 普通网址自动加 https://，但内部 URL (chrome://, chrome-native://) 不加
  if (!isPrivilegedUrl(url) &&
      !url.startsWith("http://", true) && !url.startsWith("https://", true)) {
    url = "https://" + url;
    $url.value = url;
  }
  chrome.storage.local.set({ targetUrl: url, redirectMode: $mode.value }, () => {
    $status.textContent = "已保存 ✓  打开新标签页测试效果";
    updateWarning();
  });
});
