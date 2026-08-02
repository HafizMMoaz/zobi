import {
  forwardRef,
  FocusEvent,
  RefObject,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  ClipboardEvent,
  Ref,
  ReactElement,
} from 'react';

import { t } from '@zobi.dev/extension-api/translation';
import { ensureIsArray, formatNumber, usePrevious } from '@zobi.dev/core';
import { Constants } from '@zobi.dev/core/components';
import {
  DefaultOptionType,
  LabeledValue as AntdLabeledValue,
  RefSelectProps,
} from 'antd/es/select';
import { debounce, isEqual, uniq } from 'lodash';
import {
  dropDownRenderHelper,
  getOption,
  getSuffixIcon,
  getValue,
  handleFilterOptionHelper,
  hasOption,
  isLabeledValue,
  isObject,
  mapOptions,
  mapValues,
  sortComparatorWithSearchHelper,
  sortSelectedFirstHelper,
  isEqual as utilsIsEqual,
} from './utils';
import { RawValue, SelectOptionsType, SelectProps } from './types';
import {
  StyledBulkActionsContainer,
  StyledCheckOutlined,
  StyledContainer,
  StyledHeader,
  StyledSelect,
  StyledStopOutlined,
} from './styles';
import {
  DEFAULT_SORT_COMPARATOR,
  DROPDOWN_ALIGN_BOTTOM,
  EMPTY_OPTIONS,
  MAX_TAG_COUNT,
  TOKEN_SEPARATORS,
  VIRTUAL_THRESHOLD,
} from './constants';
import { Space } from '../Space';
import { Button } from '../Button';

/**
 * This component is a customized version of the Antdesign 4.X Select component
 * https://ant.design/components/select/.
 * This Select component provides an API that is tested against all the different use cases of Zobi.
 * It limits and overrides the existing Antdesign API in order to keep their usage to the minimum
 * and to enforce simplification and standardization.
 * It is divided into two macro categories, Static and Async.
 * The Static type accepts a static array of options.
 * The Async type accepts a promise that will return the options.
 * Each of the categories come with different abilities. For a comprehensive guide please refer to
 * the storybook in @zobi.dev/core/components/Select/Select.stories.tsx.
 */
