import * as React from 'react';
import toast from 'react-hot-toast';
import { Button, ButtonProps } from '@chakra-ui/react';
import { useAccount, useConnect, useNetwork } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

interface AuthButtonProps extends ButtonProps {
  text: string;
}

const AuthButton: React.FunctionComponent<AuthButtonProps> = ({ text, ...props }) => {
  const [btnText, setBtnText] = React.useState('Sign In');
  // Pass new InjectedConnector to useConnect so we only connect
  // with MetaMask rather than an array of wallet connectors
  const { connect, error } = useConnect({ connector: new InjectedConnector() });
  const { isConnected } = useAccount();
  const { chain } = useNetwork();

  React.useEffect(() => {
    if (error?.name === 'ConnectorNotFoundError') {
      toast.error('MetaMask extension required to sign in');
    }
    if (isConnected && chain?.id !== chains.polygonMumbai.id) {
        toast.error('please connect to the Polygon Mumbai test network', {id: 'network-error'});
      }
    if (isConnected && chain?.id !== 1337) {
      toast.error('please connect to the local network');
    }
  }, [error, chain, isConnected]);

  React.useEffect(() => {
    if (isConnected) {
      setBtnText(text);
    } else {
      setBtnText('Sign In');
    }
  }, [isConnected]);

  if (isConnected) {
    return <Button {...props}>{btnText}</Button>;
  } else {
    return (
      <Button
        {...props}
        onClick={() => {
          !isConnected && connect();
        }}
      >
        {btnText}
      </Button>
    );
  }
};

export default AuthButton;