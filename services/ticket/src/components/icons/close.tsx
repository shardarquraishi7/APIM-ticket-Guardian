import { cn } from '@/lib/utils';

export default function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={cn(className)}>
      <path
        fillRule="evenodd"
        d="M5.79 4.307a1.049 1.049 0 0 0-1.483 1.482L10.517 12l-6.21 6.211a1.049 1.049 0 0 0 0 1.483 1.052 1.052 0 0 0 1.482 0L12 13.483l6.211 6.21.001.002a1.052 1.052 0 0 0 1.482-.001 1.049 1.049 0 0 0 0-1.483l-6.211-6.21 6.21-6.212a1.049 1.049 0 0 0-1.482-1.482l-6.21 6.21-6.212-6.21Z"
        clipRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
}
