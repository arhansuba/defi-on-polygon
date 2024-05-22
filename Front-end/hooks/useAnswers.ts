import type { BigNumber } from 'ethers';
import { useQuery } from 'react-query';
import useForumContract from './contracts/useForumContract';

interface UseAnswersQuery {
  questionId: BigNumber;
}

const useAnswers = ({ questionId }: UseAnswersQuery) => {
  const contract = useForumContract();

  return useQuery(
    ['answers', questionId.toNumber()],
    async () => {
      return await contract.getAnswers(questionId);
    },
    { enabled: !!questionId }
  );
};

export default useAnswers;