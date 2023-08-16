import React from 'react';

import type {Preview, Decorator} from '@storybook/react';
import '@gravity-ui/uikit/styles/styles.scss';

import {ThemeProvider, MobileProvider, configure as uikitConfigure} from '@gravity-ui/uikit';

export const withContextProvider: Decorator = (StoryItem, context) => {
    return (
        <React.StrictMode>
            <ThemeProvider theme={context.globals.theme}>
                <MobileProvider>
                    <StoryItem {...context} />
                </MobileProvider>
            </ThemeProvider>
        </React.StrictMode>
    );
};

export const withLang: Decorator = (StoryItem, context) => {
    const lang = context.globals.lang;
    uikitConfigure({lang});

    return <StoryItem {...context} />;
};

const preview: Preview = {
    decorators: [withContextProvider, withLang],
    parameters: {
        actions: {argTypesRegex: '^on[A-Z].*'},
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
    },
    globalTypes: {
        lang: {
            name: 'Language',
            defaultValue: 'ru',
            toolbar: {
                icon: 'globe',
                items: [
                    {value: 'ru', right: '🇷🇺', title: 'Ru'},
                    {value: 'en', right: '🇺🇸', title: 'En'},
                ],
            },
        },
        theme: {
            name: 'Theme',
            defaultValue: 'light',
            toolbar: {
                icon: 'mirror',
                items: [
                    {title: 'light', value: 'light'},
                    {title: 'dark', value: 'dark'},
                    {title: 'light-hc', value: 'light-hc'},
                    {title: 'dark-hc', value: 'dark-hc'},
                ],
            },
        },
    },
};

export default preview;
