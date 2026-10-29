import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';

type LogoProps = {
  /** `dark` = black wordmark for light backgrounds; `light` = white wordmark for dark ones. */
  tone?: 'dark' | 'light';
  className?: string;
};

export function Logo({ tone = 'dark', className = 'h-7 w-auto' }: LogoProps) {
  return (
    <img
      src={tone === 'dark' ? logoDark : logoLight}
      alt="Webvoltz"
      width={640}
      height={96}
      className={className}
    />
  );
}
