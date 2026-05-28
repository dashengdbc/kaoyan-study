import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Task, Question, MistakeRecord, Subject } from '@/types';
import { sampleQuestions } from '@/lib/sampleData';

interface AppStore extends AppState {
  // 任务操作
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  // 题目操作
  addQuestion: (question: Question) => void;

  // 错题操作
  addMistake: (questionId: string, wrongAnswer: number) => void;
  reviewMistake: (questionId: string, isCorrect: boolean) => void;

  // 科目操作
  updateChapterMastery: (subjectId: string, chapterId: string, mastery: number) => void;
  updateChapterNote: (subjectId: string, chapterId: string, content: string) => void;

  // 学习连续天数
  updateStreak: () => void;
}

const defaultSubjects: Subject[] = [
  {
    id: 'politics',
    name: '政治',
    color: '#EF4444',
    chapters: [
      {
        id: 'politics-marxism',
        name: '马克思主义原理',
        children: [
          { id: 'politics-materialism', name: '唯物论', children: [], noteContent: '', mastery: 0 },
          { id: 'politics-dialectics', name: '辩证法', children: [], noteContent: '', mastery: 0 },
          { id: 'politics-epistemology', name: '认识论', children: [], noteContent: '', mastery: 0 },
          { id: 'politics-historical-materialism', name: '唯物史观', children: [], noteContent: '', mastery: 0 },
        ],
        noteContent: '',
        mastery: 0,
      },
      { id: 'politics-maoism', name: '毛泽东思想和中国特色社会主义理论体系概论', children: [], noteContent: '', mastery: 0 },
      { id: 'politics-history', name: '中国近现代史纲要', children: [], noteContent: '', mastery: 0 },
      { id: 'politics-ethics', name: '思想道德修养与法律基础', children: [], noteContent: '', mastery: 0 },
      { id: 'politics-current', name: '形势与政策', children: [], noteContent: '', mastery: 0 },
    ],
  },
  {
    id: 'english',
    name: '英语',
    color: '#3B82F6',
    chapters: [
      { id: 'english-reading', name: '阅读理解', children: [], noteContent: '', mastery: 0 },
      { id: 'english-writing', name: '写作', children: [], noteContent: '', mastery: 0 },
      { id: 'english-translation', name: '翻译', children: [], noteContent: '', mastery: 0 },
      { id: 'english-cloze', name: '完形填空', children: [], noteContent: '', mastery: 0 },
      { id: 'english-vocabulary', name: '词汇', children: [], noteContent: '', mastery: 0 },
    ],
  },
  {
    id: 'math',
    name: '数学',
    color: '#10B981',
    chapters: [
      {
        id: 'math-calculus',
        name: '高等数学',
        children: [
          { id: 'math-limit', name: '函数、极限、连续', children: [], noteContent: '', mastery: 0 },
          { id: 'math-derivative', name: '一元函数微分学', children: [], noteContent: '', mastery: 0 },
          { id: 'math-integral', name: '一元函数积分学', children: [], noteContent: '', mastery: 0 },
          { id: 'math-multi-derivative', name: '多元函数微分学', children: [], noteContent: '', mastery: 0 },
          { id: 'math-multi-integral', name: '多元函数积分学', children: [], noteContent: '', mastery: 0 },
          { id: 'math-ode', name: '常微分方程', children: [], noteContent: '', mastery: 0 },
          { id: 'math-series', name: '无穷级数', children: [], noteContent: '', mastery: 0 },
        ],
        noteContent: '',
        mastery: 0,
      },
      {
        id: 'math-linear-algebra',
        name: '线性代数',
        children: [
          { id: 'math-determinant', name: '行列式', children: [], noteContent: '', mastery: 0 },
          { id: 'math-matrix', name: '矩阵', children: [], noteContent: '', mastery: 0 },
          { id: 'math-vector', name: '向量', children: [], noteContent: '', mastery: 0 },
          { id: 'math-equation', name: '线性方程组', children: [], noteContent: '', mastery: 0 },
          { id: 'math-eigenvalue', name: '特征值与特征向量', children: [], noteContent: '', mastery: 0 },
          { id: 'math-quadratic', name: '二次型', children: [], noteContent: '', mastery: 0 },
        ],
        noteContent: '',
        mastery: 0,
      },
      {
        id: 'math-probability',
        name: '概率论与数理统计',
        children: [
          { id: 'math-event', name: '随机事件与概率', children: [], noteContent: '', mastery: 0 },
          { id: 'math-random-variable', name: '随机变量及其分布', children: [], noteContent: '', mastery: 0 },
          { id: 'math-multi-variable', name: '多维随机变量', children: [], noteContent: '', mastery: 0 },
          { id: 'math-expectation', name: '随机变量的数字特征', children: [], noteContent: '', mastery: 0 },
          { id: 'math-law-large', name: '大数定律与中心极限定理', children: [], noteContent: '', mastery: 0 },
          { id: 'math-statistics', name: '数理统计', children: [], noteContent: '', mastery: 0 },
        ],
        noteContent: '',
        mastery: 0,
      },
    ],
  },
  {
    id: 'professional',
    name: '专业课',
    color: '#8B5CF6',
    chapters: [
      { id: 'professional-ds', name: '数据结构', children: [], noteContent: '', mastery: 0 },
      { id: 'professional-algo', name: '算法设计与分析', children: [], noteContent: '', mastery: 0 },
      { id: 'professional-network', name: '计算机网络', children: [], noteContent: '', mastery: 0 },
      { id: 'professional-os', name: '操作系统', children: [], noteContent: '', mastery: 0 },
    ],
  },
];

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      subjects: defaultSubjects,
      tasks: [],
      questions: sampleQuestions,
      mistakes: [],
      streakDays: 0,
      lastStudyDate: '',

      addTask: (task) =>
        set((state) => ({ tasks: [...state.tasks, task] })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),

      addQuestion: (question) =>
        set((state) => ({ questions: [...state.questions, question] })),

      addMistake: (questionId, wrongAnswer) => {
        const today = new Date().toISOString().split('T')[0];
        const existingMistake = get().mistakes.find((m) => m.questionId === questionId);

        if (existingMistake) {
          set((state) => ({
            mistakes: state.mistakes.map((m) =>
              m.questionId === questionId
                ? { ...m, wrongAnswer, timestamp: Date.now() }
                : m
            ),
          }));
        } else {
          set((state) => ({
            mistakes: [
              ...state.mistakes,
              {
                questionId,
                wrongAnswer,
                timestamp: Date.now(),
                reviewCount: 0,
                nextReviewDate: today,
                mastered: false,
              },
            ],
          }));
        }
      },

      reviewMistake: (questionId, isCorrect) => {
        const mistake = get().mistakes.find((m) => m.questionId === questionId);
        if (!mistake) return;

        const today = new Date();
        let nextReviewDate: string;
        let mastered = false;
        let reviewCount = mistake.reviewCount;

        if (isCorrect) {
          reviewCount += 1;
          if (reviewCount >= 4) {
            mastered = true;
            nextReviewDate = today.toISOString().split('T')[0];
          } else {
            const daysToAdd = [3, 7, 15][reviewCount - 1] || 15;
            const nextDate = new Date(today);
            nextDate.setDate(nextDate.getDate() + daysToAdd);
            nextReviewDate = nextDate.toISOString().split('T')[0];
          }
        } else {
          reviewCount = 0;
          nextReviewDate = today.toISOString().split('T')[0];
        }

        set((state) => ({
          mistakes: state.mistakes.map((m) =>
            m.questionId === questionId
              ? { ...m, reviewCount, nextReviewDate, mastered }
              : m
          ),
        }));
      },

      updateChapterMastery: (subjectId, chapterId, mastery) =>
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === subjectId
              ? {
                  ...s,
                  chapters: updateChapterInTree(s.chapters, chapterId, { mastery }),
                }
              : s
          ),
        })),

      updateChapterNote: (subjectId, chapterId, content) =>
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === subjectId
              ? {
                  ...s,
                  chapters: updateChapterInTree(s.chapters, chapterId, { noteContent: content }),
                }
              : s
          ),
        })),

      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = get().lastStudyDate;

        if (lastDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate === yesterdayStr) {
          set((state) => ({
            streakDays: state.streakDays + 1,
            lastStudyDate: today,
          }));
        } else if (lastDate !== today) {
          set({ streakDays: 1, lastStudyDate: today });
        }
      },
    }),
    {
      name: 'kaoyan-study-storage',
    }
  )
);

function updateChapterInTree(
  chapters: any[],
  chapterId: string,
  updates: Partial<any>
): any[] {
  return chapters.map((chapter) => {
    if (chapter.id === chapterId) {
      return { ...chapter, ...updates };
    }
    if (chapter.children.length > 0) {
      return {
        ...chapter,
        children: updateChapterInTree(chapter.children, chapterId, updates),
      };
    }
    return chapter;
  });
}
