import {ASCENDING, DESCENDING} from './constants';
import {ColumnExtended, NameToOrderTypeMap, SortOrderWithSortColumns} from './DataTable';

import {OrderType, Settings, SortOrder, SortedDataItem, Comparator} from './types';

export type SlimColumn = {name: string; defaultOrder?: OrderType};

export function getSortOrder(
    {name: columnName, defaultOrder: columnDefaultOrder}: SlimColumn,
    {sortOrder = {}, sortColumns = []}: Partial<SortOrderWithSortColumns>,
    multiColumnSort = false,
    {
        defaultOrder: settingsDefaultOrder,
        disableSortReset,
    }: {defaultOrder?: OrderType; disableSortReset?: boolean} = {},
) {
    const defaultOrder = columnDefaultOrder || settingsDefaultOrder;
    const emptyResult = {
        sortOrder: {},
        sortColumns: [],
    };

    if (!columnName) {
        return multiColumnSort ? {sortOrder, sortColumns} : emptyResult;
    }

    let newColumns = sortColumns;
    const prevOrder = sortOrder[columnName];

    let order = defaultOrder;
    if (prevOrder) {
        if (prevOrder === defaultOrder || disableSortReset) {
            order = prevOrder === ASCENDING ? DESCENDING : ASCENDING;
        } else {
            // reset sort order if previously was set non-default
            order = undefined;
        }
    }

    if (!multiColumnSort) {
        return order
            ? {
                  sortOrder: {[columnName]: order},
                  sortColumns: [columnName],
              }
            : emptyResult;
    }

    const {[columnName]: _, ...newOrder} = sortOrder; // eslint-disable-line no-unused-vars

    if (order) {
        newOrder[columnName] = order;
        if (!new Set(sortColumns).has(columnName)) {
            newColumns = [...sortColumns, columnName];
        }
    } else {
        newColumns = sortColumns.filter((name) => name !== columnName);
    }

    return {
        sortOrder: newOrder,
        sortColumns: newColumns,
    };
}

interface SortingFunctionFlags {
    nullBeforeNumbers?: boolean;
    externalSort?: boolean;
}

function generateSortingFunction<T>(
    column: ColumnExtended<T>,
    order: OrderType,
    flags: SortingFunctionFlags = {},
): Comparator<T> {
    const compareValue = order;
    const {sortAscending} = column;
    if (typeof sortAscending === 'function') {
        return (row1, row2) => {
            return compareValue * sortAscending(row1, row2);
        };
    }

    return (row1, row2) => {
        const value1 = column._getSortValue(row1.row);
        const value2 = column._getSortValue(row2.row);

        /* eslint-disable no-eq-null, eqeqeq */
        // Comparison with null made here intentionally
        // to exclude multiple comparison with undefined and null
        if (value1 == null && value2 != null) {
            return flags.nullBeforeNumbers ? -compareValue : 1;
        }
        if (value2 == null && value1 != null) {
            return flags.nullBeforeNumbers ? compareValue : -1;
        }
        /* eslint-enable no-eq-null, eqeqeq */

        if (value1 < value2) {
            return Number(-compareValue);
        }
        if (value1 > value2) {
            return Number(compareValue);
        }
        return 0;
    };
}

export function getSortedData<T>(
    data: T[],
    dataColumns: ColumnExtended<T>[],
    {sortOrder, sortColumns}: SortOrderWithSortColumns,
    sortingFunctionFlags: SortingFunctionFlags,
): SortedDataItem<T>[] {
    const sortFunctionDict: {[colName: string]: Comparator<T>} = {};
    dataColumns.forEach((column) => {
        if (sortOrder[column.name]) {
            sortFunctionDict[column.name] = generateSortingFunction(
                column,
                sortOrder[column.name],
                sortingFunctionFlags,
            );
        } else if (column.group && column.autogroup) {
            sortFunctionDict[column.name] = generateSortingFunction(
                column,
                ASCENDING,
                sortingFunctionFlags,
            );
        }
    });

    const groupColumns = dataColumns.filter((column) => column.group);
    const hasGroupColumns = groupColumns.length > 0;

    // primarily sort data by group columns, then by user sort
    const sortFunctions = [
        ...groupColumns.map((column) => sortFunctionDict[column.name]).filter(Boolean),
        ...sortColumns.map((name) => sortFunctionDict[name]).filter(Boolean),
    ];

    // add 'span' map into data for grouping purposes
    const indexedData: SortedDataItem<T>[] = data.map((row, index) =>
        hasGroupColumns ? {row, index, span: {}} : {row, index},
    );
    if (sortFunctions.length && !sortingFunctionFlags.externalSort) {
        indexedData.sort((row1, row2) => {
            let comparison = 0;
            sortFunctions.some((sort) => {
                comparison = sort(row1, row2);
                return Boolean(comparison);
            });
            return comparison || row1.index - row2.index;
        });
    }

    // calculate grouping
    if (indexedData.length > 1 && hasGroupColumns) {
        const baseRows: SortedDataItem<T>[] = [];
        const baseValues: unknown[] = [];
        indexedData.forEach((row) => {
            groupColumns.every((column, index) => {
                const value = column._getValue(row.row);
                if (baseRows[index] && value === baseValues[index]) {
                    baseRows[index].span![column.name] += 1;
                    row.span![column.name] = 0;
                    return true;
                } else {
                    // when column value changed we have to reset not only this column base row,
                    // but base rows for all rest columns
                    groupColumns.slice(index).forEach((aColumn, aIndex) => {
                        baseRows[index + aIndex] = row;
                        baseValues[index + aIndex] = aColumn._getValue(row.row);
                        row.span![aColumn.name] = 1;
                    });
                    return false;
                }
            });
        });
    }

    return indexedData;
}

type ExternalSortOrderType = SortOrder | SortOrder[];
export function externalToInternalSortOrder(columns: ExternalSortOrderType, settings?: Settings) {
    const columnList = Array.isArray(columns) ? columns : [columns];
    return columnList.reduce(
        (result, {columnId, order}) => {
            return getSortOrder({name: columnId, defaultOrder: order}, result, true, settings);
        },
        {sortOrder: {}, sortColumns: []} as ReturnType<typeof getSortOrder>,
    );
}

export function internalToExternalSortOrder(sortOrder: NameToOrderTypeMap) {
    return Object.keys(sortOrder).map((columnId) => {
        return {
            columnId,
            order: sortOrder[columnId],
        };
    });
}
