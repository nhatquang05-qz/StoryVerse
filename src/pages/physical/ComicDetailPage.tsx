// src/pages/physical/ComicDetailPage.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiMinus, FiHeart, FiBookOpen, FiLock, FiSearch, FiArrowDown, FiArrowUp } from 'react-icons/fi';
import { type ComicDetail, type ChapterSummary } from '../../types/comicTypes';
import { loadOrders } from '../../data/mockData';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishListContext';
import ReviewSection from '../../components/common/review/ReviewSection';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import './ComicDetailPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const TOKEN_STORAGE_KEY = 'storyverse_token';

const ComicDetailSkeleton: React.FC = () => (
    <div className="detail-skeleton-wrapper">
        <div className="detail-image-wrapper">
            <div className="detail-skeleton-image skeleton-block"></div>
        </div>
        <div className="detail-info-wrapper">
            <div className="detail-skeleton-author skeleton-block"></div>
            <div className="detail-skeleton-title skeleton-block"></div>
            <div className="detail-skeleton-price skeleton-block"></div>
            
            <div className="detail-skeleton-actions">
                <div className="detail-skeleton-quantity skeleton-block"></div>
                <div className="detail-skeleton-cart-btn skeleton-block"></div>
                <div className="detail-skeleton-cart-btn skeleton-block" style={{ maxWidth: '180px' }}></div>
            </div>
            
            <div className="detail-description">
                <div className="detail-skeleton-description-title skeleton-block"></div>
                <div className="detail-skeleton-text-line skeleton-block" style={{ width: '100%' }}></div>
                <div className="detail-skeleton-text-line skeleton-block" style={{ width: '95%' }}></div>
                <div className="detail-skeleton-text-line skeleton-block" style={{ width: '60%' }}></div>
            </div>
        </div>
    </div>
);

const fetchComicDetail = (id: number): Promise<ComicDetail | undefined> => {
    return new Promise((resolve, reject) => {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        fetch(`${API_URL}/comics/${id}`, {
             headers: {
                'Authorization': `Bearer ${token}`
             }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Không tìm thấy truyện');
                }
                return res.json();
            })
            .then(data => {
                const comicData = data as ComicDetail;
                comicData.chapters = comicData.chapters.map(ch => ({
                    ...ch, 
                    chapterNumber: parseFloat(String(ch.chapterNumber)), 
                    price: ch.price || 0,
                    viewCount: ch.viewCount || 0
                }));
                resolve(comicData);
            })
            .catch(err => {
                console.error("Lỗi fetch chi tiết truyện:", err);
                reject(err);
            });
    });
};

const isDigitalComicPurchased = (comicId: number, userId: string | undefined): boolean => {
    if (!userId) return false;
    const userOrders = loadOrders(userId);
    const validStatuses = ['Hoàn thành', 'Đang giao hàng'];
    return userOrders
        .filter(order => validStatuses.includes(order.status))
        .flatMap(order => order.items)
        .some(item => item.id === comicId && item.title === 'Full Access'); 
};

