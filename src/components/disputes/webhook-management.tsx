'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDisputeIntegration } from '@/hooks/use-dispute-integration';
import type {
  CreateWebhookDTO,
  DisputeEventType,
  WebhookEndpoint,
} from '@/types/integration.types';

const ALL_EVENTS: DisputeEventType[] = [
  'dispute.created',
  'dispute.updated',
  'dispute.resolved',
  'dispute.escalated',
  'evidence.added',
  'mediation.started',
  'arbitration.started',
];

export default function WebhookManagement() {
  const { webhooks, actions } = useDisputeIntegration();
  const [selected, setSelected] = useState<WebhookEndpoint | null>(null);
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return webhooks;
    return webhooks.filter(
      (w) =>
        w.url.toLowerCase().includes(q) ||
        (w.description || '').toLowerCase().includes(q)
    );
  }, [filter, webhooks]);

  const [form, setForm] = useState<CreateWebhookDTO>({
    url: '',
    events: ['dispute.created'],
  });

  const onCreate = async () => {
    if (!form.url) return;
    const created = await actions.createWebhook(form);
    setSelected(created);
    setForm({ url: '', events: ['dispute.created'] });
  };

  const onToggleActive = async (w: WebhookEndpoint) => {
    await actions.updateWebhook(w.id, { isActive: !w.isActive });
  };

  const onDelete = async (w: WebhookEndpoint) => {
    if (!confirm('Delete this webhook?')) return;
    await actions.deleteWebhook(w.id);
    if (selected?.id === w.id) setSelected(null);
  };

  const [deliveries, setDeliveries] = useState<any[] | null>(null);
  useEffect(() => {
    const load = async () => {
      if (!selected) return;
      const list = await actions.listDeliveries(selected.id);
      setDeliveries(list);
    };
    load();
  }, [selected, actions]);

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      <div className='lg:col-span-2 space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Webhooks</h2>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder='Search webhooks'
            className='border rounded px-3 py-2 text-sm'
          />
        </div>

        <div className='border rounded overflow-hidden'>
          <table className='min-w-full text-sm'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='text-left px-3 py-2'>URL</th>
                <th className='text-left px-3 py-2'>Events</th>
                <th className='text-left px-3 py-2'>Status</th>
                <th className='text-right px-3 py-2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr
                  key={w.id}
                  className='border-t hover:bg-gray-50 cursor-pointer'
                  onClick={() => setSelected(w)}
                >
                  <td className='px-3 py-2'>{w.url}</td>
                  <td className='px-3 py-2'>{w.events.join(', ')}</td>
                  <td className='px-3 py-2'>
                    {w.isActive ? 'Active' : 'Inactive'}
                  </td>
                  <td className='px-3 py-2 text-right'>
                    <button
                      className='text-xs mr-2 underline'
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleActive(w);
                      }}
                    >
                      {w.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      className='text-xs text-red-600 underline'
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(w);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td
                    colSpan={4}
                    className='text-center text-gray-500 px-3 py-6'
                  >
                    No webhooks
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className='border rounded p-4 space-y-3'>
          <h3 className='font-medium'>Create Webhook</h3>
          <input
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder='https://example.com/webhooks'
            className='border rounded px-3 py-2 text-sm w-full'
          />
          <input
            value={form.secret || ''}
            onChange={(e) => setForm((f) => ({ ...f, secret: e.target.value }))}
            placeholder='Optional secret'
            className='border rounded px-3 py-2 text-sm w-full'
          />
          <div className='flex flex-wrap gap-2'>
            {ALL_EVENTS.map((evt) => {
              const checked = form.events.includes(evt);
              return (
                <label
                  key={evt}
                  className={`text-xs px-2 py-1 border rounded cursor-pointer ${
                    checked ? 'bg-black text-white' : ''
                  }`}
                >
                  <input
                    type='checkbox'
                    checked={checked}
                    onChange={(e) => {
                      const checkedNow = e.target.checked;
                      setForm((f) => ({
                        ...f,
                        events: checkedNow
                          ? Array.from(new Set([...(f.events || []), evt]))
                          : (f.events || []).filter((x) => x !== evt),
                      }));
                    }}
                    className='mr-1'
                  />
                  {evt}
                </label>
              );
            })}
          </div>
          <button
            className='text-sm px-3 py-2 rounded bg-black text-white'
            onClick={onCreate}
          >
            Create Webhook
          </button>
        </div>
      </div>

      <div className='border rounded p-4 space-y-3'>
        <h3 className='font-medium'>Deliveries</h3>
        {selected ? (
          <>
            <div className='text-sm text-gray-600'>{selected.url}</div>
            <button
              className='text-xs underline'
              onClick={async () => {
                const list = await actions.listDeliveries(selected.id);
                setDeliveries(list);
              }}
            >
              Refresh
            </button>
            <div className='max-h-80 overflow-auto border rounded'>
              <table className='min-w-full text-xs'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='text-left px-2 py-1'>Status</th>
                    <th className='text-left px-2 py-1'>Event</th>
                    <th className='text-left px-2 py-1'>At</th>
                    <th className='text-right px-2 py-1'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(deliveries || []).map((d: any) => (
                    <tr key={d.id} className='border-t'>
                      <td className='px-2 py-1'>{d.statusCode || 'pending'}</td>
                      <td className='px-2 py-1'>{d.eventType}</td>
                      <td className='px-2 py-1'>{d.deliveredAt || '-'}</td>
                      <td className='px-2 py-1 text-right'>
                        <button
                          className='underline'
                          onClick={() =>
                            actions.resendDelivery(selected.id, d.id)
                          }
                        >
                          Resend
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!deliveries?.length && (
                    <tr>
                      <td
                        colSpan={4}
                        className='text-center text-gray-500 px-2 py-4'
                      >
                        No deliveries
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className='text-sm text-gray-500'>
            Select a webhook to view deliveries
          </div>
        )}
      </div>
    </div>
  );
}
