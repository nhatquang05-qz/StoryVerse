const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface ChatHistory {
	role: 'user' | 'model';
	parts: string;
}

export const getBotResponse = async (
	message: string,
	history: ChatHistory[],
	token: string,
): Promise<string> => {
	const formattedHistory = history.map((item) => ({
		role: item.role === 'model' ? 'assistant' : item.role,
		content: item.parts,
	}));

	try {
		const response = await fetch(`${API_URL}/chatbot/ask`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				message: message,
				history: formattedHistory,
			}),
		});

		const data = await response.json();

		if (!response.ok) {
			return data.error || 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.';
		}

		return data.reply;
	} catch (error) {
		console.error('Error fetching bot response:', error);
		return 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.';
	}
};
