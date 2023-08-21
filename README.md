# React Data Table &middot; [![npm package](https://img.shields.io/npm/v/@gravity-ui/react-data-table)](https://www.npmjs.com/package/@gravity-ui/react-data-table) [![CI](https://img.shields.io/github/actions/workflow/status/gravity-ui/react-data-table/.github/workflows/ci.yml?label=CI&logo=github)](https://github.com/gravity-ui/react-data-table/actions/workflows/ci.yml?query=branch:main) [![storybook](https://img.shields.io/badge/Storybook-deployed-ff4685)](https://preview.gravity-ui.com/react-data-table/)

A React component for rendering tables.

Cell grouping is supported: rows are first sorted by grouped columns. Grouping is incompatible with the `dynamicRender` option.

Multi-column sorting is also supported. Ctrl+Click on a column adds a column at the end
of the sort list. A simple Click sorts the table by this column only. Sorting order is switched in the sequence: `none -> default -> reversed default -> none`.

## Properties

| Property          | Type       | Required | Default        | Description                                                                                                                                                                                                                                                             |
| :---------------- | :--------- | :------: | :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| columns           | `Array`    |    ✓     |                | List of [table columns](#Column)                                                                                                                                                                                                                                        |
| headerData        | `Array`    |          |                | A list of rows with data that will be shown inside the header. If the header is sticky, the rows will also stick. The same methods apply to them as to rows in `data` ([headerData](#headerData))                                                                       |
| data              | `Array`    |    ✓     |                | List of data rows                                                                                                                                                                                                                                                       |
| footerData        | `Array`    |          |                | A list of rows with data to be sent into the table footer. The same methods apply to them as to strings in `data`                                                                                                                                                       |
| startIndex        | `Number`   |          | `0`            | Initial index (used to show row indexes)                                                                                                                                                                                                                                |
| settings          | `Object`   |          |                | [Table settings](#Settings)                                                                                                                                                                                                                                             |
| emptyDataMessage  | `String`   |          | 'No data'      | The message shown when the data is empty                                                                                                                                                                                                                                |
| renderEmptyRow    | `Function` |          |                | A custom renderer for an empty table row, accepts an array of columns `(columns) => ReactNode`                                                                                                                                                                          |
| rowClassName      | `Function` |          |                | A method that sets the class for a string `(row, index, isFooterRow, isHeaderRow) => (<string> )`                                                                                                                                                                       |
| rowKey            | `Function` |          |                | A method that returns the value of react-key `(row, index) => (<scalar_type_value> )`. The default method returns `row.id` &#124;&#124;` index`                                                                                                                         |
| initialSortOrder  | `Object`   |          |                | Initial sorting in the format`{columnId: <string>, order: <DataTable.ASCENDING `&#124;` DataTable.DESCENDING>}` or a list of such objects.                                                                                                                              |
| theme             | `String`   |          | 'yandex-cloud' | The name of the theme. To use the built-in table theme, use the `'legacy'` value. For compatibility with @gravity-ui/uikit colors, use `'yandex-cloud'` (default)                                                                                                       |
| onSort            | `Function` |          |                | Sort listener `([{columnId: <string>, order: <DataTable.ASCENDING `&#124;` DataTable.DESCENDING>}]) => void`. Use it to save the sorting state and pass it to the `initialSortOrder` on page refresh.                                                                   |
| sortOrder         | `Object`   |          |                | Sorting in the format `{columnId: <string>, order: <DataTable.ASCENDING `&#124;` DataTable.DESCENDING>}` or a list of such objects.                                                                                                                                     |
| visibleRowIndex   | `Function` |          |                | A method `(row, index) => number` that returns the row index shown in the column enabled by the `displayIndices` flag. Use it to specify a correct row index when applying external sorting                                                                             |
| onRowClick        | `Function` |          |                | Click listener for a row `(row, index, event) => void`                                                                                                                                                                                                                  |
| nullBeforeNumbers | `Boolean`  |          |                | A flag that sets the position of `null`/`undefined` values when sorting. If true, `null`/`undefined` values are shown at the top in the case of ascending order and at the bottom in the case of descending order. If `false`/`undefined`, they are shown at the bottom |

## Settings

| Property                                    | Type                                       | Default               | Description                                                                                                                                                                                                                                                                                                                         |
| :------------------------------------------ | :----------------------------------------- | :-------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| displayIndices                              | `Boolean`                                  | `true`                | Whether to show row indexes (starting from `startIndex`)                                                                                                                                                                                                                                                                            |
| stickyHead                                  | `DataTable.FIXED DataTable.MOVING`         |                       | Enable sticky header in one of two modes. The `DataTable.FIXED` mode is used if the table container is fixed relative to the page. If the page with a container is scrollable, better use `DataTable.MOVING`, but for this your browser needs to support `position: sticky`. Otherwise, sticky header will be completely disabled.  |
| stickyTop                                   | `Number`                                   |                       | Stick the header at the desired height (in the `DataTable.MOVING` mode). Use it if the scrollable container includes other content apart from the table. If the header fails to stick to the edge of the container, better use exactly positioned spacers so that the table content does not bulge out above the top of the header. |
| stickyFooter                                | see stickyHead                             |                       | It's similar to `stickyHead` for `footerData`                                                                                                                                                                                                                                                                                       |
| stickyBottom                                | `Number`                                   |                       | Stick rows from `footerData` with proper bottom margin (in the `DataTable.MOVING` mode).                                                                                                                                                                                                                                            |
| syncHeadOnResize                            | `Boolean`                                  | `false`               | Sync the size of a sticky header when resizing the window                                                                                                                                                                                                                                                                           |
| dynamicInnerRef                             | `React.RefObject<DynamicInnerRefT>`        |                       | A ref to get a ReactList instance when you want to call methods directly, for example, [ReactList.scrollTo](https://github.com/caseywebdev/react-list#scrolltoindex). `DynamicInnerRefT` is also exported as Settings to correctly define the type without adding a project-dependent ReactList.                                    |
| dynamicRender                               | `Boolean`                                  | `false`               | Dynamic rendering of rows (viewport only). Requires a specific layout                                                                                                                                                                                                                                                               |
| dynamicRenderType                           | `String`                                   | `'uniform'`           | [ReactList.type](https://github.com/coderiety/react-list#type-one-of-simple-variable-or-uniform-defaults-to-simple)                                                                                                                                                                                                                 |
| dynamicItemSizeEstimator                    | `Function`                                 |                       | [ReactList.itemSizeEstimator](https://github.com/coderiety/react-list#itemsizeestimatorindex-cache)                                                                                                                                                                                                                                 |
| dynamicItemSizeGetter                       | `Function`                                 |                       | [ReactList.itemSizeGetter](https://github.com/coderiety/react-list#itemsizegetterindex)                                                                                                                                                                                                                                             |
| dynamicRenderMinSize                        | `Number`                                   | `1`                   | A minimum number of rows to be rendered in any case, even if a smaller number of rows fills the container height completely (this makes sense if dynamicRender is enabled). The value is passed [to the `minSize` property of the ReactList component](https://github.com/coderiety/react-list#minsize-defaults-to-1).              |
| dynamicRenderUseStaticSize                  | `Boolean`                                  | `false`               | [ReactList.useStaticSize](https://github.com/caseywebdev/react-list#usestaticsize-defaults-to-false)                                                                                                                                                                                                                                |
| dynamicRenderThreshold                      | `Number`                                   |                       | [ReactList.threshold](https://github.com/caseywebdev/react-list#threshold-defaults-to-100)                                                                                                                                                                                                                                          |
| dynamicRenderScrollParentGetter             | `Funciction`                               |                       | [ReactList.scrollParentGetter](https://github.com/caseywebdev/react-list#scrollparentgetter-defaults-to-finding-the-nearest-scrollable-parent)                                                                                                                                                                                      |
| dynamicRenderScrollParentViewportSizeGetter | `Function`                                 |                       | [ReactList.scrollParentViewportSizeGetter](https://github.com/caseywebdev/react-list#scrollparentviewportsizegetter-defaults-to-scrollparents-viewport-size)                                                                                                                                                                        |
| sortable                                    | `Boolean`                                  | `true`                | Enable sorting for the entire table                                                                                                                                                                                                                                                                                                 |
| externalSort                                | `Boolean`                                  | `false`               | Disable data sorting on the component side. [Read more](#externalSort)                                                                                                                                                                                                                                                              |
| disableSortReset                            | `Boolean`                                  | `false`               | Disable sort reset (enables the `none -> default <-> reversed default` sort scheme)                                                                                                                                                                                                                                                 |
| defaultOrder                                | `DataTable.ASCENDING DataTable.DESCENDING` | `DataTable.ASCENDING` | Default sort order in the table                                                                                                                                                                                                                                                                                                     |
| highlightRows                               | `Boolean`                                  |                       | Highlighting table rows on hover                                                                                                                                                                                                                                                                                                    |
| stripedRows                                 | `Boolean`                                  |                       | Whether to color even/odd rows                                                                                                                                                                                                                                                                                                      |
| headerMod                                   | `multiline` `pre`                          |                       | Enable a multi-line (the `multiline` value) or pre-formatted header (the `pre` value)                                                                                                                                                                                                                                               |

### externalSort

Disables data sorting on the component side. Please note that:

- The table continues to be the primary source of the sort state (selected columns and sort direction) and is also responsible for the correct rendering of table headers in accordance with this state.
- The external environment must pass to the table correctly sorted rows in `props.data` responding to the `props.onSort` callback call.
- Grouping of column values is disabled (see [Column.group](#group)).

---

## Column

Columns let you flexibly customize rendering of cells.
In its simplest form, the column description looks as follows:

```json
{
  "name": "column_name"
}
```

The cell will show `row.column_name` as it is.

The `name` field is the only mandatory field. The remaining fields are described below:

| Property      | Type                                              | Description                                                                                                                                                                                                                                                                                     |
| :------------ | :------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name          | `string`                                          | Column name and default value for the `header` and `accessor`                                                                                                                                                                                                                                   |
| header        | `string` or `node`                                | Column header                                                                                                                                                                                                                                                                                   |
| headerTitle   | `string`                                          | Header title                                                                                                                                                                                                                                                                                    |
| className     | `string`                                          | Column class                                                                                                                                                                                                                                                                                    |
| width         | `string \| number`                                | Column width                                                                                                                                                                                                                                                                                    |
| align         | `DataTable.LEFT DataTable.CENTER DataTable.RIGHT` | Text alignment in a cell                                                                                                                                                                                                                                                                        |
| accessor      | `func`                                            | Callback `(row) => (value)`. Use it if you want to display deeply "hidden" values in the column. For example: `(row) => (row.child1.child2[0].value)`                                                                                                                                           |
| title         | `string` or `func:string`                         | Callback `(row) => (title)`. Lets you set a fixed title (in the case of `string`) or a dynamic title for column cells. Returns a string.                                                                                                                                                        |
| render        | `func:node`                                       | Callback `({value, row, index}) => (node)`. Lets you render a cell in an arbitrary way. As an input, it gets a value, a whole row, or a row index. Returns a React node.                                                                                                                        |
| customStyle   | `func`                                            | Callback `({row, index, header, name}) => (styleObject)`. Lets you set a custom style for the cell. In the callback, you pass a string with data, an index, a column name, and a flag whether the cell is a header. At the output, you expect an object with styles following the React syntax. |
| onClick       | `func`                                            | Callback `(row, column) => ()`. The onClick listener on the cell.                                                                                                                                                                                                                               |
| sortable      | `Boolean`                                         | Whether the column is sortable.                                                                                                                                                                                                                                                                 |
| defaultOrder  | `DataTable.ASCENDING DataTable.DESCENDING`        | A default sorting order in the column.                                                                                                                                                                                                                                                          |
| sortAccessor  | `func`                                            | Callback `(row) => (value)`. Use it if you want to sort by a value other than `value`, or if `value` is non-scalar.                                                                                                                                                                             |
| sortAscending | `func`                                            | Callback `({row, index, span?}, {row, index, span?}) => (sortValue)`. Use if you want to customize sorting completely.                                                                                                                                                                          |
| sub           | `array`                                           | Nested columns                                                                                                                                                                                                                                                                                  |
| group         | `Boolean`                                         | Groups the same values into one cell, allowing you to create complex tables. [More details](#group)                                                                                                                                                                                             |
| autogroup     | `Boolean`                                         | Enables ascending sorting across all columns with group, resulting in autogrouping. Defaults to `true`                                                                                                                                                                                          |

### group

Groups the same values into one cell. Please note that:

- Grouping is incompatible with the `Settings.dynamicRender` option, and, when they are enabled together, the table might work poorly.
- Grouping is disabled when the `Settings.externalSort` option is enabled
- It is worth disabling the `Settings.stripedRows` and `Settings.highlightRows` settings.

---

### Multi-level header

Nested columns are set up in the `sub` field. For columns with attachments, except for the `sub` field,
only fields that affect the header make sense: `name`, `header`, `headerTitle`, `align`, and `customStyle`.

### headerData

The `headerData` property lets you add rows to the beginning of the table. However, if the header is sticky, the rows will stick along with the header. In the sticky header mode, such rows won't affect the column width, so you might need to specify the column width.

### Customizing with themes

The table contains several customized elements.
To set colors for them, use CSS variables (in the example, the topic values are `internal`):

```css
--data-table-color-base: #ffffff;
--data-table-color-stripe: rgba(0, 0, 0, 0.03);
--data-table-border-color: #dddddd;
--data-table-color-hover-area: #ffeba0;
--data-table-color-footer-area: var(--data-table-color-base);
```

### Custom cell colors

Table cells can be rendered using an arbitrary style. **If used incorrectly, it might break the layout!**

### Using react-data-table with non-standard fonts

When using the `stickyHead` prop and a non-standard font for table data, sizes of header columns and table columns might mismatch. This might be the issue if the table data has been loaded and the table rendered before the browser has loaded a specific font.

To avoid this problem, load the desired font before rendering the table. You can do this in one
of the following ways:

1. Use `<link rel="preload">` in the `<head>` element of your HTML code

```html
<head>
  <meta charset="utf-8" />
  <title>Web font example</title>

  <link
    rel="preload"
    href="fonts/my-font.woff2"
    as="font"
    type="font/woff2"
    crossorigin="crossorigin"
  />
  <link
    rel="preload"
    href="fonts/my-font.woff"
    as="font"
    type="font/woff"
    crossorigin="crossorigin"
  />
  <link
    rel="preload"
    href="fonts/my-font.ttf"
    as="font"
    type="font/ttf"
    crossorigin="crossorigin"
  />

  <link href="style.css" rel="stylesheet" type="text/css" />
</head>
<body>
  ...
</body>
```

Please note that in this case, the font is loaded before all the content on the page is received and loaded. If you use this font only to render tables in your service, and tables aren't core to your service, the user will have to wait for a font they might never need again to upload. This method is also not supported by some modern browsers. Read more about this [here](https://developer.mozilla.org/ru/docs/Web/HTML/Preloading_content).

2. Use the [fontfaceobserver](https://github.com/bramstein/fontfaceobserver) package

To load a font from the JS code, first define it by the @font-face directive in the CSS code:

```scss
@font-face {
  font-family: 'My font';
  src: url('fonts/my-font.woff2') format('woff2'),
       url('fonts/my-font.woff') format('woff');
       url('fonts/my-font.ttf') format('ttf');
  font-weight: 400;
  font-style: normal;
}
```

Then you can preload the font directly with loading data for the table itself.

For one font face:

```js
import FontFaceObserver from 'fontfaceobserver';

function preloadTableFont() {
    return new FontFaceObserver('My font').load();
}

function fetchData() {
    ...
}

function getTableData() {
  return Promise.all([
    fetchData(),
    preloadTableFont(),
  ])
  .then([data] => {
    ...
  })
  .catch((err) => {
    ...
  })
}
```

For multiple font faces:

```js
import FontFaceObserver from 'fontfaceobserver';

const lightFont = new FontFaceObserver('My font', {weight: 300});
const regularFont = new FontFaceObserver('My font', {weight: 400});

function preloadTableFont() {
    return Promise.all([
        lightFont.load(),
        regularFont.load(),
    ]);
}

function fetchData() {
    ...
}

function getTableData() {
  return Promise.all([
    fetchData(),
    preloadTableFont(),
  ])
  .then([data] => {
    ...
  })
  .catch((err) => {
    ...
  })
}
```

This method is fully supported by browsers and lets you download the font only for users who have opened the table.

### Usage

```jsx harmony
const data = [];
const columns = [];
const startIndex = 0;

return <DataTable data={data} columns={columns} startIndex={startIndex} />;
```

For more information, see the sample code.
