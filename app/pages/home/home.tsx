import React, { FC } from 'react';
import { Route, Switch } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Spinner } from '@stacks/ui';

import routes from '@constants/routes.json';
import { openTxInExplorer } from '@utils/external-links';

import { RootState } from '@store/index';
import { selectAddress } from '@store/keys';
import { selectActiveNodeApi } from '@store/stacks-node';
import { selectRevokeDelegationModalOpen } from '@store/home/home.reducer';
import { selectTransactionsLoading, selectTransactionListFetchError } from '@store/transaction';
import { selectLoadingStacking, selectNextCycleInfo, selectStackerInfo } from '@store/stacking';
import {
  homeActions,
  selectTxModalOpen,
  selectReceiveModalOpen,
  selectHomeCardState,
  HomeCardState,
} from '@store/home';

import { SendStxModal } from '@modals/send-stx/send-stx-modal';
import { ReceiveStxModal } from '@modals/receive-stx/receive-stx-modal';
import { RevokeDelegationModal } from '@modals/revoke-delegation/revoke-delegation-modal';

import { useDelegationStatus } from '@hooks/use-delegation-status';
import { useTransactionList } from '@hooks/use-transaction-list';
import { useBalance } from '@hooks/use-balance';
import { useApi } from '@hooks/use-api';
import { useLatestNonce } from '@hooks/use-latest-nonce';
import { RequestDiagnosticsModal } from '@modals/request-diagnostics/request-diagnostic-modal';
import { usePromptUserToSetDiagnosticPermissions } from '@hooks/use-diagnostic-permission-prompt';

import { StackingCard } from '@components/home/stacking-card';
import { StackingLoading } from '@components/home/stacking-loading';
import { StackingBeginsSoonCard } from '@components/home/stacking-begins-soon-card';
import { StackingError } from '@components/home/stacking-error-card';
import { TransactionListItemMempool } from '@components/home/transaction-list/transaction-list-item-mempool';
import { DelegationCard } from '@components/home/delegation-card';
import {
  TransactionList,
  StackingPromoCard,
  StackingRewardCard,
  TransactionListItem,
  BalanceCard,
} from '@components/home';
import { HomeLayout } from './home-layout';
import { useAnalytics } from '@hooks/use-analytics';

export const Home: FC = () => {
  const dispatch = useDispatch();
  const api = useApi();
  useLatestNonce();
  usePromptUserToSetDiagnosticPermissions();

  const { delegated: isDelegated } = useDelegationStatus();
  const { availableBalance } = useBalance();

  const {
    address,
    loadingTxs,
    txModalOpen,
    txListFetchError,
    receiveModalOpen,
    revokeDelegationModalOpen,
    activeNode,
    stackerInfo,
    stackingCardState,
  } = useSelector((state: RootState) => ({
    address: selectAddress(state),
    txModalOpen: selectTxModalOpen(state),
    revokeDelegationModalOpen: selectRevokeDelegationModalOpen(state),
    receiveModalOpen: selectReceiveModalOpen(state),
    loadingTxs: selectTransactionsLoading(state),
    txListFetchError: selectTransactionListFetchError(state),
    activeNode: selectActiveNodeApi(state),
    nextCycleInfo: selectNextCycleInfo(state),
    stackerInfo: selectStackerInfo(state),
    stackingLoading: selectLoadingStacking(state),
    stackingCardState: selectHomeCardState(state),
  }));

  const { txs, pendingTxs, txCount, focusedTxIdRef, txDomNodeRefMap } = useTransactionList();

  const analytics = useAnalytics();

  if (!address) return <Spinner />;

  const openTxInExplorerTracked = (txId: string) => {
    void analytics.track('view_transaction');
    return openTxInExplorer(txId);
  };

  const transactionList = (
    <>
      <TransactionList
        txCount={txCount}
        loading={loadingTxs}
        node={activeNode}
        error={txListFetchError}
      >
        {pendingTxs.map(pendingTxs => (
          <TransactionListItemMempool
            address={address}
            domNodeMapRef={txDomNodeRefMap}
            activeTxIdRef={focusedTxIdRef}
            key={pendingTxs.tx_id}
            tx={pendingTxs}
            onSelectTx={openTxInExplorerTracked}
          />
        ))}
        {txs.map(tx => (
          <TransactionListItem
            domNodeMapRef={txDomNodeRefMap}
            activeTxIdRef={focusedTxIdRef}
            key={tx.tx.tx_id}
            txWithEvents={tx}
            onSelectTx={openTxInExplorerTracked}
          />
        ))}
      </TransactionList>
    </>
  );
  const balanceCard = (
    <BalanceCard
      address={address}
      onSelectSend={() => dispatch(homeActions.openTxModal())}
      onSelectReceive={() => dispatch(homeActions.openReceiveModal())}
      onRequestTestnetStx={async ({ stacking }) => api.getFaucetStx(address, stacking)}
    />
  );

  const stackingCardMap: Record<HomeCardState, JSX.Element> = {
    [HomeCardState.LoadingResources]: <StackingLoading />,
    [HomeCardState.NotEnoughStx]: <StackingPromoCard />,
    [HomeCardState.EligibleToParticipate]: <StackingPromoCard />,
    [HomeCardState.StackingPendingContactCall]: <StackingLoading />,
    [HomeCardState.StackingPreCycle]: (
      <StackingBeginsSoonCard blocksTillNextCycle={stackerInfo?.blocksUntilStackingCycleBegins} />
    ),
    [HomeCardState.StackingActive]: <StackingCard />,
    [HomeCardState.StackingError]: <StackingError />,
    [HomeCardState.PostStacking]: <></>,
  };

  const stackingRewardCard = (
    <StackingRewardCard lifetime="0.0281 Bitcoin (sample)" lastCycle="0.000383 Bitcoin (sample)" />
  );

  return (
    <>
      <ReceiveStxModal isOpen={receiveModalOpen} />
      <SendStxModal isOpen={txModalOpen} balance={availableBalance.toString()} address={address} />
      {revokeDelegationModalOpen && <RevokeDelegationModal />}
      <HomeLayout
        transactionList={transactionList}
        balanceCard={balanceCard}
        stackingCard={isDelegated ? <DelegationCard /> : stackingCardMap[stackingCardState]}
        stackingRewardCard={stackingRewardCard}
      />
      <Switch>
        <Route exact path={routes.HOME_REQUEST_DIAGNOSTICS} component={RequestDiagnosticsModal} />
      </Switch>
    </>
  );
};
