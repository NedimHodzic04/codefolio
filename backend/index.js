import express from 'express';
const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.get('/', (req, res) => {
    res.send("Welcome");
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})