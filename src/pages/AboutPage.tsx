import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import { BookOpen, Users, Zap, Heart, Target, Globe } from 'lucide-react';
import logo from '../assets/images/logo.avif'; 
import backgroundAboutUs from '../assets/images/background-aboutus.avif';
import '../assets/styles/AboutPage.css'; 
import avatar from '../assets/images/raw/nquang.png';
import bgDiscover from '../assets/images/bg-discover.avif';
import galaxyGif from '../assets/images/galaxy.gif';

const AnimatedCounter = ({ from = 0, to, suffix = "" }: { from?: number, to: number, suffix?: string }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      const node = nodeRef.current;
      const controls = animate(from, to, {
        duration: 1,
        ease: "easeOut", 
        onUpdate(value) {
          if (node) {
            node.textContent = Math.floor(value).toLocaleString('en-US') + suffix;
          }
        },
      });

      return () => controls.stop();
    }
  }, [from, to, isInView, suffix]);

  return <span ref={nodeRef}>{from}{suffix}</span>;
};

const InViewAnimation: React.FC<{ children: React.ReactNode, delay?: number, className?: string }> = ({ children, delay = 0, className = '' }) => {
  const [hasViewed, setHasViewed] = useState(false);
  return (
    <motion.div
      className={`motion-hidden ${hasViewed ? 'motion-animate' : ''} ${className}`}
      onViewportEnter={() => setHasViewed(true)}
      viewport={{ once: true, amount: 0.3 }} 
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </motion.div>
  );
};

const stats = [
  { id: 1, label: "Truyện Tranh", value: 10000, suffix: "+", icon: BookOpen }, 
  { id: 2, label: "Thành Viên", value: 150000, suffix: "+", icon: Users },
  { id: 3, label: "Tác Giả", value: 500, suffix: "+", icon: Zap },
  { id: 4, label: "Lượt Đọc", value: 10000000, suffix: "+", icon: Globe },
];

const coreValues = [
  { title: "Đam Mê", desc: "Chúng tôi sống và thở cùng truyện tranh, mang đến những câu chuyện chạm đến trái tim.", icon: Heart, colorClass: "bg-red-light" },
  { title: "Sáng Tạo", desc: "Nơi trí tưởng tượng không có giới hạn, ủng hộ các tác giả trẻ vươn tầm thế giới.", icon: Zap, colorClass: "bg-yellow-light" },
  { title: "Kết Nối", desc: "Xây dựng cộng đồng văn minh, nơi độc giả và tác giả cùng chia sẻ cảm xúc.", icon: Users, colorClass: "bg-blue-light" },
  { title: "Chất Lượng", desc: "Trải nghiệm đọc mượt mà, hình ảnh sắc nét và bản quyền minh bạch.", icon: Target, colorClass: "bg-green-light" },
];

