export const getConnectedZeeves = async () => {
  const zeeves = (window as any).Zeeves;

  try {
    if (typeof zeeves !== "undefined") {
      const walletInfo = await zeeves.getSession();
      if (walletInfo) {
        return zeeves;
      }
    } else {
      console.error("Zeeves is not supported");
    }
  } catch (err) {
    console.error(err && err.stack ? err.stack : JSON.stringify(err));
  }

  return null;
};
