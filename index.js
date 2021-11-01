const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 7000;

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hjclg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db("universTour");
        const offeringsCollection = database.collection("offerings");
        const orderCollection = database.collection("orders")

        //POST API
        app.post('/order', async (req, res) => {
            const order = req.body;
            const query = { serviceId: order.serviceId, email: order.email };
            const findOrder = orderCollection.findOne(query);
            if (findOrder) {
                res.json("Data already added")
            }
            else {
                const result = await orderCollection.insertOne(order);
                res.json(result);
            }

        });

        //GET API
        app.get('/order/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const result = await orderCollection.find(query).toArray();
            res.json(result);
        });

        //GET API
        app.get('/order', async(req, res) => {
            const result = await orderCollection.find({}).toArray();
            res.json(result);
        })

        //GET API
        app.get('/offerings', async (req, res) => {
            const cursor = offeringsCollection.find({});
            const offerings = await cursor.toArray();
            res.send(offerings);
        });

        //GET SINGLE OFFERING
        app.get('/offering/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const offering = await offeringsCollection.findOne(query);
            res.json(offering);
        });

        //POST API
        app.post('/offerings', async (req, res) => {
            const offering = req.body;
            console.log("Hit", offering);
            const result = await offeringsCollection.insertOne(offering)
            console.log(result);
            res.json(result)
        });

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})