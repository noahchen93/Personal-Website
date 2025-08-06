import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', logger(console.log));
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://nboogtixsjtfrkozbrpr.supabase.co'],
  credentials: true,
}));

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Route prefix
const routePrefix = '/make-server-c529659a';

// Utility function to generate default data
const generateDefaultData = (section: string, language: string) => {
  const defaultContent = {
    zh: {
      home: {
        name: "您的姓名",
        title: "作品集标题",
        description: "这里是您的个人简介，描述您的专业背景和特长。",
        skills: ["技能1", "技能2", "技能3"],
        highlights: ["亮点1", "亮点2"],
        socialLinks: {
          email: "your@email.com",
          github: "",
          linkedin: "",
          website: ""
        },
        contactInfo: {
          location: "您的城市",
          email: "your@email.com",
          phone: "+86 123 4567 8900"
        }
      },
      about: {
        bio: "这里是详细的个人简介。",
        skills: ["技能1", "技能2", "技能3"],
        achievements: ["成就1", "成就2"],
        philosophy: "个人哲学或理念"
      },
      education: [
        {
          id: 1,
          institution: "示例大学",
          degree: "学位名称",
          field: "专业领域",
          startDate: "2020-09",
          endDate: "2024-06",
          description: "教育经历描述"
        }
      ],
      experience: [
        {
          id: 1,
          company: "示例公司",
          position: "职位名称",
          startDate: "2024-07",
          endDate: "present",
          description: "工作经历描述",
          achievements: ["工作成就1", "工作成就2"]
        }
      ],
      projects: [
        {
          id: 1,
          title: "示例项目",
          description: "项目简短描述",
          longDescription: "项目详细描述",
          category: "设计",
          tags: ["标签1", "标签2"],
          images: [],
          links: [],
          startDate: "2024-01",
          endDate: "2024-03",
          featured: true
        }
      ],
      interests: [
        {
          id: 1,
          category: "设计",
          title: "UI/UX设计",
          description: "对用户界面和用户体验设计的热爱",
          images: [],
          links: []
        }
      ],
      contact: {
        email: "your@email.com",
        phone: "+86 123 4567 8900",
        location: "您的城市",
        social: {
          linkedin: "",
          github: "",
          behance: "",
          dribbble: ""
        },
        message: "欢迎联系我讨论合作机会"
      }
    },
    en: {
      home: {
        name: "Your Name",
        title: "Portfolio Title",
        description: "This is your personal introduction describing your professional background and expertise.",
        skills: ["Skill 1", "Skill 2", "Skill 3"],
        highlights: ["Highlight 1", "Highlight 2"],
        socialLinks: {
          email: "your@email.com",
          github: "",
          linkedin: "",
          website: ""
        },
        contactInfo: {
          location: "Your City",
          email: "your@email.com",
          phone: "+1 123 456 7890"
        }
      },
      about: {
        bio: "This is your detailed personal introduction.",
        skills: ["Skill 1", "Skill 2", "Skill 3"],
        achievements: ["Achievement 1", "Achievement 2"],
        philosophy: "Personal philosophy or beliefs"
      },
      education: [
        {
          id: 1,
          institution: "Example University",
          degree: "Degree Name",
          field: "Field of Study",
          startDate: "2020-09",
          endDate: "2024-06",
          description: "Description of educational experience"
        }
      ],
      experience: [
        {
          id: 1,
          company: "Example Company",
          position: "Position Title",
          startDate: "2024-07",
          endDate: "present",
          description: "Work experience description",
          achievements: ["Work achievement 1", "Work achievement 2"]
        }
      ],
      projects: [
        {
          id: 1,
          title: "Example Project",
          description: "Brief project description",
          longDescription: "Detailed project description",
          category: "Design",
          tags: ["Tag 1", "Tag 2"],
          images: [],
          links: [],
          startDate: "2024-01",
          endDate: "2024-03",
          featured: true
        }
      ],
      interests: [
        {
          id: 1,
          category: "Design",
          title: "UI/UX Design",
          description: "Passion for user interface and user experience design",
          images: [],
          links: []
        }
      ],
      contact: {
        email: "your@email.com",
        phone: "+1 123 456 7890",
        location: "Your City",
        social: {
          linkedin: "",
          github: "",
          behance: "",
          dribbble: ""
        },
        message: "Feel free to contact me to discuss collaboration opportunities"
      }
    }
  };

  return defaultContent[language]?.[section] || null;
};

