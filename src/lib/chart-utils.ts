import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Chart data processing utilities
export const processPatientData = (patients: any[]) => {
  const activeCount = patients.filter(p => p.isActive).length;
  const inactiveCount = patients.filter(p => !p.isActive).length;
  
  return [
    { name: 'Actifs', value: activeCount, color: '#10b981' },
    { name: 'Archivés', value: inactiveCount, color: '#6b7280' }
  ];
};

export const processReportsData = (reports: any[]) => {
  const shiftCounts = reports.reduce((acc, report) => {
    const shift = report.shift || 'unknown';
    acc[shift] = (acc[shift] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const shiftLabels = {
    'day': 'Jour',
    'evening': 'Soir', 
    'night': 'Nuit',
    'unknown': 'Inconnu'
  };

  return Object.entries(shiftCounts).map(([shift, count]) => ({
    name: shiftLabels[shift as keyof typeof shiftLabels] || shift,
    value: count as number,
    color: shift === 'day' ? '#f59e0b' : shift === 'evening' ? '#f97316' : shift === 'night' ? '#3b82f6' : '#6b7280'
  }));
};

export const processBristolData = (entries: any[]) => {
  const bristolCounts = entries.reduce((acc, entry) => {
    const value = entry.value || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bristolLabels = {
    '1': 'Type 1 - Très dur',
    '2': 'Type 2 - Dur', 
    '3': 'Type 3 - Normal dur',
    '4': 'Type 4 - Normal',
    '5': 'Type 5 - Normal mou',
    '6': 'Type 6 - Mou',
    '7': 'Type 7 - Liquide'
  };

  const bristolColors = {
    '1': '#dc2626',
    '2': '#ea580c',
    '3': '#d97706',
    '4': '#16a34a',
    '5': '#2563eb',
    '6': '#7c3aed',
    '7': '#9333ea'
  };

  return Object.entries(bristolCounts).map(([value, count]) => ({
    name: bristolLabels[value as keyof typeof bristolLabels] || `Type ${value}`,
    value: count as number,
    color: bristolColors[value as keyof typeof bristolColors] || '#6b7280'
  }));
};

export const processTimelineData = (data: any[], dateField: string = 'createdAt') => {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const counts = last30Days.map(date => {
    const count = data.filter(item => 
      item[dateField] && item[dateField].startsWith(date)
    ).length;
    
    return {
      date: new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      count
    };
  });

  return counts;
};

// PDF generation utilities
export const generatePDFWithCharts = async (
  title: string,
  chartElements: HTMLElement[],
  tableData?: any,
  metadata?: { [key: string]: string }
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Add title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 20, 25);
  
  // Add metadata
  if (metadata) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    let y = 35;
    Object.entries(metadata).forEach(([key, value]) => {
      pdf.text(`${key}: ${value}`, 20, y);
      y += 6;
    });
  }
  
  let currentY = metadata ? 35 + (Object.keys(metadata).length * 6) + 10 : 35;
  
  // Add charts
  for (const element of chartElements) {
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Check if we need a new page
      if (currentY + imgHeight > 280) {
        pdf.addPage();
        currentY = 20;
      }
      
      pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 10;
      
    } catch (error) {
      console.error('Error adding chart to PDF:', error);
    }
  }
  
  // Add table data if provided
  if (tableData && tableData.headers && tableData.rows) {
    if (currentY > 200) {
      pdf.addPage();
      currentY = 20;
    }
    
    autoTable(pdf, {
      head: [tableData.headers],
      body: tableData.rows,
      startY: currentY,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });
  }
  
  // Add footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Page ${i} sur ${pageCount} • Généré le ${new Date().toLocaleDateString('fr-FR')} • Plateforme Irielle`,
      20,
      290
    );
  }
  
  return pdf;
};

export const downloadPDF = (pdf: jsPDF, filename: string) => {
  pdf.save(filename);
};

// Chart color themes
export const chartThemes = {
  primary: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'],
  medical: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
  bristol: ['#dc2626', '#ea580c', '#d97706', '#16a34a', '#2563eb', '#7c3aed', '#9333ea'],
  shifts: ['#f59e0b', '#f97316', '#3b82f6']
};