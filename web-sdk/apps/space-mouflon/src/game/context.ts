import { setContextEventEmitter, getContextEventEmitter } from 'utils-event-emitter';
import { setContextXstate, getContextXstate } from 'utils-xstate';
import { setContextLayout, getContextLayout } from 'utils-layout';
import { setContextApp, getContextApp } from 'pixi-svelte';

import { eventEmitter, type EmitterEvent } from './eventEmitter';
import { stateXstate, stateXstateDerived } from './stateXstate';
import { stateLayout, stateLayoutDerived } from './stateLayout';
import { stateApp } from './stateApp';

import { stateGame, stateGameDerived } from './stateGame.svelte';
// Side-effect import: assigns this game's bet modes and rules over the state-shared defaults.
// context.ts is the one module every entry path loads — SvelteKit routes, every story, and the
// production build — which is what makes the metadata universally present.
import './meta';
// Side-effect import: registers the bundled Figtree @font-face. Must live here, not in
// global.scss — GlobalStyle.svelte is rendered only from routes/+layout.svelte, so Storybook
// would never load it. context.ts is the one module every entry path touches.
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/600.css';
import '@fontsource/figtree/700.css';

import { i18nDerived } from '../i18n/i18nDerived';

export const setContext = () => {
	setContextEventEmitter<EmitterEvent>({ eventEmitter });
	setContextXstate({ stateXstate, stateXstateDerived });
	setContextLayout({ stateLayout, stateLayoutDerived });
	setContextApp({ stateApp });
};

export const getContext = () => ({
	...getContextEventEmitter<EmitterEvent>(),
	...getContextLayout(),
	...getContextXstate(),
	...getContextApp(),
	stateGame,
	stateGameDerived,
	i18nDerived,
});
