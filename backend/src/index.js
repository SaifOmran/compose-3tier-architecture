require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

// App init
const PORT = process.env.PORT || 4000;

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// CORS support
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// MongoDB Connection
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_PORT = process.env.DB_PORT;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;

const URI =
    `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;

mongoose.connect(URI)
    .then(() => console.log('✓ Connected to MongoDB'))
    .catch((err) => console.log('✗ MongoDB connection error:', err.message));

// Employee Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    department: { type: String, required: true },
    skills: { type: [String], required: true },
    salary: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => res.send('<h1>Hello Saif - MongoDB Connected</h1>'));

// Seed database with sample data
app.post('/seed', async (req, res) => {
    try {
        await User.deleteMany(); // Clear existing data
        const sampleData = [
            {
                name: "Ahmed Hassan",
                email: "ahmed@example.com",
                age: 25,
                department: "Backend",
                skills: ["Node.js", "MongoDB", "Docker"],
                salary: 1500,
                isActive: true
            },
            {
                name: "Sara Ali",
                email: "sara@example.com",
                age: 23,
                department: "Frontend",
                skills: ["React", "CSS", "TypeScript"],
                salary: 1300,
                isActive: true
            },
            {
                name: "Mohamed Samy",
                email: "mohamed@example.com",
                age: 29,
                department: "DevOps",
                skills: ["Linux", "Docker", "Kubernetes"],
                salary: 2200,
                isActive: false
            },
            {
                name: "Nour Ibrahim",
                email: "nour@example.com",
                age: 27,
                department: "Data Engineering",
                skills: ["Python", "MongoDB", "Spark"],
                salary: 2500,
                isActive: true
            },
            {
                name: "Omar Khaled",
                email: "omar@example.com",
                age: 31,
                department: "Cloud",
                skills: ["AWS", "Terraform", "Jenkins"],
                salary: 3000,
                isActive: true
            }
        ];
        const inserted = await User.insertMany(sampleData);
        res.json({ success: true, message: `${inserted.length} employees seeded`, data: inserted });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// Get all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Create a user
app.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// Get user by ID
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update user
app.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete user
app.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get users by department
app.get('/department/:dept', async (req, res) => {
    try {
        const users = await User.find({ department: req.params.dept });
        res.json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get active users only
app.get('/active/all', async (req, res) => {
    try {
        const users = await User.find({ isActive: true });
        res.json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get users by salary range
app.get('/salary/:min/:max', async (req, res) => {
    try {
        const users = await User.find({
            salary: { $gte: req.params.min, $lte: req.params.max }
        });
        res.json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Search by skill
app.get('/skill/:skill', async (req, res) => {
    try {
        const users = await User.find({ skills: req.params.skill });
        res.json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => console.log(`✓ App running on port ${PORT}`));

