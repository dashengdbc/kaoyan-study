'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { generateId, formatDate } from '@/lib/utils';

export function useInitData() {
  const { tasks, addTask, updateStreak } = useAppStore();

  useEffect(() => {
    // Update streak on app load
    updateStreak();

    // Add sample tasks if none exist
    if (tasks.length === 0) {
      const today = new Date();
      const todayStr = formatDate(today);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDate(tomorrow);

      const sampleTasks = [
        {
          id: generateId(),
          subjectId: 'math',
          title: '复习高数极限章节',
          date: todayStr,
          completed: false,
          type: 'study' as const,
        },
        {
          id: generateId(),
          subjectId: 'english',
          title: '背诵考研词汇 List 1',
          date: todayStr,
          completed: false,
          type: 'study' as const,
        },
        {
          id: generateId(),
          subjectId: 'politics',
          title: '做马原选择题',
          date: todayStr,
          completed: false,
          type: 'practice' as const,
        },
        {
          id: generateId(),
          subjectId: 'math',
          title: '练习线性代数习题',
          date: tomorrowStr,
          completed: false,
          type: 'practice' as const,
        },
        {
          id: generateId(),
          subjectId: 'english',
          title: '复习阅读理解技巧',
          date: tomorrowStr,
          completed: false,
          type: 'review' as const,
        },
      ];

      sampleTasks.forEach((task) => addTask(task));
    }
  }, []);
}
