'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function PracticeDoPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.id as string;
  const { subjects, questions, addMistake, updateChapterMastery } = useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<{ questionId: string; correct: boolean }[]>([]);

  const chapterQuestions = useMemo(
    () => questions.filter((q) => q.chapterId === chapterId),
    [questions, chapterId]
  );

  const currentQuestion = chapterQuestions[currentIndex];
  const isFinished = currentIndex >= chapterQuestions.length;

  const handleSelectAnswer = useCallback((index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  }, [showResult]);

  const handleSubmit = useCallback(() => {
    if (selectedAnswer === null || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.answer;
    setShowResult(true);

    if (!isCorrect) {
      addMistake(currentQuestion.id, selectedAnswer);
    }

    setResults((prev) => [
      ...prev,
      { questionId: currentQuestion.id, correct: isCorrect },
    ]);
  }, [selectedAnswer, currentQuestion, addMistake]);

  const handleNext = useCallback(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setResults([]);
  }, []);

  const correctCount = results.filter((r) => r.correct).length;
  const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  // Find subject for this chapter
  const subject = useMemo(() => {
    for (const s of subjects) {
      const found = findChapterInTree(s.chapters, chapterId);
      if (found) return s;
    }
    return null;
  }, [subjects, chapterId]);

  if (chapterQuestions.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-muted">该章节暂无题目</p>
          <Button variant="secondary" onClick={() => router.back()}>
            返回
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (isFinished) {
    return (
      <AppLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center">练习完成！</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">{accuracy}%</div>
                <p className="text-muted">正确率</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-hover">
                  <div className="text-2xl font-bold text-foreground">{results.length}</div>
                  <p className="text-xs text-muted">总题数</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10">
                  <div className="text-2xl font-bold text-green-500">{correctCount}</div>
                  <p className="text-xs text-muted">正确</p>
                </div>
                <div className="p-4 rounded-lg bg-red-500/10">
                  <div className="text-2xl font-bold text-red-500">
                    {results.length - correctCount}
                  </div>
                  <p className="text-xs text-muted">错误</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={handleRestart}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  再做一次
                </Button>
                <Button className="flex-1" onClick={() => router.push('/practice')}>
                  返回列表
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          <span className="text-sm text-muted">
            {currentIndex + 1} / {chapterQuestions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-hover rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: subject?.color || '#7c3aed' }}
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / chapterQuestions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <p className="text-lg text-foreground mb-6">{currentQuestion.content}</p>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === currentQuestion.answer;
                    const showCorrect = showResult && isCorrect;
                    const showWrong = showResult && isSelected && !isCorrect;

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleSelectAnswer(index)}
                        disabled={showResult}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          showCorrect
                            ? 'border-green-500 bg-green-500/10'
                            : showWrong
                            ? 'border-red-500 bg-red-500/10'
                            : isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-card-border bg-card hover:border-primary/50'
                        }`}
                        whileHover={!showResult ? { scale: 1.01 } : undefined}
                        whileTap={!showResult ? { scale: 0.99 } : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              showCorrect
                                ? 'bg-green-500 text-white'
                                : showWrong
                                ? 'bg-red-500 text-white'
                                : isSelected
                                ? 'bg-primary text-white'
                                : 'bg-hover text-muted'
                            }`}
                          >
                            {showCorrect ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : showWrong ? (
                              <XCircle className="w-5 h-5" />
                            ) : (
                              String.fromCharCode(65 + index)
                            )}
                          </span>
                          <span className="text-foreground">{option}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showResult && currentQuestion.explanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 p-4 rounded-lg bg-hover border border-card-border"
                  >
                    <p className="text-sm font-medium text-foreground mb-2">解析</p>
                    <p className="text-sm text-muted">{currentQuestion.explanation}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          {!showResult ? (
            <Button onClick={handleSubmit} disabled={selectedAnswer === null}>
              提交答案
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {currentIndex < chapterQuestions.length - 1 ? (
                <>
                  下一题
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                '查看结果'
              )}
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function findChapterInTree(chapters: any[], chapterId: string): any | null {
  for (const chapter of chapters) {
    if (chapter.id === chapterId) return chapter;
    if (chapter.children) {
      const found = findChapterInTree(chapter.children, chapterId);
      if (found) return found;
    }
  }
  return null;
}
