// background.js — service worker

const DEFAULT_TARGET_URL = "chrome-native://bookmarks/folder/10397"; // ← 你的书签文件夹

// ★ 单击扩展图标 → 直接打开设置页（Android 无右键菜单，必须用 onClicked）
chrome.action.onClicked.addListener((tab) => {
  chrome.runtime.openOptionsPage();
});

// 首次安装：初始化默认配置并打开设置页
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.local.get(["targetUrl", "redirectMode"], (cfg) => {
      if (!cfg.targetUrl) {
        chrome.storage.local.set({
          targetUrl: DEFAULT_TARGET_URL,
          redirectMode: "auto"
        });
      }
      chrome.runtime.openOptionsPage();
    });
  }
});
