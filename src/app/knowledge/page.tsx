'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Network, ChevronRight, BookOpen } from 'lucide-react';
import { useAppStore } from '@/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function KnowledgePage() {
  const { subjects } = useAppStore();

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
          <h1 className="text-2xl font-bold text-foreground">知识框架</h1>
          <p className="text-muted mt-1">梳理各科目知识体系，标记掌握程度</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => {
            const totalChapters = countChapters(subject.chapters);
            const avgMastery = totalChapters > 0
              ? Math.round(sumMastery(subject.chapters) / totalChapters)
              : 0;

            return (
              <motion.div key={subject.id} variants={itemVariants}>
                <Link href={`/knowledge/${subject.id}`}>
                  <Card variant="interactive" className="group">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16">
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="var(--card-border)"
                              strokeWidth="4"
                              fill="none"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke={subject.color}
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 28}`}
                              strokeDashoffset={`${2 * Math.PI * 28 * (1 - avgMastery / 100)}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-semibold text-foreground">
                              {avgMastery}%
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {subject.name}
                          </h3>
                          <p className="text-sm text-muted">
                            {totalChapters > 0 ? `${totalChapters} 个章节` : '暂无章节'}
                          </p>
                          {subject.chapters.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {subject.chapters.slice(0, 3).map((chapter) => (
                                <span
                                  key={chapter.id}
                                  className="text-xs px-2 py-0.5 rounded bg-hover text-muted"
                                >
                                  {chapter.name}
                                </span>
                              ))}
                              {subject.chapters.length > 3 && (
                                <span className="text-xs text-muted">
                                  +{subject.chapters.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>学习概览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="p-3 rounded-lg border border-card-border bg-card"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {subject.name}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {subject.chapters.slice(0, 3).map((chapter) => (
                        <div key={chapter.id} className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-hover rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${chapter.mastery}%`,
                                backgroundColor: subject.color,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted w-8 text-right">
                            {chapter.mastery}%
                          </span>
                        </div>
                      ))}
                    </div>
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
