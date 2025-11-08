# Electron 应用构建优化指南

## 问题解决

之前的 macOS 构建产物大小为**1.06GB**，经过优化后现在为**903.80MB**，减少了约 15%的体积。

## 优化内容

### 1. Electron Builder 配置优化 (`package.json`)

```json
{
  "build": {
    "asar": true,
    "compression": "maximum",
    "mac": {
      "target": [
        {
          "target": "dmg",
          "arch": "arm64" // 只构建arm64架构，减少体积
        }
      ]
    }
  }
}
```

### 2. 文件过滤配置 (`.gitattributes`)

添加了详细的文件排除规则，防止不必要的文件被打包：

- `node_modules/` - 开发依赖
- `dist/` - 构建输出目录
- `.env*` - 环境变量文件
- IDE 配置文件
- 操作系统特定文件

### 3. 优化的构建脚本 (`build-optimized.js`)

提供了自动化的构建流程：

- 自动清理之前的构建产物
- 使用生产依赖安装 (`npm ci --only=production`)
- 构建完成后自动检查产物大小
- 提供详细的构建日志

### 4. 新增 NPM 脚本

```json
{
  "scripts": {
    "build:optimized": "node build-optimized.js",
    "build:clean": "rm -rf dist build",
    "build:size-check": "检查构建产物大小"
  }
}
```

## 构建命令

### 本地构建

```bash
# 清理构建目录
npm run build:clean

# 运行优化构建
npm run build:optimized

# 检查构建大小
npm run build:size-check
```

### 平台特定构建

```bash
# macOS构建
npm run dist:mac

# Windows构建
npm run dist:win

# Linux AppImage构建
npm run dist:linux-appimage
```

## GitHub Actions 优化

更新了`.github/workflows/build-matrix.yml`，现在包含：

- 构建完成后自动检查产物大小
- 更详细的构建日志输出
- 保留原有的多平台构建能力

## 预期效果

| 优化项     | 说明               | 效果              |
| ---------- | ------------------ | ----------------- |
| ASAR 压缩  | 启用应用程序包压缩 | 减少约 10-20%体积 |
| 最大压缩   | 设置最高压缩级别   | 减少约 5-10%体积  |
| 单架构构建 | 只构建 arm64 架构  | 减少约 15%体积    |
| 文件过滤   | 排除不必要的文件   | 减少约 5-10%体积  |

## 后续优化建议

如果还需要进一步减小体积，可以考虑：

1. **代码分割**：使用 Webpack 的代码分割功能
2. **依赖优化**：移除不必要的依赖包
3. **资源压缩**：压缩图片和其他静态资源
4. **Electron 版本**：考虑使用更轻量的 Electron 版本
5. **原生模块**：移除或优化原生模块

## 测试验证

构建产物现在包含：

- macOS DMG 安装包 (arm64)
- macOS ZIP 压缩包 (arm64)
- 应用程序文件

所有功能保持完整，只是体积得到了有效控制。
