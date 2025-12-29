import { FunctionCall } from '@google/generative-ai';

interface ConfirmationDialogProps {
  visible: boolean;
  toolCall: FunctionCall;
  correlationId: string;
  onConfirm: (correlationId: string) => void;
  onCancel: (correlationId: string) => void;
}

export function ConfirmationDialog({
  visible,
  toolCall,
  correlationId,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          🔐 工具调用确认
        </h3>

        <div className="space-y-3 mb-6">
          <div className="text-sm text-gray-300">
            <strong>工具：</strong> {toolCall.name}
          </div>

          {toolCall.args && Object.keys(toolCall.args).length > 0 && (
            <div className="text-sm text-gray-300">
              <strong>参数：</strong>
              <pre className="bg-gray-900 p-2 rounded mt-1 text-xs overflow-x-auto">
                {JSON.stringify(toolCall.args, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onCancel(correlationId)}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(correlationId)}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            确认执行
          </button>
        </div>
      </div>
    </div>
  );
}