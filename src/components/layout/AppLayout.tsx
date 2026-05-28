'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  AlertCircle,
  Timer,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useInitData } from '@/hooks/useInitData';

interface AppLayoutProps {
  children: React.ReactNode;
}

const mobileNavItems = [
  { href: '/', label: '首页', icon: LayoutDashboard },
  { href: '/plan', label: '计划', icon: Calendar },
  { href: '/practice', label: '刷题', icon: BookOpen },
  { href: '/pomodoro', label: '番茄钟', icon: Timer },
  { href: '/mistakes', label: '错题', icon: AlertCircle },
];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  useInitData();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - hidden on mobile, shown on tablet+ */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="h-full p-4 md:p-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}

function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-sidebar border-t border-sidebar-border flex items-center justify-around px-2 z-50">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? 'text-primary'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
            {isActive && (
              <motion.div
                layoutId="mobileActiveTab"
                className="absolute top-0 w-12 h-0.5 bg-primary rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
