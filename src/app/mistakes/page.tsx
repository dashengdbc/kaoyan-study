'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, Filter, Upload, FileText, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateId } from '@/lib/utils';

interface ImportedMistake {
  id: string;
  subjectId: string;
  content: string;
  source: string;
  importedAt: string;
}

export default function MistakesPage() {
  const { subjects, mistakes } = useAppStore();
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [importedMistakes, setImportedMistakes] = useState<ImportedMistake[]>([]);
  const [showImport, setShowImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMistakes = useMemo(() => {
    let filtered = importedMistakes;
    if (filterSubject) {
      filtered = filtered.filter((m) => m.subjectId === filterSubject);
    }
    return filtered;
  }, [importedMistakes, filterSubject]);

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of files) {
      const content = await readFileContent(file);
      const isMarkdown = file.name.endsWith('.md');
      const isPDF = file.name.endsWith('.pdf');

      if (isMarkdown || isPDF) {
        const mistake: ImportedMistake = {
          id: generateId(),
          subjectId: filterSubject || subjects[0]?.id || 'other',
          content: content,
          source: file.name,
          importedAt: new Date().toISOString(),
        };
        setImportedMistakes((prev) => [mistake, ...prev]);
      }
    }

    setShowImport(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsText(file);
    });
  };

  const handleDeleteMistake = (id: string) => {
    setImportedMistakes((prev) => prev.filter((m) => m.id !== id));
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
        className="max-w-5xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">错题本</h1>
            <p className="text-muted mt-1">导入和管理错题</p>
          </div>
          <Button onClick={() => setShowImport(true)} size="sm">
            <Upload className="w-4 h-4 mr-2" />
            导入错题
          </Button>
        </motion.div>

        {/* Filter */}
        <motion.div variants={itemVariants} className="flex gap-3">
          <div className="relative">
            <select
              value={filterSubject || ''}
              onChange={(e) => setFilterSubject(e.target.value || null)}
              className="appearance-none bg-input-bg border border-input-border rounded-md px-3 py-2 pr-8 text-sm"
            >
              <option value="">全部科目</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{filteredMistakes.length}</p>
                    <p className="text-xs text-muted">总错题数</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Mistake List */}
        <motion.div variants={itemVariants}>
          <AnimatePresence>
            {filteredMistakes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
                <p className="text-muted">
                  {importedMistakes.length === 0
                    ? '暂无错题，点击上方按钮导入'
                    : '没有符合筛选条件的错题'}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredMistakes.map((mistake) => {
                  const subject = subjects.find((s) => s.id === mistake.subjectId);

                  return (
                    <motion.div
                      key={mistake.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: subject?.color || '#8B5CF6' }}
                                />
                                <span className="text-xs text-muted">
                                  {subject?.name || '未分类'} · {mistake.source}
                                </span>
                              </div>
                              <div className="text-sm text-foreground whitespace-pre-wrap">
                                {mistake.content}
                              </div>
                              <div className="text-xs text-muted mt-2">
                                导入时间: {new Date(mistake.importedAt).toLocaleDateString('zh-CN')}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteMistake(mistake.id)}
                              className="p-2 hover:bg-hover rounded text-muted hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Import Modal */}
        <AnimatePresence>
          {showImport && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowImport(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card border border-card-border rounded-lg p-6 w-full max-w-md"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">导入错题</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      选择科目
                    </label>
                    <select
                      value={filterSubject || subjects[0]?.id || ''}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input-border bg-input-bg text-foreground"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      选择文件（支持 .md 和 .pdf）
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".md,.pdf"
                      multiple
                      onChange={handleImportFile}
                      className="w-full h-10 px-3 rounded-md border border-input-border bg-input-bg text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-hover"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setShowImport(false)}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
}
