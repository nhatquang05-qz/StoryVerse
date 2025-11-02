import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { FiChevronDown, FiHelpCircle, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { LEVEL_SYSTEMS, getEquivalentLevelTitle as getEquivalentLevelTitleUtil } from '../../utils/authUtils'; 
import '../../styles/LevelSystemSelector.css';

interface LevelSelectorProps {
    currentUserLevel: number;
    currentSystemKey: string;
    onSystemChange: (newSystemKey: string) => void;
    currentLevelColor: string;
}

const LevelSystemSelector: React.FC<LevelSelectorProps> = ({ currentUserLevel, currentSystemKey, onSystemChange, currentLevelColor }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempSystemKey, setTempSystemKey] = useState(currentSystemKey);
    const selectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTempSystemKey(currentSystemKey);
    }, [currentSystemKey]);

    const liveSystem = useMemo(() =>
        LEVEL_SYSTEMS.find(s => s.key === tempSystemKey) || LEVEL_SYSTEMS[0]
    , [tempSystemKey]);

    const liveEquivalentLevel = useMemo(() => {
        return getEquivalentLevelTitleUtil(currentUserLevel, tempSystemKey);
    }, [currentUserLevel, tempSystemKey]);

    const equivalentLevel = useMemo(() => {
        return getEquivalentLevelTitleUtil(currentUserLevel, currentSystemKey);
    }, [currentUserLevel, currentSystemKey]);

    const handleEditClick = () => {
        setTempSystemKey(currentSystemKey);
        setIsEditing(true);
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newKey = e.target.value;
        setTempSystemKey(newKey);
    };
    
    const handleSaveClick = () => {
        if (tempSystemKey !== currentSystemKey) {
            onSystemChange(tempSystemKey);
        }
        setIsEditing(false);
    };
    
    const handleCancelClick = () => {
        setTempSystemKey(currentSystemKey);
        setIsEditing(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
                handleCancelClick(); 
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [currentSystemKey]);

    const hasPendingChanges = tempSystemKey !== currentSystemKey;

    return (
        <div className="level-system-selector-wrapper" ref={selectorRef}>
            <div className="system-current-info">
                <span className="level-label">Hệ thống:</span>
                 {!isEditing ? (
                    <>
                        <span
                            className="system-name-display"
                            style={{ color: currentLevelColor, borderColor: currentLevelColor }}
                            title={liveSystem.description}
                        >
                            {liveSystem.name} <FiHelpCircle style={{verticalAlign: 'middle', marginLeft: '4px'}}/>
                        </span>
                        <button
                            onClick={handleEditClick}
                            className="change-system-btn"
                            style={{ color: currentLevelColor, textDecoration: 'underline' }}
                            aria-label="Thay đổi loại cấp bậc"
                        >
                            Thay đổi
                        </button>
                    </>
                 ) : (
                    <div className="system-selector-form-inline-minimal">
                        <div className="select-wrapper">
                            <select
                                id="level-system-select"
                                value={tempSystemKey}
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
                    </div>
                 )}
            </div>
             <div className="equivalent-level-display">
                <span className="level-label">Cấp bậc tương đương:</span>
                <span className="level-value" style={{fontWeight: 'bold', color: 'var(--clr-text)'}}>
                    {equivalentLevel}
                </span>
            </div>
            
             {isEditing && (
                 <div className="system-info-editing">
                    <p className="system-description">
                        **Mô tả:** {liveSystem.description}
                    </p>
                    <p className="equivalent-level-live">
                        <span className="level-label">Cấp tương đương (Xem trước):</span>
                        <span className="level-value-live" style={{fontWeight: 'bold'}}>
                           {liveEquivalentLevel}
                        </span>
                    </p>
                    <div className="action-buttons-group">
                        <button 
                            onClick={handleSaveClick} 
                            className="btn btn-save" 
                            disabled={!hasPendingChanges}
                            style={{ marginRight: '1rem' }}
                        >
                            <FiSave style={{ marginRight: '0.5rem' }} /> Lưu
                        </button>
                        <button 
                            onClick={handleCancelClick} 
                            className="btn btn-cancel"
                        >
                            <FiX style={{ marginRight: '0.5rem' }} /> Hủy
                        </button>
                    </div>
                </div>
             )}
        </div>
    );
};

export default LevelSystemSelector;