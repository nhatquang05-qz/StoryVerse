import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { comics } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import './ReaderPage.css';

const mockChapterContent = [
    "Đây là trang 1 của chương 1. Chức năng này chỉ dành cho truyện digital đã được mua.",
    "Trang 2: Bạn đang đọc truyện {title}. Cốt truyện đang diễn ra rất hấp dẫn.",
    "Trang 3: Kích thước của truyện digital sẽ được điều chỉnh cho phù hợp với thiết bị của bạn.",
    "Trang 4: Để có trải nghiệm tốt nhất, nên đọc trên màn hình lớn hoặc xoay ngang điện thoại.",
    "Trang 5: Hết chương 1. Cảm ơn bạn đã đọc truyện trên StoryVerse!",
];

const ReaderPage: React.FC = () => {
    const { comicId } = useParams<{ comicId: string }>();
    const { currentUser } = useAuth();
    const comic = comics.find(c => c.id === Number(comicId));
    const [pageIndex, setPageIndex] = React.useState(0);

    useEffect(() => {
        if (!currentUser) {
            // alert('Bạn cần đăng nhập để đọc truyện.'); // Đã thay bằng NotificationContext ở các bước trước
        }
    }, [currentUser]);

    if (!comic) {
        return <div className="reader-page-not-found">Không tìm thấy truyện này.</div>;
    }

    if (!currentUser) {
        return (
            <div className="reader-page-not-found">
                <h2>Vui lòng đăng nhập để đọc truyện.</h2>
                <Link to="/login" className="reader-back-btn">Đăng nhập ngay</Link>
            </div>
        );
    }
    
    const totalPages = mockChapterContent.length;

    const nextPage = () => setPageIndex(prev => Math.min(totalPages - 1, prev + 1));
    const prevPage = () => setPageIndex(prev => Math.max(0, prev - 1));

    return (
        <div className="reader-page-container">
            <header className="reader-header">
                <Link to="/my-library" className="reader-back-btn"><FiArrowLeft /> Quay lại Thư Viện</Link>
                <h1>{comic.title} - Chương 1</h1>
                <div className="page-info">Trang {pageIndex + 1}/{totalPages}</div>
            </header>

            <div className="reader-content">
                <div className="comic-page-display">
                    <p className="page-text-mock">
                        {mockChapterContent[pageIndex].replace('{title}', comic.title)}
                    </p>
                    <img src={comic.imageUrl} alt={`Trang ${pageIndex + 1}`} className="page-mock-image"/>
                </div>
            </div>

            <footer className="reader-footer">
                <button onClick={prevPage} disabled={pageIndex === 0} className="page-nav-btn">
                    <FiChevronLeft /> Trang Trước
                </button>
                <div className="page-progress">Trang {pageIndex + 1}</div>
                <button onClick={nextPage} disabled={pageIndex === totalPages - 1} className="page-nav-btn">
                    Trang Sau <FiChevronRight />
                </button>
            </footer>
        </div>
    );
};

export default ReaderPage;