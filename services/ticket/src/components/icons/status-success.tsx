import { SVGProps } from 'react';

export const StatusSuccessIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M12 0c6.624 0 12 5.376 12 12s-5.376 12-12 12S0 18.624 0 12 5.376 0 12 0Zm6.198 6.231-9.2 9.564-3.2-3.325a.746.746 0 0 0-1.075 0 .819.819 0 0 0-.019 1.102l3.72 4.168c.153.171.37.264.596.26a.729.729 0 0 0 .563-.239l.106-.114.017-.014a.76.76 0 0 0 .113-.125l9.47-10.177a.805.805 0 0 0-.01-1.098.744.744 0 0 0-1.08-.002Z"
        clipRule="evenodd"
      />
    </svg>
  );
};
