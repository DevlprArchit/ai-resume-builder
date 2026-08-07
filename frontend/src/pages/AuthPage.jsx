import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, register, loginWithGoogle, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the store and displayed below
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="navbar">
        <a href="/" className="nav-left">
          <div className="mark">R</div>
          <span className="brand">Draftline</span>
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center p-5 py-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[380px] bg-surface border border-line rounded-2xl p-8 shadow-[0_20px_50px_rgba(20,25,35,0.06)]"
        >
          <div className="flex bg-paper rounded-lg p-1 mb-6 relative">
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 text-center py-2 text-[13px] font-semibold rounded-[7px] z-10 transition-colors ${isLogin ? 'text-ink' : 'text-slate hover:text-ink'}`}
            >
              Log in
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 text-center py-2 text-[13px] font-semibold rounded-[7px] z-10 transition-colors ${!isLogin ? 'text-ink' : 'text-slate hover:text-ink'}`}
            >
              Sign up
            </button>
            
            <motion.div 
              layoutId="authTabBubble"
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.08)] rounded-[7px] z-0"
              initial={false}
              animate={{ left: isLogin ? '4px' : 'calc(50%)' }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-[22px] font-semibold font-display mb-1.5">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-[13px] text-slate mb-6">
                {isLogin ? 'Log in to keep editing your resumes.' : 'Free forever. No credit card, no watermark.'}
              </p>
            </motion.div>
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-md mb-5"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <AnimatePresence>
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  className="flex flex-col gap-1.5"
                >
                  <label className="text-[12px] font-semibold text-slate">Full name</label>
                  <input
                    type="text"
                    placeholder="Aditi Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-draftline"
                    required={!isLogin}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate">Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-draftline"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 mb-2">
              <label className="text-[12px] font-semibold text-slate">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-draftline"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full justify-center py-2.5 text-[14px]"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Log in' : 'Create account')}
            </button>
          </form>

          <div className="flex items-center gap-2.5 my-5 text-slate-light text-[11.5px] font-mono before:content-[''] before:flex-1 before:h-px before:bg-line after:content-[''] after:flex-1 after:h-px after:bg-line">
            OR
          </div>
          
          <button 
            type="button" 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="btn w-full justify-center"
          >
            Continue with Google
          </button>

          <div className="text-center text-[12.5px] text-slate mt-5">
            {isLogin ? (
              <>New here? <button type="button" onClick={() => setIsLogin(false)} className="text-teal font-semibold hover:underline">Create an account</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => setIsLogin(true)} className="text-teal font-semibold hover:underline">Log in</button></>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthPage;
