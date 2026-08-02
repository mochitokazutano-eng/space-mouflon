import os
from src.config.config import Config
from src.config.distributions import Distribution
from src.config.betmode import BetMode


class GameConfig(Config):
    """Load all game specific parameters and elements"""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        super().__init__()
        self.game_id = "space_mouflon"
        self.game_name = "space_mouflon"
        self.provider_number = 0
        self.working_name = "Space Mouflon"
        self.wincap = 20000.0
        self.win_type = "scatter"
        self.rtp = 0.965
        self.construct_paths()

        # Game Dimensions
        self.num_reels = 6
        self.num_rows = [5] * self.num_reels

        # --- Paytable -------------------------------------------------------
        # Symbol codes:
        #   H1 Golden Mouflon (top)   H2 Astronaut Helmet
        #   H3 Ringed Planet          H4 Rocket
        #   L1 Amber gem  L2 Crimson gem  L3 Teal gem  L4 Blue gem  L5 Violet gem
        #   S  Wormhole Portal (scatter, also self-pays)
        #   M  Cosmic Meteor (freegame-only multiplier symbol, no paytable entry)
        #
        # Wormhole scatter self-pay is intentionally NOT part of self.paytable:
        # Scatter.get_scatterpay_wins() marks any winning (count, symbol) pair as
        # "explode" and tumbles it away, which would destroy scatters mid-cascade
        # and corrupt the Free Spins trigger/retrigger scatter count. Instead the
        # Wormhole is paid via a small custom evaluator (evaluate_scatter_win in
        # game_executables.py) using self.scatter_paytable below, so scatters
        # keep paying without ever exploding off the board.
        #
        # Pay-anywhere count tiers: 8-9 / 10-11 / 12+ (12-30, board is 30 tiles).
        # Wormhole self-pay tiers: 4 / 5 / 6+ (6-30).
        t1, t2, t3 = (8, 9), (10, 11), (12, 30)
        s1, s2, s3 = (4, 4), (5, 5), (6, 30)
        pay_group = {
            (t1, "H1"): 10.0,
            (t2, "H1"): 25.0,
            (t3, "H1"): 50.0,
            (t1, "H2"): 3.0,
            (t2, "H2"): 10.0,
            (t3, "H2"): 25.0,
            (t1, "H3"): 2.0,
            (t2, "H3"): 5.0,
            (t3, "H3"): 15.0,
            (t1, "H4"): 1.5,
            (t2, "H4"): 3.0,
            (t3, "H4"): 12.0,
            (t1, "L1"): 0.8,
            (t2, "L1"): 1.5,
            (t3, "L1"): 2.5,
            (t1, "L2"): 0.6,
            (t2, "L2"): 1.2,
            (t3, "L2"): 2.0,
            (t1, "L3"): 0.5,
            (t2, "L3"): 1.0,
            (t3, "L3"): 1.8,
            (t1, "L4"): 0.4,
            (t2, "L4"): 0.8,
            (t3, "L4"): 1.5,
            (t1, "L5"): 0.20,
            (t2, "L5"): 0.6,
            (t3, "L5"): 1.2,
        }
        self.paytable = self.convert_range_table(pay_group)

        scatter_pay_group = {
            (s1, "S"): 4.0,
            (s2, "S"): 10.0,
            (s3, "S"): 100.0,
        }
        self.scatter_paytable = self.convert_range_table(scatter_pay_group)

        self.include_padding = True
        # No base-game (or any-game) wilds: deliberate design choice, see GAME_SPEC.md.
        self.special_symbols = {"wild": [], "scatter": ["S"], "multiplier": ["M"]}

        # Free Spins trigger (base game entry), scaling with scatter count:
        #   4 -> 10 spins, 5 -> 12, 6+ -> 15
        # Retrigger (during free spins), scaling with scatter count:
        #   3 -> +5, 4 -> +8, 5+ -> +10
        max_scatters_on_board = self.num_reels * max(self.num_rows)  # 30
        self.freespin_triggers = {
            self.basegame_type: {
                4: 10,
                5: 12,
                **{k: 15 for k in range(6, max_scatters_on_board + 1)},
            },
            self.freegame_type: {
                3: 5,
                4: 8,
                **{k: 10 for k in range(5, max_scatters_on_board + 1)},
            },
        }
        self.anticipation_triggers = {
            self.basegame_type: min(self.freespin_triggers[self.basegame_type].keys()) - 1,
            self.freegame_type: min(self.freespin_triggers[self.freegame_type].keys()) - 1,
        }

        # Cosmic Meteor values (freegame only), landing values sum then multiply
        # the whole cascade total for that spin. Weights below are Phase 3
        # placeholders (small values common, big values rare) -- exact
        # frequency/weight tuning to hit 96.5% RTP is Phase 4 work.
        self.mult_values = {
            2: 100,
            3: 80,
            4: 65,
            5: 55,
            6: 45,
            8: 38,
            10: 32,
            12: 24,
            15: 18,
            20: 14,
            25: 10,
            50: 6,
            100: 4,
        }

        # Reels
        reels = {"BR0": "BR0.csv", "ANTE0": "ANTE0.csv", "FR0": "FR0.csv", "WCAP": "WCAP.csv"}
        self.reels = {}
        for r, f in reels.items():
            self.reels[r] = self.read_reels_csv(os.path.join(self.reels_path, f))

        self.padding_reels[self.basegame_type] = self.reels["BR0"]
        self.padding_reels[self.freegame_type] = self.reels["FR0"]

        mode_maxwins = {"base": self.wincap, "ante": self.wincap, "bonus": self.wincap}

        self.bet_modes = [
            # --- Base game -----------------------------------------------------
            BetMode(
                name="base",
                cost=1.0,
                rtp=self.rtp,
                max_win=mode_maxwins["base"],
                auto_close_disabled=False,
                is_feature=True,
                is_buybonus=False,
                distributions=[
                    Distribution(
                        criteria="wincap",
                        quota=0.001,
                        win_criteria=mode_maxwins["base"],
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.freegame_type: {"FR0": 1, "WCAP": 5},
                            },
                            "mult_values": {
                                self.basegame_type: self.mult_values,
                                self.freegame_type: {100: 1},
                            },
                            "scatter_triggers": {6: 1},
                            "force_wincap": True,
                            "force_freegame": True,
                        },
                    ),
                    Distribution(
                        criteria="freegame",
                        quota=0.1,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.freegame_type: {"FR0": 1},
                            },
                            "scatter_triggers": {4: 10, 5: 4, 6: 1},
                            "mult_values": {
                                self.basegame_type: self.mult_values,
                                self.freegame_type: self.mult_values,
                            },
                            "force_wincap": False,
                            "force_freegame": True,
                        },
                    ),
                    Distribution(
                        criteria="0",
                        quota=0.4,
                        win_criteria=0.0,
                        conditions={
                            "reel_weights": {self.basegame_type: {"BR0": 1}},
                            "mult_values": {self.basegame_type: self.mult_values},
                            "force_wincap": False,
                            "force_freegame": False,
                        },
                    ),
                    Distribution(
                        criteria="basegame",
                        quota=0.5,
                        conditions={
                            "reel_weights": {self.basegame_type: {"BR0": 1}},
                            "mult_values": {self.basegame_type: self.mult_values},
                            "force_wincap": False,
                            "force_freegame": False,
                        },
                    ),
                ],
            ),
            # --- Ante-bet ("Double Chance"): 1.25x stake, ~2x scatter frequency -
            BetMode(
                name="ante",
                cost=1.25,
                rtp=self.rtp,
                max_win=mode_maxwins["ante"],
                auto_close_disabled=False,
                is_feature=True,
                is_buybonus=False,
                distributions=[
                    Distribution(
                        criteria="wincap",
                        quota=0.001,
                        win_criteria=mode_maxwins["ante"],
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"ANTE0": 1},
                                self.freegame_type: {"FR0": 1, "WCAP": 5},
                            },
                            "mult_values": {
                                self.basegame_type: self.mult_values,
                                self.freegame_type: {100: 1},
                            },
                            "scatter_triggers": {6: 1},
                            "force_wincap": True,
                            "force_freegame": True,
                        },
                    ),
                    Distribution(
                        criteria="freegame",
                        quota=0.2,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"ANTE0": 1},
                                self.freegame_type: {"FR0": 1},
                            },
                            "scatter_triggers": {4: 10, 5: 4, 6: 1},
                            "mult_values": {
                                self.basegame_type: self.mult_values,
                                self.freegame_type: self.mult_values,
                            },
                            "force_wincap": False,
                            "force_freegame": True,
                        },
                    ),
                    Distribution(
                        criteria="0",
                        quota=0.35,
                        win_criteria=0.0,
                        conditions={
                            "reel_weights": {self.basegame_type: {"ANTE0": 1}},
                            "mult_values": {self.basegame_type: self.mult_values},
                            "force_wincap": False,
                            "force_freegame": False,
                        },
                    ),
                    Distribution(
                        criteria="basegame",
                        quota=0.449,
                        conditions={
                            "reel_weights": {self.basegame_type: {"ANTE0": 1}},
                            "mult_values": {self.basegame_type: self.mult_values},
                            "force_wincap": False,
                            "force_freegame": False,
                        },
                    ),
                ],
            ),
            # --- Bonus buy: instant Free Spins trigger, ~100x bet --------------
            BetMode(
                name="bonus",
                cost=100.0,
                rtp=self.rtp,
                max_win=mode_maxwins["bonus"],
                auto_close_disabled=False,
                is_feature=False,
                is_buybonus=True,
                distributions=[
                    Distribution(
                        criteria="wincap",
                        quota=0.001,
                        win_criteria=mode_maxwins["bonus"],
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.freegame_type: {"FR0": 1, "WCAP": 5},
                            },
                            "mult_values": {
                                self.basegame_type: self.mult_values,
                                self.freegame_type: {100: 1},
                            },
                            "scatter_triggers": {6: 1},
                            "force_wincap": True,
                            "force_freegame": True,
                        },
                    ),
                    Distribution(
                        criteria="freegame",
                        quota=0.999,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.freegame_type: {"FR0": 1},
                            },
                            "scatter_triggers": {4: 10, 5: 5, 6: 1},
                            "mult_values": {
                                self.basegame_type: self.mult_values,
                                self.freegame_type: self.mult_values,
                            },
                            "force_wincap": False,
                            "force_freegame": True,
                        },
                    ),
                ],
            ),
        ]
