
import { useRef, useCallback } from 'react';

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

  const handleDragPosition = useCallback((mouseX: number) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const leftBoundary = containerRect.left + triggerZone;
    const rightBoundary = containerRect.right - triggerZone;

    if (mouseX < leftBoundary) {
      // Próximo da borda esquerda - scroll para esquerda
      const distance = leftBoundary - mouseX;
      const speed = Math.min(distance * speedMultiplier, maxSpeed);
      startAutoScroll('left', speed);
    } else if (mouseX > rightBoundary) {
      // Próximo da borda direita - scroll para direita
      const distance = mouseX - rightBoundary;
      const speed = Math.min(distance * speedMultiplier, maxSpeed);
      startAutoScroll('right', speed);
    } else {
      // Fora das zonas de trigger - para o auto-scroll
      stopAutoScroll();
    }
  }, [triggerZone, speedMultiplier, maxSpeed, startAutoScroll, stopAutoScroll]);

  return {
    scrollContainerRef,
    startAutoScroll,
    stopAutoScroll,
    handleDragPosition,
  };
}
