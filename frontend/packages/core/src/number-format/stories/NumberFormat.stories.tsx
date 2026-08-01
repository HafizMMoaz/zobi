

import { PureComponent } from 'react';
import { formatNumber } from '@zobi.dev/core';

interface NumberFormatValidatorState {
  formatString: string;
  testValues: (number | null | undefined)[];
}

class NumberFormatValidator extends PureComponent<
  Record<string, never>,
  NumberFormatValidatorState
> {
  state: NumberFormatValidatorState = {
    formatString: '.3~s',
    testValues: [
      987654321,
      12345.6789,
      3000,
      400.14,
      70.00002,
      1,
      0,
      -1,
      -70.00002,
      -400.14,
      -3000,
      -12345.6789,
      -987654321,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      NaN,
      null,
      undefined,
    ],
  };

  constructor(props: Record<string, never>) {
    super(props);

    this.handleFormatChange = this.handleFormatChange.bind(this);
  }

  handleFormatChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      formatString: event.target.value,
    });
  }

  render() {
    const { formatString, testValues } = this.state;

    return (
      <div className="container">
        <div className="row" style={{ margin: '40px 20px 0 20px' }}>
          <div className="col-sm">
            <p>
              This <code>@zobi.dev/number-format</code> package enriches{' '}
              <code>d3-format</code>
              to handle invalid formats as well as edge case values. Use the
              validator below to preview outputs from the specified format
              string. See
              <a
                href="https://github.com/d3/d3-format#locale_format"
                target="_blank"
                rel="noopener noreferrer"
              >
                D3 Format Reference
              </a>
              for how to write a D3 format string.
            </p>
          </div>
        </div>
        <div className="row" style={{ margin: '10px 0 30px 0' }}>
          <div className="col-sm" />
          <div className="col-sm-8">
            <div className="form">
              <div className="form-group">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label>
                  Enter D3 format string:
                  <input
                    id="formatString"
                    className="form-control form-control-lg"
                    type="text"
                    value={formatString}
                    onChange={this.handleFormatChange}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="col-sm" />
        </div>
        <div className="row">
          <div className="col-sm">
            <table className="table table-striped table-sm">
              <thead>
                <tr>
                  <th>Input (number)</th>
                  <th>Formatted output (string)</th>
                </tr>
              </thead>
              <tbody>
                {testValues.map((v, index) => (
                  <tr key={index}>
                    <td>
                      <code>{`${v}`}</code>
                    </td>
                    <td>
                      <code>&quot;{formatNumber(formatString, v)}&quot;</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default {
  title: 'Core Packages/@zobi.dev/core',
};

export const validator = () => <NumberFormatValidator />;
