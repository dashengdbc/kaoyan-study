'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Play } from 'lucide-react';
import { useAppStore } from '@/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function PracticePage() {
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
          <h1 className="text-2xl font-bold text-foreground">刷题练习</h1>
          <p className="text-muted mt-1">选择科目开始练习</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => {
            const totalChapters = countChapters(subject.chapters);

            return (
              <motion.div key={subject.id} variants={itemVariants}>
                <Link href={`/practice/${subject.id}`}>
                  <Card variant="interactive" className="group">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: subject.color + '20' }}
                        >
                          <BookOpen className="w-6 h-6" style={{ color: subject.color }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {subject.name}
                          </h3>
                          <p className="text-sm text-muted">
                            {totalChapters > 0 ? `${totalChapters} 个章节` : '暂无章节'}
                          </p>
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

        {/* Quick Practice */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>快速练习</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted mb-4">随机抽取各科目题目进行综合练习</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">
                <Play className="w-4 h-4" />
                开始综合练习
              </button>
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
