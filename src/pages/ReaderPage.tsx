import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiLock } from 'react-icons/fi';
import { comics, getChaptersByComicId, saveNewOrder } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext'; 
import { useNotification } from '../contexts/NotificationContext';
import './ReaderPage.css';

const mockChapterContent = (chapterNumber: number, comicTitle: string) => [
    `Đây là trang 1 của chương ${chapterNumber} (${comicTitle}). Nội dung chính bắt đầu từ đây.`,
    `Trang 2: Nội dung của chương ${chapterNumber} đang diễn ra rất hấp dẫn.`,
    `Trang 3: Kích thước truyện digital đã được điều chỉnh cho phù hợp.`,
    `Trang 4: Để có trải nghiệm tốt nhất, nên đọc trên màn hình lớn.`,
    `Trang 5: Hết chương ${chapterNumber}. Cảm ơn bạn đã đọc truyện trên StoryVerse!`,
];

const isChapterUnlockedGlobally = (comicId: number, chapterId: number, userId: string | undefined): boolean => {
    
    if (!userId) return false;
    const userOrders = JSON.parse(localStorage.getItem('storyverse_orders') || '[]');
    const validStatuses = ['Hoàn thành', 'Đang giao hàng'];
    return userOrders
        .filter((order: any) => validStatuses.includes(order.status))
        .flatMap((order: any) => order.items)
        .some((item: any) => item.id === comicId && item.quantity === chapterId);
};

