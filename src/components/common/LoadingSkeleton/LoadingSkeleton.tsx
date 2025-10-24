import React from 'react';
import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
    count?: number;
}

const SkeletonCard: React.FC = () => (
    <div className="skeleton-card">
        <div className="skeleton-image"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-author"></div>
        <div className="skeleton-price"></div>
    </div>
);

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 8 }) => {
    return (
        <div className="skeleton-container">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );
};

export default LoadingSkeleton;