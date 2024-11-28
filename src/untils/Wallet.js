export const getProvider = () => {
  if (window.solana && window.solana.isPhantom) {
    return window.solana;
  }
  throw new Error("Phantom Wallet không được cài đặt");
};
