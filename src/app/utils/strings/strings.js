export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

export const format = (template, qnr, answers) => {
  const matches = template.match(/{{\s*([a-zA-Z0-9_-]+)\s*}}/g);
  if (matches) {
    for (const match of matches) {

      const questionCode = match.replace(/[{}]/g, "");
      const questionIndex = qnr.directory[questionCode];
      if (!questionIndex) {
        template = template.replace(new RegExp(match), "");
        continue;
      }

      const question = qnr.questions[questionIndex];
      const { options, values } = question;
      const answer = answers[questionCode];
      const valueIndex = values.indexOf(answer);
      const text = valueIndex >= 0 ? options[valueIndex] || "" : "";
      template = template.replace(new RegExp(match), text);
    }
  }
  return template;
};