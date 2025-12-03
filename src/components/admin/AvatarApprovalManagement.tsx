import React, { useState, useEffect } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { useNotification } from '../../contexts/NotificationContext';
import '../../assets/styles/AvatarApprovalManagement.css';
import defaultAvatarImg from '../../assets/images/defaultAvatar.webp';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface PendingAvatarUser {
    id: number;
    fullName: string;
    email: string;
    avatarUrl: string; 
    pendingAvatarUrl: string; 
}

const getAvatarSrc = (url: string | null | undefined) => {
    if (!url || url === 'defaultAvatar.webp') return defaultAvatarImg;
    return url;
};

const AvatarApprovalManagement: React.FC = () => {
    const [pendingUsers, setPendingUsers] = useState<PendingAvatarUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showNotification } = useNotification();
    const token = localStorage.getItem('storyverse_token');

    useEffect(() => {
        fetchPendingAvatars();
    }, []);

    const fetchPendingAvatars = async () => {
        try {
            const res = await fetch(`${API_URL}/users/admin/avatars/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPendingUsers(data);
            }
        } catch (error) {
            console.error(error);
            showNotification('Lỗi tải danh sách avatar', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (userId: number) => {
        if (!window.confirm('Duyệt ảnh này?')) return;
        try {
            const res = await fetch(`${API_URL}/users/admin/avatars/${userId}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                showNotification('Đã duyệt avatar thành công', 'success');
                setPendingUsers(prev => prev.filter(u => u.id !== userId));
            } else {
                showNotification('Lỗi khi duyệt', 'error');
            }
        } catch (error) {
            showNotification('Lỗi kết nối', 'error');
        }
    };

    const handleReject = async (userId: number) => {
        if (!window.confirm('Từ chối ảnh này?')) return;
        try {
            const res = await fetch(`${API_URL}/users/admin/avatars/${userId}/reject`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                showNotification('Đã từ chối avatar', 'info');
                setPendingUsers(prev => prev.filter(u => u.id !== userId));
            } else {
                showNotification('Lỗi khi từ chối', 'error');
            }
        } catch (error) {
            showNotification('Lỗi kết nối', 'error');
        }
    };

    if (isLoading) return <div style={{padding: '20px', textAlign: 'center'}}>Đang tải danh sách...</div>;

    return (
        <div className="avatar-approval-container">
            <h2 className="avatar-approval-title">Xét Duyệt Ảnh Đại Diện ({pendingUsers.length})</h2>
            
            {pendingUsers.length === 0 ? (
                <p className="avatar-empty-state">Không có yêu cầu nào đang chờ.</p>
            ) : (
                <div className="avatar-table-container">
                    <table className="avatar-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Người dùng</th>
                                <th style={{textAlign: 'center'}}>Ảnh Hiện Tại</th>
                                <th style={{textAlign: 'center'}}>Ảnh Mới (Chờ duyệt)</th>
                                <th style={{textAlign: 'center'}}>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingUsers.map(user => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td>
                                        <div className="avatar-user-info">
                                            <strong>{user.fullName}</strong>
                                            <span>{user.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="avatar-cell">
                                            <img 
                                                src={getAvatarSrc(user.avatarUrl)} 
                                                alt="Current" 
                                                className="current-avatar-img"
                                            />
                                            <div className="avatar-label current">Hiện tại</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="avatar-cell">
                                            <img 
                                                src={user.pendingAvatarUrl} 
                                                alt="Pending" 
                                                className="pending-avatar-img"
                                                onClick={() => window.open(user.pendingAvatarUrl, '_blank')}
                                                title="Nhấn để xem ảnh gốc"
                                            />
                                            <div className="avatar-label new">Mới</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="avatar-actions">
                                            <button 
                                                className="btn-avatar-action btn-approve" 
                                                onClick={() => handleApprove(user.id)}
                                                title="Chấp thuận"
                                            >
                                                <FiCheck /> Duyệt
                                            </button>
                                            <button 
                                                className="btn-avatar-action btn-reject" 
                                                onClick={() => handleReject(user.id)}
                                                title="Từ chối"
                                            >
                                                <FiX /> Huỷ
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AvatarApprovalManagement;