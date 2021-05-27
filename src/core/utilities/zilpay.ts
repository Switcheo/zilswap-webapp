export const getConnectedZilPay = async () => {
  let zilPay = (window as any).zilPay;
  if (!zilPay) {
    await delay(1500) // wallet injection may sometimes be slow
    zilPay = (window as any).zilPay;
  }
  try {
    if (typeof zilPay !== "undefined") {
      const result = await zilPay.wallet.connect();
      if (result === zilPay.wallet.isConnect) {
        return zilPay;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return null;
};

const delay = (ms: number) =>  new Promise(resolve => setTimeout(resolve, ms));
