import { Pdf } from '@asaje/html-to-pdf';

export async function printPdf(content: string, caseId: string) {
  const pdf = new Pdf();
  await pdf.init();
  const pdfRes = await pdf.printHtml({
    html: `<div><h1>${caseId}</h1><div>${content}</div></div>`,
    options: {
        format: 'A4',
        margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
      }
  });
  console.log('Pdf generated successfully');
  return pdfRes
}