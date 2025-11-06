import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Storage bucket name
const STORAGE_BUCKET = 'make-ec240367-qbs-documents';

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize storage bucket on startup
async function initializeStorage() {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
    
    if (!bucketExists) {
      console.log(`Creating storage bucket: ${STORAGE_BUCKET}`);
      const { error } = await supabaseAdmin.storage.createBucket(STORAGE_BUCKET, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
      if (error) {
        console.error('Error creating storage bucket:', error);
      } else {
        console.log('Storage bucket created successfully');
      }
    } else {
      console.log('Storage bucket already exists');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Initialize default super admin
async function initializeDefaultAdmin() {
  try {
    const existingAdmins = await kv.getByPrefix('admin:');
    if (existingAdmins.length === 0) {
      console.log('Creating default super admin');
      const defaultAdmin = {
        id: 'admin:superadmin',
        username: 'superadmin',
        password: 'super123', // In production, this should be hashed
        role: 'super_admin',
        permissions: ['all'],
        createdAt: new Date().toISOString(),
      };
      await kv.set('admin:superadmin', defaultAdmin);
      console.log('Default super admin created');
    }
  } catch (error) {
    console.error('Error initializing default admin:', error);
  }
}

// Initialize default promo codes
async function initializeDefaultPromoCodes() {
  try {
    const existingCodes = await kv.getByPrefix('promo-code:');
    if (existingCodes.length === 0) {
      console.log('Creating default promo codes');
      const defaultCodes = [
        {
          id: 'promo-code:VIP2025QBS',
          code: 'VIP2025QBS',
          description: 'VIP Access for Qatar Boat Show 2025',
          expiresAt: '2025-12-31T23:59:59Z',
          maxUses: 100,
          usedCount: 0,
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'promo-code:QBSVIP001',
          code: 'QBSVIP001',
          description: 'Exclusive VIP Pass',
          expiresAt: '2025-12-31T23:59:59Z',
          maxUses: 50,
          usedCount: 0,
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'promo-code:ELITE2025',
          code: 'ELITE2025',
          description: 'Elite Membership Access',
          expiresAt: '2025-12-31T23:59:59Z',
          maxUses: 25,
          usedCount: 0,
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'promo-code:GOLDTICKET',
          code: 'GOLDTICKET',
          description: 'Gold Tier VIP Access',
          expiresAt: '2025-12-31T23:59:59Z',
          maxUses: 75,
          usedCount: 0,
          active: true,
          createdAt: new Date().toISOString(),
        },
      ];
      
      for (const code of defaultCodes) {
        await kv.set(code.id, code);
      }
      console.log('Default promo codes created');
    }
  } catch (error) {
    console.error('Error initializing default promo codes:', error);
  }
}

// Call initialization functions
initializeStorage();
initializeDefaultAdmin();
initializeDefaultPromoCodes();

// Middleware to verify authentication
async function requireAuth(c: any, next: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  c.set('user', user);
  await next();
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get("/make-server-ec240367/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Sign up (create admin user)
app.post("/make-server-ec240367/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, username, role, permissions } = body;

    if (!email || !password || !username) {
      return c.json({ error: 'Email, password, and username are required' }, 400);
    }

    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        username,
        role: role || 'admin',
        permissions: permissions || []
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Sign up error during user creation:', error);
      return c.json({ error: `Sign up failed: ${error.message}` }, 400);
    }

    // Store admin details in KV
    const adminData = {
      id: `admin:${data.user.id}`,
      userId: data.user.id,
      username,
      email,
      role: role || 'admin',
      permissions: permissions || [],
      createdAt: new Date().toISOString(),
    };

    await kv.set(`admin:${data.user.id}`, adminData);

    return c.json({ 
      message: 'Admin user created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        username,
        role: role || 'admin',
      }
    });
  } catch (error: any) {
    console.error('Sign up error:', error);
    return c.json({ error: `Sign up error: ${error.message}` }, 500);
  }
});

// Sign in
app.post("/make-server-ec240367/auth/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;

    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }

    // Get all admins to find the one with matching username
    const admins = await kv.getByPrefix('admin:');
    const admin = admins.find((a: any) => a.username === username);

    if (!admin) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // For the default super admin, check password directly
    if (admin.username === 'superadmin' && admin.password === password) {
      // Return a mock session for the default admin
      return c.json({
        access_token: 'default-super-admin-token',
        user: {
          id: admin.id,
          email: admin.email || 'superadmin@qbs.com',
          username: admin.username,
          role: admin.role,
          permissions: admin.permissions,
        }
      });
    }

    // For other admins, use Supabase auth
    if (admin.email) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: admin.email,
        password,
      });

      if (error) {
        console.error('Sign in error during authentication:', error);
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      return c.json({
        access_token: data.session.access_token,
        user: {
          id: admin.userId || admin.id,
          email: admin.email,
          username: admin.username,
          role: admin.role,
          permissions: admin.permissions,
        }
      });
    }

    return c.json({ error: 'Invalid credentials' }, 401);
  } catch (error: any) {
    console.error('Sign in error:', error);
    return c.json({ error: `Sign in error: ${error.message}` }, 500);
  }
});

