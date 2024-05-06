import React from 'react';

import type {Column, HandleResize} from './types';

export type ColumnWidthByName = Record<string, number>;
export type SaveColumnWidthByName = (data: ColumnWidthByName) => void;
export type GetSavedColumnWidthByName = () => ColumnWidthByName;

export function updateColumnsWidth<T>(
    columns: Column<T>[],
    columnsWidthSetup: ColumnWidthByName,
): Column<T>[] {
    return columns.map((column) => {
        let sub: Column<T>[] | undefined;

        if (column.sub) {
            sub = updateColumnsWidth(column.sub, columnsWidthSetup);
        }

        const newWidth = columnsWidthSetup[column.name] ?? column.width;

        return {...column, width: newWidth, sub};
    });
}

export function useTableResize({
    saveSizes,
    getSizes,
}: {
    saveSizes: SaveColumnWidthByName;
    getSizes: GetSavedColumnWidthByName;
}): [ColumnWidthByName, HandleResize] {
    const [tableColumnsWidthSetup, setTableColumnsWidth] = React.useState<ColumnWidthByName>(() => {
        return getSizes();
    });

    const handleSetupChange: HandleResize = React.useCallback(
        (columnId, columnWidth) => {
            setTableColumnsWidth((previousSetup) => {
                const setup = {
                    ...previousSetup,
                    [columnId]: columnWidth,
                };
                saveSizes(setup);
                return setup;
            });
        },
        [saveSizes],
    );

    return [tableColumnsWidthSetup, handleSetupChange];
}
