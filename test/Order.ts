const { expect } = require("chai");
import { ethers } from "hardhat";
import { fromWei, toWei } from "../utils/utils";
const BN = require("bn.js");
describe("Order Contract", function () {
  it("Deployment deal contract", async function () {
    const [owner] = await ethers.getSigners();

    const Order = await ethers.getContractFactory("Order");
    const order = await Order.deploy();

    const K1Token = await ethers.getContractFactory("K1Token");
    const k1Token = await K1Token.deploy();

    const USDT = await ethers.getContractFactory("USDT");
    const usdt = await USDT.deploy();

    await order.createPair(k1Token.address, usdt.address);

    const pairData = await order.getPairByToken(k1Token.address, usdt.address);
    console.log({ pair: pairData });

    await k1Token.approve(order.address, toWei("99999999999999999999"));
    await usdt.approve(order.address, toWei("99999999999999999999"));

    const _orderType = "0";
    const _amount = toWei("88888");
    const _price = "2"
    const _pair = pairData.pair;

    await order.createOrder(_pair, "1", _amount, _price);
    await order.createOrder(_pair, "0", _amount, _price);
    const orders = await order.getOrders();
    console.log(orders);

    const [balance1, balance2] = await Promise.all([
      k1Token.balanceOf(order.address),
      usdt.balanceOf(order.address),
    ]);

    console.log({
      balance1: fromWei(balance1.toString()),
      balance2: fromWei(balance2.toString()),
    });

    expect();
  });
});
