'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search, Filter, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { useNotesStore } from '@/store/notesStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function NotesPage() {
  const { subjects } = useAppStore();
  const { notes, addNote, deleteNote } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    subjectId: subjects[0]?.id || '',
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

  const handleAddNote = () => {
    if (!newNote.title.trim()) return;

    addNote({
      title: newNote.title,
      content: '',
      subjectId: newNote.subjectId,
    });

    setNewNote({ title: '', subjectId: subjects[0]?.id || '' });
    setShowAddNote(false);
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
  };

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

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
            <h1 className="text-2xl font-bold text-foreground">笔记</h1>
            <p className="text-muted mt-1">记录学习心得和知识要点</p>
          </div>
          <Button onClick={() => setShowAddNote(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            新建笔记
          </Button>
        </motion.div>

        {/* Search and Filter */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
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
        </motion.div>

        {/* Notes List */}
        <motion.div variants={itemVariants}>
          <AnimatePresence>
            {filteredNotes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
                <p className="text-muted">
                  {notes.length === 0 ? '暂无笔记，点击上方按钮创建' : '没有符合筛选条件的笔记'}
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.map((note) => {
                  const subject = getSubjectById(note.subjectId);

                  return (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Card variant="interactive" className="group h-full">
                        <Link href={`/notes/${note.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div
                                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                                style={{ backgroundColor: subject?.color || '#8B5CF6' }}
                              />
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeleteNote(note.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-hover rounded text-muted hover:text-red-500 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-2">
                              {note.title}
                            </h3>
                            <p className="text-xs text-muted line-clamp-3 mb-3">
                              {note.content || '暂无内容'}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted">
                              <span>{subject?.name || '未分类'}</span>
                              <span>
                                {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Add Note Modal */}
        <AnimatePresence>
          {showAddNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowAddNote(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card border border-card-border rounded-lg p-6 w-full max-w-md"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">新建笔记</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      笔记标题
                    </label>
                    <input
                      type="text"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      placeholder="例如：高数第三章笔记"
                      className="w-full h-10 px-3 rounded-md border border-input-border bg-input-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      所属科目
                    </label>
                    <select
                      value={newNote.subjectId}
                      onChange={(e) => setNewNote({ ...newNote, subjectId: e.target.value })}
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
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setShowAddNote(false)}
                    >
                      取消
                    </Button>
                    <Button className="flex-1" onClick={handleAddNote}>
                      创建
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
