import { NextRequest, NextResponse } from 'next/server';

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
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // In a real application, this is where you would:
    // 1. Save the form data to a database
    // 2. Process any additional business logic
    
    // For demonstration, we'll just simulate a successful submission
    console.log('Form submitted:', { caseId, email, contentLength: content.length });
    
    return NextResponse.json({ 
      message: 'Form submitted successfully',
      caseId
    });
  } catch (error) {
    console.error('Failed to submit form:', error);
    return NextResponse.json(
      { message: 'Failed to submit form', error: (error as Error).message },
      { status: 500 }
    );
  }
}