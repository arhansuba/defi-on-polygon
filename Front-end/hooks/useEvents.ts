import type { BigNumber, Event } from 'ethers';
import { constants } from 'ethers';
import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { useAccount } from 'wagmi';
import useGoflowContract, { TokenEvent } from './contracts/useGoflowContract';
import useForumContract, { Answer, ForumEvent } from './contracts/useForumContract';
import { makeNum } from '../lib/number-utils';
import truncateMiddle from 'truncate-middle';

interface UseEventsQuery {
	questionId?: BigNumber;
}

// Listen to events and refresh data
const useEvents = ({ questionId }: UseEventsQuery) => {
  const { address: account } = useAccount();
  const queryClient = useQueryClient();
  const forumContract = useForumContract();
  const tokenContract = useGoflowContract();

  useEffect(() => {
    const questionHandler = () => {
      // refetch all questions whenever we call this handler
      queryClient.invalidateQueries(['questions']);
    };

    const answerHandler = (answer: Answer, emittedEvent: Event) => {
      if (questionId) {
        const answerQidNumber = answer.questionId.toNumber();
        const questionIdNumber = questionId.toNumber();
        const answerIdNumber = answer.answerId.toNumber();
        if (answerQidNumber !== questionIdNumber) {
          return;
        }

        // Check which event we've received
        // and only refetch the query by its id
        if (emittedEvent.event === ForumEvent.AnswerAdded) {
          queryClient.invalidateQueries(['answers', answerQidNumber]);
        } else if (emittedEvent.event === ForumEvent.AnswerUpvoted) {
          queryClient.invalidateQueries(['upvotes', answerIdNumber]);
        }
      }
    };

		// Consume the Transfer event from the ERC20 token standard
    const transferHandler = async (from: string, to: string, amount: BigNumber, emittedEvent: Event) => {
      if (to === forumContract.contract.address) {
		console.log(`Transferred ${makeNum(amount)} GOFLOW to Forum contract`);
        queryClient.invalidateQueries(['contractBalance']);
      } else if (from === constants.AddressZero) { // e.g. '0x0000000000000000000000000000000000000000'
		console.log(`Minted ${makeNum(amount)} GOFLOW to: ${truncateMiddle(to, 6, 5, '...')}`);
        queryClient.invalidateQueries(['userBalance', to]);
      } else {
		console.log(`Transferred ${makeNum(amount)} GOFLOW to: ${truncateMiddle(to, 6, 5, '...')}`);
        queryClient.invalidateQueries(['userBalance', to]);
      }
    };

    forumContract.contract.on(ForumEvent.QuestionAdded, questionHandler);
    forumContract.contract.on(ForumEvent.AnswerAdded, answerHandler);
    forumContract.contract.on(ForumEvent.AnswerUpvoted, answerHandler);
    tokenContract.contract.on(TokenEvent.Transfer, transferHandler);

    return () => {
      forumContract.contract.off(ForumEvent.QuestionAdded, questionHandler);
      forumContract.contract.off(ForumEvent.AnswerAdded, answerHandler);
      forumContract.contract.off(ForumEvent.AnswerUpvoted, answerHandler);
      tokenContract.contract.off(TokenEvent.Transfer, transferHandler);
    };
  }, [queryClient, questionId, forumContract, tokenContract, account]);
};

export default useEvents;