'use client';

import { motion } from 'motion/react';

export function AnimatedContent({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      initial={'0px'}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex-1 overflow-auto"
    >
      {children}
    </motion.main>
  );
}
