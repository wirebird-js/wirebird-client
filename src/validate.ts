import { SerializedLoggerEvent } from './SerializedTypes';
import { validate as schemaValidate, ValidatorResult } from 'jsonschema';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const schema = require('./schemas/SerializedLoggerEvent.json');

export const validate = (data: SerializedLoggerEvent): ValidatorResult => {
    return schemaValidate(data, schema, { nestedErrors: true });
};
