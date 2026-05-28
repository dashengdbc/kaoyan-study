'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, BookOpen } from 'lucide-react';
import { useAppStore } from '@/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SubjectPracticePage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const { subjects, questions } = useAppStore();

  const subject = useMemo(
    () => subjects.find((s) => s.id === subjectId),
    [subjects, subjectId]
  );

  const subjectQuestions = useMemo(
    () => questions.filter((q) => q.subjectId === subjectId),
    [questions, subjectId]
  );

  const chapters = useMemo(() => {
    if (!subject) return [];
    return flattenChapters(subject.chapters);
  }, [subject]);

  if (!subject) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted">科目不存在</p>
        </div>
      </AppLayout>
    );
  }

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
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <Link href="/practice" className="p-2 hover:bg-hover rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{subject.name}</h1>
            <p className="text-muted mt-1">
              共 {subjectQuestions.length} 道题目
            </p>
          </div>
        </motion.div>

        {/* Chapter List */}
        {chapters.length > 0 ? (
          <div className="space-y-3">
            {chapters.map((chapter) => {
              const chapterQuestions = subjectQuestions.filter(
                (q) => q.chapterId === chapter.id
              );

              return (
                <motion.div key={chapter.id} variants={itemVariants}>
                  <Card variant="interactive">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: subject.color + '20' }}
                          >
                            <BookOpen className="w-5 h-5" style={{ color: subject.color }} />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">
                              {chapter.name}
                            </h3>
                            <p className="text-xs text-muted">
                              {chapterQuestions.length} 道题目 · 掌握度 {chapter.mastery}%
                            </p>
                          </div>
                        </div>
                        <Link href={`/practice/do/${chapter.id}`}>
                          <Button size="sm" disabled={chapterQuestions.length === 0}>
                            <Play className="w-4 h-4 mr-1" />
                            练习
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-muted mx-auto mb-4" />
                <p className="text-muted">暂无章节，请先在知识框架中添加</p>
                <Link href={`/knowledge/${subjectId}`}>
                  <Button className="mt-4" variant="secondary">
                    前往知识框架
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
}

function flattenChapters(chapters: any[], level = 0): any[] {
  return chapters.flatMap((chapter) => [
    { ...chapter, level },
    ...flattenChapters(chapter.children || [], level + 1),
  ]);
}
