import React from 'react';
import type { SVGProps } from 'react';

export function StopIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}>
      <path fill="currentColor" d="M18 18H6V6h12z"></path>
    </svg>
  );
}
