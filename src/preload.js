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
});
