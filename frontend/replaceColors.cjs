const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function replaceColors(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            replaceColors(fullPath);
        } else if (file.endsWith('.css') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;
            
            // Core Coral to Gold
            if (content.includes('rgba(255, 107, 107,')) {
                content = content.replace(/rgba\(255,\s*107,\s*107,/g, 'rgba(197, 160, 89,');
                updated = true;
            }
            if (content.includes('255, 107, 107')) {
                content = content.replace(/255,\s*107,\s*107/g, '197, 160, 89');
                updated = true;
            }
            // Secondary Pink/Light items
            if (content.includes('#FF8E8E')) {
                content = content.replace(/#FF8E8E/g, '#D4AF37');
                updated = true;
            }
            // Dark Sidebar/Navs
            if (content.includes('rgba(26, 29, 46,')) {
                content = content.replace(/rgba\(26,\s*29,\s*46,/g, 'rgba(31, 26, 18,');
                updated = true;
            }
            if (content.includes('#1A1D2E')) {
                content = content.replace(/#1A1D2E/g, '#1F1A12');
                updated = true;
            }
            // Main Coral
            if (content.includes('#FF6B6B')) {
                content = content.replace(/#FF6B6B/g, '#C5A059');
                updated = true;
            }

            if (updated) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated colors in:', fullPath);
            }
        }
    }
}

replaceColors(srcDir);
console.log('Color replacement complete.');
