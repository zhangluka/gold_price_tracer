import React, { useState, useEffect } from 'react';
import { AppCard } from './components/AppCard';

function App() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    loadApps();
    // 每秒刷新应用状态
    const interval = setInterval(loadApps, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadApps = async () => {
    try {
      const appsList = await window.electronAPI.getApps();
      setApps(appsList);
    } catch (error) {
      console.error('加载应用列表失败:', error);
    }
  };

  const handleStartApp = async (appId) => {
    try {
      await window.electronAPI.startApp(appId);
      await loadApps();
    } catch (error) {
      console.error(`启动应用失败 [${appId}]:`, error);
      alert(`启动失败: ${error.message}`);
    }
  };

  const handleStopApp = async (appId) => {
    try {
      await window.electronAPI.stopApp(appId);
      await loadApps();
    } catch (error) {
      console.error(`停止应用失败 [${appId}]:`, error);
      alert(`停止失败: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-500 to-purple-600">
      <div className="container mx-auto p-10">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
            🚀 桌面应用合集
          </h1>
          <p className="text-xl text-white/90">选择要启动的应用</p>
        </header>

        {/* Apps Grid */}
        <main>
          {apps.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold text-white mb-3">暂无应用</h2>
              <p className="text-white/80">敬请期待更多应用...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onStart={handleStartApp}
                  onStop={handleStopApp}
                />
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 text-white/80">
          <p>© 2025 桌面应用合集 v1.0.0</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
