/**
 * 格式化工具函数
 */

/**
 * 格式化价格
 * @param {number} price - 价格
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的价格
 */
function formatPrice(price, decimals = 2) {
  if (price == null || isNaN(price)) {
    return 'N/A';
  }

  return price.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 格式化时间
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的时间
 */
function formatTime(date = new Date()) {
  return date.toLocaleTimeString('zh-CN');
}

/**
 * 格式化日期时间
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期时间
 */
function formatDateTime(date = new Date()) {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

module.exports = {
  formatPrice,
  formatTime,
  formatDateTime,
};
