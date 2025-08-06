import { projectId, publicAnonKey } from './supabase/info';

// API 基础配置
const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c529659a`;

// Check if backend is available
let backendAvailable = true;

// API 调用通用函数
export async function apiCall(endpoint: string, options: RequestInit = {}, accessToken?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || publicAnonKey}`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    backendAvailable = true;
    return response.json();
  } catch (error: any) {
    // Network errors or timeouts indicate backend is not available
    if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
      backendAvailable = false;
      console.log('Backend not available:', error.message);
      throw new Error('Backend not available');
    }
    
    throw error;
  }
}

// Check backend availability
export function isBackendAvailable(): boolean {
  return backendAvailable;
}

// 文件上传函数
export async function uploadFile(file: File, accessToken: string) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload Error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// 认证相关 API
export const authAPI = {
  signup: (email: string, password: string, name: string) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  signin: (email: string, password: string) =>
    apiCall('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  test: () => apiCall('/auth/test'),
};

// 首页内容相关 API
export const homeAPI = {
  get: async (language: 'zh' | 'en', includeDrafts = false) => {
    try {
      return await apiCall(`/home/${language}${includeDrafts ? '?drafts=true' : ''}`);
    } catch (error: any) {
      if (error.message.includes('Backend not available')) {
        // Return null when backend is not available, let component handle fallback
        return null;
      }
      throw error;
    }
  },

  update: (language: 'zh' | 'en', data: any, status: 'draft' | 'published', accessToken: string) =>
    apiCall(`/home/${language}`, {
      method: 'POST',
      body: JSON.stringify({ ...data, status }),
    }, accessToken),
};

// 个人信息相关 API
export const profileAPI = {
  get: async (language: 'zh' | 'en', includeDrafts = false) => {
    try {
      return await apiCall(`/profile/${language}${includeDrafts ? '?drafts=true' : ''}`);
    } catch (error: any) {
      if (error.message.includes('Backend not available')) {
        return null;
      }
      throw error;
    }
  },

  update: (language: 'zh' | 'en', data: any, status: 'draft' | 'published', accessToken: string) =>
    apiCall(`/profile/${language}`, {
      method: 'POST',
      body: JSON.stringify({ ...data, status }),
    }, accessToken),
};

// 教育背景相关 API
export const educationAPI = {
  get: async (language: 'zh' | 'en', includeDrafts = false) => {
    try {
      return await apiCall(`/education/${language}${includeDrafts ? '?drafts=true' : ''}`);
    } catch (error: any) {
      if (error.message.includes('Backend not available')) {
        return null;
      }
      throw error;
    }
  },

  update: (language: 'zh' | 'en', data: any, status: 'draft' | 'published', accessToken: string) =>
    apiCall(`/education/${language}`, {
      method: 'POST',
      body: JSON.stringify({ ...data, status }),
    }, accessToken),
};

// 工作经历相关 API
export const experienceAPI = {
  get: async (language: 'zh' | 'en', includeDrafts = false) => {
    try {
      return await apiCall(`/experience/${language}${includeDrafts ? '?drafts=true' : ''}`);
    } catch (error: any) {
      if (error.message.includes('Backend not available')) {
        return null;
      }
      throw error;
    }
  },

  update: (language: 'zh' | 'en', data: any, status: 'draft' | 'published', accessToken: string) =>
    apiCall(`/experience/${language}`, {
      method: 'POST',
      body: JSON.stringify({ ...data, status }),
    }, accessToken),
};

// 联系信息相关 API
export const contactAPI = {
  get: async (language: 'zh' | 'en', includeDrafts = false) => {
    try {
      return await apiCall(`/contact/${language}${includeDrafts ? '?drafts=true' : ''}`);
    } catch (error: any) {
      if (error.message.includes('Backend not available')) {
        return null;
      }
      throw error;
    }
  },

  update: (language: 'zh' | 'en', data: any, status: 'draft' | 'published', accessToken: string) =>
    apiCall(`/contact/${language}`, {
      method: 'POST',
      body: JSON.stringify({ ...data, status }),
    }, accessToken),
};

// 项目相关 API
export const projectsAPI = {
  list: async (language: 'zh' | 'en', includeDrafts = false) => {
    try {
      return await apiCall(`/projects/${language}${includeDrafts ? '?drafts=true' : ''}`);
    } catch (error: any) {
      if (error.message.includes('Backend not available')) {
        return [];
      }
      throw error;
    }
  },

  create: (language: 'zh' | 'en', data: any, status: 'draft' | 'published', accessToken: string) =>
    apiCall(`/projects/${language}`, {
      method: 'POST',
      body: JSON.stringify({ ...data, status }),
    }, accessToken),

  update: (language: 'zh' | 'en', id: string, data: any, status: 'draft' | 'published', accessToken: string) =>
    apiCall(`/projects/${language}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...data, status }),
    }, accessToken),

  delete: (language: 'zh' | 'en', id: string, accessToken: string) =>
    apiCall(`/projects/${language}/${id}`, {
      method: 'DELETE',
    }, accessToken),
};

// 兴趣爱好相关 API
export const interestsAPI = {
  list: async (language: 'zh' | 'en', includeDrafts = false) => {
    try {
      return await apiCall(`/interests/${language}${includeDrafts ? '?drafts=true' : ''}`);
    } catch (error: any) {
      if (error.message.includes('Backend not available')) {
        return [];
      }
      throw error;
    }
  },

  create: (language: 'zh' | 'en', data: any, status: 'draft' | 'published', accessToken: string) =>
    apiCall(`/interests/${language}`, {
      method: 'POST',
      body: JSON.stringify({ ...data, status }),
    }, accessToken),
};

// 主题设计相关 API
export const themeAPI = {
  get: async (includeDrafts = false) => {
    try {
      return await apiCall(`/theme${includeDrafts ? '?drafts=true' : ''}`);
    } catch (error: any) {
      if (error.message.includes('Backend not available')) {
        return null;
      }
      throw error;
    }
  },

  update: (data: any, status: 'draft' | 'published', accessToken: string) =>
    apiCall('/theme', {
      method: 'POST',
      body: JSON.stringify({ ...data, status }),
    }, accessToken),
};

// 站点设置相关 API
export const settingsAPI = {
  getSite: async (includeDrafts = false) => {
    try {
      return await apiCall(`/settings/site${includeDrafts ? '?drafts=true' : ''}`);
    } catch (error: any) {
      if (error.message.includes('Backend not available')) {
        return null;
      }
      throw error;
    }
  },

  updateSite: (data: any, status: 'draft' | 'published', accessToken: string) =>
    apiCall('/settings/site', {
      method: 'POST',
      body: JSON.stringify({ ...data, status }),
    }, accessToken),
};

// 媒体文件相关 API
export const mediaAPI = {
  list: (accessToken: string) =>
    apiCall('/media', {}, accessToken),

  upload: (file: File, accessToken: string) =>
    uploadFile(file, accessToken),

  delete: (filename: string, accessToken: string) =>
    apiCall(`/media/${filename}`, {
      method: 'DELETE',
    }, accessToken),
};

// 内容发布相关 API
export const publishAPI = {
  publishContent: (section: string, language?: string, accessToken: string) => {
    const endpoint = language ? `/publish/${section}/${language}` : `/publish/${section}`;
    return apiCall(endpoint, {
      method: 'POST',
    }, accessToken);
  },
};

// 健康检查
export const healthCheck = async () => {
  try {
    const result = await apiCall('/health');
    backendAvailable = true;
    return result;
  } catch (error) {
    backendAvailable = false;
    throw error;
  }
};

// 批量操作 API
export const batchAPI = {
  // 获取所有内容的状态
  getContentStatus: async (language: 'zh' | 'en', accessToken: string) => {
    const sections = ['home', 'profile', 'education', 'experience', 'contact', 'projects', 'interests'];
    const results = await Promise.allSettled(
      sections.map(section => 
        apiCall(`/${section}/${language}?drafts=true`, {}, accessToken)
      )
    );
    
    const status: Record<string, any> = {};
    sections.forEach((section, index) => {
      const result = results[index];
      if (result.status === 'fulfilled') {
        status[section] = result.value;
      }
    });
    
    return status;
  },

  // 批量发布所有内容
  publishAll: async (language: 'zh' | 'en', accessToken: string) => {
    const sections = ['home', 'profile', 'education', 'experience', 'contact', 'projects', 'interests'];
    const results = await Promise.allSettled(
      sections.map(section =>
        publishAPI.publishContent(section, language, accessToken)
      )
    );
    
    return results;
  },
};

// 导出默认的 apiCall 函数供向后兼容
export default apiCall;