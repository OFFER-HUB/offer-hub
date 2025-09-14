'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConversationItem } from './conversation-item';
import { Conversation } from './@types/conversation.entity';
import { Tabs, TabsList, TabsTrigger } from '@radix-ui/react-tabs';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: number;
  onConversationSelect: (id: number) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onConversationSelect,
}: ConversationListProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] =
    useState(conversations);

  useEffect(() => {
    let result = [...conversations];

    // Filtrar por tab
    if (activeTab === 'unread') {
      result = result.filter((conv) => conv.unread);
    } else if (activeTab === 'archived') {
      result = result.filter((conv) => conv.archived);
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (conv) =>
          conv.name.toLowerCase().includes(query) ||
          conv.message.toLowerCase().includes(query) ||
          conv.category.toLowerCase().includes(query),
      );
    }

    setFilteredConversations(result);
  }, [activeTab, searchQuery, conversations]);

  return (
    <div className='w-80 border-r flex flex-col'>
      <div className='p-4 border-b'>
        <h2 className='text-xl font-semibold mb-4'>Messages</h2>
        <div className='relative'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            type='text'
            placeholder='Search conversations...'
            className='pl-8 bg-muted/40'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs
        defaultValue='all'
        className='w-full'
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <div className='px-4 pt-2'>
          <TabsList className='w-full grid grid-cols-3'>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='unread'>Unread</TabsTrigger>
            <TabsTrigger value='archived'>Archived</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <div className='flex items-center justify-between px-4 py-2'>
        <span className='text-sm text-muted-foreground'>
          Recent conversations
        </span>
        <Button variant='ghost' size='icon' className='h-8 w-8'>
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>

      <div className='flex-1 overflow-auto'>
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              name={conversation.name}
              avatar={conversation.avatar}
              message={conversation.message}
              category={conversation.category}
              active={activeConversationId === conversation.id}
              unread={conversation.unread}
              onClick={() => onConversationSelect(conversation.id)}
            />
          ))
        ) : (
          <div className='p-4 text-center text-muted-foreground'>
            No conversations found
          </div>
        )}
      </div>
    </div>
  );
}
