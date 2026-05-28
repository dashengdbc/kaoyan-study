import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getSubjectColor(subjectId: string): string {
  const colors: Record<string, string> = {
    politics: '#EF4444',
    english: '#3B82F6',
    math: '#10B981',
    professional: '#8B5CF6',
  };
  return colors[subjectId] || '#8B5CF6';
}