// Authentication routes
app.post(`${routePrefix}/auth/signup`, async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    console.log(`Creating user with email: ${email}`);

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    });

    if (error) {
      console.error('User creation error:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('User created successfully:', data.user?.id);
    return c.json({ message: 'User created successfully', user: data.user });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

app.post(`${routePrefix}/auth/signin`, async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    console.log(`Sign in attempt for email: ${email}`);

    // Check for demo credentials
    if (email === 'admin@example.com' && password === 'admin123') {
      return c.json({ access_token: 'demo-token', user: { email } });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      return c.json({ error: error.message }, 401);
    }

    console.log('Sign in successful:', data.user?.id);
    return c.json({ 
      access_token: data.session?.access_token, 
      user: data.user 
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return c.json({ error: 'Internal server error during sign in' }, 500);
  }
});

// Create GET endpoints for all sections
const sections = ['home', 'about', 'education', 'experience', 'projects', 'interests', 'contact'];

sections.forEach(section => {
  app.get(`${routePrefix}/${section}/:language`, async (c) => {
    try {
      const language = c.req.param('language');
      const key = `${section}_${language}`;
      
      let data = await kv.get(key);
      if (!data) {
        data = generateDefaultData(section, language);
        if (data) {
          await kv.set(key, data);
        }
      }
      
      return c.json(data || {});
    } catch (error) {
      console.error(`Error fetching ${section} data:`, error);
      return c.json({ error: `Failed to fetch ${section} data` }, 500);
    }
  });

  app.post(`${routePrefix}/${section}/:language`, async (c) => {
    try {
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      
      // Allow demo token or validate real token
      if (accessToken !== 'demo-token') {
        const { data: { user }, error } = await supabase.auth.getUser(accessToken);
        if (!user?.id) {
          return c.json({ error: 'Unauthorized' }, 401);
        }
      }

      const language = c.req.param('language');
      const content = await c.req.json();
      const key = `${section}_${language}`;
      
      await kv.set(key, content);
      return c.json({ message: `${section} data updated successfully` });
    } catch (error) {
      console.error(`Error updating ${section} content:`, error);
      return c.json({ error: `Failed to update ${section} data` }, 500);
    }
  });
});

// File upload endpoint (placeholder)
app.post(`${routePrefix}/upload`, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (accessToken !== 'demo-token') {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      if (!user?.id) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
    }

    // Placeholder - actual file upload would be implemented here
    return c.json({ 
      message: 'File upload endpoint ready',
      url: 'placeholder-url' 
    });
  } catch (error) {
    console.error('Error in upload endpoint:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

// Media management endpoints
app.get(`${routePrefix}/media`, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (accessToken !== 'demo-token') {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      if (!user?.id) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
    }

    // Return list of uploaded media files
    const mediaList = await kv.get('media_files') || [];
    return c.json(mediaList);
  } catch (error) {
    console.error('Error fetching media:', error);
    return c.json({ error: 'Failed to fetch media files' }, 500);
  }
});

// Health check endpoint
app.get(`${routePrefix}/health`, (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize default data on startup
const initializeDefaultData = async () => {
  try {
    console.log('Initializing default data...');
    const languages = ['zh', 'en'];
    const initSections = ['home', 'about', 'education', 'experience', 'projects', 'interests', 'contact'];

    for (const language of languages) {
      for (const section of initSections) {
        const key = `${section}_${language}`;
        const existing = await kv.get(key);
        
        if (!existing) {
          const defaultData = generateDefaultData(section, language);
          if (defaultData) {
            await kv.set(key, defaultData);
            console.log(`Set default data for ${key}`);
          }
        }
      }
    }
    
    console.log('Default data initialization complete');
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};

// Initialize on startup
initializeDefaultData();

// Start server
Deno.serve(app.fetch);