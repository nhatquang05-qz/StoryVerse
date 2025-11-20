import React, { useState, useEffect, useMemo } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { FiSearch, FiSlash, FiCheckCircle, FiDownload, FiEdit, FiTrash2 } from 'react-icons/fi';
import UserEditModal, { type AdminManagedUser } from './UserEditModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const UserManagement: React.FC = () => {
    const { showNotification } = useNotification();
    const token = localStorage.getItem('storyverse_token');

    const [users, setUsers] = useState<AdminManagedUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<AdminManagedUser | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            fetchUsers();
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
                    <FiDownload /> Xuất Báo Cáo
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
                                <td title={user.id}>{user.id.substring(0, 8)}...</td>
                                <td>{user.fullName}</td>
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
                                    <button className="mgmt-btn edit" onClick={() => handleEditClick(user)}><FiEdit /></button>
                                    <button
                                        className={`mgmt-btn ${user.isBanned ? 'chapters' : 'ban-btn'}`}
                                        onClick={() => handleToggleBan(user)}
                                    >
                                        {user.isBanned ? <FiCheckCircle /> : <FiSlash />}
                                    </button>
                                    <button className="mgmt-btn delete" onClick={() => handleDelete(user.id, user.fullName)}><FiTrash2 /></button>
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
        </div>
    );
};

export default UserManagement;