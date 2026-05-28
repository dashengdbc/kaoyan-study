// 科目
export interface Subject {
  id: string;
  name: string;
  color: string;
  chapters: Chapter[];
}

// 知识节点（章节）
export interface Chapter {
  id: string;
  name: string;
  children: Chapter[];
  noteContent: string;
  mastery: number; // 0-100
}

// 学习任务
export interface Task {
  id: string;
  subjectId: string;
  title: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  type: 'study' | 'practice' | 'review';
}

// 题目
export interface Question {
  id: string;
  subjectId: string;
  chapterId: string;
  content: string;
  options: string[];
  answer: number; // 0-3
  explanation: string;
}

// 错题记录
export interface MistakeRecord {
  questionId: string;
  wrongAnswer: number;
  timestamp: number;
  reviewCount: number;
  nextReviewDate: string;
  mastered: boolean;
}

// 应用全局状态
export interface AppState {
  subjects: Subject[];
  tasks: Task[];
  questions: Question[];
  mistakes: MistakeRecord[];
  streakDays: number;
  lastStudyDate: string;
}
