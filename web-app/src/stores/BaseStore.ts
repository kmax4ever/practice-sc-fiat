import { makeObservable } from "mobx";
import DepsContainer from "./depsContainer";

class BaseStore {
  public depsContainer: DepsContainer;
  public constructor(depsContainer: DepsContainer) {
    this.depsContainer = depsContainer;
  }
}

export default BaseStore;
