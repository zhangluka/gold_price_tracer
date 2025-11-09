/**
 * 统一日志工具
 */
class Logger {
  constructor(module = 'App') {
    this.module = module;
  }

  _log(level, emoji, ...args) {
    const timestamp = new Date().toLocaleTimeString('zh-CN');
    console[level](`${emoji} [${timestamp}] [${this.module}]`, ...args);
  }

  info(...args) {
    this._log('log', 'ℹ️', ...args);
  }

  success(...args) {
    this._log('log', '✅', ...args);
  }

  error(...args) {
    this._log('error', '❌', ...args);
  }

  warn(...args) {
    this._log('warn', '⚠️', ...args);
  }

  debug(...args) {
    this._log('log', '🔍', ...args);
  }
}

module.exports = Logger;
