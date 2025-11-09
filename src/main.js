const { app, Tray, Menu, nativeImage, powerMonitor } = require('electron');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

const UPDATE_INTERVAL = 60 * 1000; // 60 seconds
const GOLD_API_URL = 'https://m.cmbchina.com/api/rate/gold?no=AU9999';

let tray = null;
let updateTimer = null;
let lastKnownData = null; // 存储完整的价格数据 { curPrice, high, low }
let previousPrice = null;
let blinkTimer = null;
let blinkState = false;
let isSuspended = false; // 跟踪系统休眠状态

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
  // 如果已经有定时器在运行，先停止
  stopAutoUpdate();
  
  console.log('🔄 开始自动刷新价格...');
  updateTimer = setInterval(() => {
    refreshPrice().catch((error) => {
      console.error('定时刷新黄金价格失败:', error);
    });
  }, UPDATE_INTERVAL);
}

function stopAutoUpdate() {
  if (updateTimer) {
    console.log('⏸️  停止自动刷新价格');
    clearInterval(updateTimer);
    updateTimer = null;
  }
}

function createTray() {
  tray = new Tray(createEmptyTrayIcon());
  updateTrayDisplay(lastKnownData);
}

// 设置电源监控
function setupPowerMonitor() {
  // 监听系统休眠事件
  powerMonitor.on('suspend', () => {
    console.log('💤 系统进入休眠，暂停价格刷新');
    isSuspended = true;
    stopAutoUpdate();
    stopBlinking();
  });

  // 监听系统恢复事件
  powerMonitor.on('resume', async () => {
    console.log('⏰ 系统恢复工作，重新开始价格刷新');
    isSuspended = false;
    
    // 立即刷新一次价格
    await refreshPrice();
    
    // 重新启动定时刷新
    startAutoUpdate();
  });

  // 可选：监听屏幕锁定事件（可根据需要启用）
  powerMonitor.on('lock-screen', () => {
    console.log('🔒 屏幕已锁定');
    // 如果需要在锁屏时也暂停刷新，可以取消下面的注释
    // stopAutoUpdate();
  });

  powerMonitor.on('unlock-screen', () => {
    console.log('🔓 屏幕已解锁');
    // 如果需要在解锁时恢复刷新，可以取消下面的注释
    // if (!isSuspended && !updateTimer) {
    //   startAutoUpdate();
    // }
  });

  console.log('✅ 电源监控已启用');
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
    // 设置电源监控
    setupPowerMonitor();
    
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
