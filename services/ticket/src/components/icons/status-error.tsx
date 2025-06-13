import { SVGProps } from 'react';

export const StatusErrorIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M0 12C0 5.376 5.376 0 12 0s12 5.376 12 12-5.376 12-12 12S0 18.624 0 12Zm12 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-.004-3c.425 0 .773-.368.785-.829L13 6.878c.012-.481-.343-.878-.785-.878h-.43c-.442 0-.797.397-.785.877l.21 8.293c.013.462.36.83.786.83Z"
        clipRule="evenodd"
      />
    </svg>
  );
};
