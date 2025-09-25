'use client';

import { useMemo, useState } from 'react';
import { useDisputeIntegration } from '@/hooks/use-dispute-integration';

const POPULAR = [
  { id: 'slack', name: 'Slack', desc: 'Notify channels on dispute updates' },
  { id: 'jira', name: 'Jira', desc: 'Create Jira issues for disputes' },
  { id: 'zapier', name: 'Zapier', desc: 'Automate with 5000+ apps' },
  { id: 'github', name: 'GitHub', desc: 'Open issues from disputes' },
];

export default function IntegrationFrameworks() {
  const { providers, instances, actions } = useDisputeIntegration();
  const [q, setQ] = useState('');

  const available = useMemo(() => {
    const ids = new Set(instances.map((i) => i.providerId));
    return providers.filter((p) => !ids.has(p.id));
  }, [providers, instances]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return available;
    return available.filter((p) => p.name.toLowerCase().includes(query));
  }, [q, available]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Integration Frameworks</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Search frameworks'
          className='border rounded px-3 py-2 text-sm'
        />
      </div>

      <div>
        <h3 className='text-lg font-medium mb-2'>Popular</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {POPULAR.map((f) => (
            <div key={f.id} className='border rounded p-4'>
              <div className='font-medium'>{f.name}</div>
              <div className='text-xs text-gray-500 mb-3'>{f.desc}</div>
              <button
                className='text-sm px-3 py-1 rounded bg-black text-white'
                onClick={() =>
                  actions.createInstance({
                    providerId: f.id,
                    name: `${f.name} Integration`,
                    config: {},
                  })
                }
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className='text-lg font-medium mb-2'>All Providers</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filtered.map((p) => (
            <div key={p.id} className='border rounded p-4'>
              <div className='font-medium'>{p.name}</div>
              <div className='text-xs text-gray-500 mb-3'>{p.description}</div>
              <button
                className='text-sm px-3 py-1 rounded bg-black text-white'
                onClick={() =>
                  actions.createInstance({
                    providerId: p.id,
                    name: `${p.name} Integration`,
                    config: {},
                  })
                }
              >
                Add
              </button>
            </div>
          ))}
          {!filtered.length && (
            <div className='text-sm text-gray-500'>No providers available</div>
          )}
        </div>
      </div>
    </div>
  );
}
