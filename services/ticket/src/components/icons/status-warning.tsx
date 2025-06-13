import { SVGProps } from 'react';

export const StatusWarningIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M12.883 2.342 23.026 21.4a1 1 0 0 1-.883 1.47H1.857a1 1 0 0 1-.883-1.47L11.117 2.342a1 1 0 0 1 1.766 0ZM12 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-.004-3c.425 0 .773-.368.785-.829L13 8.878c.012-.481-.343-.878-.785-.878h-.43c-.442 0-.797.397-.785.877l.21 8.293c.013.462.36.83.786.83Z"
        clipRule="evenodd"
      />
    </svg>
  );
};
