import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { ErrorState } from '@/components/feedback/ErrorState';

/** Catches render errors and failed lazy-chunk loads (e.g. after a redeploy). */
export function RouteErrorPage() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  if (!isNotFound) console.error(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <ErrorState
        title={isNotFound ? 'Page not found' : 'Something went wrong'}
        message={
          isNotFound
            ? "The page you're looking for doesn't exist."
            : 'An unexpected error occurred. Reloading usually fixes it.'
        }
        onRetry={isNotFound ? undefined : () => window.location.reload()}
        action={
          <a
            href="/"
            className="rounded-full bg-slate-200 px-5 py-2.5 font-semibold hover:bg-slate-300"
          >
            Go home
          </a>
        }
      />
    </div>
  );
}
