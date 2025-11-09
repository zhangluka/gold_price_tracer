# 项目重构迁移指南

## 重构概述

项目已从单一功能应用（黄金价格监控）重构为**桌面应用合集**架构，支持集成多个独立应用。

## 主要变化

### 1. 架构变化

#### 重构前（旧版）
```
desktop_app/
├── src/
│   └── main.js          # 所有代码在一个文件中
└── package.json
```

#### 重构后（新版）
```
desktop_app/
├── src/
│   ├── main.js          # 主进程，管理启动器窗口
│   ├── preload.js       # 安全通信桥梁
│   ├── apps/            # 应用集合（模块化）
│   ├── common/          # 公共工具
│   └── ui/              # 用户界面
└── package.json
```

### 2. 功能变化

#### 重构前
- 单一功能：黄金价格监控
- 应用启动即开始监控
- 代码耦合度高，难以扩展

#### 重构后
- **启动器界面**：统一管理所有应用
- **模块化设计**：每个应用独立封装
- **按需启动**：用户选择启动哪些应用
- **易于扩展**：添加新应用只需几步

### 3. 代码结构变化

#### 原 main.js 功能拆分

| 原功能 | 新位置 |
|--------|--------|
| 黄金价格 API 调用 | `src/apps/gold-monitor/api.js` |
| 托盘管理 | `src/apps/gold-monitor/tray.js` |
| 应用配置 | `src/apps/gold-monitor/config.js` |
| 主逻辑 | `src/apps/gold-monitor/index.js` |
| 格式化工具 | `src/common/utils/format.js` |
| 日志输出 | `src/common/logger.js` |

### 4. 新增功能

#### 启动器界面
- 🎨 现代化 UI 设计
- 📱 应用卡片式展示
- ▶️ 可视化启动/停止控制
- 📊 实时显示应用运行状态

#### 应用管理
- 统一的应用注册机制
- 应用生命周期管理
- 多应用同时运行支持

#### 公共模块
- Logger: 统一日志输出
- Utils: 通用工具函数
- Constants: 全局常量管理

## 使用方式变化

### 重构前
```bash
npm start  # 直接启动黄金价格监控
```

### 重构后
```bash
npm start  # 打开启动器窗口
           # 在启动器中选择要运行的应用
```

## 兼容性说明

### 保留的功能
✅ 黄金价格监控的所有原有功能
✅ 托盘显示和菜单
✅ 价格涨跌闪烁提示
✅ 自动刷新
✅ 休眠/恢复处理

### 新增的功能
✨ 启动器界面（可关闭后台运行）
✨ 可视化应用管理
✨ 模块化架构
✨ 更好的错误处理和日志

### 变更的行为
⚠️ 应用不再自动启动，需要在启动器中手动启动
⚠️ 可以单独停止某个应用，无需退出整个程序

## 旧文件备份

原 `main.js` 已备份为 `src/main.js.backup`，如需恢复：

```bash
# 恢复旧版本（不推荐）
cd /Users/bobby/Projects/Github/zhangluka/desktop_app
rm src/main.js
mv src/main.js.backup src/main.js
rm -rf src/apps src/common src/ui src/preload.js
```

## 添加新应用示例

### 示例：添加一个天气监控应用

1. **创建应用目录**
```bash
mkdir -p src/apps/weather-monitor
```

2. **实现应用类** (`src/apps/weather-monitor/index.js`)
```javascript
const Logger = require('../../common/logger');

class WeatherMonitorApp {
  constructor() {
    this.logger = new Logger('Weather');
    this.isRunning = false;
  }

  async start() {
    this.logger.info('启动天气监控...');
    // 实现天气监控逻辑
    this.isRunning = true;
    this.logger.success('天气监控已启动');
  }

  stop() {
    this.logger.info('停止天气监控...');
    // 清理资源
    this.isRunning = false;
    this.logger.success('天气监控已停止');
  }

  getStatus() {
    return this.isRunning;
  }
}

module.exports = WeatherMonitorApp;
```

3. **注册应用** (在 `src/apps/index.js` 中)
```javascript
const WeatherMonitorApp = require('./weather-monitor');

const apps = [
  // ... 现有应用
  {
    id: 'weather-monitor',
    name: '天气监控',
    description: '实时显示天气信息',
    icon: '🌤️',
    type: 'tray',
    category: 'utility',
    instance: null,
    AppClass: WeatherMonitorApp,
  },
];
```

4. **重启应用**
```bash
npm start
```

## 开发建议

1. **模块化开发**：每个应用独立开发，互不影响
2. **使用公共模块**：充分利用 `common/` 中的工具
3. **统一日志**：使用 Logger 记录日志
4. **错误处理**：完善的 try-catch 和错误提示
5. **配置分离**：应用配置独立在 config.js 中

## 测试检查清单

- [x] 启动器窗口正常显示
- [x] 应用列表正确展示
- [x] 黄金价格监控可以启动
- [x] 托盘图标正常显示
- [x] 价格更新正常
- [x] 闪烁效果正常
- [x] 菜单功能正常
- [x] 可以停止应用
- [x] 关闭启动器后应用继续运行
- [x] 退出程序正确清理资源

## 问题排查

### Q: 启动器窗口无法打开？
A: 检查 `src/main.js` 和 `src/ui/launcher/` 文件是否完整。

### Q: 应用列表为空？
A: 检查 `src/apps/index.js` 中的应用注册是否正确。

### Q: 黄金价格监控无法启动？
A: 检查网络连接和 API 地址配置。

### Q: 如何恢复旧版本？
A: 参考上文"旧文件备份"部分。

## 技术支持

如有问题，请联系：
- Email: zhangluuka@gmail.com
- 提交 Issue 到项目仓库

---

**祝你使用愉快！** 🎉
