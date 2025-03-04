import * as React from 'react';

import DataTable, {DisplayIndicesConfig, HeadPosition, OrderType, THEMES} from '../../lib';
import {YCLOUD_THEME} from '../../lib/constants';
import {cn} from '../../lib/util';
import {columns, data, footerData, headerData} from '../data/data';

import './Example.scss';

const b = cn('datable-example');

export const StickyHeadValues = {
    MOVING: DataTable.MOVING,
    FIXED: DataTable.FIXED,
} as const;

export interface ExampleProps {
    allowGroups?: boolean;
    stickyHeadValues?: HeadPosition;
    fixHead?: boolean;
    fixFooter?: boolean;
    stickyTop?: number;
    stickyBottom?: number;
    sortable?: boolean;
    externalSort?: boolean;
    disableSortReset?: boolean;
    stripedRows?: boolean;
    displayIndices?: boolean | DisplayIndicesConfig;
    highlightRows?: boolean;
    dynamicRenderType?: 'simple' | 'uniform' | 'variable';
    dynamicRenderUseStaticSize?: boolean;
    theme?: THEMES;
    getColSpansOfRowCol1?: number;
}

export const defaultProps = {
    allowGroups: false,
    stickyHeadValues: StickyHeadValues.MOVING,
    fixHead: false,
    fixFooter: false,
    stickyTop: 0,
    stickyBottom: 0,
    sortable: false,
    externalSort: false,
    disableSortReset: false,
    stripedRows: false,
    displayIndices: true,
    highlightRows: true,
    dynamicRenderType: undefined,
    dynamicRenderUseStaticSize: false,
    theme: YCLOUD_THEME as THEMES,
    getColSpansOfRowCol1: 7,
};

function getState({
    allowGroups = defaultProps.allowGroups,
    stickyHeadValues: fixType = defaultProps.stickyHeadValues,
    fixHead = defaultProps.fixHead,
    fixFooter = defaultProps.fixFooter,
    stickyTop = defaultProps.stickyTop,
    stickyBottom = defaultProps.stickyBottom,
    sortable = defaultProps.sortable,
    externalSort = defaultProps.externalSort,
    disableSortReset = defaultProps.disableSortReset,
    stripedRows = defaultProps.stripedRows,
    displayIndices = defaultProps.displayIndices,
    highlightRows = defaultProps.highlightRows,
    dynamicRenderType,
    dynamicRenderUseStaticSize = defaultProps.dynamicRenderUseStaticSize,
    theme = defaultProps.theme,
    getColSpansOfRowCol1 = defaultProps.getColSpansOfRowCol1,
}: ExampleProps) {
    const initialSettings = {
        displayIndices: true,
        sortable: true,
        externalSort: false,
        defaultOrder: DataTable.ASCENDING as OrderType,
        dynamicRenderScrollParentGetter: () => window as any,
        dynamicRenderUseStaticSize: false,
    };

    return {
        settings: {
            ...initialSettings,
            stickyHead: fixHead ? fixType : undefined,
            stickyFooter: fixFooter ? fixType : undefined,
            stickyTop,
            stickyBottom,
            sortable,
            externalSort,
            disableSortReset,
            stripedRows,
            displayIndices,
            highlightRows,
            dynamicRenderType,
            dynamicRender: Boolean(dynamicRenderType),
            dynamicRenderUseStaticSize,
        },
        theme,
        allowGroups,
        getColSpansOfRowCol1,
    };
}

export default function Example(props: ExampleProps) {
    const {settings, allowGroups, theme, getColSpansOfRowCol1} = getState(props);
    const fixType = props.stickyHeadValues;

    columns[1].group = !settings.dynamicRenderType && allowGroups;

    return (
        <div className={b({fixed: fixType === StickyHeadValues.FIXED})}>
            <div className={b('table')}>
                <DataTable
                    theme={theme}
                    columns={columns}
                    data={data}
                    onSort={(sortOrderState) => {
                        console.log(sortOrderState);
                    }}
                    getColSpansOfRow={
                        getColSpansOfRowCol1 > 0
                            ? ({row}) => {
                                  if (row.col1! % 10 === 0) {
                                      return {col1: getColSpansOfRowCol1};
                                  }

                                  return undefined;
                              }
                            : undefined
                    }
                    headerData={headerData}
                    footerData={footerData}
                    settings={settings}
                    initialSortOrder={
                        settings.sortable
                            ? [
                                  {columnId: 'col1', order: DataTable.DESCENDING},
                                  {columnId: 'col2', order: DataTable.ASCENDING},
                              ]
                            : undefined
                    }
                />
            </div>
        </div>
    );
}
