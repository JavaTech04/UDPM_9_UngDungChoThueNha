// Use solanaWeb3 globally available after the CDN load
const { Connection, PublicKey } = solanaWeb3;

const NFTPay = () => {
  Pay();
};

const Pay = async () => {
  await accessNFTs();
  console.log("Buy successfully");
};
const accessNFTs = async () => {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const tokenMint = "9ARngHhVaCtH5JFieRdSS5Y8cdZk2TMF4tfGSWFB9iSK";

  try {
    // Fetch the largest accounts for the token mint
    const largestAccounts = await connection.getTokenLargestAccounts(
      new PublicKey(tokenMint)
    );

    // Get parsed account info
    const largestAccountInfo = await connection.getParsedAccountInfo(
      largestAccounts.value[0].address
    );

    // Log the owner of the largest account
    console.log(largestAccountInfo.value.data.parsed.info.owner);
  } catch (error) {
    console.error("Error accessing NFTs:", error);
  }
};
