import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@zobi/core-legacy/theme';
import { now, fDuration } from '../../utils/dates';
import { Label, Icons, type LabelType } from '..';

export interface TimerProps {
  endTime?: number;
  isRunning: boolean;
  startTime?: number;
  status?: LabelType;
}

export function Timer({
  endTime,
  isRunning,
  startTime,
  status = 'success',
}: TimerProps) {
  const theme = useTheme();
  const [clockStr, setClockStr] = useState(
    startTime && endTime ? fDuration(startTime, endTime) : '00:00:00.00',
  );
  const timer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const stopTimer = () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = undefined;
      }
    };

    if (isRunning) {
      timer.current = setInterval(() => {
        if (startTime) {
          const endDttm = endTime || now();
          if (startTime < endDttm) {
            setClockStr(fDuration(startTime, endDttm));
          }
          if (!isRunning) {
            stopTimer();
          }
        }
      }, 30);
    }
    return stopTimer;
  }, [endTime, isRunning, startTime]);

  return (
    <Label
      icon={<Icons.ClockCircleOutlined iconSize="m" />}
      type={status}
      role="timer"
      style={{ fontFamily: theme.fontFamilyCode }}
    >
      {clockStr}
    </Label>
  );
}
