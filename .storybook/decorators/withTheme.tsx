import {useTheme} from '@gravity-ui/uikit';
import {StoryContext, Story as StoryType} from '@storybook/react';
import React from 'react';

export function withTheme(Story: StoryType, context: StoryContext) {
    const themeValue = context.globals.theme;
    const [theme, setTheme] = useTheme(); // eslint-disable-line react-hooks/rules-of-hooks

    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
        if (theme !== themeValue) {
            setTheme(themeValue);
        }
    }, [theme, themeValue, setTheme]);

    return <Story {...context} />;
}
