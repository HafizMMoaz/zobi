export const stopPeriodicRender = (refreshTimer?: number) => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
};

interface SetPeriodicRunnerProps {
  interval?: number;
  periodicRender: TimerHandler;
  refreshTimer?: number;
}

export default function setPeriodicRunner({
  interval = 0,
  periodicRender,
  refreshTimer,
}: SetPeriodicRunnerProps) {
  stopPeriodicRender(refreshTimer);

  if (interval > 0) {
    return setInterval(periodicRender, interval);
  }
  return 0;
}
