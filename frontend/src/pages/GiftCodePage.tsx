import React, { useState } from 'react';
import '../assets/styles/GiftCodePage.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const GiftCodePage: React.FC = () => {
	const [code, setCode] = useState('');
	const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const { currentUser, token, fetchUser } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!currentUser) {
			navigate('/login');
			return;
		}

		if (!code.trim()) return;

		setIsLoading(true);
		setStatus(null);

		try {
			const res = await fetch(`${API_URL}/giftcode/redeem`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ code: code.trim() }),
			});

			const data = await res.json();

			if (res.ok && data.success) {
				setStatus({ type: 'success', msg: data.message });
				setCode('');
				if (fetchUser) await fetchUser();
			} else {
				setStatus({ type: 'error', msg: data.message || 'Có lỗi xảy ra.' });
			}
		} catch (error) {
			setStatus({ type: 'error', msg: 'Lỗi kết nối server.' });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="gcp-wrapper">
			<div className="gcp-overlay"></div>
			<div className="gcp-card">
				<h1 className="gcp-title">Nhập Giftcode</h1>
				<form onSubmit={handleSubmit} className="gcp-form">
					<input
						type="text"
						className="gcp-input"
						placeholder="Nhập mã quà tặng..."
						value={code}
						onChange={(e) => setCode(e.target.value)}
						disabled={isLoading}
					/>
					<button type="submit" className="gcp-btn" disabled={isLoading || !code.trim()}>
						{isLoading ? 'Đang xử lý...' : 'Xác nhận'}
					</button>
				</form>
				{status && <div className={`gcp-alert gcp-alert-${status.type}`}>{status.msg}</div>}
			</div>
		</div>
	);
};

export default GiftCodePage;
