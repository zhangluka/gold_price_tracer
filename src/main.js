/**
 * 桌面应用合集 - 主进程
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Logger = require('./common/logger');
const { LAUNCHER_WINDOW } = require('./common/constants');
const { getAllApps, startApp, stopApp, stopAllApps, getAppById, initApp } = require('./apps');

const logger = new Logger('Main');

// 禁用安全警告（仅在开发环境）
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

let launcherWindow = null;

/**
 * 创建启动器窗口
 */
function createLauncherWindow() {
  launcherWindow = new BrowserWindow({
    width: LAUNCHER_WINDOW.width,
    height: LAUNCHER_WINDOW.height,
    minWidth: LAUNCHER_WINDOW.minWidth,
    minHeight: LAUNCHER_WINDOW.minHeight,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    title: '桌面应用合集',
    backgroundColor: '#667eea',
  });

  // 开发模式：加载 Vite dev server
  // 生产模式：加载构建后的文件
  if (isDev) {
    launcherWindow.loadURL('http://localhost:5173');
    // 开发环境下打开开发者工具
    launcherWindow.webContents.openDevTools();
  } else {
    launcherWindow.loadFile(path.join(__dirname, '../dist-renderer/index.html'));
  }

  launcherWindow.on('closed', () => {
    launcherWindow = null;
  });

  logger.success('启动器窗口已创建');
}

/**
 * 设置 IPC 处理器
 */
function setupIpcHandlers() {
  // 获取应用列表
  ipcMain.handle('get-apps', async () => {
    return getAllApps();
  });

  // 启动应用
  ipcMain.handle('start-app', async (event, appId) => {
    try {
      await startApp(appId);
      logger.success(`应用 ${appId} 已启动`);
      return { success: true };
    } catch (error) {
      logger.error(`启动应用 ${appId} 失败:`, error.message);
      throw error;
    }
  });

  // 停止应用
  ipcMain.handle('stop-app', async (event, appId) => {
    try {
      stopApp(appId);
      logger.success(`应用 ${appId} 已停止`);
      return { success: true };
    } catch (error) {
      logger.error(`停止应用 ${appId} 失败:`, error.message);
      throw error;
    }
  });

  // 获取剪贴板历史数据
  ipcMain.handle('get-clipboard-history', async (event) => {
    const app = getAppById('clipboard-history');
    if (app && app.instance) {
      return app.instance.clipboardHistory || [];
    }
    return [];
  });

  // 设置面板位置
  ipcMain.handle('set-panel-position', async (event, x, y) => {
    const app = getAppById('clipboard-history');
    if (app && app.instance) {
      app.instance.setPanelPosition(x, y);
      return { success: true };
    }
    return { success: false };
  });

  // 复制文本到剪贴板
  ipcMain.handle('copy-to-clipboard', async (event, text) => {
    const app = getAppById('clipboard-history');
    if (app && app.instance) {
      app.instance.copyToClipboard(text);
      return { success: true };
    }
    return { success: false };
  });

  logger.success('IPC 处理器已设置');
}

/**
 * 初始化主应用
 */
function initMainApp() {
  // 确保单例
  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    app.quit();
    return;
  }

  app.on('second-instance', () => {
    // 当运行第二个实例时，聚焦到启动器窗口
    if (launcherWindow) {
      if (launcherWindow.isMinimized()) {
        launcherWindow.restore();
      }
      launcherWindow.focus();
    }
  });

  // 应用就绪时
  app.whenReady().then(async () => {
    setupIpcHandlers();
    createLauncherWindow();

    // 自动启动剪贴板历史应用
    try {
      await initApp();
      logger.success('剪贴板历史应用已自动启动');
    } catch (error) {
      logger.error('启动剪贴板历史应用失败:', error);
    }

    logger.success('应用已启动');
  });

  // 所有窗口关闭时
  app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    // 但由于我们的应用主要是工具集合，所以关闭窗口时退出
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // 应用激活时
  app.on('activate', () => {
    // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，
    // 通常会在应用中重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createLauncherWindow();
    }
  });

  // 应用退出前
  app.on('before-quit', () => {
    logger.info('应用即将退出，停止所有应用...');
    stopAllApps();
  });
}

// 启动应用
initMainApp();
