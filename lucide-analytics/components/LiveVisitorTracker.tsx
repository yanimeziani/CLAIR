'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveVisitor } from '@/types/analytics';

interface LiveVisitorTrackerProps {
  visitors: LiveVisitor[];
  showVisitors?: boolean;
}

export default function LiveVisitorTracker({ 
  visitors, 
  showVisitors = true 
}: LiveVisitorTrackerProps) {
  const [visibleVisitors, setVisibleVisitors] = useState<LiveVisitor[]>([]);

  useEffect(() => {
    // Filter out stale visitors (inactive for more than 30 seconds)
    const activeVisitors = visitors.filter(
      visitor => Date.now() - visitor.lastActive < 30000
    );
    setVisibleVisitors(activeVisitors);
  }, [visitors]);

  if (!showVisitors) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {visibleVisitors.map((visitor) => (
          <motion.div
            key={visitor.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute"
            style={{
              left: `${visitor.x}px`,
              top: `${visitor.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="visitor-marker">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                {visitor.location?.city || 'Unknown'}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}