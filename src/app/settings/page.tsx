'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import { useNotesStore } from '@/store/notesStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { exportData, importData, downloadJson, readFileAsText } from '@/lib/dataSync';

export default function SettingsPage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = exportData();
      const filename = `考研助手备份_${new Date().toISOString().split('T')[0]}.json`;
      downloadJson(data, filename);
      setMessage({ type: 'success', text: '数据导出成功' });
    } catch (error) {
      setMessage({ type: 'error', text: '导出失败' });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      const result = importData(content);
      setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    } catch (error) {
      setMessage({ type: 'error', text: '文件读取失败' });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
      useAppStore.setState({
        tasks: [],
        mistakes: [],
        streakDays: 0,
        lastStudyDate: '',
      });
      useNotesStore.setState({ notes: [] });
      setMessage({ type: 'success', text: '数据已清除' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-foreground">设置</h1>
          <p className="text-muted mt-1">管理应用数据和备份</p>
        </motion.div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-red-500/10 border border-red-500/30'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span
              className={
                message.type === 'success' ? 'text-green-500' : 'text-red-500'
              }
            >
              {message.text}
            </span>
          </motion.div>
        )}

        {/* Data Management */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>数据管理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-card-border bg-card">
                <div>
                  <h3 className="text-sm font-medium text-foreground">导出数据</h3>
                  <p className="text-xs text-muted mt-1">将所有数据导出为 JSON 文件</p>
                </div>
                <Button onClick={handleExport} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-card-border bg-card">
                <div>
                  <h3 className="text-sm font-medium text-foreground">导入数据</h3>
                  <p className="text-xs text-muted mt-1">从 JSON 文件恢复数据</p>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    size="sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    导入
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                <div>
                  <h3 className="text-sm font-medium text-red-500">清除所有数据</h3>
                  <p className="text-xs text-muted mt-1">删除所有学习数据，此操作不可恢复</p>
                </div>
                <Button variant="danger" onClick={handleClearData} size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  清除
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* About */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>关于</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted">
                <p>考研学习助手 v1.0.0</p>
                <p>一个面向 iPad 的 PWA 学习应用</p>
                <p>数据存储在浏览器本地，无需注册账号</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
