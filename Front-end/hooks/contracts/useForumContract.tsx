import * as wagmi from "wagmi";
import { useProvider } from "wagmi";
import type { BigNumber } from "ethers";
// Import our contract ABI (a json representation of our contract's public interface).
// The hardhat compiler writes this file to artifacts every time we run npx hardhat.
import ForumContract from '../../../Hardhat/artifacts/contracts/Forum.sol/Forum.json';
export enum ForumEvent {
  QuestionAdded = 'QuestionAdded',
  AnswerAdded = 'AnswerAdded',
  AnswerUpvoted = 'AnswerUpvoted',
}
export interface Question {
  questionId: BigNumber;
  message: string;
  creatorAddress: string;
  timestamp: BigNumber;
}

export interface Answer {
  answerId: BigNumber;
  questionId: BigNumber;
  creatorAddress: string;
  message: string;
  timestamp: BigNumber;
  upvotes: BigNumber;
}

const useForumContract = () => {
  // An ethers.Provider instance. This will help us read from the contract
  // even if we don't have a logged in wallet. We set this up in _app.tsx.
  const provider = useProvider();

  // This returns a new ethers.Contract ready to interact with our API.
  // We need to pass in the address of our deployed contract as well as its abi.
  const contract = wagmi.useContract({
    // Add the address that was output from your deploy script
    addressOrName: '<address>',
    contractInterface: ForumContract.abi,
    signerOrProvider: provider,
  });

  // Wrapper to fetch a question from the contract
  const getQuestion = async (questionId: BigNumber): Promise<Question> => {
    return  {...await contract.questions(questionId)};
  };

  const getAllQuestions = async (): Promise<Question[]> => {
    const qArray = await contract.getQuestions();
    return qArray.map((q: Question) => ({ ...q }));
  };

  const getAnswers = async (questionId: BigNumber): Promise<Answer[]> => {
    const answerIds: BigNumber[] = await contract.getAnswersPerQuestion(questionId);
    const mappedAnswers = answerIds.map((answerId: BigNumber) => contract.answers(answerId));
    const allAnswers = await Promise.all(mappedAnswers);
    return allAnswers.map((a) => {
      return { ...a };
    });
  };

  const getUpvotes = async (answerId: BigNumber): Promise<BigNumber> => {
    return await contract.getUpvotes(answerId);
  };

  const postQuestion = async (message: string): Promise<void> => {
    const tx = await contract.postQuestion(message);
    await tx.wait();
  };

  const postAnswer = async (questionId: BigNumber, message: string): Promise<void> => {
    const tx = await contract.postAnswer(questionId, message);
    await tx.wait();
  };

  const upvoteAnswer = async (answerId: BigNumber): Promise<void> => {
    const tx = await contract.upvoteAnswer(answerId);
    await tx.wait();
  };

  return {
    contract,
    chainId: contract.provider.network?.chainId,
    getQuestion,
    getAllQuestions,
    getAnswers,
    getUpvotes,
    postQuestion,
    postAnswer,
    upvoteAnswer,
  };
}

export default useForumContract;