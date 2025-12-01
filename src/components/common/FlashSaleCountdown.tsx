import React, { useState, useEffect } from 'react';
import '../../assets/styles/FlashSaleCountdown.css';

interface FlashSaleCountdownProps {
  targetDate: string;
  isUpcoming: boolean;
  onTimeUp?: () => void;
}

const SlidingDigit = ({ digit }: { digit: string }) => {
  const [val, setVal] = useState(digit);
  const [prev, setPrev] = useState<string | null>(null);

  useEffect(() => {
    if (digit !== val) {
      setPrev(val);
      setVal(digit);
    }
  }, [digit, val]);

  return (
    <div className="fs-timer-box">
       {prev !== null && (
          <span 
             key={`prev-${prev}`} 
             className="fs-digit fs-digit-old"
             onAnimationEnd={() => setPrev(null)} 
          >
            {prev}
          </span>
       )}

       <span 
          key={`curr-${val}`} 
          className="fs-digit fs-digit-new"
       >
          {val}
       </span>
    </div>
  );
};

const TimeBlock = ({ value }: { value: number }) => {
  const strVal = value < 10 ? `0${value}` : value.toString();
  const digit1 = strVal.charAt(0);
  const digit2 = strVal.charAt(1);

  return (
    <>
      <SlidingDigit digit={digit1} />
      <SlidingDigit digit={digit2} />
    </>
  );
};

const FlashSaleCountdown: React.FC<FlashSaleCountdownProps> = ({ targetDate, isUpcoming, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        if (onTimeUp) onTimeUp();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate, onTimeUp]);

  return (
    <div className="fs-countdown">
      <span className="fs-timer-label">
        {isUpcoming ? 'Bắt đầu sau' : 'Kết thúc trong'}
      </span>
      <div className="fs-timer-digits">
        <TimeBlock value={timeLeft.hours} />
        <div className="fs-timer-sep">:</div>
        <TimeBlock value={timeLeft.minutes} />
        <div className="fs-timer-sep">:</div>
        <TimeBlock value={timeLeft.seconds} />
      </div>
    </div>
  );
};

export default FlashSaleCountdown;