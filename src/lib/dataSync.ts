import { useAppStore } from '@/store';
import { useNotesStore } from '@/store/notesStore';

export interface ExportData {
  version: string;
  exportedAt: string;
  appData: {
    subjects: any[];
    tasks: any[];
    questions: any[];
    mistakes: any[];
    streakDays: number;
    lastStudyDate: string;
  };
  notes: any[];
}

export function exportData(): string {
  const appState = useAppStore.getState();
  const notesState = useNotesStore.getState();

  const exportData: ExportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    appData: {
      subjects: appState.subjects,
      tasks: appState.tasks,
      questions: appState.questions,
      mistakes: appState.mistakes,
      streakDays: appState.streakDays,
      lastStudyDate: appState.lastStudyDate,
    },
    notes: notesState.notes,
  };

  return JSON.stringify(exportData, null, 2);
}

export function importData(jsonString: string): { success: boolean; message: string } {
  try {
    const data: ExportData = JSON.parse(jsonString);

    // Validate data structure
    if (!data.version || !data.appData || !data.notes) {
      return { success: false, message: '无效的数据格式' };
    }

    // Import app data
    const appStore = useAppStore.getState();
    useAppStore.setState({
      subjects: data.appData.subjects || appStore.subjects,
      tasks: data.appData.tasks || [],
      questions: data.appData.questions || [],
      mistakes: data.appData.mistakes || [],
      streakDays: data.appData.streakDays || 0,
      lastStudyDate: data.appData.lastStudyDate || '',
    });

    // Import notes
    useNotesStore.setState({
      notes: data.notes || [],
    });

    return { success: true, message: '数据导入成功' };
  } catch (error) {
    return { success: false, message: '数据解析失败，请检查文件格式' };
  }
}

export function downloadJson(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
