import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, default: 'Untitled Resume' },
  templateId: { type: String, required: true, default: 'modern' },
  personalInfo: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
  },
  summary: { type: String, default: '' },
  education: [{
    school: { type: String, default: '' },
    degree: { type: String, default: '' },
    year: { type: String, default: '' },
    gpa: { type: String, default: '' },
  }],
  experience: [{
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    duration: { type: String, default: '' },
    bullets: [{ type: String }],
  }],
  projects: [{
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    techStack: { type: String, default: '' },
    link: { type: String, default: '' },
  }],
  skills: [{ type: String }],
  certifications: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('Resume', resumeSchema);
