import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { MediaRegistrationForm } from './components/MediaRegistrationForm';
import { TradeRegistrationForm } from './components/TradeRegistrationForm';
import { CaptainCrewDiverForm } from './components/CaptainCrewDiverForm';
import { VIPRegistration } from './components/VIPRegistration';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { Toaster } from './components/ui/sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet';
import { Anchor, Newspaper, Briefcase, Ship, Star, Shield, ArrowRight, Menu } from 'lucide-react';
import { Button } from './components/ui/button';

interface AdminUser {
  id: string;
  username: string;
  password: string;
  role: 'super_admin' | 'admin';
  permissions: string[];
  createdAt: string;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogin = (user: AdminUser) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const isAdminRoute = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      {!isAdminRoute && (
        <nav className="bg-[#0A2647] text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
                <Anchor className="h-8 w-8 text-[#D4AF37]" />
                <div className="flex flex-col">
                  <span className="text-xl tracking-wide">Qatar Boat Show 2025</span>
                  <span className="text-xs text-[#D4AF37] hidden sm:block">Registration Portal</span>
                </div>
              </Link>
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <Link to="/media" className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors py-2 px-3 rounded-md hover:bg-white/10">
                  <Newspaper className="w-4 h-4" />
                  Media
                </Link>
                <Link to="/trade" className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors py-2 px-3 rounded-md hover:bg-white/10">
                  <Briefcase className="w-4 h-4" />
                  Trade
                </Link>
                <Link to="/captain" className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors py-2 px-3 rounded-md hover:bg-white/10">
                  <Ship className="w-4 h-4" />
                  Captain/Crew
                </Link>
                <Link to="/vip" className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors py-2 px-3 rounded-md hover:bg-white/10">
                  <Star className="w-4 h-4" />
                  VIP
                </Link>
                <div className="h-6 w-px bg-white/30"></div>
                <Link to="/admin" className="flex items-center gap-1.5 text-[#D4AF37] hover:text-white transition-colors py-2 px-3 rounded-md hover:bg-white/10">
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              </div>
              {/* Mobile menu */}
              <div className="md:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                      <Menu className="w-6 h-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72 bg-white">
                    <SheetHeader>
                      <SheetTitle className="text-[#0A2647] flex items-center gap-2">
                        <Anchor className="w-5 h-5 text-[#D4AF37]" />
                        QBS 2025
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 flex flex-col gap-3">
                      <Link
                        to="/media"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Newspaper className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="text-[#0A2647]">Media</div>
                          <div className="text-xs text-gray-500">Journalists & Press</div>
                        </div>
                      </Link>
                      <Link
                        to="/trade"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="text-[#0A2647]">Trade</div>
                          <div className="text-xs text-gray-500">Industry Professionals</div>
                        </div>
                      </Link>
                      <Link
                        to="/captain"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Ship className="w-5 h-5 text-teal-600" />
                        <div>
                          <div className="text-[#0A2647]">Captain/Crew/Diver</div>
                          <div className="text-xs text-gray-500">Maritime Professionals</div>
                        </div>
                      </Link>
                      <Link
                        to="/vip"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-[#D4AF37] bg-yellow-50/50"
                      >
                        <Star className="w-5 h-5 text-[#D4AF37]" />
                        <div>
                          <div className="text-[#0A2647]">VIP</div>
                          <div className="text-xs text-gray-500">Exclusive Access</div>
                        </div>
                      </Link>
                      <div className="border-t border-gray-200 my-2"></div>
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Shield className="w-5 h-5 text-[#0A2647]" />
                        <div>
                          <div className="text-[#0A2647]">Admin Dashboard</div>
                          <div className="text-xs text-gray-500">Staff Only</div>
                        </div>
                      </Link>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/media" element={<MediaRegistrationForm />} />
        <Route path="/trade" element={<TradeRegistrationForm />} />
        <Route path="/captain" element={<CaptainCrewDiverForm />} />
        <Route path="/vip" element={<VIPRegistration />} />
        <Route 
          path="/admin" 
          element={
            currentUser ? (
              <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <AdminLogin onLogin={handleLogin} />
            )
          } 
        />
      </Routes>
    </div>
  );
}

function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0A2647] via-[#0A2647] to-[#153a5f] text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#D4AF37] rounded-full mb-6">
            <Anchor className="h-12 w-12 text-[#0A2647]" />
          </div>
          <h1 className="text-white mb-4 text-4xl sm:text-5xl lg:text-6xl">Welcome to Qatar Boat Show 2025</h1>
          <p className="text-blue-100 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            The region's premier maritime event. Select your registration type to get started.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
              <span>4 Registration Categories</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
              <span>Quick & Easy Process</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
              <span>Instant Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Cards Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-center text-[#0A2647] mb-4 text-2xl sm:text-3xl">Choose Your Registration Type</h2>
        <p className="text-center text-gray-600 mb-12 text-sm sm:text-base">Select the category that best describes your role</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Media Registration */}
          <Link
            to="/media"
            className="group relative p-8 bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#0A2647] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center w-14 h-14 bg-purple-100 rounded-lg group-hover:bg-[#0A2647] transition-colors">
                  <Newspaper className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-[#0A2647] mb-2 text-xl">📰 Media Registration</h3>
              <p className="text-gray-600 text-sm mb-4">For journalists, reporters, and media professionals covering the event</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">Press Badge</span>
                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">Media Access</span>
              </div>
            </div>
          </Link>

          {/* Trade Registration */}
          <Link
            to="/trade"
            className="group relative p-8 bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#0A2647] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-lg group-hover:bg-[#0A2647] transition-colors">
                  <Briefcase className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-[#0A2647] mb-2 text-xl">💼 Trade Registration</h3>
              <p className="text-gray-600 text-sm mb-4">For industry professionals, buyers, and business representatives</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">B2B Access</span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">Networking</span>
              </div>
            </div>
          </Link>

          {/* Captain/Crew/Diver Registration */}
          <Link
            to="/captain"
            className="group relative p-8 bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#0A2647] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center w-14 h-14 bg-teal-100 rounded-lg group-hover:bg-[#0A2647] transition-colors">
                  <Ship className="w-7 h-7 text-teal-600 group-hover:text-white transition-colors" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-[#0A2647] mb-2 text-xl">⚓ Captain / Crew / Diver</h3>
              <p className="text-gray-600 text-sm mb-4">For maritime professionals, captains, crew members, and divers</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded">Professional Access</span>
                <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded">Maritime</span>
              </div>
            </div>
          </Link>

          {/* VIP Registration */}
          <Link
            to="/vip"
            className="group relative p-8 bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-[#D4AF37] hover:border-[#D4AF37] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center w-14 h-14 bg-[#D4AF37] rounded-lg group-hover:bg-[#0A2647] transition-colors">
                  <Star className="w-7 h-7 text-white transition-colors" />
                </div>
                <div className="flex items-center gap-1 text-xs bg-[#D4AF37] text-white px-2 py-1 rounded">
                  <Star className="w-3 h-3 fill-current" />
                  EXCLUSIVE
                </div>
              </div>
              <h3 className="text-[#0A2647] mb-2 text-xl">⭐ VIP Registration</h3>
              <p className="text-gray-600 text-sm mb-4">Exclusive access for invited guests with promo code</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-[#D4AF37]">VIP Access</span>
                <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-[#D4AF37]">Promo Required</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Admin Access Section */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-gray-50 rounded-lg p-6 border border-gray-200">
            <Shield className="w-8 h-8 text-[#0A2647] mx-auto mb-3" />
            <p className="text-gray-600 mb-3 text-sm">Event staff and administrators</p>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-[#0A2647] hover:text-[#D4AF37] transition-colors text-sm"
            >
              Access Admin Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#0A2647] text-white py-8 px-4 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Anchor className="h-6 w-6 text-[#D4AF37]" />
            <span className="text-lg">Qatar Boat Show 2025</span>
          </div>
          <p className="text-blue-100 text-sm">
            Registration System | Powered by Advanced Technology
          </p>
        </div>
      </div>
    </div>
  );
}
