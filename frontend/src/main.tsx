import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishListContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { FontProvider } from './contexts/FontContext';
import { SnowfallProvider } from './contexts/SnowfallContext';
import { ToastProvider } from './contexts/ToastContext';
import './index.css';
import App from './App.tsx';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')!).render(
	<ToastProvider>
		<StrictMode>
			<BrowserRouter>
				<GoogleOAuthProvider clientId={googleClientId}>
					<AuthProvider>
						<NotificationProvider>
							<CartProvider>
								<WishlistProvider>
									<FontProvider>
										<SnowfallProvider>
											<App />
										</SnowfallProvider>
									</FontProvider>
								</WishlistProvider>
							</CartProvider>
						</NotificationProvider>
					</AuthProvider>
				</GoogleOAuthProvider>
			</BrowserRouter>
		</StrictMode>
	</ToastProvider>,
);