const ComicDetailPage: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showNotification } = useNotification();
  const { currentUser, unlockChapter } = useAuth();
  const navigate = useNavigate();
  const { comicId } = useParams<{ comicId: string }>();
  const id = Number(comicId);

  const [comic, setComic] = useState<ComicDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [unlockedChapterIds, setUnlockedChapterIds] = useState<Set<number>>(new Set());

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
      setIsLoading(true);
      fetchComicDetail(id)
        .then(data => {
            setComic(data || null);
        })
        .catch(() => {
            setComic(null); 
            navigate('/404'); 
        })
        .finally(() => {
            setIsLoading(false);
        });
  }, [id, navigate]);
  
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
            setUnlockedChapterIds(unlockedSet);
        };

        fetchUnlockedData();
    }, [comic, currentUser]);


  const isFavorite = comic ? isWishlisted(comic.id) : false;
  
  const chapters = useMemo(() => comic?.chapters || [], [comic]);
  
  const isFullUnlocked = comic && ((comic.isDigital as any) === 1) 
    ? isDigitalComicPurchased(comic.id, currentUser?.id) 
    : false;

  const highestUnlockedChapterNumber = useMemo(() => {
        if (!comic) return 0;
        
        const validChapters = comic.chapters
            .filter(ch => unlockedChapterIds.has(ch.id))
            .map(ch => Number(ch.chapterNumber));
            
        if (validChapters.length === 0) return 0;

        const maxUnlocked = Math.max(...validChapters);
        
        for (let i = 1; i <= maxUnlocked + 1; i++) {
            const chapterToCheck = comic.chapters.find(ch => Number(ch.chapterNumber) === i);
            if (!chapterToCheck || !unlockedChapterIds.has(chapterToCheck.id)) {
                return i - 1;
            }
        }
        
        return maxUnlocked;
  }, [comic, unlockedChapterIds]);
    
  const handleReadNow = (chapterNumber: number) => {
      if (comic) {
          navigate(`/read/${comic.id}/${chapterNumber}`);
      }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  const formatViews = (views: number) => {
      if (!views) return '0';
      if (views >= 1000) {
          return (views / 1000).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + 'K';
      }
      return views.toLocaleString('vi-VN');
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };
  
  const handleAddToCart = () => {
    if (comic && !((comic.isDigital as any) === 1)) {
      const rect = imgRef.current ? imgRef.current.getBoundingClientRect() : null;
      addToCart(comic as any, 1, rect);
    }
  };

  const handleToggleWishlist = () => {
    if (comic) {
        toggleWishlist(comic as any);
        showNotification(isFavorite ? `Đã xóa ${comic.title} khỏi Yêu thích.` : `Đã thêm ${comic.title} vào Yêu thích.`, isFavorite ? 'error' : 'success');
    }
  };
  
const handleUnlockChapter = async (chapter: ChapterSummary) => {
      if (!currentUser) {
          showNotification('Vui lòng đăng nhập để mở khóa chương.', 'warning');
          return;
      }
      
      if (!comic || !((comic.isDigital as any) === 1)) return;

      const nextExpectedChapterNum = highestUnlockedChapterNumber + 1;
      const nextChapterInSequence = chapters.find(c => Number(c.chapterNumber) === nextExpectedChapterNum);

      if (Number(chapter.chapterNumber) !== nextExpectedChapterNum) {
           if (nextChapterInSequence) {
                showNotification(`Vui lòng mở khóa Chương ${nextChapterInSequence.chapterNumber} trước.`, 'warning');
           } else {
                showNotification(`Vui lòng mở khóa chương tiếp theo trong chuỗi.`, 'warning');
           }
          return;
      }

      if (currentUser.coinBalance < chapter.price) {
          showNotification('Số dư Xu không đủ. Vui lòng nạp thêm Xu.', 'error');
          navigate('/recharge'); 
          return;
      }

      try {
          const result = await unlockChapter(chapter.id);
          
          if (result) {
            showNotification(`Đã mở khóa Chương ${chapter.chapterNumber} với ${chapter.price} Xu!`, 'success');
            setUnlockedChapterIds(prev => new Set(prev).add(chapter.id));
            navigate(`/read/${comic.id}/${chapter.chapterNumber}`);
          } else {
             throw new Error('Kết quả trả về không hợp lệ');
          }
          
      } catch (e: any) {
          showNotification(e.message || 'Lỗi khi mở khóa chương.', 'error');
      }
  };
  
  const renderActions = () => {
    const wishlistButton = (
        <button 
            className={`add-to-cart-btn wishlist-btn-detail ${isFavorite ? 'favorite' : ''}`} 
            onClick={handleToggleWishlist}
            aria-label={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
            style={{ flexGrow: 0 }}
        >
            <FiHeart style={{ marginRight: '0.5rem' }} /> 
            {isFavorite ? 'Đã yêu thích' : 'Thêm vào Yêu thích'}
        </button>
    );
    
    if ((comic!.isDigital as any) === 1) {
        const firstFreeChapter = chapters.find(c => c.price === 0);

        return (
            <div className="digital-actions-group" style={{ flexDirection: 'column', gap: '1rem' }}>
                <p className="coin-warning-text" style={{ margin: '0', textAlign: 'center', fontWeight: 'bold' }}>
                     {chapters.length > 0 && chapters.filter(c => c.price === 0).length > 0 ? 'Truyện có giới hạn chương đọc thử.' : 'Truyện Digital.'}
                </p>
                
                <div className="digital-main-buttons">
                    {firstFreeChapter && (
                        <button className="add-to-cart-btn" onClick={() => handleReadNow(Number(firstFreeChapter.chapterNumber))} style={{ backgroundColor: '#28a745', color: 'white', border: '1px solid #28a745' }}>
                            <FiBookOpen style={{ marginRight: '0.5rem' }} /> Đọc Chương {firstFreeChapter.chapterNumber}
                        </button>
                    )}
                </div>
                
                {wishlistButton}
            </div>
        );
    } 
    return (
        <div className="detail-actions">
            <div className="quantity-selector">
              <button onClick={() => handleQuantityChange(-1)} className="quantity-btn" aria-label="Giảm số lượng">
                <FiMinus />
              </button>
              <input type="text" value={quantity} readOnly className="quantity-input" />
              <button onClick={() => handleQuantityChange(1)} className="quantity-btn" aria-label="Tăng số lượng">
                <FiPlus />
              </button>
            </div>
            <button className="add-to-cart-btn main-cart-btn" onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
            {wishlistButton}
        </div>
    );
  };
  
  const displayedChapters = useMemo(() => {
    let list = [...chapters];

    if (searchTerm) {
        const normalizedSearch = searchTerm.toLowerCase();
        list = list.filter(ch => 
            (ch.title || '').toLowerCase().includes(normalizedSearch) ||
            ch.chapterNumber.toString().includes(normalizedSearch)
        );
    }

    list.sort((a, b) => {
        if (sortOrder === 'desc') {
            return Number(b.chapterNumber) - Number(a.chapterNumber);
        }
        return Number(a.chapterNumber) - Number(b.chapterNumber);
    });

    return list;
}, [chapters, searchTerm, sortOrder]);

const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
};

  const renderChapterList = () => {
      if (!comic || !((comic.isDigital as any) === 1) || chapters.length === 0) return null;
      
      const isFullUnlocked = isDigitalComicPurchased(comic.id, currentUser?.id);
      const highestUnlocked = highestUnlockedChapterNumber;
      
      return (
          <div className="chapter-list-container">
              <h2>Danh Sách Chương ({chapters.length})</h2>

              <div className="chapter-search-row">
                  <div className="chapter-sort-label" onClick={toggleSort} >
                      Chap {sortOrder === 'desc' ? <FiArrowDown /> : <FiArrowUp />}
                  </div>
                  <div className="chapter-search-box">
                      <input 
                          type="text"
                          placeholder="Tìm kiếm"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <FiSearch />
                  </div>
                  
                  <div className="chapter-header-col" style={{ gridColumn: '3 / 4', justifyContent: 'center' }}>
                      Ngày cập nhật
                  </div>
                  
                  <div className="chapter-header-col" style={{ gridColumn: '4 / 5', justifyContent: 'center' }}>
                      Lượt xem
                  </div>
                  
                  <div className="chapter-header-col" style={{ gridColumn: '5 / 6', justifyContent: 'flex-end' }}>
                  </div>
              </div>


              <ul className="chapter-list">
                  {displayedChapters.length > 0 ? (
                      displayedChapters.map((chapter) => {
                          const isUnlocked = isFullUnlocked || unlockedChapterIds.has(chapter.id);
                          
                          const nextExpectedChapterNum = highestUnlocked + 1;
                          const nextChapterInSequence = chapters.find(c => Number(c.chapterNumber) === nextExpectedChapterNum);
                          
                          const isNextToUnlock = nextChapterInSequence ? (chapter.id === nextChapterInSequence.id) : false;

                          const canUnlock = !isUnlocked && isNextToUnlock;
                          const canRead = isUnlocked;

                          return (
                              <li key={chapter.id} className={`chapter-item ${canRead ? 'unlocked' : 'locked'}`}>
                                  
                                  <div className="chapter-number">
                                      Chương {chapter.chapterNumber}
                                  </div>

                                  <div className="chapter-title">
                                      {chapter.title}
                                  </div>

                                  <div className="chapter-update">
                                      {new Date(chapter.createdAt).toLocaleDateString('vi-VN')}
                                  </div>
                                  
                                  <div className="chapter-views" style={{ textAlign: 'center' }}>
                                      {formatViews(chapter.viewCount || 0)}
                                  </div>
                                  
                                  <div className="chapter-actions">
                                      {canRead ? (
                                          <Link to={`/read/${comic.id}/${chapter.chapterNumber}`} className="read-chapter-btn">
                                              Đọc Ngay
                                          </Link>
                                      ) : (
                                          <button 
                                              className="unlock-chapter-btn"
                                              onClick={() => handleUnlockChapter(chapter)}
                                              disabled={!currentUser || !canUnlock} 
                                              style={!canUnlock ? { backgroundColor: 'var(--clr-border-light)', color: 'var(--clr-text-secondary)' } : {}}
                                          >
                                              <FiLock style={{ marginRight: '0.25rem' }} /> Mở khóa ({chapter.price} Xu)
                                          </button>
                                      )}
                                  </div>
                              </li>
                          );
                      })
                  ) : (
                      <li className="chapter-item" style={{ gridColumn: '1 / -1', justifyContent: 'center' }}>
                          Không tìm thấy chương nào phù hợp.
                      </li>
                  )}
              </ul>
          </div>
      );
  };


  if (isLoading) {
      return (
        <div className="detail-page-container" style={{ padding: '3rem 0' }}>
            <ComicDetailSkeleton />
        </div>
      );
  }

  if (!comic) {
    return <div>Không tìm thấy truyện!</div>;
  }
  
  const isDigital = (comic.isDigital as any) === 1;

  return (
    <div className="detail-page-container">
      <div className="detail-main-card">
        <div className="detail-image-wrapper">
          <img ref={imgRef} src={comic.coverImageUrl} alt={comic.title} className="detail-image" /> 
          {isDigital && (
              <span className="digital-badge" style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>DIGITAL</span>
          )}
        </div>
        <div className={`detail-info-wrapper ${isDigital ? 'digital-header-center' : ''}`}>
          <p className="detail-author">Tác giả: {comic.author}</p>
          <h1 className="detail-title">{comic.title}</h1>
          
          {!isDigital && <p className="detail-price">{formatPrice(comic.price)}</p>}
          
          {isDigital && (
              <div className="digital-price-info" style={{ marginBottom: '2rem' }}>
                    <p className="detail-price" style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--clr-text)', margin: 0, padding: 0, border: 'none' }}>
                       Truyện Digital
                    </p>
              </div>
          )}
          
          <div className="detail-actions" style={{ justifyContent: 'flex-start' }}>
            {renderActions()}
          </div>

          <div className="detail-description">
            <h3>Mô tả</h3>
            <p>
              {comic.description || "Truyện này hiện chưa có mô tả chi tiết."}
            </p>
          </div>
        </div>
      </div>
      
      {renderChapterList()}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <ReviewSection comicId={comic.id} comicTitle={comic.title} />
      </div>
    </div>
  );
};

export default ComicDetailPage;