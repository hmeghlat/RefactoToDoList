// @ts-check
import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

async function deleteTasksByName(page, name) {
    const items = await page.evaluate(async (filter) => {
        const res = await fetch('/items');
        const all = await res.json();
        return all.filter(i => i.name.includes(filter));
    }, name);

    for (const item of items) {
        await page.evaluate(async (id) => {
            await fetch(`/items/${id}`, { method: 'DELETE' });
        }, item.id);
    }
}


async function addTask(page, name) {
    await page.evaluate(async (taskName) => {
        await fetch('/items', {
            method: 'POST',
            body: JSON.stringify({ name: taskName }),
            headers: { 'Content-Type': 'application/json' },
        });
    }, name);
}

test.afterEach(async ({ page, browserName }) => {
    await page.goto('http://localhost:3000');
    await deleteTasksByName(page, browserName);
});

// Ajout d'une tâche
test('taskIsAdded', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000');
    const taskName = 'TestDev addTask'+browserName;
    await page.getByPlaceholder('New Item').fill(taskName);
    await page.getByRole('button', { name: 'Add Item' }).click();

    const task = page.locator('.name', { hasText: taskName }).first();
    await expect(task).toBeVisible();

})

//Vérifie que la checkbox est coché quand on clique dessus (quand c'était pas encore coché)
test('checkboxIsChecked', async ({ page,browserName }) => {
    await page.goto('http://localhost:3000');
    await addTask(page, 'TestDev ' + browserName);
    await page.reload();

    const row = page.locator('.name', { hasText: 'TestDev ' + browserName }).first().locator('..');
    const checkbox = row.locator('.toggles');
    await checkbox.click();
    await expect(checkbox).toHaveAttribute('aria-label', 'Mark item as incomplete');
    await deleteTasksByName(page, 'TestDev ' + browserName);
})


//Vérifie que la checkbox est décoché quand on clique dessus (quand c'était déjà coché)
test('checkboxIsUnchecked', async ({ page,browserName }) => {
    await page.goto('http://localhost:3000');
    await addTask(page, 'TestDev ' + browserName);
    await page.reload();

    const row = page.locator('.name', { hasText: 'TestDev ' + browserName }).first().locator('..');
    const checkbox = row.locator('.toggles');
    await checkbox.click();
    await checkbox.click();
    await expect(checkbox).toHaveAttribute('aria-label', 'Mark item as complete');
    await deleteTasksByName(page, 'TestDev ' + browserName);
})


//Suppression d'une tâche
test('taskIsDeleted', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000');
    const taskName = 'TestDev deleteTask'+browserName;
    await addTask(page, taskName);
    await page.reload();
    const task = page.locator('.name', { hasText: taskName }).first();
    const row = task.locator('..');
    await row.getByRole('button', { name: 'Remove Item' }).click();
    await expect(task).toHaveCount(0);
})

//Vérifie que le champ est vidé lors de l'ajout
test('textIsRemovedInField', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000');
    await page.getByPlaceholder('New Item').fill('test '+browserName);
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
test('buttonIsEnabled', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000');
    await page.getByPlaceholder('New Item').fill('test '+ browserName);
    await expect(page.getByRole('button', { name: 'Add Item' })).not.toBeDisabled();
})


