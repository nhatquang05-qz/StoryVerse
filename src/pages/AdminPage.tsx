import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { type ComicSummary, type Genre } from '../types/comicTypes';
import { FiPlus, FiHome, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardView from '../components/admin/DashboardView';
import UserManagement from '../components/admin/UserManagement';
import AvatarApprovalManagement from '../components/admin/AvatarApprovalManagement'; 
import AddComicForm from '../components/admin/AddComicForm';
import EditComicForm from '../components/admin/EditComicForm';
import ManageChapters from '../components/admin/ManageChapters';
import ComicManagementList from '../components/admin/ComicManagementList';
import AdminFilterBar, { type SortOrder } from '../components/admin/AdminFilterBar';
import PackManagement from '../components/admin/PackManagement';
import FlashSaleManagement from '../components/admin/FlashSaleManagement';
import OrderManagement from '../components/admin/OrderManagement'; 

import '../assets/styles/AdminPage.css';
import defaultAvatarImg from '../assets/images/defaultAvatar.webp';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:3000/api';

export type AdminView = 'dashboard' | 'digital' | 'physical' | 'users' | 'avatars' | 'add' | 'edit' | 'chapters' | 'packs' | 'flash-sales' | 'orders';

const AdminPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const [comics, setComics] = useState<ComicSummary[]>([]);
    const [allGenres, setAllGenres] = useState<Genre[]>([]);
    const [selectedComic, setSelectedComic] = useState<ComicSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addFormType, setAddFormType] = useState<'digital' | 'physical'>('digital');

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

    const isAdmin = currentUser?.email === 'admin@123';

    const getAvatarSrc = (url: string | null | undefined) => {
        if (!url || url === 'defaultAvatar.webp') return defaultAvatarImg;
        return url;
    };

    const fetchComicsAndGenres = async () => {
        if(activeView === 'dashboard' || activeView === 'users' || activeView === 'avatars' || activeView === 'packs' || activeView === 'flash-sales' || activeView === 'orders') {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const [comicsResponse, genresResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/comics?limit=1000`), 
                fetch(`${API_BASE_URL}/comics/system/genres`)
            ]);

            if (!comicsResponse.ok) throw new Error('Không thể tải danh sách truyện');            
            const responseData = await comicsResponse.json();
            const comicsData: ComicSummary[] = Array.isArray(responseData) ? responseData : (responseData.data || []);
            setComics(comicsData);

            if (!genresResponse.ok) throw new Error('Không thể tải danh sách thể loại');
            const genresData: Genre[] = await genresResponse.json();
            setAllGenres(genresData);

        } catch (err: any) {
            setError(err.message);
            showNotification(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            if (['digital', 'physical', 'add', 'edit', 'chapters'].includes(activeView)) {
                fetchComicsAndGenres();
            } else {
                setIsLoading(false); 
            }
        }
    }, [isAdmin, activeView]); 

    const filteredComics = useMemo(() => {
        let comicsToFilter = [...comics];
        if (searchTerm) {
            comicsToFilter = comicsToFilter.filter(comic =>
                comic.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (statusFilter !== 'all') {
            comicsToFilter = comicsToFilter.filter(comic => comic.status === statusFilter);
        }
        switch (sortOrder) {
            case 'newest': comicsToFilter.sort((a, b) => b.id - a.id); break;
            case 'oldest': comicsToFilter.sort((a, b) => a.id - b.id); break;
            case 'title-az': comicsToFilter.sort((a, b) => a.title.localeCompare(b.title)); break;
            case 'title-za': comicsToFilter.sort((a, b) => b.title.localeCompare(a.title)); break;
        }
        return comicsToFilter;
    }, [comics, searchTerm, statusFilter, sortOrder]);

    const handleSelectEdit = (comic: ComicSummary) => {
        setSelectedComic(comic);
        setActiveView('edit');
    };
    const handleSelectChapters = (comic: ComicSummary) => {
        setSelectedComic(comic);
        setActiveView('chapters');
    };
    const handleDeleteComic = async (comic: ComicSummary) => {
        if (!window.confirm(`XÓA vĩnh viễn truyện "${comic.title}"?`)) return;
        const token = localStorage.getItem('storyverse_token');
        try {
            const response = await fetch(`${API_BASE_URL}/comics/${comic.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Xóa thất bại');
            showNotification('Đã xóa truyện', 'success');
            setComics(prev => prev.filter(c => c.id !== comic.id));
        } catch (error: any) {
            showNotification(error.message, 'error');
        }
    };
    const handleFormSuccess = () => {
        const defaultView = (selectedComic && !selectedComic.isDigital) ? 'physical' : 'digital';
        setSelectedComic(null);
        setActiveView(defaultView);
        if (defaultView === 'digital' || defaultView === 'physical') fetchComicsAndGenres();
    };
    const handleFormCancel = () => {
        const defaultView = (selectedComic && !selectedComic.isDigital) ? 'physical' : 'digital';
        setSelectedComic(null);
        setActiveView(defaultView);
    };
    const handleShowAddForm = (type: 'digital' | 'physical') => {
        setAddFormType(type);
        setActiveView('add');
    };
    const handleAddSuccess = () => {
        setActiveView(addFormType);
        setSelectedComic(null);
        fetchComicsAndGenres();
    };
    const handleAddCancel = () => {
        setActiveView(addFormType);
        setSelectedComic(null);
    };
    
    const handleLogout = () => {
        if (window.confirm('Đăng xuất khỏi Admin?')) {
            localStorage.removeItem('storyverse_token');
            navigate('/login');
        }
    };

    const renderContent = () => {
        if (isLoading) return <div style={{padding:'2rem'}}>Đang tải dữ liệu...</div>;
        if (error) return <div style={{padding:'2rem', color:'red'}}>{error}</div>;

        const digitalComics = filteredComics.filter(c => c.isDigital);
        const physicalComics = filteredComics.filter(c => !c.isDigital);

        const filterBar = (
            <AdminFilterBar
                searchTerm={searchTerm} onSearchChange={setSearchTerm}
                statusFilter={statusFilter} onStatusChange={setStatusFilter}
                sortOrder={sortOrder} onSortChange={setSortOrder}
            />
        );

        switch (activeView) {
            case 'dashboard': return <DashboardView />;
            case 'users': return <UserManagement />;
            case 'avatars': return <AvatarApprovalManagement />; 
            case 'packs': return <PackManagement />;
            case 'flash-sales': return <FlashSaleManagement />;
            case 'orders': return <OrderManagement />;
            case 'add':
                return <AddComicForm allGenres={allGenres} onCancel={handleAddCancel} onSuccess={handleAddSuccess} initialIsDigital={addFormType === 'digital'} />;
            case 'edit':
                return selectedComic ? <EditComicForm comic={selectedComic} allGenres={allGenres} onCancel={handleFormCancel} onSuccess={handleFormSuccess} /> : <p>Lỗi</p>;
            case 'chapters':
                return selectedComic ? <ManageChapters comic={selectedComic} onCancel={handleFormCancel} /> : <p>Lỗi</p>;
            
            case 'physical':
                return (
                    <>
                        <div className="admin-header">
                            <h2 style={{margin:0}}>Truyện In ({physicalComics.length})</h2>
                            <button className="mgmt-btn add" onClick={() => handleShowAddForm('physical')}>
                                <FiPlus /> Thêm Mới
                            </button>
                        </div>
                        {filterBar}
                        <ComicManagementList comics={physicalComics} onEdit={handleSelectEdit} onDelete={handleDeleteComic} onManageChapters={handleSelectChapters} />
                    </>
                );
            case 'digital':
            default:
                return (
                    <>
                          <div className="admin-header">
                            <h2 style={{margin:0}}>Truyện Online ({digitalComics.length})</h2>
                            <button className="mgmt-btn add" onClick={() => handleShowAddForm('digital')}>
                                <FiPlus /> Thêm Mới
                            </button>
                        </div>
                        {filterBar}
                        <ComicManagementList comics={digitalComics} onEdit={handleSelectEdit} onDelete={handleDeleteComic} onManageChapters={handleSelectChapters} />
                    </>
                );
        }
    };

    if (!currentUser || !isAdmin) return <div>Access Denied</div>;

    return (
        <div className="admin-dashboard-layout">
            <div className="admin-sidebar-wrapper">
                <AdminSidebar activeView={activeView} onNavigate={setActiveView} />
            </div>
            
            <div className="admin-main-wrapper">
                <header className="admin-top-header">
                    <div className="header-left">
                        <span className="header-breadcrumb">Hệ Thống Quản Trị / StoryVerse</span>
                        <span className="current-date">
                            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>

                    <div className="header-right">
                        <div className="admin-profile-menu">
                            <div className="admin-info">
                                <span className="admin-name">{currentUser.fullName || 'Admin'}</span>
                                <span className="admin-role">Administrator</span>
                            </div>
                            <div className="admin-avatar">
                                <img src={getAvatarSrc(currentUser.avatarUrl)} alt="Admin" />
                            </div>
                        </div>

                        <div className="header-actions">
                            <button className="header-btn home" onClick={() => navigate('/')} title="Về trang chủ">
                                <FiHome /> <span>Web</span>
                            </button>
                            <button className="header-btn logout" onClick={handleLogout} title="Đăng xuất">
                                <FiLogOut /> <span>Thoát</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="admin-content-scrollable">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminPage;