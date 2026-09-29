const express = require('express');

const app = express();
const PORT = 3000;

let books = [
    { id: 1, title: 'The Hobbit', author: 'Tolkien' },
    { id: 2, title: 'Dune', author: 'Herbert' }
];

let nextId = 3;

app.use(express.json());

function logger(req, res, next) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
}

function timer(req, res, next) {
    const start = Date.now();

    res.on('finish', () => {
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} Request completed in ${Date.now() - start} ms`
        );
    });

    next();
}

function checkApiKey(req, res, next) {
    if (req.headers['x-api-key'] === '12345') {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

app.use(logger);
app.use(timer);

app.get('/', (req, res) => {
    res.send('Welcome to ExpressJS Routing Demo');
});

app.get('/user/:id', (req, res) => {
    res.send(`User ID: ${req.params.id}`);
});

app.get('/search', (req, res) => {
    const q = req.query.q || '';
    const limit = req.query.limit || '';

    res.send(`Searching for '${q}', limit ${limit}`);
});

app.get('/url', (req, res) => {
    res.json({
        originalUrl: req.originalUrl
    });
});

app.get('/redirect', (req, res) => {
    res.redirect('/');
});

app.get('/books', (req, res) => {
    res.json(books);
});

app.get('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).send('Book Not Found');
    }

    res.json(book);
});

app.post('/books', (req, res) => {
    const { title, author } = req.body;

    if (!title || !author) {
        return res.status(400).send('Title and author are required');
    }

    const book = {
        id: nextId++,
        title,
        author
    };

    books.push(book);

    res.status(201).json(book);
});

app.delete('/books/:id', checkApiKey, (req, res) => {
    const id = parseInt(req.params.id);
    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        return res.status(404).send('Book Not Found');
    }

    books.splice(index, 1);
    res.status(204).send();
});

app.use((req, res) => {
    res.status(404).send('Route Not Found');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});