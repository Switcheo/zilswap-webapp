const getLocalStored = (key: string) => {
  try {
    const stored = localStorage.getItem(key);
    return JSON.parse(stored!);
  } catch (err) {
    return undefined;
  }
}

export default getLocalStored;