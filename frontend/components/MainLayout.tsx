"use client";

import React, { useState } from 'react';
import { Menu, X, Settings, MessageSquare } from 'lucide-react';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed z-50 bottom-4 right-4 bg-blue-600 p-2 rounded-full text-white"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 
        transform lg:translate-x-0 lg:relative
        w-64 bg-white dark:bg-gray-800
        border-r border-gray-200 dark:border-gray-700
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        z-40 lg:z-0
      `}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">LLM Hub</h1>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              <li>
                <a
                  href="/chat"
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="ml-3 text-gray-700 dark:text-gray-300">Chat</span>
                </a>
              </li>
              <li>
                <a
                  href="/settings"
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="ml-3 text-gray-700 dark:text-gray-300">Réglages</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
