const mongoose = require('mongoose');

const pageSeoSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  siteTitle: { type: String, default: 'Tim Bin - Software Engineer' },
  seoDescription: { type: String, default: 'Software Engineer specializing in ColdFusion, Vue.js, Node.js and modern web technologies.' },
  seoKeywords: { type: String, default: 'developer, coldfusion, vuejs, reactjs nodejs, fullstack, portfolio' },
  ogImage: { type: String, default: '' },
  siteUrl: { type: String, default: '' },

  pageSeo: {
    home: { type: pageSeoSchema, default: () => ({}) },
    about: { type: pageSeoSchema, default: () => ({}) },
    skills: { type: pageSeoSchema, default: () => ({}) },
    experience: { type: pageSeoSchema, default: () => ({}) },
    projects: { type: pageSeoSchema, default: () => ({}) },
    education: { type: pageSeoSchema, default: () => ({}) },
    certificates: { type: pageSeoSchema, default: () => ({}) },
    contact: { type: pageSeoSchema, default: () => ({}) },
  },

  navVisibility: {
    about: { type: Boolean, default: true },
    skills: { type: Boolean, default: true },
    experience: { type: Boolean, default: true },
    projects: { type: Boolean, default: true },
    education: { type: Boolean, default: true },
    certificates: { type: Boolean, default: true },
    blog: { type: Boolean, default: true },
    contact: { type: Boolean, default: true },
  },

  showFooter: { type: Boolean, default: true },
  footerText: { type: String, default: '@2026 Tim Bin' },
  notificationEmail: { type: String, default: '' },
  allowContactForm: { type: Boolean, default: true },

  heroBadge: { type: String, default: 'Available for work' },
  ctaHeading: { type: String, default: 'Build Something Amazing Together' },
  ctaSubtext: { type: String, default: 'Open to freelance projects and full-time roles.' },
  typingRoles: {
    type: [String],
    default: ['Software Engineer', 'Vue.js Specialist', 'Node.js Engineer', 'UI/UX Enthusiast', 'Problem Solver'],
  },

  availableForWork: { type: Boolean, default: true },

  autoReply: {
    enabled: { type: Boolean, default: false },
    subject: { type: String, default: 'Thanks for reaching out, {{name}}!' },
    body: { type: String, default: '' }, // populated with default in controller if empty
  },

  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: { type: String, default: 'Site is under maintenance. Back soon!' },
  googleAnalyticsId: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
