'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, Filter } from 'lucide-react';
import { useAppStore } from '@/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateId, formatDate } from '@/lib/utils';
import { Task } from '@/types';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const TASK_TYPES = [
  { value: 'study', label: '学习', color: 'bg-blue-500' },
  { value: 'practice', label: '练习', color: 'bg-green-500' },
  { value: 'review', label: '复习', color: 'bg-purple-500' },
];

export default function PlanPage() {
  const { subjects, tasks, addTask, toggleTask, deleteTask } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [showAddTask, setShowAddTask] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    subjectId: subjects[0]?.id || '',
    type: 'study' as Task['type'],
  });

  // 获取当前月份的日历数据
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (number | null)[] = [];

    // 填充月初空白
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // 填充日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [currentDate]);

  // 获取选中日期的任务
  const selectedDateTasks = useMemo(() => {
    let filtered = tasks.filter((t) => t.date === selectedDate);
    if (filterSubject) {
      filtered = filtered.filter((t) => t.subjectId === filterSubject);
    }
    return filtered;
  }, [tasks, selectedDate, filterSubject]);

  // 获取有任务的日期
  const datesWithTasks = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
    return new Set(
      tasks
        .filter((t) => t.date.startsWith(prefix))
        .map((t) => t.date.split('-')[2])
    );
  }, [tasks, currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: generateId(),
      subjectId: newTask.subjectId,
      title: newTask.title,
      date: selectedDate,
      completed: false,
      type: newTask.type,
    };

    addTask(task);
    setNewTask({ title: '', subjectId: subjects[0]?.id || '', type: 'study' });
    setShowAddTask(false);
  };

  const handleSelectDate = (day: number) => {
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    setSelectedDate(`${currentDate.getFullYear()}-${month}-${dayStr}`);
  };

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">学习计划</h1>
          <Button onClick={() => setShowAddTask(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            添加任务
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-hover rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <CardTitle>
                  {currentDate.getFullYear()} 年 {currentDate.getMonth() + 1} 月
                </CardTitle>
                <button onClick={handleNextMonth} className="p-2 hover:bg-hover rounded-lg">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {/* Weekday headers */}
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="h-10 flex items-center justify-center text-sm font-medium text-muted"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="h-12" />;
                  }

                  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                  const dayStr = String(day).padStart(2, '0');
                  const dateStr = `${currentDate.getFullYear()}-${month}-${dayStr}`;
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === formatDate(new Date());
                  const hasTask = datesWithTasks.has(dayStr);

                  return (
                    <motion.button
                      key={day}
                      onClick={() => handleSelectDate(day)}
                      className={`h-12 rounded-lg flex flex-col items-center justify-center relative transition-colors ${
                        isSelected
                          ? 'bg-primary text-white'
                          : isToday
                          ? 'bg-hover text-foreground'
                          : 'hover:bg-hover text-foreground'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-sm font-medium">{day}</span>
                      {hasTask && !isSelected && (
                        <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Task List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedDate.split('-').slice(1).join('月')}日 任务
                </CardTitle>
                <div className="relative">
                  <select
                    value={filterSubject || ''}
                    onChange={(e) => setFilterSubject(e.target.value || null)}
                    className="appearance-none bg-input-bg border border-input-border rounded-md px-3 py-1.5 text-sm pr-8"
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
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {selectedDateTasks.length === 0 ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-muted text-center py-8"
                  >
                    暂无任务
                  </motion.p>
                ) : (
                  <div className="space-y-2">
                    {selectedDateTasks.map((task) => {
                      const subject = getSubjectById(task.subjectId);
                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`flex items-center gap-3 p-3 rounded-lg border border-card-border bg-card ${
                            task.completed ? 'opacity-60' : ''
                          }`}
                        >
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              task.completed
                                ? 'bg-primary border-primary'
                                : 'border-card-border hover:border-primary'
                            }`}
                          >
                            {task.completed && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
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
                            {TASK_TYPES.find((t) => t.value === task.type)?.label}
                          </span>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 hover:bg-hover rounded text-muted hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Add Task Modal */}
        <AnimatePresence>
          {showAddTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowAddTask(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card border border-card-border rounded-lg p-6 w-full max-w-md"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">添加学习任务</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      任务标题
                    </label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="例如：复习高数第三章"
                      className="w-full h-10 px-3 rounded-md border border-input-border bg-input-bg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      科目
                    </label>
                    <select
                      value={newTask.subjectId}
                      onChange={(e) => setNewTask({ ...newTask, subjectId: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input-border bg-input-bg text-foreground"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      任务类型
                    </label>
                    <div className="flex gap-2">
                      {TASK_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setNewTask({ ...newTask, type: type.value as Task['type'] })}
                          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                            newTask.type === type.value
                              ? 'bg-primary text-white'
                              : 'bg-hover text-foreground hover:bg-active'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setShowAddTask(false)}
                    >
                      取消
                    </Button>
                    <Button className="flex-1" onClick={handleAddTask}>
                      添加
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
