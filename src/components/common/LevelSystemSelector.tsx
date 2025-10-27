import React, { useState, useMemo, useCallback } from 'react';
import { FiChevronDown, FiEdit3 } from 'react-icons/fi';
interface LevelSystemSelectorProps {
    currentUserLevel: number; 
    currentSystemKey: string; 
    onSystemChange: (newSystemKey: string) => void; 
}

interface LevelSystem {
    key: string;
    name: string;
    description: string;
    levels: string[];
    minLevels: number[]; 
}

const LEVEL_SYSTEMS: LevelSystem[] = [
    {
        key: 'Bình Thường', 
        name: 'Bình Thường',
        description: 'Cấp độ cơ bản cho người mới bắt đầu.',
        levels: ['Cấp 0', 'Cấp 1', 'Cấp 2', 'Cấp 3', 'Cấp 4', 'Cấp 5', 'Cấp 6', 'Cấp 7', 'Cấp 8', 'Cấp 9', 'Cấp 10', 'Cấp 11', 'Cấp 12', 'Cấp 13', 'Cấp 14', 'Cấp 15+'],
        minLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    },
    {
        key: 'Tu Tiên',
        name: 'Tu Tiên',
        description: 'Thế giới tu luyện linh khí, truy cầu trường sinh bất tử.',
        levels: ['Phàm nhân', 'Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Hợp Thể', 'Đại Thừa', 'Phi Thăng', 'Tiên Nhân'],
        minLevels: [0, 1, 2, 4, 6, 7, 8, 10, 12, 15],
    },
    {
        key: 'Game',
        name: 'Game',
        description: 'Thế giới trò chơi, nhân vật thăng cấp, săn boss, vượt nhiệm vụ.',
        levels: ['Vô hạng', 'Đồng', 'Bạc', 'Vàng', 'Bạch Kim', 'Kim Cương', 'Huyền Thoại', 'Cao thủ', 'Thách đấu'],
        minLevels: [0, 1, 3, 5, 7, 9, 11, 13, 15],
    },
    {
        key: 'Ma Vương',
        name: 'Ma Vương',
        description: 'Thế giới hắc ám, ma giới, chiến đấu với anh hùng và thần linh.',
        levels: ['Ma thường', 'Ma Nhân', 'Ma Sĩ', 'Ma Tướng', 'Ma Tôn', 'Ma Đế', 'Ma Thần', 'Ma Vương', 'Hắc Ma Vạn Tôn'],
        minLevels: [0, 1, 3, 5, 7, 9, 11, 13, 15],
    },
    {
        key: 'Pháp Sư',
        name: 'Pháp Sư',
        description: 'Thế giới phép thuật, học viện, chiến đấu bằng ma pháp và trí tuệ.',
        levels: ['Học đồ', 'Pháp sư sơ cấp', 'Pháp sư trung cấp', 'Pháp sư cao cấp', 'Đại Pháp Sư', 'Pháp Thánh', 'Pháp Thần', 'Ma đạo sư'],
        minLevels: [0, 1, 3, 6, 9, 11, 13, 15],
    },
    {
        key: 'Tinh Không',
        name: 'Tinh Không',
        description: 'Thế giới vũ trụ, du hành giữa các hành tinh và hệ sao.',
        levels: ['Binh lính', 'Chiến Sĩ', 'Vệ Tinh', 'Tinh Vương', 'Tinh Hoàng', 'Tinh Đế', 'Tinh Tôn', 'Vũ Trụ Chi Chủ'],
        minLevels: [0, 1, 3, 6, 9, 11, 13, 15],
    }
];

const getSystemLevelForUser = (userLevel: number, systemKey: string): string => {
    const system = LEVEL_SYSTEMS.find(s => s.key === systemKey) || LEVEL_SYSTEMS[0];
    let matchingLevel = system.levels[0]; 

    for (let i = system.minLevels.length - 1; i >= 0; i--) {
        if (userLevel >= system.minLevels[i]) {
            matchingLevel = system.levels[i];
            break;
        }
    }

    return matchingLevel;
};

const LevelSystemSelector: React.FC<LevelSystemSelectorProps> = ({ currentUserLevel, currentSystemKey, onSystemChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    const currentSystem = useMemo(() => 
        LEVEL_SYSTEMS.find(s => s.key === currentSystemKey) || LEVEL_SYSTEMS[0]
    , [currentSystemKey]);
    
    const equivalentLevel = useMemo(() => 
        getSystemLevelForUser(currentUserLevel, currentSystemKey)
    , [currentUserLevel, currentSystemKey]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSystemChange(e.target.value);
        setIsEditing(false); 
    };

    return (
        <div className="level-system-selector-container">
            <h3>Chọn Hệ Thống Cấp Bậc</h3>

            {!isEditing ? (
                <div className="current-selection-display">
                    <p className="level-label">Loại cấp bậc:</p>
                    
                    <div className="selection-info">
                        <span className="system-name" title={currentSystem.description}>
                            {currentSystem.name}
                        </span>
                        <button 
                            onClick={() => setIsEditing(true)} 
                            className="change-btn"
                            aria-label="Thay đổi loại cấp bậc"
                        >
                            <FiEdit3 /> Thay đổi
                        </button>
                    </div>

                    <p className="equivalent-level">
                        <span className="level-label">Cấp bậc tương đương:</span>
                        <span className="level-value">
                            {equivalentLevel} 
                            <span className="base-level-note">(Cấp {currentUserLevel})</span>
                        </span>
                    </p>
                </div>
            ) : (
                <div className="system-selector-form">
                    <label htmlFor="level-system-select" className="level-label">
                        Chọn loại cấp bậc:
                    </label>
                    <div className="select-wrapper">
                        <select
                            id="level-system-select"
                            value={currentSystemKey}
                            onChange={handleSelectChange}
                        >
                            {LEVEL_SYSTEMS.map(system => (
                                <option key={system.key} value={system.key}>
                                    {system.name}
                                </option>
                            ))}
                        </select>
                        <FiChevronDown className="select-arrow" />
                    </div>
                    <button 
                        onClick={() => setIsEditing(false)} 
                        className="cancel-btn"
                    >
                        Hủy
                    </button>
                    <p className="system-description">{currentSystem.description}</p>
                    <p className="equivalent-level-live">
                        <span className="level-label">Cấp tương đương hiện tại:</span>
                        <span className="level-value-live">
                           {getSystemLevelForUser(currentUserLevel, currentSystemKey)}
                        </span>
                    </p>
                </div>
            )}

             <div className="system-table">
                <h4>Bảng Cấp Bậc Tương Đương ({currentSystem.name})</h4>
                <div className="table-header">
                    <span className="base-level-col">Cấp độ (Base)</span>
                    <span className="system-level-col">{currentSystem.name}</span>
                </div>
                {currentSystem.levels.map((levelName, index) => (
                    <div key={index} className="table-row">
                        <span className="base-level-col">Cấp {currentSystem.minLevels[index]} {currentSystem.minLevels[index] === 15 ? '+' : ''}</span>
                        <span className="system-level-col">{levelName}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LevelSystemSelector;