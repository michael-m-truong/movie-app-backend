const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongoServer;

// connect to db
module.exports.connect = async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = await mongoServer.getUri()
    const mongooseOpts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
    await mongoose.disconnect()
    await mongoose.connect(uri, mongooseOpts)
    return mongoServer
}

// dc and close connection
module.exports.closeDatabase = async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongoServer.stop()
}

// clear db, remove all data
module.exports.clearDatabase = async () => {
    const collections = mongoose.connection.collections
    for (const key in collections) {
        const collection = collections[key]
        await collection.deleteMany()
    }
}
