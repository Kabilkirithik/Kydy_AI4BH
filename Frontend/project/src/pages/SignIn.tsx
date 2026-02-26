import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function SignIn() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Login attempt:', data);
    
    // Note for Supabase requirement
    toast.info("Please connect Supabase to enable real authentication.");
    
    // Simulate successful login routing to chat
    toast.success("Welcome back to Kydy!");
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6">
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8 pb-6 border-b border-border/50 bg-muted/10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground mb-4">
            <BrainCircuit size={28} />
          </div>
          <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
          <p className="text-muted-foreground text-center text-sm mt-2">
            Sign in to access your learning paths and developer tools.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">Email Address</label>
            <input
              {...register('email')}
              type="email"
              placeholder="hello@kydy.ai"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground block">Password</label>
              <a href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
            </div>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" /> Signing in...</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="p-6 pt-0 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account? <a href="#" className="font-medium text-primary hover:underline">Sign up</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}