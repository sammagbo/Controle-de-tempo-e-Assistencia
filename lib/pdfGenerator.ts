import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFMeetingData {
      theme: string;
      date: string;
      president: string;
      attendance: {
            presencial: number;
            zoom: number;
            total: number;
      };
      parts: {
            title: string;
            names: string;
            time: string;
            status: 'on-time' | 'overtime' | 'undertime';
            is_comment: boolean;
      }[];
}

export const generateMeetingPDF = (data: PDFMeetingData) => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      // --- Header ---
      // Title
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text('Relatório da Reunião', pageWidth / 2, 20, { align: 'center' });

      // Subtitle (Date)
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(data.date, pageWidth / 2, 28, { align: 'center' });

      // Theme Box
      doc.setFillColor(245, 247, 250); // Light gray background
      doc.roundedRect(15, 35, pageWidth - 30, 25, 3, 3, 'F');

      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text('Tema:', 20, 45);
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0); // Black
      doc.setFont('helvetica', 'bold');
      const splitTheme = doc.splitTextToSize(data.theme, pageWidth - 50);
      doc.text(splitTheme, 20, 52);

      // President Name
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(`Presidente: ${data.president || 'Não informado'}`, 20, 68);

      // --- Table of Parts ---
      const tableBody = data.parts.map(part => [
            part.title,
            part.names,
            part.time
      ]);

      autoTable(doc, {
            startY: 75,
            head: [['Parte', 'Designado(s)', 'Tempo']],
            body: tableBody,
            theme: 'grid',
            headStyles: {
                  fillColor: [66, 133, 244], // Blue
                  textColor: 255,
                  fontSize: 11,
                  fontStyle: 'bold',
                  halign: 'left'
            },
            bodyStyles: {
                  textColor: 50,
                  fontSize: 10,
                  cellPadding: 3
            },
            columnStyles: {
                  0: { cellWidth: 'auto' }, // Title
                  1: { cellWidth: 50 },     // Names
                  2: { cellWidth: 25, halign: 'center' } // Time
            },
            didParseCell: (data) => {
                  // Highlight comments slightly differently
                  if (data.section === 'body' && data.row.index >= 0) {
                        const originalRow = tableBody[data.row.index];
                        // Cannot easily access 'is_comment' here without keeping index mapping
                        // But we can check if title starts with "Comentários"
                        const title = originalRow[0] as string;
                        if (title.includes('Comentários') || title.includes('Conselho')) {
                              data.cell.styles.fontStyle = 'italic';
                              data.cell.styles.textColor = [100, 100, 100];
                        }
                  }
            }
      });

      // --- Footer / Attendance ---
      const finalY = (doc as any).lastAutoTable.finalY + 15;

      doc.setFillColor(240, 248, 255); // Light blue
      doc.roundedRect(15, finalY, pageWidth - 30, 30, 3, 3, 'F');

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Assistência Total', pageWidth / 2, finalY + 10, { align: 'center' });

      doc.setFontSize(24);
      doc.setTextColor(66, 133, 244); // Primary Blue
      doc.text(data.attendance.total.toString(), pageWidth / 2, finalY + 22, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Presencial: ${data.attendance.presencial} | Zoom: ${data.attendance.zoom}`, pageWidth / 2, finalY + 28, { align: 'center' });

      // Save
      const fileName = `Relatorio_Reuniao_${data.date.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
};
