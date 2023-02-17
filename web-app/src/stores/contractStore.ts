import { action, makeObservable, observable } from "mobx";
import BaseStore from "./BaseStore";
import { callFunc } from "../utils/utils";
import Web3 from "web3";
import { CONTRACT_COLLECT } from "../utils/contracts/contract";
export var metaWeb3Default;
class ContractStore extends BaseStore {
  @observable public orderData = {
    docs: [] as any,
  };
  @observable public isLogin = false;
  constructor(depsContainer: any) {
    super(depsContainer);
    makeObservable(this);
    console.log({ CONTRACT_COLLECT });
  }
  //   @action public getSpecialEggByID = async (eggID) => {
  //     try {
  //       const data = await getSpecialEggByID(eggID);
  //       this.eggInfo = data.data.response || null;
  //     } catch (err) {
  //       console.log("Err", err);
  //       NotiStackInstance.push({
  //         children: "Cannot get egg by id",
  //         variant: "error",
  //       });
  //     }
  //   };

  @action public getList = async () => {
    try {
      this.orderData.docs = await callFunc(
        CONTRACT_COLLECT["Order"],
        "getOrders",
        []
      );

      console.log("xx docs",this.orderData.docs );
      
    } catch (err) {
      console.log(err);
    }
  };

  public async askMetamaskPermission(type: "METAMASK" | "COINBASE") {
    try {
      let provider;
      if (window.ethereum.providers) {
        provider = window.ethereum.providers.find((provider) => {
          return type === "METAMASK"
            ? provider.isMetaMask
            : provider.isWalletLink;
        });
      } else {
        provider = window.ethereum;
      }

      if (!provider) {
        throw new Error("Please connect to metamask/coinbase wallet first");
      }

      await provider.request({ method: "eth_requestAccounts" });
      provider.on("accountsChanged", () => {
        window.location.reload();
      });

      metaWeb3Default = await new Web3(provider);
      const accounts = await metaWeb3Default.eth.getAccounts();
      if (accounts.length === 0) {
        throw "account not found";
      }
      const account = accounts[0];
      metaWeb3Default.eth.defaultAccount = account;

      return account;
    } catch (e) {
      console.log("askWeb3Permission err", e);
    }
  }
}

export default ContractStore;
