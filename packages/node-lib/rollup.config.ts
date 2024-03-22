import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import glob from 'fast-glob'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { RollupOptions } from 'rollup'
import { defineConfig } from 'rollup'
import { nodeLibPath } from '@node-browserify/constant'

const tsconfig = JSON.parse(readFileSync('./tsconfig.lib.json', 'utf8'))
const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 获取 paths 配置
const paths: { [key: string]: string[] } = tsconfig.compilerOptions.paths

function createConfig(isProduction: boolean): RollupOptions {
  const { globSync } = glob
  const files = globSync('lib/**/*.{js,ts}', {
    onlyFiles: true,
    cwd: process.cwd(),
  })

  const aliasEntries = [
    {
      find: 'internal/deps',
      replacement: path.resolve(__dirname, '../../deps'),
    },
    {
      find: 'readline/promises',
      replacement: path.resolve(__dirname, './lib/readline/promises.js'),
    },
    {
      find: 'timers/promises',
      replacement: path.resolve(__dirname, './lib/timers/promises.js'),
    },
    {
      find: 'stream/promises',
      replacement: path.resolve(__dirname, './lib/stream/promises.js'),
    },
    {
      find: 'fs/promises',
      replacement: path.resolve(__dirname, './lib/fs/promises.js'),
    },
    {
      find: 'dns/promises',
      replacement: path.resolve(__dirname, './lib/dns/promises.js'),
    },
    {
      find: 'util/types',
      replacement: path.resolve(__dirname, './lib/util/types.js'),
    },
    ...Object.entries(paths).map(([find, [replacement]]) => {
      const updatedReplacement = path.resolve(
        __dirname,
        replacement.replace('/*', ''),
      )
      const updatedFind = find.replace('/*', '')
      return { find: updatedFind, replacement: updatedReplacement }
    }),
  ]

  return defineConfig({
    input: files,
    plugins: [
      alias({
        entries: aliasEntries,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.lib.json',
        compilerOptions: {
          baseUrl: './',
          outDir: './dist',
          composite: true,
          declaration: true,
        },
      }),
    ],
    output: {
      dir: './dist',
      exports: 'named',
      format: 'esm',
      externalLiveBindings: false,
      freeze: false,
      sourcemap: isProduction ? false : 'inline',
      preserveModules: true,
      preserveModulesRoot: path.resolve(nodeLibPath, 'lib'),
    },
    onwarn(warning, warn) {
      if (warning.message.includes('plugin typescript')) return
      warn(warning)
    },
  })
}

export default (commandLineArgs: any): RollupOptions[] => {
  const isDev = commandLineArgs.watch
  const isProduction = !isDev

  return defineConfig([createConfig(isProduction)])
}
