export const BadWords: string[] = [
    "chửi1",
    "bậy2",
    "tục3",
    "cấm4",
    "dm",
    "vl",
    "đụ",
    "cặc",
    "lồn",
    "mẹ",
    "má",
    "fuck",
    "chó",
    "đĩ",
    "đỉ",
    "moá",
    "moẹ",
    "clm",
    "cmm",
    "mm",
    "súc vật",
    "sv",
    "súc sinh",
    "loz",
    "lmm",
    "lồn mẹ m",
    "con mẹ m",
    "cứt",
    "shit",
    "shjt",
];

export const allForbiddenWords = [...BadWords];

export const isProfane = (text: string): boolean => {
    for (const word of allForbiddenWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        if (regex.test(text)) {
            return true; 
        }
    }
    return false; 
};

export const cleanText = (text: string): string => {
    let cleanedText = text;
    for (const word of allForbiddenWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        cleanedText = cleanedText.replace(regex, '***');
    }
    return cleanedText;
}