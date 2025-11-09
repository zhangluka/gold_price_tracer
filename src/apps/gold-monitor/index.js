/**
 * 黄金价格监控应用
 */
const { powerMonitor } = require('electron');
const Logger = require('../../common/logger');
const GoldTray = require('./tray');
const { fetchGoldPrice } = require('./api');
const config = require('./config');

const logger = new Logger('GoldMonitor');

class GoldMonitorApp {
  constructor() {
    this.tray = null;
    this.updateTimer = null;
    this.isSuspended = false;
    this.isRunning = false;
  }

  /**
   * 刷新价格
   */
  async refreshPrice() {
    const priceData = await fetchGoldPrice();
    this.tray.updatePrice(priceData);
  }

  /**
   * 开始自动更新
   */
  startAutoUpdate() {
    this.stopAutoUpdate();

    logger.info('开始自动刷新价格...');
    this.updateTimer = setInterval(() => {
      this.refreshPrice().catch((error) => {
        logger.error('定时刷新黄金价格失败:', error);
      });
    }, config.UPDATE_INTERVAL);
  }

  /**
   * 停止自动更新
   */
  stopAutoUpdate() {
    if (this.updateTimer) {
      logger.info('停止自动刷新价格');
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * 设置电源监控
   */
  setupPowerMonitor() {
    // 监听系统休眠事件
    powerMonitor.on('suspend', () => {
      logger.info('系统进入休眠，暂停价格刷新');
      this.isSuspended = true;
      this.stopAutoUpdate();
      if (this.tray) {
        this.tray.stopBlinking();
      }
    });

    // 监听系统恢复事件
    powerMonitor.on('resume', async () => {
      logger.info('系统恢复工作，重新开始价格刷新');
      this.isSuspended = false;

      // 立即刷新一次价格
      await this.refreshPrice();

      // 重新启动定时刷新
      this.startAutoUpdate();
    });

    logger.success('电源监控已启用');
  }

  /**
   * 启动应用
   */
  async start() {
    if (this.isRunning) {
      logger.warn('黄金价格监控已在运行');
      return;
    }

    logger.info('启动黄金价格监控...');

    // 创建托盘
    this.tray = new GoldTray();
    this.tray.create();

    // 设置回调
    this.tray.setOnRefresh(async () => {
      await this.refreshPrice();
    });

    this.tray.setOnClose(() => {
      this.stop();
    });

    // 设置电源监控
    this.setupPowerMonitor();

    // 初始刷新
    await this.refreshPrice();

    // 开始自动更新
    this.startAutoUpdate();

    this.isRunning = true;
    logger.success('黄金价格监控已启动');
  }

  /**
   * 停止应用
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    logger.info('停止黄金价格监控...');

    this.stopAutoUpdate();

    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }

    this.isRunning = false;
    logger.success('黄金价格监控已停止');
  }

  /**
   * 获取运行状态
   */
  getStatus() {
    return this.isRunning;
  }
}

module.exports = GoldMonitorApp;
