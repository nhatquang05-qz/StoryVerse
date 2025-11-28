import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import '../../assets/styles/PackManagement.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const PackManagement: React.FC = () => {
    const { token } = useAuth();
    const { showNotification } = useNotification();
    const [packs, setPacks] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState<any>(null);
    
    const [formData, setFormData] = useState({ coins: 0, price: 0, bonus: 0, isActive: true });

    useEffect(() => {
        fetchPacks();
    }, []);

    const fetchPacks = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/packs/admin`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setPacks(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = isEditing.id ? `${API_BASE_URL}/packs/${isEditing.id}` : `${API_BASE_URL}/packs`;
            const method = isEditing.id ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                showNotification(isEditing.id ? 'Cập nhật thành công' : 'Thêm mới thành công', 'success');
                setIsEditing(null);
                fetchPacks();
            }
        } catch (error) {
            showNotification('Có lỗi xảy ra', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn chắc chắn muốn xóa gói này?')) return;
        try {
            await fetch(`${API_BASE_URL}/packs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification('Đã xóa', 'success');
            fetchPacks();
        } catch (error) {
            showNotification('Lỗi xóa', 'error');
        }
    };

    const openEdit = (pack: any) => {
        setIsEditing(pack);
        setFormData({ coins: pack.coins, price: pack.price, bonus: pack.bonus, isActive: pack.isActive === 1 });
    };

    const openAdd = () => {
        setIsEditing({});
        setFormData({ coins: 0, price: 0, bonus: 0, isActive: true });
    };

    return (
        <div className="admin-content-container">
            <div className="pack-mgmt-header">
                <h2>Quản lý Gói Nạp & Ưu đãi</h2>
                {!isEditing && (
                    <button className="mgmt-btn create-btn" onClick={openAdd}>
                        <FiPlus /> Thêm Gói Mới
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="edit-form-wrapper">
                    <h3 className="form-title">{isEditing.id ? 'Sửa Gói Nạp' : 'Thêm Gói Nạp'}</h3>
                    
                    <form onSubmit={handleSubmit} className="pack-form">
                        <div className="form-group">
                            <label className="form-label">Số Xu nhận được:</label>
                            <input 
                                type="number" 
                                className="form-input"
                                value={formData.coins} 
                                onChange={e => setFormData({...formData, coins: Number(e.target.value)})} 
                                required 
                                placeholder="VD: 1000"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Giá tiền (VNĐ):</label>
                            <input 
                                type="number" 
                                className="form-input"
                                value={formData.price} 
                                onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                                required 
                                placeholder="VD: 20000"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Xu thưởng thêm (Bonus):</label>
                            <input 
                                type="number" 
                                className="form-input"
                                value={formData.bonus} 
                                onChange={e => setFormData({...formData, bonus: Number(e.target.value)})} 
                                placeholder="VD: 100"
                            />
                        </div>
                        
                        <label className="checkbox-group">
                            <input 
                                type="checkbox" 
                                className="checkbox-input"
                                checked={formData.isActive} 
                                onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                            />
                            <span className="checkbox-label">
                                Đang hoạt động (Hiển thị cho user)
                            </span>
                        </label>
                        
                        <div className="form-actions">
                            <button type="submit" className="btn-action save-btn">Lưu</button>
                            <button type="button" className="btn-action cancel-btn" onClick={() => setIsEditing(null)}>Hủy</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-user-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Số Xu</th>
                                <th>Giá (VNĐ)</th>
                                <th>Bonus</th>
                                <th>Tổng nhận</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packs.map(pack => (
                                <tr key={pack.id}>
                                    <td>{pack.id}</td>
                                    <td style={{color:'#eab308', fontWeight:'bold'}}>{pack.coins}</td>
                                    <td>{Number(pack.price).toLocaleString('vi-VN')} đ</td>
                                    <td style={{color:'#10b981'}}>+{pack.bonus}</td>
                                    <td style={{fontWeight:'bold'}}>{pack.coins + pack.bonus} Xu</td>
                                    <td>
                                        {pack.isActive ? 
                                            <span className="status-tag active"><FiCheck /> Hiện</span> : 
                                            <span className="status-tag banned"><FiX /> Ẩn</span>
                                        }
                                    </td>
                                    <td className="action-buttons">
                                        <button className="mgmt-btn edit" onClick={() => openEdit(pack)}><FiEdit /></button>
                                        <button className="mgmt-btn delete" onClick={() => handleDelete(pack.id)}><FiTrash2 /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <div className="voucher-section-placeholder">
                <h4>Tính năng Quản lý Voucher</h4>
                <p>Khu vực này sẽ được phát triển để quản lý mã giảm giá trong bảng `vouchers`.</p>
            </div>
        </div>
    );
};

export default PackManagement;