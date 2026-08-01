import { useState, useEffect, useMemo, useCallback } from 'react';
import { HandlerFunction, JsonValue } from '@zobi.dev/core';
import { styled } from '@zobi.dev/extension-api/theme';
import { sharedControlComponents } from '@zobi.dev/chart-controls';
import { AreaChartStackControlOptions } from '../constants';

const { RadioButtonControl } = sharedControlComponents;

const ExtraControlsWrapper = styled.div`
  text-align: center;
`;

export function useExtraControl<
  F extends {
    stack: any;
    area: boolean;
  },
>({
  formData,
  setControlValue,
}: {
  formData: F;
  setControlValue?: HandlerFunction;
}) {
  const { stack, area } = formData;
  const [extraValue, setExtraValue] = useState<JsonValue | undefined>(
    stack ?? undefined,
  );

  useEffect(() => {
    setExtraValue(stack);
  }, [stack]);

  const extraControlsOptions = useMemo(() => {
    if (area) {
      return AreaChartStackControlOptions;
    }
    return [];
  }, [area]);

  const extraControlsHandler = useCallback(
    (value: JsonValue) => {
      if (area) {
        if (setControlValue) {
          setControlValue('stack', value);
          setExtraValue(value);
        }
      }
    },
    [area, setControlValue],
  );

  return {
    extraControlsOptions,
    extraControlsHandler,
    extraValue,
  };
}

export function ExtraControls<
  F extends {
    stack: any;
    area: boolean;
    showExtraControls: boolean;
  },
>({
  formData,
  setControlValue,
}: {
  formData: F;
  setControlValue?: HandlerFunction;
}) {
  const { extraControlsOptions, extraControlsHandler, extraValue } =
    useExtraControl<F>({
      formData,
      setControlValue,
    });

  if (!formData.showExtraControls) {
    return null;
  }

  return (
    <ExtraControlsWrapper>
      <RadioButtonControl
        options={extraControlsOptions}
        onChange={extraControlsHandler}
        value={extraValue}
      />
    </ExtraControlsWrapper>
  );
}
