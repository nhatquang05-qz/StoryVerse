import React from 'react';
import '../../../assets/styles/Loading.css';
import customGif from './naruto.gif';

interface LoadingPageProps {}

const LoadingPage: React.FC<LoadingPageProps> = () => {
	return (
		<div className="full-page-loading">
			<img src={customGif} alt="Loading Animation" className="loading-gif" />
			<div className="bouncing-dots">
				<div className="dot"></div>
				<div className="dot"></div>
				<div className="dot"></div>
			</div>
		</div>
	);
};

export default LoadingPage;
