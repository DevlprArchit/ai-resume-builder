import express from 'express';
import Resume from '../models/Resume.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/resumes
// @desc    Get all resumes for logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/resumes/:id
// @desc    Get single resume
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    
    if (resume.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/resumes
// @desc    Create a new resume
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const resume = new Resume({
      userId: req.user.id,
      title: req.body.title || 'Untitled Resume',
      templateId: req.body.templateId || 'modern',
      // initialize empty sections
    });
    
    const createdResume = await resume.save();
    res.status(201).json(createdResume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/resumes/:id
// @desc    Update resume
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    
    if (resume.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedResume = await Resume.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedResume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/resumes/:id
// @desc    Delete resume
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    
    if (resume.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await resume.deleteOne();
    res.json({ message: 'Resume removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
