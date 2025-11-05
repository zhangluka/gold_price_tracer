# GitHub CI/CD 配置说明

本项目已配置完整的 GitHub Actions CI/CD 流水线，支持自动化构建和发布。

## 工作流说明

### 1. Build 工作流 (`.github/workflows/build.yml`)

- **触发条件**: 推送到 `main` 或 `master` 分支，或创建 PR
- **功能**: 在 Ubuntu 环境下构建所有平台的应用程序
- **构建平台**: 通过 electron-builder 的跨平台支持，在单一环境中构建 macOS、Windows、Linux
- **输出**: 构建产物上传为 artifacts，保留 30 天

### 2. Release 工作流 (`.github/workflows/release.yml`)

- **触发条件**: 推送版本标签 (如 `v1.0.0`)
- **功能**: 自动创建 GitHub 发布并上传所有平台的安装包
- **支持格式**:
  - macOS: `.zip` 文件 (x64 和 ARM64)
  - Windows: NSIS 安装程序 `.exe` 和 ZIP 包
  - Linux: AppImage 和 DEB 包

### 3. Build Matrix 工作流 (`.github/workflows/build-matrix.yml`)

- **触发条件**: 推送到 `main` 或 `master` 分支，或手动触发
- **功能**: 在各自平台的环境中并行构建，提高构建效率
- **优势**:
  - 更真实的平台环境
  - 并行构建加快总构建时间
  - 在 PR 中自动评论构建状态

## 使用方法

### 自动触发

1. **日常开发**: 推送到 `main` 分支会自动运行 Build 工作流
2. **版本发布**: 推送标签 `v1.0.0` 会触发 Release 工作流

```bash
# 创建版本标签并推送
git tag v1.0.0
git push origin v1.0.0
```

### 手动触发

在 GitHub 仓库的 "Actions" 标签页中，可以手动运行任何工作流。

## 构建产物

### Build 工作流产物位置

- GitHub Actions 运行页面的 "Artifacts" 部分
- 保留 30 天

### Release 发布产物

- GitHub 仓库的 "Releases" 页面
- 永久保存

## 支持的平台和格式

| 平台    | 格式                | 说明                       |
| ------- | ------------------- | -------------------------- |
| macOS   | `.dmg`, `.zip`      | 包含 x64 和 ARM64 架构     |
| Windows | `setup.exe`, `.zip` | NSIS 安装程序和便携版      |
| Linux   | `.AppImage`, `.deb` | 通用 AppImage 和 Debian 包 |

## 环境配置

### Node.js 版本

- 使用 Node.js 20.x
- 启用 npm 缓存加速依赖安装

### 电子构建器配置

- 利用 electron-builder 的跨平台构建能力
- 设置构建缓存提高构建速度

## 监控和调试

### 查看构建状态

1. 访问 GitHub 仓库的 "Actions" 标签页
2. 查看最近的工作流运行状态
3. 点击具体运行查看详细日志

### 常见问题

1. **构建失败**: 检查 Actions 日志中的错误信息
2. **依赖问题**: 确保 package.json 中的依赖版本兼容
3. **权限问题**: 检查 GitHub 仓库的访问权限

### 性能优化

- 使用 npm 缓存减少依赖安装时间
- 电子构建器缓存提高重复构建速度
- 并行构建不同平台加快总构建时间

## 安全考虑

- 使用 GitHub 提供的 `GITHUB_TOKEN` 进行发布
- 不在仓库中存储敏感信息
- 构建环境为隔离的 GitHub 托管运行器

## 后续维护

建议定期检查:

1. GitHub Actions 版本更新
2. Node.js 和 npm 版本兼容性
3. 电子构建器版本和配置
4. 构建时间和资源使用情况
