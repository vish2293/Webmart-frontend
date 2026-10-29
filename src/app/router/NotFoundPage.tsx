import { ErrorState } from '@/components/feedback/ErrorState';
import { ButtonLink } from '@/components/ui/ButtonLink';

export default function NotFoundPage() {
  return (
    <ErrorState
      title="Page not found"
      message="The page you're looking for doesn't exist or has moved."
      action={<ButtonLink to="/">Go home</ButtonLink>}
    />
  );
}
