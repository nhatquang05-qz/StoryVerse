import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import '../assets/styles/AuthPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ForgotPasswordPage: React.FC = () => {
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const { showNotification } = useNotification();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setMessage('');
		setIsLoading(true);

		try {
			const response = await fetch(`${API_URL}/auth/forgot-password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Đã xảy ra lỗi. Vui lòng thử lại.');
			}

			setMessage(data.message);
			showNotification(data.message, 'success');
			setEmail('');
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi.';
			setError(errorMessage);
			showNotification(errorMessage, 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-container">
				<h2>Quên Mật Khẩu</h2>
				<p className="auth-subtext">
					Nhập email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
				</p>
				<form onSubmit={handleSubmit} className="auth-form">
					{error && <p className="auth-error">{error}</p>}
					{message && <p className="auth-success">{message}</p>}
					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							placeholder="Nhập email của bạn"
							disabled={isLoading}
						/>
					</div>
					<button type="submit" className="auth-button" disabled={isLoading}>
						{isLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
					</button>
				</form>
				<p className="auth-switch">
					Nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
				</p>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
