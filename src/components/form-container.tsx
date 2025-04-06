"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import RichTextEditor from "./rich-text-editor";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

// Define form schema with Zod
const formSchema = z.object({
  caseId: z.string().min(1, { message: "Case ID is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  content: z.string().min(1, { message: "Content is required" }),
});

export default function FormContainer() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseId: "",
      email: "",
      content: "<p>Start typing your case details here...</p>",
    },
  });

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setSubmitMessage({
          type: "success",
          text: "Form submitted successfully!",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send email handler
  const handleSendEmail = async () => {
    if (!form.formState.isValid) {
      form.trigger();
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form.getValues()),
      });

      if (response.ok) {
        setSubmitMessage({ type: "success", text: "Email sent successfully!" });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to send email");
      }
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to send email",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate PDF handler
  const handleGeneratePDF = async () => {
    if (!form.formState.isValid) {
      form.trigger();
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form.getValues()),
      });

      if (response.ok) {
        // Get the PDF blob from the response
        const blob = await response.blob();

        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary link element
        const a = document.createElement("a");
        a.href = url;
        a.download = `case-${form.getValues().caseId}.pdf`;

        // Trigger a click on the link to start the download
        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setSubmitMessage({
          type: "success",
          text: "PDF generated and downloaded successfully!",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate PDF");
      }
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to generate PDF",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  async function handleGenerateAndUpload() {
    if (!form.formState.isValid) {
      form.trigger();
      return;
    }
    setIsGenerating(true);
    setError(null);

    try {
      // Get the HTML content from your rich text field

      // Upload the PDF buffer to your API endpoint
      const response = await fetch("/api/uploadPdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form.getValues()),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to upload PDF");
      }

      // Set the PDF URL for display/download
      setPdfUrl(result.url);
    } catch (err) {
      console.error("PDF generation/upload error:", err);
      setError((err as Error).message || "Failed to generate or upload PDF");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Case Form</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="caseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter case ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case Details</FormLabel>
                <FormControl>
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {submitMessage && (
            <div
              className={`p-4 rounded-md ${submitMessage.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
                }`}
            >
              {submitMessage.text}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSendEmail}
              disabled={isSubmitting}
            >
              Send Email
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleGeneratePDF}
              disabled={isSubmitting}
            >
              Generate PDF
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleGenerateAndUpload}
              disabled={isGenerating}
            >
              {isGenerating ? "Processing..." : "Generate & Upload PDF"}
            </Button>

            {error && <div className="error">{error}</div>}

            {pdfUrl && (
              <div className="success">
                <p>PDF uploaded successfully!</p>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  View or Download PDF
                </a>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
