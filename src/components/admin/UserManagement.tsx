import React, { useState, useEffect, useMemo } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { 
    FiSearch, FiSlash, FiCheckCircle, FiDownload, FiEdit, FiTrash2, 
    FiEye, FiClock, FiDollarSign, FiBook, FiX, FiShoppingCart, FiXCircle
} from 'react-icons/fi';
import UserEditModal, { type AdminManagedUser } from './UserEditModal';
import '../../assets/styles/UserDetailModal.css'; 
import '../../assets/styles/UserManagement.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const StatusBadge = ({ status }: { status: string }) => {
    const statusLower = status?.toLowerCase() || '';
    if (['success', 'completed', 'thành công'].includes(statusLower)) {
        return <div className="badge-wrapper badge-success"><FiCheckCircle /> <span>Thành công</span></div>;
    }
    if (['failed', 'cancelled', 'thất bại'].includes(statusLower)) {
        return <div className="badge-wrapper badge-failed"><FiXCircle /> <span>Thất bại</span></div>;
    }
    return <div className="badge-wrapper badge-pending"><FiClock /> <span>Đang xử lý</span></div>;
};

// --- UserDetailModal Component ---
interface UserDetailModalProps {
    userId: string;
    onClose: () => void;
    token: string;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ userId, onClose, token }) => {
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'deposits' | 'purchases' | 'library'>('info');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/details`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setDetails(data);
                }
            } catch (error) {
                console.error("Failed to fetch user details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [userId, token]);

    const stats = useMemo(() => {
        if (!details) return { totalDepositedVND: 0, totalPurchasedVND: 0, totalSpentCoins: 0, totalDepositedCoins: 0 };
        
        let totalDepositedVND = 0;
        let totalPurchasedVND = 0;
        let totalSpentCoins = 0;

        if (details.transactions) {
            details.transactions.forEach((tx: any) => {
                const amount = Number(tx.amount) || 0;
                const type = tx.type?.toLowerCase() || '';
                const status = tx.status?.toLowerCase() || '';

                if (status === 'success' || status === 'completed' || status === 'thành công') {
                    if (type.includes('nạp') || type.includes('deposit') || type.includes('recharge')) {
                        totalDepositedVND += amount;
                    } else if (type.includes('mua') || type.includes('buy') || type.includes('purchase')) {
                        totalPurchasedVND += amount;
                    }
                }
            });
        }

        if (details.library) {
            details.library.forEach((lib: any) => {
                totalSpentCoins += (Number(lib.price) || 0);
            });
        }

        const currentBalance = Number(details.profile?.coinBalance) || 0;
        const totalDepositedCoins = currentBalance + totalSpentCoins; 

        return { totalDepositedVND, totalPurchasedVND, totalSpentCoins, totalDepositedCoins };
    }, [details]);

    const depositHistory = useMemo(() => details?.transactions?.filter((tx: any) => 
        tx.type?.toLowerCase().includes('nạp') || 
        tx.type?.toLowerCase().includes('deposit') || 
        tx.type?.toLowerCase().includes('recharge')
    ) || [], [details]);

    const purchaseHistory = useMemo(() => details?.transactions?.filter((tx: any) => 
        tx.type?.toLowerCase().includes('mua') || 
        tx.type?.toLowerCase().includes('buy') || 
        tx.type?.toLowerCase().includes('purchase')
    ) || [], [details]);

    const handleExportUserCSV = () => {
        if (!details) return;
        const txHeaders = ["Transaction Code", "Type", "ItemName", "Description", "Amount", "Status", "Date"];
        
        const txRows = details.transactions?.map((tx: any) => 
            `${tx.transactionCode || tx.orderId || tx.id},${tx.type},"${tx.purchasedItem || ''}","${tx.description || ''}",${tx.amount},${tx.status},${new Date(tx.createdAt).toISOString()}`
        ) || [];
        
        const content = `User Report for ${details.profile.fullName}\n\nTRANSACTIONS\n${txHeaders.join(',')}\n${txRows.join('\n')}`;
        const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user_detail_${details.profile.fullName}.csv`;
        a.click();
    };

    if (loading) return <div className="modal-overlay"><div className="modal-content" style={{padding:'2rem'}}>Đang tải...</div></div>;
    if (!details) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '900px' }}>
                <div className="modal-header">
                    <div className="user-info-header">
                        <img src={details.profile.avatarUrl || 'https://via.placeholder.com/50'} className="user-avatar-large" alt="Avatar" />
                        <div>
                            <h3 className="user-name-title">{details.profile.fullName}</h3>
                            <span className="user-id-sub">ID: {details.profile.id} | {details.profile.email}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="close-btn" style={{marginLeft: 'auto'}}><FiX /></button>
                </div>

                <div className="user-detail-tabs">
                    <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}><FiCheckCircle /> Thông Tin</button>
                    <button className={`tab-btn ${activeTab === 'deposits' ? 'active' : ''}`} onClick={() => setActiveTab('deposits')}><FiDollarSign /> Lịch Sử Nạp ({depositHistory.length})</button>
                    <button className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}><FiShoppingCart /> Lịch Sử Mua ({purchaseHistory.length})</button>
                    <button className={`tab-btn ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}><FiBook /> Tủ Truyện ({details.library?.length})</button>
                    <button className="mgmt-btn export-btn-modal" onClick={handleExportUserCSV}><FiDownload /> Xuất CSV</button>
                </div>

                <div className="user-detail-body">
                    {activeTab === 'info' && (
                        <div className="info-grid">
                            <div className="detail-card">
                                <h4>Thông tin cá nhân</h4>
                                <div className="info-row"><span className="info-label">Email</span><span className="info-value">{details.profile.email}</span></div>
                                <div className="info-row"><span className="info-label">SĐT</span><span className="info-value">{details.profile.phone || '---'}</span></div>
                                <div className="info-row"><span className="info-label">Ngày tạo</span><span className="info-value">{new Date(details.profile.acc_created_at).toLocaleDateString('vi-VN')}</span></div>
                            </div>
                            <div className="detail-card">
                                <h4>Tài chính & Xu</h4>
                                <div className="info-row">
                                    <span className="info-label">Số dư hiện tại</span>
                                    <span className="info-value text-orange">{Number(details.profile.coinBalance).toLocaleString('vi-VN')} Xu</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Tổng tiền đã nạp</span>
                                    <span className="info-value text-green">{stats.totalDepositedVND.toLocaleString('vi-VN')} VNĐ</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Tổng tiền mua hàng</span>
                                    <span className="info-value text-blue">{stats.totalPurchasedVND.toLocaleString('vi-VN')} VNĐ</span>
                                </div>
                                <div className="info-row" style={{borderTop:'1px solid #eee', marginTop:'8px', paddingTop:'8px'}}>
                                    <span className="info-label">Tổng xu tích lũy</span>
                                    <span className="info-value text-blue">{stats.totalDepositedCoins.toLocaleString('vi-VN')} Xu</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Tổng xu đã tiêu</span>
                                    <span className="info-value text-orange">{stats.totalSpentCoins.toLocaleString('vi-VN')} Xu</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'deposits' && (
                        <div>
                            <div className="stats-summary-box">
                                <div className="summary-item bg-green-light">
                                    <span className="summary-label">Tổng tiền nạp</span>
                                    <span className="summary-value">{stats.totalDepositedVND.toLocaleString('vi-VN')} đ</span>
                                </div>
                                <div className="summary-item bg-blue-light">
                                    <span className="summary-label">Tổng xu nhận (Tích lũy)</span>
                                    <span className="summary-value">{stats.totalDepositedCoins.toLocaleString('vi-VN')} xu</span>
                                </div>
                            </div>
                            <div className="detail-table-wrapper">
                                <table className="detail-table">
                                    <thead><tr><th>Mã GD</th><th>Nội dung</th><th>Số tiền (VNĐ)</th><th>Trạng Thái</th><th className="text-right">Thời Gian</th></tr></thead>
                                    <tbody>
                                        {depositHistory.map((tx: any) => (
                                            <tr key={tx.id}>
                                                <td style={{fontFamily: 'monospace', fontSize: '0.9em', color: '#555'}}>
                                                    {tx.transactionCode || tx.orderId || `#${tx.id}`}
                                                </td>
                                                <td>{tx.description || 'Nạp xu'}</td>
                                                <td className="font-bold text-green">+{Number(tx.amount).toLocaleString('vi-VN')} đ</td>
                                                <td><StatusBadge status={tx.status} /></td>
                                                <td className="text-right text-gray">{new Date(tx.createdAt).toLocaleString('vi-VN')}</td>
                                            </tr>
                                        ))}
                                        {depositHistory.length === 0 && <tr><td colSpan={5} className="empty-state">Chưa có giao dịch nạp tiền</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'purchases' && (
                        <div>
                            <div className="stats-summary-box">
                                <div className="summary-item bg-indigo-light">
                                    <span className="summary-label">Tổng chi tiêu mua sắm</span>
                                    <span className="summary-value">{stats.totalPurchasedVND.toLocaleString('vi-VN')} đ</span>
                                </div>
                            </div>
                            <div className="detail-table-wrapper">
                                <table className="detail-table">
                                    <thead><tr><th>Mã GD</th><th>Sản phẩm</th><th>Thanh toán (VNĐ)</th><th>Trạng Thái</th><th className="text-right">Thời Gian</th></tr></thead>
                                    <tbody>
                                        {purchaseHistory.map((tx: any) => (
                                            <tr key={tx.id}>
                                                <td style={{fontFamily: 'monospace', fontSize: '0.9em', color: '#555'}}>
                                                     {tx.transactionCode || tx.orderId || `#${tx.id}`}
                                                </td>
                                                <td style={{fontWeight: 500}}>{tx.purchasedItem || tx.description || 'Đơn hàng'}</td>
                                                <td className="font-bold text-orange">-{Number(tx.amount).toLocaleString('vi-VN')} đ</td>
                                                <td><StatusBadge status={tx.status} /></td>
                                                <td className="text-right text-gray">{new Date(tx.createdAt).toLocaleString('vi-VN')}</td>
                                            </tr>
                                        ))}
                                        {purchaseHistory.length === 0 && <tr><td colSpan={5} className="empty-state">Chưa có đơn hàng nào</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'library' && (
                        <div>
                            <div className="stats-summary-box">
                                <div className="summary-item bg-orange-light">
                                    <span className="summary-label">Tổng xu đã tiêu</span>
                                    <span className="summary-value">{stats.totalSpentCoins.toLocaleString('vi-VN')} xu</span>
                                </div>
                            </div>
                            <div className="detail-table-wrapper">
                                <table className="detail-table">
                                    <thead><tr><th>Truyện</th><th>Chapter</th><th>Tiêu đề</th><th>Giá mở khóa</th><th className="text-right">Ngày mua</th></tr></thead>
                                    <tbody>
                                        {details.library?.map((lib: any, idx: number) => (
                                            <tr key={idx}>
                                                <td style={{fontWeight: 500}}>{lib.comicTitle}</td>
                                                <td><span className="status-tag active">Chap {lib.chapterNumber}</span></td>
                                                <td>{lib.title}</td>
                                                <td className="font-bold text-orange">{lib.price} xu</td>
                                                <td className="text-right text-gray">{new Date(lib.unlockedAt).toLocaleDateString('vi-VN')}</td>
                                            </tr>
                                        ))}
                                        {(!details.library || details.library.length === 0) && <tr><td colSpan={5} className="empty-state">Chưa mua chapter nào</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main UserManagement Component ---
const UserManagement: React.FC = () => {
    const { showNotification } = useNotification();
    const token = localStorage.getItem('storyverse_token');

    const [users, setUsers] = useState<AdminManagedUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<AdminManagedUser | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [viewDetailUserId, setViewDetailUserId] = useState<string | null>(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Không thể tải danh sách người dùng');
            const data: AdminManagedUser[] = await response.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
            showNotification(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const stats = useMemo(() => {
        const totalUsers = users.length;
        const bannedUsers = users.filter(u => u.isBanned).length;
        return { totalUsers, bannedUsers };
    }, [users]);

    const handleEditClick = (user: AdminManagedUser) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleViewDetailClick = (userId: string) => {
        setViewDetailUserId(userId);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleModalSave = (updatedUser: AdminManagedUser) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        handleModalClose();
    };

    const handleToggleBan = async (user: AdminManagedUser) => {
        const action = user.isBanned ? 'Bỏ cấm' : 'Cấm';
        if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản ${user.fullName} không?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${user.id}/ban`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isBanned: !user.isBanned })
            });
            if (!response.ok) throw new Error(`Thất bại khi ${action} tài khoản`);
            showNotification(`${action} tài khoản thành công!`, 'success');
            fetchUsers();
        } catch (error: any) {
            showNotification(error.message, 'error');
        }
    };

    const handleDelete = async (userId: string, fullName: string) => {
        if (!window.confirm(`HÀNH ĐỘNG NGUY HIỂM! Bạn có chắc muốn XÓA VĨNH VIỄN tài khoản ${fullName} không? Mọi dữ liệu sẽ bị mất.`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Xóa tài khoản thất bại');
            showNotification('Xóa tài khoản thành công!', 'success');
            
            setUsers(users.filter(u => u.id !== userId));
            if (viewDetailUserId === userId) {
                setViewDetailUserId(null);
            }
        } catch (error: any) {
            showNotification(error.message, 'error');
        }
    };

    const handleExportCSV = () => {
        const headers = ["ID", "Username", "Email", "Coins", "Level", "EXP", "IsBanned"];
        const csvRows = [headers.join(',')];

        filteredUsers.forEach(user => {
            const values = [
                user.id,
                `"${user.fullName}"`, 
                user.email,
                user.coinBalance,
                user.level,
                user.exp,
                user.isBanned,
            ];
            csvRows.push(values.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `storyverse_users_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Đã xuất báo cáo CSV!', 'success');
    };

    if (isLoading) return <p>Đang tải danh sách người dùng...</p>;
    if (error) return <p style={{ color: 'var(--clr-error-text)' }}>{error}</p>;

    return (
        <div className="user-management-container">
            <h2>Quản Lý Người Dùng</h2>
            <div className="user-stats">
                <div className="stat-card">
                    <h4>Tổng số tài khoản</h4>
                    <p>{stats.totalUsers}</p>
                </div>
                <div className="stat-card banned">
                    <h4>Đã cấm</h4>
                    <p>{stats.bannedUsers}</p>
                </div>
            </div>

            <div className="admin-filter-bar">
                <div className="filter-group search-bar">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="mgmt-btn chapters export-btn" onClick={handleExportCSV}>
                    <FiDownload /> Xuất Danh Sách
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Người dùng</th>
                            <th>Email</th>
                            <th>Xu</th>
                            <th>Level</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className={user.isBanned ? 'banned-row' : ''}>
                                <td title={user.id}>{user.id.substring(0, 8)}</td>
                                <td 
                                    onClick={() => handleViewDetailClick(user.id)} 
                                    className="user-link"
                                    title="Xem chi tiết"
                                >
                                    {user.fullName}
                                </td>
                                <td>{user.email}</td>
                                <td>{user.coinBalance}</td>
                                <td>{user.level}</td>
                                <td>
                                    {user.isBanned ? (
                                        <span className="status-tag banned"><FiSlash /> Bị cấm</span>
                                    ) : (
                                        <span className="status-tag active"><FiCheckCircle /> Hoạt động</span>
                                    )}
                                </td>
                                <td className="action-buttons">
                                    <button className="mgmt-btn chapters" onClick={() => handleViewDetailClick(user.id)} title="Xem chi tiết">
                                        <FiEye />
                                    </button>
                                    <button className="mgmt-btn edit" onClick={() => handleEditClick(user)} title="Sửa">
                                        <FiEdit />
                                    </button>
                                    <button
                                        className={`mgmt-btn ${user.isBanned ? 'chapters' : 'ban-btn'}`}
                                        onClick={() => handleToggleBan(user)}
                                        title={user.isBanned ? "Bỏ cấm" : "Cấm"}
                                    >
                                        {user.isBanned ? <FiCheckCircle /> : <FiSlash />}
                                    </button>
                                    <button className="mgmt-btn delete" onClick={() => handleDelete(user.id, user.fullName)} title="Xóa">
                                        <FiTrash2 />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {isModalOpen && selectedUser && (
                <UserEditModal
                    user={selectedUser}
                    onClose={handleModalClose}
                    onSave={handleModalSave}
                    token={token || ''}
                />
            )}

            {viewDetailUserId && token && (
                <UserDetailModal 
                    userId={viewDetailUserId}
                    onClose={() => setViewDetailUserId(null)}
                    token={token}
                />
            )}
        </div>
    );
};

export default UserManagement;