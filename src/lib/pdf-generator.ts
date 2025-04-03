import jsPDF from 'jspdf';

interface GeneratePDFOptions {
  caseId: string;
  email: string;
  content: string;
}

export async function generatePDF({ caseId, email, content }: GeneratePDFOptions): Promise<Buffer> {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set fonts and margins
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Add header with case information
  doc.setFontSize(18);
  doc.text(`Case ID: ${caseId}`, margin, margin);
  
  doc.setFontSize(12);
  doc.text(`Email: ${email}`, margin, margin + 10);
  
  // Add a separator line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, margin + 15, pageWidth - margin, margin + 15);
  
  // Format the HTML content for PDF
  // Note: This is a simplified approach. For complex HTML, consider using html2canvas or similar
  const contentWithoutHTML = content
    .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
    .replace(/\s+/g, ' ')      // Remove multiple spaces
    .trim();
  
  // Add content with word wrap
  doc.setFontSize(11);
  const splitText = doc.splitTextToSize(contentWithoutHTML, contentWidth);
  doc.text(splitText, margin, margin + 25);
  
  // Add footer with date
  const currentDate = new Date().toLocaleString();
  doc.setFontSize(9);
  doc.text(`Generated on: ${currentDate}`, margin, doc.internal.pageSize.getHeight() - 10);
  
  // Convert to buffer for server-side operations
  return Buffer.from(doc.output('arraybuffer'));
}