import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { type ComicDetail, type ChapterSummary, type ChapterContent } from '../types/comicTypes';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiHome, FiLock } from 'react-icons/fi';
import ChapterChat from '../components/common/Chat/ChapterChat';
import '../styles/ReaderPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const TOKEN_STORAGE_KEY = 'storyverse_token';

const ReaderPage: React.FC = () => {
    const { comicId, chapterNumber: chapterNumParam } = useParams<{ comicId: string, chapterNumber: string }>();
    const navigate = useNavigate();
    const { currentUser, unlockChapter } = useAuth();
    const { showNotification } = useNotification();
    
    const [comic, setComic] = useState<ComicDetail | null>(null);
    const [allChapters, setAllChapters] = useState<ChapterSummary[]>([]);
    const [currentChapterData, setCurrentChapterData] = useState<ChapterSummary | null>(null);
    const [chapterImages, setChapterImages] = useState<string[]>([]);
    const [unlockedChapters, setUnlockedChapters] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (!comicId) {
            navigate('/404');
            return;
        }
        setIsLoading(true);
        
        fetch(`${API_URL}/comics/${comicId}`)
            .then(res => res.json())
            .then((data: ComicDetail) => {
                setComic(data);
                const chapters = data.chapters.map(ch => ({
                    ...ch,
                    chapterNumber: parseFloat(String(ch.chapterNumber)),
                    price: ch.price || 0
                }));
                setAllChapters(chapters);
            })
            .catch(err => {
                console.error("Lỗi tải thông tin truyện:", err);
                navigate('/404');
            });

    }, [comicId, navigate]);
    
    useEffect(() => {
        if (!comic) return;

        const fetchUnlockedData = async () => {
            const unlockedSet = new Set<number>();
            comic.chapters.forEach(chap => {
                if (chap.price === 0) {
                    unlockedSet.add(chap.id);
                }
            });

            if (currentUser) {
                try {
                    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
                    const response = await fetch(`${API_URL}/users/unlocked-chapters`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const unlockedData: { chapterId: number }[] = await response.json();
                        unlockedData.forEach(item => unlockedSet.add(item.chapterId));
                    }
                } catch (error) {
                    console.error("Lỗi fetch unlocked chapters:", error);
                }
            }
            setUnlockedChapters(unlockedSet);
        };

        fetchUnlockedData();
    }, [comic, currentUser]);


    useEffect(() => {
        if (allChapters.length === 0 || !chapterNumParam || unlockedChapters.size === 0) return;

        const currentChapterNum = Number(chapterNumParam);
        const foundChapter = allChapters.find(c => c.chapterNumber === currentChapterNum);
        
        if (!foundChapter) {
            const firstChapter = allChapters.sort((a, b) => Number(a.chapterNumber) - Number(b.chapterNumber))[0];
            if (firstChapter) {
                navigate(`/read/${comicId}/${firstChapter.chapterNumber}`, { replace: true });
            }
            return;
        }
        
        setCurrentChapterData(foundChapter);
        
        const isUnlocked = foundChapter.price === 0 || unlockedChapters.has(foundChapter.id);

        if (isUnlocked) {
            setIsLoading(true);
            setChapterImages([]); 
            
            const token = localStorage.getItem(TOKEN_STORAGE_KEY); 
            
            fetch(`${API_URL}/comics/${comicId}/chapters/${foundChapter.id}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => {
                    if (!res.ok) {
                         console.error("Fetch chapter content failed with status:", res.status);
                         throw new Error(`Không thể tải nội dung chương (Lỗi: ${res.status}). Có thể bạn cần đăng nhập lại.`);
                    }
                    return res.json();
                })
                .then((data: ChapterContent) => {
                    if (!Array.isArray(data.contentUrls)) {
                         console.error("Dữ liệu trả về không phải là mảng:", data.contentUrls);
                         throw new Error("Lỗi định dạng dữ liệu từ server.");
                    }
                    setChapterImages(data.contentUrls);
                })
                .catch(err => {
                    console.error("Lỗi tải ảnh chương (fetch/catch):", err);
                    showNotification(err.message, 'error');
                    setChapterImages([]); 
                })
                .finally(() => {
                    setIsLoading(false);
                    window.scrollTo(0, 0); 
                });
        } else {
            setChapterImages([]);
            setIsLoading(false);
            window.scrollTo(0, 0);
        }

    }, [chapterNumParam, allChapters, comicId, unlockedChapters, navigate, showNotification]);

    const isUnlocked = useMemo(() => {
        if (!currentChapterData) return false;
        if (currentChapterData.price === 0) return true;
        return unlockedChapters.has(currentChapterData.id);
    }, [currentChapterData, unlockedChapters]);

    const currentChapterIndex = useMemo(() => {
        if (!currentChapterData) return -1;
        const sortedChapters = [...allChapters].sort((a,b) => Number(a.chapterNumber) - Number(b.chapterNumber));
        return sortedChapters.findIndex(c => c.id === currentChapterData.id);
    }, [allChapters, currentChapterData]);

    const sortedChapters = useMemo(() => {
        return [...allChapters].sort((a,b) => Number(a.chapterNumber) - Number(b.chapterNumber));
    }, [allChapters]);

    const prevChapter = useMemo(() => (currentChapterIndex > 0) ? sortedChapters[currentChapterIndex - 1] : null, [sortedChapters, currentChapterIndex]);
    const nextChapter = useMemo(() => (currentChapterIndex < sortedChapters.length - 1) ? sortedChapters[currentChapterIndex + 1] : null, [sortedChapters, currentChapterIndex]);

    const isNextChapterUnlocked = useMemo(() => {
        if (!nextChapter) return false;
        if (nextChapter.price === 0) return true;
        return unlockedChapters.has(nextChapter.id);
    }, [nextChapter, unlockedChapters]);

    const goToChapter = useCallback((chapterNum: number) => {
        navigate(`/read/${comicId}/${chapterNum}`);
    }, [comicId, navigate]);

    const handleChapterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedChapterId = Number(e.target.value);
        const selectedChapter = allChapters.find(c => c.id === selectedChapterId);
        if (selectedChapter) {
            goToChapter(Number(selectedChapter.chapterNumber));
        }
    };

    const handleUnlockChapter = async (chapterToUnlock: ChapterSummary) => {
        if (!currentUser || !chapterToUnlock || !comic) {
            showNotification('Vui lòng đăng nhập để mở khóa chương.', 'warning');
            return false;
        }
        if (currentUser.coinBalance < chapterToUnlock.price) {
            showNotification('Số dư Xu không đủ. Vui lòng nạp thêm Xu.', 'error');
            navigate('/recharge');
            return false;
        }
        
        try {
            const result = await unlockChapter(chapterToUnlock.id);
            if (result) {
                setUnlockedChapters(prev => new Set(prev).add(chapterToUnlock.id));
                showNotification(`Đã mở khóa Chương ${chapterToUnlock.chapterNumber} với ${chapterToUnlock.price} Xu!`, 'success');
                return true;
            }
            return false;
        } catch (e: any) {
            showNotification(e.message || 'Lỗi khi mở khóa chương.', 'error');
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
                goToChapter(Number(nextChapter.chapterNumber));
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
        <>
            <div className="reader-header-bar">
                <div className="chapter-selector-group">
                    <Link to={`/comic/${comicId}`} className="nav-button home-btn" title="Quay lại chi tiết truyện">
                        <FiHome />
                    </Link>
                    <button
                        className="nav-button prev-chap-button"
                        onClick={() => goToChapter(Number(prevChapter!.chapterNumber))}
                        disabled={!prevChapter || !(prevChapter.price === 0 || unlockedChapters.has(prevChapter.id))}
                    >
                        <FiChevronLeft />
                    </button>
                    <div className="select-wrapper">
                        <select
                            value={currentChapterData.id}
                            onChange={handleChapterSelect}
                            className="chapter-select-dropdown"
                        >
                            {sortedChapters.map(chap => (
                                <option 
                                    key={chap.id} 
                                    value={chap.id} 
                                    disabled={!(chap.price === 0 || unlockedChapters.has(chap.id))}
                                >
                                    {(chap.price === 0 || unlockedChapters.has(chap.id)) ? '' : '🔒 '}
                                    Chương {chap.chapterNumber}
                                </option>
                            ))}
                        </select>
                        <FiChevronDown className="select-arrow" />
                    </div>
                    <button
                        className="nav-button next-chap-button"
                        onClick={() => goToChapter(Number(nextChapter!.chapterNumber))}
                        disabled={!nextChapter || !isNextChapterUnlocked}
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>

            <div className="reader-content">
                {isUnlocked ? (
                    <div className="chapter-images-container">
                        {isLoading ? <p style={{color: 'white', padding: '2rem'}}>Đang tải ảnh...</p> : 
                            chapterImages.map((src, index) => (
                                <img 
                                    key={index} 
                                    src={src} 
                                    alt={`Trang ${index + 1}`} 
                                    className="chapter-image" 
                                />
                            ))
                        }
                        {!isLoading && chapterImages.length === 0 && (
                            <p style={{color: 'white', padding: '2rem'}}>
                                Không tải được nội dung chương. (Bạn có thể F12 xem Console Log).
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="chapter-locked-overlay">
                        <FiLock className="lock-icon" />
                        <h2 className="locked-title">Chương {currentChapterData.chapterNumber} Bị Khóa</h2>
                        <p className="locked-message">
                            Bạn cần mở khóa chương này để tiếp tục đọc.
                        </p>
                        <button className="unlock-button" onClick={handleUnlockCurrentChapter}>
                            Mở khóa với {currentChapterData.price} Xu?
                        </button>
                    </div>
                )}
            </div>
            
            <div className="reader-footer-bar">
                <button
                    className="nav-button"
                    onClick={() => goToChapter(Number(prevChapter!.chapterNumber))}
                    disabled={!prevChapter || !(prevChapter.price === 0 || unlockedChapters.has(prevChapter.id))}
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
                        onClick={() => goToChapter(Number(nextChapter.chapterNumber))}
                    >
                        Chương kế tiếp <FiChevronRight />
                    </button>
                ) : (
                    <button 
                        className="nav-button unlock-next-btn" 
                        onClick={handleUnlockAndNavigate}
                    >
                        <FiLock style={{ marginRight: '0.25rem' }} />
                        Mở khóa Chương {nextChapter.chapterNumber} ({nextChapter.price} Xu)
                    </button>
                )}
            </div>

            {isUnlocked && (
                <div className="chapter-chat-wrapper">
                    <ChapterChat 
                        comicId={Number(comic.id)} 
                        chapterId={currentChapterData.id} 
                    />
                </div>
            )}
        </>
    );
};

export default ReaderPage;