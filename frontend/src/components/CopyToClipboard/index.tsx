import { Component, cloneElement, ReactElement } from 'react';
import { t } from '@zobi.dev/extension-api/translation';
import { css, ZobiTheme } from '@zobi.dev/extension-api/theme';
import copyTextToClipboard from 'src/utils/copy';
import { Tooltip } from '@zobi.dev/core/components';
import withToasts from '../MessageToasts/withToasts';
import type { CopyToClipboardProps } from './types';

const defaultProps: Partial<CopyToClipboardProps> = {
  copyNode: <span>{t('Copy')}</span>,
  onCopyEnd: () => {},
  shouldShowText: true,
  wrapped: true,
  tooltipText: t('Copy to clipboard'),
  hideTooltip: false,
};

class CopyToClip extends Component<CopyToClipboardProps> {
  static defaultProps = defaultProps;

  constructor(props: CopyToClipboardProps) {
    super(props);
    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    if (this.props.disabled) {
      return;
    }
    if (this.props.getText) {
      this.props.getText((d: string) => {
        this.copyToClipboard(Promise.resolve(d));
      });
    } else {
      this.copyToClipboard(Promise.resolve(this.props.text || ''));
    }
  }

  getDecoratedCopyNode() {
    const copyNode = this.props.copyNode as ReactElement;
    const { disabled } = this.props;
    return cloneElement(copyNode, {
      style: {
        ...copyNode.props.style,
        cursor: disabled ? 'not-allowed' : 'pointer',
      },
      onClick: disabled ? undefined : this.onClick,
      'aria-disabled': disabled || undefined,
      tabIndex: disabled ? -1 : copyNode.props.tabIndex,
    });
  }

  copyToClipboard(textToCopy: Promise<string>) {
    copyTextToClipboard(() => textToCopy)
      .then(() => {
        this.props.addSuccessToast(t('Copied to clipboard!'));
      })
      .catch(() => {
        this.props.addDangerToast(
          t(
            'Sorry, your browser does not support copying. Use Ctrl / Cmd + C!',
          ),
        );
      })
      .finally(() => {
        if (this.props.onCopyEnd) this.props.onCopyEnd();
      });
  }

  renderTooltip(cursor: string) {
    return (
      <>
        {!this.props.hideTooltip ? (
          <Tooltip
            id="copy-to-clipboard-tooltip"
            placement="topRight"
            style={{ cursor }}
            title={this.props.tooltipText || ''}
            trigger={['hover']}
            arrow={{ pointAtCenter: true }}
          >
            {this.getDecoratedCopyNode()}
          </Tooltip>
        ) : (
          this.getDecoratedCopyNode()
        )}
      </>
    );
  }

  renderNotWrapped() {
    return this.renderTooltip(this.props.disabled ? 'not-allowed' : 'pointer');
  }

  renderLink() {
    return (
      <span css={{ display: 'inline-flex', alignItems: 'center' }}>
        {this.props.shouldShowText && this.props.text && (
          <span
            data-test="short-url"
            css={(theme: ZobiTheme) => css`
              margin-right: ${theme.sizeUnit}px;
            `}
          >
            {this.props.text}
          </span>
        )}
        {this.renderTooltip(this.props.disabled ? 'not-allowed' : 'pointer')}
      </span>
    );
  }

  render() {
    const { wrapped } = this.props;
    if (!wrapped) {
      return this.renderNotWrapped();
    }
    return this.renderLink();
  }
}

export const CopyToClipboard = withToasts(CopyToClip);
export type { CopyToClipboardProps };
