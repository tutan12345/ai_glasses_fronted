'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { MessageBus } from '@/lib/confirmation-bus/message-bus';
import { PolicyEngine } from '@/lib/policy/policy-engine';
import { PolicyDecision } from '@/lib/policy/types';

const MessageBusContext = createContext<MessageBus | null>(null);

export function MessageBusProvider({ children }: { children: ReactNode }) {
  // 创建全局MessageBus实例
  const messageBus = useMemo(() => {
    const policyEngine = new PolicyEngine({
      defaultDecision: PolicyDecision.ASK_USER,
    });
    return new MessageBus(policyEngine, true); // debug mode
  }, []);

  return (
    <MessageBusContext.Provider value={messageBus}>
      {children}
    </MessageBusContext.Provider>
  );
}

export function useMessageBus(): MessageBus {
  const context = useContext(MessageBusContext);
  if (!context) {
    throw new Error('useMessageBus must be used within MessageBusProvider');
  }
  return context;
}