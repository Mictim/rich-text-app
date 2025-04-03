import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service';

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
    
    // Send the email
    await sendEmail({ caseId, email, content });
    
    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json(
      { message: 'Failed to send email', error: (error as Error).message },
      { status: 500 }
    );
  }
}