import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[#74512D] text-[#F8F4E1] hover:bg-[#543310] focus:ring-[#74512D] shadow-sm active:bg-[#3B230B]',
    secondary:
      'bg-[#AF8F6F] text-[#F8F4E1] hover:bg-[#937456] focus:ring-[#AF8F6F] shadow-sm',
    outline:
      'border border-[#AF8F6F] text-[#543310] bg-white hover:bg-[#F8F4E1] hover:border-[#74512D] focus:ring-[#74512D]',
    ghost:
      'text-[#74512D] hover:bg-[#EFE7CB] hover:text-[#543310] focus:ring-[#74512D]',
    danger:
      'bg-rose-700 text-white hover:bg-rose-800 focus:ring-rose-600 shadow-sm'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
