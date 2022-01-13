import * as React from 'react';
import PropTypes from 'prop-types';
import ReactList from 'react-list';
import cn from 'bem-cn-lite';

import {positionStickySupported} from './featureSupport';
import {DataTableProps, Column, Settings, OrderType, HeadPosition, SortedDataItem} from './types';
import {
    getSortOrder,
    getSortedData,
    externalToInternalSortOrder,
    internalToExternalSortOrder,
    SlimColumn,
} from './util';
import './DataTable.scss';

const b = cn('data-table');

import {ASCENDING, DESCENDING, LEFT, RIGHT, CENTER, FIXED, MOVING, INDEX_COLUMN} from './constants';
import {HeightObserver} from './height-observer';

const ICON_ASC = (
    <svg className={b('icon')} viewBox="0 0 10 6" width="10" height="6">
        <path fill="currentColor" d="M0 5h10l-5 -5z" />
    </svg>
);

const ICON_DESC = (
    <svg className={b('icon')} viewBox="0 0 10 6" width="10" height="6">
        <path fill="currentColor" d="M0 1h10l-5 5z" />
    </svg>
);

interface CustomIcons {
    ICON_ASC: React.ReactNode;
    ICON_DESC: React.ReactNode;
}

const ICONS: CustomIcons = {
    ICON_ASC,
    ICON_DESC,
};

function getSortIcon(order?: OrderType) {
    switch (order) {
        case ASCENDING:
            return ICONS.ICON_ASC;
        case DESCENDING:
            return ICONS.ICON_DESC;
        default:
            return false;
    }
}

interface ColumnSortIconProps {
    sortOrder?: OrderType;
    sortIndex?: number;
    sortable?: boolean;
    defaultOrder?: OrderType;
}

const ColumnSortIcon = ({sortOrder, sortIndex, sortable, defaultOrder}: ColumnSortIconProps) => {
    if (sortable) {
        return (
            <span className={b('sort-icon', {shadow: !sortOrder})} data-index={sortIndex}>
                {getSortIcon(sortOrder || defaultOrder)}
            </span>
        );
    } else {
        return null;
    }
};

ColumnSortIcon.propTypes = {
    sortOrder: PropTypes.oneOf([ASCENDING, DESCENDING]),
    sortable: PropTypes.bool,
    defaultOrder: PropTypes.oneOf([ASCENDING, DESCENDING]),
};

interface TableRowProps<T> {
    row: T;
    index: number;
    columns: DataColumns<T>;

    className?: string;
    odd?: boolean;
    footer?: boolean;
    headerData?: boolean;
    onClick?: (row: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void;
    span?: {[colName: string]: number};
}

class TableRow<T> extends React.PureComponent<TableRowProps<T>> {
    static defaultProps = {
        footer: false,
    };
    onClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
        if (this.props.onClick) {
            const {row, index} = this.props;
            this.props.onClick(row, index, event);
        }
    };
    render() {
        const {className, columns, row, index, odd, footer, span, headerData} = this.props;
        return (
            <tr
                className={b('row', {odd, footer, 'header-data': headerData}, className)}
                onClick={this.onClick}
            >
                {columns.map((column, columnIndex) => {
                    let rowSpan;
                    if (span) {
                        if (span[column.name] === 0) {
                            return null;
                        } else {
                            rowSpan = span[column.name];
                        }
                    }

                    const value = column._getValue(row);
                    return (
                        <td
                            key={columnIndex}
                            className={column._className}
                            title={column._getTitle(row)}
                            style={column.customStyle({
                                row,
                                index,
                                name: column.name,
                                header: false,
                                footer,
                                headerData,
                            })}
                            rowSpan={rowSpan}
                            onClick={column._getOnClick({row, index, footer, headerData})}
                        >
                            {column._renderValue({value, row, index, footer, headerData})}
                        </td>
                    );
                })}
            </tr>
        );
    }
}

interface TableHeadProps<T> {
    dataColumns: DataColumns<T>;
    headColumns: HeadColumns<T>;
    displayIndices?: boolean;

    onSort?: TableProps<T>['onSort'];
    onColumnsUpdated?: (widths: number[]) => void;
    renderedDataRows?: React.ReactNode;

    onDataRowsHeightChange?: StickyHeadProps<T>['onDataRowsHeightChange']; // the property is not defined for StickyHead internals
}

class TableHead<T> extends React.Component<TableHeadProps<T>> {
    static propTypes = {
        headColumns: PropTypes.array.isRequired,
        dataColumns: PropTypes.array.isRequired,
        displayIndices: PropTypes.bool.isRequired,
        onSort: PropTypes.func,
        onColumnsUpdated: PropTypes.func,
        renderedDataRows: PropTypes.node,
    };

    _dataRowsRef: HTMLTableSectionElement | null = null;
    dataRowsHeightObserver?: HeightObserver;
    renderedColumns: HTMLTableHeaderCellElement[] = [];

    dataRowsRef = (ref: HTMLTableSectionElement) => {
        this._dataRowsRef = ref;
        if (ref) {
            this.dataRowsHeightObserver?.checkAndUpdateHeight();
        }
    };

    componentDidMount() {
        this._calculateColumnsWidth();
        if ('function' === typeof this.props.onDataRowsHeightChange) {
            this.dataRowsHeightObserver = new HeightObserver({
                getSrcElement: () => this._dataRowsRef,
                onHeightChange: (height) => {
                    if ('function' === typeof this.props.onDataRowsHeightChange) {
                        this.props.onDataRowsHeightChange(height);
                    }
                },
            });
        }
    }

    componentDidUpdate() {
        this._calculateColumnsWidth();
        this.dataRowsHeightObserver?.checkAndUpdateHeight();
    }

    componentWillUnmount() {
        this.dataRowsHeightObserver?.destroy();
    }

    _getColumnRef = (index: number) => {
        return (node: HTMLTableHeaderCellElement) => {
            this.renderedColumns[index] = node;
        };
    };
    _calculateColumnsWidth() {
        const {onColumnsUpdated} = this.props;
        if (typeof onColumnsUpdated === 'function') {
            requestAnimationFrame(() => {
                const widths = this.renderedColumns.map(
                    (col) => col && col.getBoundingClientRect().width,
                );
                onColumnsUpdated(widths);
            });
        }
    }
    onSort(column?: SlimColumn, multisort?: boolean) {
        const {onSort} = this.props;
        if (typeof onSort === 'function') {
            onSort(column, multisort);
        }
    }
    _getOnSortClick(column: HeadCellColumn<T>) {
        const {sortable = false, name} = column;
        if (name === INDEX_COLUMN) {
            return () => {
                this.onSort();
            };
        }
        return sortable
            ? (event: React.MouseEvent<HTMLTableHeaderCellElement>) => {
                  this.onSort(column, event.ctrlKey || event.metaKey);
              }
            : undefined;
    }
    renderHeadCell = (headCell: HeadCellsType<T>) => {
        const {column, rowSpan, colSpan} = headCell;
        const {
            sortable = false,
            header = column.name,
            className,
            index,
            columnIndex,
            align,
        } = column;

        const {headerTitle = (typeof header === 'string' && header) || undefined} = column;

        return (
            <th
                ref={column.dataColumn ? this._getColumnRef(columnIndex!) : null}
                className={b('th', {sortable, align}, className)}
                key={`${column.name}-${index}`}
                title={headerTitle}
                data-index={index}
                colSpan={colSpan}
                rowSpan={rowSpan}
                style={column.customStyle && column.customStyle({header: true, name: column.name})}
                onClick={this._getOnSortClick(column)}
            >
                <div className={b('head-cell')}>
                    {header}
                    {<ColumnSortIcon {...column} />}
                </div>
            </th>
        );
    };
    renderHeadLevel = (row: HeadColumnsItem<T>, rowIndex: number) => {
        return (
            <tr key={rowIndex} className={b('head-row')}>
                {row.map(this.renderHeadCell)}
            </tr>
        );
    };
    render() {
        const {headColumns, dataColumns, renderedDataRows} = this.props;
        this.renderedColumns.length = dataColumns.length;
        return (
            <React.Fragment>
                <thead className={b('head')}>{headColumns.map(this.renderHeadLevel)}</thead>
                {renderedDataRows === undefined ? null : (
                    <tbody ref={this.dataRowsRef}>{renderedDataRows}</tbody>
                )}
            </React.Fragment>
        );
    }
}

interface StickyHeadProps<T> {
    dataColumns: DataColumns<T>;
    headColumns: HeadColumns<T>;

    mode: HeadPositionInner;
    displayIndices?: Settings['displayIndices'];
    onSort?: TableProps<T>['onSort'];
    top: number;

    onDataRowsHeightChange: (height: number) => void;
}

interface StickyHeadState {
    widths?: number[];
    right?: number;
    style?: React.CSSProperties;
}

class StickyHead<T> extends React.Component<StickyHeadProps<T>, StickyHeadState> {
    static propTypes = {
        mode: PropTypes.oneOf([FIXED, MOVING]),
        top: PropTypes.number,
        renderedDataRows: PropTypes.node,
    };
    static defaultProps = {
        top: 0,
    };

    static getDerivedStateFromProps<T>(props: StickyHeadProps<T>, state: StickyHeadState) {
        if (props.top !== state.style?.top) {
            return props.top === undefined ? null : {style: {top: props.top}};
        }
        return null;
    }

    state: StickyHeadState = {
        style: {top: StickyHead.defaultProps.top},
    };

    heightObserver?: HeightObserver;

    _node?: HTMLElement;
    _nodeRef = (node: HTMLDivElement) => {
        this._node = node;
    };

    setScrollLeft(scrollLeft: number) {
        requestAnimationFrame(() => {
            if (this._node) {
                this._node.scrollLeft = scrollLeft;
            }
        });
    }
    setRightPosition(value: number) {
        if (this.state.right !== value && !this.props.top && this.props.mode !== MOVING) {
            this.setState({right: value});
        }
    }
    renderHeader(props: Omit<StickyHeadProps<T>, 'mode' | 'top'>) {
        const {widths = []} = this.state;
        const totalWidth = widths.reduce((sum, val) => sum + val, 0);
        return (
            <div className={b('table-wrapper', {sticky: true})}>
                <table className={b('table', {sticky: true})} style={{width: totalWidth || 'auto'}}>
                    <colgroup>
                        {widths.map((width, index) => (
                            <col key={index} style={{width}} />
                        ))}
                    </colgroup>
                    <TableHead {...props} onDataRowsHeightChange={this.onDataRowsHeightChange} />
                </table>
            </div>
        );
    }
    onDataRowsHeightChange = (height: number) => {
        this.props.onDataRowsHeightChange(height + 1);
    };
    updateWidths(newWidths: number[] = []) {
        const {widths = []} = this.state;
        if (newWidths.some((v, i) => v !== widths[i])) {
            this.setState({widths: newWidths});
        }
    }
    render() {
        const {mode, top: _top, ...props} = this.props;
        if (mode === MOVING) {
            const {style} = this.state;
            return (
                <div className={b('sticky', {moving: true, head: true})} style={style}>
                    {this.renderHeader(props)}
                </div>
            );
        } else {
            const {widths = [], right = 0} = this.state;
            const totalWidth = widths.reduce((sum, val) => sum + val, 0);
            return (
                <div
                    ref={this._nodeRef}
                    className={b('sticky', {fixed: true, head: true})}
                    style={{right: right, display: totalWidth ? undefined : 'none'}}
                >
                    {this.renderHeader(props)}
                </div>
            );
        }
    }
}

interface StickyFooterProps<T> {
    dataColumns: DataColumns<T>;
    renderedRows: React.ReactNode;

    mode: StickyHeadProps<T>['mode'];
    bottom?: number;

    onMovingHeightChange: (height: number) => void;
}

type StickyFooterState = StickyHeadState;

class StickyFooter<T> extends React.PureComponent<StickyFooterProps<T>, StickyFooterState> {
    static defaultProps = {
        bottom: 0,
    };

    static getDerivedStateFromProps<T>(props: StickyFooterProps<T>, state: StickyFooterState) {
        if (props.bottom !== state.style?.bottom) {
            return props.bottom === undefined ? null : {style: {bottom: props.bottom}};
        }
        return null;
    }

    state: StickyFooterState = {
        style: {bottom: 0},
    };

    heightObserver?: HeightObserver;

    _nodeFixed: HTMLElement | null = null;
    _nodeMoving: HTMLElement | null = null;
    _nodeFixedRef = (node: HTMLDivElement) => {
        this._nodeFixed = node;
    };
    _nodeMovingRef = (node: HTMLDivElement) => {
        this._nodeMoving = node;
        if (node) {
            this.heightObserver?.checkAndUpdateHeight();
        }
    };

    componentDidMount() {
        this.heightObserver = new HeightObserver({
            getSrcElement: () => this._nodeMoving,
            onHeightChange: this.props.onMovingHeightChange,
        });
    }

    componentWillUnmount() {
        this.heightObserver?.destroy();
    }

    componentDidUpdate() {
        this.heightObserver?.checkAndUpdateHeight();
    }

    setScrollLeft(scrollLeft: number) {
        requestAnimationFrame(() => {
            if (this._nodeFixed) {
                this._nodeFixed.scrollLeft = scrollLeft;
            }
        });
    }
    setRightPosition(value: number) {
        if (this.state.right !== value && !this.props.bottom && this._nodeFixed) {
            this.setState({right: value});
        }
    }
    renderFooter(renderedRows: React.ReactNode) {
        const {widths = []} = this.state;
        const totalWidth = widths.reduce((sum, val) => sum + val, 0);
        return (
            <div className={b('table-wrapper', {sticky: true})}>
                <table className={b('table', {sticky: true})} style={{width: totalWidth || 'auto'}}>
                    <colgroup>
                        {widths.map((width, index) => (
                            <col key={index} style={{width}} />
                        ))}
                    </colgroup>
                    <tbody>{renderedRows}</tbody>
                </table>
            </div>
        );
    }
    updateWidths(newWidths: number[] = []) {
        const {widths = []} = this.state;
        if (newWidths.some((v, i) => v !== widths[i])) {
            this.setState({widths: newWidths});
        }
    }
    render() {
        if (!this.props.renderedRows) {
            return null;
        }
        const {mode, renderedRows} = this.props;
        if (mode === MOVING) {
            const {style} = this.state;
            return (
                <div
                    ref={this._nodeMovingRef}
                    className={b('sticky', {footer: true, moving: true})}
                    style={style}
                >
                    {this.renderFooter(renderedRows)}
                </div>
            );
        } else {
            const {widths = [], right = 0} = this.state;
            const totalWidth = widths.reduce((sum, val) => sum + val, 0);
            return (
                <div
                    ref={this._nodeFixedRef}
                    className={b('sticky', {footer: true, fixed: true})}
                    style={{right: right, display: totalWidth ? undefined : 'none'}}
                >
                    {this.renderFooter(renderedRows)}
                </div>
            );
        }
    }
}

interface TableProps<T> {
    className?: string;
    settings: DataTableViewState<T>['settings'];
    headerData: DataTableProps<T>['headerData'];
    data: SortedDataItem<T>[];
    footerData: DataTableProps<T>['footerData'];
    columns: TableColumns<T>;
    emptyDataMessage?: string;
    onRowClick: DataTableProps<T>['onRowClick'];
    rowClassName: DataTableProps<T>['rowClassName'];
    rowKey: (row: T, index: number) => string | number;
    startIndex: DataTableProps<T>['startIndex'];
    onSort: DataTableView<T>['onSort'];
    renderEmptyRow: unknown;
    nullBeforeNumbers?: boolean;
}

interface TableState {
    movingFooterStyle?: {marginBottom: number};
    movingHeaderStyle?: {marginTop: number};
}

class Table<T> extends React.PureComponent<TableProps<T>, TableState> {
    static propTypes = {
        className: PropTypes.string,
        settings: PropTypes.object,
        refs: PropTypes.object,
        headerData: PropTypes.array,
        data: PropTypes.array,
        footerData: PropTypes.array,
        columns: PropTypes.object,
        emptyDataMessage: PropTypes.string,
        onRowClick: PropTypes.func,
        rowClassName: PropTypes.func,
        rowKey: PropTypes.func,
        startIndex: PropTypes.number,
        onSort: PropTypes.func,
        renderEmptyRow: PropTypes.func,
    };

    state: TableState = {};

    _onWindowResize?: () => void;

    _body?: HTMLDivElement;
    _box?: HTMLDivElement;
    _head?: TableHead<T>;
    _stickyHead?: StickyHead<T>;
    _stickyFooter?: StickyFooter<T>;

    componentDidMount() {
        const {stickyHead, syncHeadOnResize} = this.props.settings;

        this._updateBoxConstraints();
        if (stickyHead && syncHeadOnResize && !this._onWindowResize) {
            this._onWindowResize = () => {
                this.syncHeadWidths();
            };
            window.addEventListener('resize', this._onWindowResize);
        }
    }

    componentDidUpdate() {
        this._updateBoxConstraints();
    }

    componentWillUnmount() {
        if (this._onWindowResize) {
            window.removeEventListener('resize', this._onWindowResize);
            delete this._onWindowResize;
        }
    }

    _refBody = (node: HTMLDivElement) => {
        this._body = node;
    };
    _refBox = (node: HTMLDivElement) => {
        this._box = node;
    };
    _refHead = (node: TableHead<T>) => {
        this._head = node;
    };
    _refStickyHead = (node: StickyHead<T>) => {
        this._stickyHead = node;
    };
    _refStickyFooter = (node: StickyFooter<T>) => {
        this._stickyFooter = node;
    };

    _onBoxScroll = () => {
        this._updateBoxConstraints();
    };
    _updateBoxConstraints() {
        const hasSticky = this._stickyHead || this._stickyFooter;

        if (this._box && hasSticky) {
            const scrollWidth = this._box.offsetWidth - this._box.clientWidth;

            if (this._stickyHead) {
                this._stickyHead.setRightPosition(scrollWidth);
                this._stickyHead.setScrollLeft(this._box.scrollLeft);
            }

            if (this._stickyFooter) {
                this._stickyFooter.setRightPosition(scrollWidth);
                this._stickyFooter.setScrollLeft(this._box.scrollLeft);
            }
        }
    }

    _onColumnsUpdated = (widths: number[]) => {
        if (this._stickyHead) {
            this._stickyHead.updateWidths(widths);
        }
        if (this._stickyFooter) {
            this._stickyFooter.updateWidths(widths);
        }
    };

    syncHeadWidths() {
        if (this._head) {
            this._head._calculateColumnsWidth();
        }
    }

    _getEmptyRow() {
        const {
            columns: {dataColumns},
            emptyDataMessage,
            renderEmptyRow,
        } = this.props;
        if (typeof renderEmptyRow === 'function') {
            return renderEmptyRow(dataColumns);
        } else {
            return (
                <tr className={b('row')}>
                    <td className={b('td', b('no-data'))} colSpan={dataColumns.length}>
                        {emptyDataMessage}
                    </td>
                </tr>
            );
        }
    }

    renderHead() {
        const {columns, onSort} = this.props;
        const {displayIndices} = this.props.settings;
        const rows = this.renderHeaderRows();
        return (
            <TableHead
                ref={this._refHead}
                {...columns}
                displayIndices={Boolean(displayIndices)}
                onSort={onSort}
                onColumnsUpdated={this._onColumnsUpdated}
                renderedDataRows={rows}
            />
        );
    }
    renderStickyHead() {
        const {columns, onSort} = this.props;
        const {displayIndices, stickyTop, stickyHead} = this.props.settings;
        const top =
            stickyTop === 'auto' && this._body && this._body.parentNode
                ? (this._body.parentNode as HTMLElement).offsetTop
                : Number(stickyTop) || 0;
        const rows = this.renderHeaderRows();
        return (
            <StickyHead
                mode={stickyHead}
                top={top}
                ref={this._refStickyHead}
                {...columns}
                displayIndices={displayIndices}
                onSort={onSort}
                renderedDataRows={rows}
                onDataRowsHeightChange={this.onMovingHeaderDataRowsHeightChange}
            />
        );
    }
    renderStickyFooter() {
        const {columns} = this.props;
        const {stickyBottom} = this.props.settings;
        let bottom = Number(stickyBottom) || 0;
        if (stickyBottom === 'auto' && this._body && this._body.parentNode) {
            const el = this._body.parentNode as HTMLElement;
            bottom = el.offsetTop + el.offsetHeight;
        }

        const rows = this.renderFooterRows();
        return (
            <StickyFooter
                ref={this._refStickyFooter}
                mode={this.getStickyFooterMode()}
                bottom={bottom}
                dataColumns={columns.dataColumns}
                renderedRows={rows}
                onMovingHeightChange={this.onMovingFooterHeightChange}
            />
        );
    }
    onMovingHeaderDataRowsHeightChange = (height: number) => {
        if (-height !== this.state.movingHeaderStyle?.marginTop) {
            this.setState({movingHeaderStyle: {marginTop: -height}});
        }
    };
    onMovingFooterHeightChange = (height: number) => {
        if (-height !== this.state.movingFooterStyle?.marginBottom) {
            this.setState({movingFooterStyle: {marginBottom: -height}});
        }
    };
    renderRow = (vIndex: number) => {
        const {data, onRowClick} = this.props;
        const {row, index, span} = data[vIndex];
        return this.renderRowImpl(row, index, {onRowClick, odd: vIndex % 2 === 0, span});
    };
    renderFooterRow = (rowData: T, index: number) => {
        return this.renderRowImpl(rowData, index, {footer: true});
    };
    renderHeaderRow = (rowData: T, index: number) => {
        return this.renderRowImpl(rowData, index, {headerData: true});
    };
    renderRowImpl = (
        row: T,
        index: number,
        {onRowClick, odd, span, footer, headerData}: RenderRowImplOptions<T> = {},
    ) => {
        const {
            columns: {dataColumns},
            rowClassName,
            rowKey,
        } = this.props;
        const className =
            typeof rowClassName === 'function' ? rowClassName(row, index, footer, headerData) : '';

        return (
            <TableRow
                key={rowKey(row, index)}
                className={className}
                columns={dataColumns}
                row={row}
                index={index}
                span={span}
                odd={odd}
                onClick={onRowClick}
                footer={footer}
                headerData={headerData}
            />
        );
    };
    renderTable = (items: React.ReactNode[], ref?: any) => {
        const {
            footerData,
            columns: {dataColumns},
            settings: {stickyHead},
        } = this.props;
        const {movingHeaderStyle, movingFooterStyle} = this.state;
        const stickyFooterMode = this.getStickyFooterMode();
        return (
            <div
                className={b('table-wrapper')}
                style={stickyFooterMode === DataTable.MOVING ? movingFooterStyle : undefined}
            >
                <table
                    className={b('table')}
                    style={stickyHead === DataTable.MOVING ? movingHeaderStyle : undefined}
                >
                    <colgroup>
                        {dataColumns.map(({width}, index) => {
                            return <col key={index} width={width} />;
                        })}
                    </colgroup>
                    {this.renderHead()}
                    <tbody ref={ref}>{items.length ? items : this._getEmptyRow()}</tbody>
                    {footerData && (
                        <tfoot className={b('foot', {'has-sticky-footer': stickyFooterMode})}>
                            {footerData.map(this.renderFooterRow)}
                        </tfoot>
                    )}
                </table>
            </div>
        );
    };
    renderTableDynamic() {
        const {
            data,
            settings: {
                dynamicInnerRef,
                dynamicRenderType = 'uniform',
                dynamicRenderUseStaticSize,
                dynamicRenderThreshold,
                dynamicRenderMinSize,
                dynamicRenderScrollParentGetter,
                dynamicRenderScrollParentViewportSizeGetter,
                dynamicItemSizeEstimator,
                dynamicItemSizeGetter,
            } = {},
        } = this.props;

        return (
            <ReactList
                ref={dynamicInnerRef}
                type={dynamicRenderType}
                useStaticSize={dynamicRenderUseStaticSize}
                threshold={dynamicRenderThreshold}
                minSize={dynamicRenderMinSize}
                itemSizeEstimator={dynamicItemSizeEstimator}
                itemSizeGetter={dynamicItemSizeGetter}
                length={data.length}
                itemRenderer={this.renderRow}
                itemsRenderer={this.renderTable}
                scrollParentGetter={dynamicRenderScrollParentGetter}
                {...{scrollParentViewportSizeGetter: dynamicRenderScrollParentViewportSizeGetter}}
            />
        );
    }
    renderTableSimple() {
        const {data} = this.props;
        const rows = data.map((_row, index) => this.renderRow(index));
        return this.renderTable(rows, null);
    }
    renderHeaderRows() {
        const {headerData} = this.props;
        return headerData && headerData.map(this.renderHeaderRow);
    }
    renderFooterRows() {
        const {footerData} = this.props;
        return footerData?.map(this.renderFooterRow);
    }
    getStickyFooterMode() {
        const {footerData} = this.props;
        if (!footerData?.length) {
            return false;
        }
        const {stickyFooter} = this.props.settings;
        return stickyFooter;
    }
    render() {
        const {className} = this.props;
        const {stickyHead, dynamicRender} = this.props.settings;

        const stickyFooter = this.getStickyFooterMode();

        return (
            <div className={className} ref={this._refBody}>
                {stickyHead && this.renderStickyHead()}
                <div
                    ref={this._refBox}
                    className={b('box', {'sticky-head': stickyHead, 'sticky-footer': stickyFooter})}
                    onScroll={this._onBoxScroll}
                >
                    {dynamicRender ? this.renderTableDynamic() : this.renderTableSimple()}
                </div>
                {stickyFooter && this.renderStickyFooter()}
            </div>
        );
    }
}

