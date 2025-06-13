import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// Enhanced SVG Icons
const Icons = {
  Guidance: () => (
    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
    </svg>
  ),
  Risk: () => (
    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
    </svg>
  ),
  Task: () => (
    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  ),
  Roles: () => (
    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
    </svg>
  ),
};

export const Overview = () => {
  // Animation variants for staggered animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 flex flex-col gap-4 leading-relaxed text-center max-w-2xl mx-auto">
        <div 
          data-testid="overview-text" 
          className="flex flex-col items-center bg-gradient-to-b from-purple-900/20 to-purple-800/5 rounded-xl p-4 border border-purple-700/20 shadow-md"
        >
          {/* Title */}
          <h2 className="text-2xl font-bold mb-2 text-purple-300">
            Welcome to the DEP Guardian
          </h2>
          
          {/* Decorative line */}
          <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-purple-300 rounded-full mx-auto mb-4"></div>
          
          <p className="mb-4">
            Your AI assistant for navigating the <strong className="text-purple-300">Data Enablement Plan (DEP)</strong> process at TELUS
          </p>
          
          {/* Capabilities section with icons */}
          <motion.div 
            className="text-left bg-purple-900/10 p-3 rounded-lg border border-purple-700/10 w-full"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <p className="mb-3 font-semibold text-purple-200">
              <span className="inline-block mr-2">🔍</span>
              How I can help you:
            </p>
            
            <ul className="space-y-2">
              <motion.li variants={item} className="flex items-start gap-3">
                <Icons.Guidance />
                <span>Provide <strong className="text-purple-200">step-by-step guidance</strong> for completing your DEP</span>
              </motion.li>
              
              <motion.li variants={item} className="flex items-start gap-3">
                <Icons.Risk />
                <span>Assist with <strong className="text-purple-200">risk assessment</strong> and mitigation strategies</span>
              </motion.li>
              
              <motion.li variants={item} className="flex items-start gap-3">
                <Icons.Task />
                <span>Support <strong className="text-purple-200">task completion</strong> and approval workflows</span>
              </motion.li>
              
              <motion.li variants={item} className="flex items-start gap-3">
                <Icons.Roles />
                <span>Explain <strong className="text-purple-200">roles and responsibilities</strong> in the DEP process</span>
              </motion.li>
            </ul>
          </motion.div>
          
          {/* Roles section */}
          <motion.div 
            className="mt-4 p-3 bg-purple-900/5 rounded-lg border border-purple-700/10 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p>
              Whether you&apos;re a <span className="font-medium text-purple-300">Data Steward</span>, <span className="font-medium text-purple-300">Director</span>,{' '}
              <span className="font-medium text-purple-300">DEP Deputy</span>, or <span className="font-medium text-purple-300">Team Member</span>,{' '}
              I&apos;m here to guide you through every stage of your DEP journey.
            </p>
          </motion.div>
          
          {/* Call to action */}
          <div className="mt-4 bg-gradient-to-r from-purple-600/10 to-purple-400/10 p-3 rounded-full">
            <p className="text-sm font-medium">
              ✨ Let&apos;s get started! Ask me anything about the DEP process ✨
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
