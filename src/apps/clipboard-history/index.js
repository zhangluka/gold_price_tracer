/**
 * 剪贴板历史应用
 */
const { app, BrowserWindow, globalShortcut, clipboard, screen } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { join } = require('path');

class ClipboardHistoryApp {
  constructor() {
    this.isRunning = false;
    this.mainWindow = null;
    this.clipboardHistory = [];
    this.historyFile = join(app.getPath('userData'), 'clipboard-history.json');
    this.clipboardListeners = [];
  }

  async start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // 加载历史记录
    await this.loadHistory();

    // 注册快捷键
    this.registerShortcuts();

    // 开始监听剪贴板
    this.startClipboardMonitoring();

    console.log('剪贴板历史应用已启动');
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // 注销快捷键
    this.unregisterShortcuts();

    // 停止监听剪贴板
    this.stopClipboardMonitoring();

    // 保存历史记录
    this.saveHistory();

    // 关闭窗口
    if (this.mainWindow) {
      this.mainWindow.close();
      this.mainWindow = null;
    }

    console.log('剪贴板历史应用已停止');
  }

  getStatus() {
    return this.isRunning;
  }

  registerShortcuts() {
    // 注册 Command+Shift+V 快捷键
    globalShortcut.register('CommandOrControl+Shift+V', () => {
      this.togglePanel();
    });

    console.log('快捷键已注册');
  }

  unregisterShortcuts() {
    globalShortcut.unregister('CommandOrControl+Shift+V');
    console.log('快捷键已注销');
  }

  startClipboardMonitoring() {
    // 每秒检查一次剪贴板内容
    this.clipboardTimer = setInterval(() => {
      this.checkClipboard();
    }, 1000);

    console.log('剪贴板监控已启动');
  }

  stopClipboardMonitoring() {
    if (this.clipboardTimer) {
      clearInterval(this.clipboardTimer);
      this.clipboardTimer = null;
    }

    console.log('剪贴板监控已停止');
  }

  async checkClipboard() {
    try {
      const text = clipboard.readText();
      const image = clipboard.readImage();

      // 只有当内容发生变化时才记录
      const lastItem = this.clipboardHistory[0];
      const hasChanged = !lastItem || lastItem.text !== text || lastItem.hasImage !== !!image;

      if (hasChanged && text.trim() !== '') {
        const newItem = {
          id: Date.now(),
          text: text.trim(),
          hasImage: !!image,
          timestamp: new Date().toISOString(),
          type: this.detectContentType(text)
        };

        // 添加到历史记录顶部
        this.clipboardHistory.unshift(newItem);

        // 限制历史记录数量（最多100条）
        if (this.clipboardHistory.length > 100) {
          this.clipboardHistory = this.clipboardHistory.slice(0, 100);
        }

        // 通知渲染进程更新数据
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('clipboard-history-update', this.clipboardHistory);
        }

        console.log('检测到新的剪贴板内容:', newItem.text.substring(0, 50) + '...');
      }
    } catch (error) {
      console.error('检查剪贴板时出错:', error);
    }
  }

  detectContentType(text) {
    if (text.startsWith('http://') || text.startsWith('https://')) {
      return 'url';
    } else if (text.includes('@') && text.includes('.')) {
      return 'email';
    } else if (text.match(/^\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{4}$/)) {
      return 'phone';
    } else if (text.match(/^\d{6}$/)) {
      return 'zipcode';
    } else {
      return 'text';
    }
  }

  async loadHistory() {
    try {
      const data = await fs.readFile(this.historyFile, 'utf8');
      this.clipboardHistory = JSON.parse(data);
      console.log('历史记录已加载:', this.clipboardHistory.length, '条记录');
    } catch (error) {
      console.log('没有找到历史记录文件，将创建新的记录');
      this.clipboardHistory = [];
    }
  }

  saveHistory() {
    try {
      fs.writeFile(this.historyFile, JSON.stringify(this.clipboardHistory, null, 2));
      console.log('历史记录已保存');
    } catch (error) {
      console.error('保存历史记录时出错:', error);
    }
  }

  togglePanel() {
    // 获取当前鼠标位置
    const mousePosition = screen.getCursorScreenPoint();

    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      if (this.mainWindow.isVisible()) {
        this.mainWindow.hide();
      } else {
        this.mainWindow.setPosition(mousePosition.x, mousePosition.y);
        this.mainWindow.show();
      }
    } else {
      this.createPanelWindow(mousePosition.x, mousePosition.y);
    }
  }

  createPanelWindow(mouseX, mouseY) {
    this.mainWindow = new BrowserWindow({
      width: 400,
      height: 600,
      frame: false,
      resizable: false,
      movable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      transparent: true,
      titleBarStyle: 'hidden',
      vibrancy: 'popover',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../../preload.js'),
      },
    });

    // 设置窗口位置在鼠标附近
    this.mainWindow.setPosition(mouseX, mouseY);

    // 加载渲染进程
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:5173/#/clipboard-history');
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../../dist-renderer/index.html'));
    }

    // 监听窗口关闭事件
    this.mainWindow.on('close', (event) => {
      if (!this.mainWindow.isDestroyed()) {
        this.mainWindow.hide();
        event.preventDefault();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    console.log('剪贴板历史面板窗口已创建');
  }

  // 提供给渲染进程的方法
  setPanelPosition(x, y) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.setPosition(x, y);
    }
  }

  copyToClipboard(text) {
    clipboard.writeText(text);
  }
}

module.exports = ClipboardHistoryApp;
