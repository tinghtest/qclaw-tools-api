/**
 * QClaw Tools API v2.0 - 全能工具API (Jimp 0.22+ 兼容)
 * 修照片尺寸 / 自助美颜 / 表情包 / 滤镜 / 文本工具
 */
const express = require('express');
const QRCode = require('qrcode');
const { Jimp, loadFont, measureText, measureTextHeight, rgbaToInt, cssColorToHex } = require('jimp');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ─── 首页 ───────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok', name: 'QClaw Tools API', version: '2.0.0',
    tagline: '全能图片工具 API - RapidAPI 首发',
    endpoints: {
      'POST /image/resize': '修改图片尺寸',
      'POST /image/beautify': '自助美颜（亮度/对比度/饱和度）',
      'POST /image/meme': '生成表情包（顶部+底部文字）',
      'POST /image/filter': '图片滤镜（灰度/反色/怀旧/冷色/暖色等）',
      'POST /image/thumbnail': '生成缩略图',
      'POST /image/watermark': '添加文字水印',
      'POST /image/frames': '帧动画效果（GIF预览）',
      'POST /text/sticker': '文字转彩色贴纸（圆形/方形）',
      'POST /text/analyze': '文本分析（字数/词频/关键词）',
      'POST /text/transform': '文本转换（大小写/去重/反转等）',
      'GET  /qrcode': '二维码生成（PNG/SVG/BASE64）',
      'GET  /url/encode': 'URL编码',
      'GET  /url/decode': 'URL解码',
      'GET  /base64/encode': 'Base64编码',
      'GET  /base64/decode': 'Base64解码',
      'GET  /random/password': '随机密码生成',
      'GET  /random/uuid': 'UUID批量生成',
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok', uptime: Math.floor(process.uptime()),
    memory: Math.round(process.memoryUsage().heapUsed / 1e6) + 'MB',
    ts: new Date().toISOString()
  });
});

// ─── 工具：加载图片 ────────────────────
async function loadImage(body) {
  if (body.url) {
    const r = await fetch(body.url);
    return await Jimp.read(Buffer.from(await r.arrayBuffer()));
  }
  if (body.image) {
    const str = body.image;
    const buf = str.startsWith('data:') ? Buffer.from(str.split(',')[1], 'base64') : Buffer.from(str, 'base64');
    return await Jimp.read(buf);
  }
  throw new Error('需要 image 或 url 参数');
}

// ─── 工具：输出图片 ────────────────────
function outputImg(img, format = 'png') {
  const mime = format === 'jpg' || format === 'jpeg' ? Jimp.MIME_JPEG : Jimp.MIME_PNG;
  const buf = img.getBuffer(mime);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

// ─── 1. 修改图片尺寸 ──────────────────
app.post('/image/resize', async (req, res) => {
  try {
    const { width = 300, height, keepAspect = true, format = 'png' } = req.body;
    const img = await loadImage(req.body);
    const ow = img.width, oh = img.height;
    if (keepAspect && !height) img.resize({ w: width });
    else if (keepAspect && !width) img.resize({ h: height });
    else if (keepAspect) img.resize({ w: width, h: height, mode: Jimp.RESIZE_BICUBIC });
    else img.resize({ w: width || Jimp.AUTO, h: height || Jimp.AUTO });
    res.json({ success: true, original: { width: ow, height: oh }, resized: { width: img.width, height: img.height }, data: outputImg(img, format) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── 2. 自助美颜 ──────────────────────
app.post('/image/beautify', async (req, res) => {
  try {
    const { brightness = 1, contrast = 1, saturation = 1, format = 'png' } = req.body;
    const img = await loadImage(req.body);
    if (brightness != 1) img.brightness(brightness - 1);
    if (contrast != 1) img.contrast(contrast - 1);
    if (saturation != 1) img.color([{ apply: 'saturate', params: [Math.round((saturation - 1) * 100)] }]);
    res.json({ success: true, applied: { brightness, contrast, saturation }, data: outputImg(img, format) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── 3. 生成表情包 ────────────────────
app.post('/image/meme', async (req, res) => {
  try {
    const { topText, bottomText, image, bgColor = '#FFFFFF', format = 'png' } = req.body;
    let img;
    if (image) {
      img = await loadImage({ image });
      img.cover({ w: 500, h: 500 });
    } else {
      img = new Jimp({ width: 500, height: 500, color: rgbaToInt(255, 255, 255, 255) });
    }
    const w = img.width, h = img.height;

    const font = await loadFont(Jimp.FONT_SANS_64_WHITE);
    const fontH = measureTextHeight(font, 'M', w);

    if (topText) {
      const text = topText.toUpperCase();
      const tw = measureText(font, text);
      const x = Math.floor((w - tw) / 2);
      img.print({ text, x, y: 10, font, color: '#000000FF' });
      img.print({ text, x: x - 2, y: 10, font, color: '#000000FF' });
      img.print({ text, x: x + 2, y: 10, font, color: '#000000FF' });
      img.print({ text, x, y: 8, font, color: '#000000FF' });
      img.print({ text, x, y: 12, font, color: '#000000FF' });
      img.print({ text, x: x - 1, y: 9, font, color: '#FFFFFFFF' });
      img.print({ text, x: x + 1, y: 9, font, color: '#FFFFFFFF' });
    }
    if (bottomText) {
      const text = bottomText.toUpperCase();
      const tw = measureText(font, text);
      const x = Math.floor((w - tw) / 2);
      const y = h - fontH - 15;
      img.print({ text, x: x - 2, y, font, color: '#000000FF' });
      img.print({ text, x: x + 2, y, font, color: '#000000FF' });
      img.print({ text, x, y: y - 2, font, color: '#000000FF' });
      img.print({ text, x, y: y + 2, font, color: '#000000FF' });
      img.print({ text, x: x - 1, y, font, color: '#FFFFFFFF' });
      img.print({ text, x: x + 1, y, font, color: '#FFFFFFFF' });
    }
    res.json({ success: true, data: outputImg(img, format) });
  } catch (e) { res.status(500).json({ error: '表情包生成失败: ' + e.message }); }
});

// ─── 4. 图片滤镜 ──────────────────────
app.post('/image/filter', async (req, res) => {
  try {
    const { filter = 'normal', format = 'png' } = req.body;
    const img = await loadImage(req.body);
    switch (filter) {
      case 'grayscale': case 'gray': img.greyscale(); break;
      case 'invert': img.invert(); break;
      case 'sepia': img.color([{ apply: 'sepia', params: [100] }]); break;
      case 'vintage': img.greyscale().contrast(0.2).color([{ apply: 'saturate', params: [-30] }]); break;
      case 'cool': img.color([{ apply: 'lighten', params: [10] }, { apply: 'desaturate', params: [20] }]); break;
      case 'warm': img.color([{ apply: 'saturate', params: [20] }, { apply: 'hue', params: [15] }]); break;
      case 'bright': img.brightness(0.3).contrast(0.1); break;
      case 'dramatic': img.contrast(0.5).color([{ apply: 'desaturate', params: [40] }]); break;
      case 'fade': img.opacity(0.7).brightness(0.1); break;
      case 'negative': img.invert(); break;
      default: break;
    }
    res.json({ success: true, filter, data: outputImg(img, format) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── 5. 生成缩略图 ────────────────────
app.get('/image/thumbnail', async (req, res) => {
  try {
    const { url, size = 200 } = req.query;
    if (!url) return res.status(400).json({ error: '需要 url 参数' });
    const img = await Jimp.read(Buffer.from(await (await fetch(url)).arrayBuffer()));
    img.cover({ w: parseInt(size), h: parseInt(size) });
    res.json({ success: true, size: parseInt(size), data: outputImg(img, 'jpg') });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── 6. 添加水印 ─────────────────────
app.post('/image/watermark', async (req, res) => {
  try {
    const { text, opacity = 1, position = 'bottom-right', format = 'png' } = req.body;
    const img = await loadImage(req.body);
    const w = img.width, h = img.height;
    const font = await loadFont(Jimp.FONT_SANS_16_WHITE);
    const tw = measureText(font, text);
    const th = measureTextHeight(font, text, w);
    const pad = 10;
    let x = pad, y = h - th - pad;
    if (position === 'bottom-left') { x = pad; y = h - th - pad; }
    else if (position === 'top-left') { x = pad; y = pad; }
    else if (position === 'top-right') { x = w - tw - pad; y = pad; }
    else if (position === 'center') { x = Math.floor((w - tw) / 2); y = Math.floor((h - th) / 2); }
    else { x = w - tw - pad; } // bottom-right
    img.print({ text, x, y, font, color: '#000000AA' });
    res.json({ success: true, data: outputImg(img, format) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── 7. 帧动画效果 ────────────────────
app.post('/image/frames', async (req, res) => {
  try {
    const { effect = 'fade', frames = 5, format = 'png' } = req.body;
    const img = await loadImage(req.body);
    const n = Math.min(Math.max(parseInt(frames), 2), 20);
    img.cover({ w: 300, h: 300 });
    const firstFrame = img.clone();
    if (effect === 'fade') firstFrame.opacity(0.3);
    if (effect === 'rotate') firstFrame.rotate(90);
    res.json({ success: true, effect, frameCount: n, message: '帧动画生成成功（完整GIF需ffmpeg）', data: outputImg(firstFrame, format), frames: Array.from({ length: n }, (_, i) => ({ frame: i + 1, timestamp: `${(i / 10).toFixed(1)}s` })) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── 8. 文字转贴纸 ───────────────────
app.post('/text/sticker', async (req, res) => {
  try {
    const { text = 'HELLO', bgColor = '#FFFF00', style = 'circle' } = req.body;
    const size = 400;
    let img;
    if (style === 'circle') {
      img = new Jimp({ width: size, height: size, color: '#00000000' });
      const r = size / 2;
      const rInt = rgbaToInt(255, 255, 0, 255);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = x - r, dy = y - r;
          if (dx * dx + dy * dy <= r * r) img.setPixelColor(rInt, x, y);
        }
      }
    } else {
      img = new Jimp({ width: size, height: size, color: '#FFFF00FF' });
    }
    const font = await loadFont(Jimp.FONT_SANS_64_WHITE);
    const tw = measureText(font, text);
    const th = measureTextHeight(font, text, size);
    const x = Math.floor((size - tw) / 2);
    const y = Math.floor((size - th) / 2);
    img.print({ text, x, y, font, color: '#000000FF' });
    res.json({ success: true, data: outputImg(img, 'png') });
  } catch (e) { res.status(500).json({ error: '贴纸生成失败: ' + e.message }); }
});

// ─── 9. 文本分析 ─────────────────────
app.post('/text/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: '需要 text 参数' });
    const chinese = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const words = text.trim().split(/\s+/);
    const ngrams = [];
    for (let i = 0; i < text.length - 1; i++) ngrams.push(text.slice(i, i + 2));
    const freq = {};
    ngrams.forEach(n => freq[n] = (freq[n] || 0) + 1);
    const keywords = Object.entries(freq).filter(([k]) => /[\u4e00-\u9fff]{2}/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w, c]) => ({ word: w, count: c }));
    res.json({ success: true, stats: { chars: text.length, chinese, english: words.filter(w => /^[a-zA-Z]+$/.test(w)).length, words: words.length, lines: text.split('\n').length, sentences: text.split(/[.!?。！？]/).filter(Boolean).length, reading_min: Math.ceil(text.length / 500) }, keywords });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── 10. 文本转换 ────────────────────
app.post('/text/transform', async (req, res) => {
  try {
    const { text, action } = req.body;
    if (!text || !action) return res.status(400).json({ error: '需要 text 和 action 参数' });
    const actions = {
      uppercase: () => text.toUpperCase(),
      lowercase: () => text.toLowerCase(),
      capitalize: () => text.replace(/\b\w/g, c => c.toUpperCase()),
      trim: () => text.trim(),
      reverse: () => [...text].reverse().join(''),
      'remove-blank-lines': () => text.split('\n').filter(l => l.trim()).join('\n'),
      'dedupe-lines': () => [...new Set(text.split('\n'))].join('\n'),
      slugify: () => text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, ''),
      'word-count': () => String(text.trim().split(/\s+/).length),
      'char-count': () => String(text.length),
    };
    if (!actions[action]) return res.status(400).json({ error: `未知操作: ${action}`, valid: Object.keys(actions) });
    const result = actions[action]();
    res.json({ success: true, action, result, chars: String(result).length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── 11. 二维码生成 ───────────────────
app.get('/qrcode', async (req, res) => {
  try {
    const { text = 'https://example.com', size = 300, format = 'base64' } = req.query;
    const opts = { width: parseInt(size), margin: 2, errorCorrectionLevel: 'M' };
    if (format === 'svg') { const svg = await QRCode.toString(text, { ...opts, type: 'svg' }); res.type('image/svg+xml').send(svg); }
    else if (format === 'png') { const buf = await QRCode.toBuffer(text, opts); res.type('image/png').send(buf); }
    else { const data = await QRCode.toDataURL(text, opts); res.json({ success: true, data }); }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── 12. URL 编解码 ───────────────────
app.get('/url/encode', (req, res) => {
  const { text } = req.query;
  if (!text) return res.status(400).json({ error: '需要 text 参数' });
  res.json({ success: true, encoded: encodeURIComponent(text) });
});
app.get('/url/decode', (req, res) => {
  const { text } = req.query;
  if (!text) return res.status(400).json({ error: '需要 text 参数' });
  try { res.json({ success: true, decoded: decodeURIComponent(text) }); }
  catch { res.status(400).json({ error: '无效的URL编码' }); }
});

// ─── 13. Base64 编解码 ────────────────
app.get('/base64/encode', (req, res) => {
  const { text } = req.query;
  if (!text) return res.status(400).json({ error: '需要 text 参数' });
  res.json({ success: true, encoded: Buffer.from(text).toString('base64') });
});
app.get('/base64/decode', (req, res) => {
  const { text } = req.query;
  if (!text) return res.status(400).json({ error: '需要 text 参数' });
  try { res.json({ success: true, decoded: Buffer.from(text, 'base64').toString() }); }
  catch { res.status(400).json({ error: '无效的Base64' }); }
});

// ─── 14. 随机密码 ────────────────────
app.get('/random/password', (req, res) => {
  const { length = 16, chars = 'all' } = req.query;
  const len = Math.min(Math.max(parseInt(length), 4), 128);
  const pools = { lowercase: 'abcdefghijklmnopqrstuvwxyz', uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', digits: '0123456789', special: '!@#$%^&*()_+-=', all: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=' };
  const pool = pools[chars] || pools.all;
  const password = Array.from({ length }, () => pool[Math.floor(Math.random() * pool.length)]).join('');
  res.json({ success: true, password, length: len });
});

// ─── 15. UUID生成 ────────────────────
app.get('/random/uuid', (req, res) => {
  const { count = 1 } = req.query;
  const n = Math.min(Math.max(parseInt(count), 1), 100);
  const uuids = Array.from({ length: n }, () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => (Math.random() * 16 | (c === 'x' ? 0 : 8)).toString(16)));
  res.json({ success: true, uuids: n === 1 ? uuids[0] : uuids });
});

// ─── 错误处理 ─────────────────────────
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: '服务器错误' }); });

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`QClaw Tools API v2.0 running on :${PORT}`));
