export const getConnectedZilPay = async () => {
  let zilPay = (window as any).zilPay;
  if (!zilPay) {
    await delay(1500) // wallet injection may sometimes be slow
    zilPay = (window as any).zilPay;
  }
  if (typeof zilPay === "undefined") return null;

  try {
    // Only request connection approval when the session isn't already
    // approved — ZilPay 2.0 surfaces a permission popup on every connect()
    // call, so an unconditional call re-prompts users on each page load
    // and account/network switch.
    if (zilPay.wallet.isConnect) {
      return zilPay;
    }

    const result = await zilPay.wallet.connect();
    if (result === zilPay.wallet.isConnect) {
      return zilPay;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
