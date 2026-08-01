import type { ButtonGroupProps } from './types';

export function ButtonGroup(props: ButtonGroupProps) {
  const { className, children } = props;
  return (
    <div
      role="group"
      className={className}
      css={{
        display: 'flex',
        '& > :nth-of-type(1):not(:nth-last-of-type(1))': {
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          borderRight: 0,
          marginLeft: 0,
        },
        '& > :not(:nth-of-type(1)):not(:nth-last-of-type(1))': {
          borderRadius: 0,
          borderRight: 0,
          marginLeft: 0,
        },
        '& > :nth-last-of-type(1):not(:nth-of-type(1))': {
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          marginLeft: 0,
        },
        ...(props.expand && {
          '& .zobi-button': {
            flexGrow: 1,
          },
        }),
      }}
    >
      {children}
    </div>
  );
}

export type { ButtonGroupProps };
