import React from 'react';
import Register from '../pages/Auth/Register/Register';
import Login from '../pages/Auth/Login/Login';
import Home from '../pages/Home/Home';
import ProjectDetail from '../pages/ProjectDetail/ProjectDetail';
import { isAuthenticated } from '../service/authService';
import { type Project } from '../service/projectService';

type Page = 'register' | 'login' | 'home' | 'project';

export default function App() {
    const [page, setPage] = React.useState<Page>(isAuthenticated() ? 'home' : 'register');
    const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);

    const openProject = (project: Project) => {
        setSelectedProject(project);
        setPage('project');
    };

    if (page === 'project' && selectedProject) {
        return (
            <ProjectDetail
                project={selectedProject}
                onBack={() => setPage('home')}
                onLogout={() => setPage('login')}
            />
        );
    }

    if (page === 'home') {
        return <Home onLogout={() => setPage('login')} onOpenProject={openProject} />;
    }

    if (page === 'login') {
        return <Login onGoToRegister={() => setPage('register')} onSuccess={() => setPage('home')} />;
    }

    return <Register onGoToLogin={() => setPage('login')} onSuccess={() => setPage('home')} />;
}
