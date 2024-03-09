const { getJestProjects } = require('@nrwl/jest');
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
// @ts-expect-error
global.TextDecoder = TextDecoder

export default {
  projects: getJestProjects(),
};
