import { BigNumber } from 'ethers';
import { useQuery } from 'react-query';
import useForumContract from './contracts/useForumContract';

interface UseUpvotesQuery {
  answerId: BigNumber;
}

const useUpvotes = ({ answerId }: UseUpvotesQuery) => {
  const contract = useForumContract();

  return useQuery(['upvotes', answerId.toNumber()], async () => {
    return await contract.getUpvotes(answerId);
  });
};

export default useUpvotes;