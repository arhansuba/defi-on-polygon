import { makeBig } from '../lib/number-utils';
import { useMutation } from 'react-query';
import useGoflowContract from './contracts/useGoflowContract';

interface UseMintPayload {
  amount: string;
}

const useAddMint = () => {
  const contract = useGoflowContract();
  return useMutation(async ({ amount }: UseMintPayload) => {
    await contract.mint(makeBig(amount));
  });
};

export default useAddMint;