import { TodoService } from '../../domain/TodoService';

export = (todoService: TodoService) => async (req: any, res: any) => {
    const items = await todoService.getItems();
    res.send(items);
};
