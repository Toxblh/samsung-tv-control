const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Samsung TV Control library',
  tagline: 'Library for remote control Samsung TV in your NodeJS application.',
  url: 'https://toxblh.github.io/samsung-tv-control',
  baseUrl: '/',
  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'toxblh',
  projectName: 'samsung-tv-control',
  themeConfig: {
    navbar: {
      title: 'Samsung TV Control',
      logo: {
        src: 'img/logo.svg',
      },
      items: [
        {
          to: 'docs/api/modules',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          href: 'https://github.com/Toxblh/samsung-tv-control',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/Toxblh/samsung-tv-control/tree/master/docs/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    [
      'docusaurus-plugin-typedoc',

      // Plugin / TypeDoc options
      {
        excludePrivate: true,
        entryPoints: ['../src/index.ts'],
        tsconfig: '../tsconfig.json',
      },
    ],
  ],
}
