import React from 'react';
import { X, LogIn, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle } from '../firebase';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <LogIn size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Terminal Access</h2>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mt-0.5">Sign In • Pro Account</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-400 hover:text-zinc-900"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-12 flex flex-col items-center text-center bg-zinc-50 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <Shield size={200} className="text-amber-500" />
              </div>
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tighter">WELCOME BACK</h3>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                    Sign in with your Google account to access your personalized terminal, alerts, and market intelligence.
                  </p>
                </div>

                <button 
                  onClick={handleSignIn}
                  className="w-full flex items-center justify-center gap-4 px-8 py-4 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md hover:bg-zinc-50 transition-all group active:scale-95"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  <span className="text-sm font-bold text-zinc-700 uppercase tracking-widest">Sign in with Google</span>
                </button>

                <div className="flex items-center gap-2 justify-center text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                  <Shield size={12} />
                  <span>Secure OAuth2 Authentication</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-white border-t border-zinc-100 text-center">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                GoldPulse Pro Security • v2.5
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
