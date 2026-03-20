// @ts-check
import { test, expect } from '@playwright/test';

const FAKE_USER    = { id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@test.com' };
const FAKE_TOKEN   = 'fake-jwt-token';
const FAKE_PROJECT = { id: 1, name: 'Projet Alpha', description: 'Un super projet', status: 'IN_PROGRESS', startDate: '2025-01-01', dueDate: '2025-06-01', budget: 5000 };

const FAKE_TASKS = [
    { id: 1, name: 'Tâche A', description: '', status: 'TODO',        priority: 'HIGH',   projectId: 1, assignedUserId: 1, dueDate: null },
    { id: 2, name: 'Tâche B', description: '', status: 'IN_PROGRESS', priority: 'MEDIUM', projectId: 1, assignedUserId: 1, dueDate: null },
    { id: 3, name: 'Tâche C', description: '', status: 'DONE',        priority: 'LOW',    projectId: 1, assignedUserId: 1, dueDate: null },
];

test.describe('Page ProjectDetail', () => {

    test.beforeEach(async ({ page }) => {
        // Mocker les API avant le chargement
        await page.route('http://localhost:8080/projects/**', route =>
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ projects: [FAKE_PROJECT] }) })
        );
        await page.route('http://localhost:8080/tasks/**', route =>
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tasks: FAKE_TASKS }) })
        );

        // Injecter l'auth et recharger
        await page.goto('/');
        await page.evaluate(({ user, token }) => {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
        }, { user: FAKE_USER, token: FAKE_TOKEN });
        await page.reload();

        // Naviguer vers le détail du projet
        await expect(page.getByText('Projet Alpha')).toBeVisible();
        await page.getByText('Projet Alpha').click();
        await expect(page.getByRole('heading', { name: 'Projet Alpha' })).toBeVisible();
    });

    // 1 - Le nom et le statut du projet s'affichent dans la barre
    test('affiche le nom et le statut du projet', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Projet Alpha' })).toBeVisible();
        await expect(page.getByText('En cours')).toBeVisible();
    });

    // 2 - Le board Kanban affiche bien les 4 colonnes
    test('le kanban affiche les 4 colonnes', async ({ page }) => {
        await expect(page.getByText('À faire')).toBeVisible();
        await expect(page.getByText('Commencé')).toBeVisible();
        await expect(page.getByText('Terminé')).toBeVisible();
        await expect(page.getByText('Annulé')).toBeVisible();
    });

    // 3 - Les tâches s'affichent dans leurs colonnes
    test("les tâches s'affichent dans leurs colonnes respectives", async ({ page }) => {
        await expect(page.getByText('Tâche A')).toBeVisible();
        await expect(page.getByText('Tâche B')).toBeVisible();
        await expect(page.getByText('Tâche C')).toBeVisible();
    });

    // 4 - Cliquer sur "+ Nouvelle tâche" ouvre la modal de création
    test('cliquer sur Nouvelle tâche ouvre la modal', async ({ page }) => {
        await page.getByRole('button', { name: '+ Nouvelle tâche' }).click();

        await expect(page.getByRole('heading', { name: 'Nouvelle tâche' })).toBeVisible();
    });

    // 5 - Cliquer sur le bouton retour ramène à la liste des projets
    test('le bouton retour ramène à la liste des projets', async ({ page }) => {
        await page.getByTitle('Retour').click();

        await expect(page.getByRole('heading', { name: 'Mes projets' })).toBeVisible();
    });

});
