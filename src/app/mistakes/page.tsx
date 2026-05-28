'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, Filter, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function MistakesPage() {
  const { subjects, questions, mistakes, reviewMistake } = useAppStore();
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'mastered'>('all');

  const filteredMistakes = useMemo(() => {
    let filtered = mistakes;

    if (filterSubject) {
      const subjectQuestions = questions.filter((q) => q.subjectId === filterSubject);
      const questionIds = new Set(subjectQuestions.map((q) => q.id));
      filtered = filtered.filter((m) => questionIds.has(m.questionId));
    }

    if (filterStatus === 'pending') {
      filtered = filtered.filter((m) => !m.mastered);
    } else if (filterStatus === 'mastered') {
      filtered = filtered.filter((m) => m.mastered);
    }

    return filtered;
  }, [mistakes, questions, filterSubject, filterStatus]);

  const stats = useMemo(() => {
    const total = mistakes.length;
    const mastered = mistakes.filter((m) => m.mastered).length;
    const pending = total - mastered;
    const today = new Date().toISOString().split('T')[0];
    const dueToday = mistakes.filter(
      (m) => !m.mastered && m.nextReviewDate <= today
    ).length;

    return { total, mastered, pending, dueToday };
  }, [mistakes]);

  const getQuestionById = (id: string) => questions.find((q) => q.id === id);
  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

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
        className="max-w-5xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-foreground">错题本</h1>
          <p className="text-muted mt-1">复习错题，巩固薄弱知识点</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-xs text-muted">总错题数</p>
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
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.dueToday}</p>
                    <p className="text-xs text-muted">今日待复习</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                    <p className="text-xs text-muted">待掌握</p>
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
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.mastered}</p>
                    <p className="text-xs text-muted">已掌握</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
          <div className="relative">
            <select
              value={filterSubject || ''}
              onChange={(e) => setFilterSubject(e.target.value || null)}
              className="appearance-none bg-input-bg border border-input-border rounded-md px-3 py-2 text-sm pr-8"
            >
              <option value="">全部科目</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>

          <div className="flex gap-2">
            {[
              { value: 'all', label: '全部' },
              { value: 'pending', label: '待掌握' },
              { value: 'mastered', label: '已掌握' },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => setFilterStatus(status.value as typeof filterStatus)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === status.value
                    ? 'bg-primary text-white'
                    : 'bg-hover text-foreground hover:bg-active'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Mistake List */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <AnimatePresence>
                {filteredMistakes.length === 0 ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-muted text-center py-12"
                  >
                    {mistakes.length === 0
                      ? '暂无错题，继续保持！'
                      : '没有符合筛选条件的错题'}
                  </motion.p>
                ) : (
                  <div className="space-y-4">
                    {filteredMistakes.map((mistake) => {
                      const question = getQuestionById(mistake.questionId);
                      if (!question) return null;

                      const subject = getSubjectById(question.subjectId);
                      const today = new Date().toISOString().split('T')[0];
                      const isDue = !mistake.mastered && mistake.nextReviewDate <= today;

                      return (
                        <motion.div
                          key={mistake.questionId}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`p-4 rounded-lg border ${
                            mistake.mastered
                              ? 'border-green-500/30 bg-green-500/5'
                              : isDue
                              ? 'border-orange-500/30 bg-orange-500/5'
                              : 'border-card-border bg-card'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-2 h-2 rounded-full mt-2 shrink-0"
                              style={{ backgroundColor: subject?.color || '#8B5CF6' }}
                            />
                            <div className="flex-1">
                              <p className="text-sm text-foreground mb-2">{question.content}</p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {question.options.map((option, index) => (
                                  <span
                                    key={index}
                                    className={`text-xs px-2 py-1 rounded ${
                                      index === question.answer
                                        ? 'bg-green-500/20 text-green-500'
                                        : index === mistake.wrongAnswer
                                        ? 'bg-red-500/20 text-red-500'
                                        : 'bg-hover text-muted'
                                    }`}
                                  >
                                    {option}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted">
                                <span>
                                  复习次数: {mistake.reviewCount}/4
                                </span>
                                <span>
                                  {mistake.mastered ? (
                                    <span className="text-green-500">已掌握</span>
                                  ) : (
                                    <>下次复习: {mistake.nextReviewDate}</>
                                  )}
                                </span>
                              </div>
                            </div>
                            {!mistake.mastered && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => reviewMistake(mistake.questionId, false)}
                                >
                                  还不会
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => reviewMistake(mistake.questionId, true)}
                                >
                                  已掌握
                                </Button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
