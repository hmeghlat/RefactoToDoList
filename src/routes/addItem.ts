import { TodoService } from '../domain/TodoService';

export = (todoService: TodoService) => async (req: any, res: any) => {
    const item = await todoService.addItem(req.body.name);
    res.send(item);
};
