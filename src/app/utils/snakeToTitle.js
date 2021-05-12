const snakeToTitle = (str) => {
  if (!str) str = "";
  str = str.toLowerCase();
  str = str.split('_');

  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }

  return str.join(' ');
}

export default snakeToTitle;