interface RenderRowImplOptions<T> {
    onRowClick?: DataTableProps<T>['onRowClick'];
    odd?: boolean;
    span?: SortedDataItem<T>['span'];
    footer?: boolean;
    headerData?: boolean;
}

interface CellProps<T> {
    column: Column<T>;
    value?: any;
    row: T;
    index: number;
    footer?: boolean;
    headerData?: boolean;
}

const MemoizedCell = React.memo(CellImpl) as typeof CellImpl;

function CellImpl<T>(props: CellProps<T>) {
    const {column, value, row, index, footer, headerData} = props;

    return (
        <React.Fragment>{column.render!({value, row, index, footer, headerData})}</React.Fragment>
    );
}

const sortOrderShape = {
    columnId: PropTypes.string,
    order: PropTypes.oneOf([ASCENDING, DESCENDING]),
};

type InternalProps<T> = DataTableProps<T> & typeof DataTableView.defaultProps;

interface DataTableViewState<T> extends SortOrderWithSortColumns {
    indexColumn?: Column<T>;
    settings: ReturnType<typeof DataTableView.calculateSettings>;
}

type HeadPositionInner = HeadPosition | false;
class DataTableView<T> extends React.Component<DataTableProps<T>, DataTableViewState<T>> {
    static propTypes = {
        columns: PropTypes.array.isRequired,
        headerData: PropTypes.array,
        data: PropTypes.array.isRequired,
        footerData: PropTypes.array,
        startIndex: PropTypes.number,
        emptyDataMessage: PropTypes.string,
        renderEmptyRow: PropTypes.func,
        rowClassName: PropTypes.func,
        rowKey: PropTypes.func,
        visibleRowIndex: PropTypes.func,
        initialSortOrder: PropTypes.oneOfType([
            PropTypes.shape(sortOrderShape),
            PropTypes.arrayOf(PropTypes.shape(sortOrderShape)),
        ]),
        sortOrder: PropTypes.oneOfType([
            PropTypes.shape(sortOrderShape),
            PropTypes.arrayOf(PropTypes.shape(sortOrderShape)),
        ]),
        settings: PropTypes.shape({
            displayIndices: PropTypes.bool,
            dynamicRender: PropTypes.bool,
            dynamicRenderType: PropTypes.oneOf(['simple', 'uniform', 'variable']),
            dynamicRenderUseStaticSize: PropTypes.bool,
            dynamicRenderThreshold: PropTypes.number,
            dynamicRenderMinSize: PropTypes.number,
            dynamicRenderScrollParentGetter: PropTypes.func,
            dynamicRenderScrollParentViewportSizeGetter: PropTypes.func,
            dynamicItemSizeEstimator: PropTypes.func,
            dynamicItemSizeGetter: PropTypes.func,
            stickyHead: PropTypes.oneOf([false, FIXED, MOVING]),
            stickyTop: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
            sortable: PropTypes.bool,
            externalSort: PropTypes.bool,
            highlightRows: PropTypes.bool,
            stripedRows: PropTypes.bool,
            headerMod: PropTypes.oneOf(['multiline', 'pre']),
            defaultOrder: PropTypes.oneOf([ASCENDING, DESCENDING]),
            syncHeadOnResize: PropTypes.bool,
        }),
        theme: PropTypes.string,
        onSort: PropTypes.func,
    };
    static defaultProps = {
        startIndex: 0,
        emptyDataMessage: 'No data',
        settings: {
            displayIndices: true,
            dynamicRenderMinSize: 1,
            stickyHead: false as HeadPositionInner,
            stickyFooter: false as HeadPositionInner,
            sortable: true,
            externalSort: false,
            defaultOrder: ASCENDING as OrderType,
        },
        rowKey: (row: any, index: number) =>
            Object.prototype.hasOwnProperty.call(row, 'id') ? row.id : index,
        initialSortOrder: {},
        initialSortColumns: [],
        theme: 'yandex-cloud',
    };

    static getSortedData = getSortedData;

    static normalizeStickyHead(
        stickyHead: Settings['stickyHead'] | false = false,
    ): HeadPositionInner {
        if (stickyHead === MOVING && !positionStickySupported) {
            console.warn(
                'Your browser does not support position: sticky, moving sticky headers will be disabled.',
            );
            return false;
        }
        return stickyHead;
    }

    static calculateSettings(nextSettings: Settings) {
        return {
            ...DataTableView.defaultProps.settings,
            ...nextSettings,
            stickyHead: DataTableView.normalizeStickyHead(nextSettings.stickyHead),
            stickyFooter: DataTableView.normalizeStickyHead(nextSettings.stickyFooter),
        };
    }

