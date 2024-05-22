import { BigNumber } from 'ethers';
import { useQuery } from 'react-query';
import useForumContract from './contracts/useForumContract';

interface UseQuestionQuery {
  questionId?: BigNumber;
}

const useQuestions = ({ questionId }: UseQuestionQuery) => {
  const contract = useForumContract();

  const questionQuery = useQuery(
    ['question', questionId?.toNumber()],
    async () => {
      if (questionId) {
        return await contract.getQuestion(questionId);
      }
    },
    { enabled: !!questionId } // ensures questionId has a value before fetching
  ); 

  const allQuestionsQuery = useQuery(['questions'], async () => {
    return await contract.getAllQuestions();
  });

  return { questionQuery, allQuestionsQuery };
};

export default useQuestions;