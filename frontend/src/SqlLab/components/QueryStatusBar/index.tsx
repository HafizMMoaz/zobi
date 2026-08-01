import { FC, useMemo, createContext, useContext, useRef } from 'react';
import { styled } from '@zobi/core/theme';
import { t } from '@zobi/core/translation';
import {
  Flex,
  Steps,
  type StepsProps,
  StyledSpin,
  Timer,
} from '@zobi-ui/core/components';
import { QueryResponse, QueryState, usePrevious } from '@zobi-ui/core';
import QueryStateLabel from '../QueryStateLabel';

type QueryStatusBarProps = {
  query: QueryResponse;
};

const STATE_TO_STEP: Record<string, number> = {
  offline: 4,
  failed: 4,
  pending: 0,
  fetching: 3,
  running: 2,
  stopped: 4,
  success: 4,
};

const ERROR_STATE = [QueryState.Failed, QueryState.Stopped];

const StyledSteps = styled.div`
  & .ant-steps {
    margin: ${({ theme }) => theme.sizeUnit * 2}px 0;
  }
`;

const ActiveDot = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colorPrimary};
    top: -1px;
    opacity: 0;
    animation: pulse 2s ease-out infinite;
  }

  &::after {
    animation-delay: 1s;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.5);
      opacity: 0.8;
    }
    100% {
      transform: scale(3);
      opacity: 0;
    }
  }
`;

const progressContext = createContext<[number, string]>([0, '']);

const ProgressStatus = () => {
  const [percent, progressText] = useContext(progressContext);

  return (
    <>
      {percent > 0 ? (
        <span>
          ({percent}%{progressText && `, ${progressText}`})
        </span>
      ) : (
        <>{progressText && <span>({progressText})</span>}</>
      )}
    </>
  );
};

const ProgressSpin = () => {
  const [percent] = useContext(progressContext);
  return (
    <>
      {typeof percent === 'number' && percent > 0 && (
        <StyledSpin size="small" percent={percent} />
      )}
    </>
  );
};

const customDot: StepsProps['progressDot'] = (dot, { status }) =>
  status === 'process' ? (
    <ActiveDot>
      <ProgressSpin />
    </ActiveDot>
  ) : (
    <>{dot}</>
  );

const QueryStatusBar: FC<QueryStatusBarProps> = ({ query }) => {
  const steps = [
    {
      title: t('Validate query'),
    },
    {
      title: t('Connect to engine'),
    },
    {
      title: (
        <Flex align="center" gap="small">
          {t('Running')}
          <ProgressStatus />
        </Flex>
      ),
    },
    {
      title: t('Download to client'),
    },
    {
      title: t('Finish'),
    },
  ];

  const hasError = useMemo(
    () => ERROR_STATE.includes(query.state),
    [query.state],
  );
  const prevStepRef = useRef<number>(0);
  const progress = query.progress > 0 ? query.progress : undefined;
  const { progress_text: progressText } = query.extra ?? {};
  const state =
    query.state === QueryState.Success &&
    prevStepRef.current === STATE_TO_STEP[QueryState.Running] &&
    !query.results
      ? QueryState.Fetching
      : query.state;

  const currentIndex = STATE_TO_STEP[state] || 0;
  const prevStep = usePrevious(currentIndex);
  prevStepRef.current = prevStep ?? prevStepRef.current;

  if (query.state === QueryState.Success && query.results) {
    return null;
  }

  if (
    query.state === QueryState.Failed &&
    prevStep === STATE_TO_STEP[QueryState.Failed]
  ) {
    return null;
  }

  return (
    <StyledSteps>
      <Flex justify="space-between">
        <Flex gap="small" align="center">
          <span>{t('Query State')}:</span>
          <QueryStateLabel query={query} />
        </Flex>
        <Flex gap="small" align="center">
          <span>{t('Elapsed')}:</span>
          <Timer
            startTime={query.startDttm}
            endTime={query.endDttm}
            status="default"
            isRunning={currentIndex < steps.length - 2}
          />
        </Flex>
      </Flex>
      <progressContext.Provider value={[progress ?? 0, progressText ?? '']}>
        <Steps
          size="small"
          current={hasError ? prevStep : currentIndex}
          items={steps}
          status={
            hasError
              ? 'error'
              : currentIndex < steps.length - 1
                ? 'process'
                : 'finish'
          }
          {...(!hasError && { progressDot: customDot })}
        />
      </progressContext.Provider>
    </StyledSteps>
  );
};
export default QueryStatusBar;
