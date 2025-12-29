"use client";
import React, { useState } from 'react';

export default function EditProfileForm({ initialName = '', initialImage = '' }: { initialName?: string; initialImage?: string }) {
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState(initialImage);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    try {
      const res = await fetch('/api/auth/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('saved');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md">
      <label className="block mb-2">
        <div className="text-sm font-medium">Name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-2 py-1" />
      </label>

      <label className="block mb-2">
        <div className="text-sm font-medium">Image URL</div>
        <input value={image} onChange={(e) => setImage(e.target.value)} className="w-full border rounded px-2 py-1" />
      </label>

      <div className="mt-4">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        {status === 'saving' && <span className="ml-3">Saving…</span>}
        {status === 'saved' && <span className="ml-3 text-green-600">Saved</span>}
        {status === 'error' && <span className="ml-3 text-red-600">Error</span>}
      </div>
    </form>
  );
}