const AboutPage: React.FC = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="about-container">
      
      <div className="hero-section" ref={ref}>
        <div 
          className="hero-bg-image" 
          style={{ backgroundImage: `url(${backgroundAboutUs})` }} 
        />
        <div className="hero-bg-overlay" />
        
        <motion.div style={{ y, opacity }} className="hero-content">
          <motion.img 
            src={logo} alt="StoryVerse Logo" className="logo-image"
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          />
          <h1 className="hero-title">Vũ Trụ Truyện Tranh</h1>
          <p className="hero-subtitle">Nơi những câu chuyện trở nên sống động và cảm xúc được thăng hoa.</p>
        </motion.div>

        <div className="scroll-indicator-wrapper">
          <div className="scroll-indicator"><div className="scroll-dot"></div></div>
        </div>
      </div>

      <div className="relative z-20">
        
        <section className="story-section section-container">
          <div className="story-grid">
            <InViewAnimation delay={0.1}>
              <h2 className="story-heading">Câu Chuyện Của Chúng Tôi</h2>
              <p className="story-text">StoryVerse không chỉ là một website, đó là giấc mơ của những con người yêu truyện tranh. Chúng tôi bắt đầu từ một căn phòng nhỏ với niềm tin rằng truyện tranh Việt Nam và thế giới cần một cầu nối hiện đại hơn.</p>
              <p className="story-text">Tại đây, chúng tôi tôn trọng bản quyền, tôn vinh tác giả và trân trọng từng độc giả. Mỗi trang truyện bạn đọc là một sự ủng hộ to lớn đối với cộng đồng sáng tạo.</p>
            </InViewAnimation>
            <InViewAnimation delay={0.3}>
              <div className="story-image-wrapper">
                 <img src="https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=2070&auto=format&fit=crop" alt="Comic Workspace" className="story-image" />
              </div>
            </InViewAnimation>
          </div>
        </section>

        <section className="stats-section">
          <div className="section-container">
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <InViewAnimation key={stat.id} delay={index * 0.15}>
                  <div className="stat-icon"><stat.icon size={40} /></div>
                  <h3 className="stat-value">
                    <AnimatedCounter to={stat.value} suffix={stat.suffix} />
                  </h3>
                  <p className="stat-label">{stat.label}</p>
                </InViewAnimation>
              ))}
            </div>
          </div>
        </section>

        <section className="founder-section section-container" 
        style={{
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.92), rgb(83, 91, 242, 0.7)), url(${galaxyGif})`,
            backgroundSize: 'cover',      
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: '2rem',         
            padding: '3rem',            
            marginTop: '2rem',           
            marginBottom: '2rem',      
            color: '#fff'               
          }}>
          <InViewAnimation>
            <div className="founder-header">
              <span className="founder-eyebrow">Visionary</span>
              <h2 className="founder-title">Nhà Sáng Lập</h2>
            </div>
          </InViewAnimation>
          <div className="founder-content-wrapper">
            <InViewAnimation delay={0.2}>
              <div className="founder-image-wrapper">
                <div className="founder-image-glow"></div>
                <div className="founder-image-ring">
                  <img src={avatar} alt="Founder" className="founder-image" />
                </div>
              </div>
            </InViewAnimation>
            <InViewAnimation delay={0.4} className="founder-info">
              <h3 className="founder-name">Dương Nguyễn Nhật Quang</h3>
              <p className="founder-role">CEO & Lead Developer</p>
              <blockquote className="founder-quote">"Tôi tạo ra StoryVerse không chỉ để bán truyện tranh, mà để tạo ra một vũ trụ nơi trí tưởng tượng được tôn vinh. Mỗi dòng code là một viên gạch xây dựng nên giấc mơ này."</blockquote>
              <a 
                  href="https://www.facebook.com/nhtqug.05/"  
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="founder-contact-btn"
              >
                  Liên hệ với tôi
              </a>
            </InViewAnimation>
          </div>
        </section>

        <section className="values-section">
          <div className="section-container">
            <InViewAnimation><h2 className="values-title">Giá Trị Cốt Lõi</h2></InViewAnimation>
            <div className="values-grid">
              {coreValues.map((item, index) => (
                <InViewAnimation key={index} delay={index * 0.1} className="core-value-card">
                  <div className={`value-icon-wrapper ${item.colorClass}`}>
                    <item.icon size={32} strokeWidth={2} />
                  </div>
                  <h4 className="value-card-title">{item.title}</h4>
                  <p className="value-card-desc">{item.desc}</p>
                </InViewAnimation>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section section-container">
           <InViewAnimation delay={0.1}>
             <div 
               className="cta-box"
               style={{
                 backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(36, 93, 116, 0.55)), url(${bgDiscover})`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat'
               }}
             >
               <h2 className="cta-title">Sẵn sàng khám phá thế giới mới?</h2>
               <p className="cta-subtitle">Tham gia cộng đồng StoryVerse ngay hôm nay để mở khóa hàng ngàn bộ truyện tranh độc quyền.</p>
               <Link to="/" className="cta-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
                 Khám Phá Ngay
               </Link>
             </div>
           </InViewAnimation>
        </section>

      </div>
    </div>
  );
};

export default AboutPage;