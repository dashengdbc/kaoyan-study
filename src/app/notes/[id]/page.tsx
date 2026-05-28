'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, Edit, Image, FileText, Upload } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.md')) {
      const text = await file.text();
      setContent((prev) => prev + '\n\n' + text);
    } else if (file.name.endsWith('.pdf')) {
      // For PDF, we'll add a reference note
      setContent((prev) => prev + `\n\n[PDF 文件: ${file.name}]`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert image to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const imageMarkdown = `![${file.name}](${base64})`;
      setContent((prev) => prev + '\n\n' + imageMarkdown);
    };
    reader.readAsDataURL(file);

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleExportMd = () => {
    const exportContent = `# ${title}\n\n${content}`;
    const blob = new Blob([exportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
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

        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-card border border-card-border rounded-lg">
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.pdf"
            onChange={handleImportFile}
            className="hidden"
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImportImage}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileText className="w-4 h-4 mr-1" />
            导入文件
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => imageInputRef.current?.click()}
          >
            <Image className="w-4 h-4 mr-1" />
            插入图片
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportMd}
          >
            <Upload className="w-4 h-4 mr-1" />
            导出 MD
          </Button>
        </div>

        {/* Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 min-h-0"
        >
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-full p-6 bg-card border border-card-border rounded-lg text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="使用 Markdown 编写笔记...

支持的语法：
# 标题
**粗体** *斜体*
- 列表
![图片描述](图片地址)

点击上方按钮可导入文件或插入图片"
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
  // Handle images
  let html = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />');

  // Handle headers
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-10 mb-4">$1</h1>');

  // Handle formatting
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Handle lists
  html = html.replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>');

  // Handle line breaks
  html = html.replace(/\n\n/g, '</p><p class="mb-4">');
  html = html.replace(/\n/g, '<br>');

  // Wrap in paragraph
  html = '<p class="mb-4">' + html + '</p>';

  return html;
}
