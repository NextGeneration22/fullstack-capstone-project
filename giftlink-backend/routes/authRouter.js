const express =require('express')
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator');
const dotenv = require('dotenv');
const pino = require('pino');
const connectToDatabase = require('../models/db');

const router = express.Router()

const logger = pino();

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
        try {
            const db = await connectToDatabase();
            const collection = db.collection("users");
            const existingEmail = await collection.findOne({ email: req.body.email });
            if(!existingEmail){
                const salt = await bcryptjs.genSalt(10);
                const hash = await bcryptjs.hash(req.body.password, salt);
                const email = req.body.email;
        
                const newUser = await collection.insertOne({
                    email: req.body.email,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    password: hash,
                    createdAt: new Date(),
                });
                 //Task 5: Create JWT authentication with user._id as payload
                 const payload = {
                    user: {
                        id: newUser.insertedId,
                    },
                };
        
                const authtoken = jwt.sign(payload, JWT_SECRET);
                logger.info('User registered successfully');
                res.status(201).json({authtoken,email});
            }else{
                res.status(409).json({error:"User already exist"})
            }
        } catch (e) {
             res.status(500).json({error:'Internal server error try again later'});
             console.log("this is the error: ", e)
        }
    });

module.exports = router;
