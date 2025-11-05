const { app, Tray, Menu, nativeImage } = require('electron');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

const UPDATE_INTERVAL = 60 * 1000; // 60 seconds
const GOLD_API_URL = 'https://m.cmbchina.com/api/rate/gold?no=AU9999';

let tray = null;
let updateTimer = null;
let lastKnownData = null; // 存储完整的价格数据 { curPrice, high, low }
let previousPrice = null;
let blinkTimer = null;
let blinkState = false;

function createEmptyTrayIcon() {
  const transparentPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X0XKoAAAAASUVORK5CYII=';
  const image = nativeImage.createFromDataURL(`data:image/png;base64,${transparentPngBase64}`);
  image.setTemplateImage(true);
  return image;
}

async function fetchGoldPrice() {
  try {
    const response = await fetch(GOLD_API_URL, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.returnCode !== 'SUC0000') {
      throw new Error(data.errorMsg || 'API 返回错误');
    }

    if (!data.body || !data.body.data || !Array.isArray(data.body.data) || data.body.data.length === 0) {
      throw new Error('未找到黄金报价数据');
    }

    const goldData = data.body.data[0];
    const curPrice = parseFloat(goldData.curPrice);
    const high = parseFloat(goldData.high);
    const low = parseFloat(goldData.low);

    if (isNaN(curPrice)) {
      throw new Error('价格格式异常');
    }

    return {
      curPrice,
      high: isNaN(high) ? null : high,
      low: isNaN(low) ? null : low,
    };
  } catch (error) {
    console.error('获取黄金价格失败:', error);
    return null;
  }
}

function formatPrice(price) {
  if (price == null) {
    return 'N/A';
  }

  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getPriceChangeIndicator(currentPrice, prevPrice) {
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

function stopBlinking() {
  if (blinkTimer) {
    clearInterval(blinkTimer);
    blinkTimer = null;
    blinkState = false;
  }
}

function startBlinking(price, indicator) {
  stopBlinking();

  const formattedPrice = formatPrice(price);
  let blinkCount = 0;
  const maxBlinks = 6; // 闪烁6次（3秒，每次500ms）

  // 更新 tooltip
  const now = new Date();
  tray.setToolTip(`黄金现货价: ¥${formattedPrice} 元/克\n更新: ${now.toLocaleTimeString('zh-CN')}`);

  blinkTimer = setInterval(() => {
    blinkState = !blinkState;
    blinkCount++;

    if (blinkCount >= maxBlinks) {
      stopBlinking();
      // 闪烁结束后显示正常状态（不带指示器）
      tray.setTitle(`Au ${formattedPrice}`);
      return;
    }

    // 闪烁时交替显示带指示器和不带指示器的文本
    if (blinkState) {
      tray.setTitle(`Au ${formattedPrice}${indicator}`);
    } else {
      tray.setTitle(`Au ${formattedPrice}`);
    }
  }, 500); // 每500ms切换一次
}

function updateTrayDisplay(priceData, updatedAt = new Date()) {
  if (!tray) {
    return;
  }

  const price = priceData?.curPrice;
  const formattedPrice = formatPrice(price);
  tray.setTitle(`Au ${formattedPrice}`);
  tray.setToolTip(`黄金现货价: ¥${formattedPrice} 元/克\n更新: ${updatedAt.toLocaleTimeString('zh-CN')}`);

  updateTrayMenu(priceData, updatedAt);
}

function updateTrayMenu(priceData, updatedAt = new Date()) {
  if (!tray) {
    return;
  }

  const curPrice = priceData?.curPrice;
  const high = priceData?.high;
  const low = priceData?.low;

  const formattedCurPrice = formatPrice(curPrice);
  const formattedHigh = formatPrice(high);
  const formattedLow = formatPrice(low);

  const menuTemplate = [
    {
      label: '立即刷新',
      click: async () => {
        await refreshPrice();
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
    { type: /** @type {'separator'} */ ('separator') },
    {
      label: '退出',
      click: () => {
        app.quit();
      },
    },
  ];

  const contextMenu = Menu.buildFromTemplate(menuTemplate);
  tray.setContextMenu(contextMenu);
}

async function refreshPrice() {
  const priceData = await fetchGoldPrice();

  if (priceData != null) {
    const currentPrice = priceData.curPrice;

    // 检查价格变化
    const indicator = getPriceChangeIndicator(currentPrice, previousPrice);

    // 更新价格
    previousPrice = lastKnownData?.curPrice;
    lastKnownData = priceData;

    // 如果有价格变化，启动闪烁效果
    if (indicator) {
      startBlinking(currentPrice, indicator);
    } else {
      // 没有变化时正常更新
      updateTrayDisplay(lastKnownData, new Date());
    }

    // 更新菜单（不受闪烁影响）
    updateTrayMenu(lastKnownData, new Date());
  } else {
    updateTrayDisplay(lastKnownData, new Date());
  }
}

function startAutoUpdate() {
  updateTimer = setInterval(() => {
    refreshPrice().catch((error) => {
      console.error('定时刷新黄金价格失败:', error);
    });
  }, UPDATE_INTERVAL);
}

function stopAutoUpdate() {
  if (updateTimer) {
    clearInterval(updateTimer);
    updateTimer = null;
  }
}

function createTray() {
  tray = new Tray(createEmptyTrayIcon());
  updateTrayDisplay(lastKnownData);
}

function setupApp() {
  if (process.platform === 'darwin' && app.dock) {
    app.dock.hide();
  }

  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    app.quit();
    return;
  }

  app.on('second-instance', () => {
    if (tray) {
      tray.popUpContextMenu();
    }
  });

  app.whenReady().then(async () => {
    createTray();
    await refreshPrice();
    startAutoUpdate();
  });

  app.on('before-quit', () => {
    stopAutoUpdate();
    stopBlinking();
    if (tray) {
      tray.destroy();
      tray = null;
    }
  });

  app.on('window-all-closed', (event) => {
    event.preventDefault();
  });
}

setupApp();

