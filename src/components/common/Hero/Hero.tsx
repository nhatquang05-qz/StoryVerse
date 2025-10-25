import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import "./Hero.css";

const sections = [
  {
    title: "MARVEL COMICS",
    images: [
      "/mb-11.png",
      "/mb-12.png",
      "/mb-13.png",
    ],
  },
  {
    title: "DC COMICS",
    images: [
      "/mb-21.png",
      "/mb-22.png",
      "/mb-23.png",
    ],
  },
  {
    title: "TRUYỆN HÀN QUỐC",
    images: [
      "/mb-31.png",
      "/mb-32.png",
      "/mb-33.png",
    ],
  },
  {
    title: "TRUYỆN TRUNG QUỐC",
    images: [
      "/mb-41.png",
      "/mb-42.png",
      "/mb-43.png",
    ],
  },
  {
    title: "TRUYỆN VIỆT NAM",
    images: [
      "/mb-51.png",
      "/mb-52.png",
      "/mb-53.png",
    ],
  },
];

const Hero: React.FC = () => {
  const [index, setIndex] = useState(0);

  // LOGIC CHUYỂN SLIDE TỰ ĐỘNG (4 GIÂY)
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % sections.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % sections.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + sections.length) % sections.length);
  };

  const current = sections[index];

  return (
    <section className="hero-slider">
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
            className="hero-group"
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