const Web3 = require("web3");
var ethers = require("ethers");
const endpoint = `http://127.0.0.1:8545/`;
//const endpoint ="https://rpc.ankr.com/optimism"
const web3Default = new Web3(endpoint);
const EthUtil = require("ethereumjs-util");
const Transaction = require("ethereumjs-tx");
const utils = require("web3-utils");
const { toBN } = utils;
const BN = require("bn.js");
const provider = new ethers.providers.JsonRpcProvider(endpoint);

const privateKeyToAccount = async (privateKey) => {
  //const account = await web3Default.eth.accounts.privateKeyToAccount(privateKey)

  const privateKeyBuffer = EthUtil.toBuffer("0x" + privateKey);
  const publickeyBuffer = EthUtil.privateToPublic(privateKeyBuffer);
  const addressBuffer = EthUtil.pubToAddress(publickeyBuffer);

  const publicKey = "0x" + publickeyBuffer.toString("hex");
  const address = "0x" + addressBuffer.toString("hex");
  const nonce = await getNonce(address);
  const blockNumer = await getBlockNumber(address);
  const balance = await getBalance(address);
  // console.log({
  //   address,
  //   nonce,
  //   balance,
  // });
  return { address };
};

async function getBalance(address) {
  let balance = await web3Default.eth.getBalance(address);
  balance = Web3.utils.fromWei(balance);
  return balance;
}

const getNonce = async (address) => {
  return await web3Default.eth.getTransactionCount(address);
};

const getBlockNumber = async () => {
  return await web3Default.eth.getBlockNumber();
};

const getChainId = async () => {
  console.log("xx get chian di");
  const chainId = await web3Default.eth.getChainId();
  console.log(chainId);
};

const getPastLogs = async () => {
  const lastBlock = await getBlockNumber();
  const logs = await web3Default.eth.getPastLogs({
    topics: [
      "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
      "0x00000000000000000000000010ed43c718714eb63d5aa57b78b54704e256024e",
      "0x00000000000000000000000098b577c6508650c430b010d3541530c3cd043851",
    ],
    fromBlock: 17015871,
    toBlock: 17015871,
  });
  //   const events = processLogs(logs);

  //   console.log(events);
};

const getGasPrice = async () => {
  const gasPrice = await web3Default.eth.getGasPrice();
  console.log({
    gasPrice,
  });
};

const isAddress = (address) => {
  return web3Default.utils.isAddress(address);
};

const sendTransaction = async (privateKey, to, amount, dataObj) => {
  const wallet = new ethers.Wallet(privateKey).connect(provider);

  let gasPrice = await web3Default.eth.getGasPrice();
  gasPrice = toBN(gasPrice);
  gasPrice = toBN(gasPrice).mul(toBN("11")).div(toBN("10"));

  const txObj = {
    chainId: 31337, // local 1337
    from: wallet.address,
    value: amount,
    gasPrice: Web3.utils.toHex(gasPrice),
    gasLimit: Web3.utils.toHex("5000000"),
    to,
  };

  //    gasPrice: BigNumber { value: "1000000008" },
  //gasLimit: BigNumber { value: "55649" },

  if (dataObj) {
    txObj["data"] = dataObj.encodeABI();
  }

  console.log("xxxx");
  try {
    const txn = await wallet.sendTransaction(txObj);
    await txn.wait();
    console.info(`... Sent! ${txn.hash}`);
    return txn.hash;
  } catch (error) {
    console.log(error.message);
  }
};

const sendCoin = async (privateKey, to, amount) => {
  const wallet = new ethers.Wallet(privateKey).connect(provider);
  let gasPrice = await web3Default.eth.getGasPrice();
  gasPrice = toBN(gasPrice);
  gasPrice = toBN(gasPrice).mul(toBN("11")).div(toBN("10"));
  const _amountHex = Web3.utils.toWei(amount ? amount.toString() : `0`);

  const txObj = {
    chainId: 10, // local 1337
    from: wallet.address,
    value: Web3.utils.toHex(_amountHex || 0),
    gasPrice: Web3.utils.toHex(gasPrice),
    gasLimit: Web3.utils.toHex("2000000"),
    to,
  };

  console.log({ to });

  try {
    const txn = await wallet.sendTransaction(txObj);
    console.info(`... Sent! ${txn.hash}`);
    return txn.hash;
  } catch (error) {
    console.log(error.message);
  }

  const txHash = await sendTransaction(privateKey, to, amount);
  console.log({ txHash });
};

const sendContractFunc = async (privateKey, contractAddress, dataObj) => {
  const txHash = await sendTransaction(
    privateKey,
    contractAddress,
    null,
    dataObj
  );
  console.log({ txHash });
  return txHash;
};

const sendFunc = async (pkey, contract, to, funcName, params) => {
  const txHash = await sendTransaction(
    pkey,
    to,
    null,
    getObjContract(contract, funcName, params)
  );
  console.log({ txHash });
  return txHash;
};

const callFunc = async (contract, funcName, params) => {
  const data = await contract.methods[funcName](...params).call();
  return data;
};

const convertNumber = (value, decimal) => {
  console.log({ value });
  try {
    return ethers.utils.formatUnits(value.toString(), decimal || "ether");
  } catch (error) {
    console.log(error.mesasge);
  }
};

const randomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function expandDecimals(n, decimals) {
  return bigNumberify(n).mul(bigNumberify(10).pow(decimals));
}

function toUsd(value) {
  const normalizedValue = parseInt(value * Math.pow(10, 10));
  return ethers.BigNumber.from(normalizedValue).mul(
    ethers.BigNumber.from(10).pow(20)
  );
}

const waitMs = (msDuration) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(null);
    }, msDuration);
  });
};

function bigNumberify(n) {
  try {
    return ethers.BigNumber.from(n);
  } catch (e) {
    console.error("bigNumberify error", e);
    return undefined;
  }
}

const checkSumAddress = (address) => {
  return Web3.utils.toChecksumAddress(address);
};

const getBlockTime = async () => {
  const blockNumber = await web3Default.eth.getBlockNumber();
  const block = await web3Default.eth.getBlock(blockNumber);
  return block.timestamp;
};

function getPriceBits(prices) {
  if (prices.length > 8) {
    throw new Error("max prices.length exceeded");
  }

  let priceBits = new BN("0");

  for (let j = 0; j < 8; j++) {
    let index = j;
    if (index >= prices.length) {
      break;
    }

    const price = new BN(prices[index]);
    if (price.gt(new BN("2147483648"))) {
      // 2^31
      throw new Error(`price exceeds bit limit ${price.toString()}`);
    }

    priceBits = priceBits.or(price.shln(j * 32));
  }

  return priceBits.toString();
}

const getObjContract = (contract, funcName, params) => {
  return contract.methods[`${funcName}`](...params);
};


const fromWei = (value) => {
  try {
    return ethers.utils.formatUnits(value.toString(), "ether");
  } catch (error) {
    console.log(error.mesasge);
  }
};

const toWei = (value) => {
  try {
    return ethers.utils.parseUnits(value.toString(), "ether");
  } catch (error) {
    console.log(error.mesasge);
  }
};


module.exports = {
  privateKeyToAccount,
  web3Default,
  getPastLogs,
  sendCoin,
  sendContractFunc,
  getGasPrice,
  isAddress,
  sendTransaction,
  getBlockNumber,
  provider,
  convertNumber,
  randomInt,
  expandDecimals,
  toUsd,
  waitMs,
  bigNumberify,
  checkSumAddress,
  getBlockTime,
  getPriceBits,
  getObjContract,
  getChainId,
  sendFunc,
  callFunc,
  fromWei,
  toWei
};
