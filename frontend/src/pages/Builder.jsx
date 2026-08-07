import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useResumeStore from '../store/useResumeStore';
import ResumePreview from '../components/ResumePreview';
import { Sparkles, X, Plus, Download, Eye } from 'lucide-react';
import html2pdf from 'html2pdf.js';

function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentResume, fetchResume, updateResumeData, saveResume, isLoading } = useResumeStore();
  
  const [activeStep, setActiveStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [atsScanning, setAtsScanning] = useState(false);
  
  // States for AI enhancements
  const [aiState, setAiState] = useState({
    summary: { status: 'idle', original: '', polished: '' },
    // we could add more for experience bullets
  });

  const steps = [
    { id: 'personalInfo', label: 'Personal Info' },
    { id: 'summary', label: 'Summary' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'education', label: 'Education' },
    { id: 'review', label: 'Review & Export' }
  ];

  useEffect(() => {
    if (id) {
      fetchResume(id);
    }
  }, [id, fetchResume]);

  useEffect(() => {
    if (currentResume && !isSaving) {
      // simulate autosave
      setIsSaving(true);
      const timer = setTimeout(() => {
        saveResume();
        setIsSaving(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentResume]);

  const handleUpdate = (section, field, value) => {
    if (section === 'title') {
      useResumeStore.setState(state => ({
        currentResume: { ...state.currentResume, title: value }
      }));
    } else {
      updateResumeData(section, { ...currentResume[section], [field]: value });
    }
  };

  const handleStringUpdate = (section, value) => {
     updateResumeData(section, value);
  };

  const handleArrayAdd = (section, emptyItem) => {
    const currentArray = currentResume[section] || [];
    updateResumeData(section, [...currentArray, emptyItem]);
  };

  const handleArrayUpdate = (section, index, field, value) => {
    const currentArray = [...(currentResume[section] || [])];
    if (field === 'bullets') {
      currentArray[index][field] = value.split('\n');
    } else {
      currentArray[index][field] = value;
    }
    updateResumeData(section, currentArray);
  };

  const handleArrayRemove = (section, index) => {
    const currentArray = [...(currentResume[section] || [])];
    currentArray.splice(index, 1);
    updateResumeData(section, currentArray);
  };

  const handleSkillAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const currentSkills = currentResume.skills || [];
      if (!currentSkills.includes(e.target.value.trim())) {
        updateResumeData('skills', [...currentSkills, e.target.value.trim()]);
      }
      e.target.value = '';
    }
  };

  const handleSkillRemove = (skill) => {
    const currentSkills = currentResume.skills || [];
    updateResumeData('skills', currentSkills.filter(s => s !== skill));
  };

  const handleAIEnhance = async (section, fieldPath, text) => {
    setAiState(prev => ({
      ...prev,
      [section]: { status: 'thinking', original: text, polished: '' }
    }));
    
    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text, contextType: section })
      });
      const result = await response.json();
      const polished = result.enhancedText;
      
      setAiState(prev => ({
        ...prev,
        [section]: { status: 'review', original: text, polished }
      }));
      handleStringUpdate(section, polished);
    } catch (error) {
      console.error("AI Enhance failed:", error);
      setAiState(prev => ({
        ...prev,
        [section]: { status: 'idle', original: '', polished: '' }
      }));
      alert("AI enhancement failed. Please try again.");
    }
  };

  const acceptEnhancement = (section) => {
    setAiState(prev => ({
      ...prev,
      [section]: { status: 'idle', original: '', polished: '' }
    }));
  };

  const discardEnhancement = (section) => {
    handleStringUpdate(section, aiState[section].original);
    setAiState(prev => ({
      ...prev,
      [section]: { status: 'idle', original: '', polished: '' }
    }));
  };

  const handleExportPDF = () => {
    const element = document.getElementById('resume-preview-content');
    if (!element) return;
    
    const opt = {
      margin:       0,
      filename:     `${currentResume.title || 'Resume'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const handleScanWithAI = async () => {
    setAtsScanning(true);
    try {
      const response = await fetch('/api/checkATS', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: currentResume })
      });
      const atsData = await response.json();
      updateResumeData('atsScore', atsData.score);
      updateResumeData('atsMissingKeywords', atsData.missingKeywords);
      updateResumeData('atsSuggestions', atsData.suggestions);
    } catch (error) {
      console.error("ATS Scan failed:", error);
      alert("ATS scan failed. Please try again.");
    } finally {
      setAtsScanning(false);
    }
  };

  if (isLoading || !currentResume) {
    return <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-sm text-slate-light">LOADING...</div>;
  }

  const currentStepData = steps[activeStep];

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-surface border-b border-line sticky top-0 z-50">
        <div className="flex items-center gap-3.5">
          <button onClick={() => navigate('/dashboard')} className="text-slate-light text-[18px] mr-0.5 hover:text-ink transition-colors" title="Back to dashboard">
            ‹
          </button>
          <div className="mark">R</div>
          <div className="flex flex-col leading-[1.15]">
            <input 
              className="font-display text-[15.5px] font-semibold bg-transparent border-none outline-none text-ink p-0 w-[220px]" 
              value={currentResume.title}
              onChange={(e) => handleUpdate('title', null, e.target.value)}
              placeholder="Resume Title"
            />
            <div className="font-mono text-[10.5px] text-slate-light tracking-[0.03em] uppercase">
              DRAFT · {currentResume.template || 'MODERN'} TEMPLATE
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-teal-dark mr-4">
            <span className={`w-1.5 h-1.5 rounded-full bg-teal ${isSaving ? 'opacity-100' : 'opacity-30'}`} /> 
            {isSaving ? 'Saving...' : 'Autosaved'}
          </div>
          <button className="btn md:hidden" onClick={() => setShowPreviewModal(true)}>
            <Eye size={16} className="mr-1" /> Preview
          </button>
          <button className="btn btn-primary" onClick={handleExportPDF}>
            <Download size={16} className="mr-1" /> Export PDF
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr_400px] flex-1">
        
        {/* Stepper */}
        <div className="border-r border-line py-5 px-3.5 bg-surface hidden lg:block">
          <div className="font-mono text-[10px] tracking-[0.08em] text-slate-light uppercase px-2 pb-2.5">Sections</div>
          
          <div className="flex flex-col relative">
            <div className="absolute left-[22px] top-[28px] bottom-[28px] w-px bg-line z-0" />
            
            {steps.map((step, idx) => (
              <div 
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer mb-0.5 relative z-10 transition-colors ${activeStep === idx ? 'bg-paper' : 'hover:bg-paper/50'}`}
              >
                <div className={`font-mono text-[11px] w-5 text-center ${activeStep === idx ? 'text-teal font-semibold' : 'text-slate-light'}`}>
                  {idx < activeStep ? '✓' : `0${idx + 1}`}
                </div>
                <div className={`text-[13.5px] ${activeStep === idx ? 'text-ink font-semibold' : 'text-slate font-medium'}`}>
                  {step.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 border border-line rounded-[10px] bg-paper">
            <div className="font-mono text-[10px] text-slate-light uppercase tracking-[0.06em] mb-2">Match score</div>
            <div className="font-display text-[22px] font-semibold mt-1.5 mb-2 flex items-baseline gap-1">
              {currentResume.atsScore || 0} <span className="text-[12px] text-slate-light font-sans font-normal">/100</span>
            </div>
            <div className="w-full h-1.5 bg-line-soft rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-teal" 
                initial={{ width: 0 }}
                animate={{ width: `${currentResume.atsScore || 0}%` }}
                transition={{ duration: 1, ease: "circOut" }}
              />
            </div>
            {currentResume.atsMissingKeywords?.length > 0 && (
              <div className="mt-3">
                <div className="text-[10px] uppercase font-mono text-slate-light mb-1.5">Missing Keywords</div>
                <div className="flex flex-wrap gap-1">
                  {currentResume.atsMissingKeywords.map((kw, i) => (
                    <span key={i} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Column */}
        <div className="py-8 px-10 max-w-[640px] w-full mx-auto">
          <div className="eyebrow">Step 0{activeStep + 1} of 0{steps.length}</div>
          <h1 className="text-[26px] font-semibold font-display mb-1.5">{currentStepData.label}</h1>
          <p className="text-slate text-[13.5px] mb-6 leading-relaxed">
            Fill in your details below. You can leave fields blank if they are not relevant.
          </p>

          <AnimatePresence mode="wait">
            
            {activeStep === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                <div className="flex gap-3.5">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-slate">Full Name</label>
                    <input className="input-draftline" value={currentResume.personalInfo?.name || ''} onChange={(e) => handleUpdate('personalInfo', 'name', e.target.value)} />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-slate">Email</label>
                    <input className="input-draftline" type="email" value={currentResume.personalInfo?.email || ''} onChange={(e) => handleUpdate('personalInfo', 'email', e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-3.5">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-slate">Phone</label>
                    <input className="input-draftline" type="tel" value={currentResume.personalInfo?.phone || ''} onChange={(e) => handleUpdate('personalInfo', 'phone', e.target.value)} />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-slate">Location</label>
                    <input className="input-draftline" value={currentResume.personalInfo?.location || ''} onChange={(e) => handleUpdate('personalInfo', 'location', e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-slate">LinkedIn / Website URL</label>
                  <input className="input-draftline" type="url" value={currentResume.personalInfo?.linkedin || ''} onChange={(e) => handleUpdate('personalInfo', 'linkedin', e.target.value)} />
                </div>
              </motion.div>
            )}

            {activeStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-2 relative">
                <label className="text-[12px] font-semibold text-slate">Professional Summary</label>
                <div className="relative">
                  <textarea 
                    className="input-draftline w-full h-[120px] resize-y" 
                    value={currentResume.summary || ''} 
                    onChange={(e) => handleStringUpdate('summary', e.target.value)}
                  />
                  <button 
                    onClick={() => handleAIEnhance('summary', 'summary', currentResume.summary)}
                    disabled={aiState.summary?.status === 'thinking'}
                    className={`absolute top-2 right-2 font-mono text-[11px] font-medium text-amber-700 bg-amber-soft border border-[#E4C988] px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1.5 transition-colors hover:bg-[#EEDBA9] ${aiState.summary?.status === 'thinking' ? 'opacity-70 pointer-events-none' : ''}`}
                  >
                    <Sparkles size={12} className={aiState.summary?.status === 'thinking' ? 'animate-spin' : ''} />
                    {aiState.summary?.status === 'thinking' ? 'Thinking...' : 'Enhance'}
                  </button>
                </div>

                <AnimatePresence>
                  {aiState.summary?.status === 'review' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-3 border-l-2 border-amber bg-[#FBF6EB] rounded-r-lg text-[12.5px] text-[#6B4E14] leading-relaxed"
                    >
                      <b>AI polished this for clarity and impact:</b> tightened the phrasing, added specificity, and swapped passive lines for active ones.
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => acceptEnhancement('summary')} className="font-sans text-[11.5px] font-semibold border-none cursor-pointer px-2.5 py-1 rounded-md bg-teal text-white">Accept rewrite</button>
                        <button onClick={() => discardEnhancement('summary')} className="font-sans text-[11.5px] font-semibold border-none cursor-pointer px-2.5 py-1 rounded-md bg-transparent text-[#6B4E14] underline">Keep original</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3.5">
                {(currentResume.experience || []).map((exp, idx) => (
                  <div key={idx} className="border border-line rounded-[10px] p-[18px] bg-surface">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-mono text-[11px] text-slate-light">ROLE 0{idx + 1}</span>
                      <button onClick={() => handleArrayRemove('experience', idx)} className="text-slate-light hover:text-red-500"><X size={16}/></button>
                    </div>
                    <div className="flex gap-3.5 mb-4">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-[12px] font-semibold text-slate">Role</label>
                        <input className="input-draftline" value={exp.role || ''} onChange={(e) => handleArrayUpdate('experience', idx, 'role', e.target.value)} />
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-[12px] font-semibold text-slate">Company</label>
                        <input className="input-draftline" value={exp.company || ''} onChange={(e) => handleArrayUpdate('experience', idx, 'company', e.target.value)} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 mb-4">
                      <label className="text-[12px] font-semibold text-slate">Duration (e.g. Jan 2023 - Present)</label>
                      <input className="input-draftline" value={exp.duration || ''} onChange={(e) => handleArrayUpdate('experience', idx, 'duration', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5 relative">
                      <label className="text-[12px] font-semibold text-slate">Bullet points (one per line)</label>
                      <textarea className="input-draftline min-h-[100px] resize-y" value={(exp.bullets || []).join('\n')} onChange={(e) => handleArrayUpdate('experience', idx, 'bullets', e.target.value)} />
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => handleArrayAdd('experience', { role: '', company: '', duration: '', bullets: [] })}
                  className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-line rounded-lg cursor-pointer text-slate text-[13px] font-medium hover:border-teal hover:text-teal transition-colors"
                >
                  <Plus size={16} /> Add another role
                </button>
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 p-2.5 border border-line rounded-lg bg-surface min-h-[100px] items-start content-start">
                  {(currentResume.skills || []).map((skill, idx) => (
                    <div key={idx} className="bg-paper border border-line rounded-full px-3 py-1 text-[12.5px] flex items-center gap-1.5">
                      {skill}
                      <button onClick={() => handleSkillRemove(skill)} className="text-slate-light hover:text-slate bg-transparent border-none outline-none cursor-pointer text-[12px] leading-none mb-[1px]">✕</button>
                    </div>
                  ))}
                  <input 
                    type="text" 
                    placeholder="Type a skill and hit enter..." 
                    onKeyDown={handleSkillAdd}
                    className="border-none outline-none flex-1 min-w-[150px] text-[13.5px] font-sans p-1 bg-transparent"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-light font-mono block mb-2">AI SUGGESTS —</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['TypeScript', 'REST APIs', 'Docker', 'React'].map(sg => (
                       <button 
                         key={sg} 
                         onClick={() => updateResumeData('skills', [...(currentResume.skills||[]), sg])}
                         className="text-[11.5px] text-teal-dark border border-dashed border-[#B8D6D1] bg-[#EEF6F5] px-2.5 py-1 rounded-full cursor-pointer hover:bg-[#DCEEEC]"
                       >
                         {sg}
                       </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3.5">
                 {(currentResume.projects || []).map((proj, idx) => (
                  <div key={idx} className="border border-line rounded-[10px] p-[18px] bg-surface">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-mono text-[11px] text-slate-light">PROJECT 0{idx + 1}</span>
                      <button onClick={() => handleArrayRemove('projects', idx)} className="text-slate-light hover:text-red-500"><X size={16}/></button>
                    </div>
                    <div className="flex gap-3.5 mb-4">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-[12px] font-semibold text-slate">Project Name</label>
                        <input className="input-draftline" value={proj.name || ''} onChange={(e) => handleArrayUpdate('projects', idx, 'name', e.target.value)} />
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-[12px] font-semibold text-slate">Link (Optional)</label>
                        <input className="input-draftline" value={proj.link || ''} onChange={(e) => handleArrayUpdate('projects', idx, 'link', e.target.value)} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 mb-4">
                      <label className="text-[12px] font-semibold text-slate">Technologies Used</label>
                      <input className="input-draftline" value={proj.technologies || ''} onChange={(e) => handleArrayUpdate('projects', idx, 'technologies', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5 relative">
                      <label className="text-[12px] font-semibold text-slate">Bullet points (one per line)</label>
                      <textarea className="input-draftline min-h-[80px] resize-y" value={(proj.bullets || []).join('\n')} onChange={(e) => handleArrayUpdate('projects', idx, 'bullets', e.target.value)} />
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => handleArrayAdd('projects', { name: '', link: '', technologies: '', bullets: [] })}
                  className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-line rounded-lg cursor-pointer text-slate text-[13px] font-medium hover:border-teal hover:text-teal transition-colors"
                >
                  <Plus size={16} /> Add project
                </button>
              </motion.div>
            )}

            {activeStep === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3.5">
                 {(currentResume.education || []).map((edu, idx) => (
                  <div key={idx} className="border border-line rounded-[10px] p-[18px] bg-surface">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-mono text-[11px] text-slate-light">EDUCATION 0{idx + 1}</span>
                      <button onClick={() => handleArrayRemove('education', idx)} className="text-slate-light hover:text-red-500"><X size={16}/></button>
                    </div>
                    <div className="flex flex-col gap-1.5 mb-4">
                      <label className="text-[12px] font-semibold text-slate">School / University</label>
                      <input className="input-draftline" value={edu.school || ''} onChange={(e) => handleArrayUpdate('education', idx, 'school', e.target.value)} />
                    </div>
                    <div className="flex gap-3.5">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-[12px] font-semibold text-slate">Degree</label>
                        <input className="input-draftline" value={edu.degree || ''} onChange={(e) => handleArrayUpdate('education', idx, 'degree', e.target.value)} />
                      </div>
                      <div className="flex-[0.5] flex flex-col gap-1.5">
                        <label className="text-[12px] font-semibold text-slate">Year</label>
                        <input className="input-draftline" value={edu.year || ''} onChange={(e) => handleArrayUpdate('education', idx, 'year', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => handleArrayAdd('education', { school: '', degree: '', year: '' })}
                  className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-line rounded-lg cursor-pointer text-slate text-[13px] font-medium hover:border-teal hover:text-teal transition-colors"
                >
                  <Plus size={16} /> Add education
                </button>
              </motion.div>
            )}

            {activeStep === 6 && (
              <motion.div key="step6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                
                <div className="bg-[#EEF6F5] border border-[#B8D6D1] rounded-[10px] p-6 text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-teal">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="font-display font-semibold text-[18px] text-ink mb-1.5">Your resume is ready!</h3>
                  <p className="text-slate text-[13.5px] leading-relaxed max-w-[400px] mx-auto mb-5">
                    Before you export, let our AI analyze your resume against industry standards to ensure it gets past applicant tracking systems.
                  </p>
                  <button 
                    className="btn btn-primary px-6 h-[42px] font-semibold flex items-center justify-center mx-auto gap-2"
                    onClick={handleScanWithAI}
                    disabled={atsScanning}
                  >
                    {atsScanning ? (
                      <>
                        <Sparkles size={16} className="animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      'Scan with AI (Beta)'
                    )}
                  </button>
                  
                  {currentResume.atsSuggestions?.length > 0 && (
                    <div className="mt-6 text-left border border-[#B8D6D1] bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-[13px] text-ink mb-2">AI Suggestions:</h4>
                      <ul className="text-[12px] text-slate list-disc pl-4 flex flex-col gap-1.5 m-0">
                        {currentResume.atsSuggestions.map((sug, i) => (
                          <li key={i}>{sug}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="border border-line rounded-[10px] p-6 bg-surface">
                  <h4 className="font-semibold text-[14px] mb-4">Export Options</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={handleExportPDF} className="flex-1 border border-line bg-paper hover:bg-line-soft transition-colors rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer">
                       <Download size={24} className="text-teal" />
                       <span className="font-semibold text-[13px]">Download PDF</span>
                    </button>
                    <button className="flex-1 border border-line bg-paper opacity-60 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-not-allowed">
                       <Download size={24} className="text-slate-light" />
                       <span className="font-semibold text-[13px] text-slate-light">Download DOCX <br/>(Coming Soon)</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            )}
            
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t border-line">
            <button 
              className="btn btn-ghost" 
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
            >
               ← Back
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (activeStep === steps.length - 1) {
                  handleExportPDF();
                } else {
                  setActiveStep(Math.min(steps.length - 1, activeStep + 1));
                }
              }}
            >
               {activeStep === steps.length - 1 ? 'Export PDF' : 'Continue →'}
            </button>
          </div>
        </div>

        {/* Preview Column */}
        <div className="bg-[#EAEDE6] border-l border-line p-7 flex flex-col items-center overflow-y-auto hidden md:flex h-[calc(100vh-65px)]">
          
          <div className="flex gap-1.5 bg-surface p-1 rounded-[9px] border border-line mb-5 shrink-0 shadow-sm">
            {['modern', 'minimal', 'classic'].map(tmpl => (
              <button 
                key={tmpl}
                onClick={() => updateResumeData('template', tmpl)}
                className={`font-mono text-[11px] px-3 py-1.5 rounded-md capitalize transition-colors ${currentResume.template === tmpl || (!currentResume.template && tmpl === 'modern') ? 'bg-ink text-paper' : 'text-slate hover:bg-paper'}`}
              >
                {tmpl}
              </button>
            ))}
          </div>

          <div className="w-full max-w-[340px] aspect-[1/1.294] bg-surface shadow-[0_1px_2px_rgba(20,25,35,0.06),_0_12px_30px_rgba(20,25,35,0.12)] rounded-sm overflow-hidden relative shrink-0">
             <div id="resume-preview-content" className="w-full h-full">
               <ResumePreview data={currentResume} />
             </div>
          </div>

          <p className="mt-4 text-[11.5px] text-slate-light text-center leading-relaxed">
            This pane mirrors the export <b>exactly</b> — what you see here is what downloads as PDF/DOCX.
          </p>

        </div>
      </div>

      {/* Mobile Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#151E33]/60 flex flex-col md:hidden"
          >
            <div className="bg-surface p-4 flex justify-between items-center border-b border-line shadow-sm">
              <h3 className="font-semibold text-ink">Preview</h3>
              <button onClick={() => setShowPreviewModal(false)} className="text-slate hover:text-ink"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-[#EAEDE6]">
               <div className="w-full max-w-[340px] aspect-[1/1.294] bg-surface shadow-[0_1px_2px_rgba(20,25,35,0.06),_0_12px_30px_rgba(20,25,35,0.12)] rounded-sm overflow-hidden relative shrink-0">
                 <ResumePreview data={currentResume} />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Builder;
