import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { PlayCircle, Cpu, Binary } from 'lucide-react';

const NeuralNetworkAnimation = () => {
  return (
    <div className="w-full h-64 bg-slate-900 rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-800">
      <svg className="w-full h-full opacity-60" viewBox="0 0 400 200">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        
        {/* Layer 1 to Layer 2 connections */}
        <motion.path d="M 50 50 Q 150 50 200 100" stroke="url(#lineGrad)" strokeWidth="2" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
        <motion.path d="M 50 150 Q 150 150 200 100" stroke="url(#lineGrad)" strokeWidth="2" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "linear" }} />
        
        {/* Layer 2 to Layer 3 connections */}
        <motion.path d="M 200 100 Q 250 100 350 50" stroke="url(#lineGrad)" strokeWidth="2" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1, repeat: Infinity, ease: "linear" }} />
        <motion.path d="M 200 100 Q 250 100 350 150" stroke="url(#lineGrad)" strokeWidth="2" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1.5, repeat: Infinity, ease: "linear" }} />

        {/* Nodes */}
        <circle cx="50" cy="50" r="8" fill="#8b5cf6" />
        <circle cx="50" cy="150" r="8" fill="#8b5cf6" />
        <motion.circle cx="200" cy="100" r="12" fill="#3b82f6" 
          animate={{ scale: [1, 1.2, 1], filter: ["blur(0px)", "blur(4px)", "blur(0px)"] }} transition={{ duration: 2, repeat: Infinity }} />
        <circle cx="350" cy="50" r="8" fill="#10b981" />
        <circle cx="350" cy="150" r="8" fill="#10b981" />
      </svg>
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <span className="bg-slate-800/80 text-white text-xs px-3 py-1 rounded-full font-mono backdrop-blur-sm border border-slate-700">
          Forward Propagation Visualization
        </span>
      </div>
    </div>
  );
};

const SortingAlgorithmAnimation = () => {
  const bars = [40, 80, 20, 100, 60, 30, 90, 50];
  
  return (
    <div className="w-full h-64 bg-slate-50 rounded-2xl overflow-hidden relative flex items-end justify-center p-8 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-end gap-2 h-full w-full max-w-sm">
        {bars.map((height, i) => (
          <motion.div 
            key={i}
            className="flex-1 bg-primary rounded-t-sm"
            initial={{ height: "10%" }}
            animate={{ 
              height: `${height}%`,
              backgroundColor: ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--primary))"]
            }}
            transition={{ 
              duration: 2, 
              delay: i * 0.2, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>
      <div className="absolute top-4 left-4 right-4 text-center">
        <span className="bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-white text-xs px-3 py-1 rounded-full font-mono backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          Array Sorting Simulation
        </span>
      </div>
    </div>
  );
};

const DataFlowAnimation = () => {
  return (
     <div className="w-full h-64 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl overflow-hidden relative flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
      <svg className="w-full h-full" viewBox="0 0 400 200">
         {/* Database Cylinder */}
         <path d="M 50 80 A 30 10 0 1 0 110 80 A 30 10 0 1 0 50 80 M 50 80 L 50 120 A 30 10 0 0 0 110 120 L 110 80" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500" />
         
         {/* Server Box */}
         <rect x="290" y="70" width="60" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500" />
         
         {/* Data Packets */}
         <motion.circle cx="110" cy="100" r="4" fill="#3b82f6"
            animate={{ cx: [110, 290] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
         />
         <motion.circle cx="110" cy="100" r="4" fill="#3b82f6"
            animate={{ cx: [110, 290] }}
            transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, ease: "linear" }}
         />
         <motion.circle cx="110" cy="100" r="4" fill="#3b82f6"
            animate={{ cx: [110, 290] }}
            transition={{ duration: 1.5, delay: 1, repeat: Infinity, ease: "linear" }}
         />

         {/* Connection Line */}
         <line x1="110" y1="100" x2="290" y2="100" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-indigo-300 dark:text-indigo-800" />
      </svg>
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <span className="bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-white text-xs px-3 py-1 rounded-full font-mono backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          Client-Server Data Flow
        </span>
      </div>
    </div>
  );
}

export default function Animations() {
  return (
    <Layout>
      <div className="py-24 max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <PlayCircle className="text-primary" size={36} />
            Interactive SVG Animations
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Visual learning tools that make complex topics easy to understand. Kydy leverages animated SVGs to break down abstract concepts in AI, computer science, and data flows.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Cpu size={20} className="text-primary" /> Machine Learning
            </h3>
            <p className="text-sm text-muted-foreground">Visualize how data passes through neural network layers during forward propagation.</p>
            <NeuralNetworkAnimation />
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Binary size={20} className="text-primary" /> Algorithms
            </h3>
            <p className="text-sm text-muted-foreground">Understand sorting algorithms intuitively with dynamic bar height visualization.</p>
            <SortingAlgorithmAnimation />
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PlayCircle size={20} className="text-primary" /> Architecture
            </h3>
            <p className="text-sm text-muted-foreground">Watch how data packets travel between databases and application servers.</p>
            <DataFlowAnimation />
          </div>

        </div>
        
        <div className="mt-24 p-8 bg-primary/5 rounded-3xl border border-primary/10 text-center">
           <h3 className="text-2xl font-bold mb-4">Want more interactive content?</h3>
           <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
             Sign in to Kydy to access our full library of interactive modules, coding environments, and personalized learning paths.
           </p>
           <a href="/signin" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
             Create Free Account
           </a>
        </div>
      </div>
    </Layout>
  );
}