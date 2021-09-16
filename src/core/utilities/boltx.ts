export const getConnectedBoltX = async () => {
  let boltX = (window as any).boltX;
  if (!boltX) {
    await delay(1500) // wallet injection may sometimes be slow
    boltX = (window as any).boltX;
  }
  try {
    if (typeof boltX !== "undefined") {
      const result = await boltX.zilliqa.wallet.connect();
      if (result === boltX.zilliqa.wallet.isConnected) {
        return boltX;
      } else if (result === boltX.ethereum.isConnected) {
        return boltX;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return null;
};

const delay = (ms: number) =>  new Promise(resolve => setTimeout(resolve, ms));
