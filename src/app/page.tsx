'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Target, TrendingUp, Clock } from 'lucide-react';
import { useAppStore } from '@/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

// 考研日期：2026年12月26日
const EXAM_DATE = new Date('2026-12-26');

function getDaysUntilExam() {
  const now = new Date();
  const diff = EXAM_DATE.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function DashboardPage() {
  const { subjects, tasks, streakDays } = useAppStore();
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    setDaysLeft(getDaysUntilExam());
  }, []);

  const todayTasks = tasks.filter((task) => {
    const today = new Date().toISOString().split('T')[0];
    return task.date === today;
  });

  const completedTodayTasks = todayTasks.filter((t) => t.completed);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-foreground">考研学习助手</h1>
          <p className="text-muted mt-1">坚持学习，每天进步一点点</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Countdown */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted">距离考研</CardTitle>
                <Calendar className="h-4 w-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{daysLeft}</div>
                <p className="text-xs text-muted">天</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's tasks */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted">今日任务</CardTitle>
                <Target className="h-4 w-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {completedTodayTasks.length}/{todayTasks.length}
                </div>
                <p className="text-xs text-muted">已完成</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted">连续学习</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">{streakDays}</div>
                <p className="text-xs text-muted">天</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Study time placeholder */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted">今日学习</CardTitle>
                <Clock className="h-4 w-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">0h</div>
                <p className="text-xs text-muted">学习时长</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Subject Progress */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>各科进度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {subjects.map((subject) => {
                  const totalChapters = countChapters(subject.chapters);
                  const avgMastery = totalChapters > 0
                    ? Math.round(sumMastery(subject.chapters) / totalChapters)
                    : 0;

                  return (
                    <div key={subject.id} className="flex flex-col items-center">
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="var(--card-border)"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke={subject.color}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - avgMastery / 100)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-semibold text-foreground">
                            {avgMastery}%
                          </span>
                        </div>
                      </div>
                      <span className="mt-2 text-sm font-medium text-foreground">
                        {subject.name}
                      </span>
                      <span className="text-xs text-muted">
                        {totalChapters} 个章节
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Task List */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>今日待办</CardTitle>
            </CardHeader>
            <CardContent>
              {todayTasks.length === 0 ? (
                <p className="text-muted text-center py-8">暂无任务，去学习计划页面添加吧</p>
              ) : (
                <div className="space-y-3">
                  {todayTasks.map((task) => {
                    const subject = subjects.find((s) => s.id === task.subjectId);
                    return (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          task.completed
                            ? 'border-card-border bg-card opacity-60'
                            : 'border-card-border bg-card'
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: subject?.color || '#8B5CF6' }}
                        />
                        <span
                          className={`flex-1 text-sm ${
                            task.completed ? 'line-through text-muted' : 'text-foreground'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-xs text-muted px-2 py-1 rounded bg-background">
                          {task.type === 'study' ? '学习' : task.type === 'practice' ? '练习' : '复习'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}

function countChapters(chapters: any[]): number {
  return chapters.reduce((count, chapter) => {
    return count + 1 + countChapters(chapter.children || []);
  }, 0);
}

function sumMastery(chapters: any[]): number {
  return chapters.reduce((sum, chapter) => {
    return sum + (chapter.mastery || 0) + sumMastery(chapter.children || []);
  }, 0);
}
