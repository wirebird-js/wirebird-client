import { WIREBIRD_DEFAULT_HOST } from './constants';

interface ModeSimple {
    type: 'curl' | 'pretty' | 'disabled';
}
interface ModeUI {
    type: 'ui';
    url: string;
}
export type Mode = ModeUI | ModeSimple;

export const getMode = (envStr: string): Mode => {
    if (envStr === 'curl') {
        return { type: 'curl' };
    }
    if (envStr === 'pretty') {
        return { type: 'pretty' };
    }

    const defaultURL = WIREBIRD_DEFAULT_HOST;
    const uiPrefix = 'ui:';

    if (envStr === 'ui') {
        return {
            type: 'ui',
            url : defaultURL,
        };
    }

    if (envStr.startsWith(uiPrefix)) {
        return {
            type: 'ui',
            url : envStr.substr(uiPrefix.length) || defaultURL,
        };
    }
    return {
        type: 'disabled',
    };
};
