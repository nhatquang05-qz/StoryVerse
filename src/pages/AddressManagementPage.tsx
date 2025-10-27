import React, { useState, useEffect } from 'react';
import ProfileSidebar from '../components/common/ProfileSideBar';
import { useAuth, type Address } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import '../pages/profile/ProfilePage.css';
import { FiMapPin, FiTrash2, FiSave } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';

const NewAddressForm: React.FC<{ onSave: (address: Omit<Address, 'id' | 'isDefault'>) => void, onCancel: () => void, isSaving: boolean }> = ({ onSave, onCancel, isSaving }) => {
    const [formData, setFormData] = useState({ street: '', ward: '', district: '', city: '' });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="profile-info-card" style={{ marginBottom: '2rem' }}>
            <h3>Thêm Địa Chỉ Mới</h3>
            <form onSubmit={handleSubmit} className="auth-form" style={{ gap: '1rem' }}>
                <div className="form-group"><label htmlFor="street">Đường/Số nhà</label><input type="text" name="street" value={formData.street} onChange={handleChange} required /></div>
                <div className="form-group"><label htmlFor="ward">Phường/Xã</label><input type="text" name="ward" value={formData.ward} onChange={handleChange} required /></div>
                <div className="form-group"><label htmlFor="district">Quận/Huyện</label><input type="text" name="district" value={formData.district} onChange={handleChange} required /></div>
                <div className="form-group"><label htmlFor="city">Tỉnh/Thành phố</label><input type="text" name="city" value={formData.city} onChange={handleChange} required /></div>
                
                <div className="profile-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="save-btn" disabled={isSaving}>
                        <FiSave style={{ marginRight: '0.5rem' }} /> {isSaving ? 'Đang lưu...' : 'Lưu Địa Chỉ'}
                    </button>
                    <button type="button" className="cancel-btn" onClick={onCancel} disabled={isSaving}>Hủy</button>
                </div>
            </form>
        </div>
    );
};

const AddressManagementPage: React.FC = () => {
    const { currentUser, updateAddresses } = useAuth();
    const { showNotification } = useNotification();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchParams] = useSearchParams();
    const activeLink = searchParams.get('checkout') === 'true' ? '/checkout' : '/addresses';

    useEffect(() => {
        if (currentUser && currentUser.addresses) {
            setAddresses(currentUser.addresses);
        }
    }, [currentUser]);

    const handleSaveAddresses = async (updatedAddresses: Address[]) => {
        setIsSaving(true);
        try {
            await updateAddresses(updatedAddresses);
            setAddresses(updatedAddresses);
            setIsAdding(false);
        } catch (error) {
            showNotification('Cập nhật địa chỉ thất bại.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSetDefault = (id: string) => {
        const updated = addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id,
        }));
        updated.sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1));
        handleSaveAddresses(updated);
    };
    
    const handleAddAddress = (newAddrData: Omit<Address, 'id' | 'isDefault'>) => {
        const newAddress: Address = {
            ...newAddrData,
            id: Date.now().toString(),
            isDefault: addresses.length === 0,
        };
        
        const updated = addresses.map(a => ({ ...a, isDefault: false }));
        updated.push(newAddress);
        
        if (addresses.length === 0) {
            updated[0].isDefault = true;
        }
        
        updated.sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1));
        handleSaveAddresses(updated);
    };
    
    const handleRemoveAddress = (id: string) => {
        if (addresses.length === 1) {
            showNotification('Không thể xóa địa chỉ cuối cùng.', 'warning');
            return;
        }
        const removedIsDefault = addresses.find(a => a.id === id)?.isDefault;
        const updated = addresses.filter(addr => addr.id !== id);
        
        if (removedIsDefault && updated.length > 0) {
            updated[0] = { ...updated[0], isDefault: true };
        }
        
        handleSaveAddresses(updated);
    };


    if (!currentUser) {
         return <div className="profile-page-not-logged"><h2>Bạn cần đăng nhập để quản lý địa chỉ.</h2></div>;
    }

    return (
        <div className="profile-page-container">
            <ProfileSidebar activeLink={activeLink} />
            <div className="profile-content">
                <h1><FiMapPin style={{ marginRight: '0.5rem' }} /> Quản Lý Địa Chỉ Giao Hàng</h1>
                
                {isAdding && <NewAddressForm onSave={handleAddAddress} onCancel={() => setIsAdding(false)} isSaving={isSaving} />}
                
                {!isAdding && (
                    <button className="detail-order-btn" onClick={() => setIsAdding(true)} style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiMapPin /> Thêm Địa Chỉ Mới
                    </button>
                )}

                {addresses.map(addr => (
                    <div key={addr.id} className={`profile-info-card ${addr.isDefault ? 'default-address-card' : ''}`} style={{ marginBottom: '1.5rem', border: addr.isDefault ? '2px solid var(--primary-color)' : '1px solid var(--border-color-light)' }}>
                        <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {addr.isDefault && <span className="status-badge status-completed" style={{ background: 'var(--primary-color)', color: 'var(--clr-text)' }}>Mặc Định</span>}
                            {!addr.isDefault && <span>Địa Chỉ Khác</span>}
                        </h3>
                        <p style={{ marginTop: '0.5rem' }}>
                            <strong>Người nhận:</strong> {currentUser.fullName} - {currentUser.phone}
                        </p>
                        <p>
                            <strong>Địa chỉ:</strong> {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                        </p>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                            {!addr.isDefault && (
                                <button className="detail-order-btn" onClick={() => handleSetDefault(addr.id)} style={{ padding: '0.5rem 1rem' }}>
                                    Đặt làm Mặc định
                                </button>
                            )}
                            <button className="cancel-btn" onClick={() => handleRemoveAddress(addr.id)} disabled={addresses.length === 1} style={{ background: '#e63946', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '5px' }}>
                                <FiTrash2 style={{ marginRight: '0.5rem' }} /> Xóa
                            </button>
                        </div>
                    </div>
                ))}
                
                {addresses.length === 0 && <div className="empty-state">Bạn chưa có địa chỉ nào được lưu.</div>}
            </div>
        </div>
    );
};

export default AddressManagementPage;