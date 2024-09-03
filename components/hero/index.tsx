"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { settings, pre, main, post } from "@/lib/ascii/flame";

export default function HeroSection() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shrink, setShrink] = useState<boolean>(false);

  const resizeCanvas = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      console.log("Canvas resized to:", canvas.width, canvas.height);
    }
  }, []);

  const updateContext = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      return {
        cols: Math.floor(canvas.width / 10),
        rows: Math.floor(canvas.height / 20),
        time: 0,
        frame: 0,
        runtime: {
          fps: 0,
          updatedRowNum: 0,
        },
        metrics: {
          aspect: canvas.width / canvas.height,
        },
        width: canvas.width,
        height: canvas.height,
      };
    }
    return null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId: number;

    resizeCanvas();
    let context = updateContext();

    const cursor = {
      x: 0,
      y: 0,
      pressed: false,
    };

    const buffer = {};


    let lastTime = 0;
    const animate = (timestamp: number) => {
      if (!context) return;

      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      context.time = timestamp;
      context.frame++;
      context.runtime.fps = 1000 / deltaTime;

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        pre(context, cursor, buffer);

        ctx.fillStyle = settings.color;
        for (let y = 0; y < context.rows; y++) {
          for (let x = 0; x < context.cols; x++) {
            const coord = { x, y, index: y * context.cols + x };
            const cell = main(coord, context, cursor, buffer);
            if (cell) {
              ctx.font = `${cell.fontWeight} 20px monospace`;
              ctx.fillText(cell.char, x * 10, y * 20);
            }
          }
        }

        post(context, cursor, buffer);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resizeCanvas();
      context = updateContext();
    };

    const handleMouseMove = (e: MouseEvent) => {
      cursor.x = e.clientX / 10;
      cursor.y = e.clientY / 20;
    };

    const handleMouseDown = () => {
      cursor.pressed = true;
    };

    const handleMouseUp = () => {
      cursor.pressed = false;
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);

    animate(0);

    const shrinkTimeout = setTimeout(() => setShrink(true), 1000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      clearTimeout(shrinkTimeout);
    };
  }, [resizeCanvas, updateContext]);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out ${
          shrink ? "scale-95 rounded-3xl" : "scale-100"
        }`}
      />
    </div>
  );
}