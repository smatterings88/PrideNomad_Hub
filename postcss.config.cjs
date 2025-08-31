// Force-CJS PostCSS config to avoid ESM discovery issues
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    // Debug plugin: prints plugin chain to build logs
    function debugPlugin() {
      return {
        postcssPlugin: 'debug-plugin',
        Once(_, { result }) {
          const names = result.processor.plugins.map(p => p.postcssPlugin);
          console.log('[postcss] plugins:', names);
        },
      };
    }
  ],
};
module.exports.postcss = true; // hint for postcss-load-config
