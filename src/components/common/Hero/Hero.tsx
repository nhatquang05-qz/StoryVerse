import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import "../../../styles/Hero.css";
import bgSlide1 from './bg-slide1.png';
import bgSlide2 from './bg-slide2.png';
import bgSlide3 from './bg-slide3.png';
import bgSlide4 from './bg-slide4.png';
import bgSlide5 from './bg-slide5.png';
import mb11 from './mb-11.png';
import mb12 from './mb-12.png';
import mb13 from './mb-13.png';
import mb21 from './mb-21.png';
import mb22 from './mb-22.png';
import mb23 from './mb-23.png';
import mb31 from './mb-31.png';
import mb32 from './mb-32.png';
import mb33 from './mb-33.png';
import mb41 from './mb-41.png';
import mb42 from './mb-42.png';
import mb43 from './mb-43.png';
import mb51 from './mb-51.png';
import mb52 from './mb-52.png';
import mb53 from './mb-53.png';

const sections = [
  {
    title: "NHẬT BẢN",
    backgroundImage: bgSlide1,
    images: [
      mb11,
      mb12,
      mb13,
    ],
  },
  {
    title: "DC COMICS",
    backgroundImage: bgSlide2,
    images: [
      mb21,
      mb22,
      mb23,
    ],
  },
  {
    title: "HÀN QUỐC",
    backgroundImage: bgSlide3,
    images: [
      mb31,
      mb32,
      mb33,
    ],
  },
  {
    title: "MARVEL COMICS",
    backgroundImage: bgSlide4,
    images: [
      mb41,
      mb42,
      mb43,
    ],
  },
  {
    title: "TRUNG QUỐC",
    backgroundImage: bgSlide5,
    images: [
      mb51,
      mb52,
      mb53,
    ],
  },
];

const Hero: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [resetTimer, setResetTimer] = useState(0); 
  
  const AUTO_SLIDE_TIME = 5000; 

  const nextIndex = useCallback(() => {
    setIndex((prev) => (prev + 1) % sections.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextIndex, AUTO_SLIDE_TIME);
    return () => clearInterval(timer);
  }, [resetTimer, nextIndex]); 

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % sections.length);
    setResetTimer(prev => prev + 1); 
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + sections.length) % sections.length);
    setResetTimer(prev => prev + 1); 
  };

  const current = sections[index];

  return (
    <section className="hero-slider">
        <AnimatePresence>
            <motion.div
                key={index}
                className="hero-background-layer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    backgroundImage: `url(${current.backgroundImage})`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.1,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0,
                }}
            />
        </AnimatePresence>

      <div className="hero-info">
        <h3>TRUYỆN</h3>
        <h1>{current.title}</h1>
      </div>

      <button className="nav-btn prev-btn" onClick={prevSlide} aria-label="Previous Slide">
          <FiChevronLeft />
      </button>
      <button className="nav-btn next-btn" onClick={nextSlide} aria-label="Next Slide">
          <FiChevronRight />
      </button>

      <div className="hero-images">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className={`hero-group`}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ duration: 0.6 }}
          >
            {current.images.map((src, i) => (
              <motion.img
                key={i}
                src={src}
                alt={`slide-${i}`}
                className={`hero-img img-${i}`} 
                initial={{ opacity: 0, x: i === 0 ? -100 : i === 2 ? 100 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Hero;