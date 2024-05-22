import { useMutation } from 'react-query';
import useForumContract from './contracts/useForumContract';

interface UseAddQuestionPayload {
  message: string;
}

const useAddQuestion = () => {
  const contract = useForumContract();
  return useMutation(async ({ message }: UseAddQuestionPayload) => {
    await contract.postQuestion(message);
  });
};

export default useAddQuestion;