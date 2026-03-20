// @ts-check
import { test, expect } from '@playwright/test';

test.describe("Page Register", () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByText("S'inscrire").click();
        await expect(page.getByRole('heading', { name: 'Créer un compte' })).toBeVisible();
    });

    // 1 - Tous les champs du formulaire sont présents
    test('affiche tous les champs et le bouton inscription', async ({ page }) => {
        await expect(page.locator('#firstName')).toBeVisible();
        await expect(page.locator('#lastName')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.getByRole('button', { name: "S'inscrire" })).toBeVisible();
    });

    // 2 - Les champs sont vides par défaut
    test('les champs sont vides à l\'ouverture', async ({ page }) => {
        await expect(page.locator('#firstName')).toHaveValue('');
        await expect(page.locator('#lastName')).toHaveValue('');
        await expect(page.locator('#email')).toHaveValue('');
        await expect(page.locator('#password')).toHaveValue('');
    });

    // 3 - Inscription avec email déjà utilisé → message d'erreur
    test('inscription avec email déjà utilisé affiche une erreur', async ({ page }) => {
        await page.route('**/auth/register', route =>
            route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ message: 'Email already registered' }) })
        );

        await page.locator('#firstName').fill('Jean');
        await page.locator('#lastName').fill('Dupont');
        await page.locator('#email').fill('jean.dupont@test.com');
        await page.locator('#password').fill('Password123');
        await page.getByRole('button', { name: "S'inscrire" }).click();

        await expect(page.locator('[class*="error"]')).toBeVisible();
    });

    // 4 - Inscription réussie → l'app appelle onSuccess (mock API)
    test('inscription valide redirige vers la page d\'accueil', async ({ page }) => {
        await page.route('**/auth/register', route =>
            route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({
                    token: 'fake-jwt-token',
                    user: { id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@test.com' },
                }),
            })
        );
        await page.route('**/projects', route =>
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
        );

        await page.locator('#firstName').fill('Jean');
        await page.locator('#lastName').fill('Dupont');
        await page.locator('#email').fill('jean.dupont@test.com');
        await page.locator('#password').fill('Password123');
        await page.getByRole('button', { name: "S'inscrire" }).click();

        await expect(page.getByRole('heading', { name: 'Mes projets' })).toBeVisible();
    });

    // 5 - Cliquer sur "Se connecter" revient à la page de login
    test('cliquer sur Se connecter revient à la page de login', async ({ page }) => {
        await page.getByText('Se connecter').click();

        await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible();
    });

});
