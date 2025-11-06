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
import { toast } from 'sonner@2.0.3';
import { CheckCircle, Waves, Loader2 } from 'lucide-react';
import { createSubmission, uploadFile } from '../utils/api';

export function CaptainCrewDiverForm() {
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
  const [license, setLicense] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessCard || !license) {
      toast.error('Please upload all required documents');
      return;
    }

    setIsSubmitting(true);

    try {
      const tempId = Date.now().toString();

      toast.info('Uploading documents...');
      const [businessCardUpload, licenseUpload] = await Promise.all([
        uploadFile(businessCard, 'Captain', tempId),
        uploadFile(license, 'Captain', tempId),
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
        verificationDoc: licenseUpload.url,
        verificationDocPath: licenseUpload.path,
        category: 'Captain/Crew/Diver',
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
      <FormLayout title="Captain / Crew / Diver Registration">
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-[#0A2647] mb-4">Thank You!</h2>
          <p className="text-gray-600">
            Your application has been submitted for verification.
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative wave pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <Waves className="absolute top-20 right-10 w-32 h-32 text-[#0A2647]" />
        <Waves className="absolute bottom-20 left-10 w-32 h-32 text-[#0A2647]" />
      </div>
      
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="bg-white rounded-lg shadow-xl border-t-4 border-[#0A2647] overflow-hidden">
          <div className="bg-[#0A2647] px-8 py-6">
            <h1 className="text-white text-center">Captain / Crew / Diver Registration</h1>
          </div>
          <div className="px-8 py-8">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                  label="Business Card"
                  required
                  onChange={setBusinessCard}
                  accept=".pdf,.png,.jpg,.jpeg"
                />

                <FileUpload
                  label="Official License for Verification"
                  required
                  onChange={setLicense}
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
          </div>
        </div>
      </div>
    </div>
  );
}
