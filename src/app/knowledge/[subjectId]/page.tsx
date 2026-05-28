'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, ChevronDown, BookOpen, Edit, Check } from 'lucide-react';
import { useAppStore } from '@/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chapter } from '@/types';

export default function SubjectKnowledgePage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const { subjects, updateChapterMastery, updateChapterNote } = useAppStore();

  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [editingMastery, setEditingMastery] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');

  const subject = useMemo(
    () => subjects.find((s) => s.id === subjectId),
    [subjects, subjectId]
  );

  if (!subject) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted">科目不存在</p>
        </div>
      </AppLayout>
    );
  }

  const toggleExpand = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const handleMasteryChange = (chapterId: string, value: number) => {
    updateChapterMastery(subjectId, chapterId, Math.max(0, Math.min(100, value)));
    setEditingMastery(null);
  };

  const handleNoteSave = (chapterId: string) => {
    updateChapterNote(subjectId, chapterId, noteContent);
    setEditingNote(null);
  };

  const startEditNote = (chapterId: string, currentContent: string) => {
    setEditingNote(chapterId);
    setNoteContent(currentContent);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <Link href="/knowledge" className="p-2 hover:bg-hover rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: subject.color + '20' }}
            >
              <BookOpen className="w-5 h-5" style={{ color: subject.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{subject.name}</h1>
              <p className="text-muted mt-1">管理知识节点和掌握程度</p>
            </div>
          </div>
        </motion.div>

        {/* Chapter Tree */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              {subject.chapters.length === 0 ? (
                <p className="text-muted text-center py-8">暂无章节</p>
              ) : (
                <div className="space-y-1">
                  {subject.chapters.map((chapter) => (
                    <ChapterNode
                      key={chapter.id}
                      chapter={chapter}
                      subjectColor={subject.color}
                      level={0}
                      expandedChapters={expandedChapters}
                      onToggleExpand={toggleExpand}
                      editingMastery={editingMastery}
                      onEditMastery={setEditingMastery}
                      onMasteryChange={handleMasteryChange}
                      editingNote={editingNote}
                      onEditNote={startEditNote}
                      noteContent={noteContent}
                      onNoteContentChange={setNoteContent}
                      onSaveNote={handleNoteSave}
                      onCancelEditNote={() => setEditingNote(null)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}

interface ChapterNodeProps {
  chapter: Chapter;
  subjectColor: string;
  level: number;
  expandedChapters: Set<string>;
  onToggleExpand: (id: string) => void;
  editingMastery: string | null;
  onEditMastery: (id: string | null) => void;
  onMasteryChange: (id: string, value: number) => void;
  editingNote: string | null;
  onEditNote: (id: string, content: string) => void;
  noteContent: string;
  onNoteContentChange: (content: string) => void;
  onSaveNote: (id: string) => void;
  onCancelEditNote: () => void;
}

function ChapterNode({
  chapter,
  subjectColor,
  level,
  expandedChapters,
  onToggleExpand,
  editingMastery,
  onEditMastery,
  onMasteryChange,
  editingNote,
  onEditNote,
  noteContent,
  onNoteContentChange,
  onSaveNote,
  onCancelEditNote,
}: ChapterNodeProps) {
  const hasChildren = chapter.children.length > 0;
  const isExpanded = expandedChapters.has(chapter.id);
  const isEditingMastery = editingMastery === chapter.id;
  const isEditingNote = editingNote === chapter.id;

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-3 rounded-lg hover:bg-hover transition-colors`}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => onToggleExpand(chapter.id)}
            className="w-6 h-6 flex items-center justify-center text-muted hover:text-foreground"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground">{chapter.name}</span>
        </div>

        {/* Mastery */}
        <div className="flex items-center gap-2">
          {isEditingMastery ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                defaultValue={chapter.mastery}
                className="w-16 h-7 px-2 text-sm text-center border border-input-border bg-input-bg rounded"
                onBlur={(e) => onMasteryChange(chapter.id, Number(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onMasteryChange(chapter.id, Number((e.target as HTMLInputElement).value));
                  }
                }}
                autoFocus
              />
              <span className="text-xs text-muted">%</span>
            </div>
          ) : (
            <button
              onClick={() => onEditMastery(chapter.id)}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-active transition-colors"
            >
              <div className="w-16 h-1.5 bg-hover rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${chapter.mastery}%`,
                    backgroundColor: subjectColor,
                  }}
                />
              </div>
              <span className="text-xs text-muted w-8 text-right">{chapter.mastery}%</span>
            </button>
          )}

          <button
            onClick={() => onEditNote(chapter.id, chapter.noteContent)}
            className="p-1.5 hover:bg-hover rounded text-muted hover:text-foreground transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Note editing */}
      <AnimatePresence>
        {isEditingNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ paddingLeft: `${(level + 1) * 24 + 12}px` }}
          >
            <div className="p-3 border border-card-border rounded-lg bg-card mb-2">
              <textarea
                value={noteContent}
                onChange={(e) => onNoteContentChange(e.target.value)}
                placeholder="输入笔记内容..."
                className="w-full h-32 p-2 text-sm bg-input-bg border border-input-border rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button size="sm" variant="ghost" onClick={onCancelEditNote}>
                  取消
                </Button>
                <Button size="sm" onClick={() => onSaveNote(chapter.id)}>
                  <Check className="w-4 h-4 mr-1" />
                  保存
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {chapter.children.map((child) => (
              <ChapterNode
                key={child.id}
                chapter={child}
                subjectColor={subjectColor}
                level={level + 1}
                expandedChapters={expandedChapters}
                onToggleExpand={onToggleExpand}
                editingMastery={editingMastery}
                onEditMastery={onEditMastery}
                onMasteryChange={onMasteryChange}
                editingNote={editingNote}
                onEditNote={onEditNote}
                noteContent={noteContent}
                onNoteContentChange={onNoteContentChange}
                onSaveNote={onSaveNote}
                onCancelEditNote={onCancelEditNote}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
