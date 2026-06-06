import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../assets/styles/ThemeToggleButton.css';

interface Star {
	x: number;
	y: number;
	size: number;
	opacity: number;
	growth: number;
	isIncreasing: boolean;
	update: (ctx: CanvasRenderingContext2D) => void;
	draw: (ctx: CanvasRenderingContext2D) => void;
}

const ThemeToggleButton: React.FC = () => {
	const [theme, setTheme] = useState<'day' | 'night'>(() => {
		const savedTheme = localStorage.getItem('theme');
		const prefersDark =
			window.matchMedia && window.matchMedia('(prefers-color-scheme: night)').matches;
		return (savedTheme as 'day' | 'night') || (prefersDark ? 'night' : 'day');
	});

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const wrapperRef = useRef<HTMLButtonElement>(null);
	const animationFrameId = useRef<number | null>(null);
	const starsRef = useRef<Star[]>([]);

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === 'day' ? 'night' : 'day'));
	};

	const resizeCanvas = useCallback(() => {
		const canvas = canvasRef.current;
		const wrapper = wrapperRef.current;
		if (canvas && wrapper) {
			const rect = wrapper.getBoundingClientRect();
			canvas.width = rect.width;
			canvas.height = rect.height;
		}
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		resizeCanvas();

		const createStar = (x: number, y: number): Star => {
			const star: Star = {
				x,
				y,
				size: 0,
				opacity: 1,
				growth: 0.1,
				isIncreasing: true,
				update(context: CanvasRenderingContext2D) {
					if (this.size > 2.0) {
						this.isIncreasing = false;
					}
					if (this.isIncreasing) {
						this.size += this.growth;
					} else {
						this.size -= this.growth * 0.5;
					}
					this.draw(context);
				},
				draw(context: CanvasRenderingContext2D) {
					context.beginPath();
					context.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2);
					context.fillStyle = `#ffffff`;
					context.fill();
					context.closePath();
				},
			};
			return star;
		};

		const flicker = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			starsRef.current = starsRef.current.filter(
				(star) => star.isIncreasing || star.size >= 0.1,
			);
			starsRef.current.forEach((star) => star.update(ctx));
			animationFrameId.current = requestAnimationFrame(flicker);
		};

		if (theme === 'night') {
			const intervalId = setInterval(() => {
				if (starsRef.current.length < 30) {
					const x = Math.random() * canvas.width;
					const y = Math.random() * canvas.height;
					starsRef.current.push(createStar(x, y));
				}
			}, 250);

			animationFrameId.current = requestAnimationFrame(flicker);

			return () => {
				clearInterval(intervalId);
				if (animationFrameId.current) {
					cancelAnimationFrame(animationFrameId.current);
				}
				starsRef.current = [];
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			};
		} else {
			starsRef.current = [];
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
	}, [theme, resizeCanvas]);

	useEffect(() => {
		window.addEventListener('resize', resizeCanvas);
		return () => window.removeEventListener('resize', resizeCanvas);
	}, [resizeCanvas]);

	return (
		<button
			ref={wrapperRef}
			data-theme={theme}
			className="theme-toggle-button-wrapper"
			onClick={toggleTheme}
			aria-label={theme === 'day' ? 'Switch to night mode' : 'Switch to day mode'}
		>
			<span className="theme-toggle-button"></span>
			<canvas id="stars" ref={canvasRef}></canvas>
		</button>
	);
};

export default ThemeToggleButton;
