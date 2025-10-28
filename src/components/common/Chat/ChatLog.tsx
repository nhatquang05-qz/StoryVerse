import React, { useEffect, useRef, useState, useCallback } from 'react';
import './ChatLog.css';
import ChatMessage, { type ChatMessageData } from './ChatMessage';
import { useAuth } from '../../../contexts/AuthContext';
import { FiSend, FiImage, FiX } from 'react-icons/fi';
import ProfanityWarningPopup from '../../popups/ProfanityWarningPopup';
import { isProfane } from '../../../utils/profanityList';

const mockMessagesData: ChatMessageData[] = [
    { id: 1, userId: 'user-coconut', userName: "Coconut", avatarUrl: "https://i.imgur.com/g5V2w1D.png", timestamp: "13:40", message: "rùi", userLevel: 1, likes: ['user-ffdai'] },
    { id: 2, userId: 'user-ffdai', userName: "ff.dai13112007", avatarUrl: "https://i.imgur.com/L30h9hZ.png", timestamp: "13:44", message: "cơm chó nhiều vầy 😡😡😡😡", userLevel: 1, likes: [] },
    { id: 3, userId: 'user-cao', userName: "CÁO MẮT TRĂNG", avatarUrl: "https://i.imgur.com/8mVLK0f.png", timestamp: "14:00", message: "xin cảm nhận ik đứa", userLevel: 2, likes: ['user-ffdai', 'user-san'] },
    { id: 4, userId: 'user-san', userName: "San", avatarUrl: "https://i.imgur.com/tq9k3Yj.png", timestamp: "14:53", message: "sdsds", userLevel: 5, likes: [], replyTo: 3, replyToAuthor: "CÁO MẮT TRĂNG" },
    { id: 5, userId: 'user-duongnguyennhatquang@gmail.com', userName: "duongnguyennhatquang", avatarUrl: "https://i.imgur.com/tq9k3Yj.png", timestamp: "03:48", message: "sdsdsd", userLevel: 13, likes: ['user-cao'] },
    { id: 6, userId: 'user-duongnguyennhatquang@gmail.com', userName: "duongnguyennhatquang", avatarUrl: "https://i.imgur.com/tq9k3Yj.png", timestamp: "03:49", message: "sssd", userLevel: 13, likes: [] },
];


