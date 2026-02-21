// @ts-check
import { test, expect } from '@playwright/test';


test.describe.configure({ mode: 'serial' });

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} name
 */
async function deleteTasksByName(page, name) {
    const items = await page.evaluate(
        /** @param {string} filter */ async (filter) => {
        const res = await fetch('/items');
        /** @type {{ id: string, name: string }[]} */
        const all = await res.json();
        return all.filter((i) => i.name.includes(filter));
    },
        name,
    );

    for (const item of items) {
        await page.evaluate(
            /** @param {string} id */ async (id) => {
            await fetch(`/items/${id}`, { method: 'DELETE' });
        },
            item.id,
        );
    }
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} name
 */
async function addTask(page, name) {
    await page.evaluate(
        /** @param {string} taskName */ async (taskName) => {
        await fetch('/items', {
            method: 'POST',
            body: JSON.stringify({ name: taskName }),
            headers: { 'Content-Type': 'application/json' },
        });
    },
        name,
    );
}

// Fonction utilitaire pour récupérer la ligne d'une tâche par son nom
/**
 * @param {import('@playwright/test').Page} page
 * @param {string} taskName
 * @returns {import('@playwright/test').Locator}
 */
function getTaskRow(page, taskName) {
    return page.locator('.name', { hasText: taskName }).first().locator('..');
}

test.afterEach(async ({ page, browserName }) => {
    await page.goto('/');
    await deleteTasksByName(page, browserName);
});

// Ajout d'une tâche
test('taskIsAdded', async ({ page, browserName }) => {
    await page.goto('/');
    const taskName = 'TestDev addTask ' + browserName;
    await page.getByPlaceholder('New Item').fill(taskName);
    await page.getByRole('button', { name: 'Add Item' }).click();

    await expect(page.locator('.name', { hasText: taskName })).toBeVisible();
})

//Vérifie que la checkbox est coché quand on clique dessus (quand c'était pas encore coché)
test('checkboxIsChecked', async ({ page, browserName }) => {
    await page.goto('/');
    const taskName = 'TestDev checked ' + browserName;
    await addTask(page, taskName);
    await page.reload();

    const row = getTaskRow(page, taskName);
    await row.getByRole('button', { name: 'Mark item as complete' }).click();
    await expect(row.getByRole('button', { name: 'Mark item as incomplete' })).toBeVisible();
})

//Vérifie que la checkbox est décoché quand on clique dessus (quand c'était déjà coché)
test('checkboxIsUnchecked', async ({ page, browserName }) => {
    await page.goto('/');
    const taskName = 'TestDev unchecked ' + browserName;
    await addTask(page, taskName);
    await page.reload();

    const row = getTaskRow(page, taskName);
    await row.getByRole('button', { name: 'Mark item as complete' }).click();
    await expect(row.getByRole('button', { name: 'Mark item as incomplete' })).toBeVisible();
    await row.getByRole('button', { name: 'Mark item as incomplete' }).click();
    await expect(row.getByRole('button', { name: 'Mark item as complete' })).toBeVisible();
})

//Suppression d'une tâche
test('taskIsDeleted', async ({ page, browserName }) => {
    await page.goto('/');
    const taskName = 'TestDev deleteTask ' + browserName;
    await addTask(page, taskName);
    await page.reload();

    const row = getTaskRow(page, taskName);
    await row.getByRole('button', { name: 'Remove Item' }).click();
    await expect(page.locator('.name', { hasText: taskName })).toHaveCount(0);
})

//Vérifie que le champ est vidé lors de l'ajout
test('textIsRemovedInField', async ({ page, browserName }) => {
    await page.goto('/');
    await page.getByPlaceholder('New Item').fill('test ' + browserName);
    await page.getByRole('button', { name: 'Add Item' }).click();

    await expect(page.getByPlaceholder('New Item')).toHaveValue('');
})

//Vérifie que le bouton add est disabled quand le champ est vide
test('buttonIsDisabled', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('New Item').fill('');
    await expect(page.getByRole('button', { name: 'Add Item' })).toBeDisabled();
})

//Vérifie que le bouton add est enabled quand le champ n'est pas vide
test('buttonIsEnabled', async ({ page, browserName }) => {
    await page.goto('/');
    await page.getByPlaceholder('New Item').fill('test ' + browserName);
    await expect(page.getByRole('button', { name: 'Add Item' })).not.toBeDisabled();
})
