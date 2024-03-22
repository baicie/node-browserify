import path from 'node:path'

export const rootPath = path.resolve(__dirname, '../../')
export const pkgsPath = path.resolve(rootPath, 'packages')
export const toolsPath = path.resolve(rootPath, 'tools')
export const nodeLibPath = path.resolve(pkgsPath, 'node-lib')
