import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function LandingPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <nav className="navbar">
        <div className="flex items-center gap-2">
          <div className="mark">R</div>
          <span className="brand">Draftline-Ai</span>
        </div>
        <div className="hidden md:flex gap-6 text-[14px] text-slate font-medium">
          <a href="#how" className="hover:text-ink transition-colors">How it works</a>
          <a href="#features" className="hover:text-ink transition-colors">Features</a>
          <a href="#templates" className="hover:text-ink transition-colors">Templates</a>
        </div>
        <div className="flex gap-3">
          <Link to="/auth" className="btn btn-ghost">Log in</Link>
          <Link to="/auth" className="btn btn-primary hidden sm:flex">Build for free</Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="hero">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="eyebrow">AI-assisted resume writing</div>
            <h1>Write the facts.<br/>Let the phrasing <em>catch up.</em></h1>
            <p className="lead">
              Draftline-Ai turns rough notes into a polished, ATS-ready resume - with an AI editor that suggests rewrites in the margin, never overwrites silently, and a live preview that matches your export exactly.
            </p>
            <div className="flex gap-3 mt-8">
              <Link to="/auth" className="btn btn-primary px-6 py-3 text-[14.5px]">Start building — free</Link>
            </div>
            <div className="mt-4 text-[12px] text-slate-light font-mono uppercase">
              NO CREDIT CARD · EXPORTS TO PDF & DOCX · 4 TEMPLATES
            </div>
          </motion.div>
          
          <motion.div 
            className="hero-visual flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="stack-paper behind"></div>
            <div className="stack-paper">
              <div className="sp-name">Aditi Sharma</div>
              <div className="sp-contact">aditi.sharma@email.com · Bengaluru</div>
              <div className="sp-h">Summary</div>
              <div className="sp-line"></div>
              <div className="sp-line w-[60%]"></div>
              <div className="sp-h">Experience</div>
              <div className="sp-line"></div>
              <div className="sp-line"></div>
              <div className="sp-line w-[60%]"></div>
              <div className="sp-h">Skills</div>
              <div className="sp-line w-[60%]"></div>
            
              <motion.div 
                className="note-badge"
                initial={{ opacity: 0, x: 20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.8, type: "spring" }}
              >
                ✨ Rewrote this line — added a measurable result
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* How it works */}
        <section id="how" className="py-16 md:py-20 px-6 md:px-10 max-w-[1240px] mx-auto">
          <div className="section-head">
            <div className="eyebrow">How it works</div>
            <h2>Four steps, one document</h2>
            <p className="text-slate mt-3 text-[14.5px] leading-relaxed">No blank page. Fill in what you know, and let the AI carry the phrasing.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Enter the facts", desc: "Roles, dates, projects, skills — write it rough, in your own words." },
              { num: "02", title: "AI tightens it", desc: "Bullet points get rewritten with action verbs and measurable impact — shown as a suggestion, not a silent edit." },
              { num: "03", title: "Check the match", desc: "Paste a job description and get a match score plus the keywords you're missing." },
              { num: "04", title: "Export", desc: "Download as PDF or DOCX — pixel-identical to the live preview." }
            ].map((step, i) => (
              <div key={step.num} className="p-5 md:p-[26px] border border-line rounded-[12px] bg-surface">
                <div className="font-mono text-[12px] text-teal mb-3.5">{step.num}</div>
                <h3 className="text-[16px] font-semibold mb-2">{step.title}</h3>
                <p className="text-[13px] text-slate leading-[1.55]">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16 md:py-20 px-6 md:px-10 max-w-[1240px] mx-auto">
          <div className="section-head">
            <div className="eyebrow">Features</div>
            <h2>Built around one rule: you stay in control</h2>
            <p className="text-slate mt-3 text-[14.5px] leading-relaxed">The AI proposes. It never replaces your words without you seeing the change first.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5">
            <div className="bg-ink text-paper rounded-[14px] p-6 md:p-[34px] flex flex-col justify-between lg:row-span-2">
              <div>
                <h3 className="text-[22px] font-semibold text-white">Margin-note editing</h3>
                <p className="text-[#B7BECB] text-[13.5px] leading-[1.6] mt-2.5">
                  Every AI rewrite shows up as an annotation beside your original text — like an editor's pencil, not a chat reply. Accept it, or keep your own version.
                </p>
              </div>
              <div className="mt-[26px] bg-[#E5F0EE] border border-[#B2D4D0] text-teal-dark text-[11.5px] p-3.5 rounded-lg font-mono">
                ✨ "Resolved 12+ critical bugs and shipped 3 endpoints, cutting failures by 18%" — Accept · Keep original
              </div>
            </div>
            
            <div className="bg-surface border border-line rounded-[14px] p-[26px]">
              <h3 className="text-[15.5px] font-semibold mb-2">ATS match score</h3>
              <p className="text-[13px] text-slate leading-[1.55]">Paste any job description and get a 0–100 score with the exact keywords you're missing.</p>
            </div>
            <div className="bg-surface border border-line rounded-[14px] p-[26px]">
              <h3 className="text-[15.5px] font-semibold mb-2">Live, exact preview</h3>
              <p className="text-[13px] text-slate leading-[1.55]">What's on screen is what downloads — no surprises in the PDF.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-teal-dark text-white rounded-[18px] p-8 md:p-14 text-center my-16 md:my-20 mx-6 md:mx-10 max-w-[1240px] xl:mx-auto">
          <h2 className="text-white text-[24px] md:text-[30px] font-semibold">Your resume, drafted honestly.</h2>
          <p className="text-[#CFE4E1] mt-2.5 text-[14.5px]">Free to build. Free to export. No watermark.</p>
          <Link to="/auth" className="btn bg-white border-white text-teal-dark hover:bg-paper hover:border-paper mt-6 text-[14px] py-2.5 px-6">
            Start building
          </Link>
        </div>
      </main>
      
      <footer className="border-t border-line py-8 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center text-[12px] text-slate font-mono gap-4 md:gap-0">
        <span>© 2026 Draftline-Ai</span>
        <span>Built with React & Firebase</span>
      </footer>
    </div>
  );
}

export default LandingPage;
