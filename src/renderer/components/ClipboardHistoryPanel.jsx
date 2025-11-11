import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Copy, Search, X, AlertCircle } from "lucide-react";

function ClipboardHistoryPanel() {
  const [clipboardHistory, setClipboardHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [panelPosition, setPanelPosition] = useState({ x: 100, y: 100 });
  const panelRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadClipboardHistory();
  }, []);

  useEffect(() => {
    // 设置面板初始位置
    handlePanelPosition();
  }, []);

  const loadClipboardHistory = async () => {
    try {
      const history = await window.electronAPI.getClipboardHistory();
      setClipboardHistory(history);
    } catch (error) {
      console.error("加载剪贴板历史失败:", error);
    }
  };

  const handleCopy = async (text) => {
    try {
      await window.electronAPI.copyToClipboard(text);
      // 可以添加复制成功的提示
    } catch (error) {
      console.error("复制失败:", error);
    }
  };

  const handlePanelPosition = () => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      const x = window.innerWidth - rect.width - 20;
      const y = window.innerHeight - rect.height - 20;

      setPanelPosition({ x, y });
    }
  };

  const filteredHistory = clipboardHistory.filter((item) =>
    item.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case "url":
        return "🔗";
      case "email":
        return "✉️";
      case "phone":
        return "📞";
      case "zipcode":
        return "📍";
      default:
        return "📝";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      ref={panelRef}
      className="fixed bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-200 z-50"
      style={{
        left: panelPosition.x,
        top: panelPosition.y,
        width: "400px",
        maxHeight: "600px",
        display: "none", // 默认隐藏，通过快捷键控制显示
      }}
    >
      {/* 面板头部 */}
      <CardHeader className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Copy className="w-5 h-5 mr-2" />
            剪贴板历史
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 搜索栏 */}
        <div className="mt-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索历史记录..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-8 text-sm"
            />
          </div>
        </div>
      </CardHeader>

      {/* 面板内容 */}
      <CardContent className="p-2">
        <ScrollArea className="h-[400px]">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? (
                <>
                  <Search className="w-8 h-8 mb-2 mx-auto opacity-50" />
                  <p>未找到匹配的记录</p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-8 h-8 mb-2 mx-auto opacity-50" />
                  <p>暂无剪贴板历史记录</p>
                  <p className="text-xs mt-1">开始复制内容以查看历史记录</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => handleCopy(item.text)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">
                          {getTypeIcon(item.type)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">
                        {item.text.length > 100
                          ? item.text.substring(0, 100) + "..."
                          : item.text}
                      </p>
                      {item.hasImage && (
                        <p className="text-xs text-gray-400 mt-1">包含图片</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(item.text);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </div>
  );
}

export default ClipboardHistoryPanel;
