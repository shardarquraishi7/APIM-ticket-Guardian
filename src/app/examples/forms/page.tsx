import React from 'react';
import Link from 'next/link';

export default function FormsExample() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-telus-purple mb-2">Form Examples</h1>
        <p className="text-telus-grey max-w-3xl">
          Examples of form handling with React Hook Form and Zod validation. These examples demonstrate
          form submission, validation, and error handling patterns.
        </p>
        <div className="mt-4">
          <Link href="/examples" className="text-telus-purple hover:underline">
            ← Back to Examples
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form Example */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-telus-purple">Contact Form</h2>
          </div>
          <div className="card-body">
            <form className="space-y-4">
              <div className="form-control">
                <label htmlFor="name" className="form-label">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="form-input" 
                  placeholder="John Doe"
                />
              </div>
              
              <div className="form-control">
                <label htmlFor="email" className="form-label">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="form-input" 
                  placeholder="john@example.com"
                />
                <div className="form-error">Please enter a valid email address</div>
              </div>
              
              <div className="form-control">
                <label htmlFor="subject" className="form-label">Subject</label>
                <select id="subject" className="form-input">
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
              
              <div className="form-control">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea 
                  id="message" 
                  rows={4} 
                  className="form-input" 
                  placeholder="Your message here..."
                ></textarea>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="consent" 
                  className="mr-2 h-4 w-4 text-telus-purple focus:ring-telus-purple border-gray-300 rounded" 
                />
                <label htmlFor="consent" className="text-sm text-telus-grey">
                  I consent to being contacted regarding my inquiry
                </label>
              </div>
              
              <button type="submit" className="btn btn-primary w-full">
                Submit
              </button>
            </form>
          </div>
          <div className="card-footer">
            <p className="text-sm text-telus-grey">
              This is a static example. Check the source code to see how to implement this with React Hook Form and Zod validation.
            </p>
          </div>
        </div>

        {/* Code Implementation */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-telus-purple">Implementation Code</h2>
          </div>
          <div className="card-body p-0">
            <div className="bg-gray-100 text-gray-800 p-4 rounded-md overflow-auto max-h-[500px] border">
              <pre className="text-sm">
{`import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define the form schema with Zod
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must consent to be contacted'
  })
});

// Infer TypeScript type from the schema
type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      consent: false
    }
  });

  // Form submission handler
  const onSubmit = async (data: ContactFormValues) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', data);
      
      // Reset form after successful submission
      reset();
      
      // Show success message
      alert('Form submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-control">
        <label htmlFor="name" className="form-label">Name</label>
        <input 
          id="name"
          {...register('name')}
          className="form-input"
          placeholder="John Doe"
        />
        {errors.name && (
          <div className="form-error">{errors.name.message}</div>
        )}
      </div>
      
      {/* Other form fields with similar pattern... */}
      
      <button 
        type="submit" 
        className="btn btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-telus-purple mb-4">Form Features Demonstrated</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-bold text-telus-purple mb-2">Validation</h3>
              <p className="text-telus-grey">Client-side validation with Zod schema and real-time error messages.</p>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-bold text-telus-purple mb-2">Form Controls</h3>
              <p className="text-telus-grey">Various input types including text, email, select, textarea, and checkbox.</p>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-bold text-telus-purple mb-2">Error Handling</h3>
              <p className="text-telus-grey">Comprehensive error handling with user-friendly error messages.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}