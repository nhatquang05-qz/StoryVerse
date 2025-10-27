import React from 'react';
import { topMembersData } from '../../../data/mockData';
import { useAuth } from '../../../contexts/AuthContext';
import './TopMembersSection.css';

const TopMembersSection: React.FC = () => {
    const { getLevelColor } = useAuth();

    const formatScore = (score: number): string => {
        return score.toLocaleString('vi-VN');
    };

    return (
        <div className="top-members-section">
            <h3 className="top-members-title">Top thành viên</h3>
            <div className="top-members-list">
                {topMembersData.map((member) => (
                    <div key={member.rank} className="top-member-item">
                        <span className="member-rank">{String(member.rank).padStart(2, '0')}</span>
                        <img src={member.avatarUrl} alt={member.name} className="member-avatar" />
                        <div className="member-info">
                            <span className="member-name">{member.name}</span>
                            <div className="member-stats">
                                <span
                                    className="member-level-badge"
                                    style={{ backgroundColor: getLevelColor(member.level) }}
                                >
                                    Cấp {member.level}
                                </span>
                                <span className="member-score">
                                    {formatScore(member.score)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopMembersSection;