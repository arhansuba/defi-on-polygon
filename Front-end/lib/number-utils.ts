import { BigNumber, ethers } from 'ethers';

/**
 * converts the number to a BigNumber with the correct units to keep Solidity happy
 * NOTE: Math in Solidity only uses fixed-point numbers so we use the smallest unit, i.e. n * 10^18
 * e.g. makeBig(1) = 1000000000000000000, as 1 ETH is equal to 1000000000000000000 wei
 * for more info see https://docs.openzeppelin.com/contracts/3.x/erc20#a-note-on-decimals
 */
const makeBig = (value: string | number) => {
  if (typeof value === 'number') {
    value = value.toString();
  }
  return ethers.utils.parseUnits(value);
};

/**
 * converts a BigNumber to a user-friendly string for readability
 * e.g. makeNum(1345600000000000000) = 1.34
 * for more info see https://docs.ethers.io/v5/api/utils/display-logic/
 */
const makeNum = (value: BigNumber) => {
  const numStr = ethers.utils.formatUnits(value, 18);
  return numStr.substring(0, numStr.indexOf('.') + 3); // keep only 2 decimals
};

export { makeBig, makeNum };