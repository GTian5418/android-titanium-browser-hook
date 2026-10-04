# Android Titanium Browser Hook

> 自定义 **Helium / Titanium Browser**（`io.github.jqssun.helium`，基于 Chromium 154）的新标签页（NTP）跳转目标。

提供两种独立方案，可单独使用或组合使用：

| 方案 | 路径 | 需要 Root | 原理 | 适用场景 |
|------|------|-----------|------|----------|
| **一：浏览器扩展** | [`custom-ntp-extension/`](custom-ntp-extension/) | 否 | `chrome_url_overrides.newtab`（浏览器原生支持） | 推荐，最简单 |
| **二：LSPosed 模块** | [`custom-ntp-lsp/`](custom-ntp-lsp/) | 是 | Hook `LoadUrlParams` 构造函数替换 URL | 扩展不生效或需要底层拦截 |

---

## 方案一：浏览器扩展（无需 Root）

Helium 的 `patch.sh` 已启用 `kChromeNativeUrlOverriding`，原生支持 `chrome_url_overrides.newtab`。

### 安装

1.  在 Helium 地址栏输入 `chrome://extensions/`
2.  右上角开启 **开发者模式**
3.  点击 **加载已解压的扩展程序**，选择 `custom-ntp-extension` 文件夹
4.  点击扩展图标 → **选项**，填入目标 URL，保存

详见 [`custom-ntp-extension/README.md`](custom-ntp-extension/README.md)。

---

## 方案二：LSPosed 模块（需要 Root + LSPosed）

Hook `org.chromium.content_public.browser.LoadUrlParams(int, String)` 构造函数，拦截 NTP URL（`chrome-native://newtab/`）替换为自定义 URL。

### 快速开始

1.  编译 APK（见 [`custom-ntp-lsp/编译教程.md`](custom-ntp-lsp/编译教程.md)）：
    ```powershell
    cd custom-ntp-lsp
    $env:JAVA_HOME = "D:\DevTools\Java\jdk-17"
    .\gradlew.bat assembleDebug
    ```
2.  安装到设备：
    ```powershell
    adb install -r app\build\outputs\apk\debug\app-debug.apk
    ```
3.  在 **LSPosed Manager** 中启用模块，作用域勾选 `io.github.jqssun.helium`
4.  打开模块配置页，填入目标 URL（如 `chrome-native://bookmarks/folder/10397`）
5.  强制停止 Helium，重新打开 → 新建标签页自动跳转

### 技术要点

-   使用 **libxposed API 102**（现代 LSPosed API），非传统 Xposed API 82
-   Hook `Activity.onCreate` 获取 Chromium ClassLoader，再加载 `LoadUrlParams`
-   用 `chain.proceed(newArgs)` 替换参数（`chain.args` 不可修改）
-   `ExceptionMode.PROTECTIVE` 防止 hook 异常导致浏览器崩溃

详见 [`custom-ntp-lsp/README.md`](custom-ntp-lsp/README.md) 和 [`custom-ntp-lsp/编译教程.md`](custom-ntp-lsp/编译教程.md)。

---

## 目录结构

```
android-titanium-browser-hook/
├── README.md                       # 本文件
├── .gitignore
├── custom-ntp-extension/           # 方案一：浏览器扩展
│   ├── manifest.json               # MV3, chrome_url_overrides.newtab
│   ├── custom_tab.html / .js       # NTP 入口页
│   ├── options.html / .js          # 配置页
│   ├── background.js               # Service Worker
│   └── icons/
└── custom-ntp-lsp/                 # 方案二：LSPosed 模块
    ├── 编译教程.md                 # 从零编译的完整教程
    ├── README.md                   # 模块说明
    ├── build.gradle                # AGP 8.5.2 / Kotlin 1.9.24
    ├── settings.gradle             # 腾讯云镜像 + maven 源
    ├── gradle.properties
    ├── gradlew / gradlew.bat       # Gradle 8.9 包装器（已自带）
    ├── gradle/wrapper/
    └── app/
        ├── build.gradle            # libxposed:api:102 / compileSdk 35
        └── src/main/
            ├── AndroidManifest.xml
            ├── java/com/example/customntp/
            │   ├── Main.kt         # Hook 入口（XposedModule 子类）
            │   └── ConfigActivity.kt
            ├── res/                # 布局、字符串、图标
            └── resources/META-INF/xposed/
                ├── java_init.list  # 入口类声明
                ├── module.prop     # API 102 元数据
                └── scope.list      # 默认作用域
```

---

## 环境要求（LSP 模块编译）

| 组件 | 版本 |
|------|------|
| JDK | 17（必须） |
| Android SDK | Platform 35 + Build-Tools 35.0.0 |
| Gradle | 8.9（包装器已自带，无需单独装） |
| AGP | 8.5.2 |
| Kotlin | 1.9.24 |
| libxposed API | 102.0.0 |

---

## 目标浏览器

-   **包名**：`io.github.jqssun.helium`
-   **内核**：Chromium 154.0.8037.92
-   **反编译确认**：`LoadUrlParams` 类名未混淆，NTP URL = `chrome-native://newtab/`

---

## License

自用项目，仅供参考。
