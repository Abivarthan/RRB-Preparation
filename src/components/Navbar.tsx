'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  LogOut,
  Menu,
  X,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/topics', label: 'Topics', icon: BookOpen },
  { href: '/mock-test', label: 'Mock Test', icon: FileText },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-color)',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-110">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="font-black text-xl sm:text-2xl tracking-tight text-slate-900">
              RRB <span className="text-indigo-600">Prep</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${isActive
                      ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100'
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User section (Desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active User</span>
              <span className="text-sm text-slate-700 font-bold truncate max-w-[150px]">
                {user.email?.split('@')[0]}
              </span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center justify-center w-11 h-11 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all border border-slate-100 shadow-sm"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-sm active:scale-95 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-2xl animate-fadeIn overflow-hidden shadow-2xl">
          <div className="px-4 py-8 space-y-3">
            <div className="px-5 py-4 mb-6 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Authenticated Account</p>
              <p className="text-sm font-black text-slate-800 truncate">{user.email}</p>
            </div>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-4 px-6 py-4.5 rounded-2xl text-base font-bold transition-all ${isActive
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-transparent'
                    }`}
                >
                  <Icon size={22} />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={() => {
                  signOut();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-4 px-6 py-4.5 rounded-2xl text-base font-bold text-red-600 hover:bg-red-50 transition-all border border-red-100 shadow-sm"
              >
                <LogOut size={22} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
