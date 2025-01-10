import React from 'react'

export default function SettingsPage() {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="mt-4 space-y-4">
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold">API Keys</h2>
            {/* Nous ajouterons les formulaires pour les clés API plus tard */}
          </div>
        </div>
      </div>
    </div>
  )
}