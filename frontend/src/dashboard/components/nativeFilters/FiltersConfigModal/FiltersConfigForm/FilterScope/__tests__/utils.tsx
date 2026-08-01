import { useEffect } from 'react';
import { Provider } from 'react-redux';
import FiltersConfigForm, {
  FilterPanels,
} from 'src/dashboard/components/nativeFilters/FiltersConfigModal/FiltersConfigForm/FiltersConfigForm';
import { mockStoreWithChartsInTabsAndRoot } from 'spec/fixtures/mockStore';
import { Form, type FormInstance } from '@zobi-ui/core/components';

export const createMockedProps = () => ({
  expanded: false,
  filterId: 'DefaultFilterId',
  dependencies: [],
  setErroredFilters: jest.fn(),
  restoreFilter: jest.fn(),
  getAvailableFilters: () => [],
  getDependencySuggestion: () => '',
  save: jest.fn(),
  removedFilters: {},
  handleActiveFilterPanelChange: jest.fn(),
  activeFilterPanelKeys: `DefaultFilterId-${FilterPanels.configuration.key}`,
  isActive: true,
  validateDependencies: jest.fn(),
  onModifyFilter: jest.fn(),
});

interface MockModalProps {
  scope?: object;
  formRef: { current: FormInstance | null };
}

export const createMockModal = ({ scope, formRef }: MockModalProps) => {
  const MockModalComponent = () => {
    const [form] = Form.useForm();

    useEffect(() => {
      // Create a new ref object instead of modifying the parameter
      const currentForm = form;
      Object.defineProperty(formRef, 'current', {
        value: currentForm,
        writable: true,
      });

      if (scope) {
        currentForm.setFieldsValue({
          filters: {
            [createMockedProps().filterId]: {
              scope,
            },
          },
        });
      }
    }, [form]); // Add form to dependency array

    return (
      <Provider store={mockStoreWithChartsInTabsAndRoot}>
        <Form form={form}>
          <FiltersConfigForm form={form} {...createMockedProps()} />
        </Form>
      </Provider>
    );
  };

  return { MockModalComponent };
};

export const getTreeSwitcher = (order = 0) =>
  document.querySelectorAll('.ant-tree-switcher')[order];
