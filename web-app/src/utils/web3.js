const {
  web3Default,
  sendContractFunc,
  getObjContract,
  getChainId,
  privateKeyToAccount,
  sendFunc,
} = require("./utils");
export var list;


const PokemonJson = require("./contracts/Pokemon.json");
const contractAddress = require("./contractAdress.json");
const privateKey =
  "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

var PokemonContract;
async function init() {
  if (!PokemonContract) {
    PokemonContract = new web3Default.eth.Contract(
      PokemonJson.abi,
      contractAddress.pokemon
    );
  }

  const list = await getList("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  list.length < 10 && (await createMons());
}

async function createMons() {
  const obj = getObjContract(PokemonContract, "openEgg", []);
  for (let i = 1; i < 15; i++) {
    await sendContractFunc(privateKey, contractAddress.pokemon, obj);
  }
}

async function updateAvatar(_tokenId = 0, _newAvatar = "") {
  const params = [_tokenId, _newAvatar];
  let isSend = true;
  const from = (await privateKeyToAccount(privateKey)).address;
  try {
    await PokemonContract.methods.updateAvatar(...params).call({
      from,
    });
  } catch (error) {
    console.log(error.message);
    isSend = false;
  }

  if (isSend) {
    await sendContractFunc(
      privateKey,
      contractAddress.pokemon,
      getObjContract(PokemonContract, "updateAvatar", params)
    );
  }
}

async function updateName(_tokenId = 0, _name = "") {
  const params = [_tokenId, _name];
  let isSend = true;
  const from = (await privateKeyToAccount(privateKey)).address;
  console.log({ from });
  try {
    await PokemonContract.methods.updateName(...params).call({
      from,
    });
  } catch (error) {
    console.log(error.message);
    isSend = false;
  }

  if (isSend) {
    // await sendContractFunc(
    //   privateKey,
    //   contractAddress.pokemon,
    //   getObjContract(PokemonContract, "updateName", params)
    // );
    await sendFunc(
      privateKey,
      PokemonContract,
      contractAddress.pokemon,
      "updateName",
      params
    );
  }
}

async function getMon(_tokenId = 0) {
  const pokemon = await PokemonContract.methods.getMon(_tokenId).call();
  return pokemon;
}
async function getList(_owner = "") {
  const list = await PokemonContract.methods.getMons(_owner).call();
  return list;
}
async function start() {
  await init();

  // await updateAvatar(
  //   1,
  //   "https://i.pinimg.com/originals/2d/39/30/2d3930b4718b286265d0765ba2a725b9.jpg"
  // );

  // await updateName(1, "picachu222");

  // const pokemon = await getMon(1);
  // const { tokenID, name, rank, stage, race } = pokemon;
  // console.log({ tokenID, name, rank, stage, race });
  list = await getList("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  console.log("xxx ", list);
}

start();

async function runFunc(promissFunc) {
  return new Promise(async (reslove) => {
    const data = await promissFunc;
    reslove(data);
  });
}

module.exports = {
  getList,
  runFunc,
};
