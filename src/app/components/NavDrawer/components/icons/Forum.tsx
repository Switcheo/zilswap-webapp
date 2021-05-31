import React from "react";

const Icon: React.FC = (props) => {
    return (
        <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M15 4.5H14.25V10.5C14.25 10.9125 13.9125 11.25 13.5 11.25H4.5V12C4.5 12.825 5.175 13.5 6 13.5H13.5L16.5 16.5V6C16.5 5.175 15.825 4.5 15 4.5ZM12.75 8.25V3C12.75 2.175 12.075 1.5 11.25 1.5H3C2.175 1.5 1.5 2.175 1.5 3V12.75L4.5 9.75H11.25C12.075 9.75 12.75 9.075 12.75 8.25Z" fill="#00FFB0"/>
        </svg>
    );
};

export default Icon;