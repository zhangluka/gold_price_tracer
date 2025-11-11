/**
 * 应用注册中心
 */
const GoldMonitorApp = require('./gold-monitor');
const ClipboardHistoryApp = require('./clipboard-history');

// 应用注册表
const apps = [
  {
    id: 'gold-monitor',
    name: '黄金价格监控',
    description: '在系统托盘实时显示黄金现货价格',
    icon: '💰',
    type: 'tray',
    category: 'finance',
    instance: null,
    AppClass: GoldMonitorApp,
  },
  {
    id: 'clipboard-history',
    name: '剪贴板历史',
    description: '通过Command+V快捷键查看剪贴板历史记录',
    icon: '📋',
    type: 'panel',
    category: 'productivity',
    instance: null,
    AppClass: ClipboardHistoryApp,
  },
  // 未来可以添加更多应用
  // {
  //   id: 'stock-monitor',
  //   name: '股票监控',
  //   description: '监控股票价格变动',
  //   icon: '📈',
  //   type: 'tray',
  //   category: 'finance',
  //   instance: null,
  //   AppClass: StockMonitorApp,
  // },
];

/**
 * 获取所有应用列表
 */
function getAllApps() {
  return apps.map((app) => ({
    id: app.id,
    name: app.name,
    description: app.description,
    icon: app.icon,
    type: app.type,
    category: app.category,
    isRunning: app.instance !== null && app.instance.getStatus && app.instance.getStatus(),
  }));
}

/**
 * 根据 ID 获取应用
 */
function getAppById(id) {
  return apps.find((app) => app.id === id);
}

/**
 * 启动应用
 */
async function startApp(id) {
  const app = getAppById(id);
  if (!app) {
    throw new Error(`应用 ${id} 不存在`);
  }

  if (app.instance && app.instance.getStatus && app.instance.getStatus()) {
    throw new Error(`应用 ${app.name} 已在运行`);
  }

  // 创建应用实例
  if (!app.instance) {
    app.instance = new app.AppClass();
  }

  // 启动应用
  await app.instance.start();
}

/**
 * 停止应用
 */
function stopApp(id) {
  const app = getAppById(id);
  if (!app) {
    throw new Error(`应用 ${id} 不存在`);
  }

  if (!app.instance) {
    return;
  }

  // 停止应用
  app.instance.stop();
}

/**
 * 停止所有应用
 */
function stopAllApps() {
  apps.forEach((app) => {
    if (app.instance) {
      app.instance.stop();
    }
  });
}

/**
 * 初始化应用 - 自动启动剪贴板历史应用
 */
async function initApp() {
  try {
    // 自动启动剪贴板历史应用，这样快捷键就能正常工作
    await startApp('clipboard-history');
    console.log('剪贴板历史应用已自动启动');
  } catch (error) {
    console.error('启动剪贴板历史应用失败:', error);
  }
}

module.exports = {
  getAllApps,
  getAppById,
  startApp,
  stopApp,
  stopAllApps,
  initApp, // 导出初始化函数
};
