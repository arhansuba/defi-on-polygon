import * as React from 'react';
import { HStack, Stack, Flex, Textarea, Image, Text, Spacer, Button } from '@chakra-ui/react';
import type { BigNumber } from 'ethers';
import { useAccount } from 'wagmi';
import useAddAnswer from '../hooks/useAddAnswer';
import AuthButton from './AuthButton';
import toast from 'react-hot-toast';
import useBalance from '../hooks/useBalance';
import useAddMint from '../hooks/useAddMint';

interface AnswerEditorProps {
  questionid: BigNumber;
}

const AnswerEditor: React.FunctionComponent<AnswerEditorProps> = ({ questionid }) => {
  const [message, setMessage] = React.useState('');
  const { address: account } = useAccount();
  const { contractBalanceQuery, userBalanceQuery } = useBalance();
  const addAnswer = useAddAnswer();
  const addMint = useAddMint();

  const isDataFetched = contractBalanceQuery.isFetched && userBalanceQuery.isFetched && account;

  const isUserTippable = async () => {
    if (isDataFetched) {
      const balance = Number(userBalanceQuery.data);
      return balance >= 10;
    }
  };

  const handleFocus = async () => {
    if (!account) {
      toast.error('Please sign in to submit an answer');
      return;
    }
    const tippable = await isUserTippable();
    if (!tippable) {
      toast.error(`Keep your Goflow balance above 10 tokens to receive tips 🧧`);
    } else {
      toast.success('Your balance is sufficient to receive tips 💸');
    }
  };

  const handleMint = async () => {
    try {
      await addMint.mutateAsync({ amount: '10' });
      toast.success(`Minted 10 tokens for you :) Import the GOFLOW token address to your wallet`);
    } catch (e: any) {
      toast.error(e.message);
      console.log(e);
    }
  };

  const handleClick = async () => {
    try {
      await addAnswer.mutateAsync({ questionId: questionid, message });
      setMessage('');
    } catch (e: any) {
      toast.error(e.data?.message || e.message);
    }
  };

  return (
    <Stack spacing={3}>
      <HStack spacing={3} alignItems='start'>
        <Image borderRadius='full' boxSize='50px' fit='contain' src='../polygon-logo.png' alt='Polygon Logo' />
        <Textarea
          value={message}
          onFocus={handleFocus}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Submit an Answer..'
          p={3}
          flex={1}
          bg='whiteAlpha.400'
          rounded='md'
          fontSize='lg'
        />
      </HStack>
      <Flex alignItems='center'>
        <Spacer />
        <Button size='sm' mx='5px' onClick={handleMint} isLoading={addMint.isLoading} alignSelf='flex-end'>
          💰 Goflow Faucet
        </Button>
        <AuthButton
          text='Submit'
          size='sm'
          colorScheme='purple'
          alignSelf='flex-end'
          onClick={handleClick}
          isLoading={addAnswer.isLoading}
        />
      </Flex>
      {isDataFetched && (
        <Flex direction='column' alignItems='flex-end'>
          <Text fontSize='sm' mx='5px'>
            Contract Balance: {contractBalanceQuery.data}{' '}
          </Text>
          <Text fontSize='sm' mx='5px'>
            User Balance: {userBalanceQuery.data}{' '}
          </Text>
        </Flex>
      )}
    </Stack>
  );
};

export default AnswerEditor;