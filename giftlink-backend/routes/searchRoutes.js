/*jshint esversion: 8 */
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');

// Search for gifts
router.get('/', async (req, res, next) => {
    try {
        //Connect to MongoDB using connectToDatabase database. Remember to use the await keyword and store the connection in `db`
        const db = await connectToDatabase();
        const collection = db.collection("gifts");

        // Initialize the query object
        let query = {};

        // Add the name filter to the query if the name parameter is not empty
        if (req.query.name&& req.query.name.trim()!=='') {
            query.name = { $regex: req.query.name, $options: "i" }; // Using regex for partial match, case-insensitive
        }

        //Add other filters to the query
        if (req.query.category) {
            query.category = {$regex: req.query.category, $options: "i"};
        }
        if (req.query.condition) {
            query.condition = {$regex: req.query.condition, $options: "i" };
        }
        if (req.query.age_years) {
            query.age_years = { $lte: parseInt(req.query.age_years) };
        }

        //Fetch filtered gifts using the find(query) method. Make sure to use await and store the result in the `gifts` constant
        if (Object.keys(query).length === 0) {
            return res.json([]);
        }
        const gifts = await collection.find(query).toArray();
        res.json(gifts);
    } catch (e) {
        console.log("the error from searchRout is:", e);
        next(e);
    }
});

module.exports = router;
