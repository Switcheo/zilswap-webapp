import React from "react";

const Icon: React.FC = (props) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props} >
      <g clip-path="url(#clip0_4026_6643)">
        <path d="M19 3H4.99C3.88 3 3.01 3.89 3.01 5L3 19C3 20.1 3.88 21 4.99 21H19C20.1 21 21 20.1 21 19V5C21 3.89 20.1 3 19 3ZM19 16H15.87C15.4 16 15.02 16.34 14.89 16.8C14.54 18.07 13.37 19 12 19C10.63 19 9.46 18.07 9.11 16.8C8.98 16.34 8.6 16 8.13 16H5V6C5 5.45 5.45 5 6 5H18C18.55 5 19 5.45 19 6V16Z" fill="#00FFB0" />
        <line x1="7.5" y1="7.5" x2="16.5" y2="7.5" stroke="#00FFB0" stroke-linecap="round" />
        <line x1="7.5" y1="10.5" x2="16.5" y2="10.5" stroke="#00FFB0" stroke-linecap="round" />
        <line x1="7.5" y1="13.5" x2="16.5" y2="13.5" stroke="#00FFB0" stroke-linecap="round" />
      </g>
      <defs>
        <clipPath id="clip0_4026_6643">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default Icon;