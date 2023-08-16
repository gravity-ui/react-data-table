import type {StorybookConfig} from '@storybook/react-webpack5';
const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        '@storybook/addon-links',
        {name: '@storybook/addon-essentials', options: {backgrounds: false}},
        '@storybook/addon-interactions',
        '@storybook/preset-scss',
    ],
    framework: {
        name: '@storybook/react-webpack5',
        options: {fastRefresh: true},
    },
    docs: {
        autodocs: 'tag',
        defaultName: 'Docs',
    },
};
export default config;