// Get current session
app.get("/make-server-ec240367/auth/session", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ session: null });
    }

    // Handle default super admin token
    if (accessToken === 'default-super-admin-token') {
      const admin = await kv.get('admin:superadmin');
      return c.json({
        session: {
          access_token: accessToken,
          user: {
            id: admin.id,
            email: admin.email || 'superadmin@qbs.com',
            username: admin.username,
            role: admin.role,
            permissions: admin.permissions,
          }
        }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ session: null });
    }

    // Get admin data from KV
    const admin = await kv.get(`admin:${user.id}`);

    return c.json({
      session: {
        access_token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          username: admin?.username || user.user_metadata?.username,
          role: admin?.role || user.user_metadata?.role || 'admin',
          permissions: admin?.permissions || user.user_metadata?.permissions || [],
        }
      }
    });
  } catch (error: any) {
    console.error('Session check error:', error);
    return c.json({ session: null });
  }
});

// Sign out
app.post("/make-server-ec240367/auth/signout", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ message: 'Signed out' });
    }

    // Handle default super admin token
    if (accessToken === 'default-super-admin-token') {
      return c.json({ message: 'Signed out' });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    await supabase.auth.signOut();

    return c.json({ message: 'Signed out' });
  } catch (error: any) {
    console.error('Sign out error:', error);
    return c.json({ error: `Sign out error: ${error.message}` }, 500);
  }
});

// ============================================================================
// ADMIN USERS ROUTES
// ============================================================================

// Get all admin users
app.get("/make-server-ec240367/admin-users", async (c) => {
  try {
    const admins = await kv.getByPrefix('admin:');
    // Don't send passwords to frontend
    const sanitizedAdmins = admins.map(({ password, ...admin }: any) => admin);
    return c.json({ admins: sanitizedAdmins });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return c.json({ error: `Error fetching admin users: ${error.message}` }, 500);
  }
});

// Update admin user
app.put("/make-server-ec240367/admin-users/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const existingAdmin = await kv.get(id);
    if (!existingAdmin) {
      return c.json({ error: 'Admin user not found' }, 404);
    }

    const updatedAdmin = {
      ...existingAdmin,
      ...body,
      id, // Ensure id doesn't change
      updatedAt: new Date().toISOString(),
    };

    await kv.set(id, updatedAdmin);

    const { password, ...sanitizedAdmin } = updatedAdmin;
    return c.json({ admin: sanitizedAdmin });
  } catch (error: any) {
    console.error('Error updating admin user:', error);
    return c.json({ error: `Error updating admin user: ${error.message}` }, 500);
  }
});

