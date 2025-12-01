"use client";
import { useEffect, useRef } from "react";

export function Confetti() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; life: number }[] = [];
        const colors = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3", "#33FFF3"];

        // Create particles
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 15, // Horizontal spread
                vy: (Math.random() - 1) * 15 - 5, // Upward burst
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                life: 100 + Math.random() * 50
            });
        }

        let animationId: number;

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let activeParticles = 0;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.life <= 0) continue;

                activeParticles++;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // Gravity
                p.vx *= 0.99; // Air resistance
                p.life--;
                p.size *= 0.99; // Shrink

                ctx.globalAlpha = Math.min(p.life / 20, 1);
                ctx.fillStyle = p.color;

                // Draw confetti shape (rect)
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.life * 0.1);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            }

            if (activeParticles > 0) {
                animationId = requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" />;
}
