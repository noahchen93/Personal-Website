import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { cors } from "npm:hono@3.12.11/cors";
import { Hono } from "npm:hono@3.12.11";
import { logger } from "npm:hono@3.12.11/logger";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS configuration
app.use('*', cors({
  origin: ['*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

// Initialize Supabase clients
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
);

// Initialize storage buckets
async function initStorage() {
  const bucketName = 'make-c529659a-portfolio-assets';
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  
  if (!bucketExists) {
    await supabaseAdmin.storage.createBucket(bucketName, {
      public: false,
      allowedMimeTypes: ['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    });
    console.log(`Created bucket: ${bucketName}`);
  }
}

// Call storage initialization
initStorage().catch(console.error);

// Authentication middleware
async function requireAuth(c: any, next: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !user) {
    console.error('Auth verification error:', error);
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  c.set('user', user);
  await next();
}

// Auth routes
app.post('/make-server-c529659a/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    console.log('Creating user with email:', email);
    
    // First check if user already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error checking existing users:', listError);
      return c.json({ error: 'Failed to check existing users' }, 500);
    }
    
    const userExists = existingUsers.users.some(user => user.email === email);
    
    if (userExists) {
      console.log('User already exists:', email);
      return c.json({ 
        error: 'User already exists',
        code: 'email_exists',
        message: 'A user with this email address has already been registered',
        user_exists: true
      }, 409); // 409 Conflict is more appropriate than 400 for "already exists"
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      
      // Handle specific Supabase Auth errors
      if (error.message.includes('already registered') || error.code === 'email_exists') {
        return c.json({ 
          error: 'User already exists',
          code: 'email_exists',
          message: 'A user with this email address has already been registered',
          user_exists: true
        }, 409);
      }
      
      return c.json({ error: error.message }, 400);
    }

    console.log('User created successfully:', data.user.email);
    return c.json({ user: data.user, message: 'User created successfully' });
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle AuthApiError specifically
    if (error.name === 'AuthApiError' && error.code === 'email_exists') {
      console.log('User already exists (caught AuthApiError):', error);
      return c.json({ 
        error: 'User already exists',
        code: 'email_exists',
        message: 'A user with this email address has already been registered',
        user_exists: true
      }, 409);
    }
    
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

app.post('/make-server-c529659a/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    console.log('Signin attempt for email:', email);
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Signin error:', error);
      return c.json({ error: error.message }, 400);
    }

    if (!data.session) {
      console.error('No session returned from signin');
      return c.json({ error: 'Failed to create session' }, 400);
    }

    console.log('User signed in successfully:', data.user.email);
    return c.json({ 
      session: data.session,
      user: data.user,
      message: 'Signed in successfully' 
    });
  } catch (error) {
    console.error('Signin error:', error);
    return c.json({ error: 'Internal server error during signin' }, 500);
  }
});

app.get('/make-server-c529659a/auth/test', async (c) => {
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('List users error:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ 
      userCount: users.length,
      users: users.map(u => ({ email: u.email, created_at: u.created_at })),
      message: 'User list retrieved successfully' 
    });
  } catch (error) {
    console.error('Test error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Helper function to get content with status
async function getContentWithStatus(key: string, publishedOnly = true) {
  const draftKey = `${key}_draft`;
  const publishedKey = `${key}_published`;
  
  if (publishedOnly) {
    const published = await kv.get(publishedKey);
    return published || null;
  } else {
    const draft = await kv.get(draftKey);
    const published = await kv.get(publishedKey);
    return {
      draft: draft || null,
      published: published || null,
      hasDraft: !!draft,
      hasPublished: !!published
    };
  }
}

// Helper function to save content with status
async function saveContentWithStatus(key: string, data: any, status: 'draft' | 'published') {
  const targetKey = status === 'draft' ? `${key}_draft` : `${key}_published`;
  await kv.set(targetKey, {
    ...data,
    status,
    updatedAt: new Date().toISOString()
  });
  
  // If publishing, also update the draft to match
  if (status === 'published') {
    await kv.set(`${key}_draft`, {
      ...data,
      status: 'published',
      updatedAt: new Date().toISOString()
    });
  }
}

// Profile management routes
app.get('/make-server-c529659a/profile/:lang', async (c) => {
  try {
    const lang = c.req.param('lang');
    const includeDrafts = c.req.query('drafts') === 'true';
    const profileData = await getContentWithStatus(`profile_${lang}`, !includeDrafts);
    
    if (!profileData) {
      return c.json({
        bio: '',
        education: [],
        experience: [],
        contact: {},
        status: 'draft'
      });
    }

    return c.json(profileData);
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

app.post('/make-server-c529659a/profile/:lang', requireAuth, async (c) => {
  try {
    const lang = c.req.param('lang');
    const { status = 'draft', ...profileData } = await c.req.json();
    
    await saveContentWithStatus(`profile_${lang}`, profileData, status);
    
    return c.json({ message: `Profile ${status === 'draft' ? 'saved as draft' : 'published'} successfully` });
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Home section management
app.get('/make-server-c529659a/home/:lang', async (c) => {
  try {
    const lang = c.req.param('lang');
    const includeDrafts = c.req.query('drafts') === 'true';
    const homeData = await getContentWithStatus(`home_${lang}`, !includeDrafts);
    
    if (!homeData) {
      return c.json({
        heroTitle: '',
        heroSubtitle: '',
        heroDescription: '',
        backgroundImage: '',
        stats: {
          experience: '7+',
          projects: '50+',
          countries: '10+',
          languages: '2'
        },
        callToActions: []
      });
    }

    return c.json(homeData);
  } catch (error) {
    console.error('Get home error:', error);
    return c.json({ error: 'Failed to fetch home content' }, 500);
  }
});

app.post('/make-server-c529659a/home/:lang', requireAuth, async (c) => {
  try {
    const lang = c.req.param('lang');
    const { status = 'draft', ...homeData } = await c.req.json();
    
    await saveContentWithStatus(`home_${lang}`, homeData, status);
    
    return c.json({ message: `Home content ${status === 'draft' ? 'saved as draft' : 'published'} successfully` });
  } catch (error) {
    console.error('Update home error:', error);
    return c.json({ error: 'Failed to update home content' }, 500);
  }
});

// Education section management
app.get('/make-server-c529659a/education/:lang', async (c) => {
  try {
    const lang = c.req.param('lang');
    const includeDrafts = c.req.query('drafts') === 'true';
    const educationData = await getContentWithStatus(`education_${lang}`, !includeDrafts);
    
    return c.json(educationData || { education: [], certifications: [] });
  } catch (error) {
    console.error('Get education error:', error);
    return c.json({ error: 'Failed to fetch education' }, 500);
  }
});

app.post('/make-server-c529659a/education/:lang', requireAuth, async (c) => {
  try {
    const lang = c.req.param('lang');
    const { status = 'draft', ...educationData } = await c.req.json();
    
    await saveContentWithStatus(`education_${lang}`, educationData, status);
    
    return c.json({ message: `Education ${status === 'draft' ? 'saved as draft' : 'published'} successfully` });
  } catch (error) {
    console.error('Update education error:', error);
    return c.json({ error: 'Failed to update education' }, 500);
  }
});

// Experience section management
app.get('/make-server-c529659a/experience/:lang', async (c) => {
  try {
    const lang = c.req.param('lang');
    const includeDrafts = c.req.query('drafts') === 'true';
    const experienceData = await getContentWithStatus(`experience_${lang}`, !includeDrafts);
    
    return c.json(experienceData || { experience: [], skills: [] });
  } catch (error) {
    console.error('Get experience error:', error);
    return c.json({ error: 'Failed to fetch experience' }, 500);
  }
});

app.post('/make-server-c529659a/experience/:lang', requireAuth, async (c) => {
  try {
    const lang = c.req.param('lang');
    const { status = 'draft', ...experienceData } = await c.req.json();
    
    await saveContentWithStatus(`experience_${lang}`, experienceData, status);
    
    return c.json({ message: `Experience ${status === 'draft' ? 'saved as draft' : 'published'} successfully` });
  } catch (error) {
    console.error('Update experience error:', error);
    return c.json({ error: 'Failed to update experience' }, 500);
  }
});

// Contact section management
app.get('/make-server-c529659a/contact/:lang', async (c) => {
  try {
    const lang = c.req.param('lang');
    const includeDrafts = c.req.query('drafts') === 'true';
    const contactData = await getContentWithStatus(`contact_${lang}`, !includeDrafts);
    
    return c.json(contactData || { 
      contactInfo: {},
      socialMedia: [],
      collaborationAreas: []
    });
  } catch (error) {
    console.error('Get contact error:', error);
    return c.json({ error: 'Failed to fetch contact' }, 500);
  }
});

app.post('/make-server-c529659a/contact/:lang', requireAuth, async (c) => {
  try {
    const lang = c.req.param('lang');
    const { status = 'draft', ...contactData } = await c.req.json();
    
    await saveContentWithStatus(`contact_${lang}`, contactData, status);
    
    return c.json({ message: `Contact ${status === 'draft' ? 'saved as draft' : 'published'} successfully` });
  } catch (error) {
    console.error('Update contact error:', error);
    return c.json({ error: 'Failed to update contact' }, 500);
  }
});

// Projects management routes (updated with status)
app.get('/make-server-c529659a/projects/:lang', async (c) => {
  try {
    const lang = c.req.param('lang');
    const includeDrafts = c.req.query('drafts') === 'true';
    const projects = await getContentWithStatus(`projects_${lang}`, !includeDrafts);
    
    return c.json(projects || []);
  } catch (error) {
    console.error('Get projects error:', error);
    return c.json({ error: 'Failed to fetch projects' }, 500);
  }
});

app.post('/make-server-c529659a/projects/:lang', requireAuth, async (c) => {
  try {
    const lang = c.req.param('lang');
    const { status = 'draft', ...projectData } = await c.req.json();
    
    const projects = await kv.get(`projects_${lang}_${status}`) || [];
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    projects.push(newProject);
    await kv.set(`projects_${lang}_${status}`, projects);
    
    return c.json({ project: newProject, message: `Project ${status === 'draft' ? 'saved as draft' : 'published'} successfully` });
  } catch (error) {
    console.error('Create project error:', error);
    return c.json({ error: 'Failed to create project' }, 500);
  }
});

app.put('/make-server-c529659a/projects/:lang/:id', requireAuth, async (c) => {
  try {
    const lang = c.req.param('lang');
    const id = c.req.param('id');
    const { status = 'draft', ...updateData } = await c.req.json();
    
    const projects = await kv.get(`projects_${lang}_${status}`) || [];
    const index = projects.findIndex((p: any) => p.id === id);
    
    if (index === -1) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    projects[index] = {
      ...projects[index],
      ...updateData,
      status,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`projects_${lang}_${status}`, projects);
    
    return c.json({ project: projects[index], message: `Project ${status === 'draft' ? 'saved as draft' : 'published'} successfully` });
  } catch (error) {
    console.error('Update project error:', error);
    return c.json({ error: 'Failed to update project' }, 500);
  }
});

app.delete('/make-server-c529659a/projects/:lang/:id', requireAuth, async (c) => {
  try {
    const lang = c.req.param('lang');
    const id = c.req.param('id');
    
    // Delete from both draft and published
    const draftProjects = await kv.get(`projects_${lang}_draft`) || [];
    const publishedProjects = await kv.get(`projects_${lang}_published`) || [];
    
    const filteredDraftProjects = draftProjects.filter((p: any) => p.id !== id);
    const filteredPublishedProjects = publishedProjects.filter((p: any) => p.id !== id);
    
    await kv.set(`projects_${lang}_draft`, filteredDraftProjects);
    await kv.set(`projects_${lang}_published`, filteredPublishedProjects);
    
    return c.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    return c.json({ error: 'Failed to delete project' }, 500);
  }
});

// Interests management routes (updated with status)
app.get('/make-server-c529659a/interests/:lang', async (c) => {
  try {
    const lang = c.req.param('lang');
    const includeDrafts = c.req.query('drafts') === 'true';
    const interests = await getContentWithStatus(`interests_${lang}`, !includeDrafts);
    
    return c.json(interests || []);
  } catch (error) {
    console.error('Get interests error:', error);
    return c.json({ error: 'Failed to fetch interests' }, 500);
  }
});

app.post('/make-server-c529659a/interests/:lang', requireAuth, async (c) => {
  try {
    const lang = c.req.param('lang');
    const { status = 'draft', ...interestData } = await c.req.json();
    
    const interests = await kv.get(`interests_${lang}_${status}`) || [];
    const newInterest = {
      id: Date.now().toString(),
      ...interestData,
      status,
      createdAt: new Date().toISOString()
    };
    
    interests.push(newInterest);
    await kv.set(`interests_${lang}_${status}`, interests);
    
    return c.json({ interest: newInterest, message: `Interest ${status === 'draft' ? 'saved as draft' : 'published'} successfully` });
  } catch (error) {
    console.error('Create interest error:', error);
    return c.json({ error: 'Failed to create interest' }, 500);
  }
});

// File upload route
app.post('/make-server-c529659a/upload', requireAuth, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    
    const { data, error } = await supabaseAdmin.storage
      .from('make-c529659a-portfolio-assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('make-c529659a-portfolio-assets')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365);

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      return c.json({ error: 'Failed to generate file URL' }, 500);
    }

    return c.json({
      fileName,
      url: signedUrlData.signedUrl,
      originalName: file.name,
      size: file.size,
      type: file.type,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

// Media management routes
app.get('/make-server-c529659a/media', requireAuth, async (c) => {
  try {
    const { data: files, error } = await supabaseAdmin.storage
      .from('make-c529659a-portfolio-assets')
      .list();

    if (error) {
      console.error('List files error:', error);
      return c.json({ error: 'Failed to list files' }, 500);
    }

    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const { data: signedUrlData } = await supabaseAdmin.storage
          .from('make-c529659a-portfolio-assets')
          .createSignedUrl(file.name, 60 * 60 * 24);
        
        return {
          name: file.name,
          url: signedUrlData?.signedUrl,
          size: file.metadata?.size,
          lastModified: file.updated_at,
          type: file.metadata?.mimetype
        };
      })
    );

    return c.json(filesWithUrls);
  } catch (error) {
    console.error('Media list error:', error);
    return c.json({ error: 'Failed to list media files' }, 500);
  }
});

app.delete('/make-server-c529659a/media/:filename', requireAuth, async (c) => {
  try {
    const filename = c.req.param('filename');
    
    const { error } = await supabaseAdmin.storage
      .from('make-c529659a-portfolio-assets')
      .remove([filename]);

    if (error) {
      console.error('Delete file error:', error);
      return c.json({ error: 'Failed to delete file' }, 500);
    }

    return c.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete media error:', error);
    return c.json({ error: 'Failed to delete media file' }, 500);
  }
});

// Theme and styling management
app.get('/make-server-c529659a/theme', async (c) => {
  try {
    const includeDrafts = c.req.query('drafts') === 'true';
    const theme = await getContentWithStatus('site_theme', !includeDrafts);
    
    return c.json(theme || {
      colors: {
        primary: '#1A202C',
        secondary: '#2D3748',
        accent: '#ECC94B',
        background: '#ffffff',
        foreground: '#000000'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      spacing: {
        containerMaxWidth: '1200px',
        sectionPadding: '4rem'
      }
    });
  } catch (error) {
    console.error('Get theme error:', error);
    return c.json({ error: 'Failed to fetch theme' }, 500);
  }
});

app.post('/make-server-c529659a/theme', requireAuth, async (c) => {
  try {
    const { status = 'draft', ...themeData } = await c.req.json();
    
    await saveContentWithStatus('site_theme', themeData, status);
    
    return c.json({ message: `Theme ${status === 'draft' ? 'saved as draft' : 'published'} successfully` });
  } catch (error) {
    console.error('Update theme error:', error);
    return c.json({ error: 'Failed to update theme' }, 500);
  }
});

// Site settings routes (updated with status)
app.get('/make-server-c529659a/settings/site', async (c) => {
  try {
    const includeDrafts = c.req.query('drafts') === 'true';
    const settings = await getContentWithStatus('site_settings', !includeDrafts);
    
    return c.json(settings || {
      siteName: '个人作品集',
      siteDescription: '',
      seo: {
        title: '',
        description: '',
        keywords: ''
      },
      analytics: {
        googleAnalyticsId: ''
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

app.post('/make-server-c529659a/settings/site', requireAuth, async (c) => {
  try {
    const { status = 'draft', ...settings } = await c.req.json();
    
    await saveContentWithStatus('site_settings', settings, status);
    
    return c.json({ message: `Settings ${status === 'draft' ? 'saved as draft' : 'published'} successfully` });
  } catch (error) {
    console.error('Update settings error:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// Publish content route
app.post('/make-server-c529659a/publish/:section/:lang?', requireAuth, async (c) => {
  try {
    const section = c.req.param('section');
    const lang = c.req.param('lang');
    
    const draftKey = lang ? `${section}_${lang}_draft` : `${section}_draft`;
    const publishedKey = lang ? `${section}_${lang}_published` : `${section}_published`;
    
    const draftContent = await kv.get(draftKey);
    
    if (!draftContent) {
      return c.json({ error: 'No draft content found to publish' }, 404);
    }
    
    await kv.set(publishedKey, {
      ...draftContent,
      status: 'published',
      publishedAt: new Date().toISOString()
    });
    
    return c.json({ message: `${section} published successfully` });
  } catch (error) {
    console.error('Publish error:', error);
    return c.json({ error: 'Failed to publish content' }, 500);
  }
});

// Health check
app.get('/make-server-c529659a/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() });
});

console.log('Portfolio CMS Server starting...');
Deno.serve(app.fetch);