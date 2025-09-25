// Mock conversations. Purely static data for the visual implementation.

import type { Conversation, Attachment } from '@/types/messages-types';
import { formatTime12h } from '@/lib/date';

// Single public assets used across all example attachments.
const PUBLIC_IMAGE = '/exampleImg.jpg';
const PUBLIC_FILE = '/files/sample.txt';

const now = new Date();
function atTime(base: Date, h: number, m: number) {
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    h,
    m,
    0,
    0
  );
}
function dayShift(from: Date, deltaDays: number) {
  const d = new Date(from);
  d.setDate(from.getDate() + deltaDays);
  return d;
}

const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const yesterday = dayShift(today, -1);
const twoDaysAgo = dayShift(today, -2);

function imageAtt(id: string, name: string): Attachment {
  return {
    id,
    kind: 'image',
    name,
    size: 250_000,
    mime: 'image/jpeg',
    url: PUBLIC_IMAGE,
    width: 900,
    height: 900,
  };
}
function fileAtt(
  id: string,
  name: string,
  size = 18_000,
  mime = 'text/plain'
): Attachment {
  return {
    id,
    kind: 'file',
    name,
    size,
    mime,
    url: PUBLIC_FILE,
  };
}

export const mockConversations: Conversation[] = [
  {
    id: 'conv_john',
    participant: {
      id: 'user_john',
      name: 'John Doe',
      avatarUrl: '/person1.png',
    },
    unread: 2,
    messages: [
      {
        id: 'j_001',
        direction: 'received',
        text: 'Hey! Welcome to the project 🚀',
        createdAt: atTime(twoDaysAgo, 10, 5).toISOString(),
        time: formatTime12h(atTime(twoDaysAgo, 10, 5)),
      },
      {
        id: 'j_002',
        direction: 'sent',
        text: 'Thanks John, glad to be here!',
        createdAt: atTime(twoDaysAgo, 10, 8).toISOString(),
        time: formatTime12h(atTime(twoDaysAgo, 10, 8)),
        status: 'read',
      },

      {
        id: 'j_101',
        direction: 'sent',
        text: 'Are you joining the sync later today?',
        createdAt: atTime(yesterday, 16, 40).toISOString(),
        time: formatTime12h(atTime(yesterday, 16, 40)),
        status: 'read',
      },
      {
        id: 'j_102',
        direction: 'received',
        text: 'Yes, I\'ll be there at 5:30.',
        createdAt: atTime(yesterday, 16, 42).toISOString(),
        time: formatTime12h(atTime(yesterday, 16, 42)),
        replyTo: { id: 'j_101', text: 'Are you joining the sync later today?' },
      },
      {
        id: 'j_103',
        direction: 'received',
        text: 'Also sharing the latest slide.',
        attachments: [fileAtt('att_j_103_1', 'sample.txt')], // one file from public
        createdAt: atTime(yesterday, 16, 45).toISOString(),
        time: formatTime12h(atTime(yesterday, 16, 45)),
      },
      {
        id: 'j_104',
        direction: 'sent',
        text: 'Got it, thanks!',
        createdAt: atTime(yesterday, 16, 47).toISOString(),
        time: formatTime12h(atTime(yesterday, 16, 47)),
        status: 'read',
        replyTo: { id: 'j_103', text: 'Also sharing the latest slide.' },
      },

      {
        id: 'j_201',
        direction: 'sent',
        text: 'Morning! Here’s an option for the hero.',
        attachments: [imageAtt('att_j_201_1', 'chat-sample.jpg')], // one image from public
        createdAt: atTime(today, 9, 12).toISOString(),
        time: formatTime12h(atTime(today, 9, 12)),
        status: 'read',
        replyTo: { id: 'j_102', text: 'Yes, I\'ll be there at 5:30.' },
      },
      {
        id: 'j_202',
        direction: 'received',
        text: 'Nice! I love this 😍',
        createdAt: atTime(today, 9, 14).toISOString(),
        time: formatTime12h(atTime(today, 9, 14)),
        replyTo: {
          id: 'j_201',
          text: 'Morning! Here’s an option for the hero.',
        },
      },
      {
        id: 'j_203',
        direction: 'received',
        text: 'Can you tweak the spacing a bit?',
        createdAt: atTime(today, 9, 16).toISOString(),
        time: formatTime12h(atTime(today, 9, 16)),
      },
      {
        id: 'j_204',
        direction: 'sent',
        text: 'On it. Will share an updated pass shortly.',
        createdAt: atTime(today, 9, 18).toISOString(),
        time: formatTime12h(atTime(today, 9, 18)),
        status: 'delivered',
        replyTo: { id: 'j_203', text: 'Can you tweak the spacing a bit?' },
      },
    ],
  },

  {
    id: 'conv_amy',
    participant: {
      id: 'user_amy',
      name: 'Amy Lee',
      avatarUrl: '/person2.png',
    },
    unread: 0,
    messages: [
      {
        id: 'a_001',
        direction: 'received',
        text: 'Hi there! Can you review the document I sent?',
        createdAt: atTime(yesterday, 9, 5).toISOString(),
        time: formatTime12h(atTime(yesterday, 9, 5)),
      },
      {
        id: 'a_002',
        direction: 'sent',
        text: 'Sure, taking a look now.',
        createdAt: atTime(yesterday, 9, 7).toISOString(),
        time: formatTime12h(atTime(yesterday, 9, 7)),
        status: 'read',
      },
      {
        id: 'a_003',
        direction: 'received',
        text: 'Thanks! Please check section 3 in particular.',
        createdAt: atTime(yesterday, 9, 8).toISOString(),
        time: formatTime12h(atTime(yesterday, 9, 8)),
        replyTo: { id: 'a_002', text: 'Sure, taking a look now.' },
      },
      {
        id: 'a_004',
        direction: 'sent',
        text: 'Added a quick screenshot to show my point.',
        attachments: [imageAtt('att_a_004_1', 'chat-sample.jpg')], // same public image
        createdAt: atTime(yesterday, 9, 12).toISOString(),
        time: formatTime12h(atTime(yesterday, 9, 12)),
        status: 'delivered',
      },
      {
        id: 'a_101',
        direction: 'sent',
        text: 'Here are my notes as a file.',
        attachments: [fileAtt('att_a_101_1', 'sample.txt')], // same public file
        createdAt: atTime(today, 11, 4).toISOString(),
        time: formatTime12h(atTime(today, 11, 4)),
        status: 'sent',
        replyTo: {
          id: 'a_003',
          text: 'Thanks! Please check section 3 in particular.',
        },
      },
      {
        id: 'a_102',
        direction: 'received',
        text: 'Perfect. I’ll merge these suggestions, thank you!',
        createdAt: atTime(today, 11, 10).toISOString(),
        time: formatTime12h(atTime(today, 11, 10)),
      },
    ],
  },
];
