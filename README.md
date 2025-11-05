# electron-gold

macOS 托盘黄金实时价格查看工具，基于 Electron 构建。

## 功能概述

- 应用启动后隐藏主窗口，仅常驻托盘显示。
- 托盘标题即时展示黄金现货价（美元）。
- 鼠标悬停可查看最近一次更新时间。
- 右键菜单可手动刷新或退出应用。
- 每 60 秒自动刷新一次价格。

## 快速开始

```bash
npm install
npm start
```

首次启动会下载 Electron 二进制文件，请保持网络畅通。

## 打包发布

### 安装依赖

```bash
npm install
```

### 打包命令

```bash
# 打包当前平台（不生成安装包，仅用于测试）
npm run pack

# 打包所有支持的平台
npm run dist

# 仅打包 macOS（生成 .dmg 和 .zip）
npm run dist:mac

# 仅打包 Windows（生成 .exe 安装程序）
npm run dist:win

# 仅打包 Linux（生成 AppImage 和 .deb）
npm run dist:linux
```

打包完成后，文件将输出到 `dist/` 目录。

### macOS 打包说明

- **支持架构**：Intel (x64) 和 Apple Silicon (arm64)
- **输出格式**：
  - `.dmg` - macOS 安装镜像（推荐分发）
  - `.zip` - 压缩包格式
- **应用签名**：如需发布到 App Store 或进行代码签名，需要配置 Apple Developer 证书

### 图标文件（可选）

为了更好的用户体验，建议添加应用图标：

1. 创建 `build/` 目录
2. 放置图标文件：
   - macOS: `build/icon.icns` (512x512 或更高)
   - Windows: `build/icon.ico` (256x256 或更高)
   - Linux: `build/icon.png` (512x512 或更高)

如果没有图标文件，electron-builder 会使用默认图标。

## 技术要点

- Electron 39（包含 Node.js 20+，原生支持 `fetch`）。
- 从 `https://api.metals.live/v1/spot` 获取黄金现货价，若接口不可用则保留上次成功值。
- 托盘图标使用透明像素，仅显示文本标题，适配浅色/深色模式。

## 目录结构

```
electron-gold/
├── package.json
├── README.md
├── src/
│   └── main.js
├── .gitignore
└── node_modules/
```

## 常见问题

- 若自动刷新失效，请检查网络连接是否可访问 `api.metals.live`。
- 若想修改刷新频率或数据来源，可在 `src/main.js` 中调整常量 `UPDATE_INTERVAL` 和 `GOLD_API_URL`。
