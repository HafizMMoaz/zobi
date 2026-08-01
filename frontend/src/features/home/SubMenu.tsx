import { ReactNode, useState, useEffect, FunctionComponent } from 'react';

import { Link, useHistory } from 'react-router-dom';
import { t } from '@zobi.dev/extension-api/translation';
import {
  styled,
  ZobiTheme,
  css,
  useTheme,
} from '@zobi.dev/extension-api/theme';
import cx from 'classnames';
import { debounce } from 'lodash';
import { Menu, MenuMode } from '@zobi.dev/core/components/Menu';
import {
  Button,
  Tooltip,
  Row,
  type OnClickHandler,
} from '@zobi.dev/core/components';
import { Icons } from '@zobi.dev/core/components/Icons';
import { MenuObjectProps } from 'src/types/bootstrapTypes';
import { Typography } from '@zobi.dev/core/components/Typography';

const StyledHeader = styled.div<{ backgroundColor?: string }>`
  background-color: ${({ theme, backgroundColor }) =>
    backgroundColor || theme.colorBgContainer};
  align-items: center;
  position: relative;
  padding: ${({ theme }) => theme.sizeUnit * 2}px
    ${({ theme }) => theme.sizeUnit * 4}px;
  margin-bottom: ${({ theme }) => theme.sizeUnit * 4}px;
  .header {
    font-weight: ${({ theme }) => theme.fontWeightStrong};
    margin-right: ${({ theme }) => theme.sizeUnit * 3}px;
    text-align: left;
    font-size: 18px;
    display: inline-block;
    line-height: ${({ theme }) => theme.sizeUnit * 9}px;
  }
  .nav-right {
    display: flex;
    align-items: center;
    /* margin-right: ${({ theme }) => theme.sizeUnit * 3}px; */
    float: right;
    position: absolute;
    right: ${({ theme }) => theme.sizeUnit * 4}px;
    ul.ant-menu-root {
      padding: 0px;
    }
    .ant-row {
      align-items: center;
    }
    li[role='menuitem'] {
      border: 0;
      border-bottom: none;
      &:hover {
        border-bottom: transparent;
      }
    }
  }
  .nav-right-collapse {
    display: flex;
    align-items: center;
    padding: 14px 0;
    margin-right: 0;
    float: left;
    padding-left: 10px;
  }
  .menu {
    align-items: center;
  }

  .menu > .ant-menu {
    padding-left: ${({ theme }) => theme.sizeUnit * 5}px;
    line-height: ${({ theme }) => theme.sizeUnit * 5}px;

    .ant-menu-item {
      border-radius: ${({ theme }) => theme.borderRadius}px;
      font-size: ${({ theme }) => theme.fontSizeSM}px;
      padding: ${({ theme }) => theme.sizeUnit}px
        ${({ theme }) => theme.sizeUnit * 4}px;
      margin-right: ${({ theme }) => theme.sizeUnit}px;
    }
    .ant-menu-item:hover,
    .ant-menu-item:has(> span > .active) {
      background-color: ${({ theme }) => theme.colorPrimaryBgHover};
      color: ${({ theme }) => theme.colorText};
    }
  }

  .btn-link {
    padding: 10px 0;
  }
  @media (max-width: 767px) {
    .header,
    .nav-right {
      position: relative;
      margin-left: ${({ theme }) => theme.sizeUnit * 2}px;
    }
  }
`;

const styledDisabled = (theme: ZobiTheme) => css`
  color: ${theme.colorTextDisabled};
  cursor: not-allowed;

  &:hover {
    color: ${theme.colorTextDisabled};
  }

  .ant-menu-item-selected {
    background-color: ${theme.colorBgContainerDisabled};
  }
`;

type MenuChild = {
  label: string;
  name: string;
  url?: string;
  usesRouter?: boolean;
  onClick?: () => void;
  'data-test'?: string;
  id?: string;
  'aria-controls'?: string;
};

export interface ButtonProps {
  name: ReactNode;
  onClick?: OnClickHandler;
  'data-test'?: string;
  buttonStyle: 'primary' | 'secondary' | 'dashed' | 'link' | 'tertiary';
  loading?: boolean;
  icon?: ReactNode;
  component?: ReactNode;
}

export interface SubMenuProps {
  buttons?: Array<ButtonProps>;
  name?: string | ReactNode;
  tabs?: MenuChild[];
  activeChild?: MenuChild['name'];
  /* If usesRouter is true, a react-router <Link> component will be used instead of href.
   *  ONLY set usesRouter to true if SubMenu is wrapped in a react-router <Router>;
   *  otherwise, a 'You should not use <Link> outside a <Router>' error will be thrown */
  usesRouter?: boolean;
  color?: string;
  dropDownLinks?: Array<MenuObjectProps>;
  backgroundColor?: string;
  children?: ReactNode;
}

