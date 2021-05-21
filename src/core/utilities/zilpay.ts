export const getConnectedZilPay = async () => {
  const zilPay = (window as any).zilPay;
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
