import { Api } from '../../api/api';
import { Dispatch, GetState } from '../index';
import { selectActiveNodeApi } from '../stacks-node/stacks-node.reducer';
import { createAction } from '@reduxjs/toolkit';
import { AddressStxBalanceResponse } from '@stacks/stacks-blockchain-api-types';
import { safeAwait } from '@stacks/ui';

export const fetchAddress = createAction('address/fetch-address');
export const fetchAddressDone = createAction<AddressStxBalanceResponse>(
  'address/fetch-address-done'
);
export const fetchAddressFail = createAction('address/fetch-address-fail');

export function getAddressDetails(address: string) {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(fetchAddress());
    const activeNode = selectActiveNodeApi(getState());
    const [error, response] = await safeAwait(
      new Api(activeNode.url).accountsApi.getAccountStxBalance({ principal: address })
    );
    if (error) {
      dispatch(fetchAddressFail());
      return;
    }
    if (response) {
      dispatch(fetchAddressDone(response as AddressStxBalanceResponse));
    }
  };
}

export const updateAddressBalance =
  createAction<{ address: string; balance: string }>('address/update-balance');
