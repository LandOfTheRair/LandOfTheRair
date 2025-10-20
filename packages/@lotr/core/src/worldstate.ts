import type { ICharacter, IMapState, IWorldMap } from '@lotr/interfaces';
import { InstancedWorldMap, WorldMap } from './worldmap';

class WorldState {
  maps: Record<string, IWorldMap> = {};
  instances: Record<string, IWorldMap> = {};
  instanceNameToInstancePrototype: Record<string, string> = {};
  mapStates: Record<string, IMapState> = {};
  characterUUIDHash: Record<string, ICharacter> = {};
}

const worldState = new WorldState();

export function worldMapAdd(mapName: string, mapJson: any): void {
  worldState.maps[mapName] = new WorldMap(mapName, mapJson);
}

export function worldMapRemove(mapName: string): void {
  delete worldState.maps[mapName];
}

export function worldMapGet(mapName: string): IWorldMap | undefined {
  return worldState.maps[mapName];
}

export function worldGetMapAndState(mapName: string): {
  map: IWorldMap | undefined;
  state: IMapState | undefined;
} {
  return {
    map: worldState.instances[mapName] || worldState.maps[mapName],
    state: worldState.mapStates[mapName],
  };
}

export function worldMapInstanceAdd(mapName: string, mapJson: any): void {
  worldState.instances[mapName] = new InstancedWorldMap(mapName, mapJson);
}

export function worldMapInstanceRemove(mapName: string): void {
  delete worldState.instances[mapName];
}

export function worldMapInstanceGet(mapName: string): IWorldMap | undefined {
  return worldState.instances[mapName];
}

export function worldMapInstancePrototypeAdd(
  instanceName: string,
  prototypeName: string,
): void {
  worldState.instanceNameToInstancePrototype[instanceName] = prototypeName;
}

export function worldMapInstancePrototypeRemove(instanceName: string): void {
  delete worldState.instanceNameToInstancePrototype[instanceName];
}

export function worldMapStateAll(): IMapState[] {
  return Object.values(worldState.mapStates);
}

export function worldMapStateSet(mapName: string, mapState: IMapState): void {
  worldState.mapStates[mapName] = mapState;
}

export function worldMapStateRemove(mapName: string): void {
  delete worldState.mapStates[mapName];
}

export function worldMapStateGet(mapName: string): IMapState | undefined {
  return worldState.mapStates[mapName];
}

export function worldMapStateGetForCharacter(
  character: ICharacter,
): IMapState | undefined {
  return worldState.mapStates[character.map];
}

export function worldCharacterAdd(character: ICharacter): void {
  worldState.characterUUIDHash[character.uuid] = character;
}

export function worldCharacterRemove(character: ICharacter): void {
  delete worldState.characterUUIDHash[character.uuid];
}

export function worldCharacterGet(
  characterUUID: string,
): ICharacter | undefined {
  return worldState.characterUUIDHash[characterUUID];
}
