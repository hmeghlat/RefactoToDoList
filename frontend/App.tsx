import React from 'react';
import Register from './pages/Auth/Register/Register';
import Login from './pages/Auth/Login/Login';
import Home from './pages/Home/Home';
import ProjectDetail from './pages/ProjectDetail/ProjectDetail';
import SessionExpiredModal from './component/SessionExpiredModal';
import NotificationToast from './component/NotificationToast';
import { isAuthenticated } from './service/authService';
import { type Project } from './service/projectService';
import { UNAUTHORIZED_EVENT } from './utils/fetchWithAuth';
import { useNotifications } from './hooks/useNotifications';

type Page = 'register' | 'login' | 'home' | 'project';

export default function App() {
    const [page, setPage] = React.useState<Page>(isAuthenticated() ? 'home' : 'register');
    const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
    const [sessionExpired, setSessionExpired] = React.useState(false);
    const { notifications, dismiss } = useNotifications();

    React.useEffect(() => {
        const handler = () => setSessionExpired(true);
        window.addEventListener(UNAUTHORIZED_EVENT, handler);
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
    }, []);

    const openProject = (project: Project) => {
        setSelectedProject(project);
        setPage('project');
    };

    const handleReconnect = () => {
        setSessionExpired(false);
        setPage('login');
    };

    let content: React.ReactNode;
    if (page === 'project' && selectedProject) {
        content = (
            <ProjectDetail
                project={selectedProject}
                onBack={() => setPage('home')}
                onLogout={() => setPage('login')}
            />
        );
    } else if (page === 'home') {
        content = <Home onLogout={() => setPage('login')} onOpenProject={openProject} />;
    } else if (page === 'login') {
        content = <Login onGoToRegister={() => setPage('register')} onSuccess={() => setPage('home')} />;
    } else {
        content = <Register onGoToLogin={() => setPage('login')} onSuccess={() => setPage('home')} />;
    }

    return (
        <>
            {content}
            {sessionExpired && <SessionExpiredModal onReconnect={handleReconnect} />}
            <NotificationToast notifications={notifications} onDismiss={dismiss} />
        </>
    );
}
