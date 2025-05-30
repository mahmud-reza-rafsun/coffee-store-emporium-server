const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uuac6m8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// 56 - 6 : 9:06

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        const coffeeCollection = client.db('coffeeDB').collection('coffee');
        const usersCollection = client.db('coffeeDB').collection('users');

        app.get('/coffee', async (req, res) => {
            const coffeeCursor = coffeeCollection.find();
            const newCoffee = await coffeeCursor.toArray();
            res.send(newCoffee);
        })

        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const coffee = await coffeeCollection.findOne(query);
            res.send(coffee);
        })

        app.post('/coffee', async (req, res) => {
            const coffee = req.body;
            console.log(coffee);
            const newCoffee = await coffeeCollection.insertOne(coffee);
            res.send(newCoffee);
        })

        app.put('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const coffee = req.body;
            const coffeeDoc = {
                $set: {
                    name: coffee.name,
                    price: coffee.price,
                    supplier: coffee.supplier,
                    taste: coffee.taste,
                    category: coffee.category,
                    details: coffee.details,
                    photo: coffee.photo,
                }
            }
            const updateCoffee = await coffeeCollection.updateOne(filter, coffeeDoc, options);
            res.send(updateCoffee);
        })

        app.delete('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            console.log("id is", id)
            const query = { _id: new ObjectId(id) }
            const coffee = await coffeeCollection.deleteOne(query);
            res.send(coffee);
        })
        // user 
        app.post('/users', async (req, res) => {
            const newUsers = req.body;
            console.log(newUsers);
            const result = await usersCollection.insertOne(newUsers);
            res.send(result);
        })
        app.get('/users', async (req, res) => {
            const usersCursor = usersCollection.find();
            const newUsers = await usersCursor.toArray();
            res.send(newUsers);
        })
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const deleteUsers = await usersCollection.deleteOne(query);
            res.send(deleteUsers);
        })
        app.patch('/users', async (req, res) => {
            const email = req.body.email;
            const filter = { email };
            const updateInfo = {
                $set: {
                    lastLogInTime: req?.body?.lastSignInTime
                }
            }
            const result = await usersCollection.updateOne(filter, updateInfo);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('coffee server is running');
})

app.listen(port, () => {
    console.log(`port is running on port: ${port}`);
})