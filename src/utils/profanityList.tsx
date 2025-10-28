export const BadWords: string[] = [
    "chửi1", "bậy2", "tục3", "cấm4", "dm", "vl", "đụ", "cặc", "lồn","mẹ", "má", "fuck", "chó", "đĩ", "đỉ", "moá", "moẹ", "clm", "cmm" ,"mm", "súc vật", "sv", "súc sinh", "loz", "lmm", "lồn mẹ m", "con mẹ m","cứt", "shit", "shjt","óc cặc", "ắc cọc", "óc cặt", "ắt cọc", "não chó", "ngu","abc",
    // ... các từ khác
];

export const allForbiddenWords = [...BadWords];

export const isProfane = (text: string): boolean => {
    const lowerText = text.toLowerCase(); 
    for (const word of allForbiddenWords) {
        const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'g');
        if (regex.test(lowerText)) {
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