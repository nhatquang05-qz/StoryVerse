// src/utils/profanityList.ts

// DANH SÁCH TỪ CẤM TIẾNG VIỆT
// Hãy bổ sung thêm các từ bạn muốn chặn vào đây
export const vietnameseBadWords: string[] = [
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
    "chó"
    // Thêm các từ khác vào đây
    // Ví dụ:
    // "từcấm5",
    // "từcấm6",
];

// (Tùy chọn) Danh sách từ cấm tiếng Anh hoặc ngôn ngữ khác
// export const englishBadWords: string[] = ["badword1", "badword2"];

// Kết hợp tất cả danh sách nếu cần
// export const allForbiddenWords = [...vietnameseBadWords, ...englishBadWords];
export const allForbiddenWords = [...vietnameseBadWords];


// Hàm kiểm tra từ cấm (có thể để ở đây hoặc import trực tiếp mảng vào component)
export const isProfane = (text: string): boolean => {
    for (const word of allForbiddenWords) {
        // Sử dụng regex với \b để chỉ khớp với từ hoàn chỉnh, không phân biệt hoa thường (i)
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        if (regex.test(text)) {
            return true; // Tìm thấy từ cấm
        }
    }
    return false; // Không tìm thấy từ cấm
};

// (Tùy chọn) Hàm thay thế từ cấm (nếu bạn muốn quay lại cách thay thế ***)
export const cleanText = (text: string): string => {
    let cleanedText = text;
    for (const word of allForbiddenWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        cleanedText = cleanedText.replace(regex, '***');
    }
    return cleanedText;
}