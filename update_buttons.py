import os, re
files = [
    'f:/Mern/frontend/src/pages/dashboard/AdminDashboard.jsx',
    'f:/Mern/frontend/src/pages/dashboard/PrincipalDashboard.jsx',
    'f:/Mern/frontend/src/pages/dashboard/VicePrincipalDashboard.jsx',
    'f:/Mern/frontend/src/pages/dashboard/HodDashboard.jsx',
    'f:/Mern/frontend/src/pages/dashboard/FacultyDashboard.jsx',
    'f:/Mern/frontend/src/pages/dashboard/StudentDashboard.jsx'
]

for file_path in files:
    if not os.path.exists(file_path): continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 1: Ensure flexWrap in action containers
    content = content.replace("style={{ display: 'flex', gap: '0.75rem' }}", "style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}")
    content = content.replace("style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}", "style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}")

    # Step 2: Extract excel buttons using regex to duplicate them
    pattern = re.compile(r'(<button className="btn-action excel"[\s\S]*?</button>)')
    
    def replacer(match):
        original_btn = match.group(1)
        
        btn_upload = '''<label className="btn-action upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Upload CSV">
                            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => { if(e.target.files[0]) alert('CSV Upload triggered for ' + e.target.files[0].name); }} />
                            📤 Upload CSV
                        </label>'''
        
        btn_csv = original_btn.replace('excel', 'csv-dl').replace('📊 CSV', '📄 CSV')
        btn_excel = original_btn.replace('Export CSV', 'Export Excel').replace('📊 CSV', '📊 Excel')
        
        return btn_upload + '\n                        ' + btn_csv + '\n                        ' + btn_excel
        
    content = pattern.sub(replacer, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
print('Done!')
