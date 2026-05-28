'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Trash2, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { useAppStore } from '@/store';
import { useNotesStore } from '@/store/notesStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportAllNotes = () => {
    const { notes } = useNotesStore.getState();

    if (notes.length === 0) {
      setMessage({ type: 'error', text: '没有可导出的笔记' });
      return;
    }

    // Export each note as a separate .md file
    notes.forEach((note, index) => {
      const content = `# ${note.title}\n\n${note.content}`;
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${note.title}.md`;
      document.body.appendChild(link);

      // Stagger downloads slightly
      setTimeout(() => {
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, index * 100);
    });

    setMessage({ type: 'success', text: `正在导出 ${notes.length} 个笔记` });
  };

  const handleImportMdFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const { addNote } = useNotesStore.getState();
    const { subjects } = useAppStore.getState();
    let importedCount = 0;

    for (const file of files) {
      if (file.name.endsWith('.md')) {
        const content = await file.text();
        const title = file.name.replace('.md', '');

        addNote({
          title,
          content,
          subjectId: subjects[0]?.id || 'other',
        });

        importedCount++;
      }
    }

    setMessage({
      type: 'success',
      text: `成功导入 ${importedCount} 个 Markdown 文件`,
    });

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
              <CardTitle>笔记管理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-card-border bg-card">
                <div>
                  <h3 className="text-sm font-medium text-foreground">导出笔记</h3>
                  <p className="text-xs text-muted mt-1">将所有笔记导出为 Markdown 文件</p>
                </div>
                <Button onClick={handleExportAllNotes} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  导出 MD
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-card-border bg-card">
                <div>
                  <h3 className="text-sm font-medium text-foreground">导入笔记</h3>
                  <p className="text-xs text-muted mt-1">从 Markdown 文件导入笔记</p>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".md"
                    multiple
                    onChange={handleImportMdFiles}
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    size="sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    导入 MD
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">危险操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                <div>
                  <h3 className="text-sm font-medium text-red-500">清除所有数据</h3>
                  <p className="text-xs text-muted mt-1">删除所有学习数据和笔记，此操作不可恢复</p>
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
                <p>支持与 Obsidian 双向同步</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
