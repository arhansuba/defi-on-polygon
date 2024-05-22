import * as React from 'react';
import { Box, Center, Spinner, Stack } from '@chakra-ui/react';
import useAnswers from '../hooks/useAnswers';
import Answer from './Answer';
import type { BigNumber } from 'ethers';
import type { Answer as AnswerStruct } from '../hooks/contracts/useForumContract';
import AnswerEditor from './AnswerEditor'; 

interface AnswersProps {
  questionId: BigNumber;
}

const Answers: React.FunctionComponent<AnswersProps> = ({ questionId }) => {
  const [sortedAnswers, setSortedAnswers] = React.useState<AnswerStruct[]>([]);
  const answersQuery = useAnswers({ questionId });

  React.useEffect(() => {
    if (answersQuery.data) {
      const sortAnswers = answersQuery.data.sort((a, b) => (a.upvotes > b.upvotes ? -1 : 1));
      setSortedAnswers(sortAnswers);
    }
  }, [answersQuery.data, answersQuery.isFetched]);

  return (
    <Box>
      {answersQuery.isLoading && (
        <Center p={8}>
          <Spinner />
        </Center>
      )}
      <Stack spacing={2}>
        {sortedAnswers?.map((answer, i) => (
          <Answer key={answer.answerId.toNumber()} answer={answer} first={i === 0 && answer.upvotes.toNumber() != 0} />
        ))}
        {answersQuery.isFetched && <AnswerEditor questionid={questionId} />}
      </Stack>
    </Box>
  );
};

export default Answers;