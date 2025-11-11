/**
 * Preload 脚本
 * 为渲染进程提供安全的 API
 */
const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用列表
  getApps: () => ipcRenderer.invoke('get-apps'),

  // 启动应用
  startApp: (appId) => ipcRenderer.invoke('start-app', appId),

  // 停止应用
  stopApp: (appId) => ipcRenderer.invoke('stop-app', appId),

  // 获取剪贴板历史
  getClipboardHistory: () => ipcRenderer.invoke('get-clipboard-history'),

  // 设置面板位置
  setPanelPosition: (x, y) => ipcRenderer.invoke('set-panel-position', x, y),

  // 复制到剪贴板
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
});
