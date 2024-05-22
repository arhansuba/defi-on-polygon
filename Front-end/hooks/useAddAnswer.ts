import type { BigNumber } from 'ethers';
import { useMutation } from 'react-query';
import useForumContract from './contracts/useForumContract';

interface UseAddAnswerPayload {
  questionId: BigNumber;
  message: string;
}

const useAddAnswer = () => {
  const contract = useForumContract();
  return useMutation(async ({ questionId, message }: UseAddAnswerPayload) => {
    await contract.postAnswer(questionId, message);
  });
};

export default useAddAnswer;