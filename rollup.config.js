import babel from 'rollup-plugin-babel'
import {uglify} from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'
import pkg from './package.json'
const banner = `/*!
* Reactif - v${pkg.version}
* MIT License
* Copyright (c) 2018 Frenco W. Jobs
*/`

export default [
    {
        input: 'src/index.js',
        external: ['ms'],
        output: [
            {file: pkg.main, format: 'cjs', banner},
            {file: pkg.module, format: 'es', banner},
            {file: pkg.browser, format: 'umd',name:'Reactif', banner}
        ],
        plugins: [
            babel({
                exclude: 'node_modules/**'
            }),
            replace({
                delimiters: ['"', '"'],
                exclude: 'node_modules/**',
                ENV: JSON.stringify("development")
            })
        ]
    },
    {
        input: 'src/index.js',
        external: ['ms'],
        output: [
            {file: 'dist/reactif.umd.min.js', format: 'umd',name:'Reactif', banner}
        ],
        plugins: [
            babel(),
            replace({
                delimiters: ['"', '"'],
                exclude: 'node_modules/**',
                ENV: JSON.stringify("production")
            }),
            uglify()
        ]
    }
]