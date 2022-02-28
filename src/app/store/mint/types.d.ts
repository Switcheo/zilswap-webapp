export interface MintState {
  mintContracts: MintContract[];
  activeMintContract?: MintContract;
}

export enum Status {
  Created = "created",
  Queued = "queued",
  Pinning = "pinning",
  Pinned = "pinned",
  Deploying = "deploying",
  Deployed = "deployed",
  Minting = "minting",
  Minted = "minted",
  Transferring = "transferring",
  Transferred = "transferred",
  Accepted = "accepted",
  Completed = "completed",
}

export interface MintContract {
  id: string;

  creator: string;
  status: Status;
  contractAddress: string | null;

  collectionName: string;
  collectionDesc: string;
  royaltyBps: number;
  royaltyType: string;

  pinnedCount: number;
  tokenCount: number;
  mintedCount: number;
}
