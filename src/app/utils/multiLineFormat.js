import React from "react";

const multilineFormat = (text = "") => text.split("\n").map((item, index) => <span key={index}>{item}<br /></span>);

export default multilineFormat;
