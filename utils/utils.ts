import { ethers } from "hardhat";

export const toWei = (value: string, decimal?: number) => {
  return ethers.utils.parseUnits(value, decimal || "ether");
};

export const fromWei = (value: string, decimal?: number) => {
  return ethers.utils.formatUnits(value, decimal || "ether");
};
