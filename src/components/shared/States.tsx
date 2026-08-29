import { Loader2, AlertCircle, FileQuestion } from 'lucide-react';

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-neutral-500">
      <Loader2 className="w-8 h-8 animate-spin mb-4 text-forest-500" />
      <p className="font-medium text-sm animate-pulse">{message}</p>
    </div>
  );
}

export function EmptyState({ 
  title = "No data found", 
  description = "There is nothing to display here right now.",
  action
}: { 
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-neutral-50 border border-neutral-100 rounded-2xl border-dashed">
      <div className="w-12 h-12 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mb-4">
        <FileQuestion className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-neutral-900 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export function ErrorState({ 
  message = "Something went wrong. Please try again later.",
  onRetry
}: { 
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-coral-50 border border-coral-100 rounded-2xl">
      <div className="w-12 h-12 bg-coral-100 text-coral-600 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-coral-900 mb-1">Error</h3>
      <p className="text-sm text-coral-700 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-coral-600 text-white text-sm font-medium rounded-xl hover:bg-coral-700 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
