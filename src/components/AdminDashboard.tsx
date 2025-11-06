import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { EmailTemplateEditor } from './EmailTemplateEditor';
import { EmailCampaignsPanel } from './EmailCampaignsPanel';
import { SuperAdminPanel } from './SuperAdminPanel';
import { toast } from 'sonner@2.0.3';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { getSubmissions, approveSubmission, rejectSubmission, deleteSubmission, createSubmission, getEmailTemplates, getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } from '../utils/api';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  FileText, 
  ExternalLink,
  BarChart3,
  Filter,
  Mail,
  Users,
  Image as ImageIcon,
  ZoomIn,
  X,
  Lock,
  UserCheck,
  Plus,
  Download,
  Sparkles,
  Upload,
  Trash2,
  Edit,
  Power,
  Printer,
  Send,
  Eye,
  Clock,
  UserPlus,
  ListFilter,
  Shield,
  Newspaper,
  Briefcase,
  Ship,
  Star,
  ClipboardList,
  Copy
} from 'lucide-react';

interface AdminUser {
  id: string;
  username: string;
  password: string;
  role: 'super_admin' | 'admin';
  permissions: string[];
  createdAt: string;
}

interface Submission {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle?: string;
  website?: string;
  linkedin: string;
  phone?: string;
  country?: string;
  businessCard: string;
  verificationDoc?: string;
  mediaId?: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  hasAccompanyingGuest?: boolean;
}

interface PromoCode {
  id: string;
  code: string;
  description: string;
  expiresAt?: string;
  expirationDate?: string;
  maxUses?: number;
  capacity?: number;
  usedCount?: number;
  used?: number;
  active: boolean;
}

interface AdminDashboardProps {
  currentUser: AdminUser;
  onLogout: () => void;
}

async function loadSubmissions() {
  const response = await getSubmissions();
  return response.submissions || [];
}

