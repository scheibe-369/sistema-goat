
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
  const isActiveRef = useRef(false);

  const animate = useCallback(() => {
    if (!scrollContainerRef.current || !scrollConfigRef.current || !isActiveRef.current) return;

    const { direction, speed } = scrollConfigRef.current;
    const scrollAmount = direction === 'left' ? -speed : speed;
    
    scrollContainerRef.current.scrollLeft += scrollAmount;
    
    // Continue animating
    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const startAutoScroll = useCallback((direction: 'left' | 'right', speed: number) => {
    if (!isActiveRef.current) return;
    
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
    isActiveRef.current = false;
  }, []);

  // Monitor mouse position during drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!scrollContainerRef.current || !isActiveRef.current) return;
      
      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const leftBoundary = containerRect.left + triggerZone;
      const rightBoundary = containerRect.right - triggerZone;
      const mouseX = e.clientX;

      if (mouseX < leftBoundary && mouseX > containerRect.left) {
        // Próximo da borda esquerda - scroll para esquerda
        const distance = leftBoundary - mouseX;
        const speed = Math.min(distance * speedMultiplier, maxSpeed);
        startAutoScroll('left', speed);
      } else if (mouseX > rightBoundary && mouseX < containerRect.right) {
        // Próximo da borda direita - scroll para direita
        const distance = mouseX - rightBoundary;
        const speed = Math.min(distance * speedMultiplier, maxSpeed);
        startAutoScroll('right', speed);
      } else {
        // Fora das zonas de trigger - para o auto-scroll
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        scrollConfigRef.current = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMouseMove({ clientX: e.touches[0].clientX } as MouseEvent);
      }
    };

    const handleDragStart = () => {
      isActiveRef.current = true;
    };

    const handleDragEnd = () => {
      stopAutoScroll();
    };

    // Add global listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [triggerZone, speedMultiplier, maxSpeed, startAutoScroll, stopAutoScroll]);

  return {
    scrollContainerRef,
    startAutoScroll,
    stopAutoScroll,
  };
}
