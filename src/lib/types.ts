import * as React from 'react';
import ReactList from 'react-list';

import type {TableRowProps} from './DataTable';
import {
    ASCENDING,
    CENTER,
    DESCENDING,
    FIXED,
    LEFT,
    LEGACY_THEME,
    MOVING,
    RIGHT,
    YCLOUD_THEME,
} from './constants';

type HeaderData<T> = T & {headerIndex?: number};
type FooterData<T> = T & {footerIndex?: number};

export interface DataTableProps<T> {
    columns: Column<T>[];
    headerData?: HeaderData<T>[];
    data: T[];
    footerData?: FooterData<T>[];
    startIndex?: number;
    settings?: Settings;
    emptyDataMessage?: string;
    rowClassName?: (
        row: T,
        index: number,
        isFooterData?: boolean,
        isHeaderData?: boolean,
    ) => string;
    renderEmptyRow?: (columns: DataTableProps<T>['columns']) => React.ReactNode;
    rowKey?: (row: T, index: number) => string | number;
    visibleRowIndex?: (row: T, index: number) => number;
    initialSortOrder?: SortOrder | SortOrder[];
    sortOrder?: SortOrder | SortOrder[];

    theme: THEMES | string;
    onSort?: (sortOrder: DataTableProps<T>['initialSortOrder']) => void;

    onResize?: HandleResize;

    onRowClick?: (row: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void;

    onError?: (error: unknown) => void;

    nullBeforeNumbers?: boolean;

    getColSpansOfRow?: (
        p: Omit<TableRowProps<T>, 'getColSpansOfRow' | 'onClick' | 'className'>,
    ) => {[colName: string]: number} | undefined;
}

export interface Column<T> {
    name: string;
    header?: React.ReactNode;
    headerTitle?: string;
    className?: string;
    width?: number | string;
    align?: AlignType;

    accessor?: string | ((row: T) => any);
    title?: string | ((row: T) => string);
    render?: (props: {
        value?: unknown;
        row: T;
        index: number;
        footer?: boolean;
        headerData?: boolean;
    }) => React.ReactNode;
    customStyle?: (props: CustomStyleParams<T>) => React.CSSProperties;
    onClick?: (
        data: {row: T; index: number; footer?: boolean; headerData?: boolean},
        column: Column<T>,
        event: React.MouseEvent<HTMLTableCellElement>,
    ) => void;

    sortable?: boolean;
    defaultOrder?: OrderType;
    sortAccessor?: string | ((row: T) => any);
    sortAscending?: Comparator<T>;
    sub?: Column<T>[];
    group?: boolean;
    autogroup?: boolean;

    resizeable?: boolean;
    resizeMinWidth?: number;
    resizeMaxWidth?: number;
}

export type DynamicInnerRefT = ReactList;

export interface Settings {
    displayIndices?: boolean;
    stickyHead?: HeadPosition;
    stickyTop?: 'auto' | number;
    syncHeadOnResize?: boolean;
    maxIndex?: number;

    stickyFooter?: HeadPosition;
    stickyBottom?: 'auto' | number;

    dynamicRender?: boolean;
    dynamicInnerRef?: React.Ref<DynamicInnerRefT>;
    dynamicRenderType?: 'simple' | 'uniform' | 'variable';
    dynamicItemSizeEstimator?: ReactList['props']['itemSizeEstimator'];
    dynamicItemSizeGetter?: ReactList['props']['itemSizeGetter'];
    dynamicRenderMinSize?: number;
    dynamicRenderUseStaticSize?: boolean;
    dynamicRenderThreshold?: number;
    dynamicRenderScrollParentGetter?: ReactList['props']['scrollParentGetter'];
    dynamicRenderScrollParentViewportSizeGetter?: () => number;
    sortable?: boolean;
    externalSort?: boolean;
    disableSortReset?: boolean;
    defaultOrder?: OrderType;
    defaultResizeable?: boolean;
    highlightRows?: boolean;
    stripedRows?: boolean;
    headerMod?: 'multiline' | 'pre';
}

export interface CustomStyleParams<T> {
    row?: T;
    index?: number;
    name: string;
    header?: boolean; // true for <th>
    footer?: boolean;
    headerData?: boolean;
}

export type AlignType = typeof LEFT | typeof RIGHT | typeof CENTER;

export type OrderType = typeof ASCENDING | typeof DESCENDING;

export interface SortOrder {
    columnId: string;
    order: OrderType;
}

export type HeadPosition = typeof FIXED | typeof MOVING;
export type THEMES = typeof LEGACY_THEME | typeof YCLOUD_THEME;

export interface SortedDataItem<T> {
    row: T;
    index: number;
    span?: {[colName: string]: number};
}

export type Comparator<T> = (l: SortedDataItem<T>, r: SortedDataItem<T>) => number;

export type HandleResize = (columnId: string, newWidth: number) => void;
