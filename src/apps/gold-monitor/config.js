/**
 * 黄金价格监控配置
 */
module.exports = {
  // API 配置
  API_URL: 'https://m.cmbchina.com/api/rate/gold?no=AU9999',
  
  // 更新间隔（毫秒）
  UPDATE_INTERVAL: 60 * 1000, // 60秒
  
  // 闪烁配置
  BLINK_DURATION: 500, // 每次闪烁持续时间（毫秒）
  BLINK_COUNT: 6, // 闪烁次数
  
  // 显示配置
  TITLE_PREFIX: 'Au',
  DECIMAL_PLACES: 2,
};
