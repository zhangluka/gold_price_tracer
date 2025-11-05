# 打包发布指南

本文档详细说明如何打包和发布黄金价格监控应用。

## 前置要求

### 所有平台
- Node.js 18+ 
- npm 或 yarn

### macOS 打包要求
- macOS 操作系统
- Xcode Command Line Tools（可选，用于代码签名）

### Windows 打包要求
- 在 macOS/Linux 上打包 Windows 应用需要安装 `wine`（可选）

### Linux 打包要求
- 可在任何平台打包

## 快速开始

### 1. 安装依赖
```bash
npm install
```

这会安装：
- `electron`: Electron 运行时
- `electron-builder`: 打包工具

### 2. 选择打包命令

#### 开发测试打包
```bash
npm run pack
```
- 快速打包，不生成安装包
- 输出到 `dist/mac-arm64` 或 `dist/mac`
- 用于本地测试

#### 生产环境打包

**macOS (推荐)**
```bash
npm run dist:mac
```
输出文件：
- `dist/黄金价格监控-1.0.0-arm64.dmg` (Apple Silicon)
- `dist/黄金价格监控-1.0.0.dmg` (Intel)
- `dist/黄金价格监控-1.0.0-arm64-mac.zip`
- `dist/黄金价格监控-1.0.0-mac.zip`

**Windows**
```bash
npm run dist:win
```
输出文件：
- `dist/黄金价格监控 Setup 1.0.0.exe`
- `dist/黄金价格监控-1.0.0-win.zip`

**Linux**
```bash
npm run dist:linux
```
输出文件：
- `dist/黄金价格监控-1.0.0.AppImage`
- `dist/黄金价格监控_1.0.0_amd64.deb`

**所有平台**
```bash
npm run dist
```
根据当前运行的操作系统自动选择目标平台。

## 添加应用图标

### 创建图标目录
```bash
mkdir build
```

### macOS 图标 (.icns)

1. 准备一张 1024x1024 的 PNG 图标
2. 使用在线工具或命令行转换为 `.icns` 格式：
   ```bash
   # 使用 iconutil (macOS 自带)
   mkdir icon.iconset
   sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
   sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
   sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
   sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
   sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
   sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
   sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
   sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
   sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
   sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
   iconutil -c icns icon.iconset -o build/icon.icns
   ```

3. 或使用在线工具：https://cloudconvert.com/png-to-icns

### Windows 图标 (.ico)

使用在线工具转换 PNG 到 ICO：
- https://convertio.co/png-ico/
- https://www.icoconverter.com/

保存为 `build/icon.ico`

### Linux 图标 (.png)

直接使用 512x512 或 1024x1024 的 PNG 文件：
```bash
cp icon.png build/icon.png
```

## 代码签名（macOS）

如果需要分发给其他用户，建议进行代码签名以避免安全警告。

### 1. 获取 Apple Developer 证书
- 注册 Apple Developer Program ($99/年)
- 在 Keychain Access 中导入开发者证书

### 2. 配置签名

在 `package.json` 的 `build.mac` 中添加：
```json
"mac": {
  "identity": "你的证书名称",
  "hardenedRuntime": true,
  "gatekeeperAssess": false,
  "entitlements": "build/entitlements.mac.plist",
  "entitlementsInherit": "build/entitlements.mac.plist"
}
```

### 3. 公证（Notarization）

在 `package.json` 中添加：
```json
"afterSign": "scripts/notarize.js"
```

详细配置参考：https://www.electron.build/code-signing

## 发布流程

### 1. 更新版本号
```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

### 2. 打包
```bash
npm run dist:mac
```

### 3. 测试
在 `dist/` 目录中测试生成的应用：
- 解压 .zip 文件
- 挂载 .dmg 文件
- 运行应用确保功能正常

### 4. 发布
将打包文件上传到：
- GitHub Releases
- 自己的网站
- App Store (需要额外配置)

## 常见问题

### Q: 打包失败，提示 "cannot find module"
```bash
# 清理缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

### Q: macOS 提示"应用已损坏"
这是因为应用未签名。解决方法：
```bash
# 临时允许运行
xattr -cr /Applications/黄金价格监控.app

# 或在系统设置 > 隐私与安全性中允许
```

### Q: 打包体积太大
electron-builder 会自动优化，但你可以：
- 移除不必要的依赖
- 启用 `asar` 打包（默认开启）
- 使用 `electronCompile` 压缩代码

### Q: 如何减少下载时间
使用镜像加速：
```bash
# 使用淘宝镜像
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
npm install
```

## 进阶配置

### 自动更新

使用 `electron-updater`：
```bash
npm install electron-updater
```

配置自动更新服务器，参考：https://www.electron.build/auto-update

### 多语言支持

在 `package.json` 中配置：
```json
"build": {
  "mac": {
    "target": {
      "target": "dmg",
      "arch": ["x64", "arm64"]
    }
  }
}
```

## 资源链接

- [electron-builder 官方文档](https://www.electron.build/)
- [Electron 代码签名指南](https://www.electronjs.org/docs/latest/tutorial/code-signing)
- [macOS 应用公证指南](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)

## 技术支持

如有问题，请提交 Issue 或参考 Electron 官方文档。

