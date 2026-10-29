import { useState, type ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';

type ImageWithFallbackProps = ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string };

/** Shows a neutral placeholder instead of a broken-image icon when `src` fails. */
export function ImageWithFallback({ src, alt, className = '', ...rest }: ImageWithFallbackProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-slate-200 text-slate-400 ${className}`}
      >
        <ImageOff size={32} aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className={className}
      {...rest}
    />
  );
}
