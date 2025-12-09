import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { FiLock, FiKey, FiMail, FiCheck } from 'react-icons/fi';
import '../../assets/styles/ChangePasswordTab.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const ChangePasswordTab: React.FC = () => {
	const { token } = useAuth();
	const { showToast } = useToast();
	const [mode, setMode] = useState<'STANDARD' | 'OTP'>('STANDARD');

	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const [otpStep, setOtpStep] = useState<1 | 2>(1);
	const [otpCode, setOtpCode] = useState('');
	const [otpNewPass, setOtpNewPass] = useState('');
	const [otpConfirmPass, setOtpConfirmPass] = useState('');
	const [isSendingOtp, setIsSendingOtp] = useState(false);

	const handleStandardChange = async (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			showToast('Mật khẩu nhập lại không khớp.', 'error');
			return;
		}
		if (oldPassword === newPassword) {
			showToast('Mật khẩu mới không được trùng mật khẩu cũ.', 'error');
			return;
		}

		try {
			const res = await fetch(`${API_URL}/auth/change-password`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ oldPassword, newPassword }),
			});
			const data = await res.json();
			if (res.ok) {
				showToast(data.message, 'success');
				setOldPassword('');
				setNewPassword('');
				setConfirmPassword('');
			} else {
				showToast(data.error, 'error');
			}
		} catch (err) {
			showToast('Lỗi kết nối server.', 'error');
		}
	};

	const handleSendOtp = async () => {
		setIsSendingOtp(true);
		try {
			const res = await fetch(`${API_URL}/auth/send-otp-logged-in`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			if (res.ok) {
				showToast(data.message, 'success');
				setOtpStep(2);
			} else {
				showToast(data.error, 'error');
			}
		} catch (err) {
			showToast('Lỗi gửi OTP.', 'error');
		} finally {
			setIsSendingOtp(false);
		}
	};

	const handleResetWithOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		if (otpNewPass !== otpConfirmPass) {
			showToast('Mật khẩu nhập lại không khớp.', 'error');
			return;
		}

		try {
			const res = await fetch(`${API_URL}/auth/reset-password-otp`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ otp: otpCode, newPassword: otpNewPass }),
			});
			const data = await res.json();
			if (res.ok) {
				showToast(data.message, 'success');

				setMode('STANDARD');
				setOtpStep(1);
				setOtpCode('');
				setOtpNewPass('');
				setOtpConfirmPass('');
			} else {
				showToast(data.error, 'error');
			}
		} catch (err) {
			showToast('Lỗi kết nối server.', 'error');
		}
	};

	return (
		<div className="change-pass-container">
			<h2 className="cp-title">Đổi Mật Khẩu & Bảo Mật</h2>

			<div className="cp-tabs-internal">
				<button
					className={`cp-tab-btn ${mode === 'STANDARD' ? 'active' : ''}`}
					onClick={() => setMode('STANDARD')}
				>
					Đổi mật khẩu
				</button>
				<button
					className={`cp-tab-btn ${mode === 'OTP' ? 'active' : ''}`}
					onClick={() => setMode('OTP')}
				>
					Quên mật khẩu cũ?
				</button>
			</div>

			<div className="cp-content">
				{mode === 'STANDARD' ? (
					<form onSubmit={handleStandardChange} className="cp-form">
						<div className="form-group">
							<label>Mật khẩu cũ</label>
							<div className="input-wrapper">
								<FiKey className="prefix-icon" />
								<input
									type="password"
									value={oldPassword}
									onChange={(e) => setOldPassword(e.target.value)}
									placeholder="Nhập mật khẩu hiện tại"
									required
								/>
							</div>
						</div>
						<div className="form-group">
							<label>Mật khẩu mới</label>
							<div className="input-wrapper">
								<FiLock className="prefix-icon" />
								<input
									type="password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									placeholder="Nhập mật khẩu mới"
									required
								/>
							</div>
						</div>
						<div className="form-group">
							<label>Nhập lại mật khẩu mới</label>
							<div className="input-wrapper">
								<FiCheck className="prefix-icon" />
								<input
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="Xác nhận mật khẩu mới"
									required
								/>
							</div>
						</div>
						<button type="submit" className="cp-submit-btn">
							Cập nhật mật khẩu
						</button>
					</form>
				) : (
					<div className="cp-otp-flow">
						{otpStep === 1 && (
							<div className="otp-step-1">
								<p className="otp-desc">
									Chúng tôi sẽ gửi một mã xác thực (OTP) đến email đăng ký của bạn
									để xác minh danh tính.
								</p>
								<button
									onClick={handleSendOtp}
									className="cp-send-otp-btn"
									disabled={isSendingOtp}
								>
									{isSendingOtp ? 'Đang gửi...' : 'Gửi mã OTP đến Email'}
								</button>
							</div>
						)}

						{otpStep === 2 && (
							<form onSubmit={handleResetWithOtp} className="cp-form">
								<p className="otp-sent-msg">
									Mã OTP đã được gửi. Vui lòng kiểm tra email.
								</p>
								<div className="form-group">
									<label>Mã OTP</label>
									<div className="input-wrapper">
										<FiMail className="prefix-icon" />
										<input
											type="text"
											value={otpCode}
											onChange={(e) => setOtpCode(e.target.value)}
											placeholder="Nhập mã 6 số"
											required
										/>
									</div>
								</div>
								<div className="form-group">
									<label>Mật khẩu mới</label>
									<div className="input-wrapper">
										<FiLock className="prefix-icon" />
										<input
											type="password"
											value={otpNewPass}
											onChange={(e) => setOtpNewPass(e.target.value)}
											placeholder="Nhập mật khẩu mới"
											required
										/>
									</div>
								</div>
								<div className="form-group">
									<label>Nhập lại mật khẩu mới</label>
									<div className="input-wrapper">
										<FiCheck className="prefix-icon" />
										<input
											type="password"
											value={otpConfirmPass}
											onChange={(e) => setOtpConfirmPass(e.target.value)}
											placeholder="Xác nhận mật khẩu mới"
											required
										/>
									</div>
								</div>
								<div className="btn-group">
									<button
										type="button"
										className="cp-back-btn"
										onClick={() => setOtpStep(1)}
									>
										Quay lại
									</button>
									<button type="submit" className="cp-submit-btn">
										Đổi mật khẩu
									</button>
								</div>
							</form>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ChangePasswordTab;
