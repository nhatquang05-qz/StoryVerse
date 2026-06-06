import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface SnowfallContextType {
	isSnowfallEnabled: boolean;
	toggleSnowfall: () => void;
}

const SnowfallContext = createContext<SnowfallContextType | undefined>(undefined);

export const SnowfallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [isSnowfallEnabled, setIsSnowfallEnabled] = useState<boolean>(() => {
		const stored = localStorage.getItem('storyverse_snowfall_enabled');
		return stored !== null ? JSON.parse(stored) : true;
	});

	useEffect(() => {
		localStorage.setItem('storyverse_snowfall_enabled', JSON.stringify(isSnowfallEnabled));
	}, [isSnowfallEnabled]);

	const toggleSnowfall = () => {
		setIsSnowfallEnabled((prev) => !prev);
	};

	return (
		<SnowfallContext.Provider value={{ isSnowfallEnabled, toggleSnowfall }}>
			{children}
		</SnowfallContext.Provider>
	);
};

export const useSnowfall = () => {
	const context = useContext(SnowfallContext);
	if (context === undefined) {
		throw new Error('useSnowfall must be used within a SnowfallProvider');
	}
	return context;
};
