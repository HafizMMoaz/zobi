
// TODO: POC only component can be removed after PR approved
export default {
  metadata: {
    name: 'Example',
    description: 'Example description',
    iconName: 'filter',
  },
  loadComponent: () => import('./ExampleComponent'),
};
