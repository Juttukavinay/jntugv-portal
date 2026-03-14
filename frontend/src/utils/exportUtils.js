export const exportToCSV = (headers, data, filename) => {
    const csvContent = [
        headers.join(','),
        ...data.map(row => row.map(cell => {
            const str = String(cell || '');
            return `"${str.replace(/"/g, '""')}"`; // Escape quotes for CSV
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
