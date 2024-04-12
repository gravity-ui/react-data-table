import React from 'react';

import DataTable from '../../lib/DataTable';
import {YCLOUD_THEME} from '../../lib/constants';
import type {Column, DataTableProps} from '../../lib/types';
import {
    GetSavedColumnWidthByName,
    SaveColumnWidthByName,
    updateColumnsWidth,
    useTableResize,
} from '../../lib/useTableResize';
import {cn} from '../../lib/util';

import './Resizeable.scss';

const b = cn('resizeable-datable-example');

const data = Array(5)
    .join('|')
    .split('|')
    .map((_empty, index) => {
        return {
            id: index + 1,
            number: index + 123456789101112,
            col1: index % 23,
            col2: index % 13,
            string: `some_very_long_line_${index + 1}`,
            complex: {
                value: index + 5,
            },
            bar: Math.pow(index * 20 - 250, 2) / 500,
            something1: index + 123456789101112,
            something2: index + 123456789101112,
        };
    });

type RowType = typeof data[number];

const columns: Column<RowType>[] = [
    {
        name: 'number',
    },
    {
        name: 'col1',
    },
    {
        name: 'col2',
    },
    {
        name: 'string',
        width: 100,
        resizeMaxWidth: 200,
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
        width: 150,
        resizeMinWidth: 100,
    },
    {
        name: 'bar',
        render: ({value}) => (
            <div style={{width: value as number, height: 10, background: '#18b0ff'}} />
        ),
        resizeable: false,
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
                        resizeable: false,
                    },
                    {
                        name: 'sub2-2',
                        sub: [
                            {
                                name: 'sub3-1',
                                accessor: 'something1',
                            },
                        ],
                    },
                ],
            },
            {
                name: 'something2',
            },
        ],
    },
];

const COLUMNS_WIDTH_LOCAL_STORAGE_KEY = 'resizeableTable';

export function ResizeableTable({theme = YCLOUD_THEME, ...props}: DataTableProps<RowType>) {
    const getColumnsWidth: GetSavedColumnWidthByName = React.useCallback(() => {
        try {
            const rawData = localStorage.getItem(COLUMNS_WIDTH_LOCAL_STORAGE_KEY);
            return rawData ? JSON.parse(rawData) : {};
        } catch {
            return {};
        }
    }, []);

    const saveColumnsWidth: SaveColumnWidthByName = React.useCallback((value) => {
        localStorage.setItem(COLUMNS_WIDTH_LOCAL_STORAGE_KEY, JSON.stringify(value));
    }, []);

    const [tableColumnsWidthSetup, setTableColumnsWidth] = useTableResize({
        getSizes: getColumnsWidth,
        saveSizes: saveColumnsWidth,
    });

    const updatedColumns = updateColumnsWidth(columns, tableColumnsWidthSetup);

    return (
        <div className={b('table')}>
            <DataTable
                {...props}
                theme={theme}
                data={data}
                columns={updatedColumns}
                onResize={setTableColumnsWidth}
                settings={{defaultResizeable: true}}
            />
        </div>
    );
}
