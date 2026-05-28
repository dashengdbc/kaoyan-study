import { useNotesStore } from '@/store/notesStore';

// Export a single note as markdown
export function exportNoteAsMarkdown(note: { title: string; content: string }): string {
  return `# ${note.title}\n\n${note.content}`;
}

// Export all notes as individual markdown files
export function exportAllNotes(): { filename: string; content: string }[] {
  const { notes } = useNotesStore.getState();

  return notes.map((note) => ({
    filename: `${note.title}.md`,
    content: exportNoteAsMarkdown(note),
  }));
}

// Parse markdown content to extract title and content
export function parseMarkdownFile(content: string): { title: string; content: string } {
  const lines = content.split('\n');

  // Try to find title from first heading
  let title = '';
  let contentStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('# ')) {
      title = line.substring(2).trim();
      contentStart = i + 1;
      break;
    }
  }

  // If no heading found, use first non-empty line as title
  if (!title) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim()) {
        title = lines[i].trim();
        contentStart = i + 1;
        break;
      }
    }
  }

  // Get remaining content
  const remainingContent = lines.slice(contentStart).join('\n').trim();

  return {
    title: title || 'Untitled',
    content: remainingContent,
  };
}

// Download content as file
export function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Read file as text
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
