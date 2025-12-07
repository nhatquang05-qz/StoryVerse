import React, { useState, useEffect } from 'react';
import {
    FiPlus,
    FiEdit,
    FiTrash2,
    FiCheck,
    FiX,
    FiGift,
    FiPackage,
    FiChevronDown,
    FiChevronRight,
    FiFolder,
    FiCode 
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import '../../assets/styles/PackManagement.css';
import GiftCodeManagement from './GiftCodeManagement'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const PackManagement: React.FC = () => {
    const { token } = useAuth();
    const { showNotification } = useNotification();

    const [activeTab, setActiveTab] = useState<'packs' | 'vouchers' | 'giftcode'>('packs');

    const [packs, setPacks] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState<any>(null);
    const [packFormData, setPackFormData] = useState({
        coins: 0,
        price: 0,
        bonus: 0,
        isActive: true,
    });

    const [vouchers, setVouchers] = useState<any[]>([]);
    const [isEditingVoucher, setIsEditingVoucher] = useState<any>(null);
    const [showEventVouchers, setShowEventVouchers] = useState(false);
    const [voucherFormData, setVoucherFormData] = useState({
        code: '',
        discountType: 'PERCENT',
        discountValue: 0,
        minOrderValue: 0,
        maxDiscountAmount: 0,
        startDate: '',
        endDate: '',
        usageLimit: 0,
        isActive: true,
    });

    useEffect(() => {
        if (activeTab === 'packs') {
            fetchPacks();
        } else if (activeTab === 'vouchers') {
            fetchVouchers();
        }
    }, [activeTab]);

    const fetchPacks = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/packs/admin`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setPacks(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchVouchers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/vouchers/admin`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setVouchers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const adminVouchers = vouchers.filter((v) => !v.code.startsWith('GIFT'));
    const minigameVouchers = vouchers.filter((v) => v.code.startsWith('GIFT'));

    const handlePackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = isEditing.id
                ? `${API_BASE_URL}/packs/${isEditing.id}`
                : `${API_BASE_URL}/packs`;
            const method = isEditing.id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(packFormData),
            });

            if (res.ok) {
                showNotification(
                    isEditing.id ? 'Cập nhật thành công' : 'Thêm mới thành công',
                    'success',
                );
                setIsEditing(null);
                fetchPacks();
            }
        } catch (error) {
            showNotification('Có lỗi xảy ra', 'error');
        }
    };

    const handleVoucherSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = isEditingVoucher.id
                ? `${API_BASE_URL}/vouchers/${isEditingVoucher.id}`
                : `${API_BASE_URL}/vouchers`;
            const method = isEditingVoucher.id ? 'PUT' : 'POST';

            const payload = {
                ...voucherFormData,
                startDate: voucherFormData.startDate || null,
                endDate: voucherFormData.endDate || null,
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                showNotification(
                    isEditingVoucher.id ? 'Cập nhật voucher thành công' : 'Thêm voucher thành công',
                    'success',
                );
                setIsEditingVoucher(null);
                fetchVouchers();
            } else {
                const err = await res.json();
                showNotification(err.message || 'Lỗi lưu voucher', 'error');
            }
        } catch (error) {
            showNotification('Có lỗi xảy ra', 'error');
        }
    };

    const handleDeletePack = async (id: number) => {
        if (!confirm('Bạn chắc chắn muốn xóa gói này?')) return;
        try {
            await fetch(`${API_BASE_URL}/packs/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            showNotification('Đã xóa', 'success');
            fetchPacks();
        } catch (error) {
            showNotification('Lỗi xóa', 'error');
        }
    };

    const handleDeleteVoucher = async (id: number) => {
        if (!confirm('Bạn chắc chắn muốn xóa voucher này?')) return;
        try {
            await fetch(`${API_BASE_URL}/vouchers/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            showNotification('Đã xóa voucher', 'success');
            fetchVouchers();
        } catch (error) {
            showNotification('Lỗi xóa', 'error');
        }
    };

    const openEditPack = (pack: any) => {
        setIsEditing(pack);
        setPackFormData({
            coins: pack.coins,
            price: pack.price,
            bonus: pack.bonus,
            isActive: pack.isActive === 1,
        });
    };

    const openAddPack = () => {
        setIsEditing({});
        setPackFormData({ coins: 0, price: 0, bonus: 0, isActive: true });
    };

    const openEditVoucher = (voucher: any) => {
        setIsEditingVoucher(voucher);
        setVoucherFormData({
            code: voucher.code,
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
            minOrderValue: voucher.minOrderValue,
            maxDiscountAmount: voucher.maxDiscountAmount,
            startDate: voucher.startDate
                ? new Date(voucher.startDate).toISOString().slice(0, 16)
                : '',
            endDate: voucher.endDate ? new Date(voucher.endDate).toISOString().slice(0, 16) : '',
            usageLimit: voucher.usageLimit,
            isActive: voucher.isActive === 1,
        });
    };

    const openAddVoucher = () => {
        setIsEditingVoucher({});
        setVoucherFormData({
            code: '',
            discountType: 'PERCENT',
            discountValue: 0,
            minOrderValue: 0,
            maxDiscountAmount: 0,
            startDate: '',
            endDate: '',
            usageLimit: 100,
            isActive: true,
        });
    };

    const renderVoucherTable = (list: any[], isMinigame = false) => (
        <div className="admin-table-container">
            <table className="admin-user-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Loại</th>
                        <th>Giá trị</th>
                        <th>Điều kiện</th>
                        <th>Hạn dùng</th>
                        <th>Lượt dùng</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {list.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="table-empty-message">
                                Không có dữ liệu
                            </td>
                        </tr>
                    ) : (
                        list.map((voucher) => (
                            <tr key={voucher.id}>
                                <td style={{ fontWeight: 'bold', color: '#3b82f6' }}>
                                    {voucher.code}
                                    {isMinigame && <span className="badge-minigame">Event</span>}
                                </td>
                                <td>
                                    {voucher.discountType === 'PERCENT' ? 'Phần trăm' : 'Cố định'}
                                </td>
                                <td style={{ color: '#eab308', fontWeight: 'bold' }}>
                                    {voucher.discountType === 'PERCENT'
                                        ? `${voucher.discountValue}%`
                                        : `${Number(voucher.discountValue).toLocaleString('vi-VN')}đ`}
                                </td>
                                <td style={{ fontSize: '0.85rem' }}>
                                    Min: {Number(voucher.minOrderValue).toLocaleString('vi-VN')}đ
                                    {voucher.maxDiscountAmount > 0 && (
                                        <>
                                            <br />
                                            {`Max giảm: ${Number(voucher.maxDiscountAmount).toLocaleString('vi-VN')}đ`}
                                        </>
                                    )}
                                </td>
                                <td style={{ fontSize: '0.85rem' }}>
                                    {voucher.startDate
                                        ? new Date(voucher.startDate).toLocaleDateString('vi-VN')
                                        : '...'}{' '}
                                    -
                                    {voucher.endDate
                                        ? new Date(voucher.endDate).toLocaleDateString('vi-VN')
                                        : '∞'}
                                </td>
                                <td>
                                    {voucher.usedCount} / {voucher.usageLimit || '∞'}
                                </td>
                                <td>
                                    {voucher.isActive ? (
                                        <span className="status-tag active">
                                            <FiCheck />
                                        </span>
                                    ) : (
                                        <span className="status-tag banned">
                                            <FiX />
                                        </span>
                                    )}
                                </td>
                                <td className="action-buttons">
                                    <button
                                        className="mgmt-btn edit"
                                        onClick={() => openEditVoucher(voucher)}
                                    >
                                        <FiEdit />
                                    </button>
                                    <button
                                        className="mgmt-btn delete"
                                        onClick={() => handleDeleteVoucher(voucher.id)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="admin-content-container">
            <div className="pack-mgmt-header">
                <h2>Quản lý Gói Nạp & Ưu đãi</h2>
            </div>

            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === 'packs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('packs')}
                >
                    <FiPackage /> Gói Nạp Xu
                </button>
                <button
                    className={`tab-btn ${activeTab === 'vouchers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('vouchers')}
                >
                    <FiGift /> Mã Giảm Giá
                </button>
                <button
                    className={`tab-btn ${activeTab === 'giftcode' ? 'active' : ''}`}
                    onClick={() => setActiveTab('giftcode')}
                >
                    <FiCode /> Giftcode (Quà tặng)
                </button>
            </div>

            {}
            {activeTab === 'packs' && (
                <div className="tab-content">
                    {!isEditing && (
                        <div className="action-bar">
                            <button className="mgmt-btn create-btn" onClick={openAddPack}>
                                <FiPlus /> Thêm Gói Mới
                            </button>
                        </div>
                    )}

                    {isEditing ? (
                        <div className="edit-form-wrapper">
                            <h3 className="form-title">
                                {isEditing.id ? 'Sửa Gói Nạp' : 'Thêm Gói Nạp'}
                            </h3>
                            <form onSubmit={handlePackSubmit} className="pack-form">
                                <div className="form-group">
                                    <label className="form-label">Số Xu nhận được:</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={packFormData.coins}
                                        onChange={(e) =>
                                            setPackFormData({
                                                ...packFormData,
                                                coins: Number(e.target.value),
                                            })
                                        }
                                        required
                                        placeholder="VD: 1000"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Giá tiền (VNĐ):</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={packFormData.price}
                                        onChange={(e) =>
                                            setPackFormData({
                                                ...packFormData,
                                                price: Number(e.target.value),
                                            })
                                        }
                                        required
                                        placeholder="VD: 20000"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Xu thưởng thêm (Bonus):</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={packFormData.bonus}
                                        onChange={(e) =>
                                            setPackFormData({
                                                ...packFormData,
                                                bonus: Number(e.target.value),
                                            })
                                        }
                                        placeholder="VD: 100"
                                    />
                                </div>
                                <label className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        className="checkbox-input"
                                        checked={packFormData.isActive}
                                        onChange={(e) =>
                                            setPackFormData({
                                                ...packFormData,
                                                isActive: e.target.checked,
                                            })
                                        }
                                    />
                                    <span className="checkbox-label">Đang hoạt động</span>
                                </label>
                                <div className="form-actions">
                                    <button type="submit" className="btn-action save-btn">
                                        Lưu
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-action cancel-btn"
                                        onClick={() => setIsEditing(null)}
                                    >
                                        Hủy
                                    </button>
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
                                    {packs.map((pack) => (
                                        <tr key={pack.id}>
                                            <td>{pack.id}</td>
                                            <td style={{ color: '#eab308', fontWeight: 'bold' }}>
                                                {pack.coins}
                                            </td>
                                            <td>{Number(pack.price).toLocaleString('vi-VN')} đ</td>
                                            <td style={{ color: '#10b981' }}>+{pack.bonus}</td>
                                            <td style={{ fontWeight: 'bold' }}>
                                                {pack.coins + pack.bonus} Xu
                                            </td>
                                            <td>
                                                {pack.isActive ? (
                                                    <span className="status-tag active">
                                                        <FiCheck /> Hiện
                                                    </span>
                                                ) : (
                                                    <span className="status-tag banned">
                                                        <FiX /> Ẩn
                                                    </span>
                                                )}
                                            </td>
                                            <td className="action-buttons">
                                                <button
                                                    className="mgmt-btn edit"
                                                    onClick={() => openEditPack(pack)}
                                                >
                                                    <FiEdit />
                                                </button>
                                                <button
                                                    className="mgmt-btn delete"
                                                    onClick={() => handleDeletePack(pack.id)}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'vouchers' && (
                <div className="tab-content">
                    {!isEditingVoucher && (
                        <div className="action-bar">
                            <button className="mgmt-btn create-btn" onClick={openAddVoucher}>
                                <FiPlus /> Tạo Voucher Mới
                            </button>
                        </div>
                    )}

                    {isEditingVoucher ? (
                        <div className="edit-form-wrapper wide-form">
                            <h3 className="form-title">
                                {isEditingVoucher.id ? 'Sửa Voucher' : 'Tạo Voucher Mới'}
                            </h3>
                            <form
                                onSubmit={handleVoucherSubmit}
                                className="pack-form voucher-form-grid"
                            >
                                <div className="form-group full-width">
                                    <label className="form-label">Mã Voucher:</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={voucherFormData.code}
                                        onChange={(e) =>
                                            setVoucherFormData({
                                                ...voucherFormData,
                                                code: e.target.value.toUpperCase(),
                                            })
                                        }
                                        required
                                        placeholder="VD: SALE50, TET2025"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Loại giảm giá:</label>
                                    <select
                                        className="form-input"
                                        value={voucherFormData.discountType}
                                        onChange={(e) =>
                                            setVoucherFormData({
                                                ...voucherFormData,
                                                discountType: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="PERCENT">Theo phần trăm (%)</option>
                                        <option value="FIXED">Số tiền cố định</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Giá trị giảm:</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={voucherFormData.discountValue}
                                        onChange={(e) =>
                                            setVoucherFormData({
                                                ...voucherFormData,
                                                discountValue: Number(e.target.value),
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Đơn tối thiểu:</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={voucherFormData.minOrderValue}
                                        onChange={(e) =>
                                            setVoucherFormData({
                                                ...voucherFormData,
                                                minOrderValue: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Giảm tối đa (Nếu là %):</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={voucherFormData.maxDiscountAmount}
                                        onChange={(e) =>
                                            setVoucherFormData({
                                                ...voucherFormData,
                                                maxDiscountAmount: Number(e.target.value),
                                            })
                                        }
                                        placeholder="0 = Không giới hạn"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ngày bắt đầu:</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={voucherFormData.startDate}
                                        onChange={(e) =>
                                            setVoucherFormData({
                                                ...voucherFormData,
                                                startDate: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ngày kết thúc:</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={voucherFormData.endDate}
                                        onChange={(e) =>
                                            setVoucherFormData({
                                                ...voucherFormData,
                                                endDate: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Giới hạn sử dụng (Tổng):</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={voucherFormData.usageLimit}
                                        onChange={(e) =>
                                            setVoucherFormData({
                                                ...voucherFormData,
                                                usageLimit: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="checkbox-group">
                                        <input
                                            type="checkbox"
                                            className="checkbox-input"
                                            checked={voucherFormData.isActive}
                                            onChange={(e) =>
                                                setVoucherFormData({
                                                    ...voucherFormData,
                                                    isActive: e.target.checked,
                                                })
                                            }
                                        />
                                        <span className="checkbox-label">
                                            Kích hoạt voucher này
                                        </span>
                                    </label>
                                </div>

                                <div className="form-actions full-width">
                                    <button type="submit" className="btn-action save-btn">
                                        Lưu Voucher
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-action cancel-btn"
                                        onClick={() => setIsEditingVoucher(null)}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <>
                            <h3 style={{ margin: '1rem 0 0.5rem', fontSize: '1.1rem' }}>
                                Voucher của bạn
                            </h3>
                            {renderVoucherTable(adminVouchers)}

                            <div className="voucher-folder-container">
                                <div
                                    className="voucher-folder-header"
                                    onClick={() => setShowEventVouchers(!showEventVouchers)}
                                >
                                    <div className="voucher-folder-content">
                                        <FiFolder
                                            size={20}
                                            color="#f59e0b"
                                            style={{ fill: '#fcd34d' }}
                                        />
                                        <span className="voucher-folder-title">
                                            ChristmasEvent2025 Vouchers
                                        </span>
                                        <span className="voucher-folder-count">
                                            {minigameVouchers.length} mã
                                        </span>
                                    </div>
                                    {showEventVouchers ? (
                                        <FiChevronDown size={20} color="#64748b" />
                                    ) : (
                                        <FiChevronRight size={20} color="#64748b" />
                                    )}
                                </div>

                                {showEventVouchers && (
                                    <div className="voucher-folder-body">
                                        {renderVoucherTable(minigameVouchers, true)}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'giftcode' && (
                <div className="tab-content">
                    <GiftCodeManagement />
                </div>
            )}
        </div>
    );
};

export default PackManagement;