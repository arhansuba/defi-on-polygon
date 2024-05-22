import { useQuery } from 'react-query';
import { useAccount } from 'wagmi';
import useGoflowContract from './contracts/useGoflowContract';
import useForumContract from './contracts/useForumContract';

const useBalance = () => {
  const forumContract = useForumContract();
  const goflowContract = useGoflowContract();
  const { address: account } = useAccount();

  const contractBalanceQuery = useQuery(['contractBalance'], async () => {
    return await goflowContract.getBalance(forumContract.contract.address);
  });

  const userBalanceQuery = useQuery(
    ['userBalance', account],
    async () => {
      if (account) {
        return await goflowContract.getBalance(account);
      } else {
        return '0';
      }
    },
    { enabled: !!account }
  );

  return { contractBalanceQuery, userBalanceQuery };
};

export default useBalance;