"use client";

import { useEffect, useRef, useState } from "react";

export function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const dotPosRef = useRef({ x: 0, y: 0 });
  const ringPosRef = useRef({ x: 0, y: 0 });
  const initializedRef = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isTouchDevice || prefersReducedMotion) {
      return;
    }

    let frameId = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (document.body.classList.contains("nm-system-error-active")) {
        setVisible(false);
        return;
      }

      mouseRef.current = { x: event.clientX, y: event.clientY };

      if (!initializedRef.current) {
        dotPosRef.current = { x: event.clientX, y: event.clientY };
        ringPosRef.current = { x: event.clientX, y: event.clientY };
        initializedRef.current = true;
      }

      setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const animate = () => {
      dotPosRef.current.x += (mouseRef.current.x - dotPosRef.current.x) * 0.35;
      dotPosRef.current.y += (mouseRef.current.y - dotPosRef.current.y) * 0.35;
      ringPosRef.current.x += (mouseRef.current.x - ringPosRef.current.x) * 0.18;
      ringPosRef.current.y += (mouseRef.current.y - ringPosRef.current.y) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPosRef.current.x}px, ${dotPosRef.current.y}px, 0) translate(-50%, -50%)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0) translate(-50%, -50%)`;
      }

      frameId = window.requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        className="nm-cursor-ring"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden
      />
      <div
        ref={dotRef}
        className="nm-cursor-dot"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden
      />
    </>
  );
}