const ChatLog: React.FC = () => {
    const { currentUser, getEquivalentLevelTitle } = useAuth();
    const [messages, setMessages] = useState<ChatMessageData[]>(() => {
         if (currentUser && !mockMessagesData.some(m => m.userId === currentUser.id)) {
             const userMessages: ChatMessageData[] = [
                 { id: 7, userId: currentUser.id, userName: currentUser.fullName || currentUser.email.split('@')[0], avatarUrl: "https://i.imgur.com/tq9k3Yj.png", timestamp: "03:50", message: "Tin nhắn cũ 1", userLevel: currentUser.level, likes: [] },
                 { id: 8, userId: currentUser.id, userName: currentUser.fullName || currentUser.email.split('@')[0], avatarUrl: "https://i.imgur.com/tq9k3Yj.png", timestamp: "03:51", message: "Tin nhắn cũ 2", userLevel: currentUser.level, likes: [] }
             ];
             return [...mockMessagesData, ...userMessages];
        }
        return mockMessagesData;
    });
    const [newMessage, setNewMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<{ id: number; author: string } | null>(null);
    const chatMessagesListRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageInputRef = useRef<HTMLInputElement>(null);
    const [isWarningPopupOpen, setIsWarningPopupOpen] = useState(false);

    const systemKey = localStorage.getItem('user_level_system') || 'Ma Vương';
    const renderKey = currentUser ? `${currentUser.id}-${currentUser.level}-${systemKey}` : 'default';

    useEffect(() => {
        if (chatMessagesListRef.current) {
            chatMessagesListRef.current.scrollTop = chatMessagesListRef.current.scrollHeight;
        }
    }, [messages, renderKey]);

     useEffect(() => {
        if (replyingTo && messageInputRef.current) {
            messageInputRef.current.focus();
        }
    }, [replyingTo]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                 alert("Kích thước ảnh quá lớn (tối đa 5MB).");
                 if (fileInputRef.current) fileInputRef.current.value = "";
                 return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result as string);
            }
            reader.readAsDataURL(file);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedImage) || !currentUser) return;

        if (newMessage.trim() && isProfane(newMessage)) {
            setIsWarningPopupOpen(true);
            return;
        }

        const createMessageObject = (imgDataUrl?: string): ChatMessageData => ({
            id: Date.now(),
            userId: currentUser.id,
            userName: currentUser.fullName || currentUser.email.split('@')[0],
            avatarUrl: "https://i.imgur.com/tq9k3Yj.png",
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            message: newMessage.trim(),
            userLevel: currentUser.level,
            imageUrl: imgDataUrl,
            likes: [],
            replyTo: replyingTo?.id,
            replyToAuthor: replyingTo?.author,
        });

        const resetInputs = () => {
            setNewMessage('');
            setSelectedImage(null);
            setImagePreviewUrl(null);
            setReplyingTo(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        };

        if (selectedImage) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const messageToSend = createMessageObject(reader.result as string);
                setMessages(prev => [...prev, messageToSend]);
                resetInputs();
            }
            reader.onerror = () => {
                console.error("Lỗi đọc file ảnh");
                alert("Không thể đọc file ảnh đã chọn.");
                resetInputs();
            }
            reader.readAsDataURL(selectedImage);
        } else if (newMessage.trim()) {
            const messageToSend = createMessageObject();
            setMessages(prev => [...prev, messageToSend]);
            resetInputs();
        }
    };

    const handleImageButtonClick = () => {
        fileInputRef.current?.click();
    };

    const cancelImageSelection = () => {
        setSelectedImage(null);
        setImagePreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleLikeMessage = useCallback((messageId: number) => {
        if (!currentUser) return;
        setMessages(prevMessages =>
            prevMessages.map(msg => {
                if (msg.id === messageId) {
                    const currentLikes = msg.likes || [];
                    const isLiked = currentLikes.includes(currentUser.id);
                    const newLikes = isLiked
                        ? currentLikes.filter(id => id !== currentUser.id)
                        : [...currentLikes, currentUser.id];
                    return { ...msg, likes: newLikes };
                }
                return msg;
            })
        );
    }, [currentUser]);

    const handleReplyMessage = useCallback((messageId: number, authorName: string) => {
        if (!currentUser) return;
        setReplyingTo({ id: messageId, author: authorName });
    }, [currentUser]);

    const cancelReply = () => {
        setReplyingTo(null);
    };

    const getLevelTitleForDisplay = (userId: string, userLevel: number): string => {
        if (currentUser && userId === currentUser.id) {
            return getEquivalentLevelTitle(userLevel);
        } else {
            return `Cấp ${userLevel}`;
        }
    };

    return (
        <div key={renderKey} className="chat-room-container">
            <div className="chat-room-header">
                Vạn hữu đàm đạo
            </div>

            <div className="chat-messages-list" ref={chatMessagesListRef}>
                {messages.map((msg: ChatMessageData) => (
                    <ChatMessage
                        key={msg.id}
                        msg={msg}
                        levelTitle={getLevelTitleForDisplay(msg.userId, msg.userLevel)}
                        onLike={handleLikeMessage}
                        onReply={handleReplyMessage}
                        currentUserId={currentUser?.id || null}
                    />
                ))}
            </div>

            {currentUser ? (
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                    {replyingTo && (
                        <div className="replying-to-indicator">
                            Trả lời @{replyingTo.author}
                            <button type="button" onClick={cancelReply} className="cancel-reply-btn"><FiX/></button>
                        </div>
                    )}
                    {imagePreviewUrl && (
                        <div className="image-preview-container">
                            <img src={imagePreviewUrl} alt="Xem trước" className="image-preview" />
                            <button type="button" onClick={cancelImageSelection} className="cancel-image-btn"><FiX/></button>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/png, image/jpeg, image/gif"
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        className="image-upload-btn"
                        onClick={handleImageButtonClick}
                        title="Đính kèm ảnh"
                        disabled={!!selectedImage}
                    >
                       <FiImage />
                    </button>

                    <input
                        ref={messageInputRef}
                        type="text"
                        placeholder={replyingTo ? `Trả lời ${replyingTo.author}...` : (selectedImage ? "Thêm chú thích..." : "Nhập tin nhắn...")}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="send-btn" disabled={!newMessage.trim() && !selectedImage}>
                       <FiSend />
                    </button>
                </form>
            ) : (
                <div className="chat-login-prompt">
                    Bạn phải đăng nhập để nói chuyện.
                </div>
            )}

            <ProfanityWarningPopup
                isOpen={isWarningPopupOpen}
                onClose={() => setIsWarningPopupOpen(false)}
            />
        </div>
    );
};

export default ChatLog;