import type { NextPage } from 'next';
import * as React from 'react';
import { Box, Center, Icon, Spinner, Stack } from '@chakra-ui/react';
import { FaCommentDollar } from 'react-icons/fa';
import { BigNumber } from 'ethers';
import { useRouter } from 'next/router';
import Question from '../../components/Question';
import useQuestions from '../../hooks/useQuestions';
import Answers from '../../components/Answers';

const QuestionPage: NextPage = () => {
  const [questionId, setQuestionId] = React.useState<BigNumber | undefined>();
  const { questionQuery } = useQuestions({ questionId });
  const router = useRouter();

  React.useEffect(() => {
    // If we refresh the URL `/question/[id]` in our browser,
    // router.query.id may be undefined for a moment. Therefore,
    // we wait for the useRouter hook before setting the questionId
    if (router.isReady) {
      setQuestionId(BigNumber.from(router.query.id));
    }
  }, [router.isReady, router.query.id]);

  return (
    <Box p={3} pt={8} maxW='600px' minW='320px' m='0 auto'>
      {questionQuery.isLoading && (
        <Center p={8}>
          <Spinner />
        </Center>
      )}
      {questionQuery.isFetched && questionQuery?.data && (
        <Stack spacing={2}>
          <Box mb={5}>
            <Question {...questionQuery.data} answerPage={true} />
          </Box>
          <Center pt='8px' height='20px'>
            <Icon as={FaCommentDollar} alignSelf='center' />
          </Center>
          <Box p={8} maxW='600px' minW='320px' m='0 auto'>
            {!!questionId && <Answers questionId={questionId} />}
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default QuestionPage;