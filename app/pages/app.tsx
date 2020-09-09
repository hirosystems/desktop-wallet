import React, { useCallback, useEffect, FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectWebSocketClient } from '@stacks/blockchain-api-client';

import { useNavigatorOnline } from '@hooks/use-navigator-online';
import {
  getAddressTransactions,
  addNewTransaction,
  pendingTransactionSuccessful,
} from '@store/transaction';
import { getAddressDetails, updateAddressBalance } from '@store/address';
import { RootState } from '@store/index';
import { TitleBar } from '@components/title-bar';
import { selectAddress } from '@store/keys';
import { safeAwait } from '@utils/safe-await';
import { Api } from '../api/api';
import { selectActiveNodeApi } from '@store/stacks-node';
import urljoin from 'url-join';

export const App: FC = ({ children }) => {
  const dispatch = useDispatch();
  const [webSocket, setWebSocket] = useState('Disconnected');

  const { address, activeNode } = useSelector((state: RootState) => ({
    address: selectAddress(state),
    activeNode: selectActiveNodeApi(state),
  }));

  const initAppWithStxAddressInfo = useCallback(() => {
    if (!address) return;
    dispatch(getAddressTransactions(address));
    dispatch(getAddressDetails(address));
  }, [address, dispatch]);

  useNavigatorOnline({
    onReconnect: initAppWithStxAddressInfo,
  });

  useEffect(() => {
    initAppWithStxAddressInfo();
  }, [address, activeNode, initAppWithStxAddressInfo]);

  // const checkIfPendingTxIsComplete = async (address: string) => {
  //   const [error, txResponse] = await safeAwait(new Api(activeNode.url).getTxDetails(address));
  //   if (error || !txResponse || txResponse.data.tx_status === 'pending') {
  //     return;
  //   }
  //   if (txResponse.data.tx_status === 'success') {
  //     dispatch(pendingTransactionSuccessful(txResponse.data));
  //   }
  // };

  const wsUrl = new URL(activeNode.url);
  wsUrl.protocol = 'ws:';

  console.log(urljoin(wsUrl.toString(), 'v1', 'ws'));

  useEffect(() => {
    async function run() {
      const client = await connectWebSocketClient(urljoin(wsUrl.toString(), 'v1', 'ws')).finally(
        () => {
          setWebSocket('Disconnected');
        }
      );
      setWebSocket('Connected');
      if (!address) return;
      await client.subscribeAddressBalanceUpdates(address, ({ address, balance }) => {
        console.log('address balance updates', { address, balance });
        dispatch(updateAddressBalance({ address, balance }));
      });
      await client.subscribeAddressTransactions(address, async ({ tx_id }) => {
        console.log('address tx updates', tx_id);
        const newTx = await new Api(activeNode.url).getTxDetails(tx_id);
        if (newTx.data.tx_status !== 'success') return;
        dispatch(addNewTransaction(newTx.data));
        dispatch(pendingTransactionSuccessful(newTx.data));
      });
    }
    void run();
  }, [address, dispatch, activeNode.url]);

  return (
    <>
      <TitleBar />
      {children}
    </>
  );
};
