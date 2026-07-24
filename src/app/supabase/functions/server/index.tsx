import { Hono } from 'jsr:@hono/hono'
import { cors } from 'jsr:@hono/hono/cors'
import { logger } from 'jsr:@hono/hono/logger'
import { createClient } from 'jsr:@supabase/supabase-js@2'

// 初始化Hono应用
const app = new Hono()

// 添加日志中间件
app.use('*', logger())

// CORS配置 - 支持所有源
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  credentials: false
}))

// 响应头设置中间件
app.use('*', async (c, next) => {
  // 只对API路径设置JSON响应头
  if (c.req.path.startsWith('/make-server-55b791b3/')) {
    c.header('Content-Type', 'application/json; charset=UTF-8')
    c.header('Cache-Control', 'no-cache, no-store, must-revalidate')
    c.header('Pragma', 'no-cache')
    c.header('Expires', '0')
  }
  await next()
})

// 初始化Supabase客户端
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// 验证环境变量
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT_SET')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'NOT_SET')
  console.error('')
  console.error('🔧 Please set these environment variables in your Supabase project:')
  console.error('   1. Go to your Supabase project dashboard')
  console.error('   2. Navigate to Settings > Edge Functions')
  console.error('   3. Set the environment variables')
}

const supabase = createClient(
  supabaseUrl ?? '',
  supabaseServiceKey ?? ''
)

// 导入KV存储工具
import * as kv from './kv_store.tsx'

// UUID生成函数
function generateUUID(): string {
  return crypto.randomUUID()
}

// 语言列检查缓存
let languageColumnExists: boolean | null = null

async function checkLanguageColumn(): Promise<boolean> {
  if (languageColumnExists !== null) {
    return languageColumnExists
  }

  try {
    const { data, error } = await supabase
      .from('content')
      .select('language')
      .limit(1)

    if (error) {
      if (error.message.includes('column "language" does not exist') || 
          error.code === '42703') {
        console.log('Language column does not exist:', error.message)
        languageColumnExists = false
        return false
      }
      console.log('Could not check language column existence:', error.message)
      languageColumnExists = false
      return false
    }

    languageColumnExists = true
    console.log('Language column exists: true')
    return true
  } catch (error) {
    console.log('Error checking language column:', error)
    languageColumnExists = false
    return false
  }
}

// 检查images表是否存在
async function checkImagesTable(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('images')
      .select('id')
      .limit(1)

    if (error) {
      if (error.message.includes('relation "public.images" does not exist') || 
          error.code === '42P01') {
        console.log('Images table does not exist, using KV store as fallback')
        return false
      }
      console.log('Images table exists but query failed:', error.message)
      return true
    }

    console.log('Images table exists and is accessible')
    return true
  } catch (error) {
    console.log('Error checking images table:', error)
    return false
  }
}

// 可选认证用户获取
async function getOptionalAuthenticatedUser(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: null, isAuthenticated: false }
    }

    const token = authHeader.split(' ')[1]
    
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    if (token === anonKey) {
      console.log('Using anon key - no user authentication')
      return { user: null, error: null, isAuthenticated: false }
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error) {
      console.log('Auth token validation failed:', error.message)
      return { user: null, error: error.message, isAuthenticated: false }
    }
    
    return { user, error: null, isAuthenticated: true }
  } catch (error) {
    console.log('Authentication check error:', error)
    return { user: null, error: error instanceof Error ? error.message : String(error), isAuthenticated: false }
  }
}

// 存储桶管理 - 增强错误处理版本
const BUCKET_NAME = 'make-55b791b3-images'

// 检查响应是否为HTML错误页面
function isHtmlResponse(error: any): boolean {
  const errorMessage = error?.message || String(error)
  return errorMessage.includes('Unexpected token \'<\'') || 
         errorMessage.includes('<html>') || 
         errorMessage.includes('<!DOCTYPE') ||
         errorMessage.toLowerCase().includes('storageuknownerror') ||
         errorMessage.includes('returned HTML response') ||
         errorMessage.toLowerCase().includes('html') ||
         errorMessage.includes('502 Bad Gateway') ||
         errorMessage.includes('503 Service Unavailable') ||
         errorMessage.includes('504 Gateway Timeout') ||
         errorMessage.includes('<title>') ||
         errorMessage.includes('<body>') ||
         errorMessage.includes('<head>') ||
         errorMessage.includes('SyntaxError: Unexpected token \'<\'') ||
         errorMessage.includes('SyntaxError: Unexpected token') ||
         errorMessage.includes('Unexpected end of JSON input')
}

// 增强的存储桶操作重试机制
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
  operationName: string = 'operation'
): Promise<T> {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation()
      if (attempt > 1) {
        console.log(`✅ ${operationName} succeeded on attempt ${attempt}`)
      }
      return result
    } catch (error) {
      lastError = error
      
      if (isHtmlResponse(error)) {
        console.warn(`⚠️ ${operationName} attempt ${attempt} returned HTML response - service may be temporarily unavailable`)
      } else {
        console.warn(`⚠️ ${operationName} attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error))
      }
      
      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(1.5, attempt - 1) // Exponential backoff
        console.log(`🔄 Retrying ${operationName} in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

// 递归获取存储桶中的所有文件
async function getAllStorageFiles(path: string = '', allFiles: any[] = []): Promise<any[]> {
  try {
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(path, { limit: 1000 })
    
    if (error) {
      throw error
    }
    
    if (!files) {
      return allFiles
    }
    
    for (const file of files) {
      const fullPath = path ? `${path}/${file.name}` : file.name
      
      if (file.metadata && file.metadata.mimetype) {
        // 这是一个文件
        allFiles.push({
          ...file,
          fullPath: fullPath,
          directory: path
        })
      } else if (!file.name.includes('.')) {
        // 这可能是一个目录，递归获取子文件
        try {
          console.log(`📁 Scanning directory: ${fullPath}`)
          await getAllStorageFiles(fullPath, allFiles)
        } catch (dirError) {
          console.warn(`⚠️ Failed to scan directory ${fullPath}:`, dirError)
        }
      } else {
        // 文件没有metadata但有扩展名，当作文件处理
        allFiles.push({
          ...file,
          fullPath: fullPath,
          directory: path
        })
      }
    }
    
    return allFiles
  } catch (error) {
    console.error(`Failed to list files in path ${path}:`, error)
    throw error
  }
}

// 检查文件是否为图片类型
function isImageFile(filename: string, mimeType?: string): boolean {
  if (mimeType && mimeType.startsWith('image/')) {
    return true
  }
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.ico']
  const extension = filename.toLowerCase().split('.').pop()
  return extension ? imageExtensions.includes(`.${extension}`) : false
}

// KV存储图片管理函数
async function saveImageToKV(imageData: any): Promise<any> {
  try {
    const key = `image:${imageData.id}`
    await kv.set(key, imageData)
    console.log(`✅ Image saved to KV store: ${key}`)
    return imageData
  } catch (error) {
    console.error('Failed to save image to KV store:', error)
    throw error
  }
}

async function getImagesFromKV(): Promise<any[]> {
  try {
    const imageKeys = await kv.getByPrefix('image:')
    console.log(`📦 Retrieved ${imageKeys.length} images from KV store`)
    return imageKeys
  } catch (error) {
    console.error('Failed to get images from KV store:', error)
    return []
  }
}

async function deleteImageFromKV(imageId: string): Promise<void> {
  try {
    const key = `image:${imageId}`
    await kv.del(key)
    console.log(`🗑️ Image deleted from KV store: ${key}`)
  } catch (error) {
    console.error('Failed to delete image from KV store:', error)
    throw error
  }
}

async function updateImageInKV(imageId: string, updates: any): Promise<any> {
  try {
    const key = `image:${imageId}`
    const existing = await kv.get(key)
    if (!existing) {
      throw new Error('Image not found in KV store')
    }
    
    const updatedImage = { ...existing, ...updates }
    await kv.set(key, updatedImage)
    console.log(`✏️ Image updated in KV store: ${key}`)
    return updatedImage
  } catch (error) {
    console.error('Failed to update image in KV store:', error)
    throw error
  }
}

// 安全的存储桶列表获取
async function safeListBuckets(): Promise<{ success: boolean; buckets?: any[]; error?: string }> {
  try {
    console.log('🔍 Attempting to list storage buckets...')
    
    const result = await withRetry(
      async () => {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets()
        
        if (listError) {
          if (isHtmlResponse(listError)) {
            throw new Error('Storage service returned HTML response - service may be unavailable')
          }
          throw listError
        }
        
        return buckets || []
      },
      3, // maxRetries
      2000, // delayMs
      'listBuckets'
    )
    
    console.log('✅ Successfully listed buckets')
    return { success: true, buckets: result }
    
  } catch (error) {
    if (isHtmlResponse(error)) {
      console.warn('⚠️ Storage API consistently returned HTML - storage service may be down')
      return { 
        success: false, 
        error: 'Storage API unavailable - received HTML responses instead of JSON after multiple retries' 
      }
    }
    
    console.error('💥 Failed to list buckets after retries:', error)
    return { success: false, error: String(error) }
  }
}

// 增强的存储桶访问测试
async function testBucketAccess(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🔍 Testing bucket ${BUCKET_NAME} access...`)
    
    const result = await withRetry(
      async () => {
        const { data: files, error: accessError } = await supabase.storage
          .from(BUCKET_NAME)
          .list('', { limit: 1 })
        
        if (accessError) {
          if (isHtmlResponse(accessError)) {
            throw new Error('Bucket access test returned HTML response')
          }
          throw accessError
        }
        
        return files
      },
      3, // maxRetries
      1500, // delayMs
      'bucketAccessTest'
    )
    
    console.log(`✅ Bucket ${BUCKET_NAME} is accessible`)
    return { success: true }
    
  } catch (error) {
    if (isHtmlResponse(error)) {
      console.warn('⚠️ Bucket access consistently returned HTML responses')
      return { 
        success: false, 
        error: 'Storage service unavailable for access verification - received HTML responses instead of JSON after multiple retries' 
      }
    }
    
    console.error(`❌ Cannot access bucket ${BUCKET_NAME}:`, error instanceof Error ? error.message : String(error))
    return { success: false, error: `Bucket access denied: ${error instanceof Error ? error.message : String(error)}` }
  }
}

async function ensureBucketExists(): Promise<{ success: boolean; error?: string }> {
  if (!supabaseUrl || !supabaseServiceKey) {
    return { 
      success: false,
      error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables' 
    }
  }

  try {
    console.log(`🔍 Checking if bucket ${BUCKET_NAME} exists...`)
    
    // 使用安全的存储桶列表获取
    const listResult = await safeListBuckets()
    
    if (!listResult.success) {
      // 如果无法列出存储桶，返回错误但不崩溃应用
      console.warn('⚠️ Cannot verify bucket existence:', listResult.error)
      return { 
        success: false, 
        error: `Cannot access storage service: ${listResult.error}` 
      }
    }
    
    const bucketExists = listResult.buckets?.some(bucket => bucket.name === BUCKET_NAME)
    
    if (!bucketExists) {
      console.log(`📦 Creating bucket ${BUCKET_NAME}...`)
      
      try {
        const createResult = await withRetry(
          async () => {
            const { data: createData, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
              public: false,
              allowedMimeTypes: [
                'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
                'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'
              ],
              fileSizeLimit: 52428800 // 50MB
            })
            
            if (createError) {
              if (isHtmlResponse(createError)) {
                throw new Error('Bucket creation returned HTML response')
              }
              throw createError
            }
            
            return createData
          },
          3, // maxRetries
          2000, // delayMs
          'createBucket'
        )
        
        console.log(`✅ Bucket ${BUCKET_NAME} created successfully`)
      } catch (createErr) {
        if (isHtmlResponse(createErr)) {
          console.warn('⚠️ Bucket creation consistently failed with HTML responses')
          return { 
            success: false, 
            error: 'Storage service unavailable for bucket creation - received HTML responses instead of JSON after multiple retries' 
          }
        }
        
        console.error('💥 Failed to create bucket after retries:', createErr)
        return { success: false, error: String(createErr) }
      }
    } else {
      console.log(`✅ Bucket ${BUCKET_NAME} already exists`)
    }
    
    // 测试存储桶访问权限
    const accessResult = await testBucketAccess()
    if (!accessResult.success) {
      return { 
        success: false, 
        error: accessResult.error 
      }
    }
    
    return { success: true }
    
  } catch (error) {
    if (isHtmlResponse(error)) {
      console.warn('⚠️ Storage operations consistently failed with HTML responses')
      return { 
        success: false, 
        error: 'Storage service completely unavailable - received HTML responses instead of JSON after multiple retries' 
      }
    }
    
    console.error('💥 Unexpected error in ensureBucketExists:', error)
    return { success: false, error: String(error) }
  }
}

async function validateBucketConnection(): Promise<{ exists: boolean; accessible: boolean; error?: string }> {
  const result = await ensureBucketExists()
  
  if (result.success) {
    return { exists: true, accessible: true }
  } else {
    // 如果确保存储桶存在失败，再次检查是否存在但无法访问
    try {
      const listResult = await safeListBuckets()
      if (listResult.success) {
        const bucketExists = listResult.buckets?.some(bucket => bucket.name === BUCKET_NAME)
        return { 
          exists: bucketExists, 
          accessible: false, 
          error: result.error 
        }
      }
    } catch (e) {
      // 忽略这个错误，返回原始错误
    }
    
    return { exists: false, accessible: false, error: result.error }
  }
}

// URL元数据获取函数
async function fetchUrlMetadata(url: string) {
  try {
    console.log(`🔍 Fetching metadata for URL: ${url}`)
    
    // 验证URL格式
    let validUrl: URL
    try {
      validUrl = new URL(url)
      
      // 检查协议
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error('Invalid protocol')
      }
    } catch (error) {
      throw new Error('Invalid URL format')
    }
    
    // 设置请求超时和头部
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时
    
    try {
      // 获取网页内容
      const response = await fetch(validUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MetadataBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        redirect: 'follow'
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch URL`)
      }
      
      // 检查内容类型
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('text/html')) {
        return {
          title: validUrl.hostname,
          description: 'Non-HTML content',
          url: url,
          image: null,
          favicon: `${validUrl.protocol}//${validUrl.hostname}/favicon.ico`
        }
      }
      
      // 读取HTML内容
      const html = await response.text()
      
      // 解析元数据
      const metadata = parseHtmlMetadata(html, validUrl)
      
      console.log(`✅ Successfully fetched metadata for: ${url}`)
      return metadata
      
    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout')
        }
        
        throw new Error(`Failed to fetch URL: ${fetchError.message}`)
      }
      
      throw new Error('Unknown fetch error')
    }
    
  } catch (error) {
    console.error('URL metadata fetch error:', error)
    throw error
  }
}

// HTML元数据解析函数
function parseHtmlMetadata(html: string, baseUrl: URL) {
  const metadata = {
    title: '',
    description: '',
    url: baseUrl.toString(),
    image: null as string | null,
    favicon: null as string | null,
    isPodcast: false,
    podcastData: null as any
  }
  
  // 使用正则表达式解析HTML（简化版本）
  try {
    // 检查是否为播客页面
    const podcastData = parsePodcastContent(html, baseUrl)
    if (podcastData) {
      metadata.isPodcast = true
      metadata.podcastData = podcastData
    }
    
    // 解析标题
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    if (titleMatch) {
      metadata.title = titleMatch[1].trim()
    }
    
    // 如果没有标题，尝试从meta标签获取
    if (!metadata.title) {
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)
      if (ogTitleMatch) {
        metadata.title = ogTitleMatch[1].trim()
      }
    }
    
    // 如果还是没有标题，使用域名
    if (!metadata.title) {
      metadata.title = baseUrl.hostname
    }
    
    // 解析描述
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
    if (descMatch) {
      metadata.description = descMatch[1].trim()
    }
    
    // 如果没有描述，尝试从og:description获取
    if (!metadata.description) {
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)
      if (ogDescMatch) {
        metadata.description = ogDescMatch[1].trim()
      }
    }
    
    // 解析图片
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i)
    if (ogImageMatch) {
      const imageUrl = ogImageMatch[1].trim()
      if (imageUrl) {
        // 确保图片URL是绝对路径
        if (imageUrl.startsWith('http')) {
          metadata.image = imageUrl
        } else if (imageUrl.startsWith('//')) {
          metadata.image = baseUrl.protocol + imageUrl
        } else if (imageUrl.startsWith('/')) {
          metadata.image = `${baseUrl.protocol}//${baseUrl.hostname}${imageUrl}`
        } else {
          metadata.image = `${baseUrl.protocol}//${baseUrl.hostname}/${imageUrl}`
        }
      }
    }
    
    // 解析favicon
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']*)["']/i)
    if (faviconMatch) {
      const faviconUrl = faviconMatch[1].trim()
      if (faviconUrl) {
        // 确保favicon URL是绝对路径
        if (faviconUrl.startsWith('http')) {
          metadata.favicon = faviconUrl
        } else if (faviconUrl.startsWith('//')) {
          metadata.favicon = baseUrl.protocol + faviconUrl
        } else if (faviconUrl.startsWith('/')) {
          metadata.favicon = `${baseUrl.protocol}//${baseUrl.hostname}${faviconUrl}`
        } else {
          metadata.favicon = `${baseUrl.protocol}//${baseUrl.hostname}/${faviconUrl}`
        }
      }
    }
    
    // 如果没有找到favicon，使用默认路径
    if (!metadata.favicon) {
      metadata.favicon = `${baseUrl.protocol}//${baseUrl.hostname}/favicon.ico`
    }
    
    // 清理文本内容
    metadata.title = cleanMetadataText(metadata.title)
    metadata.description = cleanMetadataText(metadata.description)
    
  } catch (parseError) {
    console.warn('⚠️ HTML parsing error:', parseError)
    // 即使解析失败，也返回基本信息
    if (!metadata.title) {
      metadata.title = baseUrl.hostname
    }
    if (!metadata.description) {
      metadata.description = 'Failed to parse page description'
    }
  }
  
  return metadata
}

// 播客内容解析函数
function parsePodcastContent(html: string, baseUrl: URL) {
  const hostname = baseUrl.hostname.toLowerCase()
  
  // 检查是否为播客平台
  const podcastPlatforms = [
    'podcasts.apple.com',
    'open.spotify.com',
    'podcasts.google.com',
    'castbox.fm',
    'www.ximalaya.com',
    'www.lizhi.fm',
    'www.qingting.fm',
    'www.missevan.com',
    'music.163.com',
    'overcast.fm',
    'pocketcasts.com',
    'anchor.fm',
    'soundcloud.com'
  ]
  
  const isPodcastPlatform = podcastPlatforms.some(platform => hostname.includes(platform))
  
  if (!isPodcastPlatform) {
    // 通过内容检测是否为播客
    const podcastKeywords = [
      'podcast', 'podcasts', '播客', '音频节目', 'audio show', 'episode',
      '节目单集', '播放列表', 'rss feed', 'itunes', 'spotify podcast'
    ]
    
    const hasKeywords = podcastKeywords.some(keyword => 
      html.toLowerCase().includes(keyword.toLowerCase())
    )
    
    if (!hasKeywords) return null
  }
  
  const podcastData = {
    platform: identifyPodcastPlatform(hostname),
    type: 'unknown', // 'show', 'episode', 'playlist'
    episodes: [] as any[],
    showInfo: null as any,
    playUrl: null as string | null
  }
  
  try {
    // 解析不同平台的播客数据
    if (hostname.includes('podcasts.apple.com')) {
      return parseApplePodcasts(html, baseUrl, podcastData)
    } else if (hostname.includes('open.spotify.com')) {
      return parseSpotifyPodcasts(html, baseUrl, podcastData)
    } else if (hostname.includes('ximalaya.com')) {
      return parseXimalayaPodcasts(html, baseUrl, podcastData)
    } else if (hostname.includes('lizhi.fm')) {
      return parseLizhiFM(html, baseUrl, podcastData)
    } else if (hostname.includes('soundcloud.com')) {
      return parseSoundCloud(html, baseUrl, podcastData)
    } else {
      // 通用播客解析
      return parseGenericPodcast(html, baseUrl, podcastData)
    }
  } catch (error) {
    console.warn('播客解析失败:', error)
    return null
  }
}

// 识别播客平台
function identifyPodcastPlatform(hostname: string): string {
  if (hostname.includes('podcasts.apple.com')) return 'Apple Podcasts'
  if (hostname.includes('open.spotify.com')) return 'Spotify'
  if (hostname.includes('podcasts.google.com')) return 'Google Podcasts'
  if (hostname.includes('ximalaya.com')) return '喜马拉雅'
  if (hostname.includes('lizhi.fm')) return '荔枝FM'
  if (hostname.includes('qingting.fm')) return '蜻蜓FM'
  if (hostname.includes('missevan.com')) return '猫耳FM'
  if (hostname.includes('music.163.com')) return '网易云音乐'
  if (hostname.includes('soundcloud.com')) return 'SoundCloud'
  if (hostname.includes('overcast.fm')) return 'Overcast'
  if (hostname.includes('pocketcasts.com')) return 'Pocket Casts'
  if (hostname.includes('anchor.fm')) return 'Anchor'
  if (hostname.includes('castbox.fm')) return 'Castbox'
  return '未知播客平台'
}

// Apple Podcasts 解析
function parseApplePodcasts(html: string, baseUrl: URL, podcastData: any) {
  try {
    // 提取节目信息
    const showTitleMatch = html.match(/<h1[^>]*class="[^"]*product-header__title[^"]*"[^>]*>([^<]+)</i)
    if (showTitleMatch) {
      podcastData.showInfo = {
        title: cleanMetadataText(showTitleMatch[1]),
        platform: 'Apple Podcasts'
      }
    }
    
    // 提取单集列表
    const episodePattern = /<li[^>]*class="[^"]*track-list__item[^"]*"[^>]*>[\s\S]*?<div[^>]*class="[^"]*track-list-item__text[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)</g
    const episodes = []
    
    let match
    while ((match = episodePattern.exec(html)) !== null) {
      episodes.push({
        title: cleanMetadataText(match[2]),
        url: match[1],
        platform: 'Apple Podcasts'
      })
    }
    
    podcastData.episodes = episodes.slice(0, 20) // 限制显示数量
    podcastData.type = episodes.length > 0 ? 'show' : 'episode'
    
    return podcastData
  } catch (error) {
    console.warn('Apple Podcasts 解析失败:', error)
    return podcastData
  }
}

// Spotify 播客解析
function parseSpotifyPodcasts(html: string, baseUrl: URL, podcastData: any) {
  try {
    // 检查是否为播客节目
    if (baseUrl.pathname.includes('/show/')) {
      podcastData.type = 'show'
      
      // 提取节目标题
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
      if (titleMatch) {
        podcastData.showInfo = {
          title: cleanMetadataText(titleMatch[1].replace(' | Spotify', '')),
          platform: 'Spotify'
        }
      }
      
      // 尝试提取播放URL
      const playUrlMatch = html.match(/spotify:show:([a-zA-Z0-9]+)/)
      if (playUrlMatch) {
        podcastData.playUrl = `https://open.spotify.com/show/${playUrlMatch[1]}`
      }
      
    } else if (baseUrl.pathname.includes('/episode/')) {
      podcastData.type = 'episode'
      
      // 提取单集标题
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
      if (titleMatch) {
        podcastData.episodes = [{
          title: cleanMetadataText(titleMatch[1].replace(' | Spotify', '')),
          url: baseUrl.toString(),
          platform: 'Spotify'
        }]
      }
      
      // 尝试提取播放URL
      const playUrlMatch = html.match(/spotify:episode:([a-zA-Z0-9]+)/)
      if (playUrlMatch) {
        podcastData.playUrl = `https://open.spotify.com/episode/${playUrlMatch[1]}`
      }
    }
    
    return podcastData
  } catch (error) {
    console.warn('Spotify 播客解析失败:', error)
    return podcastData
  }
}

// 喜马拉雅播客解析
function parseXimalayaPodcasts(html: string, baseUrl: URL, podcastData: any) {
  try {
    // 提取专辑信息
    const albumTitleMatch = html.match(/<h1[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)</i)
    if (albumTitleMatch) {
      podcastData.showInfo = {
        title: cleanMetadataText(albumTitleMatch[1]),
        platform: '喜马拉雅'
      }
    }
    
    // 提取单集列表
    const episodePattern = /<div[^>]*class="[^"]*sound-list[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*title="([^"]*)"[^>]*>/g
    const episodes = []
    
    let match
    while ((match = episodePattern.exec(html)) !== null) {
      episodes.push({
        title: cleanMetadataText(match[2]),
        url: `https://www.ximalaya.com${match[1]}`,
        platform: '喜马拉雅'
      })
    }
    
    podcastData.episodes = episodes.slice(0, 15)
    podcastData.type = episodes.length > 0 ? 'show' : 'episode'
    
    return podcastData
  } catch (error) {
    console.warn('喜马拉雅解析失败:', error)
    return podcastData
  }
}

// 荔枝FM播客解析
function parseLizhiFM(html: string, baseUrl: URL, podcastData: any) {
  try {
    // 提取电台信息
    const showTitleMatch = html.match(/<h1[^>]*class="[^"]*radio-title[^"]*"[^>]*>([^<]+)</i)
    if (showTitleMatch) {
      podcastData.showInfo = {
        title: cleanMetadataText(showTitleMatch[1]),
        platform: '荔枝FM'
      }
    }
    
    // 提取音频列表
    const audioPattern = /<div[^>]*class="[^"]*audiolist-item[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)</g
    const episodes = []
    
    let match
    while ((match = audioPattern.exec(html)) !== null) {
      episodes.push({
        title: cleanMetadataText(match[2]),
        url: match[1],
        platform: '荔枝FM'
      })
    }
    
    podcastData.episodes = episodes.slice(0, 15)
    podcastData.type = episodes.length > 0 ? 'show' : 'episode'
    
    return podcastData
  } catch (error) {
    console.warn('荔枝FM解析失败:', error)
    return podcastData
  }
}

// SoundCloud 播客解析
function parseSoundCloud(html: string, baseUrl: URL, podcastData: any) {
  try {
    // 检查是否为播放列表
    if (baseUrl.pathname.includes('/sets/')) {
      podcastData.type = 'show'
      
      // 提取播放列表标题
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
      if (titleMatch) {
        podcastData.showInfo = {
          title: cleanMetadataText(titleMatch[1].replace(' by ', ' - ').replace(' | Free Listening on SoundCloud', '')),
          platform: 'SoundCloud'
        }
      }
      
    } else {
      podcastData.type = 'episode'
      
      // 提取单个音频标题
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
      if (titleMatch) {
        podcastData.episodes = [{
          title: cleanMetadataText(titleMatch[1].replace(' by ', ' - ').replace(' | Free Listening on SoundCloud', '')),
          url: baseUrl.toString(),
          platform: 'SoundCloud'
        }]
      }
    }
    
    podcastData.playUrl = baseUrl.toString()
    
    return podcastData
  } catch (error) {
    console.warn('SoundCloud解析失败:', error)
    return podcastData
  }
}

// 通用播客解析
function parseGenericPodcast(html: string, baseUrl: URL, podcastData: any) {
  try {
    // 尝试找到RSS链接
    const rssMatch = html.match(/<link[^>]*type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)["']/i)
    if (rssMatch) {
      podcastData.rssUrl = rssMatch[1]
    }
    
    // 查找音频链接
    const audioPattern = /<a[^>]*href=["']([^"']*\.(?:mp3|wav|m4a|aac|ogg))["'][^>]*>([^<]*)</gi
    const episodes = []
    
    let match
    while ((match = audioPattern.exec(html)) !== null) {
      episodes.push({
        title: cleanMetadataText(match[2]) || '未知标题',
        url: match[1],
        platform: '通用播客'
      })
    }
    
    podcastData.episodes = episodes.slice(0, 10)
    podcastData.type = episodes.length > 0 ? 'show' : 'unknown'
    
    return podcastData
  } catch (error) {
    console.warn('通用播客解析失败:', error)
    return podcastData
  }
}

// 文本清理函数
function cleanMetadataText(text: string): string {
  if (!text) return ''
  
  return text
    .replace(/\s+/g, ' ') // 合并多个空白字符
    .replace(/&quot;/g, '"') // 解码HTML实体
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
    .substring(0, 500) // 限制长度
}

// 健康检查端点
app.get('/make-server-55b791b3/health', async (c) => {
  try {
    const hasLanguageColumn = await checkLanguageColumn()
    const hasImagesTable = await checkImagesTable()
    const bucketValidation = await validateBucketConnection()
    
    let bucketStatus = 'unknown'
    if (bucketValidation.exists && bucketValidation.accessible) {
      bucketStatus = 'connected'
    } else if (bucketValidation.exists) {
      bucketStatus = 'exists_but_inaccessible'
    } else {
      bucketStatus = 'not_found'
    }
    
    return c.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '4.6.0',
      cli_compatible: true,
      deno_version: Deno.version.deno,
      authMode: 'optional',
      features: ['content_management', 'multilingual_support', 'user_signup', 'enhanced_storage_retry', 'storage_sync_cleanup', 'recursive_folder_sync', 'kv_fallback', 'url_metadata'],
      multilingual: {
        supported: hasLanguageColumn,
        migrationRequired: !hasLanguageColumn
      },
      storage: {
        bucket: BUCKET_NAME,
        status: bucketStatus,
        exists: bucketValidation.exists,
        accessible: bucketValidation.accessible,
        error: bucketValidation.error,
        fallback_mode: !bucketValidation.accessible,
        retry_mechanism: 'enabled'
      },
      database: {
        imagesTable: hasImagesTable,
        kvFallback: !hasImagesTable,
        contentTable: hasLanguageColumn
      },
      urlMetadata: {
        enabled: true,
        timeout: 10000,
        userAgent: 'Mozilla/5.0 (compatible; MetadataBot/1.0)'
      }
    })
  } catch (error) {
    return c.json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      version: '4.6.0'
    }, 500)
  }
})

// URL元数据获取端点
app.post('/make-server-55b791b3/url-metadata', async (c) => {
  try {
    console.log('📡 URL metadata request received')
    
    const body = await c.req.json()
    const { url } = body
    
    if (!url) {
      console.log('❌ No URL provided')
      return c.json({
        success: false,
        error: 'URL is required'
      }, 400)
    }
    
    const metadata = await fetchUrlMetadata(url)
    
    return c.json({
      success: true,
      data: metadata
    })
    
  } catch (error) {
    console.error('💥 URL metadata endpoint error:', error)
    
    // 确保返回有效的JSON响应
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, 500)
  }
})

// URL元数据健康检查端点
app.get('/make-server-55b791b3/url-metadata/health', async (c) => {
  try {
    return c.json({
      status: 'healthy',
      service: 'url-metadata',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      features: ['html_parsing', 'timeout_handling', 'error_recovery']
    })
  } catch (error) {
    return c.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// 存储诊断端点
app.get('/make-server-55b791b3/storage/diagnostics', async (c) => {
  try {
    console.log('🔍 Running storage diagnostics...')
    
    const bucketValidation = await validateBucketConnection()
    const hasImagesTable = await checkImagesTable()
    const suggestions: string[] = []
    const notes: string[] = []
    
    // 获取文件数量
    let fileCount = 0
    let filesAccessible = false
    
    if (bucketValidation.exists && bucketValidation.accessible) {
      try {
        const allFiles = await getAllStorageFiles()
        fileCount = allFiles.length
        filesAccessible = true
        
        // 分析文件分布
        const directories = new Set<string>()
        const imageFiles = allFiles.filter(file => isImageFile(file.name, file.metadata?.mimetype))
        
        allFiles.forEach(file => {
          if (file.directory) {
            directories.add(file.directory)
          }
        })
        
        notes.push(`发现 ${imageFiles.length} 个图片文件`)
        notes.push(`分布在 ${directories.size} 个目录中`)
        if (directories.size > 0) {
          notes.push(`目录列表: ${Array.from(directories).join(', ')}`)
        }
        
      } catch (error) {
        console.warn('Failed to count files:', error)
      }
    }
    
    // 生成建议和注意事项
    if (!bucketValidation.exists) {
      suggestions.push('创建存储桶 make-55b791b3-images')
      suggestions.push('配置存储桶为私有访问')
    } else if (!bucketValidation.accessible) {
      suggestions.push('检查存储桶权限配置')
      suggestions.push('确保RLS策略正确设置')
      suggestions.push('验证Supabase服务状态')
      
      if (bucketValidation.error && isHtmlResponse(bucketValidation.error)) {
        suggestions.push('等待Supabase存储服务恢复正常')
        suggestions.push('检查网络连接稳定性')
        notes.push('检测到HTML响应，这表明存储服务可能暂时不可用')
        notes.push('系统已启用重试机制，会自动重试失败的操作')
      }
    } else {
      notes.push('存储桶配置正常')
      notes.push(`已发现 ${fileCount} 个文件`)
      notes.push('重试机制已启用，可处理临时连接问题')
      notes.push('支持递归文件夹扫描')
    }
    
    if (!hasImagesTable) {
      notes.push('数据库images表不存在，使用KV存储作为后备方案')
      suggestions.push('考虑创建images表以获得更好的性能')
    } else {
      notes.push('数据库images表可用')
    }
    
    const diagnostics = {
      bucket: {
        exists: bucketValidation.exists,
        accessible: bucketValidation.accessible,
        isPrivate: bucketValidation.accessible ? true : null,
        accessError: bucketValidation.error || null,
        name: BUCKET_NAME,
        retryMechanism: 'enabled',
        recursiveFolderSupport: true
      },
      files: {
        count: fileCount,
        accessible: filesAccessible
      },
      database: {
        imagesTable: hasImagesTable,
        kvFallback: !hasImagesTable
      },
      policies: {
        count: 0,
        error: null
      },
      suggestions,
      notes
    }
    
    return c.json(diagnostics)
  } catch (error) {
    console.error('Storage diagnostics error:', error)
    return c.json({
      bucket: {
        exists: false,
        accessible: false,
        isPrivate: null,
        accessError: `Diagnostics failed: ${error instanceof Error ? error.message : String(error)}`,
        name: BUCKET_NAME,
        retryMechanism: 'enabled',
        recursiveFolderSupport: true
      },
      files: {
        count: 0,
        accessible: false
      },
      database: {
        imagesTable: false,
        kvFallback: true
      },
      policies: {
        count: 0,
        error: 'Could not check policies'
      },
      suggestions: ['检查网络连接', '验证Supabase配置', '检查环境变量设置', '等待存储服务恢复'],
      notes: ['诊断过程中发生错误', '重试机制已启用', '使用KV存储作为后备方案']
    }, 500)
  }
})

// 存储设置端点
app.post('/make-server-55b791b3/storage/setup', async (c) => {
  try {
    console.log('🔧 Setting up storage bucket...')
    
    const result = await ensureBucketExists()
    
    if (result.success) {
      return c.json({
        success: true,
        message: `存储桶 ${BUCKET_NAME} 已成功设置并可访问`,
        retryMechanism: 'enabled'
      })
    } else {
      return c.json({
        success: false,
        error: result.error || '存储桶设置失败',
        retryMechanism: 'enabled'
      }, 400)
    }
  } catch (error) {
    console.error('Storage setup error:', error)
    return c.json({
      success: false,
      error: `存储设置失败: ${error instanceof Error ? error.message : String(error)}`,
      retryMechanism: 'enabled'
    }, 500)
  }
})

// 增强的存储同步端点 - 支持递归文件夹扫描和KV存储后备
app.post('/make-server-55b791b3/storage/sync', async (c) => {
  try {
    console.log('🔄 Starting enhanced storage sync with folder support...')
    
    const forceSync = c.req.query('force') === 'true'
    
    // 检查存储桶连接
    const bucketValidation = await validateBucketConnection()
    if (!bucketValidation.exists || !bucketValidation.accessible) {
      return c.json({
        success: false,
        message: `存储服务不可用: ${bucketValidation.error}`
      }, 503)
    }
    
    // 检查是否有images表
    const hasImagesTable = await checkImagesTable()
    
    // 使用递归方式获取所有文件，包括子文件夹
    console.log('📁 Scanning all directories recursively...')
    const allStorageFiles = await getAllStorageFiles()
    
    // 过滤出图片文件
    const imageFiles = allStorageFiles.filter(file => 
      file.name && 
      !file.name.endsWith('/') && 
      isImageFile(file.name, file.metadata?.mimetype)
    )
    
    console.log(`Found ${allStorageFiles.length} total files, ${imageFiles.length} are images`)
    
    // 获取现有图片记录 - 根据是否有表选择存储方式
    let existingImages: any[] = []
    
    if (hasImagesTable) {
      const { data: dbImages, error: dbError } = await supabase
        .from('images')
        .select('*')
      
      if (dbError) {
        console.error('Failed to fetch database images:', dbError)
        return c.json({
          success: false,
          message: `无法获取数据库图片记录: ${dbError.message}`
        }, 500)
      }
      
      existingImages = dbImages || []
    } else {
      // 使用KV存储
      existingImages = await getImagesFromKV()
    }
    
    const stats = {
      totalFiles: allStorageFiles.length,
      imageFiles: imageFiles.length,
      dbRecords: existingImages.length,
      synchronized: 0,
      updated: 0,
      orphanedFiles: 0,
      orphanedRecords: 0,
      errors: 0,
      directories: new Set<string>(),
      storageMethod: hasImagesTable ? 'database' : 'kv_store'
    }
    
    console.log(`Processing ${imageFiles.length} image files from storage using ${stats.storageMethod}...`)
    
    // 同步存储文件到数据库/KV存储
    for (const file of imageFiles) {
      try {
        // 记录目录信息
        if (file.directory) {
          stats.directories.add(file.directory)
        }
        
        // 构建文件路径
        const filePath = file.fullPath || file.name
        
        console.log(`Processing file: ${filePath}`)
        
        // 检查是否已有记录
        const existingRecord = existingImages.find(img => 
          img.file_path === filePath || 
          img.file_path === `uploads/${filePath}` ||
          img.filename === file.name
        )
        
        if (!existingRecord) {
          // 生成签名URL
          const { data: signedUrl, error: urlError } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(filePath, 60 * 60 * 24 * 365) // 1年有效期
          
          if (urlError) {
            console.warn(`Failed to create signed URL for ${filePath}:`, urlError.message)
            stats.errors++
            continue
          }
          
          if (signedUrl?.signedUrl) {
            // 检测文件类型
            const fileType = file.metadata?.mimetype || `image/${file.name.split('.').pop()?.toLowerCase() || 'png'}`
            
            // 创建图片记录
            const imageData = {
              id: generateUUID(),
              filename: file.name,
              file_path: filePath,
              file_url: signedUrl.signedUrl,
              file_type: fileType,
              file_size: file.metadata?.size || 0,
              alt_text: file.name.replace(/\.[^/.]+$/, ''), // 移除扩展名作为alt_text
              caption: file.directory ? `来自 ${file.directory} 目录` : '',
              uploaded_at: new Date().toISOString(),
              uploaded_by: null
            }
            
            // 保存记录 - 根据是否有表选择方式
            let saveError = null
            
            if (hasImagesTable) {
              const { error: insertError } = await supabase
                .from('images')
                .insert([imageData])
              saveError = insertError
            } else {
              try {
                await saveImageToKV(imageData)
              } catch (kvError) {
                saveError = kvError
              }
            }
            
            if (saveError) {
              console.error(`Failed to save record for ${filePath}:`, saveError)
              stats.errors++
            } else {
              console.log(`✅ Synchronized ${filePath} using ${stats.storageMethod}`)
              stats.synchronized++
            }
          }
        } else {
          // 记录存在，检查是否需要更新URL
          if (existingRecord.file_url.includes('supabase.co/storage/v1/object/sign')) {
            try {
              const url = new URL(existingRecord.file_url)
              const token = url.searchParams.get('token')
              if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]))
                const exp = payload.exp * 1000
                
                // 如果token即将过期（7天内），更新URL
                if (exp - Date.now() < 7 * 24 * 60 * 60 * 1000) {
                  const { data: newSignedUrl, error: urlError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .createSignedUrl(filePath, 60 * 60 * 24 * 365)
                  
                  if (!urlError && newSignedUrl?.signedUrl) {
                    // 更新URL - 根据存储方式
                    let updateError = null
                    
                    if (hasImagesTable) {
                      const { error } = await supabase
                        .from('images')
                        .update({ file_url: newSignedUrl.signedUrl })
                        .eq('id', existingRecord.id)
                      updateError = error
                    } else {
                      try {
                        await updateImageInKV(existingRecord.id, { file_url: newSignedUrl.signedUrl })
                      } catch (kvError) {
                        updateError = kvError
                      }
                    }
                    
                    if (!updateError) {
                      console.log(`🔄 Updated URL for ${filePath}`)
                      stats.updated++
                    }
                  }
                }
              }
            } catch (tokenError) {
              console.warn(`Failed to parse token for ${filePath}:`, tokenError)
            }
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        stats.errors++
      }
    }
    
    // 检查孤立的记录
    if (existingImages.length > 0) {
      const storageFilePaths = imageFiles.map(f => f.fullPath || f.name)
      
      for (const record of existingImages) {
        const isOrphaned = !storageFilePaths.some(path => 
          path === record.file_path || 
          `uploads/${path}` === record.file_path ||
          path.endsWith(record.filename)
        )
        
        if (isOrphaned) {
          stats.orphanedRecords++
          console.warn(`Found orphaned record: ${record.file_path}`)
        }
      }
    }
    
    // 检查孤立的存储文件
    if (existingImages.length > 0) {
      const recordPaths = existingImages.map(img => img.file_path)
      
      for (const file of imageFiles) {
        const filePath = file.fullPath || file.name
        const isOrphaned = !recordPaths.some(path => 
          path === filePath || 
          path === `uploads/${filePath}` ||
          path.endsWith(file.name)
        )
        
        if (isOrphaned) {
          stats.orphanedFiles++
          console.warn(`Found orphaned storage file: ${filePath}`)
        }
      }
    }
    
    const directoryList = Array.from(stats.directories)
    console.log('Storage sync completed:', { ...stats, directories: directoryList })
    
    return c.json({
      success: true,
      message: `存储同步完成: 同步 ${stats.synchronized} 个新文件，更新 ${stats.updated} 个URL，发现 ${stats.orphanedFiles} 个孤立文件，${stats.orphanedRecords} 个孤立记录 (使用${stats.storageMethod})`,
      stats: {
        ...stats,
        directories: directoryList
      },
      results: {
        totalFiles: stats.totalFiles,
        imageFiles: stats.imageFiles,
        synchronized: stats.synchronized,
        updated: stats.updated,
        orphanedFiles: stats.orphanedFiles,
        orphanedRecords: stats.orphanedRecords,
        errors: stats.errors,
        directoriesFound: directoryList,
        storageMethod: stats.storageMethod
      }
    })
    
  } catch (error) {
    console.error('Storage sync error:', error)
    return c.json({
      success: false,
      message: `存储同步失败: ${error instanceof Error ? error.message : String(error)}`
    }, 500)
  }
})

// 存储清理端点 - 支持KV存储后备
app.post('/make-server-55b791b3/images/cleanup', async (c) => {
  try {
    console.log('🧹 Starting image cleanup...')
    
    // 检查存储桶连接
    const bucketValidation = await validateBucketConnection()
    if (!bucketValidation.exists || !bucketValidation.accessible) {
      return c.json({
        success: false,
        message: `存储服务不可用: ${bucketValidation.error}`
      }, 503)
    }
    
    // 检查数据库表
    const hasImagesTable = await checkImagesTable()
    
    // 获取所有图片记录 - 根据存储方式选择
    let allImageRecords: any[] = []
    
    if (hasImagesTable) {
      const { data: dbImages, error: dbError } = await supabase
        .from('images')
        .select('*')
      
      if (dbError) {
        console.error('Failed to fetch database images:', dbError)
        return c.json({
          success: false,
          message: `无法获取数据库图片记录: ${dbError.message}`
        }, 500)
      }
      
      allImageRecords = dbImages || []
    } else {
      // 使用KV存储
      allImageRecords = await getImagesFromKV()
    }
    
    const stats = {
      total: allImageRecords.length,
      updated: 0,
      removed: 0,
      errors: 0,
      storageMethod: hasImagesTable ? 'database' : 'kv_store'
    }
    
    console.log(`Found ${stats.total} image records to cleanup using ${stats.storageMethod}`)
    
    if (allImageRecords.length > 0) {
      for (const image of allImageRecords) {
        try {
          // 检查存储文件是否存在
          const { data: fileExists, error: checkError } = await supabase.storage
            .from(BUCKET_NAME)
            .list('', { 
              limit: 1,
              search: image.file_path.replace('uploads/', '')
            })
          
          if (checkError) {
            console.warn(`Failed to check file existence for ${image.file_path}:`, checkError.message)
            stats.errors++
            continue
          }
          
          if (!fileExists || fileExists.length === 0) {
            // 文件不存在，删除记录
            try {
              if (hasImagesTable) {
                const { error: deleteError } = await supabase
                  .from('images')
                  .delete()
                  .eq('id', image.id)
                if (deleteError) throw deleteError
              } else {
                await deleteImageFromKV(image.id)
              }
              
              console.log(`🗑️ Removed orphaned record: ${image.file_path}`)
              stats.removed++
            } catch (deleteError) {
              console.error(`Failed to delete orphaned record ${image.id}:`, deleteError)
              stats.errors++
            }
          } else {
            // 文件存在，检查并更新签名URL
            const isExpired = image.file_url.includes('supabase.co/storage/v1/object/sign')
            
            if (isExpired) {
              try {
                const url = new URL(image.file_url)
                const token = url.searchParams.get('token')
                if (token) {
                  const payload = JSON.parse(atob(token.split('.')[1]))
                  const exp = payload.exp * 1000
                  
                  // 如果token即将过期（24小时内），更新URL
                  if (exp - Date.now() < 24 * 60 * 60 * 1000) {
                    const { data: newSignedUrl, error: urlError } = await supabase.storage
                      .from(BUCKET_NAME)
                      .createSignedUrl(image.file_path, 60 * 60 * 24 * 365) // 1年有效期
                    
                    if (urlError) {
                      console.warn(`Failed to update signed URL for ${image.file_path}:`, urlError.message)
                      stats.errors++
                    } else if (newSignedUrl?.signedUrl) {
                      try {
                        if (hasImagesTable) {
                          const { error: updateError } = await supabase
                            .from('images')
                            .update({ file_url: newSignedUrl.signedUrl })
                            .eq('id', image.id)
                          if (updateError) throw updateError
                        } else {
                          await updateImageInKV(image.id, { file_url: newSignedUrl.signedUrl })
                        }
                        
                        console.log(`🔄 Updated signed URL for: ${image.file_path}`)
                        stats.updated++
                      } catch (updateError) {
                        console.error(`Failed to update URL for ${image.id}:`, updateError)
                        stats.errors++
                      }
                    }
                  }
                }
              } catch (tokenError) {
                console.warn(`Failed to parse token for ${image.file_path}:`, tokenError)
                stats.errors++
              }
            }
          }
        } catch (error) {
          console.error(`Error processing image ${image.id}:`, error)
          stats.errors++
        }
      }
    }
    
    console.log('Image cleanup completed:', stats)
    
    return c.json({
      success: true,
      message: `图片清理完成: 更新 ${stats.updated} 个URL，移除 ${stats.removed} 个孤立记录，处理 ${stats.total} 个总记录 (使用${stats.storageMethod})`,
      stats,
      results: {
        total: stats.total,
        updated: stats.updated,
        removed: stats.removed,
        errors: stats.errors,
        storageMethod: stats.storageMethod
      }
    })
    
  } catch (error) {
    console.error('Image cleanup error:', error)
    return c.json({
      success: false,
      message: `图片清理失败: ${error instanceof Error ? error.message : String(error)}`
    }, 500)
  }
})

// 图片URL修复端点
app.post('/make-server-55b791b3/images/fix-all-urls', async (c) => {
  try {
    console.log('🔧 Fixing all image URLs...')
    
    // 检查存储桶连接
    const bucketValidation = await validateBucketConnection()
    if (!bucketValidation.exists || !bucketValidation.accessible) {
      return c.json({
        success: false,
        error: `存储服务不可用: ${bucketValidation.error}`
      }, 503)
    }
    
    // 获取所有存储桶中的文件
    const allFiles = await getAllStorageFiles()
    const imageFiles = allFiles.filter(file => 
      file.name && 
      !file.name.endsWith('/') && 
      isImageFile(file.name, file.metadata?.mimetype)
    )
    
    if (imageFiles.length === 0) {
      return c.json({
        success: true,
        stats: {
          total: 0,
          fixed: 0,
          failed: 0,
          skipped: 0
        },
        message: '没有找到需要修复的图片'
      })
    }
    
    const stats = {
      total: imageFiles.length,
      fixed: 0,
      failed: 0,
      skipped: 0
    }
    
    console.log(`Found ${imageFiles.length} image files to process`)
    
    // 为每个文件生成新的签名URL
    for (const file of imageFiles) {
      try {
        const filePath = file.fullPath || file.name
        
        const { data: signedUrl, error: urlError } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(filePath, 60 * 60 * 24 * 365) // 1年有效期
        
        if (urlError) {
          console.warn(`Failed to create signed URL for ${filePath}:`, urlError.message)
          stats.failed++
        } else if (signedUrl?.signedUrl) {
          console.log(`✅ Generated new signed URL for ${filePath}`)
          stats.fixed++
        } else {
          stats.skipped++
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        stats.failed++
      }
    }
    
    console.log('URL fix completed:', stats)
    
    return c.json({
      success: true,
      stats,
      message: `URL修复完成: 修复 ${stats.fixed} 张，失败 ${stats.failed} 张，跳过 ${stats.skipped} 张`
    })
    
  } catch (error) {
    console.error('Image URL fix error:', error)
    return c.json({
      success: false,
      error: `URL修复失败: ${error instanceof Error ? error.message : String(error)}`
    }, 500)
  }
})

// 用户注册端点
app.post('/make-server-55b791b3/auth/signup', async (c) => {
  try {
    console.log('👤 User signup requested...')
    
    const body = await c.req.json()
    console.log('Signup request:', { email: body.email, name: body.name })
    
    if (!body.email || !body.password || !body.name) {
      return c.json({ 
        success: false, 
        error: 'Email, password, and name are required' 
      }, 400)
    }
    
    if (body.password.length < 6) {
      return c.json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      }, 400)
    }
    
    // 验证邮箱白名单 - 仅允许特定管理员邮箱注册
    if (body.email !== 'chenyujian93@gmail.com') {
      console.log(`❌ Signup blocked for unauthorized email: ${body.email}`)
      return c.json({ 
        success: false, 
        error: 'Unauthorized: Only the authorized administrator can register an account' 
      }, 403)
    }
    
    // 创建新用户
    const { data, error } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      user_metadata: { 
        name: body.name,
        role: 'admin' // 标记为管理员
      },
      // 自动确认邮箱，因为没有配置邮件服务器
      email_confirm: true
    })
    
    if (error) {
      console.error('❌ Signup error:', error)
      return c.json({ 
        success: false, 
        error: error.message || '用户注册失败' 
      }, 400)
    }
    
    console.log('✅ Authorized admin user created successfully:', data.user?.email)
    
    return c.json({
      success: true,
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          name: data.user?.user_metadata?.name
        }
      },
      message: 'Authorized admin user created successfully'
    })
    
  } catch (error) {
    console.error('Signup error:', error)
    return c.json({ 
      success: false, 
      error: `Signup failed: ${error instanceof Error ? error.message : String(error)}` 
    }, 500)
  }
})

