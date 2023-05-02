const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const { query } = require('express');

const port = process.env.PORT || 5000;

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bebjeyw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//razorpay

const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: process.env.key_id, key_secret: process.env.key_secret });
const crypto = require("crypto");



async function run() {

    try {
        // collections
        app.get('/getKey', async (req, res) => {
            res.status(200).json({
                key: process.env.key_id,
            });
        });

        app.post('/api/checkout', async (req, res) => {

            // console.log(req.body);
            const options = {
                amount: Number(req.body.amount * 100),
                currency: "INR"
            };
            const order = await instance.orders.create(options);
            // console.log(order);
            res.status(200).json({
                success: true,
                order,
            });
        });

        app.post('/api/paymentVerification', async (req, res) => {
            const { razorpay_order_id , razorpay_payment_id, razorpay_signature} = req.body;
            const body = razorpay_order_id + "|" + razorpay_payment_id;

            const expectedSignature = crypto.createHmac('sha256', process.env.key_secret)
                .update(body.toString())
                .digest('hex');
           

            const isAuthentic = expectedSignature === razorpay_signature;
            
            if(isAuthentic){

                //Database

                res.redirect('http://localhost:3000/')

            }
            else{
                res.status(400).json({
                    success: false,
                });
            }
          
            
        });



    }
    finally {

    }

}

run().catch(err => console.error(err));


app.get('/', async (req, res) => {
    res.send('Experiment Labs Challenge Server is running')
});

app.listen(port, () => {
    console.log(`Experiment Labs Challenge Server is running on ${[port]}`);
});