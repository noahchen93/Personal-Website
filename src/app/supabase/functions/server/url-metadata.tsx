import { Hono } from 'jsr:@hono/hono'
import { cors } from 'jsr:@hono/hono/cors'

const app = new Hono()

// CORS配置
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  credentials: false
}))

// 响应头设置中间件
app.use('*', async (c, next) => {
  c.header('Content-Type', 'application/json; charset=UTF-8')
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate')
  c.header('Pragma', 'no-cache')
  c.header('Expires', '0')
  await next()
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
      console.log(`❌ Invalid URL format: ${url}`)
      return c.json({
        success: false,
        error: 'Invalid URL format'
      }, 400)
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
        console.log(`❌ HTTP error: ${response.status} for URL: ${url}`)
        return c.json({
          success: false,
          error: `HTTP ${response.status}: Failed to fetch URL`
        }, 400)
      }
      
      // 检查内容类型
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('text/html')) {
        console.log(`⚠️ Non-HTML content type: ${contentType} for URL: ${url}`)
        return c.json({
          success: true,
          data: {
            title: validUrl.hostname,
            description: 'Non-HTML content',
            url: url,
            image: null,
            favicon: `${validUrl.protocol}//${validUrl.hostname}/favicon.ico`
          }
        })
      }
      
      // 读取HTML内容
      const html = await response.text()
      
      // 解析元数据
      const metadata = await parseMetadata(html, validUrl)
      
      console.log(`✅ Successfully fetched metadata for: ${url}`)
      console.log(`📋 Title: ${metadata.title}`)
      console.log(`📝 Description: ${metadata.description?.substring(0, 100)}...`)
      
      return c.json({
        success: true,
        data: metadata
      })
      
    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          console.log(`⏰ Request timeout for URL: ${url}`)
          return c.json({
            success: false,
            error: 'Request timeout'
          }, 408)
        }
        
        console.log(`❌ Fetch error for URL ${url}: ${fetchError.message}`)
        return c.json({
          success: false,
          error: `Failed to fetch URL: ${fetchError.message}`
        }, 500)
      }
      
      console.log(`❌ Unknown fetch error for URL: ${url}`)
      return c.json({
        success: false,
        error: 'Unknown fetch error'
      }, 500)
    }
    
  } catch (error) {
    console.error('💥 URL metadata endpoint error:', error)
    
    // 确保返回有效的JSON响应
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, 500)
  }
})

// 元数据解析函数
async function parseMetadata(html: string, baseUrl: URL) {
  const metadata = {
    title: '',
    description: '',
    url: baseUrl.toString(),
    image: null as string | null,
    favicon: null as string | null
  }
  
  // 使用正则表达式解析HTML（简化版本）
  try {
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
    metadata.title = cleanText(metadata.title)
    metadata.description = cleanText(metadata.description)
    
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

// 文本清理函数
function cleanText(text: string): string {
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
app.get('/make-server-55b791b3/url-metadata/health', async (c) => {
  try {
    return c.json({
      status: 'healthy',
      service: 'url-metadata',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    })
  } catch (error) {
    return c.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// 处理未找到的路由
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint not found'
  }, 404)
})

// 全局错误处理
app.onError((error, c) => {
  console.error('💥 Global error in url-metadata service:', error)
  
  return c.json({
    success: false,
    error: 'Internal server error'
  }, 500)
})

// 启动服务器
Deno.serve(app.fetch)