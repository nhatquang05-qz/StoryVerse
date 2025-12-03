import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogIn, FiX } from 'react-icons/fi';
import '../../assets/styles/LoginRequiredPopup.css';

interface LoginRequiredPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginRequiredPopup: React.FC<LoginRequiredPopupProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLoginClick = () => {
        onClose();
        navigate('/login');
    };

    return (
        <div className="login-required-overlay" onClick={onClose}>
            <div className="login-required-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn-absolute" onClick={onClose} style={{position: 'absolute', top: 15, right: 15, background:'none', border:'none', fontSize: '1.2rem', cursor:'pointer', color: '#999'}}>
                    <FiX />
                </button>
                
                <div className="login-required-icon">
                    <FiLogIn />
                </div>
                
                <h3>Yêu cầu đăng nhập</h3>
                <p>Bạn cần đăng nhập để thực hiện chức năng này. <br/> Hãy đăng nhập để trải nghiệm đầy đủ tính năng nhé!</p>
                
                <div className="login-required-actions">
                    <button className="btn-login-cancel" onClick={onClose}>
                        Để sau
                    </button>
                    <button className="btn-login-redirect" onClick={handleLoginClick}>
                        Đăng nhập ngay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginRequiredPopup;