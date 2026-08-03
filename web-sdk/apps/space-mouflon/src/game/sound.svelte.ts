import { Howl, Howler } from 'howler';

import { stateSoundDerived } from 'state-shared';

import manifest from './audio_manifest.json';

/**
 * Space Mouflon audio pack — 35 individual cues, not a sprite.
 *
 * The SDK's `utils-sound` builds a single Howl over one sprite file; our pack ships a file per
 * cue, so the players are implemented here directly on Howler. The public shape is the one
 * `Sound.svelte` already calls — `players.{music,loop,once}.play({ name })` plus
 * `stop` / `fade` / `rate` / `volumeEffect` / `enableEffect` — so the event wiring is unchanged.
 *
 * OGG is always the first source. Vorbis is sample-exact; LAME adds ~40ms of encoder padding,
 * which is audible as a gap in every `loop: true` cue. MP3 is a fallback for browsers without
 * Vorbis only — do not flip the order.
 */

export type MusicName =
	| 'bgm_main'
	| 'bgm_freespin'
	| 'bgm_winlevel_big'
	| 'bgm_winlevel_epic'
	| 'bgm_winlevel_mega';

export type SoundEffectName =
	| 'jng_intro_fs'
	| 'sfx_bigwin_coinloop'
	| 'sfx_btn_general'
	| 'sfx_btn_spin'
	| 'sfx_multiplier_combine_a'
	| 'sfx_multiplier_landing'
	| 'sfx_multiplier_up'
	| 'sfx_multiplier_win'
	| 'sfx_reel_stop_1'
	| 'sfx_reel_stop_2'
	| 'sfx_reel_stop_3'
	| 'sfx_reel_stop_4'
	| 'sfx_reel_stop_5'
	| 'sfx_reel_stop_6'
	| 'sfx_scatter_stop_1'
	| 'sfx_scatter_stop_2'
	| 'sfx_scatter_stop_3'
	| 'sfx_scatter_stop_4'
	| 'sfx_scatter_win'
	| 'sfx_symbols_landing'
	| 'sfx_winlevel_nice'
	| 'sfx_winlevel_small'
	| 'sfx_winlevel_standard'
	| 'sfx_winlevel_substantial'
	| 'sfx_youwon_panel'
	| 'tumble_win_1'
	| 'tumble_win_2'
	| 'tumble_win_3'
	| 'tumble_win_4'
	| 'tumble_win_5';

export type SoundName = MusicName | SoundEffectName;

type Bus = 'music' | 'sfx' | 'ui';

type ManifestSound = {
	key: SoundName;
	ogg: string;
	mp3: string;
	loop: boolean;
	bus: Bus;
	gain: number;
};

const AUDIO_BASE = '/assets/audio/mouflon';
const BUS_GAIN = manifest.busses as Record<Bus, number>;
const MANIFEST_SOUNDS = manifest.sounds as ManifestSound[];

const createSound = () => {
	type Entry = {
		howl: Howl;
		bus: Bus;
		/** gain * bus gain — the cue's mixed level before the player volume is applied. */
		baseVolume: number;
		/** Set by fade(), so a faded cue keeps its level when the volume slider moves. */
		fadeVolume: number;
	};

	let entries = {} as Record<SoundName, Entry>;
	let musicNames: SoundName[] = [];
	let audioContextState = $state<AudioContext['state']>('running');
	let visibilityState = $state<DocumentVisibilityState>('visible');
	const volumes = $state({ music: 1, soundEffect: 1 });

	const playerVolume = (bus: Bus) => (bus === 'music' ? volumes.music : volumes.soundEffect);

	const applyVolume = (name: SoundName) => {
		const entry = entries[name];
		if (entry) entry.howl.volume(entry.baseVolume * entry.fadeVolume * playerVolume(entry.bus));
	};

	const applyAllVolumes = () => (Object.keys(entries) as SoundName[]).forEach(applyVolume);

	const load = () => {
		entries = {} as Record<SoundName, Entry>;
		musicNames = [];

		MANIFEST_SOUNDS.forEach((item) => {
			entries[item.key] = {
				howl: new Howl({
					// ogg first — see the note at the top of this file
					src: [`${AUDIO_BASE}/${item.ogg}`, `${AUDIO_BASE}/${item.mp3}`],
					loop: item.loop,
					volume: item.gain * BUS_GAIN[item.bus],
					// stream the long beds, preload everything that has to fire on cue
					preload: item.bus !== 'music',
				}),
				bus: item.bus,
				baseVolume: item.gain * BUS_GAIN[item.bus],
				fadeVolume: 1,
			};

			if (item.bus === 'music') musicNames.push(item.key);
		});

		// volumeEffect()'s first pass runs at component init, before load() has built the map, so
		// seed the current slider values here — otherwise a cue keeps its unscaled level until
		// the first time it is played.
		volumes.music = stateSoundDerived.volumeMusic();
		volumes.soundEffect = stateSoundDerived.volumeSoundEffect();
		applyAllVolumes();

		const onAudioContextChange = () => (audioContextState = Howler.ctx.state);
		const onVisibilityStateChange = () => (visibilityState = document.visibilityState);

		Howler.ctx.addEventListener('statechange', onAudioContextChange);
		document.addEventListener('visibilitychange', onVisibilityStateChange);

		const destroy = () => {
			Howler.ctx.removeEventListener('statechange', onAudioContextChange);
			document.removeEventListener('visibilitychange', onVisibilityStateChange);
			(Object.values(entries) as Entry[]).forEach((entry) => entry.howl.unload());
			entries = {} as Record<SoundName, Entry>;
		};

		return { destroy };
	};

	/**
	 * The long beds are registered with `preload: false` so they are not fetched during boot.
	 * Howler's `play()` does NOT load an unloaded sound — it queues the play and waits for a
	 * `load` that never comes — so the first play has to ask for the fetch explicitly. The
	 * queued play then fires on the load event.
	 */
	const ensureLoaded = (entry: Entry) => {
		if (entry.howl.state() === 'unloaded') entry.howl.load();
	};

	const playMusic = ({ name }: { name: MusicName }) => {
		const entry = entries[name];
		if (!entry) return;

		// One bed at a time: pause the others so they can resume where they left off.
		musicNames.forEach((musicName) => {
			if (musicName !== name) entries[musicName]?.howl.pause();
		});

		if (!entry.howl.playing()) {
			entry.fadeVolume = 1;
			ensureLoaded(entry);
			entry.howl.play();
			applyVolume(name);
		}
	};

	const playLoop = ({ name }: { name: SoundEffectName }) => {
		const entry = entries[name];
		if (!entry || entry.howl.playing()) return;
		entry.fadeVolume = 1;
		ensureLoaded(entry);
		entry.howl.play();
		applyVolume(name);
	};

	const playOnce = ({ name, forcePlay }: { name: SoundEffectName; forcePlay?: boolean }) => {
		const entry = entries[name];
		if (!entry) return;
		if (entry.howl.playing() && !forcePlay) return;
		entry.fadeVolume = 1;
		ensureLoaded(entry);
		entry.howl.play();
		applyVolume(name);
	};

	const stop = ({ name }: { name: SoundName }) => {
		const entry = entries[name];
		if (entry) entry.howl.stop();
	};

	const fade = async ({
		name,
		from,
		to,
		duration,
	}: {
		name: SoundName;
		from: number;
		to: number;
		duration: number;
	}) => {
		const entry = entries[name];
		if (!entry) return;
		const scale = entry.baseVolume * playerVolume(entry.bus);
		entry.fadeVolume = to;
		entry.howl.fade(from * scale, to * scale, duration);
	};

	const rate = ({ name, rate: rateValue }: { name: SoundName; rate: number }) => {
		const entry = entries[name];
		if (entry) entry.howl.rate(rateValue);
	};

	const enableEffect = () => {
		$effect(() => {
			if (audioContextState === 'running' && visibilityState === 'visible') {
				Howler.volume(1);
				Howler.mute(false);
			} else {
				Howler.volume(0);
				Howler.mute(true);
			}
		});
	};

	// Keeps the shared UI's music / sfx volume sliders and the mute switch driving our cues.
	const volumeEffect = () => {
		$effect(() => {
			volumes.music = stateSoundDerived.volumeMusic();
			volumes.soundEffect = stateSoundDerived.volumeSoundEffect();
			applyAllVolumes();
		});
	};

	const players = {
		music: { play: playMusic },
		loop: { play: playLoop },
		once: { play: playOnce },
	};

	return {
		load,
		stop,
		fade,
		rate,
		enableEffect,
		volumeEffect,
		get players() {
			return players;
		},
	};
};

const sound = createSound();

export { sound };
