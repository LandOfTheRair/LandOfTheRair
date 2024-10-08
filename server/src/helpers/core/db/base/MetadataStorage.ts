import { isUndefined, kebabCase, pickBy } from 'lodash';

export class MetadataStorage {
  private static collectionNames: Record<string, string> = {};
  private static hiddenPropertiesByEntity: Record<
    string,
    Record<string, boolean>
  > = {};
  private static persistPropertiesByEntity: Record<
    string,
    Record<string, boolean>
  > = {};

  private static getTypeForEntity(entity): string {
    return entity.prototype?.constructor?.name || entity.constructor?.name;
  }

  static getCollectionForEntity(entity): string {
    const entityName = this.getTypeForEntity(entity);
    if (!entityName) {
      throw new Error(`Error getting collection for entity ${entity.name}`);
    }

    return this.collectionNames[entityName];
  }

  static assignEntityMetadata(entity) {
    const entityName = this.getTypeForEntity(entity);
    if (!entityName || this.collectionNames[entityName]) return;
    this.collectionNames[entityName] = kebabCase(entityName);
  }

  static setPropertyMetadata(entity, propName, propertyMetadata) {
    const entityName = this.getTypeForEntity(entity);
    if (!entityName) return;

    this.hiddenPropertiesByEntity[entityName] =
      this.hiddenPropertiesByEntity[entityName] || {};
    this.persistPropertiesByEntity[entityName] =
      this.persistPropertiesByEntity[entityName] || {};

    if (!isUndefined(propertyMetadata.hidden)) {
      this.hiddenPropertiesByEntity[entityName][propName] =
        propertyMetadata.hidden;
    }

    if (!isUndefined(propertyMetadata.persist)) {
      this.persistPropertiesByEntity[entityName][propName] =
        propertyMetadata.persist;
    }
  }

  static getEnumerableObject(object) {
    const entityName = this.getTypeForEntity(object);
    if (!entityName) return null;

    return pickBy(object, (value, key) => {
      if (key === '_id') return false;
      return !this.hiddenPropertiesByEntity[entityName][key];
    });
  }

  static getPersistObject(object) {
    const entityName = this.getTypeForEntity(object);
    if (!entityName) return null;

    return pickBy(
      object,
      (value, key) =>
        this.persistPropertiesByEntity[entityName][key] || key === 'createdAt',
    );
  }
}
