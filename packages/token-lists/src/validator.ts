import Ajv from 'ajv'
import schema from '../schema/monswap.json'

export const tokenListValidator = new Ajv({ allErrors: true }).compile(schema)