    static getIndexColumn<T extends HasHeaderFooterIndex>({
        startIndex,
        data,
        visibleRowIndex,
    }: InternalProps<T>): Column<T> {
        const lastIndex = startIndex + data.length + 1;

        return {
            name: INDEX_COLUMN,
            header: '#',
            className: b('index'),
            render: ({row, index, footer, headerData}) => {
                if (headerData) {
                    return row.headerIndex ?? startIndex + index;
                }
                if (footer) {
                    return row.footerIndex ?? startIndex + index;
                }
                if (typeof visibleRowIndex === 'function') {
                    return visibleRowIndex(row, index);
                }
                return startIndex + index;
            },
            sortable: false,
            width: 20 + Math.ceil(Math.log10(lastIndex)) * 10,
        };
    }

    static getDerivedStateFromProps<T>(nextProps: InternalProps<T>) {
        const settings = DataTableView.calculateSettings(nextProps.settings);
        return {
            settings,
            indexColumn:
                Boolean(settings.displayIndices) && DataTableView.getIndexColumn(nextProps),
            ...(nextProps.sortOrder
                ? {...externalToInternalSortOrder(nextProps.sortOrder, nextProps.settings)}
                : undefined),
        };
    }

    state: DataTableViewState<T> = {
        settings: {} as any, // see getDerivedStateFromProps
        ...externalToInternalSortOrder(this.props.initialSortOrder!, this.props.settings),
    };

    table?: Table<T>;

    _tableRef = (node: Table<T>) => {
        this.table = node;
    };

    renderMemoizedCell = ({column, value, row, index, footer, headerData}: CellProps<T>) => {
        return (
            <MemoizedCell
                {...{
                    column,
                    value,
                    row,
                    index,
                    footer,
                    headerData,
                }}
            />
        );
    };

    getColumn = (column: Column<T>, columnIndex: number) => {
        const {settings} = this.state;
        const {defaultOrder} = settings;
        const {sortOrder = {}, sortColumns, indexColumn} = this.state;
        const indexAdjustment = Number(Boolean(indexColumn));

        const isSortEnabled = this.isSortEnabled();

        const {
            name,
            accessor = column.name,
            align,
            sortable = settings.sortable,
            group,
            autogroup = true,
        } = column;

        const {sortAccessor, onClick} = column;
        const _className = b('td', {align}, column.className);

        const _getValue =
            typeof accessor === 'function'
                ? (row: T) => accessor(row)
                : (row: any) => {
                      return Object.prototype.hasOwnProperty.call(row, accessor)
                          ? row[accessor]
                          : undefined;
                  };

        const _getTitle =
            typeof column.title === 'function'
                ? (row: T) => (column.title as Function)(row)
                : () => (typeof column.title === 'string' && column.title) || undefined;

        const _getSortValue =
            typeof sortAccessor === 'function' ? (data: T) => sortAccessor(data) : _getValue;

        const _renderValue =
            typeof column.render === 'function'
                ? ({value, row, index, footer, headerData}: Omit<CellProps<T>, 'column'>) =>
                      this.renderMemoizedCell({column, value, row, index, footer, headerData})
                : ({value}: Partial<CellProps<T>>) => value;

        const customStyle =
            typeof column.customStyle === 'function' ? column.customStyle : () => undefined;

        const _getOnClick =
            typeof onClick === 'function'
                ? (data: {row: T; index: number; footer?: boolean; headerData?: boolean}) => () =>
                      onClick(data, column)
                : () => undefined;

        return {
            index: columnIndex - indexAdjustment,
            columnIndex,
            dataColumn: true,
            defaultOrder,
            ...column,
            sortable: sortable && isSortEnabled,
            _className,
            _getValue,
            _getTitle,
            _getSortValue,
            _renderValue,
            _getOnClick,
            customStyle,
            group,
            autogroup,
            sortOrder: sortOrder[name] || undefined,
            sortIndex: sortColumns.length > 1 ? sortColumns.indexOf(name) + 1 : undefined,
        };
    };

    getComplexColumns(columns: DataTableProps<T>['columns']) {
        const headColumns: HeadColumns<T> = [];
        const dataColumns: DataColumns<T> = [];
        const headCells: HeadCellsType<T>[] = [];
        const {indexColumn} = this.state;
        const allColumns = indexColumn ? [indexColumn, ...columns] : columns;

        const processLevel = (list: Column<T>[], level: number) => {
            if (!headColumns[level]) {
                headColumns[level] = [];
            }
            const items = headColumns[level];
            return list.reduce((subCount, item) => {
                let colSpan = 1;
                let itemLevel = -1;
                let column: Column<T> | ColumnExtended<T> = item;
                if (Array.isArray(item.sub)) {
                    colSpan = processLevel(item.sub, level + 1);
                } else {
                    const tmp = this.getColumn(item, dataColumns.length);
                    dataColumns.push(tmp);
                    itemLevel = level;
                    column = tmp;
                }
                const headCell = {column, itemLevel, colSpan, rowSpan: 0};
                headCells.push(headCell);
                items.push(headCell);
                return colSpan + subCount;
            }, 0);
        };

        processLevel(allColumns, 0);
        headCells.forEach((cell) => {
            cell.rowSpan = cell.itemLevel < 0 ? 1 : headColumns.length - cell.itemLevel;
        });

        return {headColumns, dataColumns};
    }

