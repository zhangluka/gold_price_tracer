/**
 * 黄金价格 API 调用
 */
const Logger = require('../../common/logger');
const config = require('./config');

const logger = new Logger('GoldAPI');

/**
 * 获取黄金价格
 * @returns {Promise<{curPrice: number, high: number, low: number} | null>}
 */
async function fetchGoldPrice() {
  try {
    const response = await fetch(config.API_URL, { cache: 'no-store' });

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
    logger.error('获取黄金价格失败:', error.message);
    return null;
  }
}

module.exports = {
  fetchGoldPrice,
};
