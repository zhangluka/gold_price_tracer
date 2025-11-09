import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Play, Square, RefreshCw } from 'lucide-react';

export function AppCard({ app, onStart, onStop }) {
  const handleStart = async () => {
    try {
      await onStart(app.id);
    } catch (error) {
      console.error('启动应用失败:', error);
    }
  };

  const handleStop = async () => {
    try {
      await onStop(app.id);
    } catch (error) {
      console.error('停止应用失败:', error);
    }
  };

  return (
    <Card 
      className={`
        group relative overflow-hidden transition-all duration-300 
        hover:shadow-2xl
        ${app.isRunning 
          ? 'border-2 border-green-400 bg-white hover:shadow-green-500/30' 
          : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-purple-500/20'
        }
      `}
    >
      {/* 背景装饰 - 运行中时显示绿色，未运行时显示紫色 */}
      <div className={`
        absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-16 translate-x-16 
        opacity-20 group-hover:opacity-30 group-hover:scale-150 transition-all duration-500
        ${app.isRunning 
          ? 'bg-gradient-to-br from-green-300 to-emerald-300' 
          : 'bg-gradient-to-br from-purple-300 to-blue-300'
        }
      `} />
      
      {/* 运行状态徽章 */}
      {app.isRunning && (
        <div className="absolute top-4 right-4 z-10">
          <Badge 
            variant="success" 
            className="animate-pulse shadow-lg shadow-green-500/50"
          >
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              运行中
            </span>
          </Badge>
        </div>
      )}
      
      <CardHeader className="relative z-10 pb-3">
        {/* 图标容器 */}
        <div className="mb-4 flex items-center justify-center">
          <div className={`
            text-6xl transform transition-all duration-300 
            group-hover:scale-110 group-hover:rotate-6
            ${app.isRunning ? 'animate-bounce' : ''}
          `}>
            {app.icon}
          </div>
        </div>
        
        {/* 标题 */}
        <CardTitle className={`
          text-2xl text-center font-bold transition-all duration-300
          ${app.isRunning 
            ? 'text-green-600' 
            : 'text-gray-800 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600'
          }
        `}>
          {app.name}
        </CardTitle>
        
        {/* 描述 */}
        <CardDescription className="text-center text-sm mt-2 min-h-[40px] leading-relaxed text-gray-600">
          {app.description}
        </CardDescription>
      </CardHeader>

      {/* 分类/类型标签 */}
      <CardContent className="relative z-10 pb-3">
        <div className="flex items-center justify-center gap-2">
          <Badge 
            variant="outline" 
            className={`text-xs transition-colors ${app.isRunning ? 'border-green-300 text-green-700' : 'border-gray-300 text-gray-600'}`}
          >
            {app.type === 'tray' ? '🔔 托盘应用' : '🪟 窗口应用'}
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-xs transition-colors ${app.isRunning ? 'border-green-300 text-green-700' : 'border-gray-300 text-gray-600'}`}
          >
            {app.category === 'finance' ? '💰 金融' : '🔧 工具'}
          </Badge>
        </div>
      </CardContent>

      {/* 操作按钮 */}
      <CardFooter className="relative z-10 gap-2 pt-4 border-t border-gray-100">
        {!app.isRunning ? (
          <Button
            onClick={handleStart}
            className="w-full group/btn bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Play className="mr-2 h-4 w-4 group-hover/btn:animate-pulse" />
            启动应用
          </Button>
        ) : (
          <>
            <Button 
              disabled 
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 opacity-70 cursor-not-allowed"
            >
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              运行中
            </Button>
            <Button
              variant="destructive"
              onClick={handleStop}
              className="flex-1 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Square className="mr-2 h-4 w-4" />
              停止
            </Button>
          </>
        )}
      </CardFooter>

      {/* 底部装饰线 */}
      <div className={`
        absolute bottom-0 left-0 right-0 h-1 transition-all duration-500
        ${app.isRunning 
          ? 'bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400' 
          : 'bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-100'
        }
      `} />
    </Card>
  );
}
