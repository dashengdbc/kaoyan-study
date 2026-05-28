'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, Target } from 'lucide-react';
import { useAppStore } from '@/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function StatsPage() {
  const { subjects, tasks, questions, mistakes } = useAppStore();

  // 计算统计数据
  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 本周日期范围
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // 本月日期范围
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    // 今日任务
    const todayTasks = tasks.filter((t) => t.date === todayStr);
    const completedToday = todayTasks.filter((t) => t.completed).length;

    // 本周任务
    const weekTasks = tasks.filter((t) => t.date >= weekStartStr && t.date <= todayStr);
    const completedWeek = weekTasks.filter((t) => t.completed).length;

    // 本月任务
    const monthTasks = tasks.filter((t) => t.date >= monthStartStr && t.date <= todayStr);
    const completedMonth = monthTasks.filter((t) => t.completed).length;

    // 错题统计
    const totalMistakes = mistakes.length;
    const masteredMistakes = mistakes.filter((m) => m.mastered).length;

    // 各科题目数量
    const questionsBySubject = subjects.map((subject) => {
      const subjectQuestions = questions.filter((q) => q.subjectId === subject.id);
      const subjectMistakes = mistakes.filter((m) => {
        const question = questions.find((q) => q.id === m.questionId);
        return question?.subjectId === subject.id;
      });

      return {
        id: subject.id,
        name: subject.name,
        color: subject.color,
        totalQuestions: subjectQuestions.length,
        totalMistakes: subjectMistakes.length,
        masteredMistakes: subjectMistakes.filter((m) => m.mastered).length,
      };
    });

    // 近7天任务完成趋势
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = tasks.filter((t) => t.date === dateStr);
      const completed = dayTasks.filter((t) => t.completed).length;

      return {
        date: dateStr,
        day: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        total: dayTasks.length,
        completed,
      };
    });

    return {
      today: { total: todayTasks.length, completed: completedToday },
      week: { total: weekTasks.length, completed: completedWeek },
      month: { total: monthTasks.length, completed: completedMonth },
      mistakes: { total: totalMistakes, mastered: masteredMistakes },
      questionsBySubject,
      last7Days,
    };
  }, [subjects, tasks, questions, mistakes]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
        className="max-w-6xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-foreground">学习统计</h1>
          <p className="text-muted mt-1">查看学习进度和数据分析</p>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.today.completed}/{stats.today.total}
                    </p>
                    <p className="text-xs text-muted">今日任务</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.week.completed}/{stats.week.total}
                    </p>
                    <p className="text-xs text-muted">本周任务</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.month.completed}/{stats.month.total}
                    </p>
                    <p className="text-xs text-muted">本月任务</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.mistakes.mastered}/{stats.mistakes.total}
                    </p>
                    <p className="text-xs text-muted">错题掌握</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 7-Day Trend */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>近 7 天任务完成趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-between gap-2">
                {stats.last7Days.map((day, index) => {
                  const maxHeight = 160;
                  const height = day.total > 0 ? (day.completed / day.total) * maxHeight : 0;

                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end justify-center" style={{ height: maxHeight }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}px` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="w-full max-w-[40px] bg-primary rounded-t-md"
                        />
                      </div>
                      <span className="text-xs text-muted">{day.day}</span>
                      <span className="text-xs font-medium text-foreground">
                        {day.completed}/{day.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subject Stats */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>各科统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.questionsBySubject.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-card-border bg-card"
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: subject.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {subject.name}
                        </span>
                        <span className="text-xs text-muted">
                          {subject.totalQuestions} 题 · {subject.totalMistakes} 错题
                        </span>
                      </div>
                      <div className="h-2 bg-hover rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${
                              subject.totalMistakes > 0
                                ? (subject.masteredMistakes / subject.totalMistakes) * 100
                                : 0
                            }%`,
                            backgroundColor: subject.color,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted">
                      {subject.totalMistakes > 0
                        ? `${Math.round(
                            (subject.masteredMistakes / subject.totalMistakes) * 100
                          )}%`
                        : '0%'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
