import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import './TopMembersSection.css';
import { Link } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';

interface TopMember {
    id: string;
    fullName: string;
    level: number;
    // *** BỔ SUNG: Thêm avatarUrl và score ***
    avatarUrl?: string; // URL ảnh đại diện, có thể không có
    score?: number;     // Điểm số, có thể không có
    // *** KẾT THÚC BỔ SUNG ***
}

interface RawTopMember {
    id: string | number;
    fullName: string;
    level: string | number;
    // *** BỔ SUNG: Thêm các trường tương ứng từ API nếu có ***
    avatarUrl?: string;
    score?: string | number;
    // *** KẾT THÚC BỔ SUNG ***
}

const TopMembersSection: React.FC = () => {
    const [topMembers, setTopMembers] = useState<TopMember[]>([]);
    const [apiLoading, setApiLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getLevelColor, getEquivalentLevelTitle, loading: authLoading } = useAuth();

    useEffect(() => {
        const fetchTopMembers = async () => {
            setApiLoading(true);
            setError(null);
            try {
                // Đảm bảo API của bạn trả về cả avatarUrl và score
                const response = await fetch('http://localhost:3000/api/users/top?limit=10');
                if (!response.ok) {
                    let errorMsg = 'Không thể tải danh sách thành viên';
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.error || errorMsg;
                    } catch (jsonError) { }
                    throw new Error(errorMsg);
                }
                const rawData: RawTopMember[] = await response.json();

                const processedData = rawData.map(member => {
                    const level = parseInt(String(member.level));
                    // *** BỔ SUNG: Xử lý score ***
                    const score = parseInt(String(member.score));
                    // *** KẾT THÚC BỔ SUNG ***
                    return {
                        id: String(member.id),
                        fullName: member.fullName || 'Người dùng ẩn danh',
                        level: !isNaN(level) && level >= 1 ? level : 1,
                        // *** BỔ SUNG: Gán avatarUrl và score ***
                        avatarUrl: member.avatarUrl || 'https://via.placeholder.com/45', // Ảnh mặc định nếu không có
                        score: !isNaN(score) ? score : undefined // Gán undefined nếu không phải số
                        // *** KẾT THÚC BỔ SUNG ***
                    }
                }).filter(member => member !== null) as TopMember[];

                setTopMembers(processedData);
            } catch (err) {
                console.error("Lỗi tải top members:", err);
                let detailedError = 'Failed to fetch top users';
                if (err instanceof Error) {
                    detailedError = err.message;
                }
                setError(`Lỗi: ${detailedError}`);
                setTopMembers([]);
            } finally {
                setApiLoading(false);
            }
        };

        fetchTopMembers();
    }, []);


    const isLoading = authLoading || apiLoading;

    // Hàm format điểm số
    const formatScore = (score: number | undefined) => {
        if (score === undefined) return '';
        return score.toLocaleString('vi-VN'); // Format số theo kiểu Việt Nam (31.250)
    };

    return (
        <div className="top-members-section">
            <h2 className="top-members-title">
                 Top thành viên {/* Sửa lại title giống ảnh */}
            </h2>
            {isLoading && (
                <div className="loading-indicator">
                    <FiLoader className="animate-spin" /> Đang tải bảng xếp hạng...
                </div>
            )}
            {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {!isLoading && !error && topMembers.length === 0 && <p style={{ textAlign: 'center' }}>Chưa có dữ liệu xếp hạng.</p>}
            {!isLoading && !error && topMembers.length > 0 && (
                // *** Dùng lại <ol> như ban đầu ***
                <ol className="top-members-list">
                    {topMembers.map((member, index) => {
                        if (!member || typeof member.level !== 'number' || member.level < 1) {
                            console.warn("Invalid member data skipped:", member);
                            return null;
                        }

                        const rank = index + 1;
                        // *** Dùng lại rank số thay vì icon ***
                        const rankDisplay = <span className="rank-number">{String(rank).padStart(2, '0')}</span>;
                        // *** KẾT THÚC THAY ĐỔI ***

                        const levelColor = getLevelColor(member.level);
                        const levelTitle = getEquivalentLevelTitle(member.level);

                        return (
                             // *** Dùng lại <li> như ban đầu ***
                            <li key={member.id || index} className={`top-member-item`}>
                                {/* *** Phần Rank *** */}
                                <span className="member-rank">{rankDisplay}</span>

                                {/* *** BỔ SUNG: Avatar *** */}
                                <img src={member.avatarUrl} alt={member.fullName} className="member-avatar" />
                                {/* *** KẾT THÚC BỔ SUNG *** */}

                                {/* *** BỔ SUNG: Container cho Tên, Cấp, Điểm *** */}
                                <div className="member-info">
                                    <span className="member-name">
                                        {member.fullName}
                                    </span>
                                    {/* *** BỔ SUNG: Container cho Cấp và Điểm *** */}
                                    <div className="member-stats">
                                        <span
                                            className="member-level-badge"
                                            style={{ backgroundColor: levelColor }}
                                            title={`Cấp ${member.level}`}
                                        >
                                            {levelTitle}
                                        </span>
                                        {/* *** BỔ SUNG: Điểm số *** */}
                                        {member.score !== undefined && (
                                            <span className="member-score">
                                                {formatScore(member.score)}
                                            </span>
                                        )}
                                        {/* *** KẾT THÚC BỔ SUNG *** */}
                                    </div>
                                    {/* *** KẾT THÚC BỔ SUNG *** */}
                                </div>
                                {/* *** KẾT THÚC BỔ SUNG *** */}
                            </li>
                        );
                    })}
                </ol>
             )}
        </div>
    );
};

export default TopMembersSection;