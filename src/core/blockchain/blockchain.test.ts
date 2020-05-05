import { Transaction } from "@zilliqa-js/account";
import { getTransaction } from "./blockchain";

const TEST_TRANSACTION = {
  hash: "3f3459c8c7751ebb71c72ed70cc4e9cbde2f2936ce0e694cd60bae85bf0f687b",
  signature: "0x457727D997CCF9875936EEFF5113C54D8003C915022E2F64DAF908C1C324BA409FB4B545F3C6CC2A1ED94C70F8174FBE46DC435C9C9C13A6EE4B1FEDD113C21E",
}

test("test retrieve transaction with hash", async () => {

  const transaction = await getTransaction(TEST_TRANSACTION.hash);

  expect(transaction).toBeInstanceOf(Transaction);
  expect(transaction.payload.signature).toBe(TEST_TRANSACTION.signature);
});


test("test create transaction", async () => {
  // expect transaction amount
  // expect toAddr/fromAddr
  // expect gas amount
});