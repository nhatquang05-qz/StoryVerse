import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import ChatMessage, { type ChatMessageData } from './ChatMessage'; 
import { FiSend, FiImage, FiX } from 'react-icons/fi';
import ProfanityWarningPopup from '../../popups/ProfanityWarningPopup';
import { isProfane } from '../../../utils/profanityList';
import './ChapterChat.css';

interface ChapterChatProps {
    comicId: number;
    chapterId: number;
}

const getStorageKey = (comicId: number, chapterId: number) => {
    return `storyverse_chat_${comicId}_${chapterId}`;
};

const ChapterChat: React.FC<ChapterChatProps> = ({ comicId, chapterId }) => {
    const { currentUser, getEquivalentLevelTitle } = useAuth();
    const { showNotification } = useNotification();
    const [messages, setMessages] = useState<ChatMessageData[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<{ id: number; author: string } | null>(null);
    const chatMessagesListRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageInputRef = useRef<HTMLInputElement>(null);
    const [isWarningPopupOpen, setIsWarningPopupOpen] = useState(false);

    const STORAGE_KEY = getStorageKey(comicId, chapterId);

    useEffect(() => {
        try {
            const storedMessages = localStorage.getItem(STORAGE_KEY);
            if (storedMessages) {
                setMessages(JSON.parse(storedMessages));
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error("Lỗi tải tin nhắn chương:", error);
            setMessages([]);
        }

        if (chatMessagesListRef.current) {
            chatMessagesListRef.current.scrollTop = chatMessagesListRef.current.scrollHeight;
        }
    }, [STORAGE_KEY]);

    useEffect(() => {
        if (chatMessagesListRef.current) {
            chatMessagesListRef.current.scrollTop = chatMessagesListRef.current.scrollHeight;
        }
    }, [messages]);

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
        if ((!newMessage.trim() && !selectedImage) || !currentUser) {
             if (!currentUser) showNotification("Bạn cần đăng nhập để bình luận", "warning");
            return;
        }

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

        const saveMessages = (newMsgs: ChatMessageData[]) => {
            setMessages(newMsgs);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newMsgs));
        }

        if (selectedImage) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const messageToSend = createMessageObject(reader.result as string);
                saveMessages([...messages, messageToSend]);
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
            saveMessages([...messages, messageToSend]);
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
        const updatedMessages = messages.map(msg => {
            if (msg.id === messageId) {
                const currentLikes = msg.likes || [];
                const isLiked = currentLikes.includes(currentUser.id);
                const newLikes = isLiked
                    ? currentLikes.filter(id => id !== currentUser.id)
                    : [...currentLikes, currentUser.id];
                return { ...msg, likes: newLikes };
            }
            return msg;
        });
        setMessages(updatedMessages);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
    }, [currentUser, messages, STORAGE_KEY]);

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
        }
        return `Cấp ${userLevel}`;
    };

    return (
        <div className="chapter-chat-container">
            <div className="chat-room-header">
                Bàn luận
            </div>

            <div className="chat-messages-list" ref={chatMessagesListRef}>
                {messages.length > 0 ? (
                    messages.map(msg => (
                        <ChatMessage
                            key={msg.id}
                            msg={msg}
                            levelTitle={getLevelTitleForDisplay(msg.userId, msg.userLevel)}
                            onLike={handleLikeMessage}
                            onReply={handleReplyMessage}
                            currentUserId={currentUser?.id || null}
                        />
                    ))
                ) : (
                    <div className="chat-login-prompt" style={{border: 'none', color: 'var(--clr-text-secondary)'}}>
                        Chưa có bình luận nào.
                    </div>
                )}
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
                        placeholder={replyingTo ? `Trả lời ${replyingTo.author}...` : (selectedImage ? "Thêm chú thích..." : "Viết bình luận của bạn...")}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="send-btn" disabled={!newMessage.trim() && !selectedImage}>
                       <FiSend />
                    </button>
                </form>
            ) : (
                <div className="chat-login-prompt">
                    Bạn phải đăng nhập để bình luận.
                </div>
            )}

            <ProfanityWarningPopup
                isOpen={isWarningPopupOpen}
                onClose={() => setIsWarningPopupOpen(false)}
            />
        </div>
    );
};

export default ChapterChat;