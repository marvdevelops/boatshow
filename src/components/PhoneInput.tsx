import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { countries } from './countries-data';
import { Search } from 'lucide-react';

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  required?: boolean;
  label?: string;
}

export function PhoneInput({ 
  countryCode, 
  phoneNumber, 
  onCountryCodeChange, 
  onPhoneNumberChange,
  required = false,
  label = 'Phone Number'
}: PhoneInputProps) {
  const [search, setSearch] = useState('');
  
  // Default to Qatar if no country code is provided
  const qatarCountry = countries.find(c => c.code === 'QA');
  const selectedCountry = countries.find(c => c.dialCode === countryCode) || qatarCountry;

  const filteredCountries = search
    ? countries.filter(country =>
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.dialCode.toLowerCase().includes(search.toLowerCase()) ||
        country.code.toLowerCase().includes(search.toLowerCase())
      )
    : countries;

  return (
    <div>
      <Label htmlFor="phone">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex gap-2 mt-2">
        <Select value={countryCode} onValueChange={onCountryCodeChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue>
              {selectedCountry && (
                <span className="flex items-center gap-2">
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span>{selectedCountry.dialCode}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <div className="sticky top-0 bg-white p-2 border-b z-10">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <SelectItem key={country.code} value={country.dialCode}>
                  <div className="flex items-center justify-between w-full gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                    <span className="text-gray-400 text-xs">{country.dialCode}</span>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-gray-500">
                No country found
              </div>
            )}
          </SelectContent>
        </Select>
        
        <Input
          id="phone"
          type="tel"
          required={required}
          placeholder="12345678"
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChange(e.target.value.replace(/\D/g, ''))}
          className="flex-1 focus:border-[#0A2647] focus:ring-[#0A2647]"
        />
      </div>
    </div>
  );
}
