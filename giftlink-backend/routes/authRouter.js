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

router.post('/login', async (req, res)=>{
    try{
        const db = await connectToDatabase();
        const collection = db.collection('users');
        const userExists = await collection.findOne({email: req.body.email});
        if(userExists){
            const password = req.body.password;
            const passwordMach = await bcryptjs.compare(password, userExists.password )
            if(passwordMach){
            const username = userExists.firstName;
            const email = req.body.email;
            const payload = {
                user: {
                    id: userExists.insertedId,
                },
            };
            const authtoken = jwt.sign(payload, JWT_SECRET);
            res.status(200).json({authtoken, email, username});

            }else{
            res.status(401).json({error:"Email or password is not correct !"})
            }
        }else{
            res.status(401).json({error:"Email or password is not correct!"})
        }
    }catch(e){
        console.log("the error is: ", e)
        res.status(404).json({error: "Internal server error try again!"})
    }
})

router.put('/update', async (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('Validation errors in update request', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    try{
        const email = req.headers.email;

        if (!email) {
            logger.error('Email not found in the request headers');
            return res.status(400).json({ error: "Email not found in the request headers" });
        }else{
            const db = await connectToDatabase();
            const collection = db.collection('users');
            const date = new Date();
            const updateduserInfo = await collection.findOneAndUpdate({email: email}, {$set: {firstName: req.body.firstName, updateddAt:date}});
            if(!updateduserInfo){
                return res.status(404).json({ error: "User not found" });
            }else{
                const firstName = updateduserInfo.firstName;
                const email = updateduserInfo.email;
                const payload = {
                    user: {
                        id: updateduserInfo.insertedId
                    }
                }
                const authtoken = jwt.sign(payload, JWT_SECRET)
                res.status(200).json({authtoken, firstName, email})
            }
        }
    }catch(e){
        res.status(500).json({error:"Internal server error!"})
    }
})

module.exports = router;
