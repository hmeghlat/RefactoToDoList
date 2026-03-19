import React from 'react';
import style from '../../pages/ProjectDetail/ProjectDetail.module.css';

interface Props {
    initials: string;
    fullName: string;
    onBack: () => void;
    onLogout: () => void;
}

export default function ProjectHeader({ initials, fullName, onBack, onLogout }: Props) {
    return (
        <header className={style.header}>
            <div className={style.headerLeft}>
                <button className={style.backBtn} onClick={onBack} title="Retour">←</button>
                <span className={style.brand}>TRAVAIL</span>
            </div>
            <div className={style.userArea}>
                <div className={style.avatar}>{initials}</div>
                <span className={style.userName}>{fullName}</span>
                <button className={style.logoutBtn} onClick={onLogout}>Se déconnecter</button>
            </div>
        </header>
    );
}
