

import '@testing-library/jest-dom';
import { ComponentType } from 'react';
import { render as renderTestComponent, screen } from '@testing-library/react';
import createLoadableRenderer, {
  LoadableRenderer as LoadableRendererType,
} from '../../../src/chart/components/createLoadableRenderer';

describe('createLoadableRenderer', () => {
  function TestComponent() {
    return <div className="test-component">test</div>;
  }
  let loadChartSuccess = jest.fn(() => Promise.resolve(TestComponent));
  let render: (loaded: { Chart: ComponentType }) => JSX.Element;
  let loading: () => JSX.Element;
  let LoadableRenderer: LoadableRendererType<{}>;

  beforeEach(() => {
    loadChartSuccess = jest.fn(() => Promise.resolve(TestComponent));
    render = jest.fn(loaded => {
      const { Chart } = loaded;

      return <Chart />;
    });
    loading = jest.fn(() => <div>Loading</div>);

    LoadableRenderer = createLoadableRenderer({
      loader: {
        Chart: loadChartSuccess,
      },
      loading,
      render,
    });
  });

  describe('returns a LoadableRenderer class', () => {
    test('LoadableRenderer.preload() preloads the lazy-load components', () => {
      expect(LoadableRenderer.preload).toBeInstanceOf(Function);
      LoadableRenderer.preload();
      expect(loadChartSuccess).toHaveBeenCalledTimes(1);
    });

    test('calls onRenderSuccess when succeeds', async () => {
      const onRenderSuccess = jest.fn();
      const onRenderFailure = jest.fn();
      renderTestComponent(
        <LoadableRenderer
          onRenderSuccess={onRenderSuccess}
          onRenderFailure={onRenderFailure}
        />,
      );
      expect(loadChartSuccess).toHaveBeenCalled();
      jest.useRealTimers();
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(render).toHaveBeenCalledTimes(1);
      expect(onRenderSuccess).toHaveBeenCalledTimes(1);
      expect(onRenderFailure).not.toHaveBeenCalled();
    });

    test('calls onRenderFailure when fails', () =>
      new Promise(done => {
        const loadChartFailure = jest.fn(() =>
          Promise.reject(new Error('Invalid chart')),
        );
        const FailedRenderer = createLoadableRenderer({
          loader: {
            Chart: loadChartFailure,
          },
          loading,
          render,
        });
        const onRenderSuccess = jest.fn();
        const onRenderFailure = jest.fn();
        renderTestComponent(
          <FailedRenderer
            onRenderSuccess={onRenderSuccess}
            onRenderFailure={onRenderFailure}
          />,
        );
        expect(loadChartFailure).toHaveBeenCalledTimes(1);
        setTimeout(() => {
          expect(render).not.toHaveBeenCalled();
          expect(onRenderSuccess).not.toHaveBeenCalled();
          expect(onRenderFailure).toHaveBeenCalledTimes(1);
          done(undefined);
        }, 10);
      }));

    test('onRenderFailure is optional', () =>
      new Promise(done => {
        const loadChartFailure = jest.fn(() =>
          Promise.reject(new Error('Invalid chart')),
        );
        const FailedRenderer = createLoadableRenderer({
          loader: {
            Chart: loadChartFailure,
          },
          loading,
          render,
        });
        renderTestComponent(<FailedRenderer />);
        expect(loadChartFailure).toHaveBeenCalledTimes(1);
        setTimeout(() => {
          expect(render).not.toHaveBeenCalled();
          done(undefined);
        }, 10);
      }));

    test('renders the lazy-load components', () =>
      new Promise(done => {
        renderTestComponent(<LoadableRenderer />);
        // lazy-loaded component not rendered immediately
        expect(screen.queryByText('test')).not.toBeInTheDocument();
        setTimeout(() => {
          // but rendered after the component is loaded.
          expect(screen.queryByText('test')).toBeInTheDocument();
          done(undefined);
        }, 10);
      }));

    test('does not throw if loaders are empty', () => {
      const NeverLoadingRenderer = createLoadableRenderer({
        loader: {},
        loading,
        render: () => <div />,
      });

      expect(() => renderTestComponent(<NeverLoadingRenderer />)).not.toThrow();
    });
  });
});
