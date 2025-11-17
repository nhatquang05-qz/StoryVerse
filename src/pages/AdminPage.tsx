import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { type ComicSummary, type Genre } from '../types/comicTypes';
import { FiPlus } from 'react-icons/fi';

import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardView from '../components/admin/DashboardView';
import UserManagement from '../components/admin/UserManagement';
import AddComicForm from '../components/admin/AddComicForm';
import EditComicForm from '../components/admin/EditComicForm';
import ManageChapters from '../components/admin/ManageChapters';
import ComicManagementList from '../components/admin/ComicManagementList';
import AdminFilterBar, { type SortOrder } from '../components/admin/AdminFilterBar';

import '../assets/styles/AdminPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export type AdminView = 'dashboard' | 'digital' | 'physical' | 'users' | 'add' | 'edit' | 'chapters';

const AdminPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();

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

    const fetchComicsAndGenres = async () => {
         if(activeView === 'dashboard') {
             setIsLoading(false);
             return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const [comicsResponse, genresResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/comics`),
                fetch(`${API_BASE_URL}/comics/system/genres`)
            ]);

            if (!comicsResponse.ok) throw new Error('Không thể tải danh sách truyện');
            const comicsData: ComicSummary[] = await comicsResponse.json();
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
            if (activeView !== 'dashboard' && activeView !== 'users') {
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
            case 'newest':
                comicsToFilter.sort((a, b) => b.id - a.id);
                break;
            case 'oldest':
                comicsToFilter.sort((a, b) => a.id - b.id);
                break;
            case 'title-az':
                comicsToFilter.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-za':
                comicsToFilter.sort((a, b) => b.title.localeCompare(a.title));
                break;
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
        if (!window.confirm(`Bạn có chắc chắn muốn XÓA vĩnh viễn truyện "${comic.title}" không? Hành động này không thể hoàn tác.`)) {
            return;
        }

        const token = localStorage.getItem('storyverse_token');
        try {
            const response = await fetch(`${API_BASE_URL}/comics/${comic.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Xóa thất bại');
            showNotification('Xóa truyện thành công!', 'success');
            setComics(prev => prev.filter(c => c.id !== comic.id));
        } catch (error: any) {
            showNotification(error.message, 'error');
        }
    };

    const handleFormSuccess = () => {
        const defaultView = (selectedComic && !selectedComic.isDigital) ? 'physical' : 'digital';
        setSelectedComic(null);
        setActiveView(defaultView);
        if (defaultView === 'digital' || defaultView === 'physical') {
            fetchComicsAndGenres();
        }
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
        if (addFormType === 'digital' || addFormType === 'physical') {
            fetchComicsAndGenres();
        }
    };

    const handleAddCancel = () => {
        setActiveView(addFormType);
        setSelectedComic(null);
    };


    const renderContent = () => {
        if (isLoading) return <p>Đang tải dữ liệu quản trị...</p>;
        if (error) return <p style={{ color: 'var(--clr-error-text)' }}>{error}</p>;

        const digitalComics = filteredComics.filter(c => c.isDigital);
        const physicalComics = filteredComics.filter(c => !c.isDigital);

        const filterBar = (
            <AdminFilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
            />
        );

        switch (activeView) {
            case 'dashboard':
                return <DashboardView />;
                
            case 'add':
                return <AddComicForm
                    allGenres={allGenres}
                    onCancel={handleAddCancel}
                    onSuccess={handleAddSuccess}
                    initialIsDigital={addFormType === 'digital'}
                />;
            case 'edit':
                if (!selectedComic) return <p>Lỗi: Không có truyện nào được chọn.</p>;
                return <EditComicForm
                    comic={selectedComic}
                    allGenres={allGenres}
                    onCancel={handleFormCancel}
                    onSuccess={handleFormSuccess}
                />;
            case 'chapters':
                if (!selectedComic) return <p>Lỗi: Không có truyện nào được chọn.</p>;
                return <ManageChapters comic={selectedComic} onCancel={handleFormCancel} />;
            case 'users':
                return <UserManagement />;
            case 'physical':
                return (
                    <>
                        <div className="admin-header">
                            <h2>Quản Lý Truyện In ({physicalComics.length})</h2>
                            <button className="mgmt-btn add" onClick={() => handleShowAddForm('physical')}>
                                <FiPlus /> Thêm Truyện In
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
                            <h2>Quản Lý Truyện Online ({digitalComics.length})</h2>
                            <button className="mgmt-btn add" onClick={() => handleShowAddForm('digital')}>
                                <FiPlus /> Thêm Truyện Online
                            </button>
                        </div>
                        {filterBar}
                        <ComicManagementList comics={digitalComics} onEdit={handleSelectEdit} onDelete={handleDeleteComic} onManageChapters={handleSelectChapters} />
                    </>
                );
        }
    };

    if (!currentUser) {
        return <div style={{ padding: '2rem' }}>Vui lòng đăng nhập với tài khoản Admin.</div>;
    }
    if (!isAdmin) {
        return <div style={{ padding: '2rem' }}>Bạn không có quyền truy cập trang này.</div>;
    }

    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar activeView={activeView} onNavigate={setActiveView} />
            <main className="admin-content">
                <h1>Trang Quản Trị StoryVerse</h1>
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminPage;