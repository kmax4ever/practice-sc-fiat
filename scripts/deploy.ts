import { ethers } from "hardhat";

async function main() {
  const testFolder = "./contracts/";
  const fs = require("fs");
  const files = fs.readdirSync(testFolder);
  const contractAddress = {} as any;
  var CONTRACT = {} as any;
  const deployContract = async (contrName: string) => {
    // const lockedAmount = ethers.utils.parseEther("1");
    const contract = await ethers.getContractFactory(contrName);
    const contractDeploy = await contract.deploy();
    CONTRACT[contrName] = contractDeploy;
    contractAddress[contrName] = contractDeploy.address;
  };

  for (const file of files) {
    const name = file.split(".")[0];
    await deployContract(name);
  }

  console.log(contractAddress);

  const getABIS = (patch = "./contracts/") => {
    const files = fs.readdirSync(patch);
    const jsonDir = "../artifacts/contracts";
    var ABI = {} as any;

    for (const file of files) {
      const name = file.split(".")[0];
      const jsonFile = require(`${jsonDir}/${file}/${name}.json`);
      ABI[name] = jsonFile.abi;
    }

    fs.writeFileSync("ABI.json", JSON.stringify(ABI, null, 4));
  };

  await getABIS();
  //await CONTRACT["Deal"].createPair(contractAddress[`K1Token`],contractAddress[`USDT`]);

  await CONTRACT["Order"].createPair(
    contractAddress[`K1Token`],
    contractAddress[`USDT`]
  );
  await fs.writeFileSync(
    "contractAdress.json",
    JSON.stringify(contractAddress, null, 4)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
