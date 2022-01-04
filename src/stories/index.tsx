/* eslint-env node */
import * as React from 'react';
import {Meta, Story} from '@storybook/react';
import DataTable from '../lib';
import ExampleDT100, {defaultProps, ExampleProps} from './Example/Example';

export default {
    title: 'React Data Table',
    component: DataTable,
} as Meta;

const Template = (args: ExampleProps) => <ExampleDT100 {...args} />;

export const Default: Story<ExampleProps> = Template.bind({});
Default.args = defaultProps;
