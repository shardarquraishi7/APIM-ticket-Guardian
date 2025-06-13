import { SVGProps } from 'react';

export const CheckmarkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M8.942 19.511a.98.98 0 0 0 .15-.166l12.627-13.57c.38-.41.374-1.06-.015-1.464a.992.992 0 0 0-1.44-.003L7.998 17.06l-4.265-4.434a.994.994 0 0 0-1.435 0 1.091 1.091 0 0 0-.025 1.47l4.961 5.558c.204.228.493.351.793.345.272.013.55-.1.752-.317l.141-.152.023-.019Z"
        clipRule="evenodd"
      />
    </svg>
  );
};
