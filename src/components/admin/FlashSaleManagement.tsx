import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import '../../assets/styles/FlashSaleManagement.css';

const API_BASE_URL = 'http://localhost:3000/api';

interface Comic {
	id: number;
	title: string;
	price: number;
	isDigital: boolean | number;
}

interface FlashSaleItem {
	comicId: number;
	salePrice: number;
	quantityLimit: number;
	soldQuantity?: number;
	title?: string;
	originalPrice?: number;
}

interface FlashSale {
	id: number;
	name: string;
	startTime: string;
	endTime: string;
	status: string;
	calculatedStatus?: string;
	items?: FlashSaleItem[];
}

const FlashSaleManagement: React.FC = () => {
	const [sales, setSales] = useState<FlashSale[]>([]);
	const [isCreating, setIsCreating] = useState(false);
	const [name, setName] = useState('');
	const [startTime, setStartTime] = useState('');
	const [endTime, setEndTime] = useState('');

	const [allComics, setAllComics] = useState<Comic[]>([]);
	const [selectedItems, setSelectedItems] = useState<FlashSaleItem[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchResult, setSearchResult] = useState<Comic[]>([]);

	const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);
	const [loadingDetails, setLoadingDetails] = useState(false);

	const token = localStorage.getItem('storyverse_token');
	const config = {
		headers: { Authorization: `Bearer ${token}` },
	};

	useEffect(() => {
		fetchSales();
		fetchComics();
	}, []);

	useEffect(() => {
		if (searchTerm) {
			setSearchResult(
				allComics.filter(
					(c) =>
						c.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
						(c.isDigital === 0 || c.isDigital === false),
				),
			);
		} else {
			setSearchResult([]);
		}
	}, [searchTerm, allComics]);

	const fetchSales = async () => {
		try {
			const res = await axios.get(`${API_BASE_URL}/flash-sales`, config);
			setSales(res.data);
		} catch (err) {
			console.error(err);
		}
	};

	const fetchComics = async () => {
		try {
			const res = await axios.get(`${API_BASE_URL}/comics?limit=1000`);
			setAllComics(Array.isArray(res.data) ? res.data : res.data.data);
		} catch (err) {
			console.error(err);
		}
	};

	const fetchSaleDetails = async (saleId: number) => {
		if (expandedSaleId === saleId) {
			setExpandedSaleId(null);
			return;
		}

		setLoadingDetails(true);
		try {
			const res = await axios.get(`${API_BASE_URL}/flash-sales/${saleId}`, config);
			const saleDetails = res.data;

			setSales((prevSales) =>
				prevSales.map((s) => (s.id === saleId ? { ...s, items: saleDetails.items } : s)),
			);
			setExpandedSaleId(saleId);
		} catch (err) {
			console.error('Lỗi lấy chi tiết sale:', err);
		} finally {
			setLoadingDetails(false);
		}
	};

	const handleAddItem = (comic: Comic) => {
		if (selectedItems.find((i) => i.comicId === comic.id)) return;
		const priceNumber = Number(comic.price);
		setSelectedItems([
			...selectedItems,
			{ comicId: comic.id, salePrice: Math.floor(priceNumber * 0.8), quantityLimit: 10 },
		]);
		setSearchTerm('');
	};

	const updateItem = (index: number, field: keyof FlashSaleItem, value: number) => {
		const newItems = [...selectedItems];
		newItems[index] = { ...newItems[index], [field]: value };
		setSelectedItems(newItems);
	};

	const removeItem = (index: number) => {
		const newItems = [...selectedItems];
		newItems.splice(index, 1);
		setSelectedItems(newItems);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const newStart = new Date(startTime).getTime();
		const newEnd = new Date(endTime).getTime();

		if (newEnd <= newStart) {
			alert('Thời gian kết thúc phải sau thời gian bắt đầu.');
			return;
		}

		const hasConflict = sales.some((s) => {
			const existingEnd = new Date(s.endTime).getTime();
			return newStart < existingEnd;
		});

		if (hasConflict) {
			alert(
				'LỖI: Thời gian bắt đầu bị trùng lặp với đợt Sale đang diễn ra hoặc sắp tới. Vui lòng chọn thời gian khác.',
			);
			return;
		}

		try {
			await axios.post(
				`${API_BASE_URL}/flash-sales`,
				{
					name,
					startTime,
					endTime,
					items: selectedItems,
				},
				config,
			);

			setIsCreating(false);
			fetchSales();
			setName('');
			setStartTime('');
			setEndTime('');
			setSelectedItems([]);
		} catch (err) {
			alert('Lỗi khi tạo Flash Sale.');
		}
	};

	const handleDelete = async (id: number, e: React.MouseEvent) => {
		e.stopPropagation();
		if (confirm('Bạn có chắc muốn xóa đợt sale này?')) {
			await axios.delete(`${API_BASE_URL}/flash-sales/${id}`, config);
			fetchSales();
		}
	};

	const calculateProgress = (sold: number = 0, limit: number = 1) => {
		return Math.min(100, (sold / limit) * 100);
	};

	const formatPrice = (price: number | string | undefined) => {
		if (price === undefined || price === null) return '0';
		const num = Number(price);
		return new Intl.NumberFormat('vi-VN').format(num);
	};

	return (
		<div className="fs-mgmt-container">
			<div className="fs-mgmt-header">
				<h2>Quản lý Flash Sale</h2>
				<button onClick={() => setIsCreating(!isCreating)} className="fs-btn-create">
					<FaPlus className="fs-icon-mr" /> Tạo đợt Sale mới
				</button>
			</div>

			{isCreating && (
				<div className="fs-form-panel">
					<h3 className="fs-section-title">Thiết lập Flash Sale</h3>
					<form onSubmit={handleSubmit}>
						<div className="fs-form-group">
							<label className="fs-form-label">Tên chương trình</label>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="fs-form-input"
								placeholder="VD: Sale 12.12"
							/>
						</div>
						<div className="fs-form-row">
							<div>
								<label className="fs-form-label">Thời gian bắt đầu</label>
								<input
									type="datetime-local"
									value={startTime}
									onChange={(e) => setStartTime(e.target.value)}
									required
									className="fs-form-input"
								/>
							</div>
							<div>
								<label className="fs-form-label">Thời gian kết thúc</label>
								<input
									type="datetime-local"
									value={endTime}
									onChange={(e) => setEndTime(e.target.value)}
									required
									className="fs-form-input"
								/>
							</div>
						</div>

						<div className="fs-form-group fs-relative">
							<label className="fs-form-label">Thêm sản phẩm (Chỉ Truyện giấy)</label>
							<div className="fs-search-box">
								<FaSearch className="fs-search-icon" />
								<input
									type="text"
									placeholder="Tìm tên truyện..."
									className="fs-search-input"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
							{searchTerm && searchResult.length > 0 && (
								<div className="fs-search-dropdown">
									{searchResult.map((comic) => (
										<div
											key={comic.id}
											onClick={() => handleAddItem(comic)}
											className="fs-search-item"
										>
											<span>{comic.title}</span>
											<span>{formatPrice(comic.price)} đ</span>
										</div>
									))}
								</div>
							)}
						</div>

						{selectedItems.length > 0 && (
							<div className="fs-selected-items">
								<h4 className="fs-subtitle">Sản phẩm tham gia:</h4>
								<div className="fs-items-list">
									{selectedItems.map((item, index) => {
										const comic = allComics.find((c) => c.id === item.comicId);
										return (
											<div key={index} className="fs-item-row">
												<div className="fs-item-info">{comic?.title}</div>
												<div className="fs-item-input-group">
													<span className="fs-label-sm">
														Giá gốc: {formatPrice(comic?.price)} đ
													</span>
													<div className="fs-flex-gap">
														<span className="fs-label-sm">
															Giá Sale:
														</span>
														<input
															type="number"
															value={item.salePrice}
															className="fs-input-sm"
															onChange={(e) =>
																updateItem(
																	index,
																	'salePrice',
																	parseInt(e.target.value),
																)
															}
														/>
													</div>
												</div>
												<div className="fs-item-input-group">
													<span className="fs-label-sm">Giới hạn</span>
													<input
														type="number"
														value={item.quantityLimit}
														className="fs-input-sm"
														onChange={(e) =>
															updateItem(
																index,
																'quantityLimit',
																parseInt(e.target.value),
															)
														}
													/>
												</div>
												<button
													type="button"
													onClick={() => removeItem(index)}
													className="fs-btn-remove"
												>
													<FaTrash />
												</button>
											</div>
										);
									})}
								</div>
							</div>
						)}

						<button type="submit" className="fs-btn-submit">
							Lưu Flash Sale
						</button>
					</form>
				</div>
			)}

			<div className="fs-list-grid">
				{sales.map((sale) => {
					let statusLabel = 'Đang diễn ra';
					let statusClass = 'active';

					const backendStatus = sale.calculatedStatus || sale.status;

					if (backendStatus === 'PENDING') {
						statusLabel = 'Sắp diễn ra';
						statusClass = 'pending';
					} else if (backendStatus === 'ENDED') {
						statusLabel = 'Đã kết thúc';
						statusClass = 'ended';
					} else {
						statusLabel = 'Đang diễn ra';
						statusClass = 'active';
					}

					return (
						<div
							key={sale.id}
							className={`fs-sale-card ${expandedSaleId === sale.id ? 'expanded' : ''}`}
						>
							<div
								className="fs-sale-header"
								onClick={() => fetchSaleDetails(sale.id)}
							>
								<div className="fs-sale-info-main">
									<h3 className="fs-sale-name">{sale.name}</h3>
									<p className="fs-sale-time">
										{new Date(sale.startTime).toLocaleString()} -{' '}
										{new Date(sale.endTime).toLocaleString()}
									</p>
									<p className={`fs-status-badge ${statusClass}`}>
										{statusLabel}
									</p>
								</div>
								<div className="fs-sale-actions">
									<button
										onClick={(e) => handleDelete(sale.id, e)}
										className="fs-btn-icon-delete"
									>
										<FaTrash />
									</button>
									{expandedSaleId === sale.id ? (
										<FaChevronUp />
									) : (
										<FaChevronDown />
									)}
								</div>
							</div>

							{expandedSaleId === sale.id && (
								<div className="fs-sale-details">
									{loadingDetails && !sale.items ? (
										<p className="fs-loading-text">
											Đang tải thông tin sản phẩm...
										</p>
									) : (
										<table className="fs-details-table">
											<thead>
												<tr>
													<th>Tên truyện</th>
													<th>Giá gốc</th>
													<th>Giá Sale</th>
													<th>Tiến độ bán</th>
												</tr>
											</thead>
											<tbody>
												{sale.items?.map((item, idx) => (
													<tr key={idx}>
														<td>{item.title}</td>
														<td>{formatPrice(item.originalPrice)}đ</td>
														<td className="fs-text-red">
															{formatPrice(item.salePrice)}đ
														</td>
														<td width="40%">
															<div className="fs-progress-container">
																<div className="fs-progress-bar">
																	<div
																		className="fs-progress-fill"
																		style={{
																			width: `${calculateProgress(item.soldQuantity, item.quantityLimit)}%`,
																		}}
																	></div>
																</div>
																<span className="fs-progress-text">
																	{item.soldQuantity || 0} /{' '}
																	{item.quantityLimit}
																</span>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default FlashSaleManagement;
