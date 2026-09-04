import React from 'react';

export default function LoadingState({ message = 'Loading TrustFlow data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-10 h-10 border-3 border-[#AF8F6F]/30 border-t-[#74512D] rounded-full animate-spin mb-3" />
      <p className="text-xs font-medium text-[#74512D]">{message}</p>
    </div>
  );
}
