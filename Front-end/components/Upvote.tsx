import * as React from 'react';
import { useEffect } from 'react';
import { Icon } from '@chakra-ui/react';
import { FaArrowUp } from 'react-icons/fa';
import { Button, ButtonProps, Text } from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import type { BigNumber } from 'ethers';

import useUpvotes from '../hooks/useUpvotes';
import toast from 'react-hot-toast';
import useForumContract from '../hooks/contracts/useForumContract';
import useAddApprove from '../hooks/useAddApprove';
import useAddUpvote from '../hooks/useAddUpvote';

interface UpvoteButtonProps extends ButtonProps {
  answerId: BigNumber;
}

const Upvote: React.FunctionComponent<UpvoteButtonProps> = ({ answerId, ...props }) => {
  const [upvoteCount, setUpvoteCount] = React.useState(0);
  const { address: account } = useAccount();
  const forumContract = useForumContract();
  const upvotesQuery = useUpvotes({ answerId });

  const addApprove = useAddApprove();
  const addUpvote = useAddUpvote();

  const isLoading = addApprove.isLoading || addUpvote.isLoading;
  const upvoteCountText = upvoteCount === 1 ? '1 Upvote' : `${upvoteCount} Upvotes`;

  useEffect(() => {
    const fetchUpvoteCount = async () => {
      if (upvotesQuery.isFetched && !!upvotesQuery.data) {
        setUpvoteCount(upvotesQuery.data?.toNumber());
      }
    };
    fetchUpvoteCount();
  }, [answerId, upvotesQuery.data, upvotesQuery.isFetched]);

  const handleClick = async () => {
    try {
      await addApprove.mutateAsync({ address: forumContract.contract.address, amount: '1' });
      await addUpvote.mutateAsync({ answerId });
      toast.success('Upvoted!');
    } catch (e: any) {
      toast.error(e.data?.message || e.message);
    }
  };

  return (
    <>
      <Text fontSize='sm' color='gray.500' mx={3}>
        {upvoteCountText}
      </Text>
      <Button {...props} isLoading={isLoading} disabled={!account} onClick={handleClick}>
        <Icon as={FaArrowUp} />
      </Button>
    </>
  );
};

export default Upvote;