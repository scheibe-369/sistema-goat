
import { useRef, useCallback, useEffect } from 'react';

interface UseAutoScrollOptions {
  triggerZone?: number;
  maxSpeed?: number;
  speedMultiplier?: number;
}

export function useAutoScroll(options: UseAutoScrollOptions = {}) {
  const { triggerZone = 100, maxSpeed = 15, speedMultiplier = 0.2 } = options;
  const animationFrameRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollConfigRef = useRef<{ direction: 'left' | 'right'; speed: number } | null>(null);
  const mouseXRef = useRef<number | null>(null);

  const animate = useCallback(() => {
    if (!scrollContainerRef.current || !scrollConfigRef.current) return;

    const { direction, speed } = scrollConfigRef.current;
    const scrollAmount = direction === 'left' ? -speed : speed;
    
    scrollContainerRef.current.scrollLeft += scrollAmount;
    
    // Continue animating
    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const startAutoScroll = useCallback((direction: 'left' | 'right', speed: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    scrollConfigRef.current = { direction, speed: Math.min(speed, maxSpeed) };
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [animate, maxSpeed]);

  const stopAutoScroll = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    scrollConfigRef.current = null;
  }, []);

  // Monitor mouse position during drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX;
      
      if (!scrollContainerRef.current) return;
      
      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const leftBoundary = containerRect.left + triggerZone;
      const rightBoundary = containerRect.right - triggerZone;

      if (mouseXRef.current < leftBoundary && mouseXRef.current > containerRect.left) {
        // Próximo da borda esquerda - scroll para esquerda
        const distance = leftBoundary - mouseXRef.current;
        const speed = Math.min(distance * speedMultiplier, maxSpeed);
        startAutoScroll('left', speed);
      } else if (mouseXRef.current > rightBoundary && mouseXRef.current < containerRect.right) {
        // Próximo da borda direita - scroll para direita
        const distance = mouseXRef.current - rightBoundary;
        const speed = Math.min(distance * speedMultiplier, maxSpeed);
        startAutoScroll('right', speed);
      } else {
        // Fora das zonas de trigger - para o auto-scroll
        stopAutoScroll();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseXRef.current = e.touches[0].clientX;
        handleMouseMove({ clientX: e.touches[0].clientX } as MouseEvent);
      }
    };

    // Add global listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [triggerZone, speedMultiplier, maxSpeed, startAutoScroll, stopAutoScroll]);

  const handleDragUpdate = useCallback((update: any) => {
    // This function is called by the drag and drop system
    // The actual auto-scroll logic is handled by the global mouse listeners
  }, []);

  return {
    scrollContainerRef,
    startAutoScroll,
    stopAutoScroll,
    handleDragUpdate,
  };
}