// Delete admin user
app.delete("/make-server-ec240367/admin-users/:id", async (c) => {
  try {
    const id = c.req.param('id');

    // Don't allow deleting the default super admin
    if (id === 'admin:superadmin') {
      return c.json({ error: 'Cannot delete the default super admin' }, 400);
    }

    const admin = await kv.get(id);
    if (!admin) {
      return c.json({ error: 'Admin user not found' }, 404);
    }

    // Delete from Supabase Auth if they have a userId
    if (admin.userId) {
      await supabaseAdmin.auth.admin.deleteUser(admin.userId);
    }

    await kv.del(id);

    return c.json({ message: 'Admin user deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting admin user:', error);
    return c.json({ error: `Error deleting admin user: ${error.message}` }, 500);
  }
});

// ============================================================================
// FILE UPLOAD ROUTES
// ============================================================================

app.post("/make-server-ec240367/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const submissionId = formData.get('submissionId') as string;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Generate unique file path
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const filePath = `${category}/${submissionId}/${timestamp}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('File upload error:', error);
      return c.json({ error: `File upload failed: ${error.message}` }, 500);
    }

    // Generate signed URL (valid for 1 year)
    const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(data.path, 31536000); // 1 year in seconds

    if (urlError) {
      console.error('Error generating signed URL:', urlError);
      return c.json({ error: `Error generating signed URL: ${urlError.message}` }, 500);
    }

    return c.json({
      path: data.path,
      url: signedUrlData.signedUrl,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return c.json({ error: `Upload error: ${error.message}` }, 500);
  }
});

// Get signed URL for a file
app.get("/make-server-ec240367/files/:path", async (c) => {
  try {
    const path = c.req.param('path');
    
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(path, 3600); // 1 hour

    if (error) {
      console.error('Error generating signed URL:', error);
      return c.json({ error: `Error generating signed URL: ${error.message}` }, 500);
    }

    return c.json({ url: data.signedUrl });
  } catch (error: any) {
    console.error('Error fetching file:', error);
    return c.json({ error: `Error fetching file: ${error.message}` }, 500);
  }
});

// ============================================================================
// SUBMISSIONS ROUTES
// ============================================================================

// Get all submissions
app.get("/make-server-ec240367/submissions", async (c) => {
  try {
    const submissions = await kv.getByPrefix('submission:');
    return c.json({ submissions });
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return c.json({ error: `Error fetching submissions: ${error.message}` }, 500);
  }
});

// Get single submission
app.get("/make-server-ec240367/submissions/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const submission = await kv.get(`submission:${id}`);
    
    if (!submission) {
      return c.json({ error: 'Submission not found' }, 404);
    }

    return c.json({ submission });
  } catch (error: any) {
    console.error('Error fetching submission:', error);
    return c.json({ error: `Error fetching submission: ${error.message}` }, 500);
  }
});

// Create new submission
app.post("/make-server-ec240367/submissions", async (c) => {
  try {
    const body = await c.req.json();
    const id = `submission:${Date.now()}`;
    
    const submission = {
      ...body,
      id,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    await kv.set(id, submission);

    return c.json({ submission, message: 'Submission created successfully' });
  } catch (error: any) {
    console.error('Error creating submission:', error);
    return c.json({ error: `Error creating submission: ${error.message}` }, 500);
  }
});

// Update submission
app.put("/make-server-ec240367/submissions/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const existingSubmission = await kv.get(`submission:${id}`);
    if (!existingSubmission) {
      return c.json({ error: 'Submission not found' }, 404);
    }

    const updatedSubmission = {
      ...existingSubmission,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`submission:${id}`, updatedSubmission);

    return c.json({ submission: updatedSubmission, message: 'Submission updated successfully' });
  } catch (error: any) {
    console.error('Error updating submission:', error);
    return c.json({ error: `Error updating submission: ${error.message}` }, 500);
  }
});

// Approve submission
app.post("/make-server-ec240367/submissions/:id/approve", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { emailMessage } = body;
    
    const submission = await kv.get(`submission:${id}`);
    if (!submission) {
      return c.json({ error: 'Submission not found' }, 404);
    }

    submission.status = 'approved';
    submission.approvedAt = new Date().toISOString();
    submission.approvalMessage = emailMessage;

    await kv.set(`submission:${id}`, submission);

    // Queue email notification (placeholder - would integrate with email service)
    const emailQueueId = `email-queue:${Date.now()}`;
    await kv.set(emailQueueId, {
      to: submission.email,
      subject: 'Qatar Boat Show 2025 - Application Approved',
      message: emailMessage,
      submissionId: id,
      type: 'approval',
      createdAt: new Date().toISOString(),
      status: 'queued',
    });

    console.log(`Approval email queued for ${submission.email}`);

    return c.json({ 
      submission, 
      message: 'Submission approved and email notification queued' 
    });
  } catch (error: any) {
    console.error('Error approving submission:', error);
    return c.json({ error: `Error approving submission: ${error.message}` }, 500);
  }
});

// Reject submission
app.post("/make-server-ec240367/submissions/:id/reject", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { emailMessage } = body;
    
    const submission = await kv.get(`submission:${id}`);
    if (!submission) {
      return c.json({ error: 'Submission not found' }, 404);
    }

    submission.status = 'rejected';
    submission.rejectedAt = new Date().toISOString();
    submission.rejectionMessage = emailMessage;

    await kv.set(`submission:${id}`, submission);

    // Queue email notification
    const emailQueueId = `email-queue:${Date.now()}`;
    await kv.set(emailQueueId, {
      to: submission.email,
      subject: 'Qatar Boat Show 2025 - Application Update',
      message: emailMessage,
      submissionId: id,
      type: 'rejection',
      createdAt: new Date().toISOString(),
      status: 'queued',
    });

    console.log(`Rejection email queued for ${submission.email}`);

    return c.json({ 
      submission, 
      message: 'Submission rejected and email notification queued' 
    });
  } catch (error: any) {
    console.error('Error rejecting submission:', error);
    return c.json({ error: `Error rejecting submission: ${error.message}` }, 500);
  }
});

// Delete submission
app.delete("/make-server-ec240367/submissions/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const submission = await kv.get(`submission:${id}`);
    if (!submission) {
      return c.json({ error: 'Submission not found' }, 404);
    }

    await kv.del(`submission:${id}`);

    return c.json({ message: 'Submission deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting submission:', error);
    return c.json({ error: `Error deleting submission: ${error.message}` }, 500);
  }
});

// ============================================================================
// EMAIL TEMPLATES ROUTES
// ============================================================================

// Get all email templates
app.get("/make-server-ec240367/email-templates", async (c) => {
  try {
    const templates = await kv.getByPrefix('email-template:');
    return c.json({ templates });
  } catch (error: any) {
    console.error('Error fetching email templates:', error);
    return c.json({ error: `Error fetching email templates: ${error.message}` }, 500);
  }
});

// Create email template
app.post("/make-server-ec240367/email-templates", async (c) => {
  try {
    const body = await c.req.json();
    const id = `email-template:${Date.now()}`;
    
    const template = {
      ...body,
      id,
      createdAt: new Date().toISOString(),
    };

    await kv.set(id, template);

    return c.json({ template, message: 'Email template created successfully' });
  } catch (error: any) {
    console.error('Error creating email template:', error);
    return c.json({ error: `Error creating email template: ${error.message}` }, 500);
  }
});

// Update email template
app.put("/make-server-ec240367/email-templates/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const existingTemplate = await kv.get(`email-template:${id}`);
    if (!existingTemplate) {
      return c.json({ error: 'Email template not found' }, 404);
    }

    const updatedTemplate = {
      ...existingTemplate,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`email-template:${id}`, updatedTemplate);

    return c.json({ template: updatedTemplate, message: 'Email template updated successfully' });
  } catch (error: any) {
    console.error('Error updating email template:', error);
    return c.json({ error: `Error updating email template: ${error.message}` }, 500);
  }
});

// Delete email template
app.delete("/make-server-ec240367/email-templates/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const template = await kv.get(`email-template:${id}`);
    if (!template) {
      return c.json({ error: 'Email template not found' }, 404);
    }

    await kv.del(`email-template:${id}`);

    return c.json({ message: 'Email template deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting email template:', error);
    return c.json({ error: `Error deleting email template: ${error.message}` }, 500);
  }
});

// ============================================================================
// EMAIL CAMPAIGNS ROUTES
// ============================================================================

// Get all email campaigns
app.get("/make-server-ec240367/email-campaigns", async (c) => {
  try {
    const campaigns = await kv.getByPrefix('email-campaign:');
    return c.json({ campaigns });
  } catch (error: any) {
    console.error('Error fetching email campaigns:', error);
    return c.json({ error: `Error fetching email campaigns: ${error.message}` }, 500);
  }
});

// Create email campaign
app.post("/make-server-ec240367/email-campaigns", async (c) => {
  try {
    const body = await c.req.json();
    const id = `email-campaign:${Date.now()}`;
    
    const campaign = {
      ...body,
      id,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    await kv.set(id, campaign);

    return c.json({ campaign, message: 'Email campaign created successfully' });
  } catch (error: any) {
    console.error('Error creating email campaign:', error);
    return c.json({ error: `Error creating email campaign: ${error.message}` }, 500);
  }
});

// Update email campaign
app.put("/make-server-ec240367/email-campaigns/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const existingCampaign = await kv.get(`email-campaign:${id}`);
    if (!existingCampaign) {
      return c.json({ error: 'Email campaign not found' }, 404);
    }

    const updatedCampaign = {
      ...existingCampaign,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`email-campaign:${id}`, updatedCampaign);

    return c.json({ campaign: updatedCampaign, message: 'Email campaign updated successfully' });
  } catch (error: any) {
    console.error('Error updating email campaign:', error);
    return c.json({ error: `Error updating email campaign: ${error.message}` }, 500);
  }
});

// Delete email campaign
app.delete("/make-server-ec240367/email-campaigns/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const campaign = await kv.get(`email-campaign:${id}`);
    if (!campaign) {
      return c.json({ error: 'Email campaign not found' }, 404);
    }

    await kv.del(`email-campaign:${id}`);

    return c.json({ message: 'Email campaign deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting email campaign:', error);
    return c.json({ error: `Error deleting email campaign: ${error.message}` }, 500);
  }
});

// ============================================================================
// PROMO CODES ROUTES
// ============================================================================

// Get all promo codes
app.get("/make-server-ec240367/promo-codes", async (c) => {
  try {
    const promoCodes = await kv.getByPrefix('promo-code:');
    return c.json({ promoCodes });
  } catch (error: any) {
    console.error('Error fetching promo codes:', error);
    return c.json({ error: `Error fetching promo codes: ${error.message}` }, 500);
  }
});

// Validate promo code
app.post("/make-server-ec240367/promo-codes/validate", async (c) => {
  try {
    const body = await c.req.json();
    const { code } = body;

    if (!code) {
      return c.json({ valid: false, error: 'Promo code is required' }, 400);
    }

    const promoCode = await kv.get(`promo-code:${code.toUpperCase()}`);
    
    if (!promoCode) {
      return c.json({ valid: false, error: 'Invalid promo code' });
    }

    // Check if expired
    if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
      return c.json({ valid: false, error: 'Promo code has expired' });
    }

    // Check if max uses reached
    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return c.json({ valid: false, error: 'Promo code has reached maximum uses' });
    }

    // Check if active
    if (!promoCode.active) {
      return c.json({ valid: false, error: 'Promo code is not active' });
    }

    return c.json({ valid: true, promoCode });
  } catch (error: any) {
    console.error('Error validating promo code:', error);
    return c.json({ error: `Error validating promo code: ${error.message}` }, 500);
  }
});

// Create promo code
app.post("/make-server-ec240367/promo-codes", async (c) => {
  try {
    const body = await c.req.json();
    const { code, ...rest } = body;

    if (!code) {
      return c.json({ error: 'Promo code is required' }, 400);
    }

    const id = `promo-code:${code.toUpperCase()}`;
    
    // Check if already exists
    const existing = await kv.get(id);
    if (existing) {
      return c.json({ error: 'Promo code already exists' }, 400);
    }

    const promoCode = {
      ...rest,
      id,
      code: code.toUpperCase(),
      usedCount: 0,
      active: true,
      createdAt: new Date().toISOString(),
    };

    await kv.set(id, promoCode);

    return c.json({ promoCode, message: 'Promo code created successfully' });
  } catch (error: any) {
    console.error('Error creating promo code:', error);
    return c.json({ error: `Error creating promo code: ${error.message}` }, 500);
  }
});

// Update promo code
app.put("/make-server-ec240367/promo-codes/:code", async (c) => {
  try {
    const code = c.req.param('code');
    const body = await c.req.json();
    
    const id = `promo-code:${code.toUpperCase()}`;
    const existingPromoCode = await kv.get(id);
    
    if (!existingPromoCode) {
      return c.json({ error: 'Promo code not found' }, 404);
    }

    const updatedPromoCode = {
      ...existingPromoCode,
      ...body,
      code: code.toUpperCase(), // Ensure code doesn't change
      updatedAt: new Date().toISOString(),
    };

    await kv.set(id, updatedPromoCode);

    return c.json({ promoCode: updatedPromoCode, message: 'Promo code updated successfully' });
  } catch (error: any) {
    console.error('Error updating promo code:', error);
    return c.json({ error: `Error updating promo code: ${error.message}` }, 500);
  }
});

// Delete promo code
app.delete("/make-server-ec240367/promo-codes/:code", async (c) => {
  try {
    const code = c.req.param('code');
    const id = `promo-code:${code.toUpperCase()}`;
    
    const promoCode = await kv.get(id);
    if (!promoCode) {
      return c.json({ error: 'Promo code not found' }, 404);
    }

    await kv.del(id);

    return c.json({ message: 'Promo code deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting promo code:', error);
    return c.json({ error: `Error deleting promo code: ${error.message}` }, 500);
  }
});

// ============================================================================
// STATS ROUTES
// ============================================================================

app.get("/make-server-ec240367/stats", async (c) => {
  try {
    const submissions = await kv.getByPrefix('submission:');
    
    const stats = {
      total: submissions.length,
      pending: submissions.filter((s: any) => s.status === 'pending').length,
      approved: submissions.filter((s: any) => s.status === 'approved').length,
      rejected: submissions.filter((s: any) => s.status === 'rejected').length,
      byCategory: {
        Media: submissions.filter((s: any) => s.category === 'Media').length,
        Trade: submissions.filter((s: any) => s.category === 'Trade').length,
        'Captain/Crew/Diver': submissions.filter((s: any) => s.category === 'Captain/Crew/Diver').length,
        VIP: submissions.filter((s: any) => s.category === 'VIP').length,
      },
    };

    return c.json({ stats });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return c.json({ error: `Error fetching stats: ${error.message}` }, 500);
  }
});

console.log('Qatar Boat Show 2025 server starting...');
Deno.serve(app.fetch);
