import {
  ComponentItem,
  ComponentRegistry,
  FunctionalRegistryState,
  registryDelete,
  registryGet,
  registryGetAll,
  RegistryMetadata,
  registrySetComponent,
} from '../../utils/functionalRegistry';

export interface DashboardComponentsRegistryMetadata extends RegistryMetadata {
  iconName: string;
}

/*
  This is registry that contains list of dynamic dashboard components that can be added in addition to main components
 */

const DashboardComponentsRegistry = (
  initComponents: { key: string; item: ComponentItem }[] = [],
) => {
  const state: FunctionalRegistryState<
    ComponentRegistry<DashboardComponentsRegistryMetadata>
  > = {
    registry: {},
    registryKeys: [],
  };

  const set = registrySetComponent(state);

  initComponents.forEach(({ key, item }) => {
    set(key, item);
  });

  return {
    set,
    get: registryGet(state),
    delete: registryDelete(state),
    getAll: registryGetAll(state),
  };
};

export default DashboardComponentsRegistry;
