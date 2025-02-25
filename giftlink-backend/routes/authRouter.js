const express =require('express')
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {validationResult } = require('express-validator');
const validator = require('validator')
const dotenv = require('dotenv');
const pino = require('pino');
const connectToDatabase = require('../models/db');
const router = express.Router()

const logger = pino();

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
        try {
            const email = req.body.email;
            const domain = 'gmail.com';
            const validEmail = validator.isEmail(email) && email.endsWith(`@${domain}`);
            if(validEmail){
                const db = await connectToDatabase();
                const collection = db.collection("users");
                const existingEmail = await collection.findOne({ email: email });
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
                    //JWT authentication with user._id as payload
                    const payload = {
                        user: {
                            id:newUser.insertedId
                        }
                    };
                    console.log("the payload is: ", payload)
                    const authtoken = jwt.sign(payload, JWT_SECRET);
                    logger.info('User registered successfully');
                    res.status(201).json({authtoken,email});
                }else{
                    res.status(409).json({error:"User already exist"})
                }
            }else{
                res.status(409).json({error:"Please enter a valid email!"})
            }
        } catch (e) {
             res.status(500).json({error:'Internal server error try again later'});
             console.log("this is the error: ", e)
        }
    });

router.post('/login', async (req, res)=>{
    try{
        const email = req.body.email;
        const isvalidEmail = validator.isEmail(email) && email.endsWith(`@gmail.com`)
        if(isvalidEmail){
            const db = await connectToDatabase();
            const collection = db.collection('users');
            const userExists = await collection.findOne({email: email});
            if(userExists){
                const password = req.body.password;
                const passwordMach = await bcryptjs.compare(password, userExists.password )
                if(passwordMach){
                const username = userExists.firstName;
                const email = req.body.email;
                const payload = {
                    user: {
                        id: userExists._id
                    },
                };
                console.log("the payload is: ", payload)
                const authtoken = jwt.sign(payload, JWT_SECRET);
                res.status(200).json({authtoken, email, username});

                }else{
                res.status(401).json({error:"Email or password is not correct !"})
                }
            }else{
                res.status(401).json({error:"Email or password is not correct!"})
            }
        }else{
            res.status(400).json({error: "Please enter a valid email!"})
        }
    }catch(e){
        console.log("the error is: ", e)
        res.status(404).json({error: "Internal server error try again!"})
    }
})

router.put('/update', async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        logger.error('Validation errors in update request', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }else{
        try{
            const email = req.headers.email;
            const token = req.headers.Authorization;
            if(!email && !token){
                res.status(400).json({error:"Email not found in the request headers"})
            }else{
                const db = await connectToDatabase();
                const collection = await db.collection('users');
                const firstName = req.body.firstName;
                if(firstName){
                    const updateduserInfo = await collection.updateOne({email: email}, {$set: {firstName: firstName}});
                    if(updateduserInfo.modifiedCount == 0){
                        res.status(204).json({});
                    }else{
                        const userInfo = await collection.findOne({email:email});
                        const date = new Date();
                        const updatedate = await collection.updateOne({email: email}, {$set: {updateddAt: date}});
                        const payload = {
                            user: {
                                _id: userInfo.insertedId
                            }
                        }
                        console.log("the payload is: ", payload)
                        const authtoken = jwt.sign(payload, JWT_SECRET);
                        res.status(200).json({authtoken});
                    }
                }else{
                    res.status(400).json({error: "please provide a name!"})
                }
            }
        }catch(e){
            res.status(500).json({error: "Internal server error!"})
            console.log("error isss: ", e)
        }

    }
})

module.exports = router;
