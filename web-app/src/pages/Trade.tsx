import React, { useEffect, useMemo } from "react";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { observer, useLocalStore } from "mobx-react";
import useDepsContainer from "hooks/useDepsContainer";
import { metaWeb3Default } from "stores/contractStore";
import ReactList from "react-list";
const Trade = () => {
  //should be memoized or stable
  useEffect(() => {
    contractStore.getList();
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

  const renderItem = (i) => {
    const { price, amount0 } = i;

    console.log("xxx price", price);
    console.log("xxx amount0", amount0);

    return (
      <li>
        <span>{i.price}</span> <span>{i.owner}</span>
      </li>
    );
  };

  return (
    <>
      <ul>{contractStore.orderData.docs.map((i) => renderItem(i))}</ul>

      {/* <button onClick={() => connectMetamask("METAMASK")}>connect</button> */}
    </>
  );
};

export default observer(Trade);
