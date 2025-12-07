import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiCopy, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import '../../assets/styles/PackManagement.css'; 

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface GiftCode {
    id: number;
    code: string;
    coinReward: number;
    expReward: number;
    voucherId: number | null;
    usageLimit: number;
    usedCount: number;
    expiryDate: string;
    isActive: number;
}

const GiftCodeManagement: React.FC = () => {
    const [giftCodes, setGiftCodes] = useState<GiftCode[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCode, setEditingCode] = useState<GiftCode | null>(null);
    const { token } = useAuth();
    const { showNotification } = useNotification();

    // Form states
    const [formData, setFormData] = useState({
        code: '',
        coinReward: 0,
        expReward: 0,
        voucherId: '',
        usageLimit: 100,
        expiryDate: '',
        isActive: 1
    });

    useEffect(() => {
        fetchGiftCodes();
    }, []);

    const fetchGiftCodes = async () => {
        try {
            const res = await fetch(`${API_URL}/giftcode`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setGiftCodes(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa mã này?')) return;
        try {
            await fetch(`${API_URL}/giftcode/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('Đã xóa giftcode', 'success');
            fetchGiftCodes();
        } catch (err) {
            showNotification('Lỗi khi xóa', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingCode ? `${API_URL}/giftcode/${editingCode.id}` : `${API_URL}/giftcode`;
        const method = editingCode ? 'PUT' : 'POST';

        const payload = {
            ...formData,
            voucherId: formData.voucherId ? parseInt(formData.voucherId) : null
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showNotification(editingCode ? 'Cập nhật thành công' : 'Tạo mã thành công', 'success');
                setIsModalOpen(false);
                setEditingCode(null);
                resetForm();
                fetchGiftCodes();
            } else {
                showNotification('Có lỗi xảy ra (Có thể trùng mã)', 'error');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openEdit = (code: GiftCode) => {
        setEditingCode(code);
        setFormData({
            code: code.code,
            coinReward: code.coinReward,
            expReward: code.expReward,
            voucherId: code.voucherId ? code.voucherId.toString() : '',
            usageLimit: code.usageLimit,
            expiryDate: code.expiryDate ? new Date(code.expiryDate).toISOString().slice(0, 16) : '',
            isActive: code.isActive
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            code: '',
            coinReward: 0,
            expReward: 0,
            voucherId: '',
            usageLimit: 100,
            expiryDate: '',
            isActive: 1
        });
    };

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, code: 'SV-' + result });
    };

    return (
        <div className="tab-content">
            {/* Action Bar giống PackManagement */}
            <div className="action-bar">
                <button 
                    className="mgmt-btn create-btn" 
                    onClick={() => { setEditingCode(null); resetForm(); setIsModalOpen(true); }}
                >
                    <FiPlus /> Thêm Giftcode Mới
                </button>
            </div>

            {/* Table Container */}
            <div className="admin-table-container">
                <table className="admin-user-table">
                    <thead>
                        <tr>
                            <th>Mã Code</th>
                            <th>Thưởng</th>
                            <th>Voucher ID</th>
                            <th>Lượt dùng</th>
                            <th>Hết hạn</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {giftCodes.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="table-empty-message">Chưa có giftcode nào</td>
                            </tr>
                        ) : (
                            giftCodes.map(gc => (
                                <tr key={gc.id}>
                                    <td style={{fontWeight: 'bold', color: '#3b82f6', fontFamily: 'monospace'}}>
                                        {gc.code}
                                    </td>
                                    <td>
                                        {gc.coinReward > 0 && <div style={{color: '#eab308'}}>+{gc.coinReward} Xu</div>}
                                        {gc.expReward > 0 && <div style={{color: '#10b981'}}>+{gc.expReward} EXP</div>}
                                        {gc.coinReward === 0 && gc.expReward === 0 && <span style={{color:'#999'}}>-</span>}
                                    </td>
                                    <td>{gc.voucherId || '-'}</td>
                                    <td>{gc.usedCount} / {gc.usageLimit}</td>
                                    <td style={{fontSize: '0.9rem'}}>
                                        {gc.expiryDate ? new Date(gc.expiryDate).toLocaleDateString('vi-VN') : 'Vĩnh viễn'}
                                    </td>
                                    <td>
                                        {gc.isActive ? (
                                            <span className="status-tag active">
                                                <FiCheck /> Hoạt động
                                            </span>
                                        ) : (
                                            <span className="status-tag banned">
                                                <FiX /> Khóa
                                            </span>
                                        )}
                                    </td>
                                    <td className="action-buttons">
                                        <button className="mgmt-btn edit" onClick={() => openEdit(gc)}>
                                            <FiEdit />
                                        </button>
                                        <button className="mgmt-btn delete" onClick={() => handleDelete(gc.id)}>
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form - Tái sử dụng style của edit-form-wrapper */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="edit-form-wrapper" style={{maxWidth: '600px', margin: '5% auto', maxHeight: '90vh', overflowY: 'auto'}}>
                        <h3 className="form-title">{editingCode ? 'Sửa Giftcode' : 'Thêm Giftcode'}</h3>
                        <form onSubmit={handleSubmit} className="pack-form">
                            <div className="form-group">
                                <label className="form-label">Mã Code:</label>
                                <div style={{display: 'flex', gap: '10px'}}>
                                    <input 
                                        type="text" 
                                        className="form-input"
                                        placeholder="VD: TET2025" 
                                        value={formData.code} 
                                        onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                        required 
                                        style={{flex: 1}}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={generateRandomCode} 
                                        className="btn-action" 
                                        style={{background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', padding: '0 15px', cursor: 'pointer'}}
                                        title="Tạo mã ngẫu nhiên"
                                    >
                                        <FiCopy/> Random
                                    </button>
                                </div>
                            </div>
                            
                            <div className="form-row" style={{display: 'flex', gap: '15px'}}>
                                <div className="form-group" style={{flex: 1}}>
                                    <label className="form-label">Thưởng Xu:</label>
                                    <input 
                                        type="number" 
                                        className="form-input"
                                        value={formData.coinReward} 
                                        onChange={e => setFormData({...formData, coinReward: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="form-group" style={{flex: 1}}>
                                    <label className="form-label">Thưởng EXP:</label>
                                    <input 
                                        type="number" 
                                        className="form-input"
                                        value={formData.expReward} 
                                        onChange={e => setFormData({...formData, expReward: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Voucher ID (Tùy chọn):</label>
                                <input 
                                    type="number" 
                                    className="form-input"
                                    placeholder="Nhập ID Voucher nếu có" 
                                    value={formData.voucherId} 
                                    onChange={e => setFormData({...formData, voucherId: e.target.value})}
                                />
                                <small style={{color: '#888', display:'block', marginTop:'5px'}}>* Mỗi user chỉ nhận voucher này 1 lần duy nhất.</small>
                            </div>

                            <div className="form-row" style={{display: 'flex', gap: '15px'}}>
                                <div className="form-group" style={{flex: 1}}>
                                    <label className="form-label">Giới hạn lượt dùng:</label>
                                    <input 
                                        type="number" 
                                        className="form-input"
                                        value={formData.usageLimit} 
                                        onChange={e => setFormData({...formData, usageLimit: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="form-group" style={{flex: 1}}>
                                    <label className="form-label">Ngày hết hạn:</label>
                                    <input 
                                        type="datetime-local" 
                                        className="form-input"
                                        value={formData.expiryDate} 
                                        onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        className="checkbox-input"
                                        checked={formData.isActive === 1}
                                        onChange={(e) => setFormData({...formData, isActive: e.target.checked ? 1 : 0})}
                                    />
                                    <span className="checkbox-label">Đang hoạt động</span>
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-action save-btn">Lưu</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-action cancel-btn">Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GiftCodeManagement;