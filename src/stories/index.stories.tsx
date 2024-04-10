import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import {FIXED, LEGACY_THEME, MOVING, YCLOUD_THEME} from '../lib/constants';

import ExampleDT100, {defaultProps} from './Example/Example';
import {ResizeableTable} from './Resizeable/Resizeable';

export default {
    title: 'React Data Table',
    component: ExampleDT100,
} as Meta<typeof ExampleDT100>;

const templateArgTypes = {
    stickyHeadValues: {
        options: [MOVING, FIXED],
        control: {type: 'select'},
    },
    dynamicRenderType: {
        options: ['simple', 'uniform', 'variable'],
    },
    theme: {
        options: [LEGACY_THEME, YCLOUD_THEME] as const,
        control: {type: 'select'},
    },
};

const Template: StoryFn<typeof ExampleDT100> = (args) => <ExampleDT100 {...args} />;

export const Default = Template.bind({});
Default.args = defaultProps;
Default.argTypes = templateArgTypes;

const ResizeableTemplate: StoryFn<typeof ResizeableTable> = (args) => <ResizeableTable {...args} />;

export const Resizeable = ResizeableTemplate.bind({});
Default.args = {theme: YCLOUD_THEME};
Default.argTypes = templateArgTypes;