export function AdminDashboard({ currentUser, onLogout }: AdminDashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hasEmailTemplates, setHasEmailTemplates] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Set initial tab based on permissions
    if (currentUser.role === 'super_admin' || currentUser.permissions.includes('all')) {
      return 'superadmin';
    }
    if (currentUser.permissions.includes('submissions')) return 'submissions';
    if (currentUser.permissions.includes('participants')) return 'participants';
    if (currentUser.permissions.includes('campaigns')) return 'campaigns';
    if (currentUser.permissions.includes('promocodes')) return 'promocodes';
    if (currentUser.permissions.includes('templates')) return 'templates';
    return 'submissions';
  });

  const DEFAULT_PIN = '1234'; // Default PIN, can be changed in production

  // Check if user has permission for a specific section
  const hasPermission = (permission: string) => {
    return currentUser.role === 'super_admin' || 
           currentUser.permissions.includes('all') || 
           currentUser.permissions.includes(permission);
  };

  useEffect(() => {
    loadSubmissionsData();
    checkEmailTemplates();
  }, []);

  const checkEmailTemplates = async () => {
    try {
      const response = await getEmailTemplates();
      setHasEmailTemplates(response.templates && response.templates.length > 0);
    } catch (error) {
      console.error('Error checking email templates:', error);
    }
  };

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchTerm, categoryFilter, statusFilter]);

  const loadSubmissionsData = async () => {
    try {
      const data = await loadSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    setFilteredSubmissions(filtered);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const submission = submissions.find((sub) => sub.id === id);
      if (!submission) return;

      // Get email template for message
      const emailMessage = `Your registration for Qatar Boat Show 2025 has been ${status}.`;
      
      // Call appropriate endpoint
      if (status === 'approved') {
        await approveSubmission(id, emailMessage);
      } else {
        await rejectSubmission(id, emailMessage);
      }

      const message = status === 'approved' 
        ? `✅ Approved ${submission.firstName} ${submission.lastName} - Notification email sent`
        : `❌ Rejected ${submission.firstName} ${submission.lastName} - Notification email sent`;
      toast.success(message, { duration: 5000 });
      
      // Reload submissions
      await loadSubmissionsData();
    } catch (error) {
      console.error('Error updating submission status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update submission');
    }
  };

  const handleTabChange = (value: string) => {
    if (value === 'templates') {
      if (!isPinVerified) {
        setShowPinDialog(true);
        return;
      }
    }
    setActiveTab(value);
  };

  const verifyPin = () => {
    if (pinInput === DEFAULT_PIN) {
      setIsPinVerified(true);
      setShowPinDialog(false);
      setActiveTab('templates');
      setPinInput('');
      toast.success('🔓 Access granted to Email Templates');
    } else {
      toast.error('❌ Incorrect PIN code');
      setPinInput('');
    }
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === 'pending').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-[#0A2647] mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage registrations, participants, email campaigns, promo codes, and templates</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="text-right flex-1 sm:flex-initial">
              <p className="text-xs sm:text-sm text-gray-600">Logged in as</p>
              <p className="text-[#0A2647] text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{currentUser.username}</p>
              <Badge className={currentUser.role === 'super_admin' ? 'bg-[#D4AF37] text-[#0A2647] text-xs mt-1' : 'bg-blue-100 text-blue-800 text-xs mt-1'}>
                {currentUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </Badge>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
            >
              <Power className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="w-full mb-8 overflow-x-auto pb-1">
            <TabsList className={`grid w-full min-w-max bg-white border border-gray-200 rounded-lg p-1`} style={{ gridTemplateColumns: `repeat(${
              (currentUser.role === 'super_admin' ? 1 : 0) +
              1 + // Forms tab (always visible)
              (hasPermission('submissions') ? 1 : 0) +
              (hasPermission('participants') ? 1 : 0) +
              (hasPermission('campaigns') ? 1 : 0) +
              (hasPermission('promocodes') ? 1 : 0) +
              (hasPermission('templates') ? 1 : 0)
            }, minmax(0, 1fr))` }}>
              {currentUser.role === 'super_admin' && (
                <TabsTrigger 
                  value="superadmin" 
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm data-[state=active]:bg-[#0A2647] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
                >
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Super Admin</span>
                  <span className="sm:hidden">Admin</span>
                </TabsTrigger>
              )}
              <TabsTrigger 
                value="forms" 
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm data-[state=active]:bg-[#0A2647] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
              >
                <ClipboardList className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">Registration Forms</span>
                <span className="md:hidden">Forms</span>
              </TabsTrigger>
              {hasPermission('submissions') && (
                <TabsTrigger 
                  value="submissions" 
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm data-[state=active]:bg-[#0A2647] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
                >
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden lg:inline">Submissions & Verification</span>
                  <span className="hidden md:inline lg:hidden">Submissions</span>
                  <span className="md:hidden">Submit</span>
                </TabsTrigger>
              )}
              {hasPermission('participants') && (
                <TabsTrigger 
                  value="participants" 
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm data-[state=active]:bg-[#0A2647] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
                >
                  <UserCheck className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Participants</span>
                  <span className="sm:hidden">Users</span>
                  <Badge className="ml-1.5 bg-green-100 text-green-800 border-0 text-xs px-1.5 py-0.5">
                    {submissions.filter(s => s.status === 'approved').length}
                  </Badge>
                </TabsTrigger>
              )}
              {hasPermission('campaigns') && (
                <TabsTrigger 
                  value="campaigns" 
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm data-[state=active]:bg-[#0A2647] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden md:inline">Email Campaigns</span>
                  <span className="md:hidden">Email</span>
                </TabsTrigger>
              )}
              {hasPermission('promocodes') && (
                <TabsTrigger 
                  value="promocodes" 
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm data-[state=active]:bg-[#0A2647] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
                >
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden md:inline">Promo Codes</span>
                  <span className="md:hidden">Codes</span>
                </TabsTrigger>
              )}
              {hasPermission('templates') && (
                <TabsTrigger 
                  value="templates" 
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm data-[state=active]:bg-[#0A2647] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
                >
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden md:inline">Email Templates</span>
                  <span className="md:hidden">Templates</span>
                  {hasEmailTemplates && (
                    <Badge className="ml-1.5 bg-[#D4AF37] text-[#0A2647] border-0 text-xs px-1.5 py-0.5">
                      ✓
                    </Badge>
                  )}
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {currentUser.role === 'super_admin' && (
            <TabsContent value="superadmin" className="space-y-6">
              <SuperAdminPanel />
            </TabsContent>
          )}

          <TabsContent value="forms" className="space-y-6">
            <FormsPanel />
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <SubmissionsPanel
              submissions={submissions}
              filteredSubmissions={filteredSubmissions}
              stats={stats}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              updateStatus={updateStatus}
            />
          </TabsContent>

          <TabsContent value="participants" className="space-y-6">
            <ParticipantsPanel
              submissions={submissions}
              setSubmissions={setSubmissions}
            />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <EmailCampaignsPanel submissions={submissions} />
          </TabsContent>

          <TabsContent value="promocodes" className="space-y-6">
            {isPinVerified ? (
              <PromoCodesPanel />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Promo Codes - Access Restricted</p>
                  <p className="text-sm text-gray-500 mb-4">
                    This section is PIN protected. Click the lock icon in the header to unlock.
                  </p>
                  <Button
                    onClick={() => setShowPinDialog(true)}
                    className="bg-[#0A2647] hover:bg-[#D4AF37] hover:text-[#0A2647]"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Enter PIN
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates">
            {isPinVerified ? (
              <EmailTemplateEditor />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Email Templates - Access Restricted</p>
                  <p className="text-sm text-gray-500 mb-4">
                    This section is PIN protected. Click the lock icon in the header to unlock.
                  </p>
                  <Button
                    onClick={() => setShowPinDialog(true)}
                    className="bg-[#0A2647] hover:bg-[#D4AF37] hover:text-[#0A2647]"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Enter PIN
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0A2647] flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Enter PIN Code
            </DialogTitle>
            <DialogDescription>
              Email templates are protected. Please enter the PIN code to access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="password"
              placeholder="Enter PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  verifyPin();
                }
              }}
              className="text-center text-2xl tracking-widest"
              maxLength={6}
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                onClick={verifyPin}
                className="flex-1 bg-[#0A2647] hover:bg-[#0A2647]/90"
              >
                Verify
              </Button>
              <Button
                onClick={() => {
                  setShowPinDialog(false);
                  setPinInput('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Default PIN: 1234 (Change this in production)
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Forms Panel Component
function FormsPanel() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Registration Form Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#0A2647]" />
            Media Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Access the media registration form for journalists and media professionals
          </p>
          <Link to="/media">
            <Button className="w-full bg-[#0A2647] hover:bg-[#D4AF37] hover:text-[#0A2647]">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Form
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#0A2647]" />
            Trade Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Access the trade registration form for business professionals
          </p>
          <Link to="/trade">
            <Button className="w-full bg-[#0A2647] hover:bg-[#D4AF37] hover:text-[#0A2647]">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Form
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-[#0A2647]" />
            Captain/Crew/Diver
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Access the registration form for maritime professionals
          </p>
          <Link to="/captain-crew-diver">
            <Button className="w-full bg-[#0A2647] hover:bg-[#D4AF37] hover:text-[#0A2647]">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Form
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#D4AF37]" />
            VIP Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Access the exclusive VIP registration form
          </p>
          <Link to="/vip">
            <Button className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0A2647]">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Form
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

// Submissions Panel Component  
interface SubmissionsPanelProps {
  submissions: Submission[];
  filteredSubmissions: Submission[];
  stats: { total: number; pending: number; approved: number; rejected: number };
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  updateStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
}

function SubmissionsPanel({
  submissions,
  filteredSubmissions,
  stats,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  updateStatus,
}: SubmissionsPanelProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  const openPreview = (fileName: string, title: string) => {
    setPreviewImage(fileName);
    setPreviewTitle(title);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Media':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Trade':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Captain/Crew/Diver':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'VIP':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-3xl text-[#0A2647] mt-1">{stats.total}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-3xl text-orange-600 mt-1">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-3xl text-green-600 mt-1">{stats.approved}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-3xl text-red-600 mt-1">{stats.rejected}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Trade">Trade</SelectItem>
                <SelectItem value="Captain/Crew/Diver">Captain/Crew/Diver</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No submissions found</p>
              <p className="text-sm text-gray-400 mt-2">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Submissions will appear here once users register'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        {submission.firstName} {submission.lastName}
                      </TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{submission.category === 'VIP' ? 'VIP Guest' : submission.company}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryBadgeColor(submission.category)}>
                          {submission.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            submission.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : submission.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-orange-100 text-orange-800'
                          }
                        >
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          {submission.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateStatus(submission.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => updateStatus(submission.id, 'rejected')}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Detail Dialog */}
      {selectedSubmission && (
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#0A2647]">
                Submission Details - {selectedSubmission.firstName} {selectedSubmission.lastName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">First Name</p>
                  <p className="text-[#0A2647]">{selectedSubmission.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Name</p>
                  <p className="text-[#0A2647]">{selectedSubmission.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-[#0A2647]">{selectedSubmission.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-[#0A2647]">{selectedSubmission.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="text-[#0A2647]">
                    {selectedSubmission.category === 'VIP' ? 'VIP Guest' : selectedSubmission.company}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <Badge className={getCategoryBadgeColor(selectedSubmission.category)}>
                    {selectedSubmission.category}
                  </Badge>
                </div>
                {selectedSubmission.category !== 'VIP' && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Job Title</p>
                      <p className="text-[#0A2647]">{selectedSubmission.jobTitle || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">LinkedIn</p>
                      {selectedSubmission.linkedin ? (
                        <a
                          href={selectedSubmission.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          View Profile <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <p className="text-gray-400">N/A</p>
                      )}
                    </div>
                  </>
                )}
                {selectedSubmission.category === 'VIP' && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Accompanying Guest</p>
                    <p className="text-[#0A2647]">
                      {selectedSubmission.hasAccompanyingGuest ? 'Yes' : 'No'}
                    </p>
                  </div>
                )}
              </div>

              {selectedSubmission.businessCard && selectedSubmission.businessCard !== 'Manual Entry' && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Business Card / ID</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openPreview(selectedSubmission.businessCard, 'Business Card')}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    View Document
                  </Button>
                </div>
              )}

              {selectedSubmission.verificationDoc && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Verification Document</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      openPreview(selectedSubmission.verificationDoc!, 'Verification Document')
                    }
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Document
                  </Button>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {selectedSubmission.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        updateStatus(selectedSubmission.id, 'approved');
                        setSelectedSubmission(null);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => {
                        updateStatus(selectedSubmission.id, 'rejected');
                        setSelectedSubmission(null);
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Image Preview Dialog */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewTitle}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img src={previewImage} alt={previewTitle} className="max-w-full h-auto rounded-lg" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// Participants Panel Component
function ParticipantsPanel({ 
  submissions, 
  setSubmissions 
}: { 
  submissions: Submission[];
  setSubmissions: (submissions: Submission[]) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddExhibitor, setShowAddExhibitor] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [newExhibitor, setNewExhibitor] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    jobTitle: '',
    phone: '',
    country: '',
  });

  const approvedSubmissions = submissions.filter(s => s.status === 'approved');

  const categories = [
    { value: 'all', label: 'All Participants', emoji: '👥' },
    { value: 'Media', label: 'Media', emoji: '📰' },
    { value: 'Trade', label: 'Trade', emoji: '💼' },
    { value: 'Captain/Crew/Diver', label: 'Captain/Crew/Diver', emoji: '⚓' },
    { value: 'VIP', label: 'VIP', emoji: '⭐' },
    { value: 'Exhibitor', label: 'Exhibitors', emoji: '🏢' },
  ];

  const filteredParticipants = approvedSubmissions.filter(sub => {
    const matchesCategory = selectedCategory === 'all' || sub.category === selectedCategory;
    const matchesSearch = 
      sub.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryStats = (category: string) => {
    if (category === 'all') return approvedSubmissions.length;
    return approvedSubmissions.filter(s => s.category === category).length;
  };

  const addExhibitor = async () => {
    if (!newExhibitor.firstName || !newExhibitor.lastName || !newExhibitor.email || !newExhibitor.company) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const exhibitorData = {
        ...newExhibitor,
        linkedin: '',
        businessCard: 'Manual Entry',
        category: 'Exhibitor',
        status: 'approved',
      };

      await createSubmission(exhibitorData);

      toast.success(`✅ Exhibitor ${newExhibitor.firstName} ${newExhibitor.lastName} added successfully`);
      
      setNewExhibitor({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        jobTitle: '',
        phone: '',
        country: '',
      });
      setShowAddExhibitor(false);
      
      // Reload submissions
      const data = await loadSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Error adding exhibitor:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add exhibitor');
    }
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Country', 'Category', 'LinkedIn', 'Accompanying Guest', 'Submitted Date'];
    const csvRows = [headers.join(',')];

    filteredParticipants.forEach(participant => {
      const row = [
        participant.firstName,
        participant.lastName,
        participant.email,
        participant.phone || '',
        participant.category === 'VIP' ? 'VIP Guest' : participant.company,
        participant.country || '',
        participant.category,
        participant.category === 'VIP' ? '' : (participant.linkedin || ''),
        participant.category === 'VIP' ? (participant.hasAccompanyingGuest ? 'Yes' : 'No') : 'N/A',
        new Date(participant.submittedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      ].map(field => `"${field}"`); // Wrap in quotes to handle commas
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `QBS_Participants_${selectedCategory}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`✅ Exported ${filteredParticipants.length} participants to CSV`);
  };

  const openPreview = (fileName: string, title: string) => {
    setPreviewImage(fileName);
    setPreviewTitle(title);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Media':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Trade':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Captain/Crew/Diver':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'VIP':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Exhibitor':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'Media':
        return '📰';
      case 'Trade':
        return '💼';
      case 'Captain/Crew/Diver':
        return '⚓';
      case 'VIP':
        return '⭐';
      case 'Exhibitor':
        return '🏢';
      default:
        return '👤';
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    const participant = submissions.find(s => s.id === id);
    if (!participant) return;

    if (window.confirm(`Are you sure you want to delete ${participant.firstName} ${participant.lastName}?`)) {
      try {
        await deleteSubmission(id);
        toast.success('🗑️ Participant deleted successfully');
        
        // Reload submissions
        const data = await loadSubmissions();
        setSubmissions(data);
      } catch (error) {
        console.error('Error deleting participant:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to delete participant');
      }
    }
  };

  const handlePrintBadge = (participant: Submission) => {
    // Create a printable badge in a new window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const badgeHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Badge - ${participant.firstName} ${participant.lastName}</title>
          <style>
            @page {
              size: 4in 6in;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
            }
            .badge {
              width: 3.5in;
              height: 5.5in;
              border: 3px solid #0A2647;
              border-radius: 16px;
              padding: 20px;
              background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              display: flex;
              flex-direction: column;
              position: relative;
            }
            .badge-header {
              text-align: center;
              border-bottom: 3px solid #D4AF37;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .event-name {
              color: #0A2647;
              font-size: 20px;
              font-weight: bold;
              margin: 0 0 5px 0;
            }
            .event-year {
              color: #D4AF37;
              font-size: 28px;
              font-weight: bold;
              margin: 0;
            }
            .participant-info {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              text-align: center;
              padding: 20px 0;
            }
            .name {
              color: #0A2647;
              font-size: 24px;
              font-weight: bold;
              margin: 10px 0;
            }
            .company {
              color: #666;
              font-size: 16px;
              margin: 10px 0;
            }
            .category {
              display: inline-block;
              background: #D4AF37;
              color: #0A2647;
              padding: 8px 20px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
              margin: 15px 0;
            }
            .emoji {
              font-size: 48px;
              margin: 10px 0;
            }
            .badge-footer {
              text-align: center;
              padding-top: 15px;
              border-top: 2px solid #D4AF37;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="badge">
            <div class="badge-header">
              <p class="event-name">QATAR BOAT SHOW</p>
              <p class="event-year">2025</p>
            </div>
            <div class="participant-info">
              <div class="emoji">${getCategoryEmoji(participant.category)}</div>
              <p class="name">${participant.firstName} ${participant.lastName}</p>
              <p class="company">${participant.category === 'VIP' ? 'VIP Guest' : participant.company}</p>
              <span class="category">${participant.category.toUpperCase()}</span>
            </div>
            <div class="badge-footer">
              <p>Please wear this badge at all times</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(badgeHTML);
    printWindow.document.close();
  };

  return (
    <>
      {/* Category Filter Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => (
          <Card
            key={cat.value}
            className={`cursor-pointer transition-all ${
              selectedCategory === cat.value
                ? 'ring-2 ring-[#0A2647] shadow-md'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedCategory(cat.value)}
          >
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <p className="text-sm text-gray-600">{cat.label}</p>
              <p className="text-2xl text-[#0A2647] mt-1">{getCategoryStats(cat.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={exportToExcel}
                variant="outline"
                className="flex-1 sm:flex-initial"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={() => setShowAddExhibitor(true)}
                className="flex-1 sm:flex-initial bg-[#0A2647] hover:bg-[#D4AF37] hover:text-[#0A2647]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Exhibitor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No participants found</p>
              <p className="text-sm text-gray-400 mt-2">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Approved participants will appear here'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        {participant.firstName} {participant.lastName}
                      </TableCell>
                      <TableCell>{participant.email}</TableCell>
                      <TableCell>{participant.phone || 'N/A'}</TableCell>
                      <TableCell>
                        {participant.category === 'VIP' ? 'VIP Guest' : participant.company}
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryBadgeColor(participant.category)}>
                          {getCategoryEmoji(participant.category)} {participant.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePrintBadge(participant)}
                          >
                            <Printer className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteParticipant(participant.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Exhibitor Dialog */}
      <Dialog open={showAddExhibitor} onOpenChange={setShowAddExhibitor}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#0A2647] flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Exhibitor
            </DialogTitle>
            <DialogDescription>
              Add a new exhibitor to the participants list
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newExhibitor.firstName}
                  onChange={(e) => setNewExhibitor({ ...newExhibitor, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newExhibitor.lastName}
                  onChange={(e) => setNewExhibitor({ ...newExhibitor, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newExhibitor.email}
                onChange={(e) => setNewExhibitor({ ...newExhibitor, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={newExhibitor.company}
                onChange={(e) => setNewExhibitor({ ...newExhibitor, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={newExhibitor.jobTitle}
                onChange={(e) => setNewExhibitor({ ...newExhibitor, jobTitle: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newExhibitor.phone}
                  onChange={(e) => setNewExhibitor({ ...newExhibitor, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={newExhibitor.country}
                  onChange={(e) => setNewExhibitor({ ...newExhibitor, country: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddExhibitor(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={addExhibitor}
              className="flex-1 bg-[#0A2647] hover:bg-[#D4AF37] hover:text-[#0A2647]"
            >
              Add Exhibitor
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewTitle}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img src={previewImage} alt={previewTitle} className="max-w-full h-auto rounded-lg" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// Promo Codes Panel Component
function PromoCodesPanel() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [newPromoCode, setNewPromoCode] = useState({
    code: '',
    description: '',
    expirationDate: '',
    capacity: 1,
  });

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    setIsLoading(true);
    try {
      const response = await getPromoCodes();
      setPromoCodes(response.promoCodes || []);
    } catch (error) {
      console.error('Error loading promo codes:', error);
      toast.error('Failed to load promo codes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPromoCode = async () => {
    if (!newPromoCode.code || !newPromoCode.description || !newPromoCode.expirationDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const codeData = {
        code: newPromoCode.code.toUpperCase(),
        description: newPromoCode.description,
        expiresAt: `${newPromoCode.expirationDate}T23:59:59Z`,
        maxUses: newPromoCode.capacity,
        active: true,
      };

      await createPromoCode(codeData);
      toast.success(`✅ Promo code ${newPromoCode.code} created successfully`);
      
      setNewPromoCode({
        code: '',
        description: '',
        expirationDate: '',
        capacity: 1,
      });
      setShowAddDialog(false);
      await loadPromoCodes();
    } catch (error) {
      console.error('Error creating promo code:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create promo code');
    }
  };

  const handleUpdatePromoCode = async () => {
    if (!editingCode) return;

    try {
      const updates = {
        code: editingCode.code,
        description: editingCode.description,
        expiresAt: editingCode.expiresAt,
        maxUses: editingCode.maxUses || editingCode.capacity,
        usedCount: editingCode.usedCount || editingCode.used,
        active: editingCode.active,
      };

      await updatePromoCode(editingCode.id, updates);
      toast.success(`✅ Promo code ${editingCode.code} updated successfully`);
      
      setEditingCode(null);
      await loadPromoCodes();
    } catch (error) {
      console.error('Error updating promo code:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update promo code');
    }
  };

  const handleDeletePromoCode = async (code: PromoCode) => {
    if (window.confirm(`Are you sure you want to delete promo code "${code.code}"?`)) {
      try {
        await deletePromoCode(code.id);
        toast.success(`🗑️ Promo code ${code.code} deleted`);
        await loadPromoCodes();
      } catch (error) {
        console.error('Error deleting promo code:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to delete promo code');
      }
    }
  };

  const handleToggleActive = async (code: PromoCode) => {
    try {
      const updates = {
        active: !code.active,
      };

      await updatePromoCode(code.id, updates);
      toast.success(`✅ Promo code ${code.code} ${!code.active ? 'activated' : 'deactivated'}`);
      await loadPromoCodes();
    } catch (error) {
      console.error('Error toggling promo code status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update promo code');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const codes = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const [code, description, expirationDate, capacity] = line.split(',');
          if (code && description && expirationDate && capacity) {
            codes.push({
              code: code.trim().toUpperCase(),
              description: description.trim(),
              expiresAt: `${expirationDate.trim()}T23:59:59Z`,
              maxUses: parseInt(capacity.trim()) || 1,
              active: true,
            });
          }
        }

        if (codes.length === 0) {
          toast.error('No valid promo codes found in file');
          return;
        }

        for (const codeData of codes) {
          await createPromoCode(codeData);
        }

        toast.success(`✅ Imported ${codes.length} promo codes successfully`);
        await loadPromoCodes();
      } catch (error) {
        console.error('Error importing promo codes:', error);
        toast.error('Failed to import promo codes');
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownloadExample = () => {
    const csvContent = 'code,description,expirationDate,capacity\nVIP2025,VIP Access Code,2025-12-31,50\nEARLY2025,Early Bird Discount,2025-06-30,100';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'promo_codes_example.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredCodes = promoCodes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCodes.length / itemsPerPage);
  const paginatedCodes = filteredCodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-[#0A2647] hover:bg-[#D4AF37] hover:text-[#0A2647]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Promo Code
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('import-file')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import File
              </Button>
              <Button variant="outline" onClick={handleDownloadExample}>
                <Download className="w-4 h-4 mr-2" />
                Download Example
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search promo codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="py-12 text-center">
              <Clock className="w-12 h-12 text-[#0A2647] animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading promo codes...</p>
            </div>
          ) : paginatedCodes.length === 0 ? (
            <div className="py-12 text-center">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No promo codes found</p>
              <p className="text-sm text-gray-400 mt-2">
                {searchTerm ? 'Try adjusting your search' : 'Add your first promo code to get started'}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Promo Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Expiration Date</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono">{code.code}</TableCell>
                        <TableCell>{code.description}</TableCell>
                        <TableCell>{new Date(code.expiresAt || code.expirationDate || '').toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={(code.usedCount || code.used || 0) >= (code.maxUses || code.capacity || 0) ? 'text-red-600' : 'text-green-600'}>
                            {code.usedCount || code.used || 0}/{code.maxUses || code.capacity || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={code.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {code.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingCode(code)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleActive(code)}
                              className={code.active ? 'text-yellow-600' : 'text-green-600'}
                            >
                              <Power className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeletePromoCode(code)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Items per page:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                    setItemsPerPage(parseInt(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Promo Code Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#0A2647] flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Promo Code
            </DialogTitle>
            <DialogDescription>
              Create a new VIP promo code
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Promo Code *</Label>
              <Input
                id="code"
                placeholder="e.g., VIP2025"
                value={newPromoCode.code}
                onChange={(e) => setNewPromoCode({ ...newPromoCode, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="e.g., VIP Access Code"
                value={newPromoCode.description}
                onChange={(e) => setNewPromoCode({ ...newPromoCode, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiration">Expiration Date *</Label>
              <Input
                id="expiration"
                type="date"
                value={newPromoCode.expirationDate}
                onChange={(e) => setNewPromoCode({ ...newPromoCode, expirationDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={newPromoCode.capacity}
                onChange={(e) => setNewPromoCode({ ...newPromoCode, capacity: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#D4AF37] hover:bg-[#C9A54A] text-[#0A2647]"
              onClick={handleAddPromoCode}
            >
              Create Promo Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Promo Code Dialog */}
      <Dialog open={!!editingCode} onOpenChange={() => setEditingCode(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#0A2647] flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Promo Code
            </DialogTitle>
            <DialogDescription>
              Update promo code details
            </DialogDescription>
          </DialogHeader>
          {editingCode && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Promo Code</Label>
                <Input
                  id="edit-code"
                  value={editingCode.code}
                  onChange={(e) => setEditingCode({ ...editingCode, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingCode.description}
                  onChange={(e) => setEditingCode({ ...editingCode, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expiration">Expiration Date</Label>
                <Input
                  id="edit-expiration"
                  type="date"
                  value={(editingCode.expiresAt || editingCode.expirationDate || '').split('T')[0]}
                  onChange={(e) => setEditingCode({ ...editingCode, expiresAt: `${e.target.value}T23:59:59Z`, expirationDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Capacity</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  min="1"
                  value={editingCode.maxUses || editingCode.capacity || 0}
                  onChange={(e) => setEditingCode({ ...editingCode, maxUses: parseInt(e.target.value) || 1, capacity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-used">Used Count</Label>
                <Input
                  id="edit-used"
                  type="number"
                  min="0"
                  max={editingCode.maxUses || editingCode.capacity || 0}
                  value={editingCode.usedCount || editingCode.used || 0}
                  onChange={(e) => setEditingCode({ ...editingCode, usedCount: parseInt(e.target.value) || 0, used: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEditingCode(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#D4AF37] hover:bg-[#C9A54A] text-[#0A2647]"
              onClick={handleUpdatePromoCode}
            >
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
