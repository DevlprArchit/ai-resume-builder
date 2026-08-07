import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import useResumeStore from '../store/useResumeStore';

function Dashboard() {
  const { user, logout } = useAuthStore();
  const { resumes, fetchResumes, createResume, isLoading } = useResumeStore();
  const navigate = useNavigate();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user, fetchResumes]);

  const handleCreateNew = async () => {
    // We pass the title and selected template when creating
    const newResumeId = await createResume('Untitled Resume', selectedTemplate);
    if (newResumeId) {
      navigate(`/builder/${newResumeId}`);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-paper pb-20">
      
      {/* Navbar */}
      <div className="navbar">
        <a href="/" className="nav-left">
          <div className="mark">R</div>
          <span className="brand">Draftline</span>
        </a>
        <div className="hidden md:flex gap-[30px]">
          <a href="#" className="text-[13.5px] font-medium text-ink">My resumes</a>
          <a href="#" className="text-[13.5px] font-medium text-slate hover:text-ink">Templates</a>
        </div>
        <div className="nav-right">
          <div className="w-8 h-8 rounded-full bg-amber-soft text-[#6B4E14] flex items-center justify-center font-display font-semibold text-[13px] cursor-pointer" onClick={logout} title="Sign Out">
            {getInitials(user?.name || user?.email)}
          </div>
        </div>
      </div>

      <div className="max-w-[1160px] mx-auto px-8 pt-11">
        
        {/* Page Head */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-[28px] font-semibold font-display">Your resumes</h1>
            <p className="text-slate text-[13.5px] mt-1.5">{resumes.length} {resumes.length === 1 ? 'draft' : 'drafts'} · autosaved as you type</p>
          </div>
          <button onClick={() => setShowTemplateModal(true)} className="btn btn-primary">
            + New resume
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[22px]">
          
          <div 
            onClick={() => setShowTemplateModal(true)}
            className="border-[1.5px] border-dashed border-line rounded-[14px] flex flex-col items-center justify-center gap-2 min-h-[238px] cursor-pointer text-slate hover:border-teal hover:text-teal hover:bg-[#F7FAF9] transition-colors"
          >
            <div className="text-[26px] font-display">+</div>
            <span className="text-[13px] font-semibold">Start a new resume</span>
          </div>

          {isLoading ? (
            <div className="text-center py-10 col-span-full text-slate-light font-mono text-sm">LOADING DRAFTS...</div>
          ) : (
            resumes.map((resume) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                key={resume.id}
                onClick={() => navigate(`/builder/${resume.id}`)}
                className="bg-surface border border-line rounded-[14px] overflow-hidden cursor-pointer transition-all duration-150 hover:border-slate-light hover:shadow-[0_14px_30px_rgba(20,25,35,0.08)]"
              >
                <div className="h-[170px] bg-paper flex items-center justify-center p-5">
                  <div className={`w-[120px] h-[150px] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)] p-3 ${resume.template === 'classic' ? 'font-mono' : ''}`}>
                    {/* Visual mini-paper lines */}
                    <div className={`h-1 rounded-[2px] mb-[5px] w-[60%] ${resume.template === 'minimal' ? 'bg-ink' : 'bg-line-soft'}`} />
                    <div className={`h-1 bg-line-soft rounded-[2px] mb-[5px] w-[40%]`} />
                    <div className="h-[3px] bg-teal opacity-50 mt-[9px] mb-[5px]" />
                    <div className="h-1 bg-line-soft rounded-[2px] mb-[5px] w-full" />
                    <div className="h-1 bg-line-soft rounded-[2px] mb-[5px] w-[60%]" />
                  </div>
                </div>
                <div className="p-3.5 pt-3.5 pb-4">
                  <div className="text-[14px] font-semibold truncate">
                    {resume.personalInfo?.name ? `${resume.personalInfo.name} — Resume` : 
                     (typeof resume.title === 'string' && resume.title !== '[object Object]' ? resume.title : 'Untitled Draft')}
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-[11.5px] text-slate-light font-mono">Edited recently</span>
                    {resume.atsScore ? (
                      <span className={`text-[10.5px] font-mono px-2 py-0.5 rounded-full font-semibold ${resume.atsScore > 70 ? 'bg-[#E3F1EE] text-teal-dark' : 'bg-amber-soft text-[#6B4E14]'}`}>
                        {resume.atsScore} MATCH
                      </span>
                    ) : (
                       <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-full font-semibold bg-paper text-slate">
                        DRAFT
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}

        </div>
      </div>

      {/* Template Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <div className="fixed inset-0 bg-[#151E33]/45 z-50 flex items-center justify-center p-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl p-[30px] w-full max-w-[720px] max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-[22px]">
                <div>
                  <h2 className="text-[21px] font-semibold font-display">Choose a starting template</h2>
                  <p className="text-slate text-[13px] mt-1.5">You can switch templates anytime once you're inside the builder.</p>
                </div>
                <button onClick={() => setShowTemplateModal(false)} className="text-slate-light hover:text-ink transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Modern */}
                <div 
                  onClick={() => setSelectedTemplate('modern')}
                  className={`cursor-pointer rounded-[10px] p-2 border-2 transition-colors ${selectedTemplate === 'modern' ? 'border-teal bg-[#F7FAF9]' : 'border-transparent hover:border-line'}`}
                >
                  <div className="w-full h-[140px] bg-paper border border-line rounded-md p-3">
                     <div className="h-1 bg-line-soft rounded-[2px] mb-1.5 w-[60%]" />
                     <div className="h-1 bg-line-soft rounded-[2px] mb-1.5 w-[40%]" />
                  </div>
                  <div className="text-[12.5px] font-semibold mt-2 text-center">Modern</div>
                </div>

                {/* Minimal */}
                <div 
                  onClick={() => setSelectedTemplate('minimal')}
                  className={`cursor-pointer rounded-[10px] p-2 border-2 transition-colors ${selectedTemplate === 'minimal' ? 'border-teal bg-[#F7FAF9]' : 'border-transparent hover:border-line'}`}
                >
                  <div className="w-full h-[140px] bg-paper border border-line rounded-md p-3">
                     <div className="h-1 bg-line-soft rounded-[2px] mb-1.5 w-[40%]" />
                     <div className="h-1 bg-ink rounded-[2px] mb-1.5 w-[60%]" />
                  </div>
                  <div className="text-[12.5px] font-semibold mt-2 text-center">Minimal</div>
                </div>

                {/* Classic */}
                <div 
                  onClick={() => setSelectedTemplate('classic')}
                  className={`cursor-pointer rounded-[10px] p-2 border-2 transition-colors ${selectedTemplate === 'classic' ? 'border-teal bg-[#F7FAF9]' : 'border-transparent hover:border-line'}`}
                >
                  <div className="w-full h-[140px] bg-paper border border-line rounded-md p-3 font-mono">
                     <div className="h-1 bg-line-soft rounded-[2px] mb-1.5 w-[60%]" />
                     <div className="h-1 bg-line-soft rounded-[2px] mb-1.5 w-[40%]" />
                  </div>
                  <div className="text-[12.5px] font-semibold mt-2 text-center">Classic</div>
                </div>
                
                {/* Compact */}
                <div 
                  onClick={() => setSelectedTemplate('compact')}
                  className={`cursor-pointer rounded-[10px] p-2 border-2 transition-colors ${selectedTemplate === 'compact' ? 'border-teal bg-[#F7FAF9]' : 'border-transparent hover:border-line'}`}
                >
                  <div className="w-full h-[140px] bg-paper border border-line rounded-md p-3">
                     <div className="h-1 bg-teal rounded-[2px] mb-1.5 w-[60%]" />
                     <div className="h-1 bg-line-soft rounded-[2px] mb-1.5 w-[40%]" />
                  </div>
                  <div className="text-[12.5px] font-semibold mt-2 text-center">Compact</div>
                </div>

              </div>

              <div className="flex justify-end gap-2.5 mt-[26px]">
                <button onClick={() => setShowTemplateModal(false)} className="btn">Cancel</button>
                <button onClick={handleCreateNew} className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Continue →'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Dashboard;
