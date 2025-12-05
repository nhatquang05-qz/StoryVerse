import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import {
	motion,
	useScroll,
	useTransform,
	useInView,
	animate,
	useMotionValue,
	useMotionTemplate,
	useSpring,
	type Variants,
} from 'framer-motion';
import { BookOpen, Users, Zap, Heart, Target, Globe, Star, Sparkles } from 'lucide-react';
import logoDark from '../assets/images/logo.avif';
import logoLight from '../assets/images/logo_dark.avif';
import backgroundAboutUs from '../assets/images/background-aboutus.avif';
import '../assets/styles/AboutPage.css';
import avatar from '../assets/images/nquang.png';
import bgDiscover from '../assets/images/bg-discover.avif';
import galaxyGif from '../assets/images/galaxy.gif';
import aboutusImage from '../assets/images/about1.avif';

const AnimatedCounter = ({
	from = 0,
	to,
	suffix = '',
}: {
	from?: number;
	to: number;
	suffix?: string;
}) => {
	const nodeRef = useRef<HTMLSpanElement>(null);
	const isInView = useInView(nodeRef, { once: true, margin: '-50px' });

	useEffect(() => {
		if (isInView) {
			const node = nodeRef.current;
			const controls = animate(from, to, {
				duration: 2,
				ease: [0.25, 0.1, 0.25, 1],
				onUpdate(value) {
					if (node) {
						node.textContent = Math.floor(value).toLocaleString('en-US') + suffix;
					}
				},
			});
			return () => controls.stop();
		}
	}, [from, to, isInView, suffix]);

	return (
		<span ref={nodeRef}>
			{from}
			{suffix}
		</span>
	);
};

const InViewAnimation: React.FC<{
	children: React.ReactNode;
	delay?: number;
	className?: string;
	direction?: 'up' | 'left' | 'right';
}> = ({ children, delay = 0, className = '', direction = 'up' }) => {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

	const variants: Variants = {
		hidden: {
			opacity: 0,
			y: direction === 'up' ? 50 : 0,
			x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
			scale: 0.95,
		},
		visible: {
			opacity: 1,
			y: 0,
			x: 0,
			scale: 1,
			transition: {
				duration: 0.8,
				delay,
				ease: [0.22, 1, 0.36, 1] as const,
			},
		},
	};

	return (
		<motion.div
			ref={ref}
			initial="hidden"
			animate={isInView ? 'visible' : 'hidden'}
			variants={variants}
			className={`anim-wrapper ${className}`}
		>
			{children}
		</motion.div>
	);
};

const SpotlightCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
	children,
	className = '',
}) => {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
		const { left, top } = currentTarget.getBoundingClientRect();
		mouseX.set(clientX - left);
		mouseY.set(clientY - top);
	}

	return (
		<div className={`spotlight-card group ${className}`} onMouseMove={handleMouseMove}>
			<motion.div
				className="spotlight-overlay"
				style={{
					background: useMotionTemplate`
                        radial-gradient(
                          650px circle at ${mouseX}px ${mouseY}px,
                          rgba(59, 130, 246, 0.15),
                          transparent 80%
                        )
                    `,
				}}
			/>
			<div className="spotlight-content">{children}</div>
		</div>
	);
};

const TiltCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	const mouseXSpring = useSpring(x);
	const mouseYSpring = useSpring(y);

	const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['15deg', '-15deg']);
	const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-15deg', '15deg']);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;
		const xPct = mouseX / width - 0.5;
		const yPct = mouseY / height - 0.5;
		x.set(xPct);
		y.set(yPct);
	};

	const handleMouseLeave = () => {
		x.set(0);
		y.set(0);
	};

	return (
		<motion.div
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
			className="tilt-card-container"
		>
			{children}
		</motion.div>
	);
};

const Marquee = () => (
	<div className="marquee-container">
		<div className="marquee-content">
			{[...Array(10)].map((_, i) => (
				<span key={i} className="marquee-item">
					MANGA <Star size={14} fill="currentColor" /> MANHWA{' '}
					<Star size={14} fill="currentColor" /> COMICS{' '}
					<Star size={14} fill="currentColor" />
				</span>
			))}
		</div>
	</div>
);

