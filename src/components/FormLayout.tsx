import { ReactNode } from 'react';

interface FormLayoutProps {
  title: string;
  children: ReactNode;
}

export function FormLayout({ title, children }: FormLayoutProps) {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl border-t-4 border-[#0A2647] overflow-hidden">
          <div className="bg-[#0A2647] px-8 py-6">
            <h1 className="text-white text-center">{title}</h1>
          </div>
          <div className="px-8 py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