// 内容管理API路由
app.get('/make-server-55b791b3/content/:type', async (c) => {
  try {
    const { type } = c.req.param()
    const language = c.req.query('language') || 'zh'
    const category = c.req.query('category')
    
    console.log(`Getting content: type=${type}, language=${language}, category=${category}`)
    
    const hasLanguage = await checkLanguageColumn()
    
    let query = supabase.from('content').select('*').eq('type', type)
    
    if (hasLanguage) {
      query = query.eq('language', language)
    }
    
    if (category) {
      query = query.eq('category', category)
    }
    
    query = query.order('created_at', { ascending: false })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Content fetch error:', error)
      return c.json({ error: error.message }, 400)
    }
    
    console.log(`Retrieved ${data?.length || 0} content items`)
    
    // 前端排序：支持小数点数字排序
    if (data && data.length > 0) {
      data.sort((a, b) => {
        const aOrder = parseFloat(a.data?.order) || 0
        const bOrder = parseFloat(b.data?.order) || 0
        
        // 如果都有编号，按编号倒序排序（数字大的在前面）
        if (aOrder > 0 && bOrder > 0) {
          return bOrder - aOrder
        }
        
        // 如果只有一个有编号，有编号的在前
        if (aOrder > 0 && bOrder === 0) return -1
        if (aOrder === 0 && bOrder > 0) return 1
        
        // 都没有编号，按创建时间排序（最新的在前）
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    }
    
    return c.json(data || [])
  } catch (error) {
    console.error('Content get error:', error)
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500)
  }
})

