const {
  web3Default,
  sendContractFunc,
  getObjContract,
  getChainId,
  privateKeyToAccount,
  sendFunc,
  callFunc,
  fromWei,
  toWei,
} = require("./utils");

const privateKey =
  "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const contractAddress = require("./contractAdress.json");
const AbiJson = require("./ABI.json");
var CONTRACT = {};
const DealContract = getContract("Deal");
function getContract(name) {
  return new web3Default.eth.Contract(AbiJson[name], contractAddress[name]);
}

async function createPair(params) {
  await sendContractFunc(
    privateKey,
    contractAddress["Deal"],
    getObjContract(DealContract, "createPair", params)
  );
}

async function getPairByToken(params) {
  return await callFunc(DealContract, "getPairByToken", params);
}

async function getAllPairs(params = []) {
  return await callFunc(DealContract, "getAllPairs", params);
}

async function createDeal(params) {
  await sendContractFunc(
    privateKey,
    contractAddress["Deal"],
    getObjContract(DealContract, "createPair", params)
  );
}

async function init() {}

async function start() {
  await init();

  const params = [contractAddress.K1Token, contractAddress.USDT];

  //   // await createPair(params);

  const pairData = await getPairByToken(params);
  console.log({ pairData });

  //   const pairs = await getAllPairs([]);
  //   console.log({ pairs });
  let token0Symbol = "";
  for (const key in contractAddress) {
    if (pairData.token0.toLowerCase() === contractAddress[key].toLowerCase()) {
      token0Symbol = key;
      break;
    }
  }

  console.log({ token0Symbol });
  const token0 = getContract(token0Symbol);

  const balanceDealContract = await token0.methods
    .balanceOf(contractAddress.Deal)
    .call();
  console.log("xxxx ", { balanceDealContract });

  // const { pair } = pairData;
  // const amount0 = toWei(99).toString();
  // const amount1 = toWei(2000).toString();
  // const expireTime = new Date().getTime() + 3600;

  // await sendFunc(privateKey, token0, contractAddress[token0Symbol], "approve", [
  //   contractAddress.Deal,
  //   amount0,
  // ]);


  const sender = (await privateKeyToAccount(privateKey)).address;

  // const allowance = await callFunc(token0, `allowance`, [
  //   sender,
  //   contractAddress.Deal,
  // ]);
  // // approve
  // console.log({ allowance });

  // const paramDeal = [pair, amount0, amount1, expireTime];
  // await sendFunc(
  //   privateKey,
  //   DealContract,
  //   contractAddress.Deal,
  //   "createDeal",
  //   paramDeal
  // );

  const deals = await callFunc(DealContract, "getDealActive", [sender]);
  console.log({ deals });

  const deal1= await callFunc(DealContract, "getDeal", [ deals[0].dealId]);

  console.log({deal1});

  await sendFunc(privateKey, DealContract, contractAddress.Deal, "cancelDeal", [
    deals[0].dealId,
  ]);


  const dealCalcel= await callFunc(DealContract, "getDeal", [ deals[0].dealId]);

  console.log({dealCalcel});
  
  const balanceDealContract222 = await token0.methods
    .balanceOf(contractAddress.Deal)
    .call();
  console.log("xxxx ", { balanceDealContract222 });
}

start();