const ReaderPage: React.FC = () => {
    const { comicId, chapterNumber: chapterNumParam } = useParams<{ comicId: string, chapterNumber: string }>();
    const { currentUser, updateProfile, addExp } = useAuth(); 
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const comic = comics.find(c => c.id === Number(comicId));
    const currentChapterNumber = Number(chapterNumParam);

    const [pageIndex, setPageIndex] = useState(0);

    useEffect(() => {
        setPageIndex(0);
    }, [comicId, chapterNumParam]);

    const chapters = useMemo(() => comic ? getChaptersByComicId(comic.id) : [], [comic]);
    const currentChapterData = chapters.find(c => c.chapterNumber === currentChapterNumber);
    const prevChapterData = chapters.find(c => c.chapterNumber === currentChapterNumber - 1);
    const nextChapterData = chapters.find(c => c.chapterNumber === currentChapterNumber + 1);

    const content = comic ? mockChapterContent(currentChapterNumber, comic.title) : [];
    const totalPages = content.length;
    const isFirstPage = pageIndex === 0;
    const isLastPage = pageIndex === totalPages - 1;
   
    const handlePageNavigation = useCallback((newPage: number) => {
        if (currentUser && newPage !== pageIndex) { 
            addExp(1, 'reading'); 
        }
        setPageIndex(newPage);
    }, [currentUser, pageIndex, addExp]);

    const nextPage = () => handlePageNavigation(Math.min(totalPages - 1, pageIndex + 1));
    const prevPage = () => handlePageNavigation(Math.max(0, pageIndex - 1));
    
    useEffect(() => {
        if (!currentUser) {
            
            
        }
    }, [currentUser, navigate]);

    if (!comic || !currentChapterData) {
        return <div className="reader-page-not-found">Không tìm thấy truyện hoặc chương này.</div>;
    }

    
    const isChapterAccessible = currentChapterData.isFree || isChapterUnlockedGlobally(comic.id, currentChapterData.id, currentUser?.id);

     if (!currentUser) {
        return (
            <div className="reader-page-not-logged">
                <h2>Vui lòng đăng nhập để đọc truyện.</h2>
                <Link to="/login" className="detail-order-btn" style={{marginTop: '1rem'}}>Đăng nhập ngay</Link>
            </div>
        );
    }

    if (!isChapterAccessible) {
         return (
            <div className="reader-page-not-logged">
                <h2>Chương này cần được mở khóa.</h2>
                <Link to={`/comic/${comic.id}`} className="detail-order-btn" style={{marginTop: '1rem'}}>Quay lại chi tiết truyện</Link>
            </div>
        );
    }

    const isNextChapterUnlocked = nextChapterData ? nextChapterData.isFree || isChapterUnlockedGlobally(comic.id, nextChapterData.id, currentUser?.id) : false;

    const handleUnlockAndNavigate = async () => {
        
        if (!currentUser || !nextChapterData) return;
        if (currentUser.coinBalance < nextChapterData.unlockCoinPrice) {
            showNotification('Số dư Xu không đủ. Vui lòng nạp thêm Xu.', 'error');
            navigate('/recharge');
            return;
        }
        const newBalance = currentUser.coinBalance - nextChapterData.unlockCoinPrice;
        const newOrder = {
            id: `COIN-${Date.now()}-${nextChapterData.id}`,
            userId: currentUser.id,
            date: new Date().toLocaleDateString('vi-VN'),
            total: nextChapterData.unlockCoinPrice,
            status: 'Hoàn thành' as const,
            items: [{
                id: comic!.id,
                title: comic!.title,
                author: comic!.author,
                price: nextChapterData.unlockCoinPrice,
                imageUrl: comic!.imageUrl,
                quantity: nextChapterData.id,
            }],
        };
        try {
            await updateProfile({ coinBalance: newBalance });
            saveNewOrder(newOrder);
            showNotification(`Đã mở khóa Chương ${nextChapterData.chapterNumber} với ${nextChapterData.unlockCoinPrice} Xu!`, 'success');
            navigate(`/read/${comicId}/${nextChapterData.chapterNumber}`);
        } catch (e) {
            showNotification('Lỗi khi mở khóa chương.', 'error');
        }
    };

    const renderNextButton = () => {
        if (!isLastPage) {
            return (
                <button onClick={nextPage} className="page-nav-btn">
                    Trang Sau <FiChevronRight />
                </button>
            );
        }

        if (nextChapterData) {
            if (isNextChapterUnlocked) {
                return (
                    <Link to={`/read/${comic.id}/${nextChapterData.chapterNumber}`} className="page-nav-btn next-chapter-btn">
                        Chương Kế Tiếp ({nextChapterData.chapterNumber}) <FiChevronRight />
                    </Link>
                );
            } else {
                return (
                    <button onClick={handleUnlockAndNavigate} className="page-nav-btn unlock-next-btn">
                        <span>Mở khóa Chương {nextChapterData.chapterNumber}</span>
                        <span className="unlock-price">với {nextChapterData.unlockCoinPrice} Xu?</span>
                    </button>
                );
            }
        }

        return (
            <button className="page-nav-btn" disabled>
                Hết Truyện
            </button>
        );
    };

    const renderPrevButton = () => {
        if (isFirstPage) {
            if (prevChapterData) {
                return (
                    <Link to={`/read/${comic.id}/${prevChapterData.chapterNumber}`} className="page-nav-btn prev-chapter-btn">
                        <FiChevronLeft /> Chương Trước ({prevChapterData.chapterNumber})
                    </Link>
                );
            }
            return (
                <button className="page-nav-btn" disabled>
                    <FiChevronLeft /> Trang Trước
                </button>
            );
        }

        return (
            <button onClick={prevPage} className="page-nav-btn">
                <FiChevronLeft /> Trang Trước
            </button>
        );
    };

    return (
        <div className="reader-page-container">
            <header className="reader-header">
                <Link to={`/comic/${comic.id}`} className="reader-back-btn"><FiArrowLeft /> Quay lại Chi Tiết Truyện</Link>
                <h1>{comic.title} - Chương {currentChapterNumber}: {currentChapterData.title}</h1>
                <div className="page-info">Trang {pageIndex + 1}/{totalPages}</div>
            </header>

            <div className="reader-content">
                <div className="comic-page-display">
                    <p className="page-text-mock">
                        {content[pageIndex]}
                    </p>
                    <img src={comic.imageUrl} alt={`Trang ${pageIndex + 1}`} className="page-mock-image"/>
                </div>
            </div>

            <footer className="reader-footer">
                {renderPrevButton()}
                <div className="page-progress">Trang {pageIndex + 1}</div>
                {renderNextButton()}
            </footer>
        </div>
    );
};

export default ReaderPage;