import React from 'react';

const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-8 animate-fade-in-up">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 tracking-tight">
        {title}
      </h1>
      <p className="text-gray-500 font-medium text-sm md:text-base">
        {subtitle}
      </p>
    </div>
  );
};

export default PageHeader;