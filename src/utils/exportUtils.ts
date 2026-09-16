/**
 * Utility to export HTML content as a formatted Microsoft Word (.doc) document
 * with university standards, borders, tables, and typography.
 */
export function exportToWord(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('Không tìm thấy nội dung tài liệu để xuất.');
    return;
  }

  const htmlContent = element.innerHTML;
  
  const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' 
        xmlns:w='urn:schemas-microsoft-com:office:word' 
        xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>${filename}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 2cm 2cm 2cm 2.5cm;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 13pt;
              line-height: 1.5;
              color: #000;
            }
            h1, h2, h3, h4 {
              font-family: 'Times New Roman', Times, serif;
              color: #000;
              font-weight: bold;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 15px 0;
            }
            th, td {
              border: 1px solid #000;
              padding: 6px 8px;
              text-align: left;
              font-size: 12pt;
              vertical-align: top;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .cover-page {
              text-align: center;
              page-break-after: always;
              border: 3px double #000;
              padding: 40px 20px;
              min-height: 800px;
            }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>`;
        
  const footer = "</body></html>";
  const sourceHTML = header + htmlContent + footer;

  const blob = new Blob(['\ufeff' + sourceHTML], {
    type: 'application/msword;charset=utf-8'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data array to CSV format
 */
export function exportToCSV(filename: string, rows: (string | number)[][]) {
  const csvContent = "data:text/csv;charset=utf-8,\ufeff" 
    + rows.map(e => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(",")).join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers standard browser print dialog for current view
 */
export function printDocument() {
  window.print();
}
