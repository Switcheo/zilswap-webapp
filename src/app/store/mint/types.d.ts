export interface MintState {
  mintContracts: MintContract[];
  activeMintContract?: MintContract;
}

export enum Status {
  Created = "created",
  Queued = "queued",
  Deploying = "deploying",
  Minting = "minting",
  Transferring = "transferring",
  Completed = "completed",
}

export interface MintContract {
  id: string

  creator: string,
  status: Status,
  contractAddress: string | null;

  collectionName: string;
  collectionDesc: string;
  royaltyBps: number;
  royaltyType: string;

  tokenCount: number;
  mintedCount: number;
}
