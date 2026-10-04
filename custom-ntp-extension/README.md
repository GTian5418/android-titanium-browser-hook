# Custom New Tab Page for Helium / Titanium Browser

> **方案一：Chrome Extension**（推荐，浏览器原生支持）

## 原理

Helium / Titanium Browser (`io.github.jqssun.helium`) 基于 Chromium，其 `patch.sh` 中有专门的 NTP override 补丁：

```bash
# ext: ntp
sed -i 's|if (isTabNtp && !currentTab.isNativePage() && !isTabWebUiNtp) {|if (isTabNtp && !currentTab.isNativePage() && !isTabWebUiNtp && !UrlOverrideUtils.isNtpOverrideEnabled()) {|' \
  chrome/android/java/src/org/chromium/chrome/browser/ChromeTabbedActivity.java
```

同时启用了 `kChromeNativeUrlOverriding` feature。这意味着浏览器**已显式支持** `chrome_url_overrides.newtab`，扩展方式是官方支持的路径，无需 root、无需 LSPosed。

## 文件结构

```
custom-ntp-extension/
├── manifest.json        # MV3, chrome_url_overrides.newtab → custom_tab.html
├── custom_tab.html      # NTP 入口页（显示 loading）
├── custom_tab.js        # 读取配置并跳转到目标 URL
├── options.html         # 设置页
├── options.js           # 设置页逻辑
├── background.js        # Service Worker，首次安装初始化配置
└── icons/               # 16/48/128 px 图标
```

## 安装方法

### 方式 A：加载未打包扩展（开发调试）

1. 在 Helium 浏览器地址栏输入 `chrome://extensions/`
2. 右上角开启 **开发者模式 (Developer mode)**
3. 点击 **加载已解压的扩展程序 (Load unpacked)**
4. 选择 `custom-ntp-extension` 文件夹

### 方式 B：打包成 .crx

```bash
# 在桌面 Chrome 中打包，或直接 zip 后改名为 .crx
# Helium 支持离线安装 .crx（patch.sh 中 off-store install 已放行）
```

## 配置

1. 安装后点击扩展图标 → **选项 (Options)**
2. 填入目标 URL（如 `https://your-nav-site.com`）
3. 选择跳转方式：
   - **replace**（推荐）：`location.replace()`，按返回键直接退出标签
   - **href**：`location.href`，按返回键回到空白 NTP
   - **iframe**：内嵌目标页，保持在扩展页内（部分网站有 X-Frame-Options 会拒绝）
4. 保存，打开新标签页即可看到效果

## 默认 URL

如未配置，默认跳转 `https://www.bing.com`。修改 `custom_tab.js` 中的 `DEFAULT_URL` 可更改默认值。
