import { action, makeObservable, observable } from "mobx";
import BaseStore from "./BaseStore";
import { callFunc } from "../utils/utils";
import Web3 from "web3";
import { CONTRACT_COLLECT } from "../utils/contracts/contract";
import { constants } from "buffer";
export var metaWeb3Default;
class ContractStore extends BaseStore {
  @observable public orderData = {
    docs: [] as any,
  };

  @observable public matchData = {
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

  _convertOrder = (i) => {
    const {
      amount0Total,
      owner,
      amount1Total,
      amount0,
      amount1,
      price,
      token0,
      token1,
      orderType: type,
      status,
      createdTime,
      orderId,
      time,
    } = i;
    return {
      orderId,
      amount0,
      amount1,
      price,
      status,
      type,
      createdTime,
      token0,
      token1,
      owner,
      amount0Total,
      amount1Total,
      time,
    };
  };

  @action public getList = async () => {
    try {
      const rs = await callFunc(CONTRACT_COLLECT["Order"], "getOrders", []);
      this.orderData.docs = rs.map((i) => {
        return this._convertOrder(i);
      });
    } catch (err) {
      console.log(err);
    }
  };

  @action public getMatchs = async () => {
    try {
      const rs = await callFunc(CONTRACT_COLLECT["Order"], "getMatchs", []);
      this.matchData.docs = rs.map((i) => {
        return this._convertOrder(i);
      });
    } catch (err) {
      console.log(err);
    }
  };

  @action public refesh = async () => {
    try {
      const rs = await callFunc(CONTRACT_COLLECT["Order"], "getOrders", []);
      const existsOrder = rs.map((i) => i[0]);

      for (const i of rs) {
        const orderId = i[0];
        const amount0 = i[4];
        const amount1 = i[5];
        const price = i[6];
        const status = i[10];
        const type = i[11];
        if (!existsOrder.includes(orderId)) {
          this.orderData.docs.push({
            orderId,
            amount0,
            amount1,
            price,
            status,
            type,
          });
        }
      }
    } catch {}
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
