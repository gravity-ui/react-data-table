import * as React from 'react';
import DataTable, {Column} from '../../lib';

const data = new Array(500)
    .join('|')
    .split('|')
    .map((_empty, index) => {
        return {
            id: index + 1,
            number: index + 1,
            col1: index % 23,
            col2: index % 13,
            string: `line_${index + 1}`,
            complex: {
                value: index + 5,
            },
            bar: Math.pow(index - 250, 2) / 500,
            something: 1,
        };
    });

const footerData = new Array(4)
    .join('|')
    .split('|')
    .map((_empty, index) => {
        return {
            number: index + 1,
            string: `footer_${index + 1}`,
            complex: {
                value: index + 5,
            },
            bar: Math.pow(index - 250, 2) / 500,
            something: 1,
        };
    });

const headerData = [2, 0]
    .join('|')
    .split('|')
    .map((_empty, index) => {
        return {
            number: index + 1,
            string: `header_${index + 1}`,
            complex: {
                value: index + 5,
            },
            bar: Math.pow(index - 250, 2) / 500,
            something: 1,
        };
    });

type RowType = typeof data[number] | typeof headerData[number];
const columns: Column<RowType>[] = [
    {
        name: 'number',
    },
    {
        name: 'col1',
        group: true,
    },
    {
        name: 'col2',
    },
    {
        name: 'string',
        onClick: ({row, index}) => {
            alert(`Click on row #${index}: ${row.string}`);
        },
    },
    {
        name: 'complex',
        render: ({value}) => JSON.stringify(value, null, 2),
        defaultOrder: DataTable.DESCENDING,
        sortAscending: (item1, item2) => {
            const value1 = item1.row.complex.value;
            const value2 = item2.row.complex.value;
            return (value1 % 2) - (value2 % 2) || value1 - value2;
        },
    },
    {
        name: 'bar',
        // eslint-disable-next-line react/display-name
        render: ({value}) => (
            <div style={{width: value as number, height: 10, background: '#18b0ff'}} />
        ),
    },
    {
        name: 'multiLevel',
        sub: [
            {
                name: 'sub1-1',
                customStyle: () => ({backgroundColor: 'wheat', fontSize: '1.2em'}),
                sub: [
                    {
                        name: 'sub2-1',
                    },
                    {
                        name: 'sub2-2',
                        sub: [
                            {
                                name: 'sub3-1',
                                accessor: 'something',
                            },
                        ],
                    },
                ],
            },
            {
                name: 'sub1-2',
            },
        ],
    },
];

export {data, columns, footerData, headerData};
