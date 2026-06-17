require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Project = require('../models/Project');
const Education = require('../models/Education');

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Profile.deleteMany({});
  await Skill.deleteMany({});
  await Experience.deleteMany({});
  await Project.deleteMany({});
  await Education.deleteMany({});

  // Create admin user
  await User.create({
    username: 'Tim BIN',
    email: 'admin@tim.dev',
    password: 'admin@2026',
    role: 'admin',
  });

  // Create profile
  await Profile.create({
    fullName: 'Tim Bin',
    title: 'Software Enginneer',
    summary: 'Passionate Software Enginneer with expertise in building modern web applications. Experienced in React, Vue, Node.js, and cloud technologies. I love turning complex problems into elegant, user-friendly solutions.',
    location: 'Your City, Country',
    email: 'admin@tim.dev',
    githubUrl: 'https://github.com/timbin',
    linkedinUrl: 'https://linkedin.com/in/timbin',
  });

  // Create skills
  const skills = [
    { name: 'ReactJS', level: 90, category: 'Frontend', order: 1 },
    { name: 'VueJS', level: 85, category: 'Frontend', order: 2 },
    { name: 'HTML/CSS', level: 95, category: 'Frontend', order: 3 },
    { name: 'JavaScript', level: 90, category: 'Frontend', order: 4 },
    { name: 'Node.js', level: 85, category: 'Backend', order: 1 },
    { name: 'Express.js', level: 85, category: 'Backend', order: 2 },
    { name: 'ColdFusion FW/1', level: 80, category: 'Backend', order: 3 },
    { name: 'MongoDB', level: 80, category: 'Database', order: 1 },
    { name: 'MariaDB', level: 80, category: 'Database', order: 2 },
    { name: 'SQL Server', level: 75, category: 'Database', order: 3 },
    { name: 'Ionic', level: 80, category: 'Mobile', order: 1 },
    { name: 'Docker', level: 75, category: 'DevOps', order: 1 },
    { name: 'Git', level: 90, category: 'DevOps', order: 2 },
  ];
  await Skill.insertMany(skills);

  // Create experiences
  await Experience.insertMany([
    {
      company: 'Tech Company A',
      position: 'Software Enginneer',
      description: 'Developed and maintained multiple web applications using React, Node.js, and MongoDB. Led frontend architecture decisions and mentored junior developers.',
      startDate: new Date('2022-01-01'),
      endDate: null,
      technologies: ['ReactJS', 'Node.js', 'MongoDB', 'Docker'],
      order: 1,
    },
    {
      company: 'Tech Company B',
      position: 'Frontend Developer',
      description: 'Built responsive web interfaces using VueJS and Ionic for mobile. Collaborated with backend teams to integrate REST APIs.',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2021-12-31'),
      technologies: ['VueJS', 'Ionic', 'MariaDB'],
      order: 2,
    },
  ]);

  // Create projects
  await Project.insertMany([
    {
      title: 'Student Management System',
      description: 'A comprehensive student management platform with enrollment tracking, grade management, attendance, and reporting. Built with React frontend and Node.js backend.',
      technologies: ['ReactJS', 'Node.js', 'MongoDB', 'Express.js'],
      featured: true,
      order: 1,
    },
    {
      title: 'Mommy Leadership Academy System',
      description: 'A learning management system designed for the Mommy Leadership Academy featuring course management, user enrollment, progress tracking, and content delivery.',
      technologies: ['VueJS', 'Node.js', 'MySQL', 'ColdFusion FW/1'],
      featured: true,
      order: 2,
    },
    {
      title: 'Online Watch Store',
      description: 'A full-featured e-commerce platform for luxury watches with product catalog, shopping cart, order management, payment integration, and admin dashboard.',
      technologies: ['ReactJS', 'Node.js', 'MongoDB', 'Docker'],
      featured: true,
      order: 3,
    },
    {
      title: '3D Project Timeline Visualization',
      description: 'An interactive 3D visualization tool for project timelines using Three.js. Features drag-and-drop task management, dependency mapping, and real-time collaboration.',
      technologies: ['ReactJS', 'Three.js', 'Node.js', 'MongoDB'],
      featured: true,
      order: 4,
    },
  ]);

  // Create education
  await Education.insertMany([
    {
      school: 'University of Technology',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: new Date('2016-09-01'),
      endDate: new Date('2020-06-01'),
      order: 1,
    },
  ]);

  console.log('✅ Seed data created successfully!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
