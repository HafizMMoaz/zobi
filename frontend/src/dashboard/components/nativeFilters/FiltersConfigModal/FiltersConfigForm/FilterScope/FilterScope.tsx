
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { NativeFilterScope } from '@zobi.dev/core';
import { styled } from '@zobi.dev/extension-api/theme';
import { FormItem } from '@zobi.dev/core/components';
import ScopingTree from './ScopingTree';
import { getDefaultScopeValue } from './utils';

type FilterScopeProps = {
  pathToFormValue?: string[];
  updateFormValues: (values: any, triggerFormChange?: boolean) => void;
  formFilterScope?: NativeFilterScope;
  forceUpdate: Function;
  filterScope?: NativeFilterScope;
  chartId?: number;
  initiallyExcludedCharts?: number[];
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  & > * {
    margin-bottom: ${({ theme }) => theme.sizeUnit}px;
  }
  padding: 0px ${({ theme }) => theme.sizeUnit * 4}px;
`;

const CleanFormItem = styled(FormItem)`
  margin-bottom: 0;
`;

const FilterScope: FC<FilterScopeProps> = ({
  pathToFormValue = [],
  formFilterScope,
  forceUpdate,
  filterScope,
  updateFormValues,
  chartId,
  initiallyExcludedCharts,
}) => {
  const initialFilterScope = useMemo(
    () => filterScope || getDefaultScopeValue(chartId, initiallyExcludedCharts),
    [chartId, filterScope, initiallyExcludedCharts],
  );
  const [hasScopeBeenModified, setHasScopeBeenModified] = useState(false);

  const onUpdateFormValues = useCallback(
    (formValues: any) => {
      updateFormValues(formValues);
      setHasScopeBeenModified(true);
    },
    [updateFormValues],
  );

  const updateScopes = useCallback(
    (updatedFormValues: Record<string, any>) => {
      if (hasScopeBeenModified) {
        return;
      }

      updateFormValues(updatedFormValues, false);
    },
    [hasScopeBeenModified, updateFormValues],
  );

  useEffect(() => {
    const updatedFormValues = {
      scope: initialFilterScope,
    };
    updateScopes(updatedFormValues);
  }, [initialFilterScope, updateScopes]);

  return (
    <Wrapper>
      <ScopingTree
        updateFormValues={onUpdateFormValues}
        initialScope={initialFilterScope}
        formScope={formFilterScope}
        forceUpdate={forceUpdate}
        chartId={chartId}
        initiallyExcludedCharts={initiallyExcludedCharts}
      />
      <CleanFormItem
        name={[...pathToFormValue, 'scope']}
        hidden
        initialValue={initialFilterScope}
      />
    </Wrapper>
  );
};

export default FilterScope;
