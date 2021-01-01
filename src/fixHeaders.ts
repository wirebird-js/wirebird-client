import { OutgoingHttpHeader, OutgoingHttpHeaders } from 'http';

interface BrokenHeader {
    [key: string]: string;
}

interface BrokenHeaders {
    [key: string]: OutgoingHttpHeader | BrokenHeader | undefined;
}

const fixHeaderValue = (
    brokenValue: OutgoingHttpHeader | BrokenHeader | undefined
): OutgoingHttpHeader | undefined => {
    if (typeof brokenValue === 'object' && !Array.isArray(brokenValue)) {
        return Object.keys(brokenValue).map((key) => brokenValue[key]);
    }
    return brokenValue;
};

export const fixHeaders = (
    brokenHeaders: BrokenHeaders
): OutgoingHttpHeaders => {
    const output: OutgoingHttpHeaders = {};

    for (const key of Object.keys(brokenHeaders)) {
        output[key] = fixHeaderValue(brokenHeaders[key]);
    }

    return output;
};
