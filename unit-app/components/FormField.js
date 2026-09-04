import React from 'react';

export default function FormField({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  error,
  hint,
  options,
  className = '',
  disabled = false
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-[#543310]">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
      )}

      {type === 'select' ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full px-3.5 py-2 text-sm bg-white border ${
            error ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#AF8F6F]'
          } rounded-lg text-[#543310] focus:outline-none focus:ring-2 focus:ring-[#74512D] focus:border-[#74512D] disabled:bg-[#FAF6E9] transition-all`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options &&
            options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-3.5 py-2 text-sm bg-white border ${
            error ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#AF8F6F]'
          } rounded-lg text-[#543310] placeholder-[#AF8F6F]/70 focus:outline-none focus:ring-2 focus:ring-[#74512D] focus:border-[#74512D] disabled:bg-[#FAF6E9] transition-all`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-3.5 py-2 text-sm bg-white border ${
            error ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#AF8F6F]'
          } rounded-lg text-[#543310] placeholder-[#AF8F6F]/70 focus:outline-none focus:ring-2 focus:ring-[#74512D] focus:border-[#74512D] disabled:bg-[#FAF6E9] transition-all`}
        />
      )}

      {hint && !error && <p className="text-xs text-[#AF8F6F]">{hint}</p>}
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}