const stats = [
	{ id: 1, label: 'Truyện Tranh', value: 10000, suffix: '+', icon: BookOpen },
	{ id: 2, label: 'Thành Viên', value: 150000, suffix: '+', icon: Users },
	{ id: 3, label: 'Tác Giả', value: 500, suffix: '+', icon: Zap },
	{ id: 4, label: 'Lượt Đọc', value: 10000000, suffix: '+', icon: Globe },
];

const coreValues = [
	{
		title: 'Đam Mê',
		desc: 'Sống và thở cùng truyện tranh, mang đến cảm xúc chân thực.',
		icon: Heart,
		color: 'red',
	},
	{
		title: 'Sáng Tạo',
		desc: 'Không giới hạn tưởng tượng, bệ phóng cho tài năng trẻ.',
		icon: Sparkles,
		color: 'yellow',
	},
	{
		title: 'Kết Nối',
		desc: 'Cộng đồng văn minh, chia sẻ đam mê không khoảng cách.',
		icon: Users,
		color: 'blue',
	},
	{
		title: 'Chất Lượng',
		desc: 'Trải nghiệm đỉnh cao, bản quyền minh bạch.',
		icon: Target,
		color: 'green',
	},
];

const AboutPage: React.FC = () => {
	const heroRef = useRef(null);
	const { scrollYProgress } = useScroll({
		target: heroRef,
		offset: ['start start', 'end start'],
	});
	const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
	const textY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
	const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

	useLayoutEffect(() => {
		const savedTheme = document.documentElement.getAttribute('data-theme');

		document.documentElement.setAttribute('data-theme', 'night');
		document.body.classList.add('about-page-active');

		return () => {
			if (savedTheme) {
				document.documentElement.setAttribute('data-theme', savedTheme);
			} else {
				document.documentElement.removeAttribute('data-theme');
			}
			document.body.classList.remove('about-page-active');
		};
	}, []);

	return (
		<div className="about-page-wrapper">
			<div className="hero-section" ref={heroRef}>
				<motion.div
					className="hero-bg-image"
					style={{
						backgroundImage: `url(${backgroundAboutUs})`,
						y: heroY,
					}}
				/>
				<div className="hero-particles" />
				<div className="hero-bg-overlay" />

				<motion.div style={{ y: textY, opacity }} className="hero-content">
					<div className="hero-logo-wrapper">
						<img
							src={logoLight}
							alt="StoryVerse Logo"
							className="logo-image logo-for-light"
						/>
						<img
							src={logoDark}
							alt="StoryVerse Logo"
							className="logo-image logo-for-dark"
						/>
					</div>

					<h1 className="hero-title">
						<span className="hero-title-top">Vũ Trụ</span>
						<span className="hero-title-main">Truyện Tranh</span>
					</h1>
					<p className="hero-subtitle">
						Nơi những câu chuyện chạm đến{' '}
						<span className="highlight-text">trái tim</span> và cảm xúc được{' '}
						<span className="highlight-text">thăng hoa</span>.
					</p>
				</motion.div>

				<div className="scroll-indicator-wrapper">
					<div className="scroll-indicator">
						<div className="scroll-dot"></div>
					</div>
				</div>
			</div>

			<Marquee />

			<div className="main-content-wrapper">
				<section className="story-section section-container">
					<div className="story-grid">
						<InViewAnimation direction="left" className="story-content-box">
							<h2 className="section-heading">
								Câu Chuyện <br />{' '}
								<span className="text-primary">Của Chúng Tôi</span>
							</h2>
							<div className="story-divider"></div>
							<p className="story-text">
								<strong>StoryVerse</strong> không chỉ là một website, đó là{' '}
								<span className="text-highlight">giấc mơ</span> của những con người
								yêu truyện tranh. Khởi đầu từ niềm tin rằng truyện tranh Việt cần
								một vị thế xứng đáng trên bản đồ thế giới.
							</p>
							<p className="story-text">
								Chúng tôi kiến tạo một không gian nơi bản quyền được tôn trọng, tác
								giả được vinh danh, và độc giả được đắm chìm trong những trải nghiệm
								đọc mượt mà nhất.
							</p>
						</InViewAnimation>

						<InViewAnimation direction="right" delay={0.2}>
							<div className="story-image-container">
								<div className="story-image-glow-bg"></div>
								<img
									src={aboutusImage}
									alt="Comic Workspace"
									className="story-image"
								/>
							</div>
						</InViewAnimation>
					</div>
				</section>

				<section className="stats-section">
					<div className="section-container">
						<div className="stats-grid">
							{stats.map((stat, index) => (
								<InViewAnimation key={stat.id} delay={index * 0.1}>
									<SpotlightCard className="stat-card">
										<div className="stat-icon-wrapper">
											<stat.icon size={32} />
										</div>
										<h3 className="stat-value">
											<AnimatedCounter to={stat.value} suffix={stat.suffix} />
										</h3>
										<p className="stat-label">{stat.label}</p>
									</SpotlightCard>
								</InViewAnimation>
							))}
						</div>
					</div>
				</section>

				<section className="founder-section section-container">
					<div className="founder-bg-blur blur-blue"></div>
					<div className="founder-bg-blur blur-purple"></div>

					<div
						className="founder-card"
						style={{
							backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.8)), url(${galaxyGif})`,
						}}
					>
						<InViewAnimation>
							<div className="founder-header">
								<span className="founder-eyebrow">The Visionary</span>
								<h2 className="founder-title">Nhà Sáng Lập</h2>
							</div>
						</InViewAnimation>

						<div className="founder-content-wrapper">
							<InViewAnimation
								direction="right"
								delay={0.2}
								className="founder-image-area"
							>
								<TiltCard>
									<div className="founder-image-wrapper">
										<div className="founder-image-glow"></div>
										<img src={avatar} alt="Founder" className="founder-image" />
										<div className="founder-badge">CEO</div>
									</div>
								</TiltCard>
							</InViewAnimation>

							<InViewAnimation
								direction="left"
								delay={0.4}
								className="founder-info-area"
							>
								<h3 className="founder-name">Dương Nguyễn Nhật Quang</h3>
								<p className="founder-role">CEO & Lead Developer</p>
								<div className="founder-quote-box">
									<p className="founder-quote">
										"Tôi tạo ra StoryVerse không chỉ để bán truyện tranh, mà để
										tạo ra một vũ trụ nơi trí tưởng tượng được tôn vinh. Mỗi
										dòng code là một viên gạch xây dựng nên giấc mơ này."
									</p>
								</div>
								<a
									href="https://www.facebook.com/nhtqug.05/"
									target="_blank"
									rel="noopener noreferrer"
									className="founder-contact-btn"
								>
									<span>Kết nối với tôi</span>
									<div className="btn-glow"></div>
								</a>
							</InViewAnimation>
						</div>
					</div>
				</section>

				<section className="values-section">
					<div className="section-container">
						<InViewAnimation>
							<h2 className="values-title">Giá Trị Cốt Lõi</h2>
						</InViewAnimation>
						<div className="values-grid">
							{coreValues.map((item, index) => (
								<InViewAnimation key={index} delay={index * 0.1}>
									<SpotlightCard
										className={`core-value-card theme-${item.color}`}
									>
										<div className={`value-icon-wrapper`}>
											<item.icon size={32} strokeWidth={1.5} />
										</div>
										<h4 className="value-card-title">{item.title}</h4>
										<p className="value-card-desc">{item.desc}</p>
									</SpotlightCard>
								</InViewAnimation>
							))}
						</div>
					</div>
				</section>

				<section className="cta-section section-container">
					<InViewAnimation>
						<div
							className="cta-box group"
							style={{ backgroundImage: `url(${bgDiscover})` }}
						>
							<div className="cta-overlay"></div>
							<div className="cta-content">
								<h2 className="cta-title">Sẵn sàng khám phá thế giới mới?</h2>
								<p className="cta-subtitle">
									Tham gia cộng đồng StoryVerse ngay hôm nay để mở khóa hàng ngàn
									bộ truyện tranh độc quyền.
								</p>
								<Link to="/" className="cta-button">
									Khám Phá Ngay
								</Link>
							</div>
						</div>
					</InViewAnimation>
				</section>
			</div>
		</div>
	);
};

export default AboutPage;
