# 项目目录结构

## 整体结构

```
desktop_app/
├── src/                        # 源代码目录
│   ├── main.js                 # 主进程入口
│   ├── preload.js              # 预加载脚本（安全隔离）
│   │
│   ├── apps/                   # 应用集合（功能模块）
│   │   ├── index.js            # 应用注册中心
│   │   │
│   │   └── gold-monitor/       # 黄金价格监控应用
│   │       ├── index.js        # 应用主逻辑
│   │       ├── tray.js         # 托盘管理
│   │       ├── api.js          # API 调用
│   │       └── config.js       # 应用配置
│   │
│   ├── common/                 # 公共模块
│   │   ├── logger.js           # 统一日志工具
│   │   ├── constants.js        # 全局常量
│   │   └── utils/              # 工具函数
│   │       └── format.js       # 格式化工具（价格、时间等）
│   │
│   ├── ui/                     # UI 界面
│   │   └── launcher/           # 启动器界面
│   │       ├── index.html      # 主页面
│   │       ├── style.css       # 样式表
│   │       └── renderer.js     # 渲染进程脚本
│   │
│   └── assets/                 # 静态资源
│       └── icons/              # 图标资源
│
├── build/                      # 构建资源（图标等）
├── dist/                       # 打包输出目录
├── node_modules/               # 依赖包
│
├── package.json                # 项目配置
├── package-lock.json           # 依赖锁定
├── README.md                   # 项目说明
└── PROJECT_STRUCTURE.md        # 本文件
```

## 模块说明

### 主进程 (src/main.js)

- 应用初始化和生命周期管理
- 创建启动器窗口
- 设置 IPC 通信处理器
- 管理应用的启动和停止

### 预加载脚本 (src/preload.js)

- 为渲染进程提供安全的 API 接口
- 使用 `contextBridge` 隔离主进程和渲染进程
- 暴露必要的应用控制方法

### 应用模块 (src/apps/)

#### 应用注册中心 (index.js)
- 管理所有可用应用
- 提供应用的启动、停止、查询接口
- 维护应用实例的生命周期

#### 黄金价格监控 (gold-monitor/)
- **index.js**: 应用主逻辑，协调各个组件
- **tray.js**: 系统托盘管理，显示价格和菜单
- **api.js**: 黄金价格 API 调用
- **config.js**: 应用配置（刷新间隔、API 地址等）

### 公共模块 (src/common/)

#### Logger (logger.js)
- 统一的日志输出工具
- 支持不同级别：info、success、error、warn、debug
- 带时间戳和模块名称

#### Constants (constants.js)
- 全局常量配置
- 应用信息、窗口配置、应用类型等

#### Utils (utils/)
- **format.js**: 格式化工具函数
  - 价格格式化
  - 时间格式化
  - 日期时间格式化

### UI 界面 (src/ui/)

#### 启动器 (launcher/)
- **index.html**: 主界面结构
- **style.css**: 现代化样式设计
- **renderer.js**: 渲染进程逻辑
  - 加载应用列表
  - 处理应用启动/停止
  - 实时更新应用状态

## 设计模式

### 1. 模块化设计
每个应用都是独立的模块，可以单独开发、测试和维护。

### 2. 发布-订阅模式
主进程和渲染进程通过 IPC 通信，实现松耦合。

### 3. 单例模式
应用实例在注册中心统一管理，避免重复创建。

### 4. 工厂模式
应用注册中心负责创建和管理应用实例。

## 扩展指南

### 添加新应用

1. 在 `src/apps/` 创建新的应用文件夹
2. 实现必要的接口：`start()`, `stop()`, `getStatus()`
3. 在 `src/apps/index.js` 注册新应用
4. 重启应用即可在启动器中看到

### 添加公共工具

1. 在 `src/common/utils/` 创建新的工具文件
2. 导出工具函数
3. 在需要的地方引入使用

## 技术栈

- **Electron 39**: 桌面应用框架
- **Node.js 20+**: 运行时环境
- **原生 JavaScript**: 无额外前端框架
- **CSS3**: 现代化样式

## 开发建议

1. 遵循模块化原则，保持代码清晰
2. 使用统一的 Logger 记录日志
3. 完善的错误处理
4. 每个应用独立封装，互不干扰
5. 公共代码放在 common 目录
