import { SVGProps } from 'react';

export function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M7 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4v4a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4V3Zm14 12h-4V9a2 2 0 0 0-2-2H9V3h12v12Zm-6-6H3v12h12V9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
