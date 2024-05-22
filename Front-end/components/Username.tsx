import * as React from 'react';
import { Text, TextProps } from '@chakra-ui/react';
import truncateMiddle from 'truncate-middle';

interface UsernameProps extends TextProps {
  address: string;
}

const Username: React.FunctionComponent<UsernameProps> = ({ address, ...otherProps }) => {
  const data = address;

  return (
    <Text display='inline' textTransform={data ? 'none' : 'uppercase'} {...otherProps}>
      {truncateMiddle(address || '', 6, 5, '...')}
    </Text>
  );
};

export default Username;