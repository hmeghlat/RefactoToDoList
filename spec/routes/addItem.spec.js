jest.mock('uuid', () => ({ v4: jest.fn() }));

jest.mock('../../src/domain/TodoService', () => ({
    TodoService: jest.fn().mockImplementation(() => ({
        addItem: jest.fn(),
    })),
}));

const { TodoService } = require('../../src/domain/TodoService');
const addItem = require('../../src/backend/routes/addItem');
const { v4: uuid } = require('uuid');

test('it stores item correctly', async () => {
    const id = 'something-not-a-uuid';
    const name = 'A sample item';
    const req = { body: { name } };
    const res = { send: jest.fn() };

    const expectedItem = { id, name, completed: false };
    const service = new TodoService();
    service.addItem.mockReturnValue(Promise.resolve(expectedItem));

    await addItem(service)(req, res);

    expect(service.addItem.mock.calls.length).toBe(1);
    expect(service.addItem.mock.calls[0][0]).toBe(name);
    expect(res.send.mock.calls[0].length).toBe(1);
    expect(res.send.mock.calls[0][0]).toEqual(expectedItem);
});
