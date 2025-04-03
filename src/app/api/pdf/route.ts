import { NextRequest, NextResponse } from 'next/server';
import { generatePDF } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseId, email, content } = body;
    
    // Validate the required fields
    if (!caseId || !email || !content) {
      return NextResponse.json(
        { message: 'Missing required fields: caseId, email, and content are required' },
        { status: 400 }
      );
    }
    
    // Generate the PDF
    const pdfBuffer = await generatePDF({ caseId, email, content });
    
    // Return the PDF file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="case-${caseId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return NextResponse.json(
      { message: 'Failed to generate PDF', error: (error as Error).message },
      { status: 500 }
    );
  }
}