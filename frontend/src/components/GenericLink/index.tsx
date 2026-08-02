import { PropsWithoutRef, RefAttributes } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { isUrlExternal, parseUrl } from 'src/utils/urlUtils';

export const GenericLink = <S,>({
  to,
  component,
  replace,
  innerRef,
  children,
  ...rest
}: PropsWithoutRef<LinkProps<S>> & RefAttributes<HTMLAnchorElement>) => {
  if (typeof to === 'string' && isUrlExternal(to)) {
    return (
      <a data-test="external-link" href={parseUrl(to)} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link
      data-test="internal-link"
      to={to}
      component={component}
      replace={replace}
      innerRef={innerRef}
      {...rest}
    >
      {children}
    </Link>
  );
};
