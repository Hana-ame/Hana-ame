# init

```sh
npm create vite@latest .
```
and follow the hints.

## general settings

vite.config.ts
```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    sourcemap: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        // rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias:{
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

Cannot find module 'path' or its corresponding type declarations.ts(2307)
```sh
npm i @types/node -D 
```

@path gives error in syntax check
```json
{  
  "compilerOptions": {
    "paths": { "@/*":["./src/*"] },
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue", "types/*"],  
}
 ```
 
 follow README.md to disable builtin javascript and typescript extentions.