const Select = forwardRef(
  (
    {
      className,
      allowClear,
      allowNewOptions = false,
      allowSelectAll = true,
      ariaLabel,
      autoClearSearchValue = false,
      filterOption = true,
      header = null,
      headerPosition = 'top',
      helperText,
      invertSelection = false,
      labelInValue = false,
      loading,
      mode = 'single',
      name,
      notFoundContent,
      onBlur,
      onChange,
      onClear,
      onOpenChange,
      onDeselect,
      onSearch,
      onSelect,
      optionFilterProps = ['label', 'value'],
      options,
      placeholder = t('Select ...'),
      showSearch = true,
      sortComparator = DEFAULT_SORT_COMPARATOR,
      tokenSeparators = TOKEN_SEPARATORS,
      value,
      getPopupContainer,
      oneLine,
      maxTagCount: propsMaxTagCount,
      virtual = undefined,
      ...props
    }: SelectProps,
    ref: Ref<RefSelectProps>,
  ) => {
    const isSingleMode = mode === 'single';
    const shouldShowSearch = allowNewOptions ? true : showSearch;
    const [selectValue, setSelectValue] = useState(value);
    const [inputValue, setInputValue] = useState('');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [visibleOptions, setVisibleOptions] = useState<SelectOptionsType>([]);
    const [onChangeCount, setOnChangeCount] = useState(0);
    const previousChangeCount = usePrevious(onChangeCount, 0);
    const fireOnChange = useCallback(
      () => setOnChangeCount(onChangeCount + 1),
      [onChangeCount],
    );

    const maxTagCount = oneLine
      ? isDropdownVisible
        ? 0
        : 1
      : (propsMaxTagCount ?? MAX_TAG_COUNT);

    // Prevent maxTagCount change during click events to avoid click target disappearing
    const [stableMaxTagCount, setStableMaxTagCount] = useState(maxTagCount);
    const isOpeningRef = useRef(false);
    const selectContainerRef = useRef<HTMLDivElement>(null);
    const [dropdownWidth, setDropdownWidth] = useState<number | true>(true);

    useEffect(() => {
      if (oneLine) {
        if (isDropdownVisible && !isOpeningRef.current) {
          // Mark that we're in the opening process
          isOpeningRef.current = true;
          // Use requestAnimationFrame to ensure DOM has settled after the click
          requestAnimationFrame(() => {
            setStableMaxTagCount(0);
            isOpeningRef.current = false;

            // Measure collapsed width and update dropdown width
            const selectElement =
              selectContainerRef.current?.querySelector('.ant-select');
            if (selectElement) {
              const { width } = selectElement.getBoundingClientRect();
              if (width > 0) {
                setDropdownWidth(width);
              }
            }
          });
          return;
        }
        if (!isDropdownVisible) {
          // When closing, immediately show the first tag
          setStableMaxTagCount(1);
          setDropdownWidth(true); // Reset to default when closing
          isOpeningRef.current = false;
        }
        return;
      }
      setStableMaxTagCount(maxTagCount);
    }, [maxTagCount, isDropdownVisible, oneLine]);

    const mappedMode = isSingleMode ? undefined : 'multiple';

    // antd hands `filterSort`/`filterOption` a `DefaultOptionType`, whose
    // `value` and `label` are optional, so these cannot take `AntdLabeledValue`.
    const sortSelectedFirst = useCallback(
      (a: DefaultOptionType, b: DefaultOptionType) =>
        sortSelectedFirstHelper(a, b, selectValue),
      [selectValue],
    );

    const sortComparatorWithSearch = useCallback(
      (a: DefaultOptionType, b: DefaultOptionType) =>
        sortComparatorWithSearchHelper(
          a,
          b,
          inputValue,
          sortSelectedFirst,
          sortComparator,
        ),
      [inputValue, sortComparator, isDropdownVisible],
    );

    const initialOptions = useMemo(
      () => (Array.isArray(options) ? options.slice() : EMPTY_OPTIONS),
      [options],
    );

    const initialOptionsSorted = useMemo(
      () => initialOptions.slice().sort(sortSelectedFirst),
      [initialOptions, sortSelectedFirst],
    );

    const [selectOptions, setSelectOptions] =
      useState<SelectOptionsType>(initialOptionsSorted);

    // add selected values to options list if they are not in it
    const fullSelectOptions = useMemo(() => {
      // check to see if selectOptions are grouped
      let groupedOptions: SelectOptionsType;
      if (selectOptions.some(opt => opt.options)) {
        groupedOptions = selectOptions.reduce(
          (acc, group) => [...acc, ...(group.options as SelectOptionsType)],
          [] as SelectOptionsType,
        );
      }
      const missingValues: SelectOptionsType = ensureIsArray(selectValue)
        .filter(
          opt => !hasOption(getValue(opt), groupedOptions || selectOptions),
        )
        .map(opt =>
          isLabeledValue(opt) ? opt : { value: opt, label: String(opt) },
        );
      const result =
        missingValues.length > 0
          ? missingValues.concat(selectOptions)
          : selectOptions;
      return result.slice().sort(sortSelectedFirst);
    }, [selectOptions, selectValue, sortSelectedFirst]);

    const enabledOptions = useMemo(
      () => visibleOptions.filter(option => !option.disabled),
      [visibleOptions],
    );

    const selectAllEligible = useMemo(
      () =>
        visibleOptions.filter(
          option =>
            (hasOption(option.value, selectValue) || !option.disabled) &&
            !option.isNewOption,
        ),
      [visibleOptions, selectValue],
    );

    const selectAllEnabled = useMemo(
      () =>
        !isSingleMode &&
        allowSelectAll &&
        selectOptions.length > 0 &&
        enabledOptions.length > 1,
      [
        isSingleMode,
        allowSelectAll,
        selectOptions.length,
        enabledOptions.length,
      ],
    );

    const selectAllMode = useMemo(
      () => ensureIsArray(selectValue).length === selectAllEligible.length + 1,
      [selectValue, selectAllEligible],
    );

    const bulkSelectCounts = useMemo(() => {
      const selectedValuesSet = new Set(
        ensureIsArray(selectValue).map(getValue),
      );
      return visibleOptions.reduce(
        (acc, option) => {
          const isSelected = selectedValuesSet.has(option.value);
          const isDisabled = option.disabled;
          const isNew = option.isNewOption;

          if (
            (!isDisabled || isSelected) &&
            ((isNew && isSelected) || !isNew)
          ) {
            acc.selectable += 1;
          }
          if (isSelected && !isDisabled) {
            acc.deselectable += 1;
          }
          return acc;
        },
        { selectable: 0, deselectable: 0 },
      );
    }, [visibleOptions, selectValue]);

    // `StyledSelect` erases antd's value generic to `unknown`, so these handlers
    // accept the widened type and narrow to the values this component works
    // with. Declaring the narrow type directly would not be assignable.
    const handleOnSelect = (
      selectedItemValue: unknown,
      option: DefaultOptionType,
    ) => {
      const selectedItem = selectedItemValue as RawValue | AntdLabeledValue;
      if (isSingleMode) {
        // on select is fired in single value mode if the same value is selected
        const valueChanged = !utilsIsEqual(
          selectedItem,
          selectValue as RawValue | AntdLabeledValue,
          'value',
        );
        setSelectValue(selectedItem);
        if (valueChanged) {
          fireOnChange();
        }
      } else {
        setSelectValue(previousState => {
          const array = ensureIsArray(previousState);
          const value = getValue(selectedItem);
          if (!hasOption(value, array)) {
            const result = [...array, selectedItem];
            if (
              result.length === selectAllEligible.length &&
              selectAllEnabled
            ) {
              return isLabeledValue(selectedItem)
                ? ([...result] as AntdLabeledValue[])
                : ([...result] as (string | number)[]);
            }
            return result as AntdLabeledValue[];
          }
          return previousState;
        });
        fireOnChange();
      }
      onSelect?.(selectedItem, option);
    };

    const clear = () => {
      if (isSingleMode) {
        setSelectValue(undefined);
      } else {
        setSelectValue(
          fullSelectOptions
            .filter(
              option => option.disabled && hasOption(option.value, selectValue),
            )
            .map(option =>
              labelInValue
                ? {
                    label: option.label,
                    value: option.value,
                  }
                : option.value,
            )
            .filter(
              (val): val is RawValue => val !== null && val !== undefined,
            ),
        );
      }
      fireOnChange();
    };

    const handleOnDeselect = (
      deselectedValue: unknown,
      option: DefaultOptionType,
    ) => {
      const value = deselectedValue as RawValue | AntdLabeledValue;
      if (Array.isArray(selectValue)) {
        const array = (selectValue as AntdLabeledValue[]).filter(
          element => getValue(element) !== getValue(value),
        );
        setSelectValue(array);

        // removes new option
        if (option.isNewOption) {
          const updatedOptions = fullSelectOptions.filter(
            option => getValue(option.value) !== getValue(value),
          );
          setSelectOptions(updatedOptions);
          setVisibleOptions(updatedOptions);
        }
      }
      fireOnChange();
      onDeselect?.(value, option);
    };

    // `option` is optional in antd's `FilterFunc`; it is always supplied in
    // practice, but the signature has to admit undefined.
    const handleFilterOption = (search: string, option?: DefaultOptionType) =>
      handleFilterOptionHelper(
        search,
        option ?? {},
        optionFilterProps,
        filterOption,
      );

    const handleOnSearch = debounce((search: string) => {
      const searchValue = search.trim();
      setIsSearching(!!searchValue);

      let updatedOptions = selectOptions;

      if (allowNewOptions) {
        const optionsWithoutTemporary = ensureIsArray(fullSelectOptions).filter(
          opt => !opt.isNewOption,
        );
        const shouldCreateNewOption =
          searchValue && !hasOption(searchValue, optionsWithoutTemporary, true);

        const newOption = shouldCreateNewOption && {
          label: searchValue,
          value: searchValue,
          isNewOption: true,
        };
        const cleanSelectOptions = ensureIsArray(fullSelectOptions).filter(
          opt => !opt.isNewOption || hasOption(opt.value, selectValue),
        );
        updatedOptions = newOption
          ? [newOption, ...cleanSelectOptions]
          : cleanSelectOptions;
        setSelectOptions(updatedOptions);
      }

      const filteredOptions = updatedOptions
        .map((option: any) => {
          /*
          If it's a group, filter its nested options and only return it
          if it has matching options
          */
          if ('options' in option && Array.isArray(option.options)) {
            const filteredGroupOptions = option.options.filter(
              (subOption: AntdLabeledValue) =>
                handleFilterOption(search, subOption),
            );
            return filteredGroupOptions.length > 0
              ? { ...option, options: filteredGroupOptions }
              : null;
          }

          return handleFilterOption(search, option as AntdLabeledValue)
            ? option
            : null;
        })
        .filter((option): option is AntdLabeledValue => option !== null);

      setVisibleOptions(filteredOptions);
      setInputValue(searchValue);
      onSearch?.(searchValue);
    }, Constants.FAST_DEBOUNCE);

    useEffect(() => () => handleOnSearch.cancel(), [handleOnSearch]);

    const handleOnDropdownVisibleChange = (isDropdownVisible: boolean) => {
      setIsDropdownVisible(isDropdownVisible);

      setVisibleOptions(fullSelectOptions);
      // if no search input value, force sort options because it won't be sorted by
      // `filterSort`.
      if (isDropdownVisible && !inputValue && selectOptions.length > 1) {
        if (!isEqual(initialOptionsSorted, selectOptions)) {
          setSelectOptions(initialOptionsSorted);
        }
      }
      if (!isDropdownVisible) {
        setSelectOptions(initialOptionsSorted);
      }
      if (onOpenChange) {
        onOpenChange(isDropdownVisible);
      }
    };

    const handleSelectAll = useCallback(() => {
      if (isSingleMode) return;

      const optionsToSelect = isSearching
        ? visibleOptions.filter(option => !option.isNewOption)
        : enabledOptions;

      const currentValues = ensureIsArray(selectValue);
      const currentValuesSet = new Set(currentValues.map(getValue));

      const newValues = [...currentValues] as RawValue[];
      optionsToSelect.forEach(option => {
        if (
          option.value &&
          !option.disabled &&
          !currentValuesSet.has(option.value)
        ) {
          newValues.push(option.value);
        }
      });

      setSelectValue(newValues);
      fireOnChange();
    }, [
      isSingleMode,
      isSearching,
      visibleOptions,
      enabledOptions,
      selectValue,
      fireOnChange,
    ]);

    const handleDeselectAll = useCallback(() => {
      if (isSingleMode) return;

      const deselectionValues = new Set(enabledOptions.map(opt => opt.value));

      const newValues = ensureIsArray(selectValue).filter(item => {
        const itemValue = getValue(item);
        return !deselectionValues.has(itemValue);
      }) as AntdLabeledValue[];

      setSelectValue(newValues);
      fireOnChange();
    }, [isSingleMode, enabledOptions, selectValue, fireOnChange]);

    const bulkSelectComponent = useMemo(
      () => (
        <StyledBulkActionsContainer justify="center" gap="small" wrap>
          <Button
            type="link"
            buttonStyle="link"
            buttonSize="xsmall"
            disabled={bulkSelectCounts.selectable === 0}
            onMouseDown={e => {
              e.preventDefault();
              e.stopPropagation();
              handleSelectAll();
            }}
          >
            {t('Select all')} {`(${formatNumber('SMART_NUMBER', bulkSelectCounts.selectable)})`}
          </Button>
          <Button
            type="link"
            buttonStyle="link"
            buttonSize="xsmall"
            disabled={bulkSelectCounts.deselectable === 0}
            onMouseDown={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleDeselectAll();
            }}
          >
            {t('Clear')} {`(${formatNumber('SMART_NUMBER', bulkSelectCounts.deselectable)})`}
          </Button>
        </StyledBulkActionsContainer>
      ),
      [
        handleSelectAll,
        handleDeselectAll,
        bulkSelectCounts.selectable,
        bulkSelectCounts.deselectable,
      ],
    );

    const isLoading = loading ?? false;

    const popupRender = (
      originNode: ReactElement & { ref?: RefObject<HTMLElement> },
    ) =>
      dropDownRenderHelper(
        originNode,
        isDropdownVisible,
        isLoading,
        fullSelectOptions.length,
        helperText,
        undefined,
        selectAllEnabled ? bulkSelectComponent : undefined,
      );

    const handleClear = () => {
      clear();
      if (onClear) {
        onClear();
      }
    };

    useEffect(() => {
      // when `options` list is updated from component prop, reset states
      setSelectOptions(initialOptions);
      setVisibleOptions(initialOptions);
    }, [initialOptions]);

    useEffect(() => {
      setSelectValue(value);
    }, [value]);

    const handleOnBlur = (event: FocusEvent<HTMLElement>) => {
      setInputValue('');
      onBlur?.(event);
    };

    const handleOnChange = useCallback(
      (values: any, options: any) => {
        // intercept onChange call to handle the select all case
        // if the "select all" option is selected, we want to send all options to the onChange,
        // otherwise we want to remove
        let newValues = values;
        let newOptions = options;
        if (!isSingleMode) {
          if (
            ensureIsArray(values).length === selectAllEligible.length &&
            selectAllMode
          ) {
            const array = selectAllEligible.filter(
              option => hasOption(option.value, selectValue) && option.disabled,
            );
            newValues = mapValues(array, labelInValue);
            newOptions = mapOptions(array);
          }
        }
        onChange?.(newValues, newOptions);
      },
      [
        isSingleMode,
        labelInValue,
        onChange,
        selectAllEligible,
        selectAllMode,
        selectValue,
      ],
    );

    useEffect(() => {
      if (onChangeCount !== previousChangeCount) {
        const array = ensureIsArray(selectValue);
        const set = new Set(array.map(getValue));
        const options = mapOptions(
          fullSelectOptions.filter(opt => set.has(opt.value)),
        );
        if (isSingleMode) {
          handleOnChange(selectValue, selectValue ? options[0] : undefined);
        } else {
          handleOnChange(array, options);
        }
      }
    }, [
      fullSelectOptions,
      handleOnChange,
      isSingleMode,
      onChange,
      onChangeCount,
      previousChangeCount,
      selectValue,
    ]);

    const omittedCount = useMemo(() => {
      const num_selected = ensureIsArray(selectValue).length;
      const num_shown = stableMaxTagCount as number;
      return num_selected - num_shown - (selectAllMode ? 1 : 0);
    }, [stableMaxTagCount, selectAllMode, selectValue]);

    const customMaxTagPlaceholder = () =>
      `+ ${omittedCount > 0 ? omittedCount : 1} ...`;

    // We can't remove the + tag so when Select All
    // is the only item omitted, we subtract one from maxTagCount
    let actualMaxTagCount = stableMaxTagCount;
    if (
      actualMaxTagCount !== 'responsive' &&
      omittedCount === 0 &&
      selectAllMode
    ) {
      actualMaxTagCount -= 1;
    }

    const getPastedTextValue = useCallback(
      (text: string) => {
        const option = getOption(text, fullSelectOptions, true);
        if (!option && !allowNewOptions) {
          return undefined;
        }
        if (labelInValue) {
          const value: AntdLabeledValue = {
            label: text,
            value: text,
          };
          if (option) {
            value.label = isObject(option) ? option.label : option;
            value.value = isObject(option) ? option.value! : option;
          }
          return value;
        }
        return option ? (isObject(option) ? option.value! : option) : text;
      },
      [allowNewOptions, fullSelectOptions, labelInValue],
    );

    const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
      const pastedText = e.clipboardData.getData('text');
      if (isSingleMode) {
        const value = getPastedTextValue(pastedText);
        if (value) {
          setSelectValue(value);
        }
      } else {
        const token = tokenSeparators.find(token => pastedText.includes(token));
        const array = token ? uniq(pastedText.split(token)) : [pastedText];

        const newOptions: SelectOptionsType = [];

        const values = array
          .map(item => {
            const option = getOption(item, fullSelectOptions, true);
            if (!option && allowNewOptions) {
              const newOption = {
                label: item,
                value: item,
                isNewOption: true,
              };
              newOptions.push(newOption);
            }
            return getPastedTextValue(item);
          })
          .filter(item => item !== undefined);

        if (newOptions.length > 0) {
          const updatedOptions = [...fullSelectOptions, ...newOptions];
          setSelectOptions(updatedOptions);
          setVisibleOptions(updatedOptions);
        }
        if (labelInValue) {
          setSelectValue(previous => [
            ...((previous || []) as AntdLabeledValue[]),
            ...(values as AntdLabeledValue[]),
          ]);
        } else {
          setSelectValue(previous => [
            ...((previous || []) as string[]),
            ...(values as string[]),
          ]);
        }
      }
      fireOnChange();
    };

    return (
      <StyledContainer
        ref={selectContainerRef}
        className={className}
        headerPosition={headerPosition}
      >
        {header && (
          <StyledHeader headerPosition={headerPosition}>{header}</StyledHeader>
        )}
        <StyledSelect
          id={name}
          allowClear={!isLoading && allowClear}
          aria-label={
            isSingleMode &&
            isLabeledValue(selectValue) &&
            typeof selectValue.label === 'string'
              ? `${ariaLabel || name}: ${selectValue.label}`
              : ariaLabel || name
          }
          data-test={ariaLabel || name}
          autoClearSearchValue={autoClearSearchValue}
          popupRender={popupRender}
          filterOption={handleFilterOption}
          filterSort={sortComparatorWithSearch}
          getPopupContainer={
            getPopupContainer || (triggerNode => triggerNode.parentNode)
          }
          headerPosition={headerPosition}
          labelInValue={labelInValue}
          maxTagCount={actualMaxTagCount}
          maxTagPlaceholder={customMaxTagPlaceholder}
          mode={mappedMode}
          notFoundContent={isLoading ? t('Loading...') : notFoundContent}
          onBlur={handleOnBlur}
          onDeselect={handleOnDeselect}
          onOpenChange={handleOnDropdownVisibleChange}
          // `onPaste` is forwarded to the underlying input but is not part of
          // antd's Select props.
          // @ts-expect-error
          onPaste={onPaste}
          onPopupScroll={undefined}
          onSearch={shouldShowSearch ? handleOnSearch : undefined}
          onSelect={handleOnSelect}
          onClear={handleClear}
          placeholder={placeholder}
          tokenSeparators={tokenSeparators}
          value={selectValue}
          virtual={
            virtual !== undefined
              ? virtual
              : fullSelectOptions.length > VIRTUAL_THRESHOLD
          }
          suffixIcon={getSuffixIcon(
            isLoading,
            shouldShowSearch,
            isDropdownVisible,
          )}
          menuItemSelectedIcon={
            invertSelection ? (
              <StyledStopOutlined iconSize="m" aria-label="stop" />
            ) : (
              <StyledCheckOutlined iconSize="m" aria-label="check" />
            )
          }
          options={visibleOptions}
          optionRender={option => <Space>{option.label || option.value}</Space>}
          oneLine={oneLine}
          popupMatchSelectWidth={oneLine ? dropdownWidth : true}
          css={props.css}
          dropdownAlign={DROPDOWN_ALIGN_BOTTOM}
          {...props}
          showSearch={shouldShowSearch}
          ref={ref}
        />
      </StyledContainer>
    );
  },
);

export default Select;
