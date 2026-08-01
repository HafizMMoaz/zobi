

import { Component, ReactNode } from 'react';
import { t } from '@zobi/core/translation';
import {
  ZobiClient,
  Method,
  makeApi,
  ZobiApiError,
} from '@zobi-ui/core';
import { Button } from '@zobi-ui/core/components';
import ErrorMessage from './ErrorMessage';

export type Props = {
  children: ({ payload }: { payload?: object }) => ReactNode;
  endpoint?: string;
  host: string;
  method?: Method;
  postPayload?: string;
};

type State = {
  didVerify: boolean;
  error?: Error | ZobiApiError;
  payload?: object;
};

export const renderError = (error: Error) => (
  <div>
    The following error occurred, make sure you have <br />
    1) configured CORS in Zobi to receive requests from this domain. <br />
    2) set the Zobi host correctly below. <br />
    3) debug the CORS configuration under the `@zobi-ui/connection` stories.
    <br />
    <br />
    <ErrorMessage error={error} />
  </div>
);

export default class VerifyCORS extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { didVerify: false };
    this.handleVerify = this.handleVerify.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    const { endpoint, host, postPayload, method } = this.props;
    if (
      (this.state.didVerify || this.state.error) &&
      (prevProps.endpoint !== endpoint ||
        prevProps.host !== host ||
        prevProps.postPayload !== postPayload ||
        prevProps.method !== method)
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ didVerify: false, error: undefined });
    }
  }

  handleVerify() {
    const { endpoint, host, postPayload, method } = this.props;
    ZobiClient.reset();
    ZobiClient.configure({
      credentials: 'include',
      host,
      mode: 'cors',
    })
      .init()
      .then(() => {
        // Test an endpoint if specified
        if (endpoint && postPayload) {
          return makeApi({
            endpoint,
            method,
          })(postPayload);
        }
        return { error: 'Must provide valid endpoint and payload.' };
      })
      .then(result =>
        this.setState({ didVerify: true, error: undefined, payload: result }),
      )
      .catch(error => this.setState({ error }));
  }

  render() {
    const { didVerify, error, payload } = this.state;
    const { children } = this.props;

    return didVerify ? (
      children({ payload })
    ) : (
      <div className="row">
        <div className="col-md-10">
          This example requires CORS requests from this domain. <br />
          <br />
          1) enable CORS requests in your Zobi App from{' '}
          {`${window.location.origin}`}
          <br />
          2) configure your Zobi App host name below <br />
          3) click below to verify authentication. You may debug CORS further
          using the `@zobi-ui/connection` story. <br />
          <br />
          <Button type="primary" size="small" onClick={this.handleVerify}>
            {t('Verify')}
          </Button>
          <br />
          <br />
        </div>

        {error && (
          <div className="col-md-8">
            <ErrorMessage error={error} />
          </div>
        )}
      </div>
    );
  }
}
