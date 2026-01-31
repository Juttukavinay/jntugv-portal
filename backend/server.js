const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

// connectDB(); // Removed - called below with server start

const app = express();

app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url}`);
    next();
});

const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/api', (req, res) => {
    res.json({ message: "Hello from Backend!" });
});

const PORT = process.env.PORT || 5000;

// Connect to DB first, then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to DB', err);
});
