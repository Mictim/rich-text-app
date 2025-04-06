import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { NextRequest, NextResponse } from 'next/server';
import { printPdf } from '@/lib/html-to-pdf';
// import dotenv from 'dotenv'
// dotenv.config()

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dlnx0m6l7",
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,

});


// Define types
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  url: string;
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Uploads a PDF buffer directly to Cloudinary without storing on disk
 */
async function uploadPdfBufferToCloudinary(
  pdfBuffer: Buffer, 
  fileName: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    // Create a Readable stream from the buffer
    const bufferStream = new Readable();
    
    // Push the buffer to the stream
    bufferStream.push(pdfBuffer);
    bufferStream.push(null);
    
    // Create upload stream to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        public_id: fileName,
        format: 'pdf',
        upload_preset: 'lawhub_cases'
      },
      (error: Error | undefined, result: CloudinaryUploadResult | undefined) => {
        if (error || !result) {
          reject(error || new Error('Upload failed with no error'));
        } else {
          resolve(result);
        }
      }
    );
    
    // Pipe the buffer stream to the upload stream
    bufferStream.pipe(uploadStream);
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw request body as buffer
    const { caseId, content } = await request.json();

    const pdfBuffer = await printPdf(content, caseId);
    
    // Generate a filename with timestamp to avoid collisions
    const fileName = `${caseId}`;
    
    // Upload the PDF buffer to Cloudinary
    const result = await uploadPdfBufferToCloudinary(pdfBuffer!, fileName);
    console.log(JSON.stringify(result, null, 2));
    // Return the Cloudinary result
    return NextResponse.json({url: result.secure_url}, { status: 200 });
  } catch (e) {
      const error = e as Error;
      return NextResponse.json({message: "Error: " + error.message}, { status: 500 });
  }
}