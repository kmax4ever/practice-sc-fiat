import ContractStore from "./contractStore";

class DepsContainer {

  public contractStore: ContractStore;


  public constructor() {
    this.contractStore = new ContractStore(this);

  }
}

export default DepsContainer;
