import { useState } from 'react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { countries } from './countries-data';
import { Search } from 'lucide-react';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
}

export function CountrySelect({ value, onChange, required = false, label = 'Country' }: CountrySelectProps) {
  const [search, setSearch] = useState('');
  
  const selectedCountry = countries.find(c => c.name === value);
  
  const filteredCountries = search
    ? countries.filter(country =>
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.code.toLowerCase().includes(search.toLowerCase())
      )
    : countries;

  return (
    <div>
      <Label htmlFor="country">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} required={required}>
        <SelectTrigger className="w-full mt-2">
          <SelectValue placeholder="Select country...">
            {selectedCountry && (
              <span className="flex items-center gap-2">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span>{selectedCountry.name}</span>
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
              <SelectItem key={country.code} value={country.name}>
                <div className="flex items-center justify-between w-full gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{country.flag}</span>
                    <span>{country.name}</span>
                  </div>
                  <span className="text-gray-400 text-xs">{country.code}</span>
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
    </div>
  );
}
