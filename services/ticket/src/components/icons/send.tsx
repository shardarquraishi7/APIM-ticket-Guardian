import React from 'react';
import type { SVGProps } from 'react';

export function SendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}>
      <path fill="currentColor" d="m2 21l21-9L2 3v7l15 2l-15 2z"></path>
    </svg>
  );
}
