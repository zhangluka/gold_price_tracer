#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始优化构建过程...');

// 1. 清理之前的构建产物
console.log('🧹 清理构建目录...');
if (fs.existsSync('dist')) {
  execSync('rm -rf dist');
}
if (fs.existsSync('build')) {
  execSync('rm -rf build');
}

// 2. 确保必要的目录存在
console.log('📁 确保目录结构...');
fs.mkdirSync('dist', { recursive: true });

// 3. 安装依赖（使用精确安装）
console.log('📦 安装依赖...');
try {
  execSync('npm ci --only=production', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  生产依赖安装失败，尝试完整安装...');
  execSync('npm ci', { stdio: 'inherit' });
}

// 4. 构建应用
console.log('🔨 构建应用...');
try {
  execSync('npm run dist:mac', { stdio: 'inherit' });
  console.log('✅ macOS 构建完成！');
} catch (error) {
  console.error('❌ 构建失败:', error);
  process.exit(1);
}

// 5. 检查构建产物大小
console.log('📊 检查构建产物大小...');
const distPath = 'dist';
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  files.forEach(file => {
    const fullPath = path.join(distPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      const size = getDirectorySize(fullPath);
      console.log(`📁 ${file}: ${(size / 1024 / 1024).toFixed(2)} MB`);
    }
  });
} else {
  console.log('❌ 没有找到构建产物');
}

console.log('🎉 构建过程完成！');

function getDirectorySize(dir) {
  let size = 0;
  function calculateSize(filePath) {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      fs.readdirSync(filePath).forEach(file => {
        calculateSize(path.join(filePath, file));
      });
    } else {
      size += stats.size;
    }
  }
  calculateSize(dir);
  return size;
}
