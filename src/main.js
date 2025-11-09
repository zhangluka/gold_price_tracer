/**
 * 桌面应用合集 - 主进程
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Logger = require('./common/logger');
const { LAUNCHER_WINDOW } = require('./common/constants');
const { getAllApps, startApp, stopApp, stopAllApps } = require('./apps');

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

  // 加载启动器界面
  launcherWindow.loadFile(path.join(__dirname, 'ui/launcher/index.html'));

  // 开发环境下打开开发者工具
  // if (process.env.NODE_ENV === 'development') {
  //   launcherWindow.webContents.openDevTools();
  // }

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

  logger.success('IPC 处理器已设置');
}

/**
 * 初始化应用
 */
function initApp() {
  // 隐藏 Dock 图标（macOS）
  // 如果想保留启动器窗口的 Dock 图标，可以注释掉这行
  // if (process.platform === 'darwin' && app.dock) {
  //   app.dock.hide();
  // }

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
  app.whenReady().then(() => {
    setupIpcHandlers();
    createLauncherWindow();
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
initApp();
