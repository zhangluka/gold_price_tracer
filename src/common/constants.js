/**
 * 全局常量配置
 */
module.exports = {
  // 应用信息
  APP_NAME: '桌面应用合集',
  APP_VERSION: '1.0.0',

  // 窗口配置
  LAUNCHER_WINDOW: {
    width: 900,
    height: 600,
    minWidth: 800,
    minHeight: 500,
  },

  // 应用类型
  APP_TYPES: {
    TRAY: 'tray', // 托盘应用
    WINDOW: 'window', // 窗口应用
  },

  // 开发环境
  IS_DEV: process.env.NODE_ENV === 'development',
};
