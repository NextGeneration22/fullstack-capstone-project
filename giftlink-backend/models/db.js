// db.js
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

// MongoDB connection URL with authentication options
let url = `${process.env.MONGO_URL}`;

let dbInstance = null;
const dbName = "giftdb";

async function connectToDatabase() {
    if (dbInstance){
        return dbInstance
    };
    const client = new MongoClient(url)
    try{
        await client.connect();
        console.log("data base conected");
        let dbInstance = client.db(dbName);
        return dbInstance
    }catch(err){ console.log("data base error", err)};

}

module.exports = connectToDatabase;
