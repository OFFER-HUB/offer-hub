'use client';

import { useMemo, useState } from 'react';
import { useDisputeIntegration } from '@/hooks/use-dispute-integration';
import type {
  CreateIntegrationInstanceDTO,
  IntegrationInstance,
} from '@/types/integration.types';

export default function ApiIntegration() {
  const { providers, instances, loading, error, actions } =
    useDisputeIntegration();
  const [filter, setFilter] = useState('');

  const filteredInstances = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return instances;
    return instances.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.providerId.toLowerCase().includes(q)
    );
  }, [filter, instances]);

  const onCreate = async (providerId: string) => {
    const name = prompt('Integration name');
    if (!name) return;
    const dto: CreateIntegrationInstanceDTO = { providerId, name, config: {} };
    await actions.createInstance(dto);
  };

  const onToggle = async (instance: IntegrationInstance) => {
    await actions.toggleInstance(instance.id, !instance.enabled);
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this integration?')) return;
    await actions.deleteInstance(id);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>API Integrations</h2>
        <div className='flex gap-2'>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder='Search integrations'
            className='border rounded px-3 py-2 text-sm'
          />
        </div>
      </div>

      {error && <div className='text-red-600 text-sm'>{error}</div>}

      <div>
        <h3 className='text-lg font-medium mb-2'>Available Providers</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {providers.map((p) => (
            <div
              key={p.id}
              className='border rounded p-4 flex items-start gap-3'
            >
              {p.logoUrl ? (
                <img src={p.logoUrl} alt={p.name} className='h-8 w-8' />
              ) : (
                <div className='h-8 w-8 rounded bg-gray-200' />
              )}
              <div className='flex-1'>
                <div className='font-medium'>{p.name}</div>
                <div className='text-xs text-gray-500 mb-2'>
                  {p.description}
                </div>
                <button
                  className='text-sm px-3 py-1 rounded bg-black text-white'
                  onClick={() => onCreate(p.id)}
                  disabled={loading}
                >
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className='text-lg font-medium mb-2'>Connected Integrations</h3>
        <div className='border rounded overflow-hidden'>
          <table className='min-w-full text-sm'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='text-left px-3 py-2'>Name</th>
                <th className='text-left px-3 py-2'>Provider</th>
                <th className='text-left px-3 py-2'>Status</th>
                <th className='text-right px-3 py-2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstances.map((i) => (
                <tr key={i.id} className='border-t'>
                  <td className='px-3 py-2'>{i.name}</td>
                  <td className='px-3 py-2'>{i.providerId}</td>
                  <td className='px-3 py-2'>
                    {i.enabled ? 'Enabled' : 'Disabled'}
                  </td>
                  <td className='px-3 py-2 text-right'>
                    <button
                      className='text-xs mr-2 underline'
                      onClick={() => onToggle(i)}
                    >
                      {i.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      className='text-xs text-red-600 underline'
                      onClick={() => onDelete(i.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredInstances.length && (
                <tr>
                  <td
                    colSpan={4}
                    className='text-center text-gray-500 px-3 py-6'
                  >
                    No integrations
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
