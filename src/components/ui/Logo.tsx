type LogoProps = {
  /** `dark` = black wordmark for light backgrounds; `light` = white wordmark for dark ones. */
  tone?: 'dark' | 'light';
  className?: string;
};

/** The WebMart wordmark with the brand-coloured full stop. Sized by height, like an image. */
export function Logo({ tone = 'dark', className = 'h-7 w-auto' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 138 32"
      role="img"
      aria-label="WebMart"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="25"
        fontFamily="Montserrat, system-ui, sans-serif"
        fontWeight="800"
        fontSize="27"
        letterSpacing="-0.8"
        className={tone === 'dark' ? 'fill-ink' : 'fill-white'}
      >
        WebMart<tspan className="fill-brand-400">.</tspan>
      </text>
    </svg>
  );
}
