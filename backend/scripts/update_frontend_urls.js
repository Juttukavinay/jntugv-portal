const fs = require('fs');
const path = require('path');

const files = [
    'f:/Mern/frontend/src/pages/dashboard/PrincipalDashboard.jsx',
    'f:/Mern/frontend/src/pages/dashboard/VicePrincipalDashboard.jsx',
    'f:/Mern/frontend/src/pages/dashboard/HodDashboard.jsx',
    'f:/Mern/frontend/src/pages/dashboard/FacultyDashboard.jsx'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;

        // Add Import if not present
        if (!content.includes("import API_BASE_URL")) {
            const lines = content.split('\n');
            let importInserted = false;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes("import ") && !importInserted) {
                    // Finding the last import or just insert after first
                    // We'll insert after the last import line or at top
                }
            }
            // Simpler: Just replace "import { useState" or similar common imports
            // Or just prepend to the first import
            content = content.replace(/import .*\n/, (match) => {
                return `import API_BASE_URL from '../../config'\n${match}`;
            });
        }

        // Replace fetch('/api...')
        // Regex for single quotes
        content = content.replace(/fetch\(['"]\/api([^'"]*)['"]\)/g, "fetch(`${API_BASE_URL}/api$1`)");

        // Replace fetch(`/api...`) - Template strings
        // This is tricky because existing backticks need to be preserved? 
        // fetch(`/api/${foo}`) -> fetch(`${API_BASE_URL}/api/${foo}`)
        // The regex `fetch\(\`\/api` matches the start.
        content = content.replace(/fetch\(`\/api/g, "fetch(`${API_BASE_URL}/api");

        if (content !== originalContent) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Updated ${file}`);
        } else {
            console.log(`No changes needed for ${file}`);
        }
    } else {
        console.log(`File not found: ${file}`);
    }
});
