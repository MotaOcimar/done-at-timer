import React, { type ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4 sm:p-8">
      <div className="w-full max-w-lg mt-4 sm:mt-8">{children}</div>
    </div>
  );
};

export { Layout };
