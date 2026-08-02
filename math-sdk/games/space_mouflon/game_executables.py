"""
Space Mouflon game-specific executables.

Free-spin trigger/retrigger counts use the base SDK's default
`update_freespin_amount` / `update_fs_retrigger_amt` (in src/executables), which
look up `config.freespin_triggers[gametype][scatter_count]` -- this already
implements our scaling trigger (4->10 / 5->12 / 6+->15) and scaling retrigger
(3->+5 / 4->+8 / 5+->+10), so no override is needed here.

Cosmic Meteor multipliers are Free Spins only, are never incremented per-tumble
(no "global multiplier" escalation mechanic in this game), and instead sum
whatever multiplier symbols are sitting on the board once a spin's whole
cascade sequence finishes -- that's exactly what `set_end_tumble_event` below
does via `get_board_multipliers()`.

The Wormhole scatter is deliberately excluded from `config.paytable` (see
game_config.py) -- if it paid through the normal pay-anywhere path it would be
marked "explode" and tumble away, corrupting the Free Spins trigger/retrigger
scatter count. `evaluate_scatter_win` below pays it separately, once per
reveal, without ever removing it from the board.
"""

from copy import copy

from game_calculations import GameCalculations
from src.calculations.scatter import Scatter
from game_events import send_mult_info_event
from src.events.events import (
    set_win_event,
    set_total_event,
    update_tumble_win_event,
    win_info_event,
)


class GameExecutables(GameCalculations):
    """Game specific executable functions. Used for grouping commonly used/repeated applications."""

    def set_end_tumble_event(self):
        """After all tumbling events have finished, multiply tumble-win by sum of Cosmic Meteor values."""
        if self.gametype == self.config.freegame_type:  # Meteors only land during Free Spins
            board_mult, mult_info = self.get_board_multipliers()
            base_tumble_win = copy(self.win_manager.spin_win)
            self.win_manager.set_spin_win(base_tumble_win * board_mult)
            if self.win_manager.spin_win > 0 and len(mult_info) > 0:
                send_mult_info_event(
                    self,
                    board_mult,
                    mult_info,
                    base_tumble_win,
                    self.win_manager.spin_win,
                )
                update_tumble_win_event(self)

        if self.win_manager.spin_win > 0:
            set_win_event(self)
        set_total_event(self)

    def get_scatterpays_update_wins(self):
        """Return the board since we are assigning the 'explode' attribute."""
        self.win_data = Scatter.get_scatterpay_wins(
            self.config, self.board, global_multiplier=self.global_multiplier
        )  # Evaluate wins, self.board is modified in-place
        Scatter.record_scatter_wins(self)
        self.win_manager.tumble_win = self.win_data["totalWin"]
        self.win_manager.update_spinwin(self.win_data["totalWin"])  # Update wallet

    def evaluate_scatter_win(self, scatter_key: str = "scatter") -> None:
        """Wormhole self-pay: evaluated once per reveal from the final
        (post-cascade) scatter count. Not part of the tumble win sequence, so
        Cosmic Meteor multipliers do not apply to it."""
        count = self.count_special_symbols(scatter_key)
        pay_key = (count, "S")
        if pay_key not in self.config.scatter_paytable:
            return

        win = self.config.scatter_paytable[pay_key]
        self.win_data = {
            "totalWin": win,
            "wins": [
                {
                    "symbol": "S",
                    "win": win,
                    "positions": copy(self.special_syms_on_board[scatter_key]),
                    "meta": {"globalMult": 1, "clusterMult": 1, "winWithoutMult": win},
                }
            ],
        }
        Scatter.record_scatter_wins(self)
        self.win_manager.update_spinwin(win)
        win_info_event(self)
        self.evaluate_wincap()
        if self.win_manager.spin_win > 0:
            set_win_event(self)
        set_total_event(self)
