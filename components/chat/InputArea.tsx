/**
 * InputArea - 输入区域组件
 */

'use client';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
}

export function InputArea({
  value,
  onChange,
  onSend,
  onKeyPress,
  isLoading,
}: InputAreaProps) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder="Ask AgentOS to do something..."
        className="w-full bg-[#161b22] border border-gray-700 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none h-14 text-sm font-medium text-white placeholder-gray-500"
        disabled={isLoading}
      />
      <button
        onClick={onSend}
        disabled={!value.trim() || isLoading}
        className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  );
}

