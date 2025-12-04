import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface AdminManagedUser {
	id: string;
	fullName: string;
	email: string;
	coinBalance: number;
	level: number;
	exp: number;
	isBanned: boolean;
}

interface UserEditModalProps {
	user: AdminManagedUser;
	onClose: () => void;
	onSave: (updatedUser: AdminManagedUser) => void;
	token: string;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onSave, token }) => {
	const [formData, setFormData] = useState(user);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { showNotification } = useNotification();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'number' ? Number(value) : value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					coinBalance: formData.coinBalance,
					level: formData.level,
					exp: formData.exp,
				}),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.error || 'Cập nhật thất bại');
			showNotification('Cập nhật người dùng thành công!', 'success');
			onSave(formData);
		} catch (error: any) {
			showNotification(`Lỗi cập nhật: ${error.message}`, 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="user-edit-modal-overlay" onClick={onClose}>
			<div className="user-edit-modal-content" onClick={(e) => e.stopPropagation()}>
				<form onSubmit={handleSubmit}>
					<h2>Sửa Người Dùng: {user.fullName}</h2>
					<button type="button" className="modal-close-btn" onClick={onClose}>
						<FiX />
					</button>
					<div className="form-group">
						<label>Email (Không thể sửa):</label>
						<input type="email" value={formData.email} disabled />
					</div>
					<div className="form-group">
						<label>Số Xu:</label>
						<input
							type="number"
							name="coinBalance"
							value={formData.coinBalance}
							onChange={handleChange}
						/>
					</div>
					<div className="form-group">
						<label>Cấp độ (Level):</label>
						<input
							type="number"
							name="level"
							value={formData.level}
							onChange={handleChange}
						/>
					</div>
					<div className="form-group">
						<label>Kinh nghiệm (EXP):</label>
						<input
							type="number"
							name="exp"
							value={formData.exp}
							onChange={handleChange}
						/>
					</div>
					<div className="form-actions">
						<button
							type="button"
							className="mgmt-btn"
							onClick={onClose}
							disabled={isSubmitting}
						>
							Hủy
						</button>
						<button type="submit" className="mgmt-btn edit" disabled={isSubmitting}>
							{isSubmitting ? <FiLoader className="animate-spin" /> : <FiSave />}
							Lưu
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default UserEditModal;
