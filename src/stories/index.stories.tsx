import type {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import {FIXED, LEGACY_THEME, MOVING, YCLOUD_THEME} from '../lib/constants';

import ExampleDT100, {defaultProps} from './Example/Example';
import {ResizeableTable} from './Resizeable/Resizeable';

const meta: Meta<typeof ExampleDT100> = {
    title: 'React Data Table',
    component: ExampleDT100,
};

export default meta;

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

export const Default: StoryFn<typeof ExampleDT100> = Template.bind({});
Default.args = defaultProps;
Default.argTypes = templateArgTypes;

const ResizeableTemplate: StoryFn<typeof ResizeableTable> = (args) => <ResizeableTable {...args} />;

export const Resizeable: StoryFn<typeof ResizeableTable> = ResizeableTemplate.bind({});
Resizeable.args = {theme: YCLOUD_THEME};
Resizeable.argTypes = templateArgTypes;
