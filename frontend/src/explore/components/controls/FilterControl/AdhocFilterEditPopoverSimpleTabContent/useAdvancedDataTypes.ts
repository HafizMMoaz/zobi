import { useCallback, useState } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { ensureIsArray, ZobiClient } from '@zobi.dev/core';
import { debounce } from 'lodash';
import rison from 'rison';
import { AdvancedDataTypesState, Props } from './index';

const INITIAL_ADVANCED_DATA_TYPES_STATE: AdvancedDataTypesState = {
  parsedAdvancedDataType: '',
  advancedDataTypeOperatorList: [],
  errorMessage: '',
};

const useAdvancedDataTypes = (validHandler: (isValid: boolean) => void) => {
  const [advancedDataTypesState, setAdvancedDataTypesState] =
    useState<AdvancedDataTypesState>(INITIAL_ADVANCED_DATA_TYPES_STATE);
  const [subjectAdvancedDataType, setSubjectAdvancedDataType] = useState<
    string | undefined
  >();

  const fetchAdvancedDataTypeValueCallback = useCallback(
    (
      comp: string | string[],
      advancedDataTypesState: AdvancedDataTypesState,
      subjectAdvancedDataType?: string,
    ) => {
      const values = ensureIsArray(comp);
      if (!subjectAdvancedDataType) {
        setAdvancedDataTypesState(INITIAL_ADVANCED_DATA_TYPES_STATE);
        return;
      }
      debounce(() => {
        const queryParams = rison.encode({
          type: subjectAdvancedDataType,
          values,
        });
        const endpoint = `/api/v1/advanced_data_type/convert?q=${queryParams}`;
        ZobiClient.get({ endpoint })
          .then(({ json }) => {
            setAdvancedDataTypesState({
              parsedAdvancedDataType: json.result.display_value,
              advancedDataTypeOperatorList: json.result.valid_filter_operators,
              errorMessage: json.result.error_message,
            });
            // Changed due to removal of status field
            validHandler(!json.result.error_message);
          })
          .catch(() => {
            setAdvancedDataTypesState({
              parsedAdvancedDataType: '',
              advancedDataTypeOperatorList:
                advancedDataTypesState.advancedDataTypeOperatorList,
              errorMessage: t('Failed to retrieve advanced type'),
            });
            validHandler(false);
          });
      }, 600)();
    },
    [validHandler],
  );

  const fetchSubjectAdvancedDataType = useCallback(
    (
      options: Props['options'],
      subject: Props['adhocFilter']['subject'],
      validHandler: Props['validHandler'],
    ) => {
      const option = options.find(
        opt =>
          ('column_name' in opt && opt.column_name === subject) ||
          ('optionName' in opt && opt.optionName === subject),
      );
      if (option && 'advanced_data_type' in option) {
        setSubjectAdvancedDataType(option.advanced_data_type);
      } else {
        validHandler(true);
      }
    },
    [],
  );

  return {
    advancedDataTypesState,
    subjectAdvancedDataType,
    setAdvancedDataTypesState,
    fetchAdvancedDataTypeValueCallback,
    fetchSubjectAdvancedDataType,
  };
};

export default useAdvancedDataTypes;
