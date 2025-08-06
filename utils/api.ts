import { projectId, publicAnonKey } from './supabase/info';

// API configuration - disabled by default for offline-first operation
const ENABLE_API_CALLS = false; // Set to false for offline-first operation
const API_TIMEOUT = 5000;
const RETRY_ATTEMPTS = 1;
const HEALTH_CHECK_INTERVAL = 300000; // Much less frequent health checks (5 minutes)

// Default data for complete offline functionality - Noah Chen's Curatorial Portfolio
const getStaticData = (section: string, language: string) => {
  const staticContent = {
    zh: {
      home: {
        name: "Noah Chen",
        title: "双语策展人 & 创意制作人", 
        description: "拥有 7 年以上亚洲地区展览及公共艺术领域经验。致力于塑造连接人、场所与目的的共享体验，通过跨学科合作打造开放、参与性强且具有情境意义的展览。",
        skills: ["公共艺术策展", "跨学科合作", "空间设计", "项目管理", "国际艺术家联络", "商业艺术空间运营"],
        highlights: ["策划超过20个大型展览项目", "与世界级艺术家合作", "沉浸式体验设计专家", "Context Engineering 方法论"],
        socialLinks: {
          email: "noah.chen@curator.com",
          linkedin: "https://linkedin.com/in/noah-chen-curator",
          website: "https://noahchen-curator.com"
        },
        contactInfo: {
          location: "亚洲地区",
          email: "noah.chen@curator.com",
          phone: "+86 138 0013 8000"
        }
      },
      about: {
        bio: "双语策展人及创意制作人，拥有 7 年以上亚洲地区展览及公共艺术领域经验。",
        curatorialPhilosophy: "认为策展不仅是艺术品的选择，更是塑造连接人、场所与目的的共享体验。实践植根于公共艺术，主张艺术超越画廊边界，融入日常生活对话。",
        specialties: [
          "公共艺术策展",
          "跨学科合作", 
          "空间设计",
          "项目管理",
          "国际艺术家联络",
          "商业艺术空间运营"
        ],
        achievements: [
          "策划超过20个大型展览项目",
          "管理总预算超过千万人民币的国际展览",
          "与Marina Abramović、Yoko Ono等世界级艺术家合作",
          "成功打造多个沉浸式艺术体验空间"
        ],
        personalInfo: {
          experience: "7年以上",
          location: "亚洲地区",
          languages: ["中文", "English"]
        }
      },
      education: [
        {
          id: 1,
          institution: "知名艺术学院",
          degree: "策展研究硕士",
          field: "当代艺术策展",
          startDate: "2015-09",
          endDate: "2017-06",
          description: "专注于当代艺术策展理论与实践，公共艺术项目研究。",
          gpa: "优秀",
          honors: ["优秀毕业论文", "策展实践奖", "国际交流项目参与者"],
          coursework: ["策展理论", "公共艺术", "跨文化艺术交流", "项目管理"]
        }
      ],
      experience: [
        {
          id: 1,
          title: "Context Engineering 方法论",
          description: "受AI语境管理启发，将项目从静态计划转化为动态智能生态系统",
          keyPoints: [
            "动态场景构建: 超越碎片化邮件与文档，将每个项目视为活场景，通过整合客户需求、历史数据、实时变化等所有输入形成连贯语境。",
            "智能策略增强: 不依赖单一经验，利用过去成功案例的向量知识库，将整个项目档案转化为智能战略顾问，实现经证实的最佳实践规模化应用。",
            "主动风险预警系统: 从被动解决问题转向主动预防，融合内部项目数据与实时外部信息，系统作为24/7风险哨兵，在潜在威胁升级前识别并推荐应急计划。"
          ],
          icon: "zap",
          category: "methodology"
        },
        {
          id: 2,
          title: "项目执行要点",
          description: "项目执行过程中的关键要点与最佳实践",
          keyPoints: [
            "供应商管理: 确保供应商理解与我方一致，其提供的产品或服务符合要求。",
            "反复确认: 在供应商与客户/甲方之间确认交付结果；提前索要样品与图纸；尽早沟通。",
            "项目负责人了解现场: 项目负责人必须深入理解项目现场或产品，核心需求不得委托他人。"
          ],
          icon: "target",
          category: "execution"
        },
        {
          id: 3,
          title: "团队协作精神",
          description: "建立高效团队协作机制，提升项目执行效率",
          keyPoints: [
            "明确分工: 项目初期明确每位成员的职责与任务，确保所有人了解工作内容与目标。",
            "建立机制: 建立定期会议与沟通机制，及时解决项目中的问题，确保进度与质量。",
            "培养精神: 鼓励团队成员相互支持与学习，形成良好氛围，提高协作效率。"
          ],
          icon: "users",
          category: "collaboration"
        }
      ],
      projects: [
        {
          id: 1,
          title: "Assemble",
          date: "2018.5.27-8.25",
          location: "中国沈阳 K11",
          role: "助理策展人",
          description: "东北三省艺术家30年作品回顾展",
          coreContent: "东北三省艺术家 30 年作品回顾展，含 70+ 件作品。负责艺术家联络、档案研究及策展内容开发，奠定大型区域策展（商业艺术语境下）基础。",
          category: "群展",
          featured: true,
          status: "completed",
          artworkCount: "70+",
          achievements: [
            "首次大型区域艺术家回顾展",
            "建立完整艺术家档案系统",
            "商业与艺术平衡的成功案例"
          ]
        },
        {
          id: 2,
          title: "Unnamed Artists Office - 王欣个展",
          date: "2018.9-12",
          location: "中国沈阳 K11",
          role: "助理策展人",
          description: "概念艺术家王欣虚构艺术家公司模型探索机构批判",
          coreContent: "概念艺术家王欣通过虚构 艺术家公司 模型探索机构批判的个展。协调装置搭建、跨部门合作，支持解读性内容设计，挑战零售展览场景下艺术、商业与观众认知的边界。",
          category: "个展",
          featured: false,
          status: "completed",
          artists: ["王欣 Wang Xin"],
          achievements: [
            "成功挑战商业空间艺术边界",
            "创新解读内容设计"
          ]
        },
        {
          id: 3,
          title: "3cm Museum（3厘米博物馆）",
          date: "2019.3-4",
          location: "中国沈阳 K11",
          role: "助理策展人",
          description: "探索尺度、感知与人类好奇心关系的主题展览",
          coreContent: "主题展览，所有作品不超过 3cm，探索尺度、感知与人类好奇心的关系，含多位国际艺术家作品，分设体验区挑战传统空间与艺术观念。支持展览布局规划、艺术家协调及公众参与项目。",
          category: "群展",
          featured: true,
          status: "completed",
          artists: ["多位国际艺术家"],
          achievements: [
            "突破性的尺度概念展览",
            "国际艺术家合作经验",
            "创新公众参与模式"
          ]
        },
        {
          id: 4,
          title: "LOVE LOVE LOVE",
          date: "2019.5-8",
          location: "中国沈阳 K11",
          role: "助理策展人",
          description: "沉浸式影像展探索爱的多维度",
          coreContent: "沉浸式影像展，探索爱的多维度，含 Marina Abramović、Yoko Ono、Tracey Emin、杨福东等艺术家作品，从情感、政治、诗意层面构建叙事。支持策展开发、安装物流管理及跨部门执行协调。",
          category: "群展",
          featured: true,
          status: "completed",
          artists: ["Marina Abramović", "Yoko Ono", "Tracey Emin", "杨福东 Yang Fudong"],
          achievements: [
            "与世界级艺术家合作",
            "沉浸式展览设计创新",
            "跨部门协调管理经验"
          ]
        },
        {
          id: 5,
          title: "(re)connect",
          date: "2019.9.21-12.25",
          location: "中国沈阳 K11",
          role: "策展人 & 项目负责人",
          description: "与设计集体Numen/For Use合作的沉浸式装置展",
          coreContent: "与设计集体 Numen/For Use 合作的沉浸式装置展，通过大型参与式结构探索连接、张力与身体感知。主导策展概念、空间设计及访客流线策略，将展览转化为鼓励观众移动、玩耍与反思的触觉旅程，标志策展实践从静态展示转向体验导向。",
          category: "公共艺术",
          featured: true,
          status: "completed",
          collaborators: ["Numen/For Use"],
          achievements: [
            "首次独立策展项目",
            "体验导向策展理念突破",
            "国际设计团队合作"
          ]
        },
        {
          id: 6,
          title: "Florentijn Hofman 个展 Celebrating（欢聚！共享喜悦）",
          date: "2023.7-10",
          location: "中国上海宝龙美术馆",
          role: "策展人 & 项目经理",
          description: "国际知名艺术家大型个展",
          coreContent: "国际知名艺术家 Florentijn Hofman 大型个展，含系列大型沉浸式雕塑，从概念到执行全程主导。与艺术家直接合作主导展览策展愿景（从概念到作品选择及空间设计）；全面管理项目，监督总预算、所有合同及利益相关者沟通；主导巨型雕塑的复杂技术安装与撤展，确保安全与质量标准。",
          category: "个展",
          featured: true,
          status: "completed",
          artists: ["Florentijn Hofman"],
          achievements: [
            "独立主导国际艺术家大展",
            "复杂大型装置技术管理",
            "全面项目预算与合同管理"
          ]
        },
        {
          id: 7,
          title: "Craig & Karl 个展 INSIDE OUT",
          date: "2024.3-5",
          location: "北京时代美术馆",
          role: "策展人 & 项目经理",
          description: "艺术二人组大型个展",
          coreContent: "艺术二人组 Craig & Karl 的大型个展，为 2000 平方米空间全新设计，含 100+ 件作品（含多项全球首展）及定制互动迷你高尔夫球场。策划 2000 平方米沉浸式体验，融入可玩迷你高尔夫球场提升观众互动；指导大型展览全制作周期，管理 100+ 件艺术品及多个装置的物流；推动 Craig & Karl 新作品全球首展，撰写所有核心策展文本。",
          category: "个展",
          featured: true,
          status: "completed",
          artists: ["Craig & Karl"],
          artworkCount: "100+",
          achievements: [
            "2000平方米大型展览空间设计",
            "创新互动体验设计（迷你高尔夫）",
            "全球首展作品策划"
          ]
        },
        {
          id: 8,
          title: "线上展览 Bare Screen（赤屏）",
          date: "2020.9-2021.12",
          location: "红星美龙艺术中心",
          role: "联合策展人 & 项目经理",
          description: "为期一年的线上展览系列",
          coreContent: "为期一年的线上展览系列，每月推出数字影像委托作品，探索纯数字形式的当代艺术实践，促进批判性线上discourse。联合主导 12 个月数字委托系列的策展愿景、研究与筛选；管理从概念到最终线上发布的所有合同、预算及制作时间线；撰写数字展览平台的所有核心策展文本及艺术家访谈。",
          category: "线上展览",
          featured: true,
          status: "completed",
          achievements: [
            "创新数字展览形式",
            "12个月连续项目管理",
            "数字艺术策展理论探索"
          ]
        }
      ],
      interests: [
        {
          id: 1,
          category: "策展研究",
          title: "公共艺术理论",
          description: "深入研究公共艺术与社会空间的关系，探索艺术如何介入日常生活并产生社会影响。",
          images: [],
          links: [
            { type: "blog", url: "https://blog.example.com", label: "策展思考博客" }
          ],
          tags: ["公共艺术", "社会介入", "空间理论"]
        },
        {
          id: 2,
          category: "艺术写作",
          title: "展览评论与策展文本",
          description: "撰写展览评论和策展文本，为艺术项目提供理论支撑和批判性思考。",
          images: [],
          links: [],
          tags: ["艺术写作", "批评理论", "策展实践"]
        }
      ],
      contact: {
        email: "noah.chen@curator.com",
        phone: "+86 138 0013 8000",
        location: "亚洲地区",
        social: {
          linkedin: "https://linkedin.com/in/noah-chen-curator",
          behance: "https://behance.net/noahchen",
          instagram: "https://instagram.com/noahchen.curator"
        },
        message: "欢迎通过邮箱或社交媒体与我联系，我会尽快回复您的消息。期待与您就策展项目和艺术合作进行交流！",
        availability: "接受新的策展项目合作",
        timezone: "GMT+8 (北京时间)"
      }
    },
    en: {
      home: {
        name: "Noah Chen",
        title: "Bilingual Curator & Creative Producer",
        description: "With over 7 years of experience in exhibition and public art fields across Asia. Committed to creating shared experiences that connect people, places, and purposes through interdisciplinary collaboration and contextually meaningful exhibitions.",
        skills: ["Public Art Curation", "Interdisciplinary Collaboration", "Spatial Design", "Project Management", "International Artist Relations", "Commercial Art Space Operations"],
        highlights: ["Curated 20+ major exhibition projects", "Collaborated with world-class artists", "Immersive experience design expert", "Context Engineering methodology"],
        socialLinks: {
          email: "noah.chen@curator.com",
          linkedin: "https://linkedin.com/in/noah-chen-curator",
          website: "https://noahchen-curator.com"
        },
        contactInfo: {
          location: "Asia Region",
          email: "noah.chen@curator.com",
          phone: "+86 138 0013 8000"
        }
      },
      about: {
        bio: "Bilingual curator and creative producer with over 7 years of experience in exhibition and public art fields across Asia.",
        curatorialPhilosophy: "Believes that curation is not merely the selection of artworks, but the creation of shared experiences that connect people, places, and purposes. Practice rooted in public art, advocating for art beyond gallery boundaries, integrating into daily life conversations.",
        specialties: [
          "Public Art Curation",
          "Interdisciplinary Collaboration",
          "Spatial Design",
          "Project Management",
          "International Artist Relations",
          "Commercial Art Space Operations"
        ],
        achievements: [
          "Curated over 20 major exhibition projects",
          "Managed international exhibitions with budgets exceeding 10 million RMB",
          "Collaborated with world-class artists including Marina Abramović and Yoko Ono",
          "Successfully created multiple immersive art experience spaces"
        ],
        personalInfo: {
          experience: "7+ years",
          location: "Asia Region",
          languages: ["Chinese", "English"]
        }
      },
      education: [
        {
          id: 1,
          institution: "Renowned Art Institute",
          degree: "Master of Curatorial Studies",
          field: "Contemporary Art Curation",
          startDate: "2015-09",
          endDate: "2017-06",
          description: "Focused on contemporary art curatorial theory and practice, public art project research.",
          gpa: "Excellent",
          honors: ["Outstanding Thesis", "Curatorial Practice Award", "International Exchange Program Participant"],
          coursework: ["Curatorial Theory", "Public Art", "Cross-cultural Art Exchange", "Project Management"]
        }
      ],
      experience: [
        {
          id: 1,
          title: "Context Engineering Methodology",
          description: "Inspired by AI context management, transforming projects from static plans into dynamic intelligent ecosystems",
          keyPoints: [
            "Dynamic Scene Construction: Moving beyond fragmented emails and documents to treat each project as a 'living scene', integrating all inputs including client needs, historical data, and real-time changes into coherent context.",
            "Intelligent Strategy Augmentation: Not relying on single experience, utilizing vector knowledge base of past successful cases to transform entire project archives into 'intelligent strategic advisors', achieving scalable application of proven best practices.",
            "Proactive Risk Sentinel System: Shifting from reactive problem-solving to proactive prevention, integrating internal project data with real-time external information as a 24/7 'risk sentinel' to identify and recommend emergency plans before potential threats escalate."
          ],
          icon: "zap",
          category: "methodology"
        },
        {
          id: 2,
          title: "Project Execution Points",
          description: "Key points and best practices in project execution",
          keyPoints: [
            "Supplier Management: Ensure suppliers understand and align with our requirements, providing products or services that meet specifications.",
            "Repeated Confirmation: Confirm delivery results between suppliers and clients/principals; request samples and drawings in advance; communicate early.",
            "Project Manager Field Knowledge: Project managers must deeply understand the project site or product; core requirements must not be delegated to others."
          ],
          icon: "target",
          category: "execution"
        },
        {
          id: 3,
          title: "Team Collaboration Spirit",
          description: "Establish efficient team collaboration mechanisms to improve project execution efficiency",
          keyPoints: [
            "Clear Division of Labor: Clearly define each member's responsibilities and tasks at the project start, ensuring everyone understands their work content and goals.",
            "Establish Mechanisms: Establish regular meeting and communication mechanisms to promptly resolve project issues, ensuring progress and quality.",
            "Cultivate Spirit: Encourage team members to support and learn from each other, creating a positive atmosphere and improving collaboration efficiency."
          ],
          icon: "users",
          category: "collaboration"
        }
      ],
      projects: [
        {
          id: 1,
          title: "Assemble",
          date: "2018.5.27-8.25",
          location: "K11, Shenyang, China",
          role: "Assistant Curator",
          description: "30-year retrospective of artists from Northeast China",
          coreContent: "30-year retrospective of artists from Northeast China, featuring 70+ works. Responsible for artist liaison, archival research, and curatorial content development, establishing foundation for large-scale regional curation in commercial art contexts.",
          category: "Group Exhibition",
          featured: true,
          status: "completed",
          artworkCount: "70+",
          achievements: [
            "First major regional artist retrospective",
            "Established comprehensive artist archive system",
            "Successful case of balancing commerce and art"
          ]
        },
        {
          id: 2,
          title: "Unnamed Artists Office - Wang Xin Solo Exhibition",
          date: "2018.9-12",
          location: "K11, Shenyang, China",
          role: "Assistant Curator",
          description: "Conceptual artist Wang Xin's exploration of institutional critique through fictional 'artist company' model",
          coreContent: "Conceptual artist Wang Xin's solo exhibition exploring institutional critique through fictional 'artist company' model. Coordinated installation construction, cross-departmental collaboration, and supported interpretive content design, challenging boundaries between art, commerce, and audience perception in retail exhibition contexts.",
          category: "Solo Exhibition",
          featured: false,
          status: "completed",
          artists: ["Wang Xin"],
          achievements: [
            "Successfully challenged art boundaries in commercial space",
            "Innovative interpretive content design"
          ]
        },
        {
          id: 3,
          title: "3cm Museum",
          date: "2019.3-4",
          location: "K11, Shenyang, China",
          role: "Assistant Curator",
          description: "Thematic exhibition exploring relationships between scale, perception, and human curiosity",
          coreContent: "Thematic exhibition where all works are no larger than 3cm, exploring relationships between scale, perception, and human curiosity. Featured works by multiple international artists with dedicated experience zones challenging traditional concepts of space and art. Supported exhibition layout planning, artist coordination, and public engagement projects.",
          category: "Group Exhibition",
          featured: true,
          status: "completed",
          artists: ["Multiple International Artists"],
          achievements: [
            "Breakthrough scale concept exhibition",
            "International artist collaboration experience",
            "Innovative public engagement model"
          ]
        },
        {
          id: 4,
          title: "LOVE LOVE LOVE",
          date: "2019.5-8",
          location: "K11, Shenyang, China",
          role: "Assistant Curator",
          description: "Immersive video exhibition exploring multidimensional aspects of love",
          coreContent: "Immersive video exhibition exploring multidimensional aspects of love, featuring works by Marina Abramović, Yoko Ono, Tracey Emin, Yang Fudong and other artists, constructing narrative from emotional, political, and poetic perspectives. Supported curatorial development, installation logistics management, and cross-departmental execution coordination.",
          category: "Group Exhibition",
          featured: true,
          status: "completed",
          artists: ["Marina Abramović", "Yoko Ono", "Tracey Emin", "Yang Fudong"],
          achievements: [
            "Collaboration with world-class artists",
            "Innovative immersive exhibition design",
            "Cross-departmental coordination management experience"
          ]
        },
        {
          id: 5,
          title: "(re)connect",
          date: "2019.9.21-12.25",
          location: "K11, Shenyang, China",
          role: "Curator & Project Lead",
          description: "Immersive installation exhibition in collaboration with design collective Numen/For Use",
          coreContent: "Immersive installation exhibition in collaboration with design collective Numen/For Use, exploring connection, tension, and bodily perception through large-scale participatory structures. Led curatorial concept, spatial design, and visitor flow strategy, transforming the exhibition into a tactile journey encouraging movement, play, and reflection, marking a shift in curatorial practice from static display to experience-oriented.",
          category: "Public Art",
          featured: true,
          status: "completed",
          collaborators: ["Numen/For Use"],
          achievements: [
            "First independent curatorial project",
            "Breakthrough in experience-oriented curatorial concept",
            "International design team collaboration"
          ]
        },
        {
          id: 6,
          title: "Florentijn Hofman Solo Exhibition Celebrating",
          date: "2023.7-10",
          location: "PowerLong Museum, Shanghai, China",
          role: "Curator & Project Manager",
          description: "Major solo exhibition by internationally renowned artist",
          coreContent: "Major solo exhibition by internationally renowned artist Florentijn Hofman, featuring a series of large-scale immersive sculptures, leading the entire process from concept to execution. Directly collaborated with the artist to lead exhibition curatorial vision (from concept to artwork selection and spatial design); comprehensively managed the project, overseeing total budget, all contracts, and stakeholder communications; led complex technical installation and de-installation of giant sculptures, ensuring safety and quality standards.",
          category: "Solo Exhibition",
          featured: true,
          status: "completed",
          artists: ["Florentijn Hofman"],
          achievements: [
            "Independently led major international artist exhibition",
            "Complex large-scale installation technical management",
            "Comprehensive project budget and contract management"
          ]
        },
        {
          id: 7,
          title: "Craig & Karl Solo Exhibition INSIDE OUT",
          date: "2024.3-5",
          location: "Times Art Museum, Beijing",
          role: "Curator & Project Manager",
          description: "Major solo exhibition by artist duo",
          coreContent: "Major solo exhibition by artist duo Craig & Karl, featuring brand new design for 2000 square meter space, including 100+ works (featuring multiple world premieres) and custom interactive mini golf course. Planned 2000 square meter immersive experience, integrating playable mini golf course to enhance audience interaction; directed full production cycle of large-scale exhibition, managing logistics of 100+ artworks and multiple installations; promoted global premiere of Craig & Karl's new works, authored all core curatorial texts.",
          category: "Solo Exhibition",
          featured: true,
          status: "completed",
          artists: ["Craig & Karl"],
          artworkCount: "100+",
          achievements: [
            "2000 square meter large-scale exhibition space design",
            "Innovative interactive experience design (mini golf)",
            "World premiere artwork curation"
          ]
        },
        {
          id: 8,
          title: "Online Exhibition Bare Screen",
          date: "2020.9-2021.12",
          location: "Red Star Macalline Art Center",
          role: "Co-Curator & Project Manager",
          description: "Year-long online exhibition series",
          coreContent: "Year-long online exhibition series, launching monthly digital video commissioned works, exploring pure digital forms of contemporary art practice, promoting critical online discourse. Co-led curatorial vision, research and selection for 12-month digital commission series; managed all contracts, budgets and production timelines from concept to final online release; authored all core curatorial texts and artist interviews for digital exhibition platform.",
          category: "Digital Exhibition",
          featured: true,
          status: "completed",
          achievements: [
            "Innovative digital exhibition format",
            "12-month continuous project management",
            "Digital art curatorial theory exploration"
          ]
        }
      ],
      interests: [
        {
          id: 1,
          category: "Curatorial Research",
          title: "Public Art Theory",
          description: "In-depth research on the relationship between public art and social space, exploring how art intervenes in daily life and generates social impact.",
          images: [],
          links: [
            { type: "blog", url: "https://blog.example.com", label: "Curatorial Thoughts Blog" }
          ],
          tags: ["Public Art", "Social Intervention", "Spatial Theory"]
        },
        {
          id: 2,
          category: "Art Writing",
          title: "Exhibition Reviews & Curatorial Texts",
          description: "Writing exhibition reviews and curatorial texts, providing theoretical support and critical thinking for art projects.",
          images: [],
          links: [],
          tags: ["Art Writing", "Critical Theory", "Curatorial Practice"]
        }
      ],
      contact: {
        email: "noah.chen@curator.com",
        phone: "+86 138 0013 8000",
        location: "Asia Region",
        social: {
          linkedin: "https://linkedin.com/in/noah-chen-curator",
          behance: "https://behance.net/noahchen",
          instagram: "https://instagram.com/noahchen.curator"
        },
        message: "Feel free to contact me via email or social media, I will get back to you as soon as possible. Looking forward to collaborating and communicating with you about curatorial projects and art collaborations!",
        availability: "Available for new curatorial project collaborations",
        timezone: "GMT+8 (Beijing Time)"
      }
    }
  };

  return staticContent[language]?.[section] || null;
};

// API response type
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success?: boolean;
}

// Connection status and health monitoring - fixed to start offline
let connectionStatus: 'online' | 'offline' | 'checking' | 'syncing' = 'offline';
let healthCheckInterval: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;
let lastSyncTime = Date.now();
let apiCallsEnabled = ENABLE_API_CALLS;

// Connection event listeners
const connectionListeners = new Set<(status: string) => void>();

// Enhanced API client with complete offline support
export class ApiClient {
  private accessToken: string | null = null;
  private baseUrl: string = '';
  private retryQueue: Array<() => Promise<any>> = [];
  private syncQueue: Array<{ endpoint: string; data: any; method: string }> = [];
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    
    // Only setup networking if API calls are enabled
    if (typeof window !== 'undefined' && apiCallsEnabled && projectId) {
      this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-c529659a`;
      this.startHealthMonitoring();
      this.setupNetworkListeners();
    } else {
      // Always start in offline mode for safety
      this.updateConnectionStatus('offline');
      console.log('🔄 API client initialized in offline mode - no network requests will be made');
    }
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  // Only start health monitoring if API calls are enabled
  private startHealthMonitoring() {
    if (!apiCallsEnabled || !this.baseUrl) {
      console.log('⚠️ Health monitoring disabled - API calls not enabled');
      return;
    }
    
    console.log('🔍 Starting health monitoring...');
    this.checkConnectionHealth();
    healthCheckInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, HEALTH_CHECK_INTERVAL);
  }

  // Setup network event listeners only if needed
  private setupNetworkListeners() {
    if (typeof window !== 'undefined' && apiCallsEnabled) {
      window.addEventListener('online', () => {
        console.log('🌐 Network came back online');
        this.handleNetworkChange(true);
      });

      window.addEventListener('offline', () => {
        console.log('📡 Network went offline');
        this.handleNetworkChange(false);
      });
    }
  }

  private handleNetworkChange(isOnline: boolean) {
    if (!apiCallsEnabled) return;
    
    if (isOnline) {
      this.checkConnectionHealth();
      this.processSyncQueue();
    } else {
      this.updateConnectionStatus('offline');
    }
  }

  private async checkConnectionHealth(): Promise<boolean> {
    // NEVER make network requests if API calls are disabled
    if (!apiCallsEnabled || !this.baseUrl) {
      this.updateConnectionStatus('offline');
      return false;
    }

    try {
      this.updateConnectionStatus('checking');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      clearTimeout(timeoutId);
      const isHealthy = response.ok;
      
      if (isHealthy) {
        this.updateConnectionStatus('online');
        reconnectAttempts = 0;
        lastSyncTime = Date.now();
        this.processSyncQueue();
        console.log('✅ Backend connection healthy');
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      return isHealthy;
    } catch (error) {
      // Silently handle connection failures in offline mode
      console.log('📴 Backend unavailable, staying in offline mode');
      this.updateConnectionStatus('offline');
      return false;
    }
  }

  private updateConnectionStatus(status: typeof connectionStatus) {
    if (connectionStatus !== status) {
      connectionStatus = status;
      console.log(`📊 Connection status: ${status}`);
      
      // Notify all listeners
      connectionListeners.forEach(listener => {
        try {
          listener(status);
        } catch (error) {
          console.error('❌ Error in connection listener:', error);
        }
      });
    }
  }

  private scheduleReconnect() {
    if (!apiCallsEnabled || reconnectAttempts >= 3) {
      this.updateConnectionStatus('offline');
      return;
    }
    
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
    reconnectAttempts++;
    
    setTimeout(() => {
      console.log(`🔄 Attempting to reconnect (attempt ${reconnectAttempts})...`);
      this.checkConnectionHealth();
    }, delay);
  }

  private async processSyncQueue() {
    if (connectionStatus !== 'online' || this.syncQueue.length === 0) {
      return;
    }

    this.updateConnectionStatus('syncing');
    console.log(`🔄 Processing ${this.syncQueue.length} queued operations...`);

    const queue = [...this.syncQueue];
    this.syncQueue = [];

    for (const operation of queue) {
      try {
        await this.makeRequest(operation.endpoint, {
          method: operation.method,
          body: operation.method !== 'GET' ? JSON.stringify(operation.data) : undefined
        });
        console.log(`✅ Synced: ${operation.method} ${operation.endpoint}`);
      } catch (error) {
        console.error(`❌ Failed to sync: ${operation.method} ${operation.endpoint}`, error);
        this.syncQueue.push(operation);
      }
    }

    this.updateConnectionStatus('online');
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Always return static data if API calls are disabled
    if (!apiCallsEnabled) {
      const [, section, language] = endpoint.split('/').filter(Boolean);
      const fallbackData = getStaticData(section, language);
      
      if (fallbackData) {
        return { data: fallbackData as T, success: true };
      }
      
      // For save operations in offline mode
      if (options.method !== 'GET') {
        return { 
          success: true, 
          data: { message: 'Saved locally (offline mode)' } as T 
        };
      }
      
      return { success: true, data: null as T };
    }

    // Queue write operations when offline
    if (connectionStatus === 'offline' && options.method !== 'GET') {
      this.syncQueue.push({
        endpoint,
        data: options.body ? JSON.parse(options.body as string) : null,
        method: options.method || 'GET'
      });
      
      return { 
        success: true, 
        data: { message: 'Queued for sync when online' } as T 
      };
    }

    let attempt = 0;
    while (attempt < RETRY_ATTEMPTS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken || publicAnonKey}`,
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (connectionStatus !== 'online') {
          this.updateConnectionStatus('online');
        }
        
        return { data, success: true };
      } catch (error) {
        attempt++;
        
        if (attempt >= RETRY_ATTEMPTS) {
          this.updateConnectionStatus('offline');
          
          // Return fallback data for GET requests
          if (!options.method || options.method === 'GET') {
            const [, section, language] = endpoint.split('/').filter(Boolean);
            const fallbackData = getStaticData(section, language);
            
            if (fallbackData) {
              console.log(`📦 Using offline data for ${endpoint}`);
              return { data: fallbackData as T, success: true };
            }
          }
          
          return { 
            error: 'Using offline mode - backend not available',
            success: false 
          };
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { error: 'Max retries exceeded', success: false };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  async upload(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<ApiResponse> {
    if (!apiCallsEnabled || connectionStatus === 'offline') {
      return { 
        success: true, 
        data: { message: 'File upload not available in offline mode', url: 'placeholder-url' }
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT * 2);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${this.accessToken || publicAnonKey}`,
        },
        body: formData,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      console.log(`📁 Upload not available in offline mode: ${endpoint}`);
      return { 
        success: true, 
        data: { message: 'File upload not available in offline mode', url: 'placeholder-url' }
      };
    }
  }

  getConnectionStatus(): typeof connectionStatus {
    return connectionStatus;
  }

  getLastSyncTime(): number {
    return lastSyncTime;
  }

  getSyncQueueLength(): number {
    return this.syncQueue.length;
  }

  addConnectionListener(listener: (status: string) => void) {
    connectionListeners.add(listener);
  }

  removeConnectionListener(listener: (status: string) => void) {
    connectionListeners.delete(listener);
  }

  // Force reconnection attempt (only if API calls are enabled)
  forceReconnect() {
    if (!apiCallsEnabled) {
      console.log('⚠️ API calls are disabled - cannot reconnect');
      return;
    }
    console.log('🔄 Force reconnect initiated');
    reconnectAttempts = 0;
    this.checkConnectionHealth();
  }

  // Enable API calls dynamically
  enableAPI() {
    if (typeof window !== 'undefined' && projectId) {
      console.log('🚀 Enabling API calls...');
      apiCallsEnabled = true;
      this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-c529659a`;
      this.startHealthMonitoring();
      this.setupNetworkListeners();
      this.checkConnectionHealth();
    }
  }

  // Disable API calls
  disableAPI() {
    console.log('⏹️ Disabling API calls...');
    apiCallsEnabled = false;
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      healthCheckInterval = null;
    }
    this.updateConnectionStatus('offline');
  }

  // Check if API calls are enabled
  isAPIEnabled(): boolean {
    return apiCallsEnabled;
  }

  // Cleanup
  destroy() {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
    }
    connectionListeners.clear();
  }
}

// Create default API client instance
export const apiClient = new ApiClient();

// Helper functions with offline-first approach
export const fetchHomeData = async (language: string): Promise<ApiResponse> => {
  try {
    const result = await apiClient.get(`/home/${language}`);
    if (result.success && result.data) {
      return result;
    }
    
    const fallbackData = getStaticData('home', language);
    return { data: fallbackData, success: true };
  } catch (error) {
    console.log('📦 fetchHomeData using offline data');
    const fallbackData = getStaticData('home', language);
    return { data: fallbackData, success: true };
  }
};

export const fetchProfileData = async (language: string): Promise<ApiResponse> => {
  try {
    const result = await apiClient.get(`/about/${language}`);
    if (result.success && result.data) {
      return result;
    }
    
    const fallbackData = getStaticData('about', language);
    return { data: fallbackData, success: true };
  } catch (error) {
    console.log('📦 fetchProfileData using offline data');
    const fallbackData = getStaticData('about', language);
    return { data: fallbackData, success: true };
  }
};

export const fetchEducationData = async (language: string): Promise<ApiResponse> => {
  try {
    const result = await apiClient.get(`/education/${language}`);
    if (result.success && result.data) {
      return result;
    }
    
    const fallbackData = getStaticData('education', language);
    return { data: fallbackData, success: true };
  } catch (error) {
    console.log('📦 fetchEducationData using offline data');
    const fallbackData = getStaticData('education', language);
    return { data: fallbackData, success: true };
  }
};

export const fetchExperienceData = async (language: string): Promise<ApiResponse> => {
  try {
    const result = await apiClient.get(`/experience/${language}`);
    if (result.success && result.data) {
      return result;
    }
    
    const fallbackData = getStaticData('experience', language);
    return { data: fallbackData, success: true };
  } catch (error) {
    console.log('📦 fetchExperienceData using offline data');
    const fallbackData = getStaticData('experience', language);
    return { data: fallbackData, success: true };
  }
};

export const fetchProjectsData = async (language: string): Promise<ApiResponse> => {
  try {
    const result = await apiClient.get(`/projects/${language}`);
    if (result.success && result.data) {
      return result;
    }
    
    const fallbackData = getStaticData('projects', language);
    return { data: fallbackData, success: true };
  } catch (error) {
    console.log('📦 fetchProjectsData using offline data');
    const fallbackData = getStaticData('projects', language);
    return { data: fallbackData, success: true };
  }
};

export const fetchInterestsData = async (language: string): Promise<ApiResponse> => {
  try {
    const result = await apiClient.get(`/interests/${language}`);
    if (result.success && result.data) {
      return result;
    }
    
    const fallbackData = getStaticData('interests', language);
    return { data: fallbackData, success: true };
  } catch (error) {
    console.log('📦 fetchInterestsData using offline data');
    const fallbackData = getStaticData('interests', language);
    return { data: fallbackData, success: true };
  }
};

export const fetchContactData = async (language: string): Promise<ApiResponse> => {
  try {
    const result = await apiClient.get(`/contact/${language}`);
    if (result.success && result.data) {
      return result;
    }
    
    const fallbackData = getStaticData('contact', language);
    return { data: fallbackData, success: true };
  } catch (error) {
    console.log('📦 fetchContactData using offline data');
    const fallbackData = getStaticData('contact', language);
    return { data: fallbackData, success: true };
  }
};

// Save functions
export const saveHomeData = async (language: string, data: any): Promise<ApiResponse> => {
  return apiClient.post(`/home/${language}`, data);
};

export const saveProfileData = async (language: string, data: any): Promise<ApiResponse> => {
  return apiClient.post(`/about/${language}`, data);
};

export const saveEducationData = async (language: string, data: any): Promise<ApiResponse> => {
  return apiClient.post(`/education/${language}`, data);
};

export const saveExperienceData = async (language: string, data: any): Promise<ApiResponse> => {
  return apiClient.post(`/experience/${language}`, data);
};

export const saveProjectsData = async (language: string, data: any): Promise<ApiResponse> => {
  return apiClient.post(`/projects/${language}`, data);
};

export const saveInterestsData = async (language: string, data: any): Promise<ApiResponse> => {
  return apiClient.post(`/interests/${language}`, data);
};

export const saveContactData = async (language: string, data: any): Promise<ApiResponse> => {
  return apiClient.post(`/contact/${language}`, data);
};

// File upload
export const uploadFile = async (file: File, additionalData?: Record<string, string>): Promise<ApiResponse> => {
  return apiClient.upload('/upload', file, additionalData);
};

// Auth functions
export const authenticateUser = async (credentials: { email: string; password: string }): Promise<ApiResponse> => {
  return apiClient.post('/auth/login', credentials);
};

export const logoutUser = async (): Promise<ApiResponse> => {
  return apiClient.post('/auth/logout', {});
};

// Connection management
export const getConnectionStatus = (): string => {
  return apiClient.getConnectionStatus();
};

export const addConnectionListener = (listener: (status: string) => void) => {
  apiClient.addConnectionListener(listener);
};

export const removeConnectionListener = (listener: (status: string) => void) => {
  apiClient.removeConnectionListener(listener);
};

export const forceReconnect = () => {
  apiClient.forceReconnect();
};

export const enableAPI = () => {
  apiClient.enableAPI();
};

export const disableAPI = () => {
  apiClient.disableAPI();
};

export const isAPIEnabled = (): boolean => {
  return apiClient.isAPIEnabled();
};

// Additional exports for CMS and Dev components
export const setAccessToken = (token: string | null) => {
  apiClient.setAccessToken(token);
};

export const getLastSyncTime = (): number => {
  return apiClient.getLastSyncTime();
};

export const getSyncQueueLength = (): number => {
  return apiClient.getSyncQueueLength();
};

// Generic save content function for CMS
export const saveContent = async (section: string, language: string, data: any): Promise<ApiResponse> => {
  switch (section) {
    case 'home':
      return saveHomeData(language, data);
    case 'about':
      return saveProfileData(language, data);
    case 'education':
      return saveEducationData(language, data);
    case 'experience':
      return saveExperienceData(language, data);
    case 'projects':
      return saveProjectsData(language, data);
    case 'interests':
      return saveInterestsData(language, data);
    case 'contact':
      return saveContactData(language, data);
    default:
      return { success: false, error: `Unknown section: ${section}` };
  }
};