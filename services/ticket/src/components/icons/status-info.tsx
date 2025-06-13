import { SVGProps } from 'react';

export const StatusInfoIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0Zm-.662 5.361a.894.894 0 1 1 1.264 1.266.894.894 0 0 1-1.264-1.266Zm0 0 .047.047-.047-.047Zm.855 3.076a.578.578 0 0 0-.633.125l-1.491 1.49-.057.067-.001.002a.575.575 0 0 0 .06.75.579.579 0 0 0 .82 0l.5-.499v6.877h-.914l-.098.01h-.003a.581.581 0 0 0 .104 1.151h2.983l.098-.009h.003a.58.58 0 0 0-.104-1.152h-.91V8.97l-.008-.094v-.002a.576.576 0 0 0-.349-.436Z"
        clipRule="evenodd"
      />
    </svg>
  );
};
