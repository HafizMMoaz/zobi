
import { lazy, ComponentType } from 'react';
import { JsonObject } from '@zobi-ui/core';

export interface RegistryMetadata {
  description: string;
  name: string;
}

export interface ComponentItem<Metadata = RegistryMetadata> {
  metadata: Metadata;
  loadComponent: () => Promise<{ default: ComponentType<any> }>;
}

export interface ComponentRegistry<Metadata = RegistryMetadata> {
  metadata: Metadata;
  Component: ComponentType<any>;
}

export type FunctionalRegistryState<RegistryT> = {
  registry: { [key: string]: RegistryT & { key: string } };
  registryKeys: string[];
};

export const registryGetAll =
  <RegistryT>({ registryKeys, registry }: FunctionalRegistryState<RegistryT>) =>
  () =>
    registryKeys.map(key => registry[key]);

export const registryDelete =
  <RegistryT>({ registryKeys, registry }: FunctionalRegistryState<RegistryT>) =>
  (keyToDelete: string) => {
    // eslint-disable-next-line no-param-reassign
    registryKeys = registryKeys.filter(key => key !== keyToDelete);
    // eslint-disable-next-line no-param-reassign
    delete registry[keyToDelete];
  };

export const registryGet =
  <RegistryT>({ registry }: FunctionalRegistryState<RegistryT>) =>
  (key: string) =>
    registry[key];

export const registrySet =
  ({ registryKeys, registry }: FunctionalRegistryState<JsonObject>) =>
  (key: string, item: JsonObject) => {
    registryKeys.push(key);
    // eslint-disable-next-line no-param-reassign
    registry[key] = {
      key,
      ...item,
    };
  };

export const registrySetComponent =
  ({ registryKeys, registry }: FunctionalRegistryState<ComponentRegistry>) =>
  (key: string, item: ComponentItem) => {
    registryKeys.push(key);
    // eslint-disable-next-line no-param-reassign
    registry[key] = {
      key,
      metadata: item.metadata,
      Component: lazy(item.loadComponent),
    };
  };
