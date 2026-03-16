import React from 'react';
import { X, LogIn, UserPlus, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  // Placeholder Google Form URL for Sign In / Registration
  const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdW89_o0W9_O-O-O-O-O-O-O-O-O-O-O-O-O-O-O-O-O-O/viewform?embedded=true";

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
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <LogIn size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Terminal Access</h2>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mt-0.5">Sign In • Register • Pro Account</p>
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
            <div className="flex-1 overflow-hidden relative bg-zinc-50">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <div className="flex flex-col items-center gap-4">
                  <Shield size={120} className="text-amber-500" />
                  <span className="text-3xl font-black tracking-tighter text-amber-600">SECURE ACCESS</span>
                </div>
              </div>
              
              <iframe
                src={googleFormUrl}
                className="w-full h-full border-none relative z-10"
                title="Sign In Form"
              >
                Loading…
              </iframe>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-white border-t border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <UserPlus size={12} />
                  <span>New User? Register via form</span>
                </div>
              </div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                GoldPulse Pro Security
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
