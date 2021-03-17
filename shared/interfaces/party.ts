
export interface IParty {
  name: string;
  members: string[];
}

export interface IPartyMember {
  name: string;
  partyName: string;
  username: string;
  baseClass: string;
  level: number;
  hpPercent: number;
  mpPercent: number;
  map: string;
  x: number;
  y: number;
  z: number;
}
