import { makeBig } from '../lib/number-utils';
import { useMutation } from 'react-query';
import useGoflowContract from './contracts/useGoflowContract';

interface UseApprovePayload {
  address: string;
  amount: string;
}

const useAddApprove = () => {
  const contract = useGoflowContract();
  return useMutation(async ({ address, amount }: UseApprovePayload) => {
    await contract.approve(address, makeBig(amount));
  });
};

export default useAddApprove;