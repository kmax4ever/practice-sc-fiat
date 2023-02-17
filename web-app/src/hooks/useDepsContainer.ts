import DepsContainer from "../stores/depsContainer";
import { createContext, useContext } from "react";

const depsContainer = new DepsContainer();
const depsContainerCtx = createContext(depsContainer);

const useDepsContainer = () => useContext(depsContainerCtx);

export default useDepsContainer;
