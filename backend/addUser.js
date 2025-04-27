const redis = require("redis");
const bcrypt = require("bcrypt");

const client = redis.createClient();
client.connect();

async function addUser(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await client.hSet(`user:${email}`, "password", hashedPassword);
    console.log(`User ${email} added.`);
}

addUser("user@gmail.com", "user123").then(() => process.exit());