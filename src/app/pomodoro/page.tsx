'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, Coffee, BookOpen } from 'lucide-react';
import { useAppStore } from '@/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type TimerMode = 'focus' | 'break';

const TIMER_PRESETS = {
  focus: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

export default function PomodoroPage() {
  const { subjects, updateStreak } = useAppStore();
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '');

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer completed
      if (mode === 'focus') {
        setCompletedPomodoros((prev) => prev + 1);
        updateStreak();
        // Auto switch to break
        if (completedPomodoros > 0 && (completedPomodoros + 1) % 4 === 0) {
          setMode('break');
          setTimeLeft(TIMER_PRESETS.longBreak);
        } else {
          setMode('break');
          setTimeLeft(TIMER_PRESETS.shortBreak);
        }
      } else {
        // Break completed, switch to focus
        setMode('focus');
        setTimeLeft(TIMER_PRESETS.focus);
      }
      setIsRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, completedPomodoros, updateStreak]);

  const handleStartPause = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? TIMER_PRESETS.focus : TIMER_PRESETS.shortBreak);
  }, [mode]);

  const handleModeChange = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === 'focus' ? TIMER_PRESETS.focus : TIMER_PRESETS.shortBreak);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus'
    ? ((TIMER_PRESETS.focus - timeLeft) / TIMER_PRESETS.focus) * 100
    : ((TIMER_PRESETS.shortBreak - timeLeft) / TIMER_PRESETS.shortBreak) * 100;

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
        className="max-w-2xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-foreground">番茄钟</h1>
          <p className="text-muted mt-1">专注学习，高效休息</p>
        </motion.div>

        {/* Timer Card */}
        <motion.div variants={itemVariants}>
          <Card className="text-center">
            <CardContent className="p-8">
              {/* Mode Selector */}
              <div className="flex justify-center gap-2 mb-8">
                <button
                  onClick={() => handleModeChange('focus')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'focus'
                      ? 'bg-primary text-white'
                      : 'bg-hover text-foreground hover:bg-active'
                  }`}
                >
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  专注
                </button>
                <button
                  onClick={() => handleModeChange('break')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'break'
                      ? 'bg-green-500 text-white'
                      : 'bg-hover text-foreground hover:bg-active'
                  }`}
                >
                  <Coffee className="w-4 h-4 inline mr-1" />
                  休息
                </button>
              </div>

              {/* Timer Display */}
              <div className="relative w-48 h-48 mx-auto mb-8">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="var(--card-border)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke={mode === 'focus' ? 'var(--primary)' : '#10B981'}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '0 553' }}
                    animate={{
                      strokeDasharray: `${(progress / 100) * 553} 553`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-foreground font-mono">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-sm text-muted mt-1">
                    {mode === 'focus' ? '专注时间' : '休息时间'}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  onClick={handleStartPause}
                  className={mode === 'break' ? 'bg-green-500 hover:bg-green-600' : ''}
                >
                  {isRunning ? (
                    <Pause className="w-5 h-5 mr-2" />
                  ) : (
                    <Play className="w-5 h-5 mr-2" />
                  )}
                  {isRunning ? '暂停' : '开始'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subject Selector */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>学习科目</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedSubject === subject.id
                        ? 'text-white'
                        : 'bg-hover text-foreground hover:bg-active'
                    }`}
                    style={
                      selectedSubject === subject.id
                        ? { backgroundColor: subject.color }
                        : undefined
                    }
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>今日统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-hover">
                  <div className="text-3xl font-bold text-primary">{completedPomodoros}</div>
                  <p className="text-xs text-muted">完成番茄数</p>
                </div>
                <div className="p-4 rounded-lg bg-hover">
                  <div className="text-3xl font-bold text-foreground">
                    {Math.round((completedPomodoros * 25) / 60)}h
                  </div>
                  <p className="text-xs text-muted">专注时长</p>
                </div>
                <div className="p-4 rounded-lg bg-hover">
                  <div className="text-3xl font-bold text-green-500">
                    {Math.floor(completedPomodoros / 4)}
                  </div>
                  <p className="text-xs text-muted">完成轮次</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
