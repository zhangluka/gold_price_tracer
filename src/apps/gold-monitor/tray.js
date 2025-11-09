/**
 * 黄金价格监控托盘管理
 */
const { Tray, Menu, nativeImage } = require('electron');
const Logger = require('../../common/logger');
const { formatPrice, formatTime } = require('../../common/utils/format');
const config = require('./config');

const logger = new Logger('GoldTray');

class GoldTray {
  constructor() {
    this.tray = null;
    this.lastKnownData = null;
    this.previousPrice = null;
    this.blinkTimer = null;
    this.blinkState = false;
  }

  /**
   * 创建透明托盘图标
   */
  createEmptyTrayIcon() {
    const transparentPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X0XKoAAAAASUVORK5CYII=';
    const image = nativeImage.createFromDataURL(`data:image/png;base64,${transparentPngBase64}`);
    image.setTemplateImage(true);
    return image;
  }

  /**
   * 获取价格变化指示器
   */
  getPriceChangeIndicator(currentPrice, prevPrice) {
    if (prevPrice == null || currentPrice == null) {
      return '';
    }

    if (currentPrice > prevPrice) {
      return ' 🔴↑'; // 上涨用红色
    } else if (currentPrice < prevPrice) {
      return ' 🟢↓'; // 下跌用绿色
    }

    return '';
  }

  /**
   * 停止闪烁
   */
  stopBlinking() {
    if (this.blinkTimer) {
      clearInterval(this.blinkTimer);
      this.blinkTimer = null;
      this.blinkState = false;
    }
  }

  /**
   * 开始闪烁
   */
  startBlinking(price, indicator) {
    this.stopBlinking();

    const formattedPrice = formatPrice(price, config.DECIMAL_PLACES);
    let blinkCount = 0;

    // 更新 tooltip
    this.tray.setToolTip(`黄金现货价: ¥${formattedPrice} 元/克\n更新: ${formatTime()}`);

    this.blinkTimer = setInterval(() => {
      this.blinkState = !this.blinkState;
      blinkCount++;

      if (blinkCount >= config.BLINK_COUNT) {
        this.stopBlinking();
        // 闪烁结束后显示正常状态（不带指示器）
        this.tray.setTitle(`${config.TITLE_PREFIX} ${formattedPrice}`);
        return;
      }

      // 闪烁时交替显示带指示器和不带指示器的文本
      if (this.blinkState) {
        this.tray.setTitle(`${config.TITLE_PREFIX} ${formattedPrice}${indicator}`);
      } else {
        this.tray.setTitle(`${config.TITLE_PREFIX} ${formattedPrice}`);
      }
    }, config.BLINK_DURATION);
  }

  /**
   * 更新托盘显示
   */
  updateDisplay(priceData, updatedAt = new Date()) {
    if (!this.tray) {
      return;
    }

    const price = priceData?.curPrice;
    const formattedPrice = formatPrice(price, config.DECIMAL_PLACES);
    this.tray.setTitle(`${config.TITLE_PREFIX} ${formattedPrice}`);
    this.tray.setToolTip(`黄金现货价: ¥${formattedPrice} 元/克\n更新: ${formatTime(updatedAt)}`);

    this.updateMenu(priceData, updatedAt);
  }

  /**
   * 更新托盘菜单
   */
  updateMenu(priceData, updatedAt = new Date()) {
    if (!this.tray) {
      return;
    }

    const curPrice = priceData?.curPrice;
    const high = priceData?.high;
    const low = priceData?.low;

    const formattedCurPrice = formatPrice(curPrice, config.DECIMAL_PLACES);
    const formattedHigh = formatPrice(high, config.DECIMAL_PLACES);
    const formattedLow = formatPrice(low, config.DECIMAL_PLACES);

    const menuTemplate = [
      {
        label: '立即刷新',
        click: async () => {
          if (this.onRefresh) {
            await this.onRefresh();
          }
        },
      },
      {
        label: curPrice == null ? '最新报价: N/A' : `最新报价: ¥${formattedCurPrice} 元/克`,
        enabled: false,
      },
      {
        label: high == null ? '最高价: N/A' : `最高价: ¥${formattedHigh} 元/克`,
        enabled: false,
      },
      {
        label: low == null ? '最低价: N/A' : `最低价: ¥${formattedLow} 元/克`,
        enabled: false,
      },
      { type: 'separator' },
      {
        label: '关闭监控',
        click: () => {
          if (this.onClose) {
            this.onClose();
          }
        },
      },
    ];

    const contextMenu = Menu.buildFromTemplate(menuTemplate);
    this.tray.setContextMenu(contextMenu);
  }

  /**
   * 更新价格数据
   */
  updatePrice(priceData) {
    if (!priceData) {
      this.updateDisplay(this.lastKnownData, new Date());
      return;
    }

    const currentPrice = priceData.curPrice;

    // 检查价格变化
    const indicator = this.getPriceChangeIndicator(currentPrice, this.previousPrice);

    // 更新价格
    this.previousPrice = this.lastKnownData?.curPrice;
    this.lastKnownData = priceData;

    // 如果有价格变化，启动闪烁效果
    if (indicator) {
      this.startBlinking(currentPrice, indicator);
    } else {
      // 没有变化时正常更新
      this.updateDisplay(this.lastKnownData, new Date());
    }

    // 更新菜单（不受闪烁影响）
    this.updateMenu(this.lastKnownData, new Date());
  }

  /**
   * 创建托盘
   */
  create() {
    if (this.tray) {
      logger.warn('托盘已存在');
      return;
    }

    this.tray = new Tray(this.createEmptyTrayIcon());
    this.updateDisplay(this.lastKnownData);
    logger.success('托盘已创建');
  }

  /**
   * 销毁托盘
   */
  destroy() {
    this.stopBlinking();
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
      logger.info('托盘已销毁');
    }
  }

  /**
   * 设置刷新回调
   */
  setOnRefresh(callback) {
    this.onRefresh = callback;
  }

  /**
   * 设置关闭回调
   */
  setOnClose(callback) {
    this.onClose = callback;
  }
}

module.exports = GoldTray;
