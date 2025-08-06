个⼈作品⽹站开发完整指南
1. 项⽬概述
1.1 技术栈选择（适合⾮程序员）
• 前端: HTML + CSS + JavaScript (纯原⽣，易于理解和修改)
• 后端: Node.js + Express (JavaScript全栈，学习曲线平缓)
• 数据库: SQLite (⽂件数据库，⽆需安装配置)
• ⽂件存储: 本地存储 + 云端备份
• 部署: Vercel/Netlify (免费，操作简单)
1.2 开发⼯具
• 主要开发⼯具: Claude Projects 或 Gemini CLI
• 代码编辑器: VS Code (免费，功能强⼤)
• 版本控制: Git + GitHub
• 测试⼯具: 浏览器开发者⼯具
2. Windows环境配置
2.1 必备软件安装
Node.js 安装
代码块
# 访问 https://nodejs.org 下载LTS版本
# 安装完成后验证
1
2
node --version
npm --version
VS Code 安装
代码块
# 访问 https://code.visualstudio.com 下载安装
# 推荐插件:
# - Live Server (实时预览)
# - Prettier (代码格式化)
# - Auto Rename Tag (标签⾃动重命名)
Git 安装
代码块
# 访问 https://git-scm.com 下载安装
# 配置⽤⼾信息
git config --global user.name "你的姓名"
git config --global user.email "你的邮箱"
2.2 项⽬初始化
代码块
# 创建项⽬⽂件夹
mkdir my-portfolio-website
cd my-portfolio-website
# 初始化npm项⽬
npm init -y
# 安装必要依赖
npm install express multer sqlite3 cors dotenv
npm install --save-dev nodemon
3
4
1
2
3
4
5
1
2
3
4
1
2
3
4
5
6
7
8
9
10
3. 项⽬⽂件结构
代码块
my-portfolio-website/
├── frontend/ # 前端⽂件
│ ├── index.html # ⾸⻚
│ ├── admin.html # 后台管理⻚⾯
│ ├── css/
│ │ ├── style.css # 主样式⽂件
│ │ └── admin.css # 后台样式
│ ├── js/
│ │ ├── main.js # 前端主逻辑
│ │ └── admin.js # 后台管理逻辑
│ └── assets/ # 静态资源
│ ├── images/
│ ├── videos/
│ └── documents/
├── backend/ # 后端⽂件
│ ├── server.js # 服务器主⽂件
│ ├── routes/ # 路由⽂件
│ ├── models/ # 数据模型
│ └── middleware/ # 中间件
├── database/ # 数据库⽂件
│ └── portfolio.db
├── uploads/ # 上传⽂件存储
├── backups/ # 备份⽂件
├── package.json
├── .env # 环境变量
└── README.md
4. 数据库设计
4.1 数据表结构
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
代码块
-- 项⽬表
CREATE TABLE projects (
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT NOT NULL,
location TEXT,
date TEXT,
description TEXT,
role TEXT,
work_content TEXT,
external_links TEXT,
images TEXT,
videos TEXT,
category TEXT,
order_index INTEGER DEFAULT 0,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- 个⼈信息表
CREATE TABLE profile (
id INTEGER PRIMARY KEY AUTOINCREMENT,
section TEXT UNIQUE NOT NULL,
content TEXT NOT NULL,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- 兴趣爱好表
CREATE TABLE interests (
id INTEGER PRIMARY KEY AUTOINCREMENT,
category TEXT NOT NULL,
title TEXT NOT NULL,
description TEXT,
files TEXT,
links TEXT,
order_index INTEGER DEFAULT 0,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- 灵感想法表
CREATE TABLE inspirations (
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT NOT NULL,
content TEXT NOT NULL,
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
tags TEXT,
status TEXT DEFAULT 'draft',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- 写作⽂章表
CREATE TABLE articles (
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT NOT NULL,
content TEXT NOT NULL,
summary TEXT,
published BOOLEAN DEFAULT 0,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
5. 后端开发模板
5.1 服务器主⽂件 (backend/server.js)
代码块
const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// 数据库连接
44
45
46
47
48
49
50
51
52
53
54
55
56
57
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
const db = new sqlite3.Database('./database/portfolio.db', (err) => {
if (err) {
console.error('数据库连接失败:', err.message);
} else {
console.log('数据库连接成功');
initDatabase();
}
});
// 初始化数据库表
function initDatabase() {
// 在这⾥创建数据表
db.run(`CREATE TABLE IF NOT EXISTS projects (
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT NOT NULL,
location TEXT,
date TEXT,
description TEXT,
role TEXT,
work_content TEXT,
external_links TEXT,
images TEXT,
videos TEXT,
category TEXT,
order_index INTEGER DEFAULT 0,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
// 其他表的创建...
}
// ⽂件上传配置
const storage = multer.diskStorage({
destination: function (req, file, cb) {
cb(null, 'uploads/')
},
filename: function (req, file, cb) {
const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() *
1E9);
cb(null, file.fieldname + '-' + uniqueSuffix +
path.extname(file.originalname));
}
});
const upload = multer({ storage: storage });
// API路由
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
app.get('/api/projects', (req, res) => {
db.all('SELECT * FROM projects ORDER BY order_index, created_at DESC',
(err, rows) => {
if (err) {
res.status(500).json({ error: err.message });
} else {
res.json(rows);
}
});
});
app.post('/api/projects', upload.array('files'), (req, res) => {
const { title, location, date, description, role, work_content,
external_links, category } = req.body;
const files = req.files ? JSON.stringify(req.files.map(f => f.filename)) :
null;
db.run(
`INSERT INTO projects (title, location, date, description, role,
work_content, external_links, images, category)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
[title, location, date, description, role, work_content,
external_links, files, category],
function(err) {
if (err) {
res.status(500).json({ error: err.message });
} else {
res.json({ id: this.lastID, message: '项⽬创建成功' });
}
}
);
});
// 启动服务器
app.listen(PORT, () => {
console.log(`服务器运⾏在 http://localhost:${PORT}`);
});
5.2 环境变量配置 (.env)
代码块
PORT=3000
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
1
DB_PATH=./database/portfolio.db
UPLOAD_DIR=./uploads
ADMIN_PASSWORD=your_secure_password_here
6. 前端开发模板
6.1 主⻚⾯ (frontend/index.html)
代码块
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>个⼈作品集</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<header>
<nav>
<div class="logo">
<h1>个⼈作品集</h1>
</div>
<ul class="nav-menu">
<li><a href="#about">关于我</a></li>
<li><a href="#projects">项⽬经历</a></li>
<li><a href="#interests">个⼈兴趣</a></li>
<li><a href="#inspirations">灵感</a></li>
<li><a href="#articles">写作</a></li>
<li><a href="#contact">联系我</a></li>
</ul>
</nav>
</header>
<main>
<!-- 个⼈简介部分 -->
<section id="about" class="section">
2
3
4
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
<div class="container">
<h2>关于我</h2>
<div id="profile-content">
<!-- 动态加载个⼈信息 -->
</div>
</div>
</section>
<!-- 项⽬经历部分 -->
<section id="projects" class="section">
<div class="container">
<h2>项⽬经历</h2>
<div id="projects-container">
<!-- 动态加载项⽬列表 -->
</div>
</div>
</section>
<!-- 其他部分... -->
</main>
<footer>
<p>&copy; 2024 个⼈作品集. All rights reserved.</p>
</footer>
<script src="js/main.js"></script>
</body>
</html>
6.2 前端主逻辑 (frontend/js/main.js)
代码块
// API基础URL
const API_BASE = '/api';
// ⻚⾯加载完成后执⾏
document.addEventListener('DOMContentLoaded', function() {
loadProfile();
loadProjects();
loadInterests();
// 其他初始化函数...
});
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
1
2
3
4
5
6
7
8
9
10
// 加载个⼈信息
async function loadProfile() {
try {
const response = await fetch(`${API_BASE}/profile`);
const data = await response.json();
const profileContainer = document.getElementById('profile-content');
// 渲染个⼈信息到⻚⾯
profileContainer.innerHTML = renderProfile(data);
} catch (error) {
console.error('加载个⼈信息失败:', error);
}
}
// 加载项⽬列表
async function loadProjects() {
try {
const response = await fetch(`${API_BASE}/projects`);
const projects = await response.json();
const projectsContainer = document.getElementById('projects￾container');
projectsContainer.innerHTML = projects.map(project =>
renderProject(project)).join('');
} catch (error) {
console.error('加载项⽬列表失败:', error);
}
}
// 渲染单个项⽬
function renderProject(project) {
return `
<div class="project-card">
<h3>${project.title}</h3>
<div class="project-meta">
<span class="location">${project.location || ''}</span>
<span class="date">${project.date || ''}</span>
</div>
<p class="description">${project.description || ''}</p>
<div class="role">
<strong>担任⻆⾊:</strong> ${project.role || ''}
</div>
<div class="work-content">
<strong>⼯作内容:</strong> ${project.work_content || ''}
</div>
${project.external_links ? `
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
<div class="external-links">
<strong>相关链接:</strong>
<a href="${project.external_links}" target="_blank">查看详情
</a>
</div>
` : ''}
${project.images ? renderProjectImages(JSON.parse(project.images))
: ''}
</div>
`;
}
// 渲染项⽬图⽚
function renderProjectImages(images) {
return `
<div class="project-images">
${images.map(img => `
<img src="/uploads/${img}" alt="项⽬图⽚"
onclick="openImageModal(this.src)">
`).join('')}
</div>
`;
}
// 图⽚模态框
function openImageModal(src) {
const modal = document.createElement('div');
modal.className = 'image-modal';
modal.innerHTML = `
<div class="modal-content">
<span class="close"
onclick="this.parentElement.parentElement.remove()">&times;</span>
<img src="${src}" alt="放⼤图⽚">
</div>
`;
document.body.appendChild(modal);
}
6.3 样式⽂件 (frontend/css/style.css)
代码块
/* 基础样式重置 */
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
1
* {
margin: 0;
padding: 0;
box-sizing: border-box;
}
body {
font-family: 'Arial', sans-serif;
line-height: 1.6;
color: #333;
background-color: #f8f9fa;
}
/* 导航栏样式 */
header {
background: #fff;
box-shadow: 0 2px 5px rgba(0,0,0,0.1);
position: fixed;
width: 100%;
top: 0;
z-index: 1000;
}
nav {
display: flex;
justify-content: space-between;
align-items: center;
padding: 1rem 2rem;
max-width: 1200px;
margin: 0 auto;
}
.nav-menu {
display: flex;
list-style: none;
}
.nav-menu li {
margin-left: 2rem;
}
.nav-menu a {
text-decoration: none;
color: #333;
font-weight: 500;
transition: color 0.3s ease;
}
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
.nav-menu a:hover {
color: #007bff;
}
/* 主要内容区域 */
main {
margin-top: 80px;
padding: 2rem 0;
}
.section {
padding: 4rem 0;
}
.container {
max-width: 1200px;
margin: 0 auto;
padding: 0 2rem;
}
h2 {
text-align: center;
margin-bottom: 3rem;
color: #2c3e50;
font-size: 2.5rem;
}
/* 项⽬卡⽚样式 */
.project-card {
background: #fff;
border-radius: 10px;
padding: 2rem;
margin-bottom: 2rem;
box-shadow: 0 5px 15px rgba(0,0,0,0.1);
transition: transform 0.3s ease;
}
.project-card:hover {
transform: translateY(-5px);
}
.project-card h3 {
color: #2c3e50;
margin-bottom: 1rem;
font-size: 1.5rem;
}
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
.project-meta {
display: flex;
gap: 1rem;
margin-bottom: 1rem;
color: #666;
font-size: 0.9rem;
}
.description {
margin-bottom: 1rem;
line-height: 1.8;
}
.role, .work-content {
margin-bottom: 1rem;
}
.external-links a {
color: #007bff;
text-decoration: none;
}
.external-links a:hover {
text-decoration: underline;
}
/* 项⽬图⽚样式 */
.project-images {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 1rem;
margin-top: 1rem;
}
.project-images img {
width: 100%;
height: 150px;
object-fit: cover;
border-radius: 5px;
cursor: pointer;
transition: transform 0.3s ease;
}
.project-images img:hover {
transform: scale(1.05);
}
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
/* 图⽚模态框 */
.image-modal {
position: fixed;
z-index: 2000;
left: 0;
top: 0;
width: 100%;
height: 100%;
background-color: rgba(0,0,0,0.9);
display: flex;
justify-content: center;
align-items: center;
}
.modal-content {
position: relative;
max-width: 90%;
max-height: 90%;
}
.modal-content img {
width: 100%;
height: auto;
border-radius: 10px;
}
.close {
position: absolute;
top: -40px;
right: 0;
color: #fff;
font-size: 2rem;
cursor: pointer;
}
/* 响应式设计 */
@media (max-width: 768px) {
.nav-menu {
flex-direction: column;
position: absolute;
top: 100%;
left: 0;
width: 100%;
background: #fff;
box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
172
173
174
175
176
177
178
179
180
181
182
183
184
185
186
187
188
189
.nav-menu li {
margin: 0;
text-align: center;
padding: 1rem;
border-bottom: 1px solid #eee;
}
.container {
padding: 0 1rem;
}
h2 {
font-size: 2rem;
}
}
7. 后台管理系统
7.1 后台管理⻚⾯ (frontend/admin.html)
代码块
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>后台管理 - 个⼈作品集</title>
<link rel="stylesheet" href="css/admin.css">
</head>
<body>
<div class="admin-container">
<aside class="sidebar">
<h2>管理⾯板</h2>
<nav class="admin-nav">
<ul>
190
191
192
193
194
195
196
197
198
199
200
201
202
203
204
205
1
2
3
4
5
6
7
8
9
10
11
12
13
14
<li><a href="#profile" class="nav-link active" data￾section="profile">个⼈信息</a></li>
<li><a href="#projects" class="nav-link" data￾section="projects">项⽬管理</a></li>
<li><a href="#interests" class="nav-link" data￾section="interests">兴趣爱好</a></li>
<li><a href="#inspirations" class="nav-link" data￾section="inspirations">灵感想法</a></li>
<li><a href="#articles" class="nav-link" data￾section="articles">⽂章管理</a></li>
<li><a href="#settings" class="nav-link" data￾section="settings">系统设置</a></li>
</ul>
</nav>
</aside>
<main class="main-content">
<!-- 个⼈信息管理 -->
<section id="profile-section" class="content-section active">
<h2>个⼈信息管理</h2>
<form id="profile-form" class="admin-form">
<div class="form-group">
<label for="bio">个⼈简介</label>
<textarea id="bio" name="bio" rows="5" placeholder="请输
⼊个⼈简介..."></textarea>
</div>
<div class="form-group">
<label for="education">教育背景</label>
<textarea id="education" name="education" rows="8"
placeholder="请输⼊教育背景..."></textarea>
</div>
<div class="form-group">
<label for="experience">⼯作经历</label>
<textarea id="experience" name="experience" rows="10"
placeholder="请输⼊⼯作经历..."></textarea>
</div>
<button type="submit" class="btn btn-primary">保存信息
</button>
</form>
</section>
<!-- 项⽬管理 -->
<section id="projects-section" class="content-section">
<div class="section-header">
<h2>项⽬管理</h2>
<button class="btn btn-primary"
onclick="showProjectForm()">添加新项⽬</button>
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
</div>
<div id="projects-list" class="items-list">
<!-- 动态加载项⽬列表 -->
</div>
<!-- 项⽬表单模态框 -->
<div id="project-modal" class="modal">
<div class="modal-content">
<span class="close"
onclick="closeProjectModal()">&times;</span>
<h3 id="project-modal-title">添加新项⽬</h3>
<form id="project-form" class="admin-form"
enctype="multipart/form-data">
<input type="hidden" id="project-id" name="id">
<div class="form-group">
<label for="project-title">项⽬名称*</label>
<input type="text" id="project-title"
name="title" required>
</div>
<div class="form-row">
<div class="form-group">
<label for="project-location">项⽬地点
</label>
<input type="text" id="project-location"
name="location">
</div>
<div class="form-group">
<label for="project-date">项⽬时间</label>
<input type="text" id="project-date"
name="date" placeholder="例：2023年1⽉-3⽉">
</div>
</div>
<div class="form-group">
<label for="project-description">项⽬简介
</label>
<textarea id="project-description"
name="description" rows="4"></textarea>
</div>
<div class="form-group">
<label for="project-role">担任⻆⾊</label>
<input type="text" id="project-role"
name="role">
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
</div>
<div class="form-group">
<label for="project-work">⼯作内容</label>
<textarea id="project-work" name="work_content"
rows="4"></textarea>
</div>
<div class="form-group">
<label for="project-links">外部链接</label>
<input type="url" id="project-links"
name="external_links" placeholder="https://...">
</div>
<div class="form-group">
<label for="project-category">项⽬分类</label>
<select id="project-category" name="category">
<option value="">选择分类</option>
<option value="创意项⽬">创意项⽬</option>
<option value="管理⼯作">管理⼯作</option>
<option value="策划设计">策划设计</option>
<option value="其他">其他</option>
</select>
</div>
<div class="form-group">
<label for="project-files">项⽬⽂件</label>
<input type="file" id="project-files"
name="files" multiple accept="image/*,video/*,.pdf,.doc,.docx">
<small>⽀持图⽚、视频、⽂档等格式，可选择多个⽂件
</small>
</div>
<div class="form-actions">
<button type="button" class="btn btn-secondary"
onclick="closeProjectModal()">取消</button>
<button type="submit" class="btn btn-primary">
保存项⽬</button>
</div>
</form>
</div>
</div>
</section>
<!-- 其他部分... -->
</main>
</div>
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
<script src="js/admin.js"></script>
</body>
</html>
7.2 后台管理逻辑 (frontend/js/admin.js)
代码块
// 后台管理JavaScript逻辑
const API_BASE = '/api';
// ⻚⾯初始化
document.addEventListener('DOMContentLoaded', function() {
initAdminPanel();
loadProfileData();
loadProjectsList();
});
// 初始化管理⾯板
function initAdminPanel() {
// 导航切换
const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');
navLinks.forEach(link => {
link.addEventListener('click', function(e) {
e.preventDefault();
// 移除所有活动状态
navLinks.forEach(l => l.classList.remove('active'));
contentSections.forEach(s => s.classList.remove('active'));
// 添加当前活动状态
this.classList.add('active');
const sectionId = this.dataset.section + '-section';
document.getElementById(sectionId).classList.add('active');
});
});
// 表单提交处理
setupFormHandlers();
}
130
131
132
133
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
// 设置表单处理器
function setupFormHandlers() {
// 个⼈信息表单
const profileForm = document.getElementById('profile-form');
profileForm.addEventListener('submit', handleProfileSubmit);
// 项⽬表单
const projectForm = document.getElementById('project-form');
projectForm.addEventListener('submit', handleProjectSubmit);
}
// 加载个⼈信息数据
async function loadProfileData() {
try {
const response = await fetch(`${API_BASE}/profile`);
const data = await response.json();
// 填充表单
if (data.bio) document.getElementById('bio').value = data.bio;
if (data.education) document.getElementById('education').value =
data.education;
if (data.experience) document.getElementById('experience').value =
data.experience;
} catch (error) {
console.error('加载个⼈信息失败:', error);
showNotification('加载个⼈信息失败', 'error');
}
}
// 处理个⼈信息提交
async function handleProfileSubmit(e) {
e.preventDefault();
const formData = new FormData(e.target);
const data = Object.fromEntries(formData);
try {
const response = await fetch(`${API_BASE}/profile`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify(data)
});
if (response.ok) {
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
showNotification('个⼈信息保存成功', 'success');
} else {
throw new Error('保存失败');
}
} catch (error) {
console.error('保存个⼈信息失败:', error);
showNotification('保存失败，请重试', 'error');
}
}
// 加载项⽬列表
async function loadProjectsList() {
try {
const response = await fetch(`${API_BASE}/projects`);
const projects = await response.json();
const projectsList = document.getElementById('projects-list');
projectsList.innerHTML = projects.map(project =>
renderProjectItem(project)).join('');
} catch (error) {
console.error('加载项⽬列表失败:', error);
showNotification('加载项⽬列表失败', 'error');
}
}
// 渲染项⽬列表项
function renderProjectItem(project) {
return `
<div class="item-card" data-id="${project.id}">
<div class="item-header">
<h4>${project.title}</h4>
<div class="item-actions">
<button class="btn btn-small btn-secondary"
onclick="editProject(${project.id})">编辑</button>
<button class="btn btn-small btn-danger"
onclick="deleteProject(${project.id})">删除</button>
</div>
</div>
<div class="item-meta">
<span>${project.location || ''}</span>
<span>${project.date || ''}</span>
<span class="category">${project.category || ''}</span>
</div>
<p class="item-description">${project.description || ''}</p>
</div>
`;
}
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
// 显⽰项⽬表单
function showProjectForm(project = null) {
const modal = document.getElementById('project-modal');
const modalTitle = document.getElementById('project-modal-title');
const form = document.getElementById('project-form');
if (project) {
modalTitle.textContent = '编辑项⽬';
fillProjectForm(project);
} else {
modalTitle.textContent = '添加新项⽬';
form.reset();
}
modal.style.display = 'block';
}
// 关闭项⽬模态框
function closeProjectModal() {
const modal = document.getElementById('project-modal');
modal.style.display = 'none';
}
// 填充项⽬表单
function fillProjectForm(project) {
document.getElementById('project-id').value = project.id;
document.getElementById('project-title').value = project.title || '';
document.getElementById('project-location').value = project.location || '';
document.getElementById('project-date').value = project.date || '';
document.getElementById('project-description').value = project.description
|| '';
document.getElementById('project-role').value = project.role || '';
document.getElementById('project-work').value = project.work_content || '';
document.getElementById('project-links').value = project.external_links ||
'';
document.getElementById('project-category').value = project.category || '';
}
// 处理项⽬表单提交
async function handleProjectSubmit(e) {
e.preventDefault();
const formData = new FormData(e.target);
const projectId = formData.get('id');
try {
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
const url = projectId ? `${API_BASE}/projects/${projectId}` :
`${API_BASE}/projects`;
const method = projectId ? 'PUT' : 'POST';
const response = await fetch(url, {
method: method,
body: formData
});
if (response.ok) {
showNotification('项⽬保存成功', 'success');
closeProjectModal();
loadProjectsList(); // 重新加载列表
} else {
throw new Error('保存失败');
}
} catch (error) {
console.error('保存项⽬失败:', error);
showNotification('保存失败，请重试', 'error');
}
}
// 编辑项⽬
async function editProject(id) {
try {
const response = await fetch(`${API_BASE}/projects/${id}`);
const project = await response.json();
showProjectForm(project);
} catch (error) {
console.error('加载项⽬详情失败:', error);
showNotification('加载项⽬详情失败', 'error');
}
}
// 删除项⽬
async function deleteProject(id) {
if (!confirm('确定要删除这个项⽬吗？此操作不可恢复。')) {
return;
}
try {
const response = await fetch(`${API_BASE}/projects/${id}`, {
method: 'DELETE'
});
if (response.ok) {
showNotification('项⽬删除成功', 'success');
169
170
171
172
173
174
175
176
177
178
179
180
181
182
183
184
185
186
187
188
189
190
191
192
193
194
195
196
197
198
199
200
201
202
203
204
205
206
207
208
209
210
211
212
213
214
loadProjectsList(); // 重新加载列表
} else {
throw new Error('删除失败');
}
} catch (error) {
console.error('删除项⽬失败:', error);
showNotification('删除失败，请重试', 'error');
}
}
// 显⽰通知
function showNotification(message, type = 'info') {
const notification = document.createElement('div');
notification.className = `notification notification-${type}`;
notification.textContent = message;
document.body.appendChild(notification);
// 3秒后⾃动移除
setTimeout(() => {
notification.remove();
}, 3000);
}
// 点击模态框外部关闭
window.onclick = function(event) {
const modal = document.getElementById('project-modal');
if (event.target === modal) {
closeProjectModal();
}
}
8. 开发流程指南
8.1 Claude Projects 使⽤指南
创建新的Claude项⽬:
215
216
217
218
219
220
221
222
223
224
225
226
227
228
229
230
231
232
233
234
235
236
237
238
239
240
241
242
243
244
245
1. 在Claude中创建新的Projects
2. 上传整个项⽬⽂件夹结构
3. 设置项⽬描述和⽬标
与Claude协作的最佳实践:
代码块
## 向Claude提问的模板
我正在开发个⼈作品⽹站，当前遇到以下问题：
问题描述:
[具体描述你遇到的问题]
当前代码:
[粘贴相关代码⽚段]
期望效果:
[描述你想要实现的功能]
请帮我:
1. 分析问题原因
2. 提供解决⽅案
3. 给出完整的代码实现
4. 解释关键步骤
8.2 Gemini CLI 使⽤指南
安装和配置:
代码块
# 安装 Gemini CLI
npm install -g @google/generative-ai-cli
# 配置 API Key
gemini config set api-key YOUR_API_KEY
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
1
2
3
4
5
使⽤命令模板:
代码块
# 代码⽣成
gemini generate --prompt "为个⼈作品⽹站创建响应式导航栏的HTML和CSS代码"
# 代码审查
gemini review --file "./frontend/js/main.js" --prompt "检查这个JavaScript⽂件的代
码质量和潜在问题"
# 功能实现
gemini implement --prompt "实现⼀个⽂件上传功能，⽀持图⽚预览和进度显⽰"
8.3 开发步骤清单
第⼀阶段：基础搭建
创建项⽬⽂件夹结构
安装必要依赖
配置数据库
创建基础HTML结构
编写基础CSS样式
第⼆阶段：后端开发
创建Express服务器
实现数据库操作
创建API路由
实现⽂件上传功能
测试API接⼝
第三阶段：前端开发
实现数据加载和显⽰
创建交互功能
实现响应式设计
1
2
3
4
5
6
7
8
优化⽤⼾体验
第四阶段：后台管理
创建管理界⾯
实现CRUD操作
添加表单验证
实现⽂件管理
第五阶段：部署和优化
代码优化和压缩
配置⽣产环境
部署到云平台
设置域名和SSL
9. 调试和测试指南
9.1 常⽤调试技巧
浏览器开发者⼯具使⽤:
代码块
// 控制台调试
console.log('调试信息:', data);
console.error('错误信息:', error);
console.table(arrayData); // 表格形式显⽰数组
// 断点调试
debugger; // 在代码中设置断点
// ⽹络请求调试
// 在Network标签中查看API请求和响应
1
2
3
4
5
6
7
8
9
10
服务器调试:
代码块
// 在server.js中添加调试信息
console.log('收到请求:', req.method, req.url);
console.log('请求参数:', req.body);
console.log('响应数据:', responseData);
9.2 错误处理模板
前端错误处理:
代码块
async function apiCall() {
try {
const response = await fetch('/api/data');
if (!response.ok) {
throw new Error(`HTTP error! status: ${response.status}`);
}
const data = await response.json();
return data;
} catch (error) {
console.error('API调⽤失败:', error);
showNotification('操作失败，请重试', 'error');
throw error;
}
}
后端错误处理:
代码块
app.get('/api/data', (req, res) => {
try {
// 业务逻辑
res.json({ success: true, data: result });
1
2
3
4
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
1
2
3
4
} catch (error) {
console.error('处理请求失败:', error);
res.status(500).json({
success: false,
error: '服务器内部错误'
});
}
});
10. 部署指南
10.1 Vercel 部署
准备部署:
代码块
// package.json 添加脚本
{
"scripts": {
"start": "node backend/server.js",
"build": "echo 'No build step required'",
"dev": "nodemon backend/server.js"
}
}
创建 vercel.json:
代码块
{
"version": 2,
"builds": [
{
"src": "backend/server.js",
"use": "@vercel/node"
5
6
7
8
9
10
11
12
1
2
3
4
5
6
7
8
1
2
3
4
5
6
},
{
"src": "frontend/",
"use": "@vercel/static"
}
],
"routes": [
{
"src": "/api/(.*)",
"dest": "/backend/server.js"
},
{
"src": "/(.*)",
"dest": "/frontend/$1"
}
]
}
部署步骤:
1. 将代码推送到GitHub
2. 在Vercel中连接GitHub仓库
3. 配置环境变量
4. 点击部署
10.2 环境变量配置
⽣产环境变量:
代码块
NODE_ENV=production
PORT=3000
DB_PATH=./database/portfolio.db
UPLOAD_DIR=./uploads
ADMIN_PASSWORD=your_secure_password
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
1
2
3
4
5
11. 维护和备份策略
11.1 数据备份
创建备份脚本 (scripts/backup.js):
代码块
const fs = require('fs');
const path = require('path');
function createBackup() {
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = `./backups/${timestamp}`;
// 创建备份⽬录
fs.mkdirSync(backupDir, { recursive: true });
// 备份数据库
fs.copyFileSync('./database/portfolio.db', `${backupDir}/portfolio.db`);
// 备份上传⽂件
fs.cpSync('./uploads', `${backupDir}/uploads`, { recursive: true });
console.log(`备份完成: ${backupDir}`);
}
// 定期备份（每天）
setInterval(createBackup, 24 * 60 * 60 * 1000);
11.2 更新和维护
定期维护清单:
检查并更新依赖包
备份数据库和⽂件
检查服务器⽇志
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
优化数据库性能
更新内容和作品
依赖更新命令:
代码块
# 检查过时的包
npm outdated
# 更新所有包
npm update
# 更新特定包
npm install package-name@latest
12. 常⻅问题解决⽅案
12.1 ⽂件上传问题
问题: ⽂件上传失败
解决⽅案:
代码块
// 检查⽂件⼤⼩限制
const multer = require('multer');
const upload = multer({
storage: storage,
limits: {
fileSize: 10 * 1024 * 1024 // 10MB
},
fileFilter: (req, file, cb) => {
// 检查⽂件类型
if (file.mimetype.startsWith('image/') ||
file.mimetype.startsWith('video/') ||
1
2
3
4
5
6
7
8
1
2
3
4
5
6
7
8
9
10
11
file.mimetype === 'application/pdf') {
cb(null, true);
} else {
cb(new Error('不⽀持的⽂件类型'));
}
}
});
12.2 数据库连接问题
问题: 数据库连接失败
解决⽅案:
代码块
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/portfolio.db', (err) => {
if (err) {
console.error('数据库连接失败:', err.message);
// 尝试创建数据库⽬录
const fs = require('fs');
const path = require('path');
const dbDir = path.dirname('./database/portfolio.db');
if (!fs.existsSync(dbDir)) {
fs.mkdirSync(dbDir, { recursive: true });
}
} else {
console.log('数据库连接成功');
}
});
12.3 样式兼容性问题
问题: 不同浏览器样式显⽰不⼀致
解决⽅案:
12
13
14
15
16
17
18
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
/* 添加浏览器前缀 */
.element {
-webkit-transform: translateY(-5px);
-moz-transform: translateY(-5px);
-ms-transform: translateY(-5px);
transform: translateY(-5px);
}
/* 使⽤CSS Reset */
* {
margin: 0;
padding: 0;
box-sizing: border-box;
}
/* 确保兼容性 */
img {
max-width: 100%;
height: auto;
}
这个开发⽂档提供了完整的技术栈选择、环境配置、代码模板、开发流程和部署指南。你可以按照这
个模板逐步开发你的个⼈作品⽹站。记住每完成⼀个阶段都要测试功能，遇到问题时可以直接向
Claude或Gemini提问，并提供具体的错误信息和代码⽚段。
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20