import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import FlyingImage from './components/common/FlyingImage';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import LevelUpPopup from './components/popups/LevelUpPopup';
import ChatbotUI from './components/chatbot/ChatbotUI';
import LoadingScreen from './components/common/Loading/LoadingScreen';
import { useCart } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';
import './assets/styles/App.css';
import ImageProtection from './components/Global/ImageProtection';
import Snowfall from './components/minigame/Snowfall'; 
import { useSnowfall } from './contexts/SnowfallContext'; 

const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ComicDetailPage = lazy(() => import('./pages/ComicDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AddressManagementPage = lazy(() => import('./pages/AddressManagementPage'));
const MyLibraryPage = lazy(() => import('./pages/MyLibraryPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const PhysicalComicsPage = lazy(() => import('./pages/PhysicalComicsPage'));
const DigitalComicsPage = lazy(() => import('./pages/DigitalComicsPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ReaderPage = lazy(() => import('./pages/ReaderPage'));
const CoinRechargePage = lazy(() => import('./pages/CoinRechargePage'));
const SettingsPage = lazy(() => import('./pages/SettingPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AboutUsPage = lazy(() => import('./pages/AboutPage'));
const PaymentReturnPage = lazy(() => import('./pages/PaymentReturnPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const ChristmasEventPage = lazy(() => import('./pages/ChristmasEventPage'));

function App() {
	const { animationData, clearAnimation } = useCart();
	const location = useLocation();
	const { isSnowfallEnabled } = useSnowfall(); 

	const isReaderPage = location.pathname.startsWith('/read/');
	const isAdminPage = location.pathname.startsWith('/admin');
	const isAboutPage = location.pathname === '/about-us';
	const isContactPage = location.pathname === '/contact';
	const isCommunityPage = location.pathname === '/community';
	const isPrivacyPage = location.pathname === '/privacy-policy';
	const isTermsPage = location.pathname === '/terms-of-service';
	const isLoginPage = location.pathname === '/login';
	const isRegisterPage = location.pathname === '/register';
	const isForgotPassPage = location.pathname === '/forgot-password';
	const isFAQPage = location.pathname === '/faq';

	const { isLevelUpPopupOpen, levelUpInfo, closeLevelUpPopup } = useAuth();

	useEffect(() => {
		if (isAdminPage) {
			document.body.classList.add('admin-cursor-mode');
		} else {
			document.body.classList.remove('admin-cursor-mode');
		}
	}, [isAdminPage]);

	useEffect(() => {
		const handleGlobalClick = (event: MouseEvent) => {
			const targetElement = event.target as Element;
			const interactiveSelector =
				'a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"]), .suggestion-item, .tag-card-link, .cursor-option';

			if (targetElement.closest(interactiveSelector)) {
				return;
			}

			const ripple = document.createElement('div');
			ripple.className = 'click-ripple';
			document.body.appendChild(ripple);

			ripple.style.left = `${event.clientX}px`;
			ripple.style.top = `${event.clientY}px`;

			ripple.addEventListener('animationend', () => {
				ripple.remove();
			});
		};
		document.addEventListener('click', handleGlobalClick);
		return () => {
			document.removeEventListener('click', handleGlobalClick);
		};
	}, []);

	return (
		<div className="app-container">
			<ImageProtection />
			<ScrollToTop />
			
			{isSnowfallEnabled && <Snowfall />}

			{!isAdminPage && <Header />}

			<main
				className={isReaderPage ? 'main-content reader-mode' : 'main-content'}
				style={{
					padding:
						isAboutPage ||
						isLoginPage ||
						isRegisterPage ||
						isForgotPassPage ||
						isContactPage ||
						isPrivacyPage ||
						isTermsPage ||
						isCommunityPage ||
						isFAQPage
							? '0'
							: undefined,
				}}
			>
				<Suspense fallback={<LoadingScreen />}>
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/comic/:comicId" element={<ComicDetailPage />} />
						<Route path="/cart" element={<CartPage />} />
						<Route path="/checkout" element={<CheckoutPage />} />
						<Route path="/wishlist" element={<WishlistPage />} />
						<Route path="/login" element={<LoginPage />} />
						<Route path="/register" element={<RegisterPage />} />
						<Route path="/forgot-password" element={<ForgotPasswordPage />} />
						<Route path="/reset-password/:token" element={<ResetPasswordPage />} />
						<Route path="/profile" element={<ProfilePage />} />
						<Route path="/addresses" element={<AddressManagementPage />} />
						<Route path="/my-library" element={<MyLibraryPage />} />
						<Route path="/orders" element={<OrdersPage />} />
						<Route path="/orders/:orderId" element={<OrderDetailPage />} />
						<Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
						<Route path="/search" element={<SearchPage />} />
						<Route path="/read/:comicId/:chapterNumber" element={<ReaderPage />} />
						<Route path="/recharge" element={<CoinRechargePage />} />
						<Route path="/payment-return" element={<PaymentReturnPage />} />
						<Route path="/settings" element={<SettingsPage />} />
						<Route path="/physical-comics" element={<PhysicalComicsPage />} />
						<Route path="/digital-comics" element={<DigitalComicsPage />} />
						<Route path="/new-releases" element={<CategoryPage />} />
						<Route path="/genres/:categorySlug" element={<CategoryPage />} />
						<Route path="/about-us" element={<AboutUsPage />} />
						<Route path="/community" element={<CommunityPage />} />
						<Route path="/contact" element={<ContactPage />} />
						<Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
						<Route path="/terms-of-service" element={<TermsOfServicePage />} />
						<Route path="/admin/*" element={<AdminPage />} />
						<Route path="/faq" element={<FAQPage />} />
						<Route path="/christmas-event" element={<ChristmasEventPage />} />.
					</Routes>
				</Suspense>
			</main>

			{!isAdminPage && <Footer />}

			<FlyingImage
				src={animationData.src}
				startRect={animationData.startRect}
				endRect={animationData.endRect}
				onAnimationEnd={clearAnimation}
			/>
			<ScrollToTopButton />

			{levelUpInfo && (
				<LevelUpPopup
					isOpen={isLevelUpPopupOpen}
					onClose={closeLevelUpPopup}
					newLevel={levelUpInfo.newLevel}
					levelTitle={levelUpInfo.levelTitle}
				/>
			)}

			{!isAdminPage && <ChatbotUI />}
		</div>
	);
}

export default App;