import React from 'react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-[#033F6A] p-2 ${className}`}>
      <div className="text-white text-center">
        © {currentYear} <span className="font-normal">DENTA</span><span className="font-normal">FLEX</span>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;