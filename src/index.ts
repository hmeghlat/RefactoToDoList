import express = require('express');
const app = express();
import db = require('./backend/persistence');
import { TodoService } from './domain/TodoService';
import getItems = require('./backend/routes/getItems');
import addItem = require('./backend/routes/addItem');
import updateItem = require('./backend/routes/updateItem');
import deleteItem = require('./backend/routes/deleteItem');

const port = process.env.PORT || 3000;
const todoService = new TodoService(db);

app.use(express.json());
app.use(express.static(__dirname + '/static'));

app.get('/items', getItems(todoService));
app.post('/items', addItem(todoService));
app.put('/items/:id', updateItem(todoService));
app.delete('/items/:id', deleteItem(todoService));

db.init().then(() => {
    app.listen(port, () => console.log(`Listening on port ${port}`));
}).catch((err) => {
    console.error(err);
    process.exit(1);
});

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
