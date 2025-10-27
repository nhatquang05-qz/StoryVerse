import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { comics, getChaptersByComicId, type Comic, type Chapter, saveNewOrder, loadOrders } from '../data/mockData';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiHome, FiLock } from 'react-icons/fi';
import ChapterChat from '../components/common/Chat/ChapterChat';
import './ReaderPage.css';

const isChapterUnlockedGlobally = (comicId: number, chapterId: number, userId: string | undefined): boolean => {
    if (!userId) return false;
    const userOrders = loadOrders(userId);
    return userOrders
        .filter((order: any) => order.status === 'Hoàn thành')
        .flatMap((order: any) => order.items)
        .some((item: any) => item.id === comicId && item.quantity === chapterId); 
};

const getChapterImages = (chapterData: Chapter | null, comicTitle: string): string[] => {
    if (chapterData && chapterData.images && chapterData.images.length > 0) {
        return chapterData.images;
    }
    const chapterNumber = chapterData?.chapterNumber || 1;
    return Array.from({ length: 3 }, (_, i) => 
        `https://via.placeholder.com/800x1200?text=${encodeURIComponent(comicTitle)}+Chap+${chapterNumber}+Page+${i + 1}+(No+Data)`
    );
};

const ReaderPage: React.FC = () => {
    const { comicId, chapterNumber: chapterNumParam } = useParams<{ comicId: string, chapterNumber: string }>();
    const navigate = useNavigate();
    const { currentUser, updateProfile, addExp } = useAuth();
    const { showNotification } = useNotification();
    
    const comic = useMemo(() => comics.find(c => c.id === Number(comicId)), [comicId]);
    const allChapters = useMemo(() => comic ? getChaptersByComicId(comic.id) : [], [comic]);
    
    const [currentChapterData, setCurrentChapterData] = useState<Chapter | null>(null);
    const [chapterImages, setChapterImages] = useState<string[]>([]);
    const [unlockedChapters, setUnlockedChapters] = useState<Set<number>>(new Set());
    
    useEffect(() => {
        if (!comic) {
            navigate('/404');
            return;
        }
        if (allChapters.length === 0) {
             navigate(`/comic/${comic.id}`);
             return;
        }
        const currentChapterNum = Number(chapterNumParam);
        const foundChapter = allChapters.find(c => c.chapterNumber === currentChapterNum);
        if (!foundChapter) {
            navigate(`/read/${comic.id}/${allChapters[0].chapterNumber}`, { replace: true });
            return;
        }
        setCurrentChapterData(foundChapter);
        if (currentUser) {
            const unlockedSet = new Set<number>();
            allChapters.forEach(chap => {
                if (chap.isFree || isChapterUnlockedGlobally(comic.id, chap.id, currentUser.id)) {
                    unlockedSet.add(chap.id);
                }
            });
            setUnlockedChapters(unlockedSet);
        }
        setChapterImages(getChapterImages(foundChapter, comic.title));
        
        // Cuộn lên đầu khi chuyển chương
        window.scrollTo(0, 0);

    }, [comicId, chapterNumParam, comic, allChapters, currentUser, navigate]);

    const isUnlocked = useMemo(() => {
        if (!currentChapterData) return false;
        if (currentChapterData.isFree) return true;
        return unlockedChapters.has(currentChapterData.id);
    }, [currentChapterData, unlockedChapters]);

    const currentChapterIndex = useMemo(() => {
        if (!currentChapterData) return -1;
        return allChapters.findIndex(c => c.id === currentChapterData.id);
    }, [allChapters, currentChapterData]);

    const prevChapter = useMemo(() => (currentChapterIndex > 0) ? allChapters[currentChapterIndex - 1] : null, [allChapters, currentChapterIndex]);
    const nextChapter = useMemo(() => (currentChapterIndex < allChapters.length - 1) ? allChapters[currentChapterIndex + 1] : null, [allChapters, currentChapterIndex]);

    const isNextChapterUnlocked = useMemo(() => {
        if (!nextChapter) return false;
        if (nextChapter.isFree) return true;
        return unlockedChapters.has(nextChapter.id);
    }, [nextChapter, unlockedChapters]);

    const goToChapter = useCallback((chapterNum: number) => {
        navigate(`/read/${comicId}/${chapterNum}`);
    }, [comicId, navigate]);

    const handleChapterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedChapterId = Number(e.target.value);
        const selectedChapter = allChapters.find(c => c.id === selectedChapterId);
        if (selectedChapter) {
            goToChapter(selectedChapter.chapterNumber);
        }
    };

    const handleUnlockChapter = async (chapterToUnlock: Chapter) => {
        if (!currentUser || !chapterToUnlock) {
            showNotification('Vui lòng đăng nhập để mở khóa chương.', 'warning');
            return false;
        }
        if (currentUser.coinBalance < chapterToUnlock.unlockCoinPrice) {
            showNotification('Số dư Xu không đủ. Vui lòng nạp thêm Xu.', 'error');
            navigate('/recharge');
            return false;
        }
        const newBalance = currentUser.coinBalance - chapterToUnlock.unlockCoinPrice;
        const newOrder = {
            id: `COIN-${Date.now()}-${chapterToUnlock.id}`,
            userId: currentUser.id,
            date: new Date().toLocaleDateString('vi-VN'),
            total: chapterToUnlock.unlockCoinPrice, 
            status: 'Hoàn thành' as const, 
            items: [{ 
                id: comic!.id,
                title: comic!.title,
                author: comic!.author,
                price: chapterToUnlock.unlockCoinPrice, 
                imageUrl: comic!.imageUrl,
                quantity: chapterToUnlock.id, 
            }],
        };
        try {
            await updateProfile({ coinBalance: newBalance });
            saveNewOrder(newOrder);
            await addExp(chapterToUnlock.unlockCoinPrice, 'recharge'); 
            setUnlockedChapters(prev => new Set(prev).add(chapterToUnlock.id));
            showNotification(`Đã mở khóa Chương ${chapterToUnlock.chapterNumber} với ${chapterToUnlock.unlockCoinPrice} Xu!`, 'success');
            return true;
        } catch (e) {
            showNotification('Lỗi khi mở khóa chương.', 'error');
            return false;
        }
    };
    
    const handleUnlockCurrentChapter = () => {
        if (currentChapterData) {
            handleUnlockChapter(currentChapterData);
        }
    };
    
    const handleUnlockAndNavigate = async () => {
        if (nextChapter) {
            const success = await handleUnlockChapter(nextChapter);
            if (success) {
                goToChapter(nextChapter.chapterNumber);
            }
        }
    };

    if (!comic) {
        return <div className="reader-loading">Đang tải truyện...</div>;
    }
    
    if (!currentChapterData) {
         return <div className="reader-loading">Đang tải chương...</div>;
    }

    return (
        // Không còn container riêng, component này render trực tiếp vào main-content.reader-mode
        <>
            <div className="reader-header-bar">
                <div className="chapter-selector-group">
                    <Link to={`/comic/${comicId}`} className="nav-button home-btn" title="Quay lại chi tiết truyện">
                        <FiHome />
                    </Link>
                    <button
                        className="nav-button prev-chap-button"
                        onClick={() => goToChapter(prevChapter!.chapterNumber)}
                        disabled={!prevChapter || !(prevChapter.isFree || unlockedChapters.has(prevChapter.id))}
                    >
                        <FiChevronLeft />
                    </button>
                    <div className="select-wrapper">
                        <select
                            value={currentChapterData.id}
                            onChange={handleChapterSelect}
                            className="chapter-select-dropdown"
                        >
                            {allChapters.map(chap => (
                                <option 
                                    key={chap.id} 
                                    value={chap.id} 
                                    disabled={!(chap.isFree || unlockedChapters.has(chap.id))}
                                >
                                    {(chap.isFree || unlockedChapters.has(chap.id)) ? '' : '🔒 '}
                                    Chương {chap.chapterNumber}
                                </option>
                            ))}
                        </select>
                        <FiChevronDown className="select-arrow" />
                    </div>
                    <button
                        className="nav-button next-chap-button"
                        onClick={() => goToChapter(nextChapter!.chapterNumber)}
                        disabled={!nextChapter || !isNextChapterUnlocked}
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>

            <div className="reader-content">
                {isUnlocked ? (
                    <div className="chapter-images-container">
                        {chapterImages.map((src, index) => (
                            <img 
                                key={index} 
                                src={src} 
                                alt={`Trang ${index + 1}`} 
                                className="chapter-image" 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="chapter-locked-overlay">
                        <FiLock className="lock-icon" />
                        <h2 className="locked-title">Chương {currentChapterData.chapterNumber} Bị Khóa</h2>
                        <p className="locked-message">
                            Bạn cần mở khóa chương này để tiếp tục đọc.
                        </p>
                        <button className="unlock-button" onClick={handleUnlockCurrentChapter}>
                            Mở khóa với {currentChapterData.unlockCoinPrice} Xu?
                        </button>
                    </div>
                )}
            </div>
            
            {/* Thanh footer của reader */}
            <div className="reader-footer-bar">
                <button
                    className="nav-button"
                    onClick={() => goToChapter(prevChapter!.chapterNumber)}
                    disabled={!prevChapter || !(prevChapter.isFree || unlockedChapters.has(prevChapter.id))}
                >
                    <FiChevronLeft /> Chương trước
                </button>
                {!nextChapter ? (
                    <button className="nav-button" disabled>
                        Hết truyện
                    </button>
                ) : isNextChapterUnlocked ? (
                    <button
                        className="nav-button"
                        onClick={() => goToChapter(nextChapter.chapterNumber)}
                    >
                        Chương kế tiếp <FiChevronRight />
                    </button>
                ) : (
                    <button 
                        className="nav-button unlock-next-btn" 
                        onClick={handleUnlockAndNavigate}
                    >
                        <FiLock style={{ marginRight: '0.25rem' }} />
                        Mở khóa Chương {nextChapter.chapterNumber} ({nextChapter.unlockCoinPrice} Xu)
                    </button>
                )}
            </div>

            {/* Khung chat nằm ngoài vùng cuộn và trên Footer chính */}
            {isUnlocked && (
                <div className="chapter-chat-wrapper">
                    <ChapterChat 
                        comicId={comic.id} 
                        chapterId={currentChapterData.id} 
                    />
                </div>
            )}
        </>
    );
};

export default ReaderPage;