// 创建内容
app.post('/make-server-55b791b3/content', async (c) => {
  try {
    console.log('📝 Creating new content...')
    
    const body = await c.req.json()
    console.log('Content creation request:', JSON.stringify(body, null, 2))
    
    if (!body.type) {
      return c.json({ 
        success: false, 
        error: 'Content type is required' 
      }, 400)
    }
    
    if (!body.title) {
      return c.json({ 
        success: false, 
        error: 'Content title is required' 
      }, 400)
    }
    
    const hasLanguage = await checkLanguageColumn()
    
    const contentData: any = {
      id: generateUUID(),
      type: body.type,
      title: body.title,
      data: body.data || {},
      is_published: body.is_published ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    if (hasLanguage) {
      contentData.language = body.language || 'zh'
    }
    
    if (body.category) {
      contentData.category = body.category
    }
    
    const authResult = await getOptionalAuthenticatedUser(c.req.raw)
    if (authResult.isAuthenticated && authResult.user) {
      contentData.created_by = authResult.user.id
    }
    
    console.log('Inserting content:', contentData)
    
    const { data, error } = await supabase
      .from('content')
      .insert([contentData])
      .select()
      .single()
    
    if (error) {
      console.error('Content creation error:', error)
      return c.json({ 
        success: false, 
        error: `Failed to create content: ${error.message}` 
      }, 400)
    }
    
    console.log('✅ Content created successfully:', data.id)
    
    return c.json({
      success: true,
      data: data,
      message: 'Content created successfully'
    })
    
  } catch (error) {
    console.error('Content creation error:', error)
    return c.json({ 
      success: false, 
      error: `Content creation failed: ${error instanceof Error ? error.message : String(error)}` 
    }, 500)
  }
})

// 更新内容
app.put('/make-server-55b791b3/content/:id', async (c) => {
  try {
    const { id } = c.req.param()
    console.log(`📝 Updating content: ${id}`)
    
    const body = await c.req.json()
    console.log('Content update request:', JSON.stringify(body, null, 2))
    
    const hasLanguage = await checkLanguageColumn()
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.data !== undefined) updateData.data = body.data
    if (body.is_published !== undefined) updateData.is_published = body.is_published
    if (body.category !== undefined) updateData.category = body.category
    
    if (hasLanguage && body.language !== undefined) {
      updateData.language = body.language
    }
    
    console.log('Updating content with data:', updateData)
    
    const { data, error } = await supabase
      .from('content')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Content update error:', error)
      return c.json({ 
        success: false, 
        error: `Failed to update content: ${error.message}` 
      }, 400)
    }
    
    if (!data) {
      return c.json({ 
        success: false, 
        error: 'Content not found' 
      }, 404)
    }
    
    console.log('✅ Content updated successfully:', data.id)
    
    return c.json({
      success: true,
      data: data,
      message: 'Content updated successfully'
    })
    
  } catch (error) {
    console.error('Content update error:', error)
    return c.json({ 
      success: false, 
      error: `Content update failed: ${error instanceof Error ? error.message : String(error)}` 
    }, 500)
  }
})

// 删除内容
app.delete('/make-server-55b791b3/content/:id', async (c) => {
  try {
    const { id } = c.req.param()
    console.log(`🗑️ Deleting content: ${id}`)
    
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Content deletion error:', error)
      return c.json({ 
        success: false, 
        error: `Failed to delete content: ${error.message}` 
      }, 400)
    }
    
    console.log('✅ Content deleted successfully:', id)
    
    return c.json({
      success: true,
      message: 'Content deleted successfully'
    })
    
  } catch (error) {
    console.error('Content deletion error:', error)
    return c.json({ 
      success: false, 
      error: `Content deletion failed: ${error instanceof Error ? error.message : String(error)}` 
    }, 500)
  }
})

