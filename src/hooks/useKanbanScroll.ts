
import { useState, useRef, useEffect } from "react";

export function useKanbanScroll(isCardBeingDragged: boolean) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [autoScrollInterval, setAutoScrollInterval] = useState<NodeJS.Timeout | null>(null);

  const startAutoScroll = (direction: 'left' | 'right', speed: number) => {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
    }

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const scrollAmount = direction === 'left' ? -speed : speed;
        scrollContainerRef.current.scrollLeft += scrollAmount;
      }
    }, 16); // ~60fps

    setAutoScrollInterval(interval);
  };

  const stopAutoScroll = () => {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      setAutoScrollInterval(null);
    }
  };

  const handleDragUpdate = (e: MouseEvent) => {
    if (!isCardBeingDragged || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const mouseX = e.clientX;
    
    const triggerZone = 100;
    const leftBoundary = containerRect.left + triggerZone;
    const rightBoundary = containerRect.right - triggerZone;

    if (mouseX < leftBoundary) {
      const distance = leftBoundary - mouseX;
      const speed = Math.min(distance / 10, 10);
      startAutoScroll('left', speed);
    } else if (mouseX > rightBoundary) {
      const distance = mouseX - rightBoundary;
      const speed = Math.min(distance / 10, 10);
      startAutoScroll('right', speed);
    } else {
      stopAutoScroll();
    }
  };

  useEffect(() => {
    if (isCardBeingDragged) {
      document.addEventListener('mousemove', handleDragUpdate);
      return () => {
        document.removeEventListener('mousemove', handleDragUpdate);
        stopAutoScroll();
      };
    }
  }, [isCardBeingDragged]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current || isCardBeingDragged) return;
    
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current || isCardBeingDragged) return;
    
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current || isCardBeingDragged) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current || isCardBeingDragged) return;
    
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return {
    scrollContainerRef,
    isDragging,
    stopAutoScroll,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
