import React from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description }) => {
  return (
    <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
        {title}
      </h1>
      {description && (
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl px-1 leading-relaxed">
          {description}
        </p>
      )}
      <div className="w-20 h-1.5 bg-teal-500 rounded-full mt-6 shadow-lg shadow-teal-500/20" />
    </div>
  );
};

export default SectionHeader;
