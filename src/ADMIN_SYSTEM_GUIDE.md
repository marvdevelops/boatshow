# Qatar Boat Show 2025 - Admin System Guide

## Overview
The Qatar Boat Show 2025 admin system now includes a comprehensive role-based access control (RBAC) system with Super Admin and regular Admin accounts.

## User Roles

### Super Admin
- **Full access** to all dashboard sections
- Can create, edit, and delete admin accounts
- Can assign specific permissions to each admin
- Cannot be deleted or edited
- Has a dedicated "Super Admin" tab for user management

### Regular Admin
- Access only to sections granted by Super Admin
- Cannot create or manage other admin accounts
- Customizable permissions for each admin user

## Available Permissions

Admins can be granted access to the following sections:

1. **Submissions & Verification** - Review and manage registration applications
2. **Participants** - View approved participants and print badges
3. **Email Campaigns** - Create and send email campaigns
4. **Promo Codes** - Manage VIP promo codes (PIN protected)
5. **Email Templates** - Configure email templates (PIN protected)

## Default Credentials

### Super Admin Account
- **Username:** `superadmin`
- **Password:** `super123`

> **Note:** This account is automatically created on first login and cannot be deleted.

## How to Use

### For Super Admins

1. **Login** at `/admin` route using super admin credentials
2. Navigate to the **Super Admin** tab
3. Click **Add Admin User** to create a new admin
4. Fill in:
   - Username (must be unique)
   - Password
   - Select permissions (check individual sections or "Select All")
5. Click **Create Admin** to save

#### Managing Existing Admins

- **Edit:** Click the "Edit" button to modify username, password, or permissions
- **Delete:** Click the "Delete" button to remove an admin account
- View all admin accounts in a table with:
  - Username with role icon
  - Role badge (Super Admin / Admin)
  - Permission badges
  - Created date
  - Action buttons

### For Regular Admins

1. **Login** at `/admin` route using credentials provided by Super Admin
2. Access only the tabs you have permissions for
3. Tabs you don't have access to will not appear
4. Your username and role are displayed in the header
5. Click **Logout** when done

## Security Features

### PIN Protection
- **Promo Codes** and **Email Templates** sections require additional PIN verification
- Default PIN: `1234`
- Click the lock icon in the header to enter PIN
- Once verified, access is granted for the session

### Session Management
- Login state is maintained during browser session
- Logout clears authentication
- No persistent login (requires login each time)

## Example Use Cases

### Example 1: Full Access Admin
**Scenario:** Admin who manages everything
- **Permissions:** Select All
- **Access:** All 5 sections

### Example 2: Verification Only Admin
**Scenario:** Staff member who only reviews applications
- **Permissions:** Submissions & Verification only
- **Access:** Can approve/reject applications, cannot access other sections

### Example 3: Communications Admin
**Scenario:** Marketing team member
- **Permissions:** Email Campaigns + Email Templates
- **Access:** Can create campaigns and manage templates, cannot see submissions

### Example 4: Events Coordinator
**Scenario:** Manages participants and promo codes
- **Permissions:** Participants + Promo Codes
- **Access:** Can print badges and manage VIP codes

## Technical Details

### Data Storage
- Admin accounts stored in localStorage: `qbs_admin_users`
- Submissions stored in: `qbs_submissions`
- Email templates stored in: `qbs_email_templates_campaigns`
- Promo codes stored in: `qbs_promo_codes`

### Permission System
- Super Admin: `role: 'super_admin'`, `permissions: ['all']`
- Regular Admin: `role: 'admin'`, `permissions: [array of section IDs]`
- Section IDs: `submissions`, `participants`, `campaigns`, `promocodes`, `templates`

### Components
- **AdminLogin.tsx** - Login page
- **AdminDashboard.tsx** - Main dashboard with permission checks
- **SuperAdminPanel.tsx** - User management interface
- **EmailCampaignsPanel.tsx** - Email campaign management
- **EmailTemplateEditor.tsx** - Template editor

## Customization

### Changing Default PIN
Edit `DEFAULT_PIN` in `AdminDashboard.tsx` (line ~107):
```typescript
const DEFAULT_PIN = '1234'; // Change to your preferred PIN
```

### Changing Super Admin Credentials
Edit default credentials in `AdminLogin.tsx` (lines ~34-40):
```typescript
const defaultSuperAdmin: AdminUser = {
  id: '1',
  username: 'superadmin',  // Change username
  password: 'super123',     // Change password
  role: 'super_admin',
  permissions: ['all'],
  createdAt: new Date().toISOString(),
};
```

## Troubleshooting

### Can't Login
- Verify username and password are correct
- Check browser console for errors
- Try clearing localStorage and refreshing

### Missing Tabs
- Regular admins only see tabs they have permissions for
- Contact Super Admin to update permissions

### PIN Not Working
- Default PIN is `1234`
- Check if PIN was changed in code
- Try entering PIN again

## Best Practices

1. **Change default credentials** before production use
2. **Use strong passwords** for admin accounts
3. **Grant minimum permissions** needed for each role
4. **Regularly review** admin accounts and remove unused ones
5. **Document** who has access to what sections
6. **Train admins** on their specific permissions and responsibilities

## Support

For technical issues or questions, refer to the component source code or contact the development team.

---

**Qatar Boat Show 2025** - Admin Dashboard v2.0
