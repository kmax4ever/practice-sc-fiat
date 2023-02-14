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

const privateSeller =
  "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const privateBuyer =
  "59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
let token0Symbol = "";
let token1Symbol = "";
const contractAddress = require("./contractAdress.json");
const AbiJson = require("./ABI.json");
var CONTRACT = {};
const OrderContract = getContract("Order");

function getContract(name) {
  return new web3Default.eth.Contract(AbiJson[name], contractAddress[name]);
}

async function createPair(params) {
  await sendContractFunc(
    privateSeller,
    contractAddress["Deal"],
    getObjContract(OrderContract, "createPair", params)
  );
}

async function getPairByToken(params) {
  return await callFunc(OrderContract, "getPairByToken", params);
}

async function getAllPairs(params = []) {
  return await callFunc(OrderContract, "getAllPairs", params);
}

// async function createDeal(params) {
//   await sendContractFunc(
//     privateKey,
//     contractAddress["Deal"],
//     getObjContract(OrderContract, "createPair", params)
//   );
// }
var seller;
var buyer;
var K1Token = getContract("K1Token");
var USDT = getContract("USDT");
async function init() {
  seller = (await privateKeyToAccount(privateSeller)).address;
  buyer = (await privateKeyToAccount(privateBuyer)).address;

  console.log({ seller, buyer });
  await getBalanceAll();
}

async function getBalanceAll() {
  console.log("xxxx SELLER");
  const sellerk1Balance = await callFunc(K1Token, "balanceOf", [seller]);
  const sellerUsdtbalance = await callFunc(USDT, "balanceOf", [seller]);
  console.log({
    sellerk1Balance: +fromWei(sellerk1Balance),
    sellerUsdtbalance: +fromWei(sellerUsdtbalance),
  });

  console.log("xxxx BUYER");
  const k1Balance = await callFunc(K1Token, "balanceOf", [buyer]);
  const usdtBalance = await callFunc(USDT, "balanceOf", [buyer]);
  console.log({
    k1Balance: +fromWei(k1Balance),
    usdtBalance: +fromWei(usdtBalance),
  });
}

async function createOrder(token0Symbol, pairData) {
  const token0 = getContract(token0Symbol);
  const balanceOrderContract = await token0.methods
    .balanceOf(contractAddress.Order)
    .call();
  console.log("xxxx ", { balanceOrderContract });

  const { pair } = pairData;
  const amount0 = toWei(9).toString();
  const fee = toWei(0.01).toString();
  const price = toWei(0.01).toString();

  await sendFunc(
    privateSeller,
    token0,
    contractAddress[token0Symbol],
    "approve",
    [contractAddress.Order, "99999999999999999999"]
  );

  const currentAllowanceContract = await callFunc(token0, `allowance`, [
    seller,
    contractAddress.Order,
  ]);
  // approve
  console.log({ currentAllowanceContract });

  const paramDeal = [pair, "0", amount0, price];

  console.log({ paramDeal });
  console.log("xxx create order");
  await sendFunc(
    privateSeller,
    OrderContract,
    contractAddress.Order,
    "createOrder",
    paramDeal
  );
  console.log("xxx create deal");
}

async function fillDeal(_dealId, token1Symbol, _amount0) {
  console.log("xxx fillDeal", { token1Symbol });
  const token1 = getContract(token1Symbol);
  await sendFunc(
    privateBuyer,
    token1,
    contractAddress[token1Symbol],
    "approve",
    [contractAddress.Deal, "9999999999999999999"]
  );

  const allowance = await callFunc(token1, `allowance`, [
    buyer,
    contractAddress.Deal,
  ]);

  console.log({ allowance });

  await sendFunc(
    privateBuyer,
    OrderContract,
    contractAddress.Deal,
    "fillDeal",
    [_dealId, toWei(_amount0).toString()]
  );
}

async function start() {
  await init();

  const params = [contractAddress.K1Token, contractAddress.USDT];

  //   // await createPair(params);

  const pairData = await getPairByToken(params);
  console.log({ pairData });

  //   const pairs = await getAllPairs([]);
  //   console.log({ pairs });

  for (const key in contractAddress) {
    if (pairData.token0.toLowerCase() === contractAddress[key].toLowerCase()) {
      token0Symbol = key;
    }
    if (pairData.token1.toLowerCase() === contractAddress[key].toLowerCase()) {
      token1Symbol = key;
    }
  }

  console.log({ token0Symbol, token1Symbol });

await createOrder(token0Symbol, pairData);

//   const events = await OrderContract.getPastEvents("CreateOrder");
//   console.log({ events: events[0].returnValues });


  const orders = await callFunc(OrderContract, "getOrdersByType", [0]);
  console.log({ orders });

  // await sendFunc(privateKey, OrderContract, contractAddress.Deal, "cancelDeal", [
  //   deals[0].dealId,
  // ]);

  const balanceOrderContract = await getContract(token0Symbol)
    .methods.balanceOf(contractAddress.Order)
    .call();
  console.log("xxxx ", { balanceOrderContract });

  // const ethBalance = await web3Default.eth.getBalance(contractAddress.Deal);
  // console.log({ ethBalance: fromWei(ethBalance) });

  await getBalanceAll();
}

start();
