import React from "react";

export default (text = "") => text.split("\n").map((item, index) => <span key={index}>{item}<br /></span>);