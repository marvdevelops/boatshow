import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner@2.0.3';
import { 
  Send, 
  FileText, 
  Clock, 
  ListFilter, 
  Plus, 
  Eye, 
  Trash2, 
  UserPlus,
  Loader2
} from 'lucide-react';
import { getEmailTemplates, createEmailTemplate, deleteEmailTemplate, getEmailCampaigns, createEmailCampaign, deleteEmailCampaign } from '../utils/api';

interface Submission {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  preview: string;
  createdAt: string;
}

interface SentEmail {
  id: string;
  campaignName: string;
  sentAt: string;
  from: string;
  to: string[];
  template: string;
  subject: string;
  body: string;
}

interface MailingList {
  id: string;
  name: string;
  description: string;
  contacts: string[];
  createdAt: string;
}

export function EmailCampaignsPanel({ submissions }: { submissions: Submission[] }) {
  const [activeSection, setActiveSection] = useState<'create' | 'templates' | 'sent' | 'lists'>('create');
  
  // Email Templates State
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState<EmailTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    body: '',
  });

  // Sent Emails State
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [sentEmailsPage, setSentEmailsPage] = useState(1);
  const [sentEmailsPerPage, setSentEmailsPerPage] = useState(10);
  const [viewingSentEmail, setViewingSentEmail] = useState<SentEmail | null>(null);

  // Mailing Lists State
  const [mailingLists, setMailingLists] = useState<MailingList[]>([]);
  const [showAddList, setShowAddList] = useState(false);
  const [newList, setNewList] = useState({
    name: '',
    description: '',
    contacts: '',
  });

  // Create Email State
  const [emailCompose, setEmailCompose] = useState({
    campaignName: '',
    from: 'noreply@qatarboatshow.com',
    to: [] as string[],
    selectedList: '',
    selectedTemplate: '',
    subject: '',
    body: '',
  });

  // Load data from API
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

  useEffect(() => {
    loadEmailTemplates();
    loadEmailCampaigns();
  }, []);

  const loadEmailTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      const { emailTemplates: templates } = await getEmailTemplates();
      
      if (templates && templates.length > 0) {
        setEmailTemplates(templates);
      } else {
        // Initialize with default templates
        const defaultTemplates: EmailTemplate[] = [
        {
          id: '1',
          name: 'Welcome Email',
          subject: 'Welcome to Qatar Boat Show 2025',
          body: 'Dear {{firstName}},\n\nThank you for registering for Qatar Boat Show 2025. We are excited to have you join us!\n\nBest regards,\nQatar Boat Show Team',
          preview: 'Welcome message for new registrants',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Approval Notification',
          subject: 'Your Application Has Been Approved',
          body: 'Dear {{firstName}} {{lastName}},\n\nCongratulations! Your application for Qatar Boat Show 2025 has been approved.\n\nYou can now access your badge and event details.\n\nSee you at the show!\n\nBest regards,\nQatar Boat Show Team',
          preview: 'Notification sent when application is approved',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Event Reminder',
          subject: 'Qatar Boat Show 2025 - Only 7 Days Away!',
          body: 'Dear {{firstName}},\n\nThis is a friendly reminder that Qatar Boat Show 2025 is just 7 days away!\n\nDon\'t forget to print your badge and check the event schedule.\n\nWe look forward to seeing you!\n\nBest regards,\nQatar Boat Show Team',
          preview: 'Reminder email sent before the event',
          createdAt: new Date().toISOString(),
        },
      ];
        setEmailTemplates(defaultTemplates);
      }
    } catch (error: any) {
      console.error('Error loading email templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const loadEmailCampaigns = async () => {
    try {
      setIsLoadingCampaigns(true);
      const { emailCampaigns: campaigns } = await getEmailCampaigns();
      
      if (campaigns && campaigns.length > 0) {
        setSentEmails(campaigns);
      }
      
      // Initialize default mailing lists based on submissions
      const defaultLists: MailingList[] = [
        {
          id: '1',
          name: 'All Approved Participants',
          description: 'All approved registrations',
          contacts: submissions.filter(s => s.status === 'approved').map(s => s.email),
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'VIP Guests',
          description: 'VIP category participants',
          contacts: submissions.filter(s => s.status === 'approved' && s.category === 'VIP').map(s => s.email),
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Media Personnel',
          description: 'Media category participants',
          contacts: submissions.filter(s => s.status === 'approved' && s.category === 'Media').map(s => s.email),
          createdAt: new Date().toISOString(),
        },
      ];
      setMailingLists(defaultLists);
    } catch (error: any) {
      console.error('Error loading email campaigns:', error);
      toast.error('Failed to load email campaigns');
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  // Template handlers
  const handleAddTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createEmailTemplate({
        name: newTemplate.name,
        subject: newTemplate.subject,
        body: newTemplate.body,
        preview: newTemplate.body.substring(0, 100) + '...',
      });

      await loadEmailTemplates();
      setNewTemplate({ name: '', subject: '', body: '' });
      setShowAddTemplate(false);
      toast.success('✅ Template created successfully');
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast.error(error.message || 'Failed to create template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteEmailTemplate(id);
      await loadEmailTemplates();
      toast.success('🗑️ Template deleted');
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error(error.message || 'Failed to delete template');
    }
  };

  // Sent emails handlers
  const handleDeleteSentEmail = async (id: string) => {
    try {
      await deleteEmailCampaign(id);
      await loadEmailCampaigns();
      toast.success('🗑️ Email record deleted');
    } catch (error: any) {
      console.error('Error deleting email:', error);
      toast.error(error.message || 'Failed to delete email record');
    }
  };

  // Mailing list handlers
  const handleAddMailingList = () => {
    if (!newList.name || !newList.contacts) {
      toast.error('Please fill in all required fields');
      return;
    }

    const list: MailingList = {
      id: Date.now().toString(),
      name: newList.name,
      description: newList.description,
      contacts: newList.contacts.split('\n').map(c => c.trim()).filter(c => c),
      createdAt: new Date().toISOString(),
    };

    const updated = [...mailingLists, list];
    setMailingLists(updated);
    localStorage.setItem('qbs_mailing_lists', JSON.stringify(updated));

    setNewList({ name: '', description: '', contacts: '' });
    setShowAddList(false);
    toast.success('✅ Mailing list created');
  };

  const handleDeleteMailingList = (id: string) => {
    const updated = mailingLists.filter(l => l.id !== id);
    setMailingLists(updated);
    localStorage.setItem('qbs_mailing_lists', JSON.stringify(updated));
    toast.success('🗑️ Mailing list deleted');
  };

  // Send email handler
  const handleSendEmail = async () => {
    if (!emailCompose.campaignName || !emailCompose.subject || !emailCompose.body || emailCompose.to.length === 0) {
      toast.error('Please fill in all required fields and select recipients');
      return;
    }

    const sentEmail: SentEmail = {
      id: Date.now().toString(),
      campaignName: emailCompose.campaignName,
      sentAt: new Date().toISOString(),
      from: emailCompose.from,
      to: emailCompose.to,
      template: emailCompose.selectedTemplate || 'Custom',
      subject: emailCompose.subject,
      body: emailCompose.body,
    };

    try {
      await createEmailCampaign(sentEmail);
      await loadEmailCampaigns();

      setEmailCompose({
        campaignName: '',
        from: 'noreply@qatarboatshow.com',
        to: [],
        selectedList: '',
        selectedTemplate: '',
        subject: '',
        body: '',
      });

      toast.success(`✅ Email campaign created for ${emailCompose.to.length} recipients`);
      setActiveSection('sent');
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email');
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setEmailCompose({
        ...emailCompose,
        selectedTemplate: template.name,
        subject: template.subject,
        body: template.body,
      });
    }
  };

  const handleLoadMailingList = (listId: string) => {
    const list = mailingLists.find(l => l.id === listId);
    if (list) {
      setEmailCompose({
        ...emailCompose,
        selectedList: list.name,
        to: list.contacts,
      });
    }
  };

  // Pagination for sent emails
  const totalPages = Math.ceil(sentEmails.length / sentEmailsPerPage);
  const startIndex = (sentEmailsPage - 1) * sentEmailsPerPage;
  const paginatedSentEmails = sentEmails.slice(startIndex, startIndex + sentEmailsPerPage);

  return (
    <>
      {/* Section Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setActiveSection('create')}
              className={activeSection === 'create' ? 'bg-[#0A2647] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            >
              <Send className="w-4 h-4 mr-2" />
              Create New Email
            </Button>
            <Button
              onClick={() => setActiveSection('templates')}
              className={activeSection === 'templates' ? 'bg-[#0A2647] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            >
              <FileText className="w-4 h-4 mr-2" />
              Email Templates ({emailTemplates.length})
            </Button>
            <Button
              onClick={() => setActiveSection('sent')}
              className={activeSection === 'sent' ? 'bg-[#0A2647] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            >
              <Clock className="w-4 h-4 mr-2" />
              Sent Emails ({sentEmails.length})
            </Button>
            <Button
              onClick={() => setActiveSection('lists')}
              className={activeSection === 'lists' ? 'bg-[#0A2647] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            >
              <ListFilter className="w-4 h-4 mr-2" />
              Mailing Lists ({mailingLists.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create New Email Section */}
      {activeSection === 'create' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[#0A2647] flex items-center gap-2">
              <Send className="w-5 h-5" />
              Compose Email Campaign
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name *</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Weekly Newsletter"
                  value={emailCompose.campaignName}
                  onChange={(e) => setEmailCompose({ ...emailCompose, campaignName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from">From *</Label>
                <Input
                  id="from"
                  value={emailCompose.from}
                  onChange={(e) => setEmailCompose({ ...emailCompose, from: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mailing-list">Select Mailing List</Label>
                <Select value={emailCompose.selectedList} onValueChange={handleLoadMailingList}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a mailing list" />
                  </SelectTrigger>
                  <SelectContent>
                    {mailingLists.map(list => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name} ({list.contacts.length} contacts)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template">Use Template</Label>
                <Select value={emailCompose.selectedTemplate} onValueChange={handleLoadTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Recipients ({emailCompose.to.length})</Label>
              <div className="p-3 bg-gray-50 rounded-md border max-h-24 overflow-y-auto">
                {emailCompose.to.length > 0 ? (
                  <p className="text-sm text-gray-600">{emailCompose.to.join(', ')}</p>
                ) : (
                  <p className="text-sm text-gray-400">Select a mailing list to add recipients</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={emailCompose.subject}
                onChange={(e) => setEmailCompose({ ...emailCompose, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Email Body *</Label>
              <Textarea
                id="body"
                placeholder="Type your email content here..."
                value={emailCompose.body}
                onChange={(e) => setEmailCompose({ ...emailCompose, body: e.target.value })}
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Available variables: {'{'}firstName{'}'}, {'{'}lastName{'}'}, {'{'}company{'}'}
              </p>
            </div>

            <Button
              onClick={handleSendEmail}
              className="w-full bg-[#0A2647] hover:bg-[#D4AF37] hover:text-[#0A2647]"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Campaign to {emailCompose.to.length} Recipients
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Email Templates Section */}
      {activeSection === 'templates' && (
        <>
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={() => setShowAddTemplate(true)}
                className="bg-[#D4AF37] hover:bg-[#C9A54A] text-[#0A2647]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Template
              </Button>
            </CardContent>
          </Card>

          {emailTemplates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No email templates found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emailTemplates.map(template => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="text-base text-[#0A2647]">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Subject:</p>
                      <p className="text-sm">{template.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Preview:</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{template.preview}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingTemplate(template)}
                        className="flex-1"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="flex-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Sent Emails Section */}
      {activeSection === 'sent' && (
        <Card>
          <CardContent className="pt-6">
            {sentEmails.length === 0 ? (
              <div className="py-12 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No sent emails yet</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign Name</TableHead>
                        <TableHead>Date and Sending Time</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSentEmails.map(email => (
                        <TableRow key={email.id}>
                          <TableCell>{email.campaignName}</TableCell>
                          <TableCell>
                            {new Date(email.sentAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>{email.from}</TableCell>
                          <TableCell>{email.to.length} recipients</TableCell>
                          <TableCell>{email.template}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewingSentEmail(email)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteSentEmail(email.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
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
                    <Select
                      value={sentEmailsPerPage.toString()}
                      onValueChange={(value) => {
                        setSentEmailsPerPage(parseInt(value));
                        setSentEmailsPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(startIndex + sentEmailsPerPage, sentEmails.length)} of {sentEmails.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSentEmailsPage(prev => Math.max(1, prev - 1))}
                      disabled={sentEmailsPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {sentEmailsPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSentEmailsPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={sentEmailsPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mailing Lists Section */}
      {activeSection === 'lists' && (
        <>
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={() => setShowAddList(true)}
                className="bg-[#D4AF37] hover:bg-[#C9A54A] text-[#0A2647]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Mailing List
              </Button>
            </CardContent>
          </Card>

          {mailingLists.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ListFilter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No mailing lists found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mailingLists.map(list => (
                <Card key={list.id}>
                  <CardHeader>
                    <CardTitle className="text-base text-[#0A2647]">{list.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">{list.description}</p>
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{list.contacts.length} contacts</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteMailingList(list.id)}
                      className="w-full text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete List
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Template Dialog */}
      <Dialog open={showAddTemplate} onOpenChange={setShowAddTemplate}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#0A2647]">Create Email Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                placeholder="e.g., Welcome Email"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-subject">Subject *</Label>
              <Input
                id="template-subject"
                placeholder="Email subject"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-body">Body *</Label>
              <Textarea
                id="template-body"
                placeholder="Email content..."
                value={newTemplate.body}
                onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                rows={10}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddTemplate(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-[#0A2647]" onClick={handleAddTemplate}>
              Create Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Template Dialog */}
      <Dialog open={!!viewingTemplate} onOpenChange={() => setViewingTemplate(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#0A2647]">{viewingTemplate?.name}</DialogTitle>
          </DialogHeader>
          {viewingTemplate && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Subject:</p>
                <p className="text-sm border rounded p-3 bg-gray-50">{viewingTemplate.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Body:</p>
                <div className="text-sm border rounded p-3 bg-gray-50 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {viewingTemplate.body}
                </div>
              </div>
            </div>
          )}
          <Button onClick={() => setViewingTemplate(null)}>Close</Button>
        </DialogContent>
      </Dialog>

      {/* View Sent Email Dialog */}
      <Dialog open={!!viewingSentEmail} onOpenChange={() => setViewingSentEmail(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#0A2647]">{viewingSentEmail?.campaignName}</DialogTitle>
          </DialogHeader>
          {viewingSentEmail && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">From:</p>
                  <p className="text-sm">{viewingSentEmail.from}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sent:</p>
                  <p className="text-sm">
                    {new Date(viewingSentEmail.sentAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Recipients ({viewingSentEmail.to.length}):</p>
                <div className="text-xs border rounded p-3 bg-gray-50 max-h-32 overflow-y-auto">
                  {viewingSentEmail.to.join(', ')}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Subject:</p>
                <p className="text-sm border rounded p-3 bg-gray-50">{viewingSentEmail.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Body:</p>
                <div className="text-sm border rounded p-3 bg-gray-50 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {viewingSentEmail.body}
                </div>
              </div>
            </div>
          )}
          <Button onClick={() => setViewingSentEmail(null)}>Close</Button>
        </DialogContent>
      </Dialog>

      {/* Add Mailing List Dialog */}
      <Dialog open={showAddList} onOpenChange={setShowAddList}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#0A2647]">Create Mailing List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="list-name">List Name *</Label>
              <Input
                id="list-name"
                placeholder="e.g., Newsletter Subscribers"
                value={newList.name}
                onChange={(e) => setNewList({ ...newList, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="list-description">Description</Label>
              <Input
                id="list-description"
                placeholder="Brief description"
                value={newList.description}
                onChange={(e) => setNewList({ ...newList, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="list-contacts">Email Addresses *</Label>
              <Textarea
                id="list-contacts"
                placeholder="Enter email addresses, one per line"
                value={newList.contacts}
                onChange={(e) => setNewList({ ...newList, contacts: e.target.value })}
                rows={8}
              />
              <p className="text-xs text-gray-500">Enter one email address per line</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddList(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-[#0A2647]" onClick={handleAddMailingList}>
              Create List
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
