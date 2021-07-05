
const url = require('url');
const MongoClient = require('mongodb').MongoClient;

let cachedDb = null;

async function connectToDatabase(uri) {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(uri, { useNewUrlParser: true });
  const db = await client.db(url.parse(uri).pathname.substr(1));
  cachedDb = db;
  return db;
}

module.exports = async (req, res) => {
  const queried_var = req.query.q ?? "";
  
  let finder = {};

  if (!queried_var || /^\s*$/.test(queried_var) || queried_var.length === 0) {
    finder = {};
  } else {
    finder = {'name': {'$regex': queried_var}};
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');

  const db = await connectToDatabase(process.env.MONGODB_URI);
  const collection = await db.collection('nutritional-facts');
  const foods = await collection.find(finder).toArray();
  //const foods = ['Apple', "Cherry", 'Banana'];

  res.json({ foods });
};
