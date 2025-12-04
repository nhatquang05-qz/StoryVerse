import React, { useRef, useEffect } from 'react';

interface HeroParticleTextProps {
	title: string;
	slogan: string;
}

const HeroParticleText: React.FC<HeroParticleTextProps> = ({ title, slogan }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const container = canvas.parentElement as HTMLElement;
		const resizeCanvas = () => {
			canvas.width = container.offsetWidth;
			canvas.height = container.offsetHeight;
		};

		window.addEventListener('resize', resizeCanvas);
		resizeCanvas();

		return () => {
			window.removeEventListener('resize', resizeCanvas);
		};
	}, []);

	return (
		<div className="hero-particle-container">
			<canvas ref={canvasRef} id="particle-canvas"></canvas>

			<div className="hero-text-content">
				<h1 className="hero-title">{title}</h1>
				<p className="hero-slogan">{slogan}</p>
			</div>
		</div>
	);
};

export default HeroParticleText;
