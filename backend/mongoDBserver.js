const express = require('express');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const bcrypt = require("bcrypt");
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoUrl = 'mongodb://localhost:27017';
const client = new MongoClient(mongoUrl);
let db;

async function connectToMongo() {
  try {
    await client.connect();
    db = client.db("barangay_profiling");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectToMongo();

// LOGIN FUNCTION
async function authenticateUser(email, password) {
  const user = await db.collection("users").findOne({ email });

  if (!user) return false;

  return await bcrypt.compare(password, user.password);
}

// LOGIN ROUTE
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const isValid = await authenticateUser(email, password);

  if (isValid) {
    res.json({ success: true, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// CRUD Operations

// Route to save resident data
/*app.post('/residents', async (req, res) => {
    const {
      firstname, middlename, lastname, suffix, sex, birthdate, maritalStatus, nationality, religion,
      houseNumber, purok, barangay, mobileNumber, email, isStudent, schoolLevel, grade, school,
      employmentStatus, occupation, dateStarted, monthlyIncome, is4Ps, isSeniorCitizen, isPhilhealthMember
    } = req.body;
  
    try {
      const db = client.db("barangay_profiling"); // Use your database name
      const residents = db.collection("residents"); // Use your collection name
  
      // Build the resident object
      const residentData = {
        firstname, middlename, lastname, suffix, sex, birthdate, maritalStatus, nationality, religion,
        houseNumber, purok, barangay, mobileNumber, email, isStudent, schoolLevel, grade, school,
        employmentStatus, occupation, dateStarted, monthlyIncome, is4Ps, isSeniorCitizen, isPhilhealthMember,
        createdAt: new Date() // Optional: timestamp
      };
  
      // Insert the resident into MongoDB
      const result = await residents.insertOne(residentData);
  
      res.status(201).json({ message: 'Resident saved successfully', id: result.insertedId });
    } catch (error) {
      console.error('Error saving Resident:', error);
      res.status(500).json({ message: 'Failed to save Resident', error: error.message });
    }
});*/
async function getNextSequenceValue(sequenceName) {
  const db = client.db("barangay_profiling");
  const counters = db.collection("counters");

  const result = await counters.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    {
      upsert: true,
      returnDocument: 'after' // For newer drivers; use returnOriginal: false if older
    }
  );

  const sequenceDoc = result.value || result; // compatible with all versions
  console.log("findOneAndUpdate result:", sequenceDoc);

  if (!sequenceDoc || sequenceDoc.sequence_value == null) {
    throw new Error(`Unable to get sequence value for ${sequenceName}`);
  }

  return sequenceDoc.sequence_value;
}


app.post('/residents', async (req, res) => {
  const {
    firstname, middlename, lastname, suffix, sex, birthdate, maritalStatus, nationality, religion,
    houseNumber, purok, barangay, mobileNumber, email, isStudent, schoolLevel, grade, school,
    employmentStatus, occupation, dateStarted, monthlyIncome, is4Ps, isSeniorCitizen, isPhilhealthMember
  } = req.body;

  try {
    const db = client.db("barangay_profiling");
    const residents = db.collection("residents");

    // 🔢 Get next auto-incremented ID
    const nextId = await getNextSequenceValue("residentId");

    const residentData = {
      _id: nextId,
      firstname, middlename, lastname, suffix, sex, birthdate, maritalStatus, nationality, religion,
      houseNumber, purok, barangay, mobileNumber, email, isStudent, schoolLevel, grade, school,
      employmentStatus, occupation, dateStarted, monthlyIncome, is4Ps, isSeniorCitizen, isPhilhealthMember,
      createdAt: new Date()
    };

    const result = await residents.insertOne(residentData);

    res.status(201).json({ message: 'Resident saved successfully', id: result.insertedId });
  } catch (error) {
    console.error('Error saving Resident:', error);
    res.status(500).json({ message: 'Failed to save Resident', error: error.message });
  }
});


//Upload residents
/*app.post("/upload-csv", async (req, res) => {
    const { residents } = req.body;
  
    console.log("Residents Received:", residents);
  
    if (!Array.isArray(residents) || residents.length === 0) {
      return res.status(400).json({ message: "Invalid CSV data" });
    }
  
    try {
      const cleanResidents = residents.map(resident => {
        return Object.fromEntries(
          Object.entries(resident).map(([key, value]) => [key, String(value ?? "")])
        );
      });
  
      // Assuming you're using a MongoDB collection called "residents"
      const result = await db.collection("residents").insertMany(cleanResidents);
  
      res.status(201).json({ message: "CSV data uploaded successfully", insertedCount: result.insertedCount });
    } catch (error) {
      console.error("Error saving CSV data:", error);
      res.status(500).json({ message: "Failed to process CSV data", error: error.message });
    }
});*/
app.post("/upload-csv", async (req, res) => {
  const { residents } = req.body;

  console.log("Residents Received:", residents);

  if (!Array.isArray(residents) || residents.length === 0) {
    return res.status(400).json({ message: "Invalid CSV data" });
  }

  try {
    const db = client.db("barangay_profiling");
    const cleanResidents = [];

    for (const resident of residents) {
      const sequenceValue = await getNextSequenceValue("residentId");

      // Convert all values to string and clean null/undefined
      const cleanedResident = Object.fromEntries(
        Object.entries(resident).map(([key, value]) => [key, String(value ?? "")])
      );

      // Assign sequence value as both _id and residentId
      cleanedResident._id = sequenceValue;          // MongoDB's primary key
      cleanedResident.residentId = sequenceValue;   // Optional custom field for display

      cleanResidents.push(cleanedResident);
    }

    const result = await db.collection("residents").insertMany(cleanResidents);

    res.status(201).json({ 
      message: "CSV data uploaded successfully", 
      insertedCount: result.insertedCount 
    });

  } catch (error) {
    console.error("Error saving CSV data:", error);
    res.status(500).json({ message: "Failed to process CSV data", error: error.message });
  }
});


// get all residents
app.get('/residents', async (req, res) => {
    try {
      // Assuming you're using a MongoDB collection called "residents"
      const residents = await db.collection("residents").find().toArray();
  
      // Optional: Add `id` field as a string version of `_id`
      const formattedResidents = residents.map(resident => ({
        ...resident,
        id: resident._id.toString()
      }));
  
      res.json(formattedResidents);
    } catch (error) {
      console.error('Error fetching residents:', error);
      res.status(500).json({ message: 'Failed to fetch residents' });
    }
});


//UPDATE
app.put('/residents/:id', async (req, res) => {
    const id = req.params.id;
  
    // Convert to ObjectId safely
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
  
    // Clone request body and ensure _id is completely removed
    const updateFields = JSON.parse(JSON.stringify(req.body)); // deep clone
    if (updateFields._id) {
      delete updateFields._id;
    }
  
    try {
      const result = await db.collection('residents').updateOne(
        { _id: objectId },
        { $set: updateFields }
      );
  
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Resident not found' });
      }
  
      res.status(200).json({ message: 'Resident updated successfully' });
    } catch (error) {
      console.error('Error updating resident:', error);
      res.status(500).json({ message: 'Failed to update resident' });
    }
});  


//DELETE
app.delete('/residents/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10); // Convert string to integer

  try {
    const result = await db.collection('residents').deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    res.status(200).json({ message: 'Resident deleted successfully' });
  } catch (error) {
    console.error('Error deleting resident:', error);
    res.status(500).json({ message: 'Failed to delete resident' });
  }
});

  

//HOUSEHOLD

// Fetching all the household data
app.get("/api/household", async (req, res) => {
    try {
      // Fetch all household documents from the MongoDB collection
      const households = await db.collection('households').find().toArray();
  
      if (households.length === 0) {
        return res.status(200).json([]); // Return empty array if no data
      }
  
      // Map the MongoDB documents into the desired format
      const householdData = households.map((household) => ({
        id: household._id.toString(), // Use ObjectId as a string
        members: household.members // Assuming 'members' is an array inside the document
      }));
  
      res.status(200).json(householdData);
    } catch (error) {
      console.error("Error fetching household data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
});


// API route to save householdData
/*app.post("/api/household", async (req, res) => {
    const { householdData } = req.body;
  
    if (!householdData || !Array.isArray(householdData) || householdData.length === 0) {
      return res.status(400).json({ message: "Invalid household data" });
    }
  
    try {
      // Create a new household document in MongoDB
      const newHousehold = {
        members: householdData, // Assuming the household data is the array of members
      };
  
      // Insert the new household data into the MongoDB collection
      const result = await db.collection('households').insertOne(newHousehold);
  
      // The inserted document's _id will be the unique householdId
      const householdId = result.insertedId.toString();
  
      res.status(200).json({ message: "Household data saved successfully!", householdId });
    } catch (error) {
      console.error("Error saving household data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
});*/
// Reuse this function for all sequences (already done in your code)
async function getNextSequenceValue(sequenceName) {
  const db = client.db("barangay_profiling");
  const counters = db.collection("counters");

  const result = await counters.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    {
      upsert: true,
      returnDocument: 'after' // use returnOriginal: false if using an older MongoDB driver
    }
  );

  const sequenceDoc = result.value || result;
  console.log("findOneAndUpdate result:", sequenceDoc);

  if (!sequenceDoc || sequenceDoc.sequence_value == null) {
    throw new Error(`Unable to get sequence value for ${sequenceName}`);
  }

  return sequenceDoc.sequence_value;
}


// 🔄 Modified POST endpoint to use custom _id
app.post("/api/household", async (req, res) => {
  const { householdData } = req.body;

  if (!householdData || !Array.isArray(householdData) || householdData.length === 0) {
    return res.status(400).json({ message: "Invalid household data" });
  }

  try {
    const db = client.db("barangay_profiling");

    // 🔢 Get the next custom _id for household
    const nextHouseholdId = await getNextSequenceValue("householdId");

    const newHousehold = {
      _id: nextHouseholdId,     // 👈 Set the custom ID
      members: householdData,
      createdAt: new Date()
    };

    const result = await db.collection('households').insertOne(newHousehold);

    res.status(200).json({
      message: "Household data saved successfully!",
      householdId: result.insertedId
    });
  } catch (error) {
    console.error("Error saving household data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



//Edit Household
app.put("/api/household/:id", async (req, res) => {
    const { id } = req.params;
    const { members } = req.body;
  
    if (!members || !Array.isArray(members)) {
      return res.status(400).json({ message: "Invalid household data" });
    }
  
    try {
      // Check if the household exists in MongoDB by _id
      const household = await db.collection('households').findOne({ _id: new ObjectId(id) });
  
      if (!household) {
        return res.status(404).json({ message: "Household not found" });
      }
  
      // Update household data in MongoDB
      const updatedHousehold = await db.collection('households').updateOne(
        { _id: new ObjectId(id) },
        { $set: { members } }
      );
  
      if (updatedHousehold.modifiedCount === 0) {
        return res.status(400).json({ message: "No changes were made to the household data" });
      }
  
      res.status(200).json({ message: "Household updated successfully!" });
    } catch (error) {
      console.error("Error updating household:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
});  


// Delete Household
app.delete("/api/household/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10); // Convert from string to number

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid household ID" });
  }

  try {
    const result = await db.collection('households').deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Household not found" });
    }

    res.status(200).json({ message: "Household deleted successfully!" });
  } catch (error) {
    console.error("Error deleting household:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