    isSortEnabled = () => {
        const {data} = this.props;
        return Array.isArray(data) && data.length > 1;
    };

    onSort = (column?: SlimColumn, multisort?: boolean) => {
        if (column) {
            const {sortOrder, sortColumns} = getSortOrder(
                column,
                this.state,
                multisort,
                this.props.settings,
            );
            this.setState({sortOrder, sortColumns});

            const {onSort} = this.props;
            if (typeof onSort === 'function') {
                const formattedSortOrder = internalToExternalSortOrder(sortOrder);
                onSort(formattedSortOrder);
            }
        } else {
            this.setState({sortOrder: {}, sortColumns: []});
            const {onSort} = this.props;
            if (typeof onSort === 'function') {
                onSort([]);
            }
        }
    };

    resize() {
        if (this.table) {
            this.table.syncHeadWidths();
        }
    }

    render() {
        const {
            headerData,
            data,
            footerData,
            columns,
            startIndex,
            emptyDataMessage,
            rowClassName,
            rowKey,
            onRowClick,
            theme,
            renderEmptyRow,
            nullBeforeNumbers,
        } = this.props;

        const {settings, sortOrder, sortColumns} = this.state;
        const {highlightRows = false, stripedRows = false, headerMod = false} = settings;
        const tableClassName = b({
            'highlight-rows': highlightRows,
            'striped-rows': stripedRows,
            header: headerMod,
            theme: theme,
        });

        const dataColumns = this.getComplexColumns(columns);
        if (settings.dynamicRender && dataColumns.dataColumns.some((column) => column.group)) {
            console.warn(
                'Simultaneously used grouping cells and dynamic render. The table will render unpredictable.',
            );
        }

        return (
            <Table
                ref={this._tableRef}
                className={tableClassName}
                settings={settings}
                startIndex={startIndex}
                columns={dataColumns}
                emptyDataMessage={emptyDataMessage}
                renderEmptyRow={renderEmptyRow}
                rowClassName={rowClassName}
                rowKey={rowKey || DataTableView.defaultProps.rowKey}
                onRowClick={onRowClick}
                headerData={headerData}
                data={getSortedData(
                    data,
                    dataColumns.dataColumns,
                    {
                        sortOrder,
                        sortColumns,
                    },
                    {
                        nullBeforeNumbers,
                        externalSort: settings?.externalSort,
                    },
                )}
                footerData={footerData}
                onSort={this.onSort}
            />
        );
    }
}

export type ColumnExtended<T> = ReturnType<DataTableView<T>['getColumn']> & {headerTitle?: string};

type HeadCellColumn<T> =
    | ColumnExtended<T>
    | (Column<T> & {
          index?: number;
          columnIndex?: number;
          headerTitle?: string;
          dataColumn?: boolean;
      });

type HeadCellsType<T> = {
    column: HeadCellColumn<T>;
    itemLevel: number;
    colSpan: number;
    rowSpan: number;
};

type HeadColumnsItem<T> = HeadCellsType<T>[];
type HeadColumns<T> = HeadColumnsItem<T>[];
type DataColumns<T> = ColumnExtended<T>[];

interface TableColumns<T> {
    headColumns: HeadColumns<T>;
    dataColumns: DataColumns<T>;
}

export interface SortOrderWithSortColumns {
    sortOrder: NameToOrderTypeMap;
    sortColumns: string[];
}

export type NameToOrderTypeMap = {[colName: string]: OrderType};

interface State {
    error?: any;
}

interface HasHeaderFooterIndex {
    footerIndex?: number;
    headerIndex?: number;
    id?: number;
}

export default class DataTable<T> extends React.PureComponent<DataTableProps<T>, State> {
    static readonly FIXED = FIXED;
    static readonly MOVING = MOVING;

    static readonly ASCENDING = ASCENDING;
    static readonly DESCENDING = DESCENDING;

    static readonly LEFT = LEFT;
    static readonly CENTER = CENTER;
    static readonly RIGHT = RIGHT;

    static setCustomIcons(customIcons: Partial<CustomIcons>) {
        ICONS.ICON_ASC = customIcons.ICON_ASC || ICON_ASC;
        ICONS.ICON_DESC = customIcons.ICON_DESC || ICON_DESC;
    }

    table?: DataTableView<T>;
    state: State = {};
    componentDidCatch(error: unknown) {
        console.error(error);
        this.setState({
            error,
        });

        const {onError} = this.props;
        if ('function' === typeof onError) {
            onError(error);
        }
    }
    _tableRef = (node: DataTableView<T>) => {
        this.table = node;
    };
    resize() {
        if (this.table) {
            this.table.resize();
        }
    }
    render() {
        const {error} = this.state;
        if (error) {
            return (
                <pre className={b('error')}>
                    DataTable got stuck in invalid state. Please tell developers about it.
                    {'\n\n'}
                    {(error.stack && String(error.stack)) || String(error)}
                </pre>
            );
        } else {
            return <DataTableView ref={this._tableRef} {...this.props} />;
        }
    }
}
