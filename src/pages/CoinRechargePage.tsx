import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { History, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import coinImg from '../assets/images/coin.avif';
import '../assets/styles/AuthPage.css';
import '../assets/styles/CoinRechargePage.css';
import '../assets/styles/TransactionHistory.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface RechargePack {
	id: number;
	coins: number;
	price: number;
	bonus: number;
}

interface Transaction {
	id: number;
	orderId: string;
	transactionCode?: string;
	amount: number;
	status: string;
	type: 'RECHARGE' | 'PURCHASE';
	description: string;
	createdAt: string;
}

const CoinRechargePage: React.FC = () => {
	const { currentUser, token } = useAuth();
	const { showNotification } = useNotification();
	const [isProcessing, setIsProcessing] = useState(false);
	const [selectedPack, setSelectedPack] = useState<number | null>(null);
	const [showHistory, setShowHistory] = useState(false);

	const [rechargePacks, setRechargePacks] = useState<RechargePack[]>([]);
	const [isLoadingPacks, setIsLoadingPacks] = useState(true);

	const [history, setHistory] = useState<Transaction[]>([]);
	const [loadingHistory, setLoadingHistory] = useState(false);

	useEffect(() => {
		const fetchPacks = async () => {
			try {
				const response = await fetch(`${API_URL}/packs/public`);
				if (response.ok) {
					const data = await response.json();
					setRechargePacks(data);
				}
			} catch (error) {
				console.error('Failed to fetch packs', error);
			} finally {
				setIsLoadingPacks(false);
			}
		};

		fetchPacks();
	}, []);

	useEffect(() => {
		const fetchHistory = async () => {
			if (!token || !showHistory) return;

			setLoadingHistory(true);
			try {
				const response = await fetch(`${API_URL}/users/history`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (response.ok) {
					const data = await response.json();
					const rechargeOnly = data.filter((t: Transaction) => t.type === 'RECHARGE');
					setHistory(rechargeOnly);
				}
			} catch (error) {
				console.error('Lỗi tải lịch sử:', error);
			} finally {
				setLoadingHistory(false);
			}
		};
		fetchHistory();
	}, [token, showHistory]);

	const handleRecharge = async (packId: number) => {
		if (!currentUser) {
			showNotification('Vui lòng đăng nhập để nạp xu.', 'warning');
			return;
		}

		if (!token) {
			showNotification('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.', 'error');
			return;
		}

		const pack = rechargePacks.find((p) => p.id === packId);
		if (!pack) return;

		if (isProcessing) return;

		setIsProcessing(true);
		setSelectedPack(packId);

		try {
			const response = await fetch(`${API_URL}/payment/create_payment_url`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					paymentType: 'RECHARGE',
					packId,
				}),
			});

			const data = await response.json();

			if (response.ok && data.paymentUrl) {
				window.location.href = data.paymentUrl;
			} else {
				if (response.status === 401) {
					showNotification('Phiên đăng nhập hết hạn hoặc không hợp lệ.', 'error');
				} else {
					throw new Error(data.message || 'Không thể tạo giao dịch');
				}
			}
		} catch (error: any) {
			console.error('Lỗi khi nạp xu:', error);
			showNotification(
				error.message || 'Khởi tạo thanh toán thất bại. Vui lòng thử lại.',
				'error',
			);
		} finally {
			setIsProcessing(false);
			setSelectedPack(null);
		}
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
			amount,
		);
	};

	const CoinIcon = ({ className, size = 60 }: { className?: string; size?: number }) => (
		<img
			src={coinImg}
			alt="Xu"
			className={className}
			style={{ width: size, height: size, objectFit: 'contain', display: 'inline-block' }}
		/>
	);

	if (!currentUser) {
		return (
			<div className="auth-page">
				<div className="auth-container">
					<AlertCircle size={48} className="text-yellow-500 mb-3" />
					<h2>Vui lòng đăng nhập</h2>
					<p>Bạn cần đăng nhập để nạp Xu vào tài khoản.</p>
					<Link to="/login" className="auth-button">
						Đăng Nhập Ngay
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="cr-page-container">
			<div className="cr-content-wrapper">
				<div className="cr-header-section">
					<div className="cr-title-group">
						<h2 className="cr-page-title">Cửa Hàng Xu</h2>
						<p className="cr-page-subtitle">
							Nạp xu ngay để mở khóa các chương truyện hấp dẫn!
						</p>
					</div>
					<button className="cr-history-btn" onClick={() => setShowHistory(true)}>
						<History size={18} style={{ marginRight: '8px' }} />
						Lịch sử nạp xu
					</button>
				</div>

				<div className="cr-balance-card">
					<div className="cr-balance-info">
						<span className="cr-balance-label">Số dư hiện tại</span>
						<div className="cr-balance-amount-wrapper">
							<span className="cr-balance-amount">{currentUser.coinBalance}</span>
							{}
							<CoinIcon className="cr-balance-icon" size={32} />
						</div>
					</div>
				</div>

				<div className="cr-packs-section">
					<h3 className="cr-section-heading">Chọn Gói Nạp</h3>

					{isLoadingPacks ? (
						<div className="cr-loading-state">
							<Loader2 className="animate-spin text-gray-500" size={32} />
							<p className="mt-2">Đang tải danh sách gói...</p>
						</div>
					) : (
						<div className="cr-packs-grid">
							{rechargePacks.map((pack) => (
								<div key={pack.id} className="cr-pack-item">
									<div className="cr-pack-content">
										<div className="cr-pack-coin-visual">
											{}
											<CoinIcon className="cr-pack-icon" size={28} />
											<span className="cr-pack-amount">{pack.coins}</span>
										</div>

										{pack.bonus > 0 ? (
											<div className="cr-pack-bonus-badge">
												+ {pack.bonus} Xu Bonus
											</div>
										) : (
											<div className="cr-pack-bonus-placeholder"></div>
										)}
									</div>

									<div className="cr-pack-footer">
										<div className="cr-pack-price">
											{formatPrice(pack.price)}
										</div>
										<button
											className="cr-buy-btn"
											onClick={() => handleRecharge(pack.id)}
											disabled={isProcessing && selectedPack === pack.id}
										>
											{isProcessing && selectedPack === pack.id ? (
												<Loader2 className="animate-spin" size={16} />
											) : (
												<>
													<span>Nạp Ngay</span>
													<CheckCircle size={16} />
												</>
											)}
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<p className="cr-disclaimer">
					*Lưu ý: Mỗi giao dịch nạp xu sẽ được cộng điểm kinh nghiệm tương ứng. Vui lòng
					kiểm tra kỹ thông tin trước khi thanh toán.
				</p>
			</div>

			{showHistory && (
				<div className="cr-modal-overlay">
					<div className="cr-modal-container">
						<div className="cr-modal-header">
							<h3>Lịch Sử Nạp Xu</h3>
							<button
								className="cr-modal-close"
								onClick={() => setShowHistory(false)}
							>
								<X size={24} />
							</button>
						</div>
						<div className="cr-modal-body">
							{loadingHistory ? (
								<div className="profile-loading">
									<Loader2 className="animate-spin" size={24} />
									<span style={{ marginLeft: '10px' }}>Đang tải lịch sử...</span>
								</div>
							) : history.length === 0 ? (
								<p
									style={{
										textAlign: 'center',
										color: '#666',
										marginTop: '20px',
									}}
								>
									Chưa có giao dịch nạp xu nào.
								</p>
							) : (
								<div className="transaction-table-wrapper">
									<table className="transaction-table">
										<thead>
											<tr>
												<th>Thời gian</th>
												<th>Mã GD</th>
												<th>Nội dung</th>
												<th style={{ textAlign: 'right' }}>Số tiền</th>
											</tr>
										</thead>
										<tbody>
											{history.map((item) => (
												<tr key={item.id}>
													<td>{formatDate(item.createdAt)}</td>
													<td className="col-code">
														{item.transactionCode || item.orderId}
													</td>
													<td className="col-desc">{item.description}</td>
													<td className="col-amount amount-plus">
														+{formatCurrency(item.amount)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CoinRechargePage;
