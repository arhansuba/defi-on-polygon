import type { BigNumber } from 'ethers';
import { useMutation } from 'react-query';
import useForumContract from './contracts/useForumContract';

interface UseAddUpvotePayload {
  answerId: BigNumber;
}

const useAddUpvote = () => {
  const contract = useForumContract();
  return useMutation(async ({ answerId }: UseAddUpvotePayload) => {
    await contract.upvoteAnswer(answerId);
  });
};

export default useAddUpvote;