const SubMenuComponent: FunctionComponent<SubMenuProps> = props => {
  const [showMenu, setMenu] = useState<MenuMode>('horizontal');
  const [navRightStyle, setNavRightStyle] = useState('nav-right');
  const theme = useTheme();

  let hasHistory = true;
  // If no parent <Router> component exists, useHistory throws an error
  try {
    useHistory();
  } catch (err) {
    // If error is thrown, we know not to use <Link> in render
    hasHistory = false;
  }

  useEffect(() => {
    let isMounted = true;

    function handleResize() {
      if (!isMounted) return;
      if (window.innerWidth <= 767) setMenu('inline');
      else setMenu('horizontal');

      if (
        props.buttons &&
        props.buttons.length >= 3 &&
        window.innerWidth >= 795
      ) {
        setNavRightStyle('nav-right');
      } else if (
        props.buttons &&
        props.buttons.length >= 3 &&
        window.innerWidth <= 795
      ) {
        setNavRightStyle('nav-right-collapse');
      }
    }
    handleResize();
    const resize = debounce(handleResize, 10);
    window.addEventListener('resize', resize);
    return () => {
      isMounted = false;
      resize.cancel();
      window.removeEventListener('resize', resize);
    };
  }, [props.buttons]);

  return (
    <StyledHeader backgroundColor={props.backgroundColor}>
      <Row className="menu" role="navigation" aria-label={t('Page navigation')}>
        {props.name && <div className="header">{props.name}</div>}
        <Menu
          mode={showMenu}
          disabledOverflow
          role="tablist"
          items={props.tabs?.map(tab => {
            if ((props.usesRouter || hasHistory) && !!tab.usesRouter) {
              return {
                key: tab.label,
                label: (
                  <Link
                    to={tab.url || ''}
                    role="tab"
                    id={tab.id || tab.name}
                    data-test={tab['data-test']}
                    aria-selected={tab.name === props.activeChild}
                    aria-controls={tab['aria-controls'] || ''}
                    className={tab.name === props.activeChild ? 'active' : ''}
                  >
                    {tab.label}
                  </Link>
                ),
              };
            }
            return {
              key: tab.label,
              label: (
                <div
                  className={cx('no-router', {
                    active: tab.name === props.activeChild,
                  })}
                  role="tab"
                  aria-selected={tab.name === props.activeChild}
                >
                  <Typography.Link href={tab.url} onClick={tab.onClick}>
                    {tab.label}
                  </Typography.Link>
                </div>
              ),
            };
          })}
        />
        <div className={navRightStyle}>
          <Menu
            mode="horizontal"
            triggerSubMenuAction="click"
            disabledOverflow
            css={css`
              [data-icon='caret-down'] {
                color: ${theme.colorIcon};
                font-size: ${theme.fontSizeXS}px;
                margin-left: ${theme.sizeUnit}px;
              }
            `}
            items={props.dropDownLinks?.map((link, i) => ({
              key: `dropdown-${i}`,
              label: link.label,
              icon: <Icons.CaretDownOutlined />,
              popupOffset: [10, 20],
              className: 'dropdown-menu-links',
              children: link.childs
                ?.filter(
                  (item): item is Exclude<typeof item, string> =>
                    typeof item === 'object',
                )
                .map(item =>
                  item.disable
                    ? {
                        key: item.label,
                        disabled: true,
                        label: (
                          <Tooltip
                            placement="top"
                            title={t(
                              "Enable 'Allow file uploads to database' in any database's settings",
                            )}
                          >
                            <span css={styledDisabled(theme)}>
                              {item.label}
                            </span>
                          </Tooltip>
                        ),
                      }
                    : {
                        key: item.label,
                        label: (
                          <Typography.Link
                            href={item.url}
                            onClick={item.onClick}
                          >
                            {item.label}
                          </Typography.Link>
                        ),
                      },
                ),
            }))}
          />
          {props.buttons?.map((btn, i) =>
            btn.component ? (
              <span key={i}>{btn.component}</span>
            ) : (
              <Button
                key={i}
                buttonStyle={btn.buttonStyle}
                icon={btn.icon}
                onClick={btn.onClick}
                data-test={btn['data-test']}
                loading={btn.loading ?? false}
              >
                {btn.name}
              </Button>
            ),
          )}
        </div>
      </Row>
      {props.children}
    </StyledHeader>
  );
};

export default SubMenuComponent;
