const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Faculty = require('./models/facultyModel');

dotenv.config();

const facultyData = [
    { sNo: 1, name: "Dr.Ch BinduMadhuri", qualification: "Ph.D", university: "GITAM", gradYear: "2014", designation: "Asst. Prof. & Head", dateOfJoining: "04-01-2013", department: "IT", type: "Regular" },
    { sNo: 2, name: "Dr G. Jaya Suma", qualification: "Ph.D", university: "Andhara University", gradYear: "2011", designation: "Professor", dateOfJoining: "10-01-2013", department: "CSE", type: "Regular" },
    { sNo: 3, name: "Dr.G. Madhavi", qualification: "Ph.D", university: "JNTUH", gradYear: "2017", designation: "Asst. Prof.", dateOfJoining: "01-01-2013", department: "CSE", type: "Regular" },
    { sNo: 4, name: "Dr.B. TirimulaRao", qualification: "Ph.D", university: "JNTUK", gradYear: "2020", designation: "Asst. Prof.", dateOfJoining: "04-01-2013", department: "CSE", type: "Regular" },
    { sNo: 5, name: "Mr.AnilWurity", qualification: "M.Tech", university: "GITAM", gradYear: "2011", designation: "Asst. Prof.", dateOfJoining: "04-01-2013", department: "CSE", type: "Regular" },
    { sNo: 6, name: "R.S.S.Jyothi", qualification: "M.Tech", university: "GITAM", gradYear: "2009", designation: "Asst. Prof.", dateOfJoining: "18-06-2012", department: "CST", type: "Contract" },
    { sNo: 7, name: "P.Eswar", qualification: "M.Tech (Ph.D)", university: "GITAM", gradYear: "2013", designation: "Asst. Prof.", dateOfJoining: "13-06-2013", department: "IT", type: "Contract" },
    { sNo: 8, name: "K.Srikanth", qualification: "M.Tech (Ph.D)", university: "Andhara University", gradYear: "2008", designation: "Asst. Prof.", dateOfJoining: "14-06-2014", department: "IT", type: "Contract" },
    { sNo: 9, name: "R.RojeSpandana", qualification: "M.Tech", university: "JNTUK", gradYear: "", designation: "Asst. Prof.", dateOfJoining: "", department: "CSE", type: "Contract" },
    { sNo: 10, name: "P.Venkateswaralu", qualification: "M.Tech", university: "JNTUK", gradYear: "2014", designation: "Asst. Prof.", dateOfJoining: "06-08-2015", department: "CSE", type: "Contract" },
    { sNo: 11, name: "B.Manasa", qualification: "M.Tech", university: "JNTUK", gradYear: "2017", designation: "Asst. Prof.", dateOfJoining: "19-06-2017", department: "CSE", type: "Contract" },
    { sNo: 12, name: "Madhumita Chanda", qualification: "M.Tech", university: "JNTUK", gradYear: "2017", designation: "Asst. Prof.", dateOfJoining: "15-06-2017", department: "CSE", type: "Contract" }
];

const seedFaculty = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jntugv-portal');
        console.log('MongoDB Connected');

        // Clear existing faculty (optional: usually better to append or upsert, but for seeding fresh data, clear is okay. 
        // User said "upload all this", implying replacing or adding. I'll upsert based on sNo or name to avoid duplicates)

        for (const fac of facultyData) {
            const facWithCreds = {
                ...fac,
                email: `${fac.name.split(' ')[0].toLowerCase().replace('.', '')}${fac.sNo}@jntugv.edu.in`,
                mobileNumber: `98765432${fac.sNo.toString().padStart(2, '0')}`, // Dummy mobile
                role: 'faculty'
            };

            await Faculty.findOneAndUpdate(
                { name: fac.name }, // Match by name
                facWithCreds,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`Processed: ${fac.name}`);
        }

        console.log('Faculty Seeding Completed');
        process.exit();
    } catch (error) {
        console.error('Error seeding faculty:', error);
        process.exit(1);
    }
};

seedFaculty();
