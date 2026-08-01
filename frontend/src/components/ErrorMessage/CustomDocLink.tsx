
import { Flex, Icons } from '@zobi.dev/core/components';

export type CustomDocLinkProps = {
  url: string;
  label: string;
};

export const CustomDocLink = ({ url, label }: CustomDocLinkProps) => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    <Flex align="center" gap={4}>
      {label} <Icons.Full iconSize="m" />
    </Flex>
  </a>
);
