import React from 'react';

const ResumePreview = ({ data }) => {
  if (!data) return <div className="p-8 text-center text-slate font-mono text-sm">Loading preview...</div>;

  const tmpl = data.template || 'modern';

  // Base typography styles
  let wrapperClass = "w-full h-full bg-white text-[#151E33] p-8 overflow-y-auto relative ";
  let nameClass = "text-[19px] mb-1 ";
  let contactClass = "text-[9.5px] text-[#8A93A0] mb-[14px] tracking-[0.02em] ";
  let headerClass = "text-[9px] tracking-[0.1em] uppercase pb-[3px] mb-2 mt-4 ";
  
  // Specific template styles
  if (tmpl === 'modern') {
    wrapperClass += "font-sans";
    nameClass += "font-display font-semibold";
    headerClass += "font-mono text-[#0F6E64] border-b border-[#E8EAE4]";
  } else if (tmpl === 'minimal') {
    wrapperClass += "font-sans";
    nameClass += "font-sans font-bold text-[22px]";
    headerClass += "font-sans font-bold text-[#151E33] tracking-[0.04em]";
  } else if (tmpl === 'classic') {
    wrapperClass += "font-mono";
    nameClass += "font-mono font-semibold";
    headerClass += "font-mono text-[#151E33] border-b border-[#151E33]";
  } else if (tmpl === 'compact') {
    wrapperClass += "font-sans p-6";
    nameClass += "font-display font-semibold text-[17px]";
    headerClass += "font-sans font-bold text-[#0F6E64] pb-1 mb-1 mt-3";
    contactClass = "text-[8.5px] text-[#57616F] mb-[10px] ";
  }

  // Common element styles
  const textClass = tmpl === 'compact' ? "text-[8.5px]" : "text-[9.5px]";
  const subTextClass = tmpl === 'compact' ? "text-[8px]" : "text-[8.5px]";
  const titleClass = tmpl === 'compact' ? "text-[9.5px]" : "text-[10.5px]";

  return (
    <div className={wrapperClass}>
      
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,transparent_0_6px,#EDEFEA_6px_7px)]" />

      {/* Header */}
      <header className="text-center">
        <h1 className={nameClass}>{data.personalInfo?.name || 'Your Name'}</h1>
        <div className={contactClass}>
          {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo?.phone && <span> · {data.personalInfo.phone}</span>}
          {data.personalInfo?.location && <span> · {data.personalInfo.location}</span>}
          {data.personalInfo?.linkedin && <span> · {data.personalInfo.linkedin}</span>}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section>
          <div className={headerClass}>Summary</div>
          <p className={`${textClass} leading-[1.55] text-[#57616F]`}>{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <section>
          <div className={headerClass}>Experience</div>
          {data.experience.map((exp, idx) => (
            <div key={idx} className="mb-2.5">
              <div className={`${titleClass} font-bold mt-1.5`}>
                {exp.role || 'Role'} {exp.company && <span className="font-normal">— {exp.company}</span>}
              </div>
              <div className={`${subTextClass} text-[#8A93A0] mb-[3px]`}>{exp.duration || 'Duration'}</div>
              <div className={`${textClass} text-[#57616F] leading-[1.5]`}>
                {(exp.bullets || []).map((bullet, i) => (
                  <div key={i} className="pl-2.5 relative before:content-['–'] before:absolute before:left-0 mb-0.5">{bullet}</div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <section>
          <div className={headerClass}>Education</div>
          {data.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <div className={`${titleClass} font-bold mt-1.5`}>
                {edu.degree || 'Degree'} {edu.school && <span className="font-normal">— {edu.school}</span>}
              </div>
              <div className={`${subTextClass} text-[#8A93A0] mb-[3px]`}>
                {edu.year || 'Year'} {edu.gpa && <span>· GPA: {edu.gpa}</span>}
              </div>
            </div>
          ))}
        </section>
      )}
      
      {/* Projects */}
      {data.projects?.length > 0 && (
        <section>
          <div className={headerClass}>Projects</div>
          {data.projects.map((proj, idx) => (
            <div key={idx} className="mb-2.5">
              <div className="flex justify-between items-baseline mt-1.5">
                <div className={`${titleClass} font-bold`}>{proj.name || 'Project Name'}</div>
                {proj.link && <div className={`${subTextClass} text-[#8A93A0]`}>{proj.link}</div>}
              </div>
              {proj.technologies && <div className={`${subTextClass} text-[#8A93A0] mb-[3px]`}>{proj.technologies}</div>}
              <div className={`${textClass} text-[#57616F] leading-[1.5]`}>
                {(proj.bullets || []).map((bullet, i) => (
                  <div key={i} className="pl-2.5 relative before:content-['–'] before:absolute before:left-0 mb-0.5">{bullet}</div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
      
      {/* Skills */}
      {data.skills?.length > 0 && (
        <section>
          <div className={headerClass}>Skills</div>
          <div className={`${textClass} text-[#57616F] leading-[1.7]`}>
            {data.skills.join(' · ')}
          </div>
        </section>
      )}
    </div>
  );
};

export default ResumePreview;
