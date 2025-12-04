import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaBook, FaHeart, FaSearch, FaTrash, FaBookOpen } from 'react-icons/fa';
import '../assets/styles/MyLibraryPage.css';
import LoadingScreen from '../components/common/Loading/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import StarRating from '../components/common/StarRating';
import defaultCover from '../assets/images/logo.avif';

interface UnlockedChapterRaw {
    id: number;
    comicId: number;
    title: string;
    coverImageUrl: string;
    chapterNumber: number;
    chapterTitle: string;
    unlockedAt: string;
    price: number;
}

interface LibraryComic {
    comicId: number;
    title: string;
    coverImageUrl: string;
    unlockedChaptersCount: number;
    latestUnlockedChapter: number;
    lastInteraction: string;
}

interface WishlistItem {
    id: number;
    title: string;
    coverImageUrl: string;
    author?: string;
    genre?: string;
    averageRating?: number;
    status: string;
}

const MyLibraryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'purchased' | 'wishlist'>('purchased');
    const [purchasedComics, setPurchasedComics] = useState<LibraryComic[]>([]);
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    const { currentUser, token } = useAuth(); 

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

    const api = axios.create({
        baseURL: API_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [activeTab, currentUser]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'purchased') {
                await fetchPurchasedComics();
            } else {
                await fetchWishlist();
            }
        } catch (error) {
            console.error("Error fetching library data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPurchasedComics = async () => {
        try {
            const response = await api.get('/users/unlocked-chapters');
            const rawChapters: UnlockedChapterRaw[] = response.data;

            const groupedMap = new Map<number, LibraryComic>();

            rawChapters.forEach(chap => {
                if (!groupedMap.has(chap.comicId)) {
                    groupedMap.set(chap.comicId, {
                        comicId: chap.comicId,
                        title: chap.title || `Truyện #${chap.comicId}`,
                        coverImageUrl: chap.coverImageUrl,
                        unlockedChaptersCount: 0,
                        latestUnlockedChapter: 0,
                        lastInteraction: chap.unlockedAt
                    });
                }

                const comic = groupedMap.get(chap.comicId)!;
                comic.unlockedChaptersCount += 1;
                if (chap.chapterNumber > comic.latestUnlockedChapter) {
                    comic.latestUnlockedChapter = chap.chapterNumber;
                }
                if (new Date(chap.unlockedAt) > new Date(comic.lastInteraction)) {
                    comic.lastInteraction = chap.unlockedAt;
                }
            });

            const groupedList = Array.from(groupedMap.values()).sort((a, b) => 
                new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime()
            );

            setPurchasedComics(groupedList);

        } catch (error) {
            console.error("Failed to fetch unlocked chapters", error);
        }
    };

    const fetchWishlist = async () => {
        try {
            const response = await api.get('/users/wishlist');
            setWishlist(response.data);
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        }
    };

    const handleRemoveFromWishlist = async (e: React.MouseEvent, comicId: number) => {
        e.preventDefault();
        if (!window.confirm("Bạn có chắc muốn bỏ truyện này khỏi yêu thích?")) return;

        try {
            await api.post('/users/toggle-wishlist', { comicId });
            toast.success("Đã xóa khỏi danh sách yêu thích");
            setWishlist(prev => prev.filter(item => item.id !== comicId));
        } catch (error) {
            toast.error("Lỗi khi xóa khỏi wishlist");
        }
    };

    const filteredPurchased = purchasedComics.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredWishlist = wishlist.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getImageUrl = (url: string | undefined | null) => {
        if (!url || url === "") return defaultCover;
        if (url.startsWith('http')) return url;
        return `http://localhost:3000/${url}`;
    };

    if (loading && !purchasedComics.length && !wishlist.length) return <LoadingScreen />;

    return (
        <div className="my-library-container">
            <div className="library-header-row">
                <h2 className="library-page-title">Thư viện cá nhân</h2>
                
                <div className="library-mini-search">
                    <FaSearch className="mini-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Tìm truyện..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="library-tabs-nav">
                <button 
                    className={`lib-tab-item ${activeTab === 'purchased' ? 'active' : ''}`}
                    onClick={() => setActiveTab('purchased')}
                >
                    <FaBook /> Tủ sách ({purchasedComics.length})
                </button>
                <button 
                    className={`lib-tab-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                    onClick={() => setActiveTab('wishlist')}
                >
                    <FaHeart /> Yêu thích ({wishlist.length})
                </button>
            </div>

            <div className="library-tab-content">
                {activeTab === 'purchased' ? (
                    <>
                        {filteredPurchased.length > 0 ? (
                            <div className="library-grid-view">
                                {filteredPurchased.map((comic) => (
                                    <Link to={`/comic/${comic.comicId}`} key={comic.comicId} className="lib-item-card">
                                        <div className="lib-item-img">
                                            <img 
                                                src={getImageUrl(comic.coverImageUrl)} 
                                                alt={comic.title} 
                                                onError={(e) => {
                                                    e.currentTarget.src = defaultCover;
                                                }}
                                            />
                                            <span className="lib-badge-count">{comic.unlockedChaptersCount} chương</span>
                                        </div>
                                        <div className="lib-item-info">
                                            <h4>{comic.title}</h4>
                                            <p>Mới nhất: Chương {comic.latestUnlockedChapter}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="library-empty-state">
                                <FaBookOpen size={40} />
                                <p>Bạn chưa sở hữu chương truyện nào.</p>
                                <Link to="/search" className="lib-link-action">Khám phá ngay</Link>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {filteredWishlist.length > 0 ? (
                            <div className="library-grid-view">
                                {filteredWishlist.map((comic) => (
                                    <Link to={`/comic/${comic.id}`} key={comic.id} className="lib-item-card wishlist-card">
                                        <button 
                                            className="btn-remove-wish"
                                            onClick={(e) => handleRemoveFromWishlist(e, comic.id)}
                                        >
                                            <FaTrash />
                                        </button>
                                        <div className="lib-item-img">
                                            <img 
                                                src={getImageUrl(comic.coverImageUrl)} 
                                                alt={comic.title}
                                                onError={(e) => {
                                                    e.currentTarget.src = defaultCover;
                                                }}
                                            />
                                            <span className={`status-badge ${comic.status}`}>
                                                {comic.status === 'completed' ? 'Full' : 'On-going'}
                                            </span>
                                        </div>
                                        <div className="lib-item-info">
                                            <h4>{comic.title}</h4>
                                            <StarRating rating={comic.averageRating || 0} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="library-empty-state">
                                <FaHeart size={40} />
                                <p>Danh sách yêu thích trống.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyLibraryPage;