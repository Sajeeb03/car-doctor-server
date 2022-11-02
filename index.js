const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
//middle ware
app.use(cors());
app.use(express.json());

const uri = 'mongodb://0.0.0.0:27017';
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lrzk4et.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri)
// console.log(uri)

async function connectDb() {
    try {
        await client.connect();
        const Products = client.db('car-doc').collection('products')
        const result = await Products.insertOne({ name: "car-oil" })
        console.log('dB connected')
        console.log(result);
    } catch (error) {
        console.log(error.name, error.message)
    }
}

connectDb();

app.get('/', (req, res) => {
    console.log('car-doctor-server is running')
})

app.listen(port, () => {
    console.log(`Server is running at port: ${port}`);
})