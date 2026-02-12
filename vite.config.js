import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Determine base path based on environment variable or mode
  const isPublicBuild = process.env.VITE_PUBLIC_BUILD === 'true';
  let basePath = '/';
  
  if (mode === 'production') {
    basePath = isPublicBuild ? '/VSMeter/' : '/SAPLAUM/VSMeter/';
  }
  
  return {
    plugins: [vue()],
    base: basePath,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    }
  };
})
