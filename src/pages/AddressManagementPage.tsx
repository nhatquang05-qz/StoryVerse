import React, { useState, useEffect } from 'react';
import ProfileSidebar from '../components/common/ProfileSideBar';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import '../assets/styles/ProfilePage.css';
import { FiMapPin, FiTrash2, FiSave, FiEdit } from 'react-icons/fi';
import type { Address } from '../types/userTypes';

interface Province {
    code: number;
    name: string;
}

interface District {
    code: number;
    name: string;
    province_code: number;
}

interface Ward {
    code: number;
    name: string;
    district_code: number;
}

interface AddressFormProps {
    initialData?: Address | null; 
    onSave: (address: Address) => void;
    onCancel: () => void;
    isSaving: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ initialData, onSave, onCancel, isSaving }) => {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | ''>('');
    const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | ''>('');
    const [selectedWardCode, setSelectedWardCode] = useState<number | ''>('');
    const [specificAddress, setSpecificAddress] = useState('');

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch('https://provinces.open-api.vn/api/?depth=1');
                const data: Province[] = await response.json();
                setProvinces(data);

                if (initialData) {
                    const foundProvince = data.find(p => p.name === initialData.city);
                    if (foundProvince) {
                        setSelectedProvinceCode(foundProvince.code);
                    }
                    setSpecificAddress(initialData.specificAddress);
                }
            } catch (error) {
                console.error("Error fetching provinces:", error);
            }
        };
        fetchProvinces();
    }, [initialData]);

    useEffect(() => {
        if (selectedProvinceCode) {
            const fetchDistricts = async () => {
                try {
                    const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvinceCode}?depth=2`);
                    const data = await response.json();
                    setDistricts(data.districts);

                    if (initialData) {
                        const currentProvinceName = provinces.find(p => p.code === selectedProvinceCode)?.name;
                        if (currentProvinceName === initialData.city) {
                            const foundDistrict = data.districts.find((d: District) => d.name === initialData.district);
                            if (foundDistrict) setSelectedDistrictCode(foundDistrict.code);
                        } else {
                            setSelectedDistrictCode('');
                        }
                    } else {
                         setSelectedDistrictCode('');
                    }
                } catch (error) {
                    console.error("Error fetching districts:", error);
                }
            };
            fetchDistricts();
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [selectedProvinceCode, initialData, provinces]);

    useEffect(() => {
        if (selectedDistrictCode) {
            const fetchWards = async () => {
                try {
                    const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrictCode}?depth=2`);
                    const data = await response.json();
                    setWards(data.wards);

                    if (initialData) {
                         const currentDistrictName = districts.find(d => d.code === selectedDistrictCode)?.name;
                         if (currentDistrictName === initialData.district) {
                            const foundWard = data.wards.find((w: Ward) => w.name === initialData.ward);
                            if (foundWard) setSelectedWardCode(foundWard.code);
                         } else {
                            setSelectedWardCode('');
                         }
                    } else {
                        setSelectedWardCode('');
                    }
                } catch (error) {
                    console.error("Error fetching wards:", error);
                }
            };
            fetchWards();
        } else {
            setWards([]);
        }
    }, [selectedDistrictCode, initialData, districts]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const provinceName = provinces.find(p => p.code === Number(selectedProvinceCode))?.name || '';
        const districtName = districts.find(d => d.code === Number(selectedDistrictCode))?.name || '';
        const wardName = wards.find(w => w.code === Number(selectedWardCode))?.name || '';

        if (!specificAddress || !provinceName || !districtName || !wardName) {
            alert("Vui lòng điền đầy đủ thông tin địa chỉ.");
            return;
        }

        const addressToSave: Address = {
            id: initialData ? initialData.id : '', 
            isDefault: initialData ? initialData.isDefault : false,
            specificAddress: specificAddress,
            ward: wardName,
            district: districtName,
            city: provinceName
        };

        onSave(addressToSave);
    };

    return (
        <div className="profile-info-card" style={{ marginBottom: '2rem' }}>
            <h3>{initialData ? 'Cập Nhật Địa Chỉ' : 'Thêm Địa Chỉ Mới'}</h3>
            <form onSubmit={handleSubmit} className="auth-form" style={{ gap: '1rem' }}>
                <div className="form-group">
                    <label htmlFor="city">Tỉnh/Thành phố</label>
                    <select 
                        name="city" 
                        value={selectedProvinceCode} 
                        onChange={(e) => {
                            setSelectedProvinceCode(Number(e.target.value));
                            setSelectedDistrictCode('');
                            setSelectedWardCode('');
                        }} 
                        required
                        className="form-control"
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                        <option value="">-- Chọn Tỉnh/Thành phố --</option>
                        {provinces.map(p => (
                            <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="district">Quận/Huyện</label>
                    <select 
                        name="district" 
                        value={selectedDistrictCode} 
                        onChange={(e) => setSelectedDistrictCode(Number(e.target.value))} 
                        required
                        disabled={!selectedProvinceCode}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                        <option value="">-- Chọn Quận/Huyện --</option>
                        {districts.map(d => (
                            <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="ward">Phường/Xã</label>
                    <select 
                        name="ward" 
                        value={selectedWardCode} 
                        onChange={(e) => setSelectedWardCode(Number(e.target.value))} 
                        required
                        disabled={!selectedDistrictCode}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                        <option value="">-- Chọn Phường/Xã --</option>
                        {wards.map(w => (
                            <option key={w.code} value={w.code}>{w.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="specificAddress">Đường/Số nhà</label>
                    <input 
                        type="text" 
                        name="specificAddress" 
                        value={specificAddress} 
                        onChange={(e) => setSpecificAddress(e.target.value)} 
                        required 
                        placeholder="Ví dụ: 123 Đường ABC"
                    />
                </div>
                
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
    const { currentUser, updateAddresses, logout } = useAuth();
    const { showNotification } = useNotification();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);    
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentUser && currentUser.addresses) {
            setAddresses(currentUser.addresses);
        }
    }, [currentUser]);

    const handleSaveListToBackend = async (updatedAddresses: Address[]) => {
        setIsSaving(true);
        try {
            await updateAddresses(updatedAddresses);
            setAddresses(updatedAddresses);            
            setIsFormOpen(false);
            setEditingAddress(null);
            
            showNotification('Cập nhật địa chỉ thành công!', 'success');
        } catch (error) {
            console.error(error);
            showNotification('Cập nhật địa chỉ thất bại.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSaveAddress = (addrData: Address) => {
        let updatedList = [...addresses];

        if (addrData.id) {
            updatedList = updatedList.map(addr => 
                addr.id === addrData.id ? addrData : addr
            );
        } else {
            const newAddress: Address = {
                ...addrData,
                id: Date.now().toString(),
                isDefault: addresses.length === 0, 
            };
            updatedList.push(newAddress);
            
            if (addresses.length === 0) {
                updatedList[0].isDefault = true;
            }
        }
        
        updatedList.sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1));
        
        handleSaveListToBackend(updatedList);
    };
    
    const handleSetDefault = (id: string) => {
        const updated = addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id,
        }));
        updated.sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1));
        handleSaveListToBackend(updated);
    };
    
    const handleRemoveAddress = (id: string) => {
        if (addresses.length === 1) {
            showNotification('Không thể xóa địa chỉ cuối cùng.', 'warning');
            return;
        }
        if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;

        const removedIsDefault = addresses.find(a => a.id === id)?.isDefault;
        const updated = addresses.filter(addr => addr.id !== id);
        
        if (removedIsDefault && updated.length > 0) {
            updated[0] = { ...updated[0], isDefault: true };
        }
        
        handleSaveListToBackend(updated);
    };

    const handleEditClick = (addr: Address) => {
        setEditingAddress(addr);
        setIsFormOpen(true);
    };

    const handleAddNewClick = () => {
        setEditingAddress(null);
        setIsFormOpen(true);
    };

    const handleCancelForm = () => {
        setIsFormOpen(false);
        setEditingAddress(null);
    };

    if (!currentUser) {
         return <div className="profile-page-not-logged"><h2>Bạn cần đăng nhập để quản lý địa chỉ.</h2></div>;
    }

    return (
        <div className="profile-page-container">
            <ProfileSidebar onLogout={logout} />
            <div className="profile-content">
                <h1><FiMapPin style={{ marginRight: '0.5rem' }} /> Quản Lý Địa Chỉ Giao Hàng</h1>
                
                {isFormOpen && (
                    <AddressForm 
                        initialData={editingAddress} 
                        onSave={handleSaveAddress} 
                        onCancel={handleCancelForm} 
                        isSaving={isSaving} 
                    />
                )}
                
                {!isFormOpen && (
                    <button className="detail-order-btn" onClick={handleAddNewClick} style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiMapPin /> Thêm Địa Chỉ Mới
                    </button>
                )}

                {addresses.map(addr => (
                    <div key={addr.id} className={`profile-info-card ${addr.isDefault ? 'default-address-card' : ''}`} style={{ marginBottom: '1.5rem', border: addr.isDefault ? '2px solid var(--primary-color)' : '1px solid var(--border-color-light)' }}>
                        <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {addr.isDefault && <span className="status-badge status-completed" style={{ background: 'var(--primary-color)', color: 'var(--clr-text)' }}>Mặc Định</span>}
                            {!addr.isDefault && <span>Địa Chỉ Khác</span>}
                            
                            <button 
                                onClick={() => handleEditClick(addr)}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    color: 'var(--text-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <FiEdit /> Sửa
                            </button>
                        </h3>
                        <p style={{ marginTop: '0.5rem' }}>
                            <strong>Người nhận:</strong> {currentUser.fullName} - {currentUser.phone}
                        </p>
                        <p>
                            <strong>Địa chỉ:</strong> {addr.specificAddress}, {addr.ward}, {addr.district}, {addr.city}
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
                
                {addresses.length === 0 && !isFormOpen && <div className="empty-state">Bạn chưa có địa chỉ nào được lưu.</div>}
            </div>
        </div>
    );
};

export default AddressManagementPage;