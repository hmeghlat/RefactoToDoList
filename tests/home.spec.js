// @ts-check
import { test, expect } from '@playwright/test';

const FAKE_USER = { id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@test.com' };
const FAKE_TOKEN = 'fake-jwt-token';

const FAKE_PROJECTS = [
    { id: 1, name: 'Projet Alpha', description: 'Description Alpha', status: 'IN_PROGRESS', startDate: '2025-01-01', dueDate: '2025-06-01', budget: 5000 },
    { id: 2, name: 'Projet Beta',  description: null,                 status: 'DONE',        startDate: null,          dueDate: null,          budget: 0    },
];

test.describe('Page Home', () => {

    test.beforeEach(async ({ page }) => {
        // Mocker l'API projets avant le chargement de la page
        await page.route('http://localhost:8080/projects/**', route =>
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ projects: FAKE_PROJECTS }) })
        );

        // Injecter l'auth dans le localStorage puis recharger
        await page.goto('/');
        await page.evaluate(({ user, token }) => {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
        }, { user: FAKE_USER, token: FAKE_TOKEN });
        await page.reload();

        await expect(page.getByRole('heading', { name: 'Mes projets' })).toBeVisible();
    });

    // 1 - Le header affiche le nom complet de l'utilisateur et le bouton déconnexion
    test("affiche le nom de l'utilisateur et le bouton déconnexion", async ({ page }) => {
        await expect(page.getByText('Jean Dupont')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Se déconnecter' })).toBeVisible();
    });

    // 2 - La liste des projets s'affiche avec le bon nombre
    test('affiche les projets et leur nombre', async ({ page }) => {
        await expect(page.getByText('2 projets')).toBeVisible();
        await expect(page.getByText('Projet Alpha')).toBeVisible();
        await expect(page.getByText('Projet Beta')).toBeVisible();
    });

    // 3 - Cliquer sur "+ Nouveau projet" ouvre la modal de création
    test('cliquer sur Nouveau projet ouvre la modal', async ({ page }) => {
        await page.getByRole('button', { name: '+ Nouveau projet' }).click();

        await expect(page.getByRole('heading', { name: 'Nouveau projet' })).toBeVisible();
        await expect(page.getByPlaceholder('Mon projet')).toBeVisible();
    });

    // 4 - La modal de création affiche tous les champs attendus
    test('la modal de création contient tous les champs', async ({ page }) => {
        await page.getByRole('button', { name: '+ Nouveau projet' }).click();

        await expect(page.getByPlaceholder('Mon projet')).toBeVisible();
        await expect(page.getByPlaceholder('Description optionnelle...')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Créer le projet' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible();
    });

    // 5 - Cliquer sur "Annuler" ferme la modal
    test('cliquer sur Annuler ferme la modal', async ({ page }) => {
        await page.getByRole('button', { name: '+ Nouveau projet' }).click();
        await expect(page.getByRole('heading', { name: 'Nouveau projet' })).toBeVisible();

        await page.getByRole('button', { name: 'Annuler' }).click();

        await expect(page.getByRole('heading', { name: 'Nouveau projet' })).not.toBeVisible();
    });

});
