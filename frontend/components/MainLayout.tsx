"use client";

import React, { useState } from 'react';
import { Menu, X, Settings, MessageSquare, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed z-50 bottom-4 right-4 bg-blue-600 p-2 rounded-full text-white"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0
          ${isExpanded ? 'w-64' : 'w-20'}
          bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          z-40 lg:z-0
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header with toggle */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className={`text-xl font-bold text-gray-800 dark:text-white ${!isExpanded && 'lg:hidden'}`}>
              LLM Hub
            </h1>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden lg:block text-gray-500 hover:text-gray-600 dark:text-gray-400"
            >
              <ChevronLeft className={`w-6 h-6 transform transition-transform duration-300 ${!isExpanded && 'rotate-180'}`} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/auth-group/chat"
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className={`ml-3 text-gray-700 dark:text-gray-300 ${!isExpanded && 'lg:hidden'}`}>
                    Chat
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/auth-group/settings"
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className={`ml-3 text-gray-700 dark:text-gray-300 ${!isExpanded && 'lg:hidden'}`}>
                    Réglages
                  </span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;