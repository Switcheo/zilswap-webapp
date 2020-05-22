import { listTransactions, getBalance } from "core/services/viewblockService";
import { TOKENS } from 'zilswap-sdk/lib/constants';
import { Dispatch } from 'redux';
import { getZilliqa } from "core/zilliqa";
import { actions } from "app/store";
import { BigNumber } from "bignumber.js";


export const getTokenPoolDetail = async (tokenId: string, dispatch: Dispatch) => {
  const tok_addr = TOKENS.TestNet[tokenId];
  if (!tok_addr) throw new Error("token address not found");
  const zilliqa = getZilliqa();
  await zilliqa.initialize();
  const pool = await zilliqa.getPool(tokenId);
  let { contributionPercentage, exchangeRate, tokenReserve, totalContribution, userContribution, zilReserve } = pool;
  contributionPercentage = new BigNumber(contributionPercentage);
  exchangeRate = new BigNumber(exchangeRate).toFixed(5);
  tokenReserve = new BigNumber(tokenReserve);
  totalContribution = new BigNumber(totalContribution).shiftedBy(-12);
  userContribution = new BigNumber(userContribution);
  zilReserve = new BigNumber(zilReserve);

  dispatch(actions.Wallet.update_currency_pool({
    currency: tokenId, contributionPercentage,
    exchangeRate, tokenReserve, totalContribution,
    userContribution, zilReserve
  }));
  await zilliqa.teardown();
}

export const getAllBalances = async (dispatch: Dispatch) => {
  const tokenArr = Object.keys(TOKENS.TestNet);
  console.log("getting all bal of:", tokenArr);
  const currencies = {};
  const zilswap = getZilliqa();
  let { zilliqa } = zilswap;
  const { address } = zilliqa.wallet.defaultAccount!;

  await tokenArr.map(async (tok) => {
    if (tok !== "ZIL") {
      let tok_addr = TOKENS.TestNet[tok];
      let contract = await zilliqa.contracts.at(tok_addr);
      let { balances_map } = await contract.getSubState("balances_map");
      if (balances_map) {
        let balance = balances_map[address.toLowerCase()];
        dispatch(actions.Wallet.update_currency_balance({ currency: tok, balance }));
      }
      await getTokenPoolDetail(tok, dispatch);
    }
  })
}