import { Input } from './ui/input';
import { Label } from './ui/label';
import { ExternalLink } from 'lucide-react';

interface SmartUrlInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

export function SmartUrlInput({ label, id, value, onChange, required = false, placeholder }: SmartUrlInputProps) {
  const formatUrl = (url: string): string => {
    if (!url) return '';
    
    // Remove whitespace
    const trimmed = url.trim();
    
    // If already has protocol, return as is
    if (trimmed.match(/^https?:\/\//i)) {
      return trimmed;
    }
    
    // Add https:// if missing
    return `https://${trimmed}`;
  };

  const handleBlur = () => {
    if (value) {
      const formatted = formatUrl(value);
      onChange(formatted);
    }
  };

  const displayValue = value.replace(/^https?:\/\//i, '');

  return (
    <div>
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative mt-2">
        <Input
          id={id}
          type="text"
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder || 'example.com'}
          className="focus:border-[#0A2647] focus:ring-[#0A2647] pr-10"
        />
        <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
      {value && (
        <p className="text-xs text-gray-500 mt-1">
          Will be saved as: {formatUrl(value)}
        </p>
      )}
    </div>
  );
}
