// @ts-check
import { test, expect } from '@playwright/test';

// Ajout d'une tâche
test('taskIsAdded', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000');
    await page.getByPlaceholder('New Item').fill('TestDev '+browserName);
    await page.getByRole('button', { name: 'Add Item' }).click();

    const task = page.locator('.name', { hasText: 'TestDev' }).first();
    await expect(task).toBeVisible();

})


//Vérifie que la checkbox est coché quand on clique dessus (quand c'était pas encore coché)
test('checkboxIsChecked', async ({ page,browserName }) => {
    await page.goto('http://localhost:3000');

    const row = page.locator('.name', { hasText: 'TestDev ' + browserName }).first().locator('..');
    const checkbox = row.getByRole('button', { name: 'Mark item as complete' });
    await checkbox.click();
    await expect(checkbox).toHaveAttribute('aria-label', 'Mark item as incomplete');
})




//Suppression d'une tâche
test('taskIsDeleted', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000');
    const task = page.locator('.name', { hasText: 'TestDev '+ browserName }).first();
    const row = task.locator('..');
    await row.getByRole('button', { name: 'Remove Item' }).click();
    await expect(row).not.toBeVisible();
})

//Vérifie que le champ est vidé lors de l'ajout
test('textIsRemovedInField', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.getByPlaceholder('New Item').fill('test');
    await page.getByRole('button', { name: 'Add Item' }).click();

    await expect(page.getByPlaceholder('New Item')).toHaveValue('');
})


//Vérifie que le bouton add est disabled quand le champ est vide
test('buttonIsDisabled', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.getByPlaceholder('New Item').fill('');
    await expect(page.getByRole('button', { name: 'Add Item' })).toBeDisabled();
})

//Vérifie que le bouton add est enabled quand le champ n'est pas vide
test('buttonIsEnabled', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.getByPlaceholder('New Item').fill('test');
    await expect(page.getByRole('button', { name: 'Add Item' })).not.toBeDisabled();
})


