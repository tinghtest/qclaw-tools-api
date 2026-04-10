# QClaw Tools API - 全能图片工具 API

> **多合一开发者工具 API | 修图/美颜/表情包/滤镜/RapidAPI首发**

🌐 **部署地址**: (待部署后填写)

📦 **RapidAPI**: (待上架)

## 🔥 功能总览

| 类别 | 接口 | 说明 |
|------|------|------|
| 🖼️ **图片处理** | `POST /image/resize` | 修改图片尺寸，支持保持比例 |
| ✨ **自助美颜** | `POST /image/beautify` | 亮度/对比度/饱和度调节 |
| 😂 **表情包生成** | `POST /image/meme` | 顶部+底部文字，经典表情包模板 |
| 🎨 **图片滤镜** | `POST /image/filter` | 灰度/反色/怀旧/冷色/暖色/戏剧/褪色等10+种滤镜 |
| 🖼️ **缩略图** | `GET /image/thumbnail` | 从URL快速生成缩略图 |
| 💧 **水印** | `POST /image/watermark` | 添加文字水印，6种位置 |
| 🎬 **帧动画** | `POST /image/frames` | 生成动画帧序列（GIF效果） |
| 🟡 **表情贴纸** | `POST /text/sticker` | 文字转彩色圆形/方形贴纸 |
| 📝 **文本分析** | `POST /text/analyze` | 字数/词频/关键词提取 |
| 🔄 **文本转换** | `POST /text/transform` | 大小写/去重/反转/SEO化等10种转换 |
| 📱 **二维码** | `GET /qrcode` | PNG/SVG/BASE64格式 |
| 🔗 **URL编解码** | `GET /url/encode` `GET /url/decode` | URL安全编码 |
| 📦 **Base64** | `GET /base64/encode` `GET /base64/decode` | Base64编码解码 |
| 🎲 **随机密码** | `GET /random/password` | 自定义长度和字符集 |
| 🆔 **UUID** | `GET /random/uuid` | 批量UUID生成 |

## 🚀 快速开始

### 本地运行

```bash
npm install
npm start
# 访问 http://localhost:3001
```

### 部署到 Render（推荐·免费）

1. 访问 [render.com](https://render.com) → 用 GitHub 登录
2. **New +** → **Web Service** → 连接 `tinghtest/qclaw-tools-api`
3. 设置：
   - **Root Directory**: `rapidapi-tools`
   - **Build Command**: `cd rapidapi-tools && npm install`
   - **Start Command**: `cd rapidapi-tools && node server.js`
4. **Create Web Service** → 等待部署（约1分钟）
5. 复制分配的 URL（如 `https://qclaw-tools-api.onrender.com`）

### 备用：Railway 部署

1. 访问 [railway.app](https://railway.app) → 用 GitHub 登录
2. **New Project** → **Deploy from GitHub repo**
3. 选择仓库，设置相同参数
4. Railway 自动分配 HTTPS URL

## 📖 API 文档

### 🖼️ 图片处理

```javascript
// 修改尺寸
POST /image/resize
Body: { "image": "base64...", "width": 800, "height": 600, "keepAspect": true }

// 美颜
POST /image/beautify
Body: { "image": "base64...", "brightness": 1.2, "contrast": 1.1, "saturation": 1.3 }

// 表情包
POST /image/meme
Body: { "topText": "我太难了", "bottomText": "真的", "image": "base64..." }

// 滤镜
POST /image/filter
Body: { "image": "base64...", "filter": "vintage" }
// 滤镜类型: normal | grayscale | gray | invert | sepia | vintage | cool | warm | bright | dramatic | fade | negative

// 缩略图
GET /image/thumbnail?url=https://example.com/image.jpg&size=200

// 水印
POST /image/watermark
Body: { "image": "base64...", "text": "©QClaw", "position": "bottom-right" }

// 帧动画
POST /image/frames
Body: { "image": "base64...", "effect": "fade", "frames": 10 }
```

### 📝 文本工具

```javascript
// 文本分析
POST /text/analyze
Body: { "text": "这是一段测试文本，包含中文和English混合。" }
// 返回: { chars, chinese, english, words, lines, sentences, keywords[] }

// 文本转换
POST /text/transform
Body: { "text": "Hello World", "action": "slugify" }
// action: uppercase | lowercase | capitalize | trim | reverse | remove-blank-lines | dedupe-lines | slugify | word-count | char-count

// 表情贴纸
POST /text/sticker
Body: { "text": "HELLO!", "bgColor": "#FFFF00", "style": "circle" }
```

### 🎲 实用工具

```javascript
// 二维码
GET /qrcode?text=https://example.com&size=300&format=base64|png|svg

// URL编解码
GET /url/encode?text=hello world
GET /url/decode?text=hello%20world

// Base64
GET /base64/encode?text=hello
GET /base64/decode?text=aGVsbG8=

// 随机密码
GET /random/password?length=16&chars=all|lowercase|uppercase|digits|special

// UUID
GET /random/uuid?count=5
```

## 💰 RapidAPI 上架指南

### 1. 注册 RapidAPI 开发者账号
访问 [rapidapi.com/developer/register](https://rapidapi.com/developer/register)

### 2. 创建 API
- 点击 **Add New API**
- 填写：
  - **API Name**: `qclaw-tools-api`
  - **Short Description**: `全能图片工具API - 修图/美颜/表情包/滤镜`
  - **Category**: Developer Tools / Image Processing

### 3. 填写 Base URL
填入 Render/Railway 部署的 URL

### 4. 添加端点
逐个添加 `/image/resize`、`/image/beautify`、`/image/meme` 等所有接口

### 5. 设置定价（建议）

| 套餐 | 价格 | 月调用量 |
|------|------|---------|
| 🥇 Free | $0 | 500次 |
| 🥈 Basic | $4.99/月 | 10,000次 |
| 🥉 Pro | $14.99/月 | 50,000次 |
| 💎 Ultra | $39.99/月 | 无限制 |

### 6. 发布
提交审核，通常1-3个工作日通过

## 💵 收益潜力

| 套餐 | 月费 | 假设用户数 | 月收入 |
|------|------|-----------|--------|
| Basic | $4.99 | 50人 | **$249.50** |
| Pro | $14.99 | 20人 | **$299.80** |
| Ultra | $39.99 | 10人 | **$399.90** |

**你得 80%，RapidAPI 抽 20%**

## 🛠️ 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js
- **图片处理**: Jimp 1.6.1
- **二维码**: qrcode
- **部署**: Render / Railway

## 📄 License

MIT
