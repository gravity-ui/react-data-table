/* eslint-env node */
import * as React from 'react';
import {Meta, Story} from '@storybook/react';
import DataTable from '../lib';
import ExampleDT100, {defaultProps, ExampleProps} from './Example/Example';
import {FIXED, LEGACY_THEME, MOVING, YCLOUD_THEME} from '../lib/constants';

export default {
    title: 'React Data Table',
    component: DataTable,
} as Meta;

const Template = (args: ExampleProps) => <ExampleDT100 {...args} />;

export const Default: Story<ExampleProps> = Template.bind({});
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
