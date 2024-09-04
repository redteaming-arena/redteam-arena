import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const GithubIcon: React.FC<IconProps> = ({className}) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M22 8V14H21V16H20V18H19V19H18V20H17V21H15V22H14V17H13V16H14V15H16V14H17V13H18V8H17V5H15V6H14V7H13V6H9V7H8V6H7V5H5V8H4V13H5V14H6V15H8V17H6V16H5V15H3V16H4V18H5V19H8V22H7V21H5V20H4V19H3V18H2V16H1V14H0V8H1V6H2V4H3V3H4V2H6V1H8V0H14V1H16V2H18V3H19V4H20V6H21V8H22Z"
      fill="white"
    />
  </svg>
);

export default GithubIcon;