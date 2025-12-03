import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../../../assets/styles/ChatLog.css';
import ChatMessage, { type ChatMessageData } from './ChatMessage';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { FiSend, FiImage, FiSmile, FiX, FiClock } from 'react-icons/fi';
import ProfanityWarningPopup from '../../popups/ProfanityWarningPopup';
import { isProfane } from '../../../utils/profanityList';
import StickerPicker from './StickerPicker';
import type { Sticker } from '../../../utils/stickerUtils';
import { getBanInfo, setBanInfo, calculateBanDurationMinutes, formatRemainingTime, type BanInfo } from '../../../utils/chatBanUtils';
import UserDetailModal from '../UserDetailModal'; // Modal xem thông tin người dùng
import { io, Socket } from 'socket.io-client'; // Import Socket.io

// Cấu hình URL cho API và Socket
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
// Lấy root URL cho socket (bỏ /api)
const SOCKET_URL = API_URL.replace('/api', '') || 'http://localhost:3000';

const TOKEN_STORAGE_KEY = 'storyverse_token';
const MAX_GLOBAL_MESSAGES = 50; // Tăng giới hạn tin nhắn lưu trữ

interface TopMember {
  id: string;
  [key: string]: any; 
}

const ChatLog: React.FC = () => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();
    
    // States quản lý tin nhắn và giao diện
    const [messages, setMessages] = useState<ChatMessageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<{ id: number; author: string } | null>(null);
    const [showStickerPicker, setShowStickerPicker] = useState(false);
    const [isWarningPopupOpen, setIsWarningPopupOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // States quản lý cấm chat
    const [currentBanInfo, setCurrentBanInfo] = useState<BanInfo | null>(null);
    const [remainingBanTime, setRemainingBanTime] = useState<string | null>(null);
    
    // States quản lý Top thành viên và Modal Profile
    const [topMembers, setTopMembers] = useState<TopMember[]>([]);
    const [selectedUserProfileId, setSelectedUserProfileId] = useState<string | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    // Refs
    const chatMessagesListRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageInputRef = useRef<HTMLInputElement>(null);
    const stickerPickerRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null); // Ref giữ kết nối Socket

    const systemKey = localStorage.getItem('user_level_system') || 'Ma Vương';
    const renderKey = currentUser ? `${currentUser.id}-${currentUser.level}-${systemKey}` : 'default';

    // 1. Kết nối Socket.io
    useEffect(() => {
        // Khởi tạo socket
        socketRef.current = io(SOCKET_URL);

        // Join phòng Global
        socketRef.current.emit('join_room', 'global');

        // Lắng nghe tin nhắn mới
        socketRef.current.on('receive_message', (newMsg: ChatMessageData) => {
            setMessages((prevMessages) => {
                // Tránh trùng lặp tin nhắn
                if (prevMessages.some(m => m.id === newMsg.id)) return prevMessages;
                
                const updatedMessages = [...prevMessages, newMsg];
                return updatedMessages.slice(-MAX_GLOBAL_MESSAGES);
            });
            
            // Auto scroll xuống dưới
            if (chatMessagesListRef.current) {
                setTimeout(() => {
                    chatMessagesListRef.current!.scrollTop = chatMessagesListRef.current!.scrollHeight;
                }, 100);
            }
        });

        // Lắng nghe sự kiện Like realtime
        socketRef.current.on('update_like', (data: { messageId: number; userId: string; isLiked: boolean }) => {
            setMessages(prevMessages => 
                prevMessages.map(msg => {
                    if (msg.id === data.messageId) {
                        const currentLikes = msg.likes || [];
                        let newLikes = [...currentLikes];
                        
                        if (data.isLiked) {
                            if (!newLikes.includes(data.userId)) newLikes.push(data.userId);
                        } else {
                            newLikes = newLikes.filter(id => id !== data.userId);
                        }
                        return { ...msg, likes: newLikes };
                    }
                    return msg;
                })
            );
        });

        // Cleanup khi unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave_room', 'global');
                socketRef.current.disconnect();
            }
        };
    }, []);

    // 2. Lấy danh sách Top Member (để hiển thị icon rank)
    useEffect(() => {
        const fetchTopMembers = async () => {
            try {
                const response = await fetch(`${API_URL}/users/top?limit=3`);
                if (response.ok) {
                    const data = await response.json();
                    setTopMembers(data);
                }
            } catch (error) {
                console.error('Error fetching top members:', error);
            }
        };
        fetchTopMembers();
    }, []);

    // 3. Lấy tin nhắn ban đầu
    const fetchMessages = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/chat/global`);
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data: ChatMessageData[] = await response.json();
            setMessages(data);
        } catch (error: any) {
            console.error("Error loading global chat messages:", error);
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);
    
    // 4. Quản lý trạng thái Ban (Cấm chat)
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

    // Auto scroll khi tin nhắn thay đổi
    useEffect(() => {
        if (chatMessagesListRef.current) {
            chatMessagesListRef.current.scrollTop = chatMessagesListRef.current.scrollHeight;
        }
    }, [messages, renderKey]);

    // Focus input khi reply
    useEffect(() => {
        if (replyingTo && messageInputRef.current) {
            messageInputRef.current.focus();
        }
    }, [replyingTo]);

    // Click outside để đóng sticker picker
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

    // Xử lý chọn ảnh
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

    // Gọi API gửi tin nhắn
    const postMessageToApi = async (payload: { message?: string; imageUrl?: string; stickerUrl?: string; replyToMessageId?: number }) => {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        try {
            const response = await fetch(`${API_URL}/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: payload.message || null,
                    imageUrl: payload.imageUrl || null,
                    stickerUrl: payload.stickerUrl || null,
                    replyToMessageId: payload.replyToMessageId || null,
                    comicId: null,
                    chapterId: null
                })
            });
            const newMsgData = await response.json();
            if (!response.ok) throw new Error(newMsgData.error || 'Failed to send message');
            
            // Lưu ý: Không cần setMessages thủ công ở đây nữa vì Socket sẽ trả về tin nhắn
            // Tuy nhiên, nếu muốn hiển thị ngay lập tức (optimistic) có thể giữ lại logic check ID
            setMessages(prev => {
                 if (prev.some(m => m.id === newMsgData.id)) return prev;
                 return [...prev, newMsgData].slice(-MAX_GLOBAL_MESSAGES)
            });

        } catch (error: any) {
            console.error("Error posting message:", error);
            showNotification(error.message, 'error');
        }
    };

    // Xử lý logic gửi tin nhắn (bao gồm check ban, profanity)
    const handleSendMessage = async (sticker?: Sticker) => {
        if (!currentUser) {
             showNotification("Bạn cần đăng nhập để nói chuyện", "warning");
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

        if (!hasContent || isSending) return;
        
        setIsSending(true);

        const resetInputs = () => {
            setNewMessage('');
            setSelectedImage(null);
            setImagePreviewUrl(null);
            setReplyingTo(null);
            setShowStickerPicker(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        };

        // Kiểm tra từ ngữ không phù hợp
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
            setIsSending(false);
            return;
        }

        try {
            let imageUrl: string | undefined = undefined;
            // Upload ảnh trước nếu có
            if (selectedImage) {
                const token = localStorage.getItem(TOKEN_STORAGE_KEY);
                const formData = new FormData();
                formData.append('image', selectedImage);

                const uploadRes = await fetch(`${API_URL}/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                 });
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) throw new Error(uploadData.error || 'Image upload failed');
                imageUrl = uploadData.imageUrl;
            }

            await postMessageToApi({
                message: messageContent,
                imageUrl,
                stickerUrl: sticker?.url,
                replyToMessageId: replyingTo?.id
            });
            
            resetInputs();
        } catch (error: any) {
            console.error("Error sending message:", error);
            showNotification(error.message, 'error');
        } finally {
            setIsSending(false);
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

    // Xử lý Like tin nhắn
    const handleLikeMessage = useCallback(async (messageId: number) => {
        if (!currentUser) return;

        // Optimistic update (cập nhật giao diện ngay lập tức)
        // Socket sẽ đồng bộ lại sau để đảm bảo nhất quán
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

        try {
            const token = localStorage.getItem(TOKEN_STORAGE_KEY);
            const response = await fetch(`${API_URL}/chat/like/${messageId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Like request failed');
        } catch (error) {
            console.error("Error liking message:", error);
            showNotification('Lỗi khi thích tin nhắn.', 'error');
            // Revert nếu lỗi (có thể bỏ qua nếu tin tưởng socket update lại)
        }
    }, [currentUser, showNotification]);

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

    const getRank = (userId: string) => {
        const index = topMembers.findIndex(member => member.id === userId);
        return index !== -1 ? index + 1 : undefined;
    };

    // Hàm mở modal khi click vào user
    const handleUserClick = useCallback((userId: string) => {
        setSelectedUserProfileId(userId);
        setIsUserModalOpen(true);
    }, []);

    const isCurrentlyBanned = !!remainingBanTime;

    return (
        <div key={renderKey} className="chat-room-container">
            <div className="chat-room-header">
                Vạn hữu đàm đạo
            </div>

            <div className="chat-messages-list" ref={chatMessagesListRef}>
                {isLoading && <p style={{textAlign: 'center', color: 'var(--clr-text-secondary)'}}>Đang tải tin nhắn...</p>}
                {!isLoading && messages.length === 0 && <p style={{textAlign: 'center', color: 'var(--clr-text-secondary)'}}>Chưa có tin nhắn nào.</p>}
                {messages.map((msg: ChatMessageData) => {
                    const rank = getRank(msg.userId);
                    return (
                    <ChatMessage
                        key={msg.id}
                        msg={msg}
                        onLike={handleLikeMessage}
                        onReply={handleReplyMessage}
                        onUserClick={handleUserClick} // Truyền prop xử lý click user
                        currentUserId={currentUser?.id || null}
                        rank={rank}
                    />
                )})}
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
                            disabled={!!selectedImage || isCurrentlyBanned || isSending}
                        >
                            <FiSmile />
                        </button>
                        <button
                            type="button"
                            className="image-upload-btn"
                            onClick={handleImageButtonClick}
                            title="Đính kèm ảnh"
                            disabled={!!selectedImage || isCurrentlyBanned || isSending}
                        >
                           <FiImage />
                        </button>

                        <input
                            ref={messageInputRef}
                            type="text"
                            placeholder={isCurrentlyBanned ? "Bạn đang bị cấm chat..." : (replyingTo ? `Trả lời ${replyingTo.author}...` : (selectedImage ? "Thêm chú thích..." : "Nhập tin nhắn..."))}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={isCurrentlyBanned || isSending}
                            className={isCurrentlyBanned ? 'input-banned' : ''}
                        />
                        <button type="submit" className="send-btn" disabled={(!newMessage.trim() && !selectedImage && !showStickerPicker) || isCurrentlyBanned || isSending}>
                           {isSending ? <FiClock className="animate-spin" /> : <FiSend />}
                        </button>
                    </form>
                 </>
            ) : (
                <div className="chat-login-prompt">
                    Bạn phải đăng nhập để nói chuyện.
                </div>
            )}

            {/* Modal Xem thông tin người dùng */}
            <UserDetailModal 
                userId={selectedUserProfileId}
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
            />

            <ProfanityWarningPopup
                isOpen={isWarningPopupOpen}
                onClose={() => setIsWarningPopupOpen(false)}
            />
        </div>
    );
};

export default ChatLog;