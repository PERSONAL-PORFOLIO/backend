const Groq = require('groq-sdk');
const Profile = require('../models/Profile');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Project = require('../models/Project');
const Education = require('../models/Education');
const Settings = require('../models/Settings');
const Post = require('../models/Post');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* Build a concise portfolio context string from DB */
const buildContext = async () => {
  const [profile, skills, experiences, projects, education, settings, posts] = await Promise.all([
    Profile.findOne().lean(),
    Skill.find().lean(),
    Experience.find().sort({ startDate: -1 }).lean(),
    Project.find().lean(),
    Education.find().sort({ startDate: -1 }).lean(),
    Settings.findOne().lean(),
    Post.find({ published: true }).sort({ publishedAt: -1 }).limit(10).lean(),
  ]);

  const lines = [];

  if (profile) {
    lines.push(`NAME: ${profile.fullName}`);
    lines.push(`TITLE: ${profile.title}`);
    if (profile.location) lines.push(`LOCATION: ${profile.location}`);
    if (profile.summary) lines.push(`BIO: ${profile.summary}`);
    if (profile.email) lines.push(`EMAIL: ${profile.email}`);
    if (profile.githubUrl) lines.push(`GITHUB: ${profile.githubUrl}`);
    if (profile.linkedinUrl) lines.push(`LINKEDIN: ${profile.linkedinUrl}`);
  }

  if (skills.length) {
    const grouped = {};
    skills.forEach(s => {
      // Support both multi-category (categories:[]) and legacy (category:String)
      const cats = s.categories?.length ? s.categories : [s.category || 'Other'];
      cats.forEach(cat => {
        if (!grouped[cat]) grouped[cat] = [];
        if (!grouped[cat].includes(s.name)) grouped[cat].push(s.name);
      });
    });
    lines.push('\nSKILLS:');
    Object.entries(grouped).forEach(([cat, names]) => {
      lines.push(`  ${cat}: ${names.join(', ')}`);
    });
  }

  if (experiences.length) {
    lines.push('\nEXPERIENCE:');
    experiences.forEach(e => {
      const period = `${e.startDate ? new Date(e.startDate).getFullYear() : '?'} – ${e.current ? 'Present' : (e.endDate ? new Date(e.endDate).getFullYear() : '?')}`;
      lines.push(`  • ${e.position} at ${e.company} (${period})`);
      if (e.description) lines.push(`    ${e.description.slice(0, 120)}...`);
    });
  }

  if (projects.length) {
    lines.push('\nPROJECTS:');
    projects.forEach(p => {
      lines.push(`  • ${p.title}${p.technologies?.length ? ' [' + p.technologies.join(', ') + ']' : ''}`);
      if (p.description) lines.push(`    ${p.description.slice(0, 100)}...`);
      if (p.liveUrl) lines.push(`    Live: ${p.liveUrl}`);
      if (p.githubUrl) lines.push(`    Code: ${p.githubUrl}`);
    });
  }

  if (education.length) {
    lines.push('\nEDUCATION:');
    education.forEach(e => {
      lines.push(`  • ${e.degree} – ${e.institution} (${e.startDate ? new Date(e.startDate).getFullYear() : '?'}–${e.endDate ? new Date(e.endDate).getFullYear() : 'Present'})`);
    });
  }

  if (posts?.length) {
    lines.push('\nBLOG POSTS:');
    posts.forEach(p => {
      lines.push(`  • "${p.title}" — /blog/${p.slug}`);
      if (p.excerpt) lines.push(`    ${p.excerpt.slice(0, 100)}`);
      if (p.tags?.length) lines.push(`    Tags: ${p.tags.join(', ')}`);
    });
  }

  if (settings?.siteUrl) lines.push(`\nPORTFOLIO URL: ${settings.siteUrl}`);

  return lines.join('\n');
};

/* POST /api/ai/chat  — SSE streaming (public) */
const chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'messages array is required' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ success: false, message: 'AI not configured (GROQ_API_KEY missing)' });
    }

    const context = await buildContext();

    const systemPrompt = `You are AskTim, an AI assistant built into Tim's software engineering portfolio.
Your job is to help visitors learn about Tim based ONLY on the information provided below.

PORTFOLIO DATA:
${context}

RULES:
- Answer questions about Tim's skills, experience, projects, education and background.
- If asked something not covered in the data, say you don't have that info but suggest they use the contact form.
- Keep answers concise (2-4 sentences max unless a list is needed).
- Be friendly, professional, and speak positively about Tim.
- Never make up information not in the data above.
- If asked who you are, say: "I'm AskTim, an AI assistant that helps you learn about Tim's work and background."
- Refer to the portfolio owner as "Tim" not "they" or "the owner".
- IMPORTANT: When mentioning any URL or link, ALWAYS include the full URL with https:// prefix (e.g. https://linkedin.com/in/timbin). Never write a URL without the protocol.`;

    const trimmed = messages.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content).slice(0, 1000),
    }));

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'system', content: systemPrompt }, ...trimmed],
      max_tokens: 512,
      temperature: 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('AI chat error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'AI service error. Please try again.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Stream interrupted.' })}\n\n`);
      res.end();
    }
  }
};

module.exports = { chat };
