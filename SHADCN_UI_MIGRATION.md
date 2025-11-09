# shadcn/ui 重构完成文档

## 🎉 重构完成

项目前端已成功从原生 HTML/CSS 重构为基于 **React + Vite + Tailwind CSS + shadcn/ui** 的现代化技术栈。

## ✨ 新技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.0 | UI 框架 |
| Vite | 6.4.1 | 构建工具 |
| Tailwind CSS | 4.1.17 | CSS 框架 |
| shadcn/ui | - | UI 组件库 |
| Electron | 39.0.0 | 桌面应用框架 |

## 📂 新的项目结构

```
desktop_app/
├── src/
│   ├── main.js                      # Electron 主进程
│   ├── preload.js                   # 预加载脚本
│   ├── apps/                        # 应用模块（保持不变）
│   ├── common/                      # 公共工具（保持不变）
│   └── renderer/                    # React 渲染进程 ✨ 新增
│       ├── main.jsx                 # React 入口
│       ├── App.jsx                  # 主应用组件
│       ├── index.css                # Tailwind 样式
│       ├── components/              # React 组件
│       │   ├── AppCard.jsx          # 应用卡片组件
│       │   └── ui/                  # shadcn/ui 组件
│       │       ├── card.jsx         # Card 组件
│       │       ├── button.jsx       # Button 组件
│       │       └── badge.jsx        # Badge 组件
│       └── lib/
│           └── utils.js             # 工具函数（cn）
├── index.html                       # HTML 入口
├── vite.config.mjs                  # Vite 配置
├── tailwind.config.mjs              # Tailwind 配置
├── postcss.config.mjs               # PostCSS 配置
└── package.json                     # 依赖配置

```

## 🚀 如何使用

### 开发模式

```bash
npm start
# 或者
npm run dev
```

这会：
1. 启动 Vite 开发服务器（http://localhost:5173）
2. 等待服务器就绪
3. 启动 Electron 应用
4. 自动打开开发者工具

### 构建生产版本

```bash
# 构建渲染进程
npm run build:renderer

# 完整构建（渲染进程 + Electron 打包）
npm run build

# 仅打包 macOS
npm run dist:mac
```

## 🎨 UI 组件

### shadcn/ui 组件

已集成的组件：

1. **Card** - 应用卡片容器
   ```jsx
   <Card>
     <CardHeader>
       <CardTitle>标题</CardTitle>
       <CardDescription>描述</CardDescription>
     </CardHeader>
     <CardContent>内容</CardContent>
     <CardFooter>底部</CardFooter>
   </Card>
   ```

2. **Button** - 按钮组件
   ```jsx
   <Button variant="default">启动</Button>
   <Button variant="destructive">停止</Button>
   <Button variant="outline">轮廓</Button>
   ```

3. **Badge** - 徽章组件
   ```jsx
   <Badge variant="success">运行中</Badge>
   <Badge variant="default">默认</Badge>
   ```

### 组件特点

- ✅ **无抖动悬停效果** - 只使用阴影和颜色变化
- ✅ **响应式设计** - 自动适配不同屏幕尺寸
- ✅ **主题一致** - 使用 CSS 变量统一主题
- ✅ **可定制** - 可通过 className 自定义样式

## 📋 对比原版本

### 视觉效果对比

| 特性 | 原版本 | shadcn/ui 版本 |
|------|--------|----------------|
| 设计风格 | 自定义 CSS | 现代化设计系统 |
| 响应式 | 手动 Grid | Tailwind 响应式 |
| 组件复用 | 无 | 高度可复用 |
| 主题切换 | 不支持 | 支持（通过 CSS 变量）|
| 悬停效果 | 有抖动问题 | 无抖动，流畅 |
| 代码维护 | 纯 CSS，较繁琐 | Tailwind，简洁 |

### 文件对比

**移除的文件：**
- ❌ `src/ui/launcher/index.html`
- ❌ `src/ui/launcher/style.css`
- ❌ `src/ui/launcher/renderer.js`

**新增的文件：**
- ✅ `src/renderer/` 目录（React 组件）
- ✅ `index.html`（根目录）
- ✅ Vite、Tailwind 配置文件

## 🔧 配置说明

### Vite 配置 (vite.config.mjs)

```javascript
export default defineConfig({
  plugins: [react()],
  base: './',  // 重要：相对路径
  build: {
    outDir: 'dist-renderer',  // 输出到独立目录
  },
});
```

### Tailwind 配置 (tailwind.config.mjs)

包含 shadcn/ui 的设计令牌：
- 颜色系统
- 圆角半径
- 阴影效果

### 主进程更新

```javascript
// 开发模式：加载 Vite dev server
if (isDev) {
  launcherWindow.loadURL('http://localhost:5173');
} 
// 生产模式：加载构建文件
else {
  launcherWindow.loadFile('dist-renderer/index.html');
}
```

## 🎯 新功能

1. **热重载** - 修改代码自动刷新
2. **开发者工具** - 开发模式自动打开
3. **TypeScript 支持** - 随时可添加 .tsx 文件
4. **组件化** - 更好的代码组织

## 📝 开发注意事项

### 1. 添加新 UI 组件

shadcn/ui 组件可按需添加：

```bash
# 如果你想添加更多组件，手动创建文件
# 参考：https://ui.shadcn.com/docs/components
```

### 2. 样式定制

修改 `src/renderer/index.css` 中的 CSS 变量：

```css
:root {
  --primary: 262 83% 58%;  /* 主色调 */
  --radius: 0.5rem;         /* 圆角大小 */
}
```

### 3. Electron 与 React 通信

保持不变，继续使用 `window.electronAPI`：

```javascript
// React 组件中
const apps = await window.electronAPI.getApps();
await window.electronAPI.startApp(appId);
```

## ✅ 验证清单

测试以下功能确保正常工作：

- [x] 应用启动并显示启动器
- [x] 应用卡片正确展示
- [x] 点击"启动"按钮可以启动应用
- [x] 运行中状态正确显示
- [x] 点击"停止"按钮可以停止应用
- [x] 悬停效果流畅，无抖动
- [x] 黄金价格监控功能正常
- [x] 托盘图标正常显示

## 🐛 已知问题

无已知问题。

## 📚 参考资源

- [shadcn/ui 官网](https://ui.shadcn.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Vite 文档](https://vitejs.dev/)
- [React 文档](https://react.dev/)

## 🎉 总结

重构成功！现在你拥有：

✅ 现代化的 React 技术栈  
✅ 优雅的 shadcn/ui 组件  
✅ 流畅的悬停效果（无抖动）  
✅ 强大的开发体验（热重载）  
✅ 易于维护的代码结构  

---

**重构完成日期：** 2025-11-09  
**技术栈：** React 19 + Vite 6 + Tailwind CSS 4 + shadcn/ui  
**状态：** ✅ 生产就绪
