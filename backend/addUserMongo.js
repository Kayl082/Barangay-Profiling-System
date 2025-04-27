const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

async function addUser(email, password) {
    const mongoUrl = "mongodb://localhost:27017";
    const client = new MongoClient(mongoUrl);

    try {
        await client.connect();
        const db = client.db("barangay_profiling");
        const usersCollection = db.collection("users");

        const hashedPassword = await bcrypt.hash(password, 10);

        await usersCollection.insertOne({ email, password: hashedPassword });
        console.log(`User ${email} added.`);
    } catch (error) {
        console.error("Error adding user:", error);
    } finally {
        await client.close();
    }
}

addUser("user@gmail.com", "user123").then(() => process.exit());
