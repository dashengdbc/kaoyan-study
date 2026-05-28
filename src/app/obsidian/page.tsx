'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Unlink, RefreshCw, Download, Upload, FileText, Folder, Check, X } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ObsidianClient,
  ObsidianConfig,
  getObsidianClient,
  saveObsidianConfig,
  loadObsidianConfig,
} from '@/lib/obsidian';
import { useNotesStore } from '@/store/notesStore';

export default function ObsidianPage() {
  const { notes, addNote, updateNote } = useNotesStore();
  const [config, setConfig] = useState<ObsidianConfig>({
    host: 'localhost',
    port: 27123,
    apiKey: '',
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [obsidianFiles, setObsidianFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [syncStatus, setSyncStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    const savedConfig = loadObsidianConfig();
    if (savedConfig) {
      setConfig(savedConfig);
    }
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    setSyncStatus({ type: null, message: '' });

    const client = getObsidianClient(config);
    const connected = await client.testConnection();

    if (connected) {
      setIsConnected(true);
      saveObsidianConfig(config);
      setSyncStatus({ type: 'success', message: '连接成功！' });

      // Load file list
      const files = await client.listFiles();
      setObsidianFiles(files.filter((f) => f.endsWith('.md')));
    } else {
      setIsConnected(false);
      setSyncStatus({
        type: 'error',
        message: '连接失败。请确保 Obsidian 已打开且 Local REST API 插件已启用。',
      });
    }

    setIsLoading(false);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setObsidianFiles([]);
    setSelectedFiles(new Set());
  };

  const handleToggleFile = (file: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(file)) {
        next.delete(file);
      } else {
        next.add(file);
      }
      return next;
    });
  };

  const handleImportFromObsidian = async () => {
    if (selectedFiles.size === 0) {
      setSyncStatus({ type: 'error', message: '请先选择要导入的文件' });
      return;
    }

    setIsLoading(true);
    const client = getObsidianClient();
    let importedCount = 0;

    for (const file of selectedFiles) {
      const content = await client.readFile(file);
      if (content !== null) {
        const title = file.replace('.md', '').split('/').pop() || file;
        const existingNote = notes.find((n) => n.title === title);

        if (existingNote) {
          updateNote(existingNote.id, { content });
        } else {
          addNote({
            title,
            content,
            subjectId: 'other',
          });
        }
        importedCount++;
      }
    }

    setSyncStatus({
      type: 'success',
      message: `成功导入 ${importedCount} 个文件`,
    });
    setIsLoading(false);
  };

  const handleExportToObsidian = async () => {
    if (notes.length === 0) {
      setSyncStatus({ type: 'error', message: '没有可导出的笔记' });
      return;
    }

    setIsLoading(true);
    const client = getObsidianClient();
    let exportedCount = 0;

    for (const note of notes) {
      const path = `考研助手/${note.title}.md`;
      const content = `# ${note.title}\n\n${note.content}`;
      const success = await client.createFile(path, content);
      if (success) {
        exportedCount++;
      }
    }

    setSyncStatus({
      type: 'success',
      message: `成功导出 ${exportedCount} 个笔记到 Obsidian`,
    });
    setIsLoading(false);
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
        className="max-w-4xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-foreground">Obsidian 同步</h1>
          <p className="text-muted mt-1">与 Obsidian 笔记库双向同步</p>
        </motion.div>

        {/* Connection Status */}
        {syncStatus.type && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-center gap-3 ${
              syncStatus.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-red-500/10 border border-red-500/30'
            }`}
          >
            {syncStatus.type === 'success' ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <X className="w-5 h-5 text-red-500" />
            )}
            <span
              className={syncStatus.type === 'success' ? 'text-green-500' : 'text-red-500'}
            >
              {syncStatus.message}
            </span>
          </motion.div>
        )}

        {/* Connection Settings */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isConnected ? (
                  <Link2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Unlink className="w-5 h-5 text-muted" />
                )}
                连接设置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      主机地址
                    </label>
                    <input
                      type="text"
                      value={config.host}
                      onChange={(e) => setConfig({ ...config, host: e.target.value })}
                      disabled={isConnected}
                      className="w-full h-10 px-3 rounded-md border border-input-border bg-input-bg text-foreground disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      端口
                    </label>
                    <input
                      type="number"
                      value={config.port}
                      onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 27123 })}
                      disabled={isConnected}
                      className="w-full h-10 px-3 rounded-md border border-input-border bg-input-bg text-foreground disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      API 密钥（可选）
                    </label>
                    <input
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      disabled={isConnected}
                      placeholder="如已设置密钥"
                      className="w-full h-10 px-3 rounded-md border border-input-border bg-input-bg text-foreground placeholder:text-muted disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  {!isConnected ? (
                    <Button onClick={handleConnect} isLoading={isLoading}>
                      <Link2 className="w-4 h-4 mr-2" />
                      连接
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={handleDisconnect}>
                      <Unlink className="w-4 h-4 mr-2" />
                      断开连接
                    </Button>
                  )}
                </div>

                <div className="p-4 bg-hover rounded-lg text-sm text-muted">
                  <p className="font-medium text-foreground mb-2">使用说明：</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>确保 Obsidian 已打开</li>
                    <li>安装并启用 <strong>Local REST API</strong> 插件</li>
                    <li>在 Obsidian 设置中查看插件的端口和密钥</li>
                    <li>输入对应信息后点击"连接"</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sync Actions */}
        {isConnected && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>同步操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-card-border rounded-lg">
                    <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      从 Obsidian 导入
                    </h3>
                    <p className="text-sm text-muted mb-4">
                      选择 Obsidian 中的文件导入到考研助手
                    </p>
                    <Button
                      onClick={handleImportFromObsidian}
                      isLoading={isLoading}
                      disabled={selectedFiles.size === 0}
                      className="w-full"
                    >
                      导入已选文件 ({selectedFiles.size})
                    </Button>
                  </div>

                  <div className="p-4 border border-card-border rounded-lg">
                    <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      导出到 Obsidian
                    </h3>
                    <p className="text-sm text-muted mb-4">
                      将考研助手的笔记导出到 Obsidian 的"考研助手"文件夹
                    </p>
                    <Button
                      onClick={handleExportToObsidian}
                      isLoading={isLoading}
                      className="w-full"
                    >
                      导出所有笔记 ({notes.length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* File List */}
        {isConnected && obsidianFiles.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Obsidian 文件</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const client = getObsidianClient();
                      const files = await client.listFiles();
                      setObsidianFiles(files.filter((f) => f.endsWith('.md')));
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    刷新
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {obsidianFiles.map((file) => (
                    <label
                      key={file}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-hover cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file)}
                        onChange={() => handleToggleFile(file)}
                        className="w-4 h-4 rounded border-input-border"
                      />
                      <FileText className="w-4 h-4 text-muted" />
                      <span className="text-sm text-foreground flex-1">{file}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
}
