import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import ChatMessage, { type ChatMessageData } from './ChatMessage';
import { FiSend, FiImage, FiSmile, FiX, FiClock } from 'react-icons/fi';
import ProfanityWarningPopup from '../../popups/ProfanityWarningPopup';
import { isProfane } from '../../../utils/profanityList';
import StickerPicker from './StickerPicker';
import type { Sticker } from '../../../utils/stickerUtils';
import { getBanInfo, setBanInfo, calculateBanDurationMinutes, formatRemainingTime, type BanInfo } from '../../../utils/chatBanUtils';
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
    const [showStickerPicker, setShowStickerPicker] = useState(false);
    const chatMessagesListRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageInputRef = useRef<HTMLInputElement>(null);
    const stickerPickerRef = useRef<HTMLDivElement>(null);
    const [isWarningPopupOpen, setIsWarningPopupOpen] = useState(false);

    const [currentBanInfo, setCurrentBanInfo] = useState<BanInfo | null>(null);
    const [remainingBanTime, setRemainingBanTime] = useState<string | null>(null);

    const STORAGE_KEY = getStorageKey(comicId, chapterId);

    useEffect(() => {
        try {
            const storedMessages = localStorage.getItem(STORAGE_KEY);
            setMessages(storedMessages ? JSON.parse(storedMessages) : []);
        } catch (error) { console.error("Lỗi tải tin nhắn chương:", error); setMessages([]); }
    }, [STORAGE_KEY]);

    useEffect(() => {
        if (currentUser) {
            const banInfo = getBanInfo(currentUser.id);
            setCurrentBanInfo(banInfo);
            setRemainingBanTime(formatRemainingTime(banInfo.banExpiry));
        } else {
            setCurrentBanInfo(null);
            setRemainingBanTime(null);
        }

        const interval = setInterval(() => {
            if (currentUser && currentBanInfo?.banExpiry) {
                const remaining = formatRemainingTime(currentBanInfo.banExpiry);
                setRemainingBanTime(remaining);
                if (!remaining && currentBanInfo.banExpiry) {
                    setCurrentBanInfo(prev => prev ? {...prev, banExpiry: null} : null);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentUser, currentBanInfo?.banExpiry]);


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

     useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (stickerPickerRef.current && !stickerPickerRef.current.contains(event.target as Node)) {
                const stickerButton = document.querySelector('.sticker-picker-btn');
                if (!stickerButton || !stickerButton.contains(event.target as Node)) {
                    setShowStickerPicker(false);
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [stickerPickerRef]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                 alert("Kích thước ảnh quá lớn (tối đa 5MB).");
                 if (fileInputRef.current) fileInputRef.current.value = "";
                 return;
            }
            setSelectedImage(file);
             setShowStickerPicker(false);
            const reader = new FileReader();
            reader.onloadend = () => { setImagePreviewUrl(reader.result as string); }
            reader.readAsDataURL(file);
        }
    };

    const handleSendMessage = (sticker?: Sticker) => {
        if (!currentUser) {
            showNotification("Bạn cần đăng nhập để bình luận", "warning");
            return;
        }

        const currentBanStatus = getBanInfo(currentUser.id);
        setCurrentBanInfo(currentBanStatus);
        const now = Date.now();
        if (currentBanStatus.banExpiry && currentBanStatus.banExpiry > now) {
            const timeLeft = formatRemainingTime(currentBanStatus.banExpiry);
            showNotification(`Bạn đang bị cấm chat. Thời gian còn lại: ${timeLeft}`, 'error');
            setRemainingBanTime(timeLeft);
            return;
        }

        const messageContent = newMessage.trim();
        const hasContent = messageContent || selectedImage || sticker;

        if (!hasContent) return;

        const resetInputs = () => {
            setNewMessage('');
            setSelectedImage(null);
            setImagePreviewUrl(null);
            setReplyingTo(null);
            setShowStickerPicker(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        };

        if (messageContent && isProfane(messageContent)) {
            setIsWarningPopupOpen(true);

            const updatedViolations = currentBanStatus.violations + 1;
            const banDurationMinutes = calculateBanDurationMinutes(updatedViolations);
            let newBanExpiry: number | null = null;
            let banMessage = `Bạn đã sử dụng từ ngữ không phù hợp lần ${updatedViolations}.`;

            if (banDurationMinutes > 0) {
                newBanExpiry = Date.now() + banDurationMinutes * 60 * 1000;
                const durationHours = Math.floor(banDurationMinutes / 60);
                const durationMinutes = banDurationMinutes % 60;
                let durationString = '';
                if (durationHours > 0) durationString += `${durationHours} giờ `;
                if (durationMinutes > 0) durationString += `${durationMinutes} phút`;
                 banMessage += ` Bạn bị cấm chat trong ${durationString.trim()}.`;
                 setRemainingBanTime(formatRemainingTime(newBanExpiry));
            } else {
                 banMessage += ' Hãy cẩn thận hơn nhé!';
            }

            const newBanInfo: BanInfo = {
                ...currentBanStatus,
                violations: updatedViolations,
                banExpiry: newBanExpiry
            };

            setBanInfo(currentUser.id, newBanInfo);
            setCurrentBanInfo(newBanInfo);
            showNotification(banMessage, banDurationMinutes > 0 ? 'error' : 'warning');
            resetInputs(); 

            return;
        }

        const createMessageObject = (imgDataUrl?: string, stickerUrl?: string): ChatMessageData => ({
            id: Date.now(),
            userId: currentUser.id,
            userName: currentUser.fullName || currentUser.email.split('@')[0],
            avatarUrl: "https://i.imgur.com/tq9k3Yj.png",
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            message: sticker ? '' : messageContent,
            userLevel: currentUser.level,
            imageUrl: imgDataUrl,
            stickerUrl: stickerUrl,
            likes: [],
            replyTo: replyingTo?.id,
            replyToAuthor: replyingTo?.author,
        });

        let messageToSendSync: ChatMessageData | null = null;
        let requiresAsyncSave = false;

        if (sticker) {
             messageToSendSync = createMessageObject(undefined, sticker.url);
        } else if (selectedImage) {
            requiresAsyncSave = true;
            const reader = new FileReader();
            reader.onloadend = () => {
                const asyncMessageToSend = createMessageObject(reader.result as string);
                setMessages(prev => {
                    const newMessages = [...prev, asyncMessageToSend];
                    try {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
                    } catch (error) {
                        console.error("Error saving chapter chat messages (async):", error);
                    }
                    return newMessages;
                });
                resetInputs();
            }
             reader.onerror = () => {
                 console.error("Lỗi đọc file ảnh");
                 alert("Không thể đọc file ảnh đã chọn.");
                 resetInputs();
             }
            reader.readAsDataURL(selectedImage);
        } else if (messageContent) {
            messageToSendSync = createMessageObject();
        }

        if (messageToSendSync && !requiresAsyncSave) {
            const finalMessage = messageToSendSync;
            setMessages(prev => {
                const newMessages = [...prev, finalMessage];
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
                } catch (error) {
                    console.error("Error saving chapter chat messages (sync):", error);
                }
                return newMessages;
            });
            resetInputs();
        } else if (!requiresAsyncSave) {
             resetInputs();
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage();
    }

    const handleStickerSelect = (sticker: Sticker) => {
        handleSendMessage(sticker);
    }

    const handleImageButtonClick = () => {
         setShowStickerPicker(false);
        fileInputRef.current?.click();
    };

    const cancelImageSelection = () => {
        setSelectedImage(null);
        setImagePreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleLikeMessage = useCallback((messageId: number) => {
        if (!currentUser) return;
        setMessages(prevMessages => {
            const updatedMessages = prevMessages.map(msg => {
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
             try {
                 localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
             } catch (error) {
                 console.error("Error saving likes to storage:", error);
             }
            return updatedMessages;
        });
    }, [currentUser, STORAGE_KEY]);


    const handleReplyMessage = useCallback((messageId: number, authorName: string) => {
        if (!currentUser) return;
        setReplyingTo({ id: messageId, author: authorName });
        setShowStickerPicker(false);
    }, [currentUser]);

     const cancelReply = () => {
        setReplyingTo(null);
    };

     const toggleStickerPicker = () => {
        if (!showStickerPicker) {
            cancelImageSelection();
        }
        setShowStickerPicker(!showStickerPicker);
    }

    const getLevelTitleForDisplay = (userId: string, userLevel: number): string => {
        if (currentUser && userId === currentUser.id) {
            return getEquivalentLevelTitle(userLevel);
        }
        return `Cấp ${userLevel}`;
    };

    const isCurrentlyBanned = !!remainingBanTime;

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
                <>
                    {isCurrentlyBanned && (
                        <div className="chat-ban-indicator">
                            <FiClock /> Bạn đang bị cấm chat. Thời gian còn lại: {remainingBanTime}
                        </div>
                    )}
                    <form className="chat-input-form" onSubmit={handleFormSubmit}>
                        {showStickerPicker && (
                             <div ref={stickerPickerRef}>
                                <StickerPicker onStickerSelect={handleStickerSelect} onClose={() => setShowStickerPicker(false)} />
                             </div>
                         )}
                         <div className="input-previews">
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
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/png, image/jpeg, image/gif"
                            style={{ display: 'none' }}
                        />
                         <button
                            type="button"
                            className="image-upload-btn sticker-picker-btn"
                            onClick={toggleStickerPicker}
                            title="Chọn sticker"
                            disabled={!!selectedImage || isCurrentlyBanned}
                        >
                           <FiSmile />
                        </button>
                        <button
                            type="button"
                            className="image-upload-btn"
                            onClick={handleImageButtonClick}
                            title="Đính kèm ảnh"
                            disabled={!!selectedImage || isCurrentlyBanned}
                        >
                           <FiImage />
                        </button>

                        <input
                            ref={messageInputRef}
                            type="text"
                            placeholder={isCurrentlyBanned ? "Bạn đang bị cấm chat..." : (replyingTo ? `Trả lời ${replyingTo.author}...` : (selectedImage ? "Thêm chú thích..." : "Viết bình luận của bạn..."))}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={isCurrentlyBanned}
                            className={isCurrentlyBanned ? 'input-banned' : ''}
                        />
                        <button type="submit" className="send-btn" disabled={(!newMessage.trim() && !selectedImage && !showStickerPicker) || isCurrentlyBanned}>
                           <FiSend />
                        </button>
                    </form>
                 </>
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