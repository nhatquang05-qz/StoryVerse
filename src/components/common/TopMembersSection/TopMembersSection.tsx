import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import './TopMembersSection.css';
import { Link } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';

interface TopMember {
    id: string;
    fullName: string;
    level: number;
}

interface RawTopMember {
    id: string | number;
    fullName: string;
    level: string | number;
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
                const response = await fetch('http://localhost:3000/api/users/top?limit=10');
                if (!response.ok) {
                    let errorMsg = 'Không thể tải danh sách thành viên';
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.error || errorMsg;
                    } catch (jsonError) {

                    }
                    throw new Error(errorMsg);
                }
                const rawData: RawTopMember[] = await response.json();

                const processedData = rawData.map(member => {
                     const level = parseInt(String(member.level));
                     return {
                        id: String(member.id),
                        fullName: member.fullName || 'Người dùng ẩn danh',
                        level: !isNaN(level) && level >= 1 ? level : 1
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

    return (
        <div className="top-members-section">
            <h2 className="top-members-title">
                <i className="fas fa-crown"></i> Top Thành Viên
            </h2>
            {isLoading && (
                 <div className="loading-indicator">
                    <FiLoader className="animate-spin" /> Đang tải bảng xếp hạng...
                 </div>
            )}
            {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {!isLoading && !error && topMembers.length === 0 && <p style={{ textAlign: 'center' }}>Chưa có dữ liệu xếp hạng.</p>}
            {!isLoading && !error && topMembers.length > 0 && (
                <ol className="top-members-list">
                    {topMembers.map((member, index) => {
                        if (!member || typeof member.level !== 'number' || member.level < 1) {
                            console.warn("Invalid member data skipped:", member);
                            return null;
                        }

                        const rank = index + 1;
                        let rankClass = '';
                        let rankIcon = <span className="rank-number">{rank}</span>;

                        if (rank === 1) { rankClass = 'rank-1'; rankIcon = <i className="fas fa-trophy rank-icon gold"></i>; }
                        else if (rank === 2) { rankClass = 'rank-2'; rankIcon = <i className="fas fa-medal rank-icon silver"></i>; }
                        else if (rank === 3) { rankClass = 'rank-3'; rankIcon = <i className="fas fa-medal rank-icon bronze"></i>; }
                        else { rankClass = 'rank-other';}

                        const levelColor = getLevelColor(member.level);
                        const levelTitle = getEquivalentLevelTitle(member.level);

                        return (
                            <li key={member.id || index} className={`top-member-item ${rankClass}`}>
                                <span className="member-rank">{rankIcon}</span>
                                <span className="member-name">
                                   {member.fullName}
                                </span>
                                <span
                                    className="member-level-badge"
                                    style={{ backgroundColor: levelColor, color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8em', marginLeft: 'auto' }}
                                    title={`Cấp ${member.level}`}
                                >
                                    {levelTitle}
                                </span>
                            </li>
                        );
                     })}
                </ol>
             )}
        </div>
    );
};

export default TopMembersSection;