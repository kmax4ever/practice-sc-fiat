

import { web3Default } from "../utils";
const contractAdress = require("./contractAdress.json");
const abiJson = require("./ABI.json");

export const CONTRACT_COLLECT = {};
console.log(contractAdress);

for (const contractName in contractAdress) {
    CONTRACT_COLLECT[contractName] = new web3Default.eth.Contract(
    abiJson[contractName],
    contractAdress[contractName]
  );
}

console.log({ CONTRACT_COLLECT });
