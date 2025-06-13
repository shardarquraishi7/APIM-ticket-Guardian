import React from 'react';
import type { SVGProps } from 'react';

interface MenuIconProps extends SVGProps<SVGSVGElement> {
  isOpen: boolean;
}

export function MenuIcon({ isOpen = false, ...props }: MenuIconProps) {
  return isOpen ? <LineMdMenuFoldLeft {...props} /> : <LineMdMenuFoldRight {...props} />;
}

function LineMdMenuFoldLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}>
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      >
        <path strokeDasharray={16} strokeDashoffset={16} d="M19 5h-14">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            dur="0.2s"
            values="16;0"
          ></animate>
        </path>
        <path strokeDasharray={10} strokeDashoffset={10} d="M19 12h-9">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="0.2s"
            dur="0.2s"
            values="10;0"
          ></animate>
        </path>
        <path strokeDasharray={16} strokeDashoffset={16} d="M19 19h-14">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="0.4s"
            dur="0.2s"
            values="16;0"
          ></animate>
        </path>
        <path strokeDasharray={10} strokeDashoffset={10} d="M7 9l-3 3l3 3">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="0.6s"
            dur="0.2s"
            values="10;0"
          ></animate>
        </path>
      </g>
    </svg>
  );
}

function LineMdMenuFoldRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}>
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      >
        <path strokeDasharray={16} strokeDashoffset={16} d="M5 5h14">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            dur="0.2s"
            values="16;0"
          ></animate>
        </path>
        <path strokeDasharray={10} strokeDashoffset={10} d="M5 12h9">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="0.2s"
            dur="0.2s"
            values="10;0"
          ></animate>
        </path>
        <path strokeDasharray={16} strokeDashoffset={16} d="M5 19h14">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="0.4s"
            dur="0.2s"
            values="16;0"
          ></animate>
        </path>
        <path strokeDasharray={10} strokeDashoffset={10} d="M17 9l3 3l-3 3">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="0.6s"
            dur="0.2s"
            values="10;0"
          ></animate>
        </path>
      </g>
    </svg>
  );
}
