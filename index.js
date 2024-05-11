const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleWare
app.use(
    cors({
        origin: [
            "http://localhost:5173"
        ],
        credentials: true,
    })
);
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nzlapl6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// middleWare
const logger = (req, res, next) => {
    console.log('logged info :', req.method, req.url);
    next();
}



const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    console.log(token);
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    jwt.verify(token, process.env.ACCESS_USER_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access-2' })
        }
        req.user = decoded;
        next();
    })
}



async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const queriesCollections = client.db("queriesDB").collection("queries");
        const usersCollections = client.db("queriesDB").collection("users");


        // jwt
        // app.post('/jwt', logger, async (req, res) => {
        //     const user = req.body
        //     console.log('user for token ', req.body);
        //     const token = jwt.sign(user, process.env.ACCESS_USER_TOKEN, { expiresIn: '1y' });
        //     res.cookie('token', token, {
        //         httpOnly: true,
        //         secure: process.env.NODE_ENV === 'production' ? true : false,
        //         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        //     })
        //         .send({ success: true });
        // })

        // logOut
        // app.post('/logOut', async (req, res) => {
        //     const user = req.body;
        //     res.clearCookie('token', { maxAge: 0 }).send({ success: true })
        // })

        // get the queries
        app.get('/queries', async (req, res) => {
            const cursor = queriesCollections.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        // get query by id
        app.get('/queries/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await queriesCollections.findOne(query);
            res.send(result);
        })

        // get query by email
        app.get('/myQueries/:email', async (req, res) => {
            const userEmail = req.params.email;
            const query = { authorEmail: userEmail };
            const cursor = queriesCollections.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        // queries post
        app.post('/queries', async (req, res) => {
            const queries = req.body;
            const result = await queriesCollections.insertOne(queries);
            res.send(result);
        })

        // update by put 
        app.put('/queries/:id', async (req, res) => {
            const id = req.params.id;
            const query = req.body;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateQueries = {
                $set: {
                    productName: query.productName,
                    productBrand: query.productBrand,
                    productImage: query.productImage,
                    QueryTitle: query.QueryTitle,
                    detail: query.detail,
                    dateTime: query.dateTime,
                    authorName: query.authorName,
                    authorEmail: query.authorEmail,
                    authorImage: query.authorImage,
                }
            }
            const result = await queriesCollections.updateOne(filter, updateQueries, options);
            res.send(result)
        })

        // delete
        app.delete('/queries/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await queriesCollections.deleteOne(query);
            res.send(result);
        })

        // user
        app.get('/users', async (req, res) => {
            const cursor = usersCollections.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('the query server is running .')
})

app.listen(port, () => {
    console.log(`the port number is: ${port}`)
})