import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import DataTable from '../lib';
import {FIXED, LEGACY_THEME, MOVING, YCLOUD_THEME} from '../lib/constants';

import ExampleDT100, {defaultProps} from './Example/Example';

export default {
    title: 'React Data Table',
    component: DataTable,
} as Meta<typeof DataTable>;

//const Template = (args: ExampleProps) => <ExampleDT100 {...args} />;

const Template: StoryFn<typeof DataTable> = (args) => <ExampleDT100 {...args} />;

export const Default = Template.bind({});
Default.args = defaultProps;
Default.argTypes = {
    stickyHeadValues: {
        options: [MOVING, FIXED],
        control: {type: 'select'},
    },
    dynamicRenderType: {
        options: ['simple', 'uniform', 'variable'],
    },
    theme: {
        options: [LEGACY_THEME, YCLOUD_THEME],
        control: {type: 'select'},
    },
};
