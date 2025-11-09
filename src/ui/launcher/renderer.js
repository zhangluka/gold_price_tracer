/**
 * 启动器渲染进程
 */

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', async () => {
  await loadApps();
  
  // 每秒刷新一次应用状态
  setInterval(loadApps, 1000);
});

/**
 * 加载应用列表
 */
async function loadApps() {
  try {
    const apps = await window.electronAPI.getApps();
    renderApps(apps);
  } catch (error) {
    console.error('加载应用列表失败:', error);
  }
}

/**
 * 渲染应用列表
 */
function renderApps(apps) {
  const appsGrid = document.getElementById('apps-grid');
  
  if (apps.length === 0) {
    appsGrid.innerHTML = `
      <div class="empty-state">
        <h2>暂无应用</h2>
        <p>敬请期待更多应用...</p>
      </div>
    `;
    return;
  }

  appsGrid.innerHTML = apps.map(app => `
    <div class="app-card ${app.isRunning ? 'running' : ''}" data-app-id="${app.id}">
      <span class="app-icon">${app.icon}</span>
      <h3 class="app-name">${app.name}</h3>
      <p class="app-description">${app.description}</p>
      <div class="app-actions">
        <button 
          class="btn btn-primary" 
          onclick="handleStartApp('${app.id}')"
          ${app.isRunning ? 'disabled' : ''}
        >
          ${app.isRunning ? '运行中' : '启动'}
        </button>
        ${app.isRunning ? `
          <button 
            class="btn btn-danger" 
            onclick="handleStopApp('${app.id}')"
          >
            停止
          </button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

/**
 * 启动应用
 */
async function handleStartApp(appId) {
  try {
    await window.electronAPI.startApp(appId);
    await loadApps();
  } catch (error) {
    console.error(`启动应用失败 [${appId}]:`, error);
    alert(`启动失败: ${error.message}`);
  }
}

/**
 * 停止应用
 */
async function handleStopApp(appId) {
  try {
    await window.electronAPI.stopApp(appId);
    await loadApps();
  } catch (error) {
    console.error(`停止应用失败 [${appId}]:`, error);
    alert(`停止失败: ${error.message}`);
  }
}
