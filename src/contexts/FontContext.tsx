import React, { createContext, useState, useContext, type ReactNode, useEffect, useMemo } from 'react';

const FONT_STORAGE_KEY = 'storyverse_selected_font';

interface FontOption {
    id: string;
    name: string;
    cssVariable: string;
}

export const FONT_OPTIONS: FontOption[] = [
    { id: 'Inter', name: 'Inter (Mặc định)', cssVariable: 'var(--font-sans)' },
    { id: 'Merriweather', name: 'Merriweather (Chân)', cssVariable: 'var(--font-serif)' },
];

interface FontContextType {
  selectedFont: FontOption;
  selectFont: (fontId: string) => void;
  fontOptions: FontOption[];
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export const FontProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedFontId, setSelectedFontId] = useState<string>(() => {
        return localStorage.getItem(FONT_STORAGE_KEY) || 'Inter';
    });

    const selectedFont = useMemo(() => {
        return FONT_OPTIONS.find(f => f.id === selectedFontId) || FONT_OPTIONS[0];
    }, [selectedFontId]);

    useEffect(() => {
        document.documentElement.style.setProperty('--font-family-base', selectedFont.cssVariable);
        localStorage.setItem(FONT_STORAGE_KEY, selectedFontId);
    }, [selectedFont, selectedFontId]);

    const selectFont = (fontId: string) => {
        const fontExists = FONT_OPTIONS.some(f => f.id === fontId);
        if (fontExists) {
            setSelectedFontId(fontId);
        }
    };

    return (
        <FontContext.Provider value={{ selectedFont, selectFont, fontOptions: FONT_OPTIONS }}>
            {children}
        </FontContext.Provider>
    );
};

export const useFont = () => {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
};