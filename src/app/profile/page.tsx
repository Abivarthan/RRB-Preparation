'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '@/lib/api';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Trophy, 
  ClipboardList, 
  Flame, 
  Edit2, 
  Save, 
  X,
  Camera
} from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (newName: string) => updateProfile(user!.id, { name: newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    }
  });

  if (authLoading || profileLoading) {
    return (
      <>
        <Navbar />
        <div className="pt-20"><LoadingSpinner message="Loading your profile..." /></div>
      </>
    );
  }

  if (!user || !profile) {
    return (
      <>
        <Navbar />
        <div className="pt-32 text-center p-8">
          <h2 className="text-xl font-bold text-slate-900">Please sign in to view your profile</h2>
        </div>
      </>
    );
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    updateMutation.mutate(name);
  };

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() || '?';

  const stats = [
    { icon: Trophy, label: 'Total Score', value: profile.total_score, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { icon: ClipboardList, label: 'Tests Taken', value: profile.tests_attempted, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Flame, label: 'Day Streak', value: profile.streak_count, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-32 pb-12 px-4 max-w-4xl mx-auto">
        <div className="mb-10 animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Your Profile</h1>
          <p className="text-slate-500 font-medium">Manage your personal information and track your progress.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 space-y-8 stagger-children">
            <div className="glass-card p-8 sm:p-10 relative overflow-hidden bg-white border-slate-200">
              <div className="absolute top-0 left-0 right-0 h-1.5 gradient-accent" />
              
              <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl gradient-accent flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-2xl shadow-indigo-600/30">
                    {initials}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-colors">
                    <Camera size={18} />
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="input-group">
                        <div className="input-icon-left"><User size={20} /></div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="input-field input-field-with-icon font-bold text-xl"
                          placeholder="Your Name"
                          autoFocus
                        />
                      </div>
                      <div className="flex items-center gap-3 justify-center sm:justify-start">
                        <button
                          onClick={handleSave}
                          disabled={updateMutation.isPending}
                          className="btn-primary py-2.5 px-6 text-sm"
                        >
                          <Save size={18} /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setName(profile.name || '');
                          }}
                          className="btn-secondary py-2.5 px-6 text-sm border-slate-200"
                        >
                          <X size={18} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                        <h2 className="text-3xl font-black text-slate-900 truncate">{profile.name || 'Set your name'}</h2>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center transition-all border border-slate-100 sm:self-center"
                          title="Edit Profile"
                        >
                          <Edit2 size={18} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 justify-center sm:justify-start text-slate-500 font-medium">
                        <Mail size={16} />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-slate-100">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Account Type</label>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                      <Trophy size={16} />
                    </div>
                    <span className="font-bold text-slate-700 text-sm">Pro Candidate</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Joined On</label>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500">
                      <ClipboardList size={16} />
                    </div>
                    <span className="font-bold text-slate-700 text-sm">
                      {new Date(profile.created_at || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Side Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest px-2">Performance Stats</h3>
            {stats.map((stat, i) => (
              <div key={i} className="glass-card p-6 flex items-center gap-5 bg-white border-slate-200 animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                  <stat.icon size={28} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
