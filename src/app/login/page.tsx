'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { GraduationCap, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error);
        } else {
          toast.success('Welcome back!');
          router.push('/dashboard');
        }
      } else {
        if (!name.trim()) {
          toast.error('Please enter your name');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, name);
        if (error) {
          toast.error(error);
        } else {
          toast.success('Account created! Check your email to verify.');
          setIsLogin(true);
        }
      }
    } catch {
      toast.error('Something went wrong');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Background orbs */}
      <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
      <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-600/8 blur-[100px]" />

      <div className="w-full max-w-md relative animate-scaleIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-xl gradient-accent flex items-center justify-center transition-transform group-hover:scale-110">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              RRB <span className="text-indigo-400">Prep</span>
            </span>
          </Link>
          <p className="text-slate-400 mt-3 text-sm">
            {isLogin ? 'Sign in to continue your preparation' : 'Create an account to start preparing'}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8">
          {/* Toggle */}
          <div className="flex rounded-xl bg-black/20 p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isLogin
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="animate-fadeIn space-y-1.5">
                <label className="block text-sm font-medium text-slate-400 ml-1">Full Name</label>
                <div className="input-group">
                  <div className="input-icon-left">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field input-field-with-icon"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-400 ml-1">Email Address</label>
              <div className="input-group">
                <div className="input-icon-left">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field input-field-with-icon"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-sm font-medium text-slate-400">Password</label>
                {isLogin && (
                  <Link href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    Forgot Password?
                  </Link>
                )}
              </div>
              <div className="input-group">
                <div className="input-icon-left">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field input-field-with-icon input-field-with-right-icon"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-icon-right"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
