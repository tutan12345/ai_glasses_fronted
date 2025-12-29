import { TodoItem } from '@/types/agent';

interface TodoListProps {
  todos: TodoItem[];
}

export function TodoList({ todos }: TodoListProps) {
  if (!todos || todos.length === 0) return null;

  return (
    <div className="mx-6 mt-4 mb-2 bg-[#161b22] border border-gray-800 rounded-lg overflow-hidden shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className="px-4 py-2 bg-[#21262d] border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
          </svg>
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">任务规划</span>
        </div>
        <span className="text-[10px] font-mono text-gray-500 bg-[#0d1117] px-2 py-0.5 rounded-full border border-gray-800">
          {todos.filter(t => t.status === 'completed').length} / {todos.length}
        </span>
      </div>
      <div className="p-2 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
        {todos.map((todo) => (
          <div key={todo.id} className="flex items-start gap-3 p-2 hover:bg-[#0d1117] rounded transition-colors group">
            <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors
              ${todo.status === 'completed' ? 'bg-green-500 border-green-500' : 
                todo.status === 'in_progress' ? 'border-blue-400 bg-blue-500/10 animate-pulse' :
                todo.status === 'cancelled' ? 'border-gray-600 bg-gray-800' : 'border-gray-600 group-hover:border-gray-400'}`}
            >
              {todo.status === 'completed' && (
                <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
              {todo.status === 'in_progress' && (
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
               <p className={`text-sm leading-tight transition-colors ${
                 todo.status === 'completed' ? 'text-gray-500 line-through decoration-gray-600' : 
                 todo.status === 'cancelled' ? 'text-gray-600 line-through decoration-gray-700' : 
                 todo.status === 'in_progress' ? 'text-blue-200 font-medium' : 'text-gray-300'
               }`}>
                 {todo.content || todo.title}
               </p>
            </div>
            {todo.status === 'in_progress' && (
               <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 font-mono whitespace-nowrap">
                 执行中
               </span>
            )}
            {todo.status === 'cancelled' && (
               <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-500 rounded border border-gray-700 font-mono whitespace-nowrap">
                 已取消
               </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