// 图片上传端点 - 支持KV存储后备
app.post('/make-server-55b791b3/upload-image', async (c) => {
  try {
    console.log('📸 Image upload requested...')
    
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ 
        success: false, 
        error: 'No file provided' 
      }, 400)
    }
    
    console.log(`📁 Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`)
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return c.json({ 
        success: false, 
        error: 'File must be an image' 
      }, 400)
    }
    
    // 验证文件大小
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ 
        success: false, 
        error: 'File size must be less than 10MB' 
      }, 400)
    }
    
    // 检查存储桶连接
    const bucketValidation = await validateBucketConnection()
    if (!bucketValidation.exists || !bucketValidation.accessible) {
      return c.json({
        success: false,
        error: `存储服务不可用: ${bucketValidation.error}`
      }, 503)
    }
    
    // 生成文件名
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'png'
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `uploads/${fileName}`
    
    console.log(`📤 Uploading to path: ${filePath}`)
    
    // 获取文件数据
    const fileBuffer = await file.arrayBuffer()
    
    try {
      // 使用重试机制上传文件
      const uploadResult = await withRetry(
        async () => {
          const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, fileBuffer, {
              contentType: file.type,
              upsert: false
            })
          
          if (error) {
            if (isHtmlResponse(error)) {
              throw new Error('Storage upload returned HTML response')
            }
            throw error
          }
          
          return data
        },
        3, // maxRetries
        2000, // delayMs
        'fileUpload'
      )
      
      console.log('✅ File uploaded successfully:', uploadResult.path)
      
      // 生成签名URL
      const signedUrlResult = await withRetry(
        async () => {
          const { data: signedUrl, error: urlError } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(filePath, 60 * 60 * 24 * 365) // 1年有效期
          
          if (urlError) {
            if (isHtmlResponse(urlError)) {
              throw new Error('Signed URL generation returned HTML response')
            }
            throw urlError
          }
          
          return signedUrl
        },
        3, // maxRetries
        1500, // delayMs
        'signedUrlGeneration'
      )
      
      if (!signedUrlResult?.signedUrl) {
        throw new Error('Failed to generate signed URL')
      }
      
      console.log('✅ Signed URL generated successfully')
      
      // 获取alt_text和caption
      const altText = formData.get('alt_text') as string || file.name
      const caption = formData.get('caption') as string || ''
      
      // 创建图片记录
      const imageData = {
        id: generateUUID(),
        filename: file.name,
        file_path: filePath,
        file_url: signedUrlResult.signedUrl,
        file_type: file.type,
        file_size: file.size,
        alt_text: altText,
        caption: caption,
        uploaded_at: new Date().toISOString(),
        uploaded_by: null
      }
      
      console.log('💾 Saving image record...')
      
      // 检查是否有images表
      const hasImagesTable = await checkImagesTable()
      let dbResult: any
      
      if (hasImagesTable) {
        // 保存到数据库使用重试机制
        dbResult = await withRetry(
          async () => {
            const { data: dbData, error: dbError } = await supabase
              .from('images')
              .insert([imageData])
              .select()
              .single()
            
            if (dbError) {
              throw dbError
            }
            
            return dbData
          },
          3, // maxRetries
          1000, // delayMs
          'databaseInsert'
        )
        
        console.log('✅ Image record saved to database:', dbResult.id)
      } else {
        // 使用KV存储作为后备
        dbResult = await saveImageToKV(imageData)
        console.log('✅ Image record saved to KV store:', dbResult.id)
      }
      
      return c.json({
        success: true,
        data: dbResult,
        message: 'Image uploaded successfully',
        storageMethod: hasImagesTable ? 'database' : 'kv_store'
      })
      
    } catch (uploadError) {
      if (isHtmlResponse(uploadError)) {
        console.error('❌ Upload consistently failed with HTML responses:', uploadError)
        return c.json({
          success: false,
          error: '存储服务暂时不可用，请稍后重试'
        }, 503)
      }
      
      console.error('❌ Upload error:', uploadError)
      return c.json({
        success: false,
        error: `Upload failed: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`
      }, 500)
    }
    
  } catch (error) {
    console.error('💥 Image upload error:', error)
    return c.json({
      success: false,
      error: `Image upload failed: ${error instanceof Error ? error.message : String(error)}`
    }, 500)
  }
})

// 获取图片列表 - 支持KV存储后备
app.get('/make-server-55b791b3/images', async (c) => {
  try {
    console.log('📋 Getting images list...')
    
    const hasImagesTable = await checkImagesTable()
    let images: any[] = []
    
    if (hasImagesTable) {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('uploaded_at', { ascending: false })
      
      if (error) {
        console.error('Images fetch error:', error)
        return c.json({ error: error.message }, 400)
      }
      
      images = data || []
    } else {
      // 使用KV存储
      images = await getImagesFromKV()
      // 按上传时间排序
      images.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
    }
    
    console.log(`✅ Retrieved ${images.length} images using ${hasImagesTable ? 'database' : 'KV store'}`)
    return c.json(images)
  } catch (error) {
    console.error('Images get error:', error)
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 500)
  }
})

// 删除图片 - 支持KV存储后备
app.delete('/make-server-55b791b3/images/:id', async (c) => {
  try {
    const { id } = c.req.param()
    console.log(`🗑️ Deleting image: ${id}`)
    
    const hasImagesTable = await checkImagesTable()
    let imageData: any = null
    
    // 获取图片信息
    if (hasImagesTable) {
      const { data, error: fetchError } = await supabase
        .from('images')
        .select('*')
        .eq('id', id)
        .single()
      
      if (fetchError || !data) {
        return c.json({ 
          success: false, 
          error: 'Image not found' 
        }, 404)
      }
      
      imageData = data
    } else {
      // 从KV存储获取
      try {
        imageData = await kv.get(`image:${id}`)
        if (!imageData) {
          return c.json({ 
            success: false, 
            error: 'Image not found in KV store' 
          }, 404)
        }
      } catch (kvError) {
        return c.json({ 
          success: false, 
          error: 'Image not found' 
        }, 404)
      }
    }
    
    // 从存储中删除文件
    try {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([imageData.file_path])
      
      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError.message)
        // 继续删除数据库记录，即使存储删除失败
      }
    } catch (storageError) {
      console.warn('Storage deletion failed:', storageError)
      // 继续删除数据库记录
    }
    
    // 删除记录
    try {
      if (hasImagesTable) {
        const { error: dbError } = await supabase
          .from('images')
          .delete()
          .eq('id', id)
        
        if (dbError) {
          throw dbError
        }
      } else {
        await deleteImageFromKV(id)
      }
      
      console.log('✅ Image deleted successfully:', id)
      
      return c.json({
        success: true,
        message: 'Image deleted successfully',
        storageMethod: hasImagesTable ? 'database' : 'kv_store'
      })
    } catch (deleteError) {
      console.error('Record deletion error:', deleteError)
      return c.json({ 
        success: false, 
        error: `Failed to delete image record: ${deleteError instanceof Error ? deleteError.message : String(deleteError)}` 
      }, 400)
    }
    
  } catch (error) {
    console.error('Image deletion error:', error)
    return c.json({ 
      success: false, 
      error: `Image deletion failed: ${error instanceof Error ? error.message : String(error)}` 
    }, 500)
  }
})

// 更新图片 - 支持KV存储后备
app.put('/make-server-55b791b3/images/:id', async (c) => {
  try {
    const { id } = c.req.param()
    console.log(`✏️ Updating image: ${id}`)
    
    const body = await c.req.json()
    const hasImagesTable = await checkImagesTable()
    
    const updateData: any = {}
    if (body.alt_text !== undefined) updateData.alt_text = body.alt_text
    if (body.caption !== undefined) updateData.caption = body.caption
    if (body.filename !== undefined) updateData.filename = body.filename
    
    let result: any = null
    
    if (hasImagesTable) {
      const { data, error } = await supabase
        .from('images')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Image update error:', error)
        return c.json({ 
          success: false, 
          error: `Failed to update image: ${error.message}` 
        }, 400)
      }
      
      if (!data) {
        return c.json({ 
          success: false, 
          error: 'Image not found' 
        }, 404)
      }
      
      result = data
    } else {
      // 使用KV存储
      try {
        result = await updateImageInKV(id, updateData)
      } catch (kvError) {
        console.error('KV update error:', kvError)
        return c.json({ 
          success: false, 
          error: `Failed to update image: ${kvError instanceof Error ? kvError.message : String(kvError)}` 
        }, 400)
      }
    }
    
    console.log('✅ Image updated successfully:', result.id)
    
    return c.json({
      success: true,
      data: result,
      message: 'Image updated successfully',
      storageMethod: hasImagesTable ? 'database' : 'kv_store'
    })
    
  } catch (error) {
    console.error('Image update error:', error)
    return c.json({ 
      success: false, 
      error: `Image update failed: ${error instanceof Error ? error.message : String(error)}` 
    }, 500)
  }
})

// 处理未找到的路由
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      '/make-server-55b791b3/health',
      '/make-server-55b791b3/url-metadata',
      '/make-server-55b791b3/storage/sync',
      '/make-server-55b791b3/images/cleanup',
      '/make-server-55b791b3/content',
      '/make-server-55b791b3/images',
      '/make-server-55b791b3/upload-image'
    ]
  }, 404)
})

// 全局错误处理
app.onError((error, c) => {
  console.error('💥 Global error in server:', error)
  
  return c.json({
    success: false,
    error: 'Internal server error',
    message: error instanceof Error ? error.message : String(error)
  }, 500)
})

// 启动服务器
Deno.serve(app.fetch)