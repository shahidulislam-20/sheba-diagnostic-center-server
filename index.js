const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zgm5tdq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const testCollection = client.db("shebaDC").collection("tests");
    const bannerCollection = client.db("shebaDC").collection("banner");
    const recommendationCollection = client.db("shebaDC").collection("recommendation");
    const userCollection = client.db("shebaDC").collection("users");
    // const bookingCollection = client.db("shebaDC").collection("booking");
    const paymentCollection = client.db("shebaDC").collection("payments");

    app.get('/tests', async (req, res) => {
      const result = await testCollection.find().toArray();
      res.send(result);
    })

    app.get('/tests/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await testCollection.findOne(query);
      res.send(result);
    })

    app.post('/tests', async (req, res) => {
      const testInfo = req.body;
      const result = await testCollection.insertOne(testInfo);
      res.send(result);
    })

    app.put('/tests/:id', async (req, res) => {
      const id = req.params.id;
      const test = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          title: test.title,
          image: test.image,
          slots: test.slots,
          shortDescription: test.shortDescription,
          details: test.details,
          times: test.times,
          availableDates: test.availableDates
        }
      }
      const result = await testCollection.updateOne(query, updatedDoc);
      res.send(result);
    })

    app.patch('/tests/:id', async (req, res) => {
      const id = req.params.id;
      const slot = req.body;
      const query = { _id: new ObjectId(id) };
      const doc = {
        $set: {
          slots: slot.reduceSlot
        }
      }
      const result = await testCollection.updateOne(query, doc);
      res.send(result);
    })

    app.delete('/tests/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await testCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/banner', async (req, res) => {
      const result = await bannerCollection.find().toArray();
      res.send(result);
    })

    app.get('/banner/:active', async (req, res) => {
      const active = req.params.active;
      const query = { isActive: true }
      const result = await bannerCollection.findOne(query);
      res.send(result);
    })

    app.post('/banner', async (req, res) => {
      const banner = req.body;
      const result = await bannerCollection.insertOne(banner);
      res.send(result);
    })

    app.put('/banner/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = { $set: { isActive: true } };
      const result = await bannerCollection.updateOne(query, updateDoc);
      const updateOtherQuery = {_id: {$ne: new ObjectId(id)}};
      const updateOtherData = {$set: {isActive: false}};
      const otherResult = await bannerCollection.updateMany(updateOtherQuery, updateOtherData);
      res.send({result, otherResult});
    })

    app.delete('/banner/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await bannerCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/recommendation', async (req, res) => {
      const result = await recommendationCollection.find().toArray();
      res.send(result);
    })

    // app.post('/booking', async(req, res) => {
    //   const bookingData = req.body;
    //   const result = await bookingCollection.insertOne(bookingData);
    //   res.send(result);
    // })

    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    })

    app.put('/users/:id', async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      const query = { _id: new ObjectId(id) };
      if (status.status) {
        const doc = {
          $set: {
            status: status.status
          }
        }
        const result = await userCollection.updateOne(query, doc);
        res.send(result);
      }
      else if (status.isAdmin) {
        const options = { upsert: true };
        const doc = {
          $set: {
            isAdmin: true
          }
        }
        const result = await userCollection.updateOne(query, doc, options);
        res.send(result);
      }
    })

    app.patch('/user/:id', async (req, res) => {
      const id = req.params.id;
      const user = req.body
      const query = { _id: new ObjectId(id) };
      const doc = {
        $set: {
          name: user.name,
          photo: user.photo,
          bloodGroup: user.bloodGroup,
          district: user.district,
          upazila: user.upazila,
        }
      }
      const result = await userCollection.updateOne(query, doc);
      res.send(result)
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      const doc = {
        name: user.name,
        email: user.email,
        photo: user.photo,
        bloodGroup: user.bloodGroup,
        district: user.district,
        upazila: user.upazila,
        status: user.status
      }
      const result = await userCollection.insertOne(doc);
      res.send(result);
    })

    app.get('/reservation', async(req, res) => {
      const result = await paymentCollection.find().toArray();
      res.send(result);
    })

    app.put('/reservation/:id', async(req, res) => {
      const id = req.params.id;
      const report = req.body;
      const query = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const doc = {
        $set: {
          status: 'delivered',
          report: report.reportLink
        }
      }
      const result = await paymentCollection.updateOne(query, doc, options);
      res.send(result);
    })

    app.get('/test-results/:email', async(req, res) => {
      const email = req.params.email;
      const query = {email: email, status: 'delivered'};
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/payment/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/payments', async (req, res) => {
      const payment = req.body;
      const paymentResult = await paymentCollection.insertOne(payment);
      const query = { _id: new ObjectId(payment.id) }
      const updateDoc = {
        $inc: {
          slots: - 1
        }
      }
      const updateResult = await testCollection.updateOne(query, updateDoc);
      res.send({ paymentResult, updateResult })
    })

    app.delete('/payment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await paymentCollection.deleteOne(query);
      res.send(result);
    })

    // stripe payment intent
    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      })
      res.send({
        clientSecret: paymentIntent.client_secret
      })
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
  res.send('Sheba diagnostic center is running...')
})

app.listen(port, () => {
  console.log(`Sheba diagnostic center running on port : ${port}`)
})