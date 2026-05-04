import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = ({ label, error, icon, className = '', ...props }: InputProps) => {
  return (
    <div className="w-full flex flex-col gap-1.5 leading-none">
      {label && (
        <label className="text-xs font-medium text-[#6B7280]">
          {label}
        </label>
      )}
      <div className="relative flex items-center group">
        {icon && (
          <div className="absolute left-3 text-[#9CA3AF] pointer-events-none group-focus-within:text-[#00E5A0] transition-base">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full bg-[#111827] border border-white/10 rounded-[8px] py-2 px-3 text-sm text-white placeholder-[#6B7280]
            focus:outline-none focus:ring-2 focus:ring-[#00E5A0]/20 focus:border-[#00E5A0] transition-base
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-[#EF4444] focus:ring-[#EF4444]/20 focus:border-[#EF4444]' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[10px] font-medium text-[#EF4444]">
          {error}
        </span>
      )}
    </div>
  );
};
