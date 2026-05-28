'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search, Filter, Trash2, Download, Upload } from 'lucide-react';
import { useAppStore } from '@/store';
import { useNotesStore } from '@/store/notesStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { extractTextFromPDF, readMarkdownFile, downloadMarkdown } from '@/lib/pdfParser';

export default function NotesPage() {
  const router = useRouter();
  const { subjects } = useAppStore();
  const { notes, addNote, deleteNote } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteSubject, setNewNoteSubject] = useState('');
  const [importSubject, setImportSubject] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize subject selection
  useState(() => {
    if (subjects.length > 0) {
      setNewNoteSubject(subjects[0].id);
      setImportSubject(subjects[0].id);
    }
  });

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    if (filterSubject) {
      filtered = filtered.filter((n) => n.subjectId === filterSubject);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query)
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [notes, filterSubject, searchQuery]);

  const handleCreateNote = () => {
    if (!newNoteTitle.trim()) {
      alert('请输入笔记标题');
      return;
    }

    const noteId = addNote({
      title: newNoteTitle.trim(),
      content: '',
      subjectId: newNoteSubject || subjects[0]?.id || 'other',
    });

    setNewNoteTitle('');
    setShowAddNote(false);

    // Navigate to the new note
    router.push(`/notes/${noteId}`);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('确定要删除这个笔记吗？')) {
      deleteNote(id);
    }
  };

  const handleExportNote = (note: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const content = `# ${note.title}\n\n${note.content}`;
    downloadMarkdown(content, `${note.title}.md`);
  };

  const handleImportFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let importedCount = 0;

    for (const file of files) {
      try {
        let content = '';
        let title = '';

        if (file.name.endsWith('.md')) {
          content = await readMarkdownFile(file);
          title = file.name.replace('.md', '');
        } else if (file.name.endsWith('.pdf')) {
          content = await extractTextFromPDF(file);
          title = file.name.replace('.pdf', '');
        } else {
          continue;
        }

        addNote({
          title: title,
          content: content,
          subjectId: importSubject || subjects[0]?.id || 'other',
        });

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

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">笔记</h1>
            <p className="text-muted mt-1">记录学习心得和知识要点</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-4 py-2 bg-hover text-foreground rounded-md hover:bg-active transition-colors"
            >
              <Upload className="w-4 h-4" />
              导入
            </button>
            <button
              onClick={() => setShowAddNote(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建笔记
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="搜索笔记..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-md border border-input-border bg-input-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative">
            <select
              value={filterSubject || ''}
              onChange={(e) => setFilterSubject(e.target.value || null)}
              className="appearance-none h-10 bg-input-bg border border-input-border rounded-md px-3 pr-8 text-sm"
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

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted">
              {notes.length === 0 ? '暂无笔记，点击上方按钮创建' : '没有符合筛选条件的笔记'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => {
              const subject = getSubjectById(note.subjectId);

              return (
                <div
                  key={note.id}
                  className="group bg-card border border-card-border rounded-lg p-4 hover:bg-hover transition-colors cursor-pointer"
                  onClick={() => router.push(`/notes/${note.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: subject?.color || '#8B5CF6' }}
                    />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleExportNote(note, e)}
                        className="p-1 hover:bg-active rounded text-muted hover:text-foreground"
                        title="导出为 Markdown"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        className="p-1 hover:bg-active rounded text-muted hover:text-red-500"
                        title="删除笔记"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-2">
                    {note.title}
                  </h3>
                  <p className="text-xs text-muted line-clamp-3 mb-3">
                    {note.content || '暂无内容'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{subject?.name || '未分类'}</span>
                    <span>{new Date(note.updatedAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Note Modal */}
        {showAddNote && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAddNote(false)}
          >
            <div
              className="bg-card border border-card-border rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">新建笔记</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    笔记标题
                  </label>
                  <input
                    type="text"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="例如：高数第三章笔记"
                    className="w-full h-10 px-3 rounded-md border border-input-border bg-input-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    所属科目
                  </label>
                  <select
                    value={newNoteSubject}
                    onChange={(e) => setNewNoteSubject(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input-border bg-input-bg text-foreground"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 py-2 px-4 bg-hover text-foreground rounded-md hover:bg-active transition-colors"
                    onClick={() => setShowAddNote(false)}
                  >
                    取消
                  </button>
                  <button
                    className="flex-1 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
                    onClick={handleCreateNote}
                  >
                    创建
                  </button>
                </div>
              </div>
            </div>
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
              <h2 className="text-lg font-semibold text-foreground mb-4">导入笔记</h2>
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
