'use client';
export type MsgStatus = 'sent' | 'delivered' | 'read';

export default function MessageStatus({ status }: { status: MsgStatus }) {
  const label = status === 'read' ? '✓✓' : status === 'delivered' ? '✓✓' : '✓';
  const cls   = status === 'read' ? 'text-blue-500' : 'text-gray-400';
  return <span className={`text-[10px] ${cls}`} aria-label={`status: ${status[0].toUpperCase()}${status.slice(1)}`}>{label}</span>;
}
