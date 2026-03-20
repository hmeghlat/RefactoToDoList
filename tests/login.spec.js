// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Page Login', () => {

    // L'app démarre sur Register par défaut → on navigue vers Login
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByText('Se connecter').click();
        await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible();
    });

    // 1 - Le formulaire s'affiche avec tous ses éléments
    test('affiche le titre, les champs et le bouton', async ({ page }) => {
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
    });

    // 2 - La marque TRAVAIL est visible dans le panneau gauche
    test('affiche la marque TRAVAIL', async ({ page }) => {
        await expect(page.getByText('TRAVAIL').first()).toBeVisible();
    });

    // 3 - Connexion avec identifiants invalides → message d'erreur
    test('connexion avec mauvais identifiants affiche une erreur', async ({ page }) => {
        await page.route('**/auth/login', route =>
            route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Email ou mot de passe incorrect' }) })
        );

        await page.locator('#email').fill('inconnu@test.com');
        await page.locator('#password').fill('mauvaisMotDePasse');
        await page.getByRole('button', { name: 'Se connecter' }).click();

        await expect(page.getByText('Email ou mot de passe incorrect')).toBeVisible();
    });

    // 4 - Le bouton est désactivé pendant la requête (état "loading")
    test('le bouton affiche "Connexion..." pendant le chargement', async ({ page }) => {
        await page.route('**/auth/login', async route => {
            await new Promise(r => setTimeout(r, 800));
            await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Erreur' }) });
        });

        await page.locator('#email').fill('test@test.com');
        await page.locator('#password').fill('motdepasse');
        await page.getByRole('button', { name: 'Se connecter' }).click();

        await expect(page.getByRole('button', { name: 'Connexion en cours...' })).toBeDisabled();
    });

    // 5 - Cliquer sur "S'inscrire" navigue vers la page d'inscription
    test("cliquer sur S'inscrire affiche la page d'inscription", async ({ page }) => {
        await page.getByText("S'inscrire").click();

        await expect(page.getByRole('heading', { name: 'Créer un compte' })).toBeVisible();
    });

});
