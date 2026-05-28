'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, Edit } from 'lucide-react';
import { useAppStore } from '@/store';
import { useNotesStore } from '@/store/notesStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';

export default function NoteEditPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;
  const { subjects } = useAppStore();
  const { notes, updateNote, getNoteById } = useNotesStore();

  const [isEditing, setIsEditing] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState('');

  useEffect(() => {
    const note = getNoteById(noteId);
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSubjectId(note.subjectId);
    }
  }, [noteId, getNoteById]);

  const subject = useMemo(
    () => subjects.find((s) => s.id === subjectId),
    [subjects, subjectId]
  );

  const handleSave = () => {
    updateNote(noteId, { title, content, subjectId });
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateNote(noteId, { title: newTitle });
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/notes')}
              className="p-2 hover:bg-hover rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-xl font-bold text-foreground bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary rounded px-1"
                placeholder="笔记标题"
              />
              <p className="text-sm text-muted">
                {subject?.name || '未分类'} · 最后编辑: {new Date().toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isEditing ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4 mr-1" />
              编辑
            </Button>
            <Button
              variant={!isEditing ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              <Eye className="w-4 h-4 mr-1" />
              预览
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              保存
            </Button>
          </div>
        </div>

        {/* Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 min-h-0"
        >
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-full p-6 bg-card border border-card-border rounded-lg text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="使用 Markdown 编写笔记..."
            />
          ) : (
            <div className="h-full p-6 bg-card border border-card-border rounded-lg overflow-y-auto prose prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: simpleMarkdownToHtml(content),
                }}
              />
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}

function simpleMarkdownToHtml(md: string): string {
  return md
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/\n/g, '<br>');
}
