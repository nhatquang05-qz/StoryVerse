// src/components/AboutUs/HeroParticleText.tsx
import React, { useRef, useEffect } from 'react';

interface HeroParticleTextProps {
    title: string;
    slogan: string;
}

// *** GHI CHÚ QUAN TRỌNG:
// Để đạt được hiệu ứng chữ dạng hạt phức tạp như trong video, bạn cần:
// 1. Cài đặt một thư viện tạo hạt (ví dụ: `react-tsparticles` hoặc custom Canvas/WebGL).
// 2. Viết logic render chữ thành các điểm ảnh (pixel) và điều khiển các hạt 
//    di chuyển giữa trạng thái ban đầu và trạng thái tạo thành chữ.
// Đoạn code dưới đây chỉ tạo cấu trúc React và Canvas cơ bản. 
// Bạn, với vai trò lập trình viên, có thể tiếp tục phát triển logic particle 
// trong file JS/TS riêng hoặc tích hợp thư viện.

const HeroParticleText: React.FC<HeroParticleTextProps> = ({ title, slogan }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const container = canvas.parentElement as HTMLElement;
        let animationFrameId: number;
        
        // Thiết lập kích thước Canvas ban đầu
        const resizeCanvas = () => {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            // Kích hoạt lại logic vẽ hạt khi thay đổi kích thước
            // Nếu bạn có logic vẽ hạt phức tạp, hãy đặt nó ở đây
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas(); // Kích hoạt lần đầu

        // Ví dụ cơ bản về vòng lặp animation (nơi bạn sẽ đặt logic particle)
        // const animate = () => {
        //     const ctx = canvas.getContext('2d');
        //     if (ctx) {
        //         ctx.clearRect(0, 0, canvas.width, canvas.height); // Xóa khung hình
        //         // Logic vẽ hạt tại đây
        //     }
        //     animationFrameId = requestAnimationFrame(animate);
        // };
        // animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            // cancelAnimationFrame(animationFrameId); // Dừng animation khi component unmount
        };
    }, []);

    return (
        <div className="hero-particle-container">
            {/* Canvas nằm dưới, đảm nhận việc vẽ các hạt */}
            <canvas ref={canvasRef} id="particle-canvas"></canvas>
            
            <div className="hero-text-content">
                <h1 className="hero-title">{title}</h1>
                <p className="hero-slogan">{slogan}</p>
            </div>
        </div>
    );
};

export default HeroParticleText;