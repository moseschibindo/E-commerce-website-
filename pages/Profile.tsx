
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase';
import { authDB } from '../services/dbService';

interface ProfileProps {
  user: User | null;
  onAuthChange: (u: User | null) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onAuthChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      } else {
        if (!username.trim()) throw new Error("Username is required");
        
        const { error: authError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { username } // Passing username to user metadata
          }
        });
        if (authError) throw authError;
        alert("Success! Check your email to confirm your account.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authDB.signOut();
    onAuthChange(null);
  };

  if (!user) {
    return (
      <div className="px-6 py-12 max-w-md mx-auto animate-fadeIn min-h-screen">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] flex items-center justify-center text-white font-bold text-4xl mx-auto shadow-2xl mb-6">H</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{isLogin ? 'Welcome Back' : 'Join HarMarket'}</h1>
          <p className="text-slate-500 font-medium text-sm">Safe trading in Nakuru & Egerton.</p>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-slate-400 uppercase ml-4">Username</label>
               <input 
                type="text" 
                placeholder="Unique username" 
                className="w-full px-5 py-4 rounded-2xl border border-indigo-100 bg-white focus:ring-4 ring-indigo-500/10 outline-none font-semibold"
                value={username} onChange={e => setUsername(e.target.value)} required 
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-4">Email</label>
            <input 
              type="email" 
              placeholder="Email address" 
              className="w-full px-5 py-4 rounded-2xl border border-indigo-100 bg-white focus:ring-4 ring-indigo-500/10 outline-none font-semibold"
              value={email} onChange={e => setEmail(e.target.value)} required 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-4">Password</label>
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full px-5 py-4 rounded-2xl border border-indigo-100 bg-white focus:ring-4 ring-indigo-500/10 outline-none font-semibold"
              value={password} onChange={e => setPassword(e.target.value)} required 
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-black transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="mt-8 w-full text-center text-sm font-bold text-indigo-600">
          {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign In"}
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 animate-fadeIn max-w-2xl mx-auto min-h-screen">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-indigo-50 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <img src={user.avatar} className="relative z-10 w-32 h-32 rounded-full mx-auto border-4 border-white shadow-xl mb-6 mt-4" alt="Avatar" />
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">@{user.username || user.email.split('@')[0]}</h2>
        <p className="text-slate-400 text-sm font-medium mb-4">{user.email}</p>
        <span className={`mt-2 inline-block px-4 py-1 text-xs font-bold uppercase rounded-full ${
          user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-700'
        }`}>
          {user.role} Status
        </span>
        
        <div className="mt-12 pt-8 border-t border-indigo-50 text-left">
           <button onClick={handleLogout} className="w-full py-4 text-slate-400 font-bold hover:text-red-500 transition-colors uppercase tracking-widest text-[10px]">
             Logout Account
           </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
