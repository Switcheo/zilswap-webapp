export const getConnectedZ3Wallet = async () => {
  let z3Wallet = (window as any).z3Wallet;
  if (!z3Wallet) {
    await delay(1500); // wallet injection may sometimes be slow
    z3Wallet = (window as any).z3Wallet;
  }
  try {
    if (typeof z3Wallet !== "undefined") {
      const result = await z3Wallet.wallet.connect();
      if (result === z3Wallet.wallet.isConnect) {
        return z3Wallet;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return null;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
