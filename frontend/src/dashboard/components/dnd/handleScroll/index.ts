let scrollTopDashboardInterval: any;
const SCROLL_STEP = 120;
const INTERVAL_DELAY = 50;

export default function handleScroll(scroll: string | null) {
  const setupScroll =
    scroll === 'SCROLL_TOP' &&
    !scrollTopDashboardInterval &&
    document.documentElement.scrollTop !== 0;

  const clearScroll =
    scrollTopDashboardInterval &&
    (scroll !== 'SCROLL_TOP' || document.documentElement.scrollTop === 0);

  if (setupScroll) {
    scrollTopDashboardInterval = setInterval(() => {
      if (document.documentElement.scrollTop === 0) {
        clearInterval(scrollTopDashboardInterval);
        scrollTopDashboardInterval = null;
        return;
      }

      let scrollTop = document.documentElement.scrollTop - SCROLL_STEP;
      if (scrollTop < 0) {
        scrollTop = 0;
      }
      window.scroll({
        top: scrollTop,
        behavior: 'smooth',
      });
    }, INTERVAL_DELAY);
  } else if (clearScroll) {
    clearInterval(scrollTopDashboardInterval);
    scrollTopDashboardInterval = null;
  }
}
