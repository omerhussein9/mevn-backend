const mongoose = require('mongoose');
const enviro = require('dotenv')
enviro.config()

// Replace <password> with your MongoDB Atlas password
const mongoURI = `mongodb+srv://ohussein:sports123@sportscluster.bp9ooxj.mongodb.net/sportsdb?retryWrites=true&w=majority&appName=sportscluster&connectTimeoutMS=30000&socketTimeoutMS=30000`;
// mongodb://ohussein:sports123@<hostname>:<port>/<database>?retryWrites=true&w=majority&connectTimeoutMS=30000&socketTimeoutMS=30000


  const connectToMongoDB = async (uri) => {
    try {
      await mongoose.connect(uri);
      console.log('Connected to MongoDB Atlas');
    } catch (err) {
      console.error('Error connecting to MongoDB Atlas:', err);
    }
  };

  connectToMongoDB(mongoURI)
  
module.exports = connectToMongoDB;