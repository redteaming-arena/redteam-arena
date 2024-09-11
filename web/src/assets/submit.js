import React from "react";

const SubmitIcon = ({
  width = "24px",
  height = "24px",
  color = "currentColor",
  ...props
}) => (
  <svg
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={width}
    height={height}
    {...props}
  >
    <path
      d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2h12zM10 7H8v2h2V7zm0 0h2V5h-2v2zm0 10H8v-2h2v2zm0 0h2v2h-2v-2z"
      fill={color}
    />
  </svg>
);

export default SubmitIcon;
