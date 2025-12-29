/**
 * MessageList - 消息列表组件
 */

'use client';

import type { Message } from '@/hooks/useAgent';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return null; // 空状态由 ChatInterface 处理
  }

  return (
    <div className="space-y-2">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}

