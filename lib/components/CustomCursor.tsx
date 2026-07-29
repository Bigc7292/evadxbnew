'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

export function CustomCursor() {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const followerX = useMotionValue(0);
  const followerY = useMotionValue(0);
  const followerScale = useMotionValue(1);
  const opacity = useMotionValue(1);
  
  const [isHovering, setIsHovering] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'magnetic'>('default');
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  const followerSpringX = useSpring(followerX, { stiffness: 200, damping: 25 });
  const followerSpringY = useSpring(followerY, { stiffness: 200, damping: 25 });
  const followerSpringScale = useSpring(followerScale, { stiffness: 300, damping: 30 });

  const followerOpacity = useTransform(opacity, [0, 1], [0, 0.3]);
  const hoveredOpacity = useTransform(opacity, [0, 1], [0, 0.15]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY]);

  useEffect(() => {
    const animateFollower = () => {
      followerX.set(cursorX.get() - 12);
      followerY.set(cursorY.get() - 12);
      requestAnimationFrame(animateFollower);
    };
    animateFollower();
  }, [followerX, followerY, cursorX, cursorY]);

  useEffect(() => {
    const interactiveSelector = 'a, button, [role="button"], .magnetic, .card, .property-card';
    
    const handleMouseEnter = (e: Event) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest(interactiveSelector)) {
        setIsHovering(true);
        setCursorType(target.closest('.magnetic') ? 'magnetic' : 'pointer');
        followerScale.set(1.5);
        opacity.set(0.5);
      }
    };

    const handleMouseLeave = (e: Event) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest(interactiveSelector)) {
        setIsHovering(false);
        setCursorType('default');
        followerScale.set(1);
        opacity.set(1);
      }
    };

    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
    };
  }, [followerScale, opacity]);

  return (
    <>
      <motion.div
        ref={cursorRef}
        style={{
          x: cursorX,
          y: cursorY,
          pointerEvents: 'none',
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0,
        }}
        className="cursor-dot"
      >
        <div 
          className={`w-2 h-2 rounded-full border-2 transition-all duration-200 ${
            cursorType === 'pointer' ? 'border-accent bg-transparent' :
            cursorType === 'magnetic' ? 'border-primary-foreground bg-accent' :
            'border-accent bg-transparent'
          }`}
        />
        {cursorType === 'magnetic' && (
          <motion.div
            className="absolute -top-1 -left-1 w-4 h-4 rounded-full border border-accent/50"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>

      <motion.div
        ref={followerRef}
        style={{
          x: followerSpringX,
          y: followerSpringY,
          scale: followerSpringScale,
          opacity: followerOpacity,
          pointerEvents: 'none',
          zIndex: 9998,
          position: 'fixed',
          top: 0,
          left: 0,
        }}
        className="cursor-follower"
      >
        <div className="w-8 h-8 rounded-full border border-accent/30 bg-accent/5" />
      </motion.div>

      {isHovering && (
        <motion.div
          style={{
            x: cursorX,
            y: cursorY,
            opacity: hoveredOpacity,
            pointerEvents: 'none',
            zIndex: 9997,
            position: 'fixed',
            top: 0,
            left: 0,
          }}
          className="cursor-glow"
          animate={{ scale: [1, 1.8, 1], opacity: [0.15, 0.05, 0.15] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-accent/20 via-transparent to-accent/20 blur-2xl" />
        </motion.div>
      )}
    </>
  );
}