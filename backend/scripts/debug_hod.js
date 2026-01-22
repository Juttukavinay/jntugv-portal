const mongoose = require('mongoose');
const Faculty = require('../models/facultyModel');
const Department = require('../models/departmentModel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jntugv-portal');
        console.log('Connected to DB');

        const bindu = await Faculty.findOne({ name: { $regex: 'Bindu', $options: 'i' } });
        if (!bindu) {
            console.log('>> Faculty "Bindu" NOT FOUND in DB');
        } else {
            console.log(`>> Found Faculty: ${bindu.name} (_id: ${bindu._id})`);
        }

        const depts = await Department.find({});
        console.log('\n>> All Departments:');
        depts.forEach(d => {
            console.log(`   Name: "${d.name}", HOD: "${d.hodName}", hodId: ${d.hodId}`);
        });

        if (bindu) {
            console.log('\n>> Checking Relation:');
            // Try to find raw
            const match = await Department.findOne({ hodId: bindu._id });
            if (match) {
                console.log(`   SUCCESS! Database says Bindu is HOD of '${match.name}'`);
            } else {
                console.log('   FAILURE! Database says Bindu is NOT HOD of any department.');

                // Detailed check
                const potentialDept = depts.find(d => d.hodName && d.hodName.includes('Bindu'));
                if (potentialDept) {
                    console.log(`   Wait, Dept '${potentialDept.name}' has hodName '${potentialDept.hodName}'`);
                    console.log(`   Dept hodId: ${potentialDept.hodId}`);
                    console.log(`   Bindu _id:  ${bindu._id}`);
                    console.log(`   Equal? ${potentialDept.hodId.toString() === bindu._id.toString()}`);
                }
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
};

check();
