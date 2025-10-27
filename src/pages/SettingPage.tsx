import React, { useState, useEffect } from 'react';
import { FiMousePointer, FiArrowLeft, FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import './SettingPage.css'; 

import mikaelaPreview from '../cursors/Mikaela_Hykuya.png'; 
import krulTepesPreview from '../cursors/Krul_Tepes.png'; 
import enePreview from '../cursors/Ene.png'; 
import YuichiroPreview from '../cursors/Yuichiro.png'; 

const CURSOR_STORAGE_KEY = 'storyverse_custom_cursor_pack';

interface CursorPack {
    id: string;
    name: string;
    basePath: string; 
    defaultFile: string;
    previewImage: string; 
}

const CURSOR_FILE_NAMES: { [key: string]: string } = {
    'default': 'Alternative.cur',
    'pointer': 'link.cur',
    'text': 'Escritura a Mano.cur',
    'move': 'movec.cur',
    'help': 'ayuda.cur',
    'nwse': 'diagonal resize 1.cur',
    'nesw': 'diagonal resize 2.cur',
    'ew': 'horizontal.cur',
};

const CURSOR_PACKS: CursorPack[] = [
    {
        id: 'Mikaela',
        name: 'Mikaela Hyakuya',
        basePath: '../../src/cursors/Mikaela_Hykuya_Cursor',
        defaultFile: CURSOR_FILE_NAMES['default'],
        previewImage: mikaelaPreview, 
    },
    {
        id: 'KrulTepes',
        name: 'Krul Tepes',
        basePath: '../../src/cursors/Krul_Tepes_Cursor',
        defaultFile: CURSOR_FILE_NAMES['default'],
        previewImage: krulTepesPreview, 
    },
    {
        id: 'Ene',
        name: 'Ene',
        basePath: '../../src/cursors/Ene_Cursor',
        defaultFile: CURSOR_FILE_NAMES['default'],
        previewImage: enePreview, 
    },
       {
        id: 'YuichiroHyakuya',
        name: 'Yuichiro Hyakuya',
        basePath: '../../src/cursors/Yuichiro_Hyakuya_Cursor',
        defaultFile: CURSOR_FILE_NAMES['default'],
        previewImage: YuichiroPreview, 
    },
];

const applyCursorStyles = (packId: string) => {
    const selectedPack = CURSOR_PACKS.find(p => p.id === packId);
    if (!selectedPack) return;

    const root = document.documentElement;

    root.style.setProperty('--cursor-path-default', `url('${selectedPack.basePath}/${CURSOR_FILE_NAMES['default']}')`);
    root.style.setProperty('--cursor-path-pointer', `url('${selectedPack.basePath}/${CURSOR_FILE_NAMES['pointer']}')`);
    root.style.setProperty('--cursor-path-text', `url('${selectedPack.basePath}/${CURSOR_FILE_NAMES['text']}')`);
    root.style.setProperty('--cursor-path-move', `url('${selectedPack.basePath}/${CURSOR_FILE_NAMES['move']}')`);
    root.style.setProperty('--cursor-path-help', `url('${selectedPack.basePath}/${CURSOR_FILE_NAMES['help']}')`);
    root.style.setProperty('--cursor-path-nwse', `url('${selectedPack.basePath}/${CURSOR_FILE_NAMES['nwse']}')`);
    root.style.setProperty('--cursor-path-nesw', `url('${selectedPack.basePath}/${CURSOR_FILE_NAMES['nesw']}')`);
    root.style.setProperty('--cursor-path-ew', `url('${selectedPack.basePath}/${CURSOR_FILE_NAMES['ew']}')`);

    root.style.setProperty('cursor', `var(--cursor-path-default), default`, 'important');
};


const SettingsPage: React.FC = () => {
    const { showNotification } = useNotification();
    const [selectedPackId, setSelectedPackId] = useState<string>(() => {
        const storedId = localStorage.getItem(CURSOR_STORAGE_KEY);
        const initialPackId = storedId && CURSOR_PACKS.find(p => p.id === storedId)
                                ? storedId
                                : CURSOR_PACKS[0].id;
        return initialPackId;
    });

    useEffect(() => {
        applyCursorStyles(selectedPackId);
        localStorage.setItem(CURSOR_STORAGE_KEY, selectedPackId);
    }, [selectedPackId]);

    useEffect(() => {
        applyCursorStyles(selectedPackId);
    }, []);

    const handlePackSelect = (packId: string) => {
        setSelectedPackId(packId);
        showNotification(`Đã đổi bộ con trỏ mặc định sang ${CURSOR_PACKS.find(opt => opt.id === packId)?.name}`, 'success');
    };

    const previewPack = CURSOR_PACKS.find(opt => opt.id === selectedPackId) || CURSOR_PACKS[0];
    const previewCursorUrl = `url('${previewPack.basePath}/${CURSOR_FILE_NAMES['default']}')`;


    return (
        <div className="settings-page-container">
            <div className="settings-content-wrapper">
                <Link to="/profile" className="settings-back-btn"><FiArrowLeft /> Quay lại Hồ sơ</Link>

                <h1 className="settings-page-title"><FiSettings /> Cài Đặt </h1>

                <div className="settings-card">
                    <h2>Tùy Chỉnh Con Trỏ Chuột Anime</h2>
                    <p className="description">
                        Chọn con trỏ chuột bạn muốn sử dụng. 
                    </p>

                    <div className="cursor-pack-options">
                        {CURSOR_PACKS.map(pack => (
                            <div
                                key={pack.id}
                                className={`cursor-option ${selectedPackId === pack.id ? 'selected' : ''}`}
                                onClick={() => handlePackSelect(pack.id)}
                            >
                                <img
                                    src={pack.previewImage}
                                    alt={pack.name}
                                    className="cursor-option-image"
                                />
                                <p className="cursor-option-name">{pack.name}</p>
                            </div>
                        ))}
                    </div>                   
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;