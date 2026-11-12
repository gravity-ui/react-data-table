import {Provider} from '@gravity-ui/uikit';
import '@gravity-ui/uikit/styles/styles.scss';
import type {Decorator, Preview} from '@storybook/react';
import React from 'react';

export const withContextProvider: Decorator = (StoryItem, context) => {
    return (
        <React.StrictMode>
            <Provider theme={context.globals.theme} lang={context.globals.lang}>
                <StoryItem {...context} />
            </Provider>
        </React.StrictMode>
    );
};

const preview: Preview = {
    decorators: [withContextProvider],
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
