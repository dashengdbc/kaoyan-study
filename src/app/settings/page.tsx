'use client';

import { useState, useRef } from 'react';
import { Download, Upload, Trash2, AlertCircle, CheckCircle, FileText, FolderOpen } from 'lucide-react';
import { useAppStore } from '@/store';
import { useNotesStore } from '@/store/notesStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { readMarkdownFile, downloadMarkdown, extractTextFromPDF } from '@/lib/pdfParser';

export default function SettingsPage() {
  const { subjects } = useAppStore();
  const { notes, addNote, deleteNote } = useNotesStore();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const mdInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleExportAllNotes = () => {
    if (notes.length === 0) {
      setMessage({ type: 'error', text: '没有可导出的笔记' });
      return;
    }

    notes.forEach((note, index) => {
      setTimeout(() => {
        const content = `# ${note.title}\n\n${note.content}`;
        downloadMarkdown(content, `${note.title}.md`);
      }, index * 200);
    });

    setMessage({ type: 'success', text: `正在导出 ${notes.length} 个笔记` });
  };

  const handleImportMdFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let importedCount = 0;

    for (const file of files) {
      try {
        if (file.name.endsWith('.md')) {
          const content = await readMarkdownFile(file);
          const title = file.name.replace('.md', '');

          addNote({
            title,
            content,
            subjectId: subjects[0]?.id || 'other',
          });

          importedCount++;
        }
      } catch (error) {
        console.error(`Error importing ${file.name}:`, error);
      }
    }

    setMessage({
      type: 'success',
      text: `成功导入 ${importedCount} 个 Markdown 文件`,
    });

    if (mdInputRef.current) {
      mdInputRef.current.value = '';
    }
  };

  const handleImportPdfFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let importedCount = 0;

    for (const file of files) {
      try {
        if (file.name.endsWith('.pdf')) {
          const content = await extractTextFromPDF(file);
          const title = file.name.replace('.pdf', '');

          addNote({
            title,
            content,
            subjectId: subjects[0]?.id || 'other',
          });

          importedCount++;
        }
      } catch (error) {
        console.error(`Error importing ${file.name}:`, error);
      }
    }

    setMessage({
      type: 'success',
      text: `成功导入 ${importedCount} 个 PDF 文件`,
    });

    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
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

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">设置</h1>
          <p className="text-muted mt-1">管理应用数据和备份</p>
        </div>

        {/* Message */}
        {message && (
          <div
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
              className={message.type === 'success' ? 'text-green-500' : 'text-red-500'}
            >
              {message.text}
            </span>
          </div>
        )}

        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle>导出笔记</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-card-border bg-card">
              <div>
                <h3 className="text-sm font-medium text-foreground">导出所有笔记</h3>
                <p className="text-xs text-muted mt-1">将所有笔记导出为 Markdown 文件（.md）</p>
              </div>
              <button
                onClick={handleExportAllNotes}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
              >
                <Download className="w-4 h-4" />
                导出 MD
              </button>
            </div>
            <div className="text-xs text-muted">
              <p>当前共有 {notes.length} 个笔记</p>
            </div>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle>导入笔记</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={mdInputRef}
              type="file"
              accept=".md"
              multiple
              onChange={handleImportMdFiles}
              className="hidden"
            />
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleImportPdfFiles}
              className="hidden"
            />

            <div className="flex items-center justify-between p-4 rounded-lg border border-card-border bg-card">
              <div>
                <h3 className="text-sm font-medium text-foreground">导入 Markdown 文件</h3>
                <p className="text-xs text-muted mt-1">从 .md 文件导入笔记</p>
              </div>
              <button
                onClick={() => mdInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-hover text-foreground rounded-md hover:bg-active transition-colors"
              >
                <Upload className="w-4 h-4" />
                导入 MD
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-card-border bg-card">
              <div>
                <h3 className="text-sm font-medium text-foreground">导入 PDF 文件</h3>
                <p className="text-xs text-muted mt-1">从 .pdf 文件提取文本并导入</p>
              </div>
              <button
                onClick={() => pdfInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-hover text-foreground rounded-md hover:bg-active transition-colors"
              >
                <FileText className="w-4 h-4" />
                导入 PDF
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
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
              <button
                onClick={handleClearData}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                清除
              </button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>关于</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted">
              <p>考研学习助手 v1.0.0</p>
              <p>一个面向 iPad 的 PWA 学习应用</p>
              <p>数据存储在浏览器本地，无需注册账号</p>
              <p>支持导入导出 Markdown 和 PDF 文件</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
