import React, { useEffect, useMemo } from "react";
import { observer, useLocalStore } from "mobx-react";
import useDepsContainer from "hooks/useDepsContainer";
import { metaWeb3Default } from "stores/contractStore";
import { fromWei, toWei } from "../utils/utils";

const Trade = () => {
  //should be memoized or stable
  useEffect(() => {
    contractStore.getList();
    contractStore.getMatchs();
  }, []);
  const { contractStore } = useDepsContainer();

  if (contractStore.isLogin === false) {
  }

  const connectMetamask = async (type: "METAMASK" | "COINBASE") => {
    const account = await contractStore.askMetamaskPermission(type);
    console.log({ account });

    if (account) {
      try {
        const signature = await metaWeb3Default.eth.personal.sign(
          "BNM-LOGIN",
          account
        );
      } catch (err) {}
    } else {
      alert("please connect wallet");
    }
  };

  const renderOrder = (i) => {
    const { price, amount0, type, status, amount0Total, amount1Total } = i;
    const color = type == "0" ? "green" : "red";
    return (
      <>
        {" "}
        <tr className="tr">
          <td style={{ color: color }}>{fromWei(price)}</td> <td></td>{" "}
          <td style={{ color: color }}>{fromWei(amount0)}</td>
          <td></td> <td style={{ color: color }}>{fromWei(amount0Total)}</td>
          <td></td> <td>{fromWei(amount1Total)}</td>
        </tr>
      </>
    );
  };

  const renderMatch = (i) => {
    const { price, amount0, type, amount1, amount1Total, amount0Total, time } =
      i;
    const color = type == "0" ? "green" : "red";
    console.log("xxx i", i);

    return (
      <>
        {" "}
        <tr className="tr">
          <td style={{ color: color }}>{fromWei(price)}</td>
          <td style={{ color: color }}>{fromWei(amount0)}</td>
          <td style={{ color: color }}>{fromWei(amount1)}</td>
          <td style={{ color: color }}>{fromWei(amount0Total)}</td>
          <td style={{ color: color }}>{fromWei(amount1Total)}</td>
          <td style={{ color: "blue" }}>
            {new Date(time).toLocaleDateString()}
          </td>
        </tr>
      </>
    );
  };

  return (
    <>
      <table style={{ marginLeft: "20px", marginTop: "20px", float: "left" }}>
        <tr style={{ textAlign: "center" }}>
          <span>Orders</span>
        </tr>
        <tr>
          <td>Price</td> <td></td> <td>Amount</td> <td></td> <td>Total0</td>
          <td></td> <td>Total1</td>
        </tr>
        {contractStore.orderData.docs.map((i) => renderOrder(i))}
      </table>

      <table style={{ marginLeft: "50px", marginTop: "20px", float: "left" }}>
        <tr style={{ textAlign: "center" }}>
          <span>Match Orders</span>
        </tr>
        <tr>
          <td>Price</td> <td>Amount0</td> <td>Amount1</td> <td>Total0</td>
          <td>Total1</td> <td>Time</td>
        </tr>
        {contractStore.matchData.docs.map((i) => renderMatch(i))}
      </table>

      {/* <button onClick={() => connectMetamask("METAMASK")}>connect</button> */}
    </>
  );
};

export default observer(Trade);
