import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Shield, 
  User, 
  Users as UsersIcon,
  UserCheck,
  Mail,
  Sparkles,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { getAdminUsers, signUp, updateAdminUser, deleteAdminUser } from '../utils/api';

interface AdminUser {
  id: string;
  username: string;
  password: string;
  role: 'super_admin' | 'admin';
  permissions: string[];
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'submissions', label: 'Submissions & Verification', icon: UsersIcon },
  { id: 'participants', label: 'Participants', icon: UserCheck },
  { id: 'campaigns', label: 'Email Campaigns', icon: Mail },
  { id: 'promocodes', label: 'Promo Codes', icon: Sparkles },
  { id: 'templates', label: 'Email Templates', icon: FileText },
];

export function SuperAdminPanel() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    permissions: [] as string[],
  });

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    try {
      const response = await getAdminUsers();
      setAdminUsers(response.admins || []);
    } catch (error) {
      console.error('Error loading admin users:', error);
      toast.error('Failed to load admin users');
    }
  };

  const handleAddAdmin = async () => {
    if (!newUser.username || !newUser.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newUser.permissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    // Check if username already exists
    if (adminUsers.some(u => u.username === newUser.username)) {
      toast.error('Username already exists');
      return;
    }

    try {
      await signUp({
        email: `${newUser.username}@qbs-admin.local`,
        password: newUser.password,
        username: newUser.username,
        role: 'admin',
        permissions: newUser.permissions,
      });

      setNewUser({ username: '', password: '', permissions: [] });
      setShowAddDialog(false);
      toast.success('✅ Admin user created successfully');
      
      // Reload admin users
      await loadAdminUsers();
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create admin user');
    }
  };

  const handleUpdateAdmin = async () => {
    if (!editingUser) return;

    if (!editingUser.username || !editingUser.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingUser.permissions.length === 0 && editingUser.role !== 'super_admin') {
      toast.error('Please select at least one permission');
      return;
    }

    try {
      await updateAdminUser(editingUser.id, {
        username: editingUser.username,
        password: editingUser.password,
        permissions: editingUser.permissions,
      });

      setEditingUser(null);
      toast.success('✅ Admin user updated successfully');
      
      // Reload admin users
      await loadAdminUsers();
    } catch (error) {
      console.error('Error updating admin user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update admin user');
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    const user = adminUsers.find(u => u.id === id);
    if (user?.role === 'super_admin') {
      toast.error('Cannot delete super admin');
      return;
    }

    try {
      await deleteAdminUser(id);
      toast.success('🗑️ Admin user deleted');
      
      // Reload admin users
      await loadAdminUsers();
    } catch (error) {
      console.error('Error deleting admin user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete admin user');
    }
  };

  const togglePermission = (permission: string, isNew: boolean = false) => {
    if (isNew) {
      setNewUser(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      }));
    } else if (editingUser) {
      setEditingUser({
        ...editingUser,
        permissions: editingUser.permissions.includes(permission)
          ? editingUser.permissions.filter(p => p !== permission)
          : [...editingUser.permissions, permission]
      });
    }
  };

  const hasPermission = (user: AdminUser, permission: string) => {
    return user.permissions.includes('all') || user.permissions.includes(permission);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#0A2647] flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Super Admin - User Management
            </CardTitle>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-[#D4AF37] hover:bg-[#C9A54A] text-[#0A2647]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Admin User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.role === 'super_admin' ? (
                          <Shield className="w-4 h-4 text-[#D4AF37]" />
                        ) : (
                          <User className="w-4 h-4 text-gray-400" />
                        )}
                        <span>{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={user.role === 'super_admin' ? 'bg-[#D4AF37] text-[#0A2647]' : 'bg-blue-100 text-blue-800'}>
                        {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.includes('all') ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            All Access
                          </Badge>
                        ) : (
                          user.permissions.map(perm => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {AVAILABLE_PERMISSIONS.find(p => p.id === perm)?.label || perm}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(user)}
                          disabled={user.role === 'super_admin'}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAdmin(user.id)}
                          disabled={user.role === 'super_admin'}
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

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Note:</strong> Super Admin has full access to all sections and cannot be deleted or edited.
            </p>
            <p className="text-sm text-blue-700">
              Regular admins can be assigned specific permissions to access different sections of the dashboard.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#0A2647]">Add New Admin User</DialogTitle>
            <DialogDescription>
              Create a new admin account with specific permissions to access different sections of the dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-username">Username *</Label>
              <Input
                id="new-username"
                placeholder="Enter username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Password *</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <Label>Permissions *</Label>
              <div className="space-y-2">
                {AVAILABLE_PERMISSIONS.map(permission => {
                  const Icon = permission.icon;
                  return (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`perm-${permission.id}`}
                        checked={newUser.permissions.includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id, true)}
                      />
                      <label
                        htmlFor={`perm-${permission.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                      >
                        <Icon className="w-4 h-4 text-gray-500" />
                        {permission.label}
                      </label>
                    </div>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (newUser.permissions.length === AVAILABLE_PERMISSIONS.length) {
                    setNewUser({ ...newUser, permissions: [] });
                  } else {
                    setNewUser({ ...newUser, permissions: AVAILABLE_PERMISSIONS.map(p => p.id) });
                  }
                }}
                className="mt-2"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {newUser.permissions.length === AVAILABLE_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-[#0A2647]" onClick={handleAddAdmin}>
              Create Admin
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#0A2647]">Edit Admin User</DialogTitle>
            <DialogDescription>
              Update the admin account details and permissions.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username *</Label>
                <Input
                  id="edit-username"
                  placeholder="Enter username"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Password *</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Enter password"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label>Permissions *</Label>
                <div className="space-y-2">
                  {AVAILABLE_PERMISSIONS.map(permission => {
                    const Icon = permission.icon;
                    return (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-perm-${permission.id}`}
                          checked={editingUser.permissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id, false)}
                        />
                        <label
                          htmlFor={`edit-perm-${permission.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                        >
                          <Icon className="w-4 h-4 text-gray-500" />
                          {permission.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (editingUser.permissions.length === AVAILABLE_PERMISSIONS.length) {
                      setEditingUser({ ...editingUser, permissions: [] });
                    } else {
                      setEditingUser({ ...editingUser, permissions: AVAILABLE_PERMISSIONS.map(p => p.id) });
                    }
                  }}
                  className="mt-2"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {editingUser.permissions.length === AVAILABLE_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-[#0A2647]" onClick={handleUpdateAdmin}>
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
