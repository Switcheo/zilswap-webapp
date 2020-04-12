import { PrivateKeyConnectedWallet } from './PrivateKeyConnectedWallet';
import { connectWalletPrivateKey } from "./wallet";

const TEST_ZIL_ADDRESS = {
  privateKey: "3375F915F3F9AE35E6B301B7670F53AD1A5BE15D8221EC7FD5E503F21D3450C8",
  publicKey: "02bd2d38bd776319e685134041615fe3b8e8c674b65353624d2da8e2a6823e1a5b",
  address: "0x8254b2C9aCdf181d5d6796d63320fBb20D4Edd12",
  bech32Address: "zil1sf2t9jdvmuvp6ht8jmtrxg8mkgx5ahgj6h833r",
}

test("test connects wallet (PrivateKey) properly", async () => {

  const result = await connectWalletPrivateKey(TEST_ZIL_ADDRESS.privateKey);

  expect(result).toBeDefined();
  expect(result.wallet).toBeInstanceOf(PrivateKeyConnectedWallet);

  const wallet = <PrivateKeyConnectedWallet>result.wallet;

  expect(wallet.account.privateKey.toUpperCase()).toBe(TEST_ZIL_ADDRESS.privateKey);
  expect(wallet.account.publicKey).toBe(TEST_ZIL_ADDRESS.publicKey);
  expect(wallet.account.address).toBe(TEST_ZIL_ADDRESS.address);
  expect(wallet.account.bech32Address).toBe(TEST_ZIL_ADDRESS.bech32Address);
});

test("test generate fresh wallet", async () => {
  // generate new ecdsa privateKey
  // connect wallet
  // test balance = 0
});