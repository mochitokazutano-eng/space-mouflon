import { stateMeta, DEFAULT_BET_MODE_KEY } from 'state-shared';

export const stateBonus = $state({
	// selectedBetModeKey is copied verbatim onto stateBet.activeBetModeKey when the buy is
	// confirmed (ModalBuyBonusConfirm), so it has to be a real bet mode key, not a literal.
	selectedBetModeKey: DEFAULT_BET_MODE_KEY as string,
});

export const stateBonusDerived = {
	selectedBetModeData: () => stateMeta.betModeMeta[stateBonus.selectedBetModeKey],
};
