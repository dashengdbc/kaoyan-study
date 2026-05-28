'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Edit, Image, FileText, Upload } from 'lucide-react';
import { useAppStore } from '@/store';
import { useNotesStore } from '@/store/notesStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { extractTextFromPDF, readMarkdownFile, downloadMarkdown } from '@/lib/pdfParser';

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

  useEffect(() => {
    const note = getNoteById(noteId);
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSubjectId(note.subjectId);
    }
  }, [noteId, getNoteById]);

  const subject = subjects.find((s) => s.id === subjectId);

  const handleSave = () => {
    updateNote(noteId, { title, content, subjectId });
    alert('保存成功！');
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateNote(noteId, { title: newTitle });
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let text = '';

      if (file.name.endsWith('.md')) {
        text = await readMarkdownFile(file);
      } else if (file.name.endsWith('.pdf')) {
        text = await extractTextFromPDF(file);
      }

      if (text) {
        setContent((prev) => prev + '\n\n' + text);
      }
    } catch (error) {
      console.error('Error importing file:', error);
      alert('导入文件失败');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const imageMarkdown = `![${file.name}](${base64})`;
        setContent((prev) => prev + '\n\n' + imageMarkdown);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error importing image:', error);
      alert('导入图片失败');
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleExportMd = () => {
    const exportContent = `# ${title}\n\n${content}`;
    downloadMarkdown(exportContent, `${title}.md`);
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
            <button
              onClick={() => setIsEditing(true)}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                isEditing ? 'bg-primary text-white' : 'bg-hover text-foreground hover:bg-active'
              }`}
            >
              <Edit className="w-4 h-4" />
              编辑
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                !isEditing ? 'bg-primary text-white' : 'bg-hover text-foreground hover:bg-active'
              }`}
            >
              <Eye className="w-4 h-4" />
              预览
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
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
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-3 py-2 bg-hover text-foreground rounded-md text-sm hover:bg-active transition-colors"
          >
            <FileText className="w-4 h-4" />
            导入文件
          </button>
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-1 px-3 py-2 bg-hover text-foreground rounded-md text-sm hover:bg-active transition-colors"
          >
            <Image className="w-4 h-4" />
            插入图片
          </button>
          <div className="flex-1" />
          <button
            onClick={handleExportMd}
            className="flex items-center gap-1 px-3 py-2 bg-hover text-foreground rounded-md text-sm hover:bg-active transition-colors"
          >
            <Upload className="w-4 h-4" />
            导出 MD
          </button>
        </div>

        {/* Editor */}
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[400px] p-6 bg-card border border-card-border rounded-lg text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="使用 Markdown 编写笔记...

支持的语法：
# 标题
**粗体** *斜体*
- 列表
![图片描述](图片地址)

点击上方按钮可导入文件或插入图片"
          />
        ) : (
          <div className="flex-1 min-h-[400px] p-6 bg-card border border-card-border rounded-lg overflow-y-auto">
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: simpleMarkdownToHtml(content),
              }}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function simpleMarkdownToHtml(md: string): string {
  if (!md) return '<p class="text-muted">暂无内容</p>';

  // Handle images
  let html = md.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />'
  );

  // Handle headers
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-10 mb-4">$1</h1>');

  // Handle formatting
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Handle lists
  html = html.replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">$1</li>');

  // Handle line breaks
  html = html.replace(/\n\n/g, '</p><p class="mb-4">');
  html = html.replace(/\n/g, '<br>');

  // Wrap in paragraph
  html = '<p class="mb-4">' + html + '</p>';

  return html;
}
