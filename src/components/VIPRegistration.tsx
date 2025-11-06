import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { CheckCircle, Sparkles, Anchor } from 'lucide-react';
import { PhoneInput } from './PhoneInput';
import { CountrySelect } from './CountrySelect';
import { validatePromoCode, createSubmission } from '../utils/api';

export function VIPRegistration() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [hasAccompanying, setHasAccompanying] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [promoError, setPromoError] = useState('');

  const [mainGuest, setMainGuest] = useState({
    email: '',
    firstName: '',
    lastName: '',
    countryCode: '+974',
    phoneNumber: '',
    country: 'Qatar',
  });

  const [accompanyingGuest, setAccompanyingGuest] = useState({
    email: '',
    firstName: '',
    lastName: '',
    countryCode: '+974',
    phoneNumber: '',
    country: 'Qatar',
  });

  const [promoCode, setPromoCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');

    try {
      // Validate promo code with backend
      const validationResult = await validatePromoCode(promoCode.toUpperCase());
      
      if (!validationResult.valid) {
        setPromoError('Invalid promo code. Please check your invitation.');
        toast.error('Invalid promo code');
        return;
      }

      // Create submission data
      const submissionData = {
        email: mainGuest.email,
        firstName: mainGuest.firstName,
        lastName: mainGuest.lastName,
        company: 'VIP Guest',
        linkedin: '',
        phone: `${mainGuest.countryCode} ${mainGuest.phoneNumber}`,
        country: mainGuest.country,
        businessCard: 'VIP Registration',
        category: 'VIP',
        status: 'approved',
        hasAccompanyingGuest: hasAccompanying,
        vipData: {
          mainGuest,
          accompanyingGuest: hasAccompanying ? accompanyingGuest : null,
          promoCode: promoCode.toUpperCase(),
        }
      };

      // Submit to backend
      await createSubmission(submissionData);

      setSubmitted(true);
      toast.success('VIP Registration Confirmed!');
    } catch (error) {
      console.error('VIP registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2647] via-[#144272] to-[#0A2647] flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-12 text-center">
          <CheckCircle className="w-20 h-20 text-[#D4AF37] mx-auto mb-6" />
          <h1 className="text-[#0A2647] mb-4">Registration Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Congratulations! Your VIP access to Qatar Boat Show 2025 has been confirmed.
          </p>
          <p className="text-gray-600 mb-8">
            Confirmation emails have been sent to all registered guests.
          </p>
          <div className="bg-[#D4AF37] bg-opacity-10 border border-[#D4AF37] rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-700">
              Please present your confirmation email at the VIP entrance on the day of the event.
            </p>
          </div>
          <Button
            onClick={() => navigate('/')}
            className="bg-[#0A2647] hover:bg-[#D4AF37] hover:text-[#0A2647] transition-colors"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2647] via-[#144272] to-[#0A2647] flex items-center justify-center px-4">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-12">
            <Anchor className="h-20 w-20 text-[#D4AF37] mx-auto mb-6" />
            <h1 className="text-white mb-8">VIP REGISTRATION</h1>
          </div>

          <div className="bg-white rounded-xl shadow-2xl p-12">
            <div className="flex justify-center mb-8">
              <Sparkles className="w-12 h-12 text-[#D4AF37]" />
            </div>

            <div className="prose prose-lg mx-auto text-center mb-12">
              <p className="text-gray-700 mb-4">
                As a distinguished VIP guest, you are granted exclusive access to Qatar Boat Show.
              </p>
              <p className="text-gray-700 mb-4">
                To register, simply enter the promo code included in your invitation.
              </p>
              <p className="text-gray-700">
                Each digital invitation comes with a unique promo code assigned to you, granting VIP access for you and one guest.
              </p>
            </div>

            <Button
              onClick={() => setShowForm(true)}
              className="w-full bg-[#D4AF37] text-[#0A2647] hover:bg-[#C9A54A] transition-all shadow-lg hover:shadow-xl"
              size="lg"
            >
              REGISTER NOW
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2647] via-[#144272] to-[#0A2647] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#C9A54A] px-8 py-6">
            <h1 className="text-[#0A2647] text-center">VIP Registration Form</h1>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
            {/* Main Guest Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-4 border-b-2 border-[#D4AF37]">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-[#0A2647]">Main Guest Information</h2>
              </div>

              <div>
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={mainGuest.email}
                  onChange={(e) => setMainGuest({ ...mainGuest, email: e.target.value })}
                  className="focus:border-[#D4AF37] focus:ring-[#D4AF37] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    type="text"
                    required
                    value={mainGuest.firstName}
                    onChange={(e) => setMainGuest({ ...mainGuest, firstName: e.target.value })}
                    className="focus:border-[#D4AF37] focus:ring-[#D4AF37] transition-all"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    value={mainGuest.lastName}
                    onChange={(e) => setMainGuest({ ...mainGuest, lastName: e.target.value })}
                    className="focus:border-[#D4AF37] focus:ring-[#D4AF37] transition-all"
                  />
                </div>
              </div>

              <PhoneInput
                countryCode={mainGuest.countryCode}
                phoneNumber={mainGuest.phoneNumber}
                onCountryCodeChange={(code) => setMainGuest({ ...mainGuest, countryCode: code })}
                onPhoneNumberChange={(number) => setMainGuest({ ...mainGuest, phoneNumber: number })}
                required
                label="Phone Number"
              />

              <CountrySelect
                value={mainGuest.country}
                onChange={(value) => setMainGuest({ ...mainGuest, country: value })}
                required
                label="Country"
              />
            </div>

            {/* Accompanying Person Toggle */}
            <div className="bg-[#D4AF37] bg-opacity-10 border border-[#D4AF37] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="accompanying" className="cursor-pointer">
                  Accompanying Person
                </Label>
                <Switch
                  id="accompanying"
                  checked={hasAccompanying}
                  onCheckedChange={setHasAccompanying}
                />
              </div>
            </div>

            {/* Accompanying Guest Section */}
            {hasAccompanying && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-5 duration-300">
                <div className="flex items-center space-x-2 pb-4 border-b-2 border-[#D4AF37]">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  <h2 className="text-[#0A2647]">Accompanying Guest Information</h2>
                </div>

                <div>
                  <Label htmlFor="acc-email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="acc-email"
                    type="email"
                    required={hasAccompanying}
                    value={accompanyingGuest.email}
                    onChange={(e) => setAccompanyingGuest({ ...accompanyingGuest, email: e.target.value })}
                    className="focus:border-[#D4AF37] focus:ring-[#D4AF37] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="acc-firstName">First Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="acc-firstName"
                      type="text"
                      required={hasAccompanying}
                      value={accompanyingGuest.firstName}
                      onChange={(e) => setAccompanyingGuest({ ...accompanyingGuest, firstName: e.target.value })}
                      className="focus:border-[#D4AF37] focus:ring-[#D4AF37] transition-all"
                    />
                  </div>

                  <div>
                    <Label htmlFor="acc-lastName">Last Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="acc-lastName"
                      type="text"
                      required={hasAccompanying}
                      value={accompanyingGuest.lastName}
                      onChange={(e) => setAccompanyingGuest({ ...accompanyingGuest, lastName: e.target.value })}
                      className="focus:border-[#D4AF37] focus:ring-[#D4AF37] transition-all"
                    />
                  </div>
                </div>

                <PhoneInput
                  countryCode={accompanyingGuest.countryCode}
                  phoneNumber={accompanyingGuest.phoneNumber}
                  onCountryCodeChange={(code) => setAccompanyingGuest({ ...accompanyingGuest, countryCode: code })}
                  onPhoneNumberChange={(number) => setAccompanyingGuest({ ...accompanyingGuest, phoneNumber: number })}
                  required={hasAccompanying}
                  label="Phone Number"
                />

                <CountrySelect
                  value={accompanyingGuest.country}
                  onChange={(value) => setAccompanyingGuest({ ...accompanyingGuest, country: value })}
                  required={hasAccompanying}
                  label="Country"
                />
              </div>
            )}

            {/* Promo Code Section */}
            <div className="space-y-2">
              <Label htmlFor="promoCode">VIP Promo Code <span className="text-red-500">*</span></Label>
              <Input
                id="promoCode"
                type="text"
                required
                placeholder="Enter your unique promo code"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setPromoError('');
                }}
                className={`focus:border-[#D4AF37] focus:ring-[#D4AF37] transition-all ${
                  promoError ? 'border-red-500' : ''
                }`}
              />
              {promoError && (
                <p className="text-sm text-red-500 mt-1">{promoError}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Enter the unique promo code from your VIP invitation
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#D4AF37] text-[#0A2647] hover:bg-[#C9A54A] transition-all shadow-lg hover:shadow-xl"
              size="lg"
            >
              Complete VIP Registration
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
