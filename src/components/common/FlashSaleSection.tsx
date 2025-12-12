import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { FaBolt, FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/FlashSaleSection.css';
import fireIcon from '../../assets/images/fire.avif';
import FlashSaleCountdown from './FlashSaleCountdown';

const API_BASE_URL = 'http://localhost:3000/api';

const FlashSaleSection: React.FC = () => {
	const [activeSale, setActiveSale] = useState<any>(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [itemsVisible, setItemsVisible] = useState(5);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const navigate = useNavigate();
	const contentRef = useRef<HTMLDivElement>(null);

	const fetchActiveSale = async () => {
		try {
			const res = await axios.get(`${API_BASE_URL}/flash-sales/active`);
			setActiveSale(res.data);
		} catch (error) {
			console.log('No active flash sale');
			setActiveSale(null);
		}
	};

	useEffect(() => {
		fetchActiveSale();
		const interval = setInterval(fetchActiveSale, 60000);
		return () => clearInterval(interval);
	}, []);

	const updateItemsVisible = useCallback(() => {
		const width = window.innerWidth;
		if (width >= 1280) setItemsVisible(7);
		else if (width >= 1024) setItemsVisible(5);
		else if (width >= 640) setItemsVisible(3);
		else setItemsVisible(2);
	}, []);

	useEffect(() => {
		updateItemsVisible();
		window.addEventListener('resize', updateItemsVisible);
		return () => window.removeEventListener('resize', updateItemsVisible);
	}, [updateItemsVisible]);

	const clonesCount = itemsVisible;

	// Hook luôn được gọi trước khi return
	useEffect(() => {
		if (activeSale) {
			setCurrentIndex(clonesCount);
		}
	}, [itemsVisible, clonesCount, activeSale]);

	const formatPrice = (price: number | string | undefined) => {
		if (price === undefined || price === null) return '0';
		const num = Number(price);
		return new Intl.NumberFormat('vi-VN').format(num);
	};

	if (!activeSale) return null;

	const sortedItems = [...activeSale.items].sort((a: any, b: any) => {
		const stockA = (a.quantityLimit || 1) - (a.soldQuantity || 0);
		const stockB = (b.quantityLimit || 1) - (b.soldQuantity || 0);
		const isSoldOutA = stockA <= 0;
		const isSoldOutB = stockB <= 0;

		if (isSoldOutA && !isSoldOutB) return 1;
		if (!isSoldOutA && isSoldOutB) return -1;
		return 0;
	});

	const isUpcoming = new Date(activeSale.startTime) > new Date();

	const extendedItems = [
		...sortedItems.slice(-clonesCount),
		...sortedItems,
		...sortedItems.slice(0, clonesCount),
	];
	const totalExtended = extendedItems.length;

	const handleNext = () => {
		if (isTransitioning) return;
		setIsTransitioning(true);
		setCurrentIndex((prev) => prev + 1);
	};

	const handlePrev = () => {
		if (isTransitioning) return;
		setIsTransitioning(true);
		setCurrentIndex((prev) => prev - 1);
	};

	const handleTransitionEnd = () => {
		setIsTransitioning(false);
		const realCount = sortedItems.length;

		// Xử lý infinite loop khi chạy hết các bản clone
		if (currentIndex === 0) {
			setCurrentIndex(realCount);
		} else if (currentIndex === totalExtended - clonesCount) {
			setCurrentIndex(clonesCount);
		}
	};

	const itemWidthPercent = 100 / itemsVisible;
	const transformValue = -(currentIndex * itemWidthPercent);
	const transitionSpeed = '0.3s';

	return (
		<div className="fs-wrapper">
			<div className="fs-border">
				<div className="fs-content" ref={contentRef}>
					<div className="fs-header">
						<div className="fs-title-group">
							<FaBolt className="fs-icon" />
							<h2 className="fs-title-text">
								{isUpcoming ? 'SẮP DIỄN RA: ' : 'FLASH SALE'} {activeSale.name}
							</h2>
						</div>

						<FlashSaleCountdown
							targetDate={isUpcoming ? activeSale.startTime : activeSale.endTime}
							isUpcoming={isUpcoming}
							onTimeUp={fetchActiveSale}
						/>
					</div>

					{isUpcoming ? (
						<div className="fs-empty-state">
							<FaClock className="fs-empty-icon" />
							<p className="fs-empty-text">Chương trình sẽ sớm bắt đầu.</p>
						</div>
					) : (
						<div className="fs-body">
							<button
								onClick={handlePrev}
								className="fs-nav-btn fs-nav-prev"
								title="Trang trước"
							>
								<FaChevronLeft />
							</button>

							<div className="fs-viewport">
								<div
									className="fs-track"
									style={{
										transform: `translateX(${transformValue}%)`,
										transition: isTransitioning
											? `transform ${transitionSpeed} ease-in-out`
											: 'none',
									}}
									onTransitionEnd={handleTransitionEnd}
								>
									{extendedItems.map((item: any, index: number) => {
										const sold = item.soldQuantity || 0;
										const limit = item.quantityLimit || 1;
										const stockLeft = limit - sold;
										const isSoldOut = stockLeft <= 0;
										const isLowStock = stockLeft > 0 && stockLeft <= 5;

										let progressText = `Đã bán ${sold}`;
										if (isSoldOut) progressText = 'Hết hàng';
										else if (isLowStock)
											progressText = `Còn ${stockLeft} sản phẩm`;

										const percentSold = Math.min(
											100,
											Math.round((sold / limit) * 100),
										);
										const discountPercent = Math.round(
											((item.originalPrice - item.salePrice) /
												item.originalPrice) *
												100,
										);

										return (
											<div
												key={`${item.id}-${index}`}
												className="fs-item-wrapper"
												style={{ flex: `0 0 ${itemWidthPercent}%` }}
											>
												<div
													onClick={() =>
														navigate(`/comic/${item.comicId}`)
													}
													className={`fs-card ${isSoldOut ? 'fs-sold-out' : ''}`}
												>
													<div className="fs-discount-badge">
														-{discountPercent}%
													</div>

													<div className="fs-card-img-container">
														<img
															src={item.coverImage}
															alt={item.title}
															loading="lazy"
														/>
														{isSoldOut && (
															<div className="fs-sold-overlay">
																<span className="fs-sold-text">
																	HẾT HÀNG
																</span>
															</div>
														)}
													</div>

													<div className="fs-card-info">
														<h3
															className="fs-card-title"
															title={item.title}
														>
															{item.title}
														</h3>

														<div className="fs-price-row">
															<span className="fs-price-original">
																{formatPrice(item.originalPrice)}đ
															</span>
															<span className="fs-price-sale">
																{formatPrice(item.salePrice)}đ
															</span>
														</div>

														<div className="fs-qty-row">
															<div className="fs-prog-bg">
																<div
																	className="fs-prog-fill"
																	style={{
																		width: `${percentSold}%`,
																	}}
																></div>
																<div className="fs-prog-text">
																	{progressText}
																</div>
															</div>

															{isLowStock && (
																<img
																	src={fireIcon}
																	alt="Hot"
																	className="fs-fire-icon-bar"
																/>
															)}
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>

							<button
								onClick={handleNext}
								className="fs-nav-btn fs-nav-next"
								title="Xem thêm"
							>
								<FaChevronRight />
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default FlashSaleSection;
