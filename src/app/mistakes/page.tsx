'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Filter, Upload, FileText, Trash2, Download } from 'lucide-react';
import { useAppStore } from '@/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { extractTextFromPDF, readMarkdownFile, downloadMarkdown } from '@/lib/pdfParser';

interface ImportedMistake {
  id: string;
  subjectId: string;
  content: string;
  source: string;
  importedAt: string;
}

export default function MistakesPage() {
  const { subjects } = useAppStore();
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [importedMistakes, setImportedMistakes] = useState<ImportedMistake[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [importSubject, setImportSubject] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useState(() => {
    if (subjects.length > 0) {
      setImportSubject(subjects[0].id);
    }
  });

  const filteredMistakes = useMemo(() => {
    let filtered = importedMistakes;
    if (filterSubject) {
      filtered = filtered.filter((m) => m.subjectId === filterSubject);
    }
    return filtered;
  }, [importedMistakes, filterSubject]);

  const handleImportFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let importedCount = 0;

    for (const file of files) {
      try {
        let content = '';

        if (file.name.endsWith('.md')) {
          content = await readMarkdownFile(file);
        } else if (file.name.endsWith('.pdf')) {
          content = await extractTextFromPDF(file);
        } else {
          continue;
        }

        const mistake: ImportedMistake = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          subjectId: importSubject || subjects[0]?.id || 'other',
          content: content,
          source: file.name,
          importedAt: new Date().toISOString(),
        };

        setImportedMistakes((prev) => [mistake, ...prev]);
        importedCount++;
      } catch (error) {
        console.error(`Error importing ${file.name}:`, error);
      }
    }

    if (importedCount > 0) {
      alert(`成功导入 ${importedCount} 个文件`);
    }

    setShowImport(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteMistake = (id: string) => {
    if (confirm('确定要删除这个错题吗？')) {
      setImportedMistakes((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleExportMistake = (mistake: ImportedMistake) => {
    const subject = subjects.find((s) => s.id === mistake.subjectId);
    const content = `# ${mistake.source}\n\n科目: ${subject?.name || '未分类'}\n导入时间: ${new Date(mistake.importedAt).toLocaleDateString('zh-CN')}\n\n${mistake.content}`;
    downloadMarkdown(content, mistake.source.replace(/\.\w+$/, '.md'));
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">错题本</h1>
            <p className="text-muted mt-1">导入和管理错题</p>
          </div>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
          >
            <Upload className="w-4 h-4" />
            导入错题
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-3">
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
        </div>

        {/* Mistake List */}
        {filteredMistakes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted">
              {importedMistakes.length === 0
                ? '暂无错题，点击上方按钮导入'
                : '没有符合筛选条件的错题'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMistakes.map((mistake) => {
              const subject = subjects.find((s) => s.id === mistake.subjectId);

              return (
                <div
                  key={mistake.id}
                  className="bg-card border border-card-border rounded-lg p-4"
                >
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
                        <span className="text-xs text-muted">
                          · {new Date(mistake.importedAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <div className="text-sm text-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {mistake.content.substring(0, 500)}
                        {mistake.content.length > 500 && '...'}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleExportMistake(mistake)}
                        className="p-2 hover:bg-hover rounded text-muted hover:text-foreground"
                        title="导出为 Markdown"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMistake(mistake.id)}
                        className="p-2 hover:bg-hover rounded text-muted hover:text-red-500"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Import Modal */}
        {showImport && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowImport(false)}
          >
            <div
              className="bg-card border border-card-border rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">导入错题</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    选择科目
                  </label>
                  <select
                    value={importSubject}
                    onChange={(e) => setImportSubject(e.target.value)}
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
                    选择文件
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".md,.pdf"
                    multiple
                    onChange={handleImportFiles}
                    className="w-full h-10 px-3 rounded-md border border-input-border bg-input-bg text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-hover"
                  />
                  <p className="text-xs text-muted mt-2">支持 .md 和 .pdf 格式</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 py-2 px-4 bg-hover text-foreground rounded-md hover:bg-active transition-colors"
                    onClick={() => setShowImport(false)}
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
