import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormLayout } from './FormLayout';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FileUpload } from './FileUpload';
import { CountrySelect } from './CountrySelect';
import { PhoneInput } from './PhoneInput';
import { SmartUrlInput } from './SmartUrlInput';
import { toast } from 'sonner';
import { CheckCircle, Loader2 } from 'lucide-react';
import { createSubmission, uploadFile } from '../utils/api';

export function TradeRegistrationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    countryCode: '+974',
    phoneNumber: '',
    company: '',
    website: '',
    jobTitle: '',
    country: '',
    linkedin: '',
  });
  const [businessCard, setBusinessCard] = useState<File | null>(null);
  const [verificationCard, setVerificationCard] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessCard || !verificationCard) {
      toast.error('Please upload all required documents');
      return;
    }

    setIsSubmitting(true);

    try {
      const tempId = Date.now().toString();

      toast.info('Uploading documents...');
      const [businessCardUpload, verificationCardUpload] = await Promise.all([
        uploadFile(businessCard, 'Trade', tempId),
        uploadFile(verificationCard, 'Trade', tempId),
      ]);

      const submissionData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: `${formData.countryCode} ${formData.phoneNumber}`,
        company: formData.company,
        website: formData.website,
        jobTitle: formData.jobTitle,
        country: formData.country,
        linkedin: formData.linkedin,
        businessCard: businessCardUpload.url,
        businessCardPath: businessCardUpload.path,
        verificationDoc: verificationCardUpload.url,
        verificationDocPath: verificationCardUpload.path,
        category: 'Trade',
      };

      toast.info('Submitting application...');
      await createSubmission(submissionData);

      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <FormLayout title="Trade Registration">
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-[#0A2647] mb-4">Thank You!</h2>
          <p className="text-gray-600">
            Your trade application has been submitted for verification.
          </p>
          <p className="text-gray-600 mt-2">
            You will receive a confirmation email once your application is reviewed.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="mt-8 bg-[#0A2647] hover:bg-[#D4AF37] hover:text-[#0A2647] transition-colors"
          >
            Back to Home
          </Button>
        </div>
      </FormLayout>
    );
  }

  return (
    <FormLayout title="Trade Registration">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="focus:border-[#0A2647] focus:ring-[#0A2647]"
            />
          </div>

          <PhoneInput
            countryCode={formData.countryCode}
            phoneNumber={formData.phoneNumber}
            onCountryCodeChange={(code) => setFormData({ ...formData, countryCode: code })}
            onPhoneNumberChange={(number) => setFormData({ ...formData, phoneNumber: number })}
            required
            label="Phone Number"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
            <Input
              id="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="focus:border-[#0A2647] focus:ring-[#0A2647]"
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
            <Input
              id="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="focus:border-[#0A2647] focus:ring-[#0A2647]"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="company">Company Name <span className="text-red-500">*</span></Label>
          <Input
            id="company"
            type="text"
            required
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="focus:border-[#0A2647] focus:ring-[#0A2647]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SmartUrlInput
            label="Company Website"
            id="website"
            value={formData.website}
            onChange={(value) => setFormData({ ...formData, website: value })}
            required
            placeholder="company.com"
          />

          <div>
            <Label htmlFor="jobTitle">Job Title <span className="text-red-500">*</span></Label>
            <Input
              id="jobTitle"
              type="text"
              required
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              className="focus:border-[#0A2647] focus:ring-[#0A2647] mt-2"
            />
          </div>
        </div>

        <CountrySelect
          value={formData.country}
          onChange={(value) => setFormData({ ...formData, country: value })}
          required
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            Please upload your business card here for verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUpload
            label="Business Card"
            required
            onChange={setBusinessCard}
            accept=".pdf,.png,.jpg,.jpeg"
          />

          <FileUpload
            label="Business Card for Verification"
            required
            onChange={setVerificationCard}
            accept=".pdf,.png,.jpg,.jpeg"
          />
        </div>

        <SmartUrlInput
          label="LinkedIn Profile"
          id="linkedin"
          value={formData.linkedin}
          onChange={(value) => setFormData({ ...formData, linkedin: value })}
          required
          placeholder="linkedin.com/in/yourprofile"
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#0A2647] hover:bg-[#D4AF37] hover:text-[#0A2647] transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Registration'
          )}
        </Button>
      </form>
    </FormLayout>
  );
}
