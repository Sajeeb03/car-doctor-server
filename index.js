const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId, ConnectionPoolClosedEvent } = require('mongodb');
const jwt = require("jsonwebtoken")
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
//middle ware
app.use(cors());
app.use(express.json());

// const uri = 'mongodb://0.0.0.0:27017';
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lrzk4et.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri)

const verifyJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized Access" })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECURE, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Unauthorized Access" })
        }
        req.decoded = decoded;
        next();
    })
}

// console.log(uri)

async function connectDb() {
    try {
        await client.connect();

        console.log('dB connected')

    } catch (error) {
        console.log(error.name, error.message)
    }
}

connectDb();
//endpoints
const Services = client.db("car-doc").collection("services")
const Orders = client.db("car-doc").collection("orders")


app.post("/services", async (req, res) => {
    try {
        const result = await Services.insertOne(req.body)
        res.send({
            status: true,
            message: "data inserted"
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})


//to get all services
app.get('/services', async (req, res) => {
    try {
        const services = await Services.find({}).toArray();
        res.send(services)
    } catch (error) {

    }
})

//to get a single service

app.get('/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Services.findOne({ _id: ObjectId(id) });
        res.send({
            success: true,
            data: service
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

//to set the orders 
app.post('/orders', verifyJwt, async (req, res) => {
    try {
        const result = await Orders.insertOne(req.body)
        res.send({
            success: true,
            message: 'order placed',
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

//get orders data 
app.get('/orders', verifyJwt, async (req, res) => {
    try {
        if (req.decoded.user !== req.query.email) {
            return res.status(403).send({ message: "Forbidden access" })
        }

        let query = {};
        if (req.query.email) {
            query = {
                email: req.query.email,
            }
        }

        const orders = await Orders.find(query).toArray();
        res.send({
            success: true,
            data: orders
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})


app.delete('/orders/:id', verifyJwt, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Orders.deleteOne({ _id: ObjectId(id) });
        if (result.deletedCount) {
            res.send({
                success: true,
                message: "Deletion successful",
            })
        }
        else {
            res.send({
                success: false,
                message: "Operation unsuccessful"
            })
        }
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})
// app.delete('/orders', async (req, res) => {
//     const result = await Orders.deleteMany({})
//     res.send(result)
// })
app.patch('/orders/:id', verifyJwt, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Orders.updateOne({ _id: ObjectId(id) }, { $set: req.body })
        if (result.modifiedCount) {
            res.send({
                success: true,
                message: "Updated"
            })
        }
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

//create jwt token 
app.post("/jwt", (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECURE, { expiresIn: '1h' });
    res.send({
        token: token
    })
})

app.get('/', (req, res) => {
    res.send('car-doctor-server is running')
})

app.listen(port, () => {
    console.log(`Server is running at port: ${port}`);
})
