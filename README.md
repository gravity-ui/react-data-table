# React Data Table
Реактовый компонент для рендеринга таблиц.

Поддерживается группировка ячеек: строки в первую очередь сортируются по группируемым колонкам. Группировка
несовместима с опцией `dynamicRender`.

Также поддержана многоколоночная сортировка. Ctrl+Click на колонку добавляет колонку в конец списка
сортировки. Простой Click сортирует таблицу только по этой колонке. Переключение сортировки осуществляется
по схеме `none -> default -> reversed default -> none`.

## Properties
| Property     | Type       | Required | Default | Description |
|:---          |:---        |:---:     |:---     |:---         |
| columns      | `Array`    | ✓        |         | Список [колонок таблицы](#Column) |
| headerData   | `Array`    |          |         | Список строк с данными, которые будут отображаться вместе с заголовком, в случае прилипающего заголовка эти строки тоже будут прилипать. К ним применяются те же методы, как и к строкам в `data` ([headerData](#headerData))|
| data         | `Array`    | ✓        |         | Список строк с данными |
| footerData   | `Array`    |          |         | Список строк с данными, которые будут отправлены в футере таблицы. К ним применяются те же методы, как и к строкам в `data` |
| startIndex   | `Number`   |          | `0`     | Начальный индекс (используется при отображении индексов строк) |
| settings     | `Object`   |          |         | [Настройки таблицы](#Settings) |
| emptyDataMessage | `String`   |      |'No data'| Сообщение, появляющееся при пустых данных |
| renderEmptyRow | `Function` |        |         | Кастомынй отрисовщик строки пустой таблицы, принимает массив колонок `(columns) => ReactNode`
| rowClassName | `Function` |          |         | Метод, устанавливающий класс для строки `(row, index, isFooterRow, isHeaderRow) => (<string>)` |
| rowKey       | `Function` |          |         | Метод, возвращающий значение react-key `(row, index) => (<scalar_type_value>)`. Метод по умолчанию возвращает `row.id` &#124;&#124;` index` |
| initialSortOrder | `Object`   |      |         | Начальная сортировка в формате `{columnId: <string>, order: <DataTable.ASCENDING `&#124;` DataTable.DESCENDING>}`, или список таких объектов. |
| theme        | `String`   |          |'yandex-cloud' | Имя темы. Для использования встроенной темы таблицы используется значение `legacy`, для совместимости с цветами @yandex-cloud/uikit используйте 'yandex-cloud' (по умолчанию) |
| onSort       | `Function` |          |         | Обработчик сортировки `([{columnId: <string>, order: <DataTable.ASCENDING `&#124;` DataTable.DESCENDING>}]) => void`. Можно использовать для сохранения состояния сортировки и передачи в initialSortOrder при рефреше страницы. |
| sortOrder    | `Object`   |          |         | Сортировка в формате `{columnId: <string>, order: <DataTable.ASCENDING `&#124;` DataTable.DESCENDING>}`, или список таких объектов. |
| visibleRowIndex | `Function` |       |         | Метод `(row, index) => number`, возвращающий значение индекса строки для отображения в колонке включаемой настройкой `displayIndices`. Может использоваться для правильного указания индекса строки при внешней сортировки|
| onRowClick   | `Function` |          |         | Обработчик клика по строке `(row, index, event) => void` |
| nullBeforeNumbers   | `Boolean` |          |         | Флаг, который задает положение null/undefined значений при сортировке. При true, null/undefined значения будут вверху при сортировке по возрастанию и в конце при сортировке по убыванию. При false/undefined – в конце |

## Settings
| Property               | Type       | Default | Description |
|:---                    |:---        |:---     |:---         |
| displayIndices         | `Boolean`  | `true`  | Показывать ли индексы строк (начиная со `startIndex`) |
| stickyHead             | `DataTable.FIXED DataTable.MOVING` | Включить прилипающую шапку в одном из двух режимов. Режим `DataTable.FIXED` используется, если контейнер таблицы неподвижен относительно страницы. Если страницу с контейнером можно проскроллить, то уместнее `DataTable.MOVING`, но с одной оговоркой: нужна поддержка `position: sticky` в браузере. В противном случае, прилипающая шапка будет полностью отключена.|
| stickyTop              | `Number`   |         | Приклеивать шапку на нужной высоте (в режиме `DataTable.MOVING`). Следует использовать, если в скроллящемся контейнере содержится еще контент помимо таблицы. Если шапка приклеивается не к краю контейнера, стоит использовать аккуратно спозиционированные заслонки, чтобы контент таблицы на торчал с верхней стороны шапки. |
| stickyFooter           | see stickyHead |     | Аналог `stickyHead` для `footerData`
| stickyBottom           | `Number`   |         | Приклеивать строки из `footerData` c нужным отступом снизу (в режиме `DataTable.MOVING`).
| syncHeadOnResize       | `Boolean`  | `false` | Синхронизировать размеры прилипающей шапки при ресайзе окна |
| dynamicInnerRef        | React.RefObject&lt;DynamicInnerRefT&gt; | | ref для получения интстанса ReactList на случай если необходимо вызывать методы напрямую, например, [RecctList.scrollTo](https://github.com/caseywebdev/react-list#scrolltoindex). `DynamicInnerRefT` экспортируется также как Settings для корректного определения типа без добавления ReactList в зависимости проекта.
| dynamicRender          | `Boolean`  | `false` | Динамический рендеринг строк (только во вьюпорте). Требует специфической верстки |
| dynamicRenderType      | `String`   | 'uniform' | [ReactList.type](https://github.com/coderiety/react-list#type-one-of-simple-variable-or-uniform-defaults-to-simple)|
| dynamicItemSizeEstimator | `Function` |       | [ReactList.itemSizeEstimator](https://github.com/coderiety/react-list#itemsizeestimatorindex-cache)|
| dynamicItemSizeGetter  | `Function` |         | [ReactList.itemSizeGetter](https://github.com/coderiety/react-list#itemsizegetterindex)|
| dynamicRenderMinSize   | `Number`   | `1`     | Минимальное количество строк которое будет отрендерено в любом случае, даже если для заполнения высоты контейнера достаточно меньшего количества строк (имеет смысл если активен dynamicRender). Значение передаётся [в свойство `minSize` компонента ReactList](https://github.com/coderiety/react-list#minsize-defaults-to-1).  |
| dynamicRenderUseStaticSize|`Boolean`| `false` | [ReactList.useStaticSize](https://github.com/caseywebdev/react-list#usestaticsize-defaults-to-false)
| dynamicRenderThreshold | `Number`   |         | [ReactList.threshold](https://github.com/caseywebdev/react-list#threshold-defaults-to-100)
| dynamicRenderScrollParentGetter|`Funciction`| | [ReactList.scrollParentGetter](https://github.com/caseywebdev/react-list#scrollparentgetter-defaults-to-finding-the-nearest-scrollable-parent)
| dynamicRenderScrollParentViewportSizeGetter|`Function`|| [ReactList.scrollParentViewportSizeGetter](https://github.com/caseywebdev/react-list#scrollparentviewportsizegetter-defaults-to-scrollparents-viewport-size)
| sortable               | `Boolean`  | `true`  | Включить возможность сортировки для таблицы в целом |
| externalSort           | `Boolean`  | `false` | Отключить сортировку данных со стороны компонента. [Подробнее](#externalSort) |
| disableSortReset       | `Boolean`  | `false` | Отключить возможность сброса сортировки (включает схему сортировки `none -> default <-> reversed default`) |
| defaultOrder           | `DataTable.ASCENDING DataTable.DESCENDING`   | `DataTable.ASCENDING` | Порядок сортировки в таблице по умолчанию |
| highlightRows          | `Boolean`  |         | Подсвечивать ли строки таблицы при наведении |
| stripedRows            | `Boolean`  |         | Раскрашивать ли четные/нечетные строки |
| headerMod              | `multiline` `pre` |         | Разрешить заголовку быть многострочным (значение `multiline`) или преформатированным (значение `pre`) |
### externalSort
Отключает сортировку данных со стороны компонента. Следует отметить, что:
- таблица продолжает оставаться первоисточником состояния сортировки (выбранные колонки и направление сортировки), а также отвечает за правильную отрисовку заголовков таблицы в соответствии с этим состоянием;
- внешнее окружение должно передавать в таблицу правильно отсортированные строки в `props.data`, реагируя на вызов колбека `props.onSort`;
- отключается группировка значений колонок (см. [Column.group](#group));
----
## Column
Колонки позволяют гибко настраивать отображение ячеек.
В самом простом виде описание колонки выглядит так:
```json
{
  "name": "column_name"
}
```
В ячейке будет выведено значение `row.column_name` как есть.

Поле `name` - единственное обязательное. Остальные поля описаны ниже:

| Property      | Type                | Description |
|:---           |:---                 |:---       |
| name          | `string`            | Имя колонки и дефолтное значение для `header` и `accessor` |
| header        | `string` or `node`  | Заголовок колонки |
| headerTitle   | `string`            | Тайтл заголовка |
| className     | `string`            | Класс колонки |
| width         | `string`            | Ширина колонки |
| align         | `DataTable.LEFT DataTable.CENTER DataTable.RIGHT` | Выравнивание текста в ячейке |
| accessor      | `func`              | Callback `(row) => (value)`. Можно использовать, если в колонке надо отображать глубоко "спрятанные" значения. Например `(row) => (row.child1.child2[0].value)` |
| title         | `string` or `func:string` | Callback `(row) => (title)`. Позволяет задавать ячейкам колонки фиксированный (в случае `string`) или динамический тайтл. Возвращает строку. |
| render        | `func:node`         | Callback `({value, row, index}) => (node)`. Позволяет произвольно рендерить ячейку. На вход получает значение, строку целиком и индекс строки. Возвращает react node. |
| customStyle   | `func`              | Callback `({row, index, header, name}) => (styleObject)`. Позволяет задать ячейке кастомный стиль. В callback передается строка с данными, индекс, имя колонки и флаг, является ли ячейка заголовком. На выходе ожидается объект со стилями в react-синтаксисе. |
| onClick       | `func`              | Callback `(row, column) => ()`. Обработчик события onClick на ячейке. |
| sortable      | `Boolean`           | Является ли колонка сортируемой. |
| defaultOrder  | `DataTable.ASCENDING DataTable.DESCENDING`   | Порядок сортировки колонки по умолчанию. |
| sortAccessor  | `func`              | Callback `(row) => (value)`. Можно использовать, если хочется сортировать по значению, отличному от `value`, или если в `value` не скалярное значение. |
| sortAscending | `func`              | Callback `({row, index, span?}, {row, index, span?}) => (sortValue)`. Можно использовать, если нужна полностью кастомная сортировка. |
| sub           | `array`             | Вложенные колонки
| group         | `Boolean`           | Группирует одинаковые значения в одну ячейку, позволяя делать сложные таблицы. [Подробнее](#group) |
| autogroup     | `Boolean`           | Включает сортировку по возрастанию по всем колонкам с group, что в результате дает автогруппировку. По умолчанию `true`  |
### group
Группирует одинаковые значения в одну ячейку. Следует отметить, что:
- группировка несовместима с опцией `Settings.dynamicRender`, и при одновременном включении таблица будет работать непредсказуемо (плохо);
- группировка отключается при включении опции `Settings.externalSort`;
- стоит отключить настройки `Settings.stripedRows` и `Settings.highlightRows`;
----
### Многоуровневая шапка
Вложенные колонки задаются в поле `sub`. У колонок с вложениями, кроме поля `sub`,
имеют смысл только поля, влияющие на заголовок - `name`, `header`, `headerTitle`, `align`, `customStyle`.

### headerData
Свойство `headerData` позволяет добавлять строки в начало таблицы. При этом в случае прилипающего заголовка
эти строки будут прилипать вместе с заголовком. В режиме прилипающего заголовка эти строки не влияют на
ширину колонок, поэтому может понадобиться устанавливать ширину колонок.

### Темы
Таблица содержит несколько кастомизируемых элементов.
Цвета для них можно задать в css-переменных (в примере - значения темы `internal`):
```css
--data-table-color-base: #ffffff;
--data-table-color-stripe: rgba(0, 0, 0, 0.03);
--data-table-border-color: #dddddd;
--data-table-color-hover-area: #ffeba0;
--data-table-color-footer-area: var(--data-table-color-base);
```

### Кастомная раскраска ячеек
Ячейкам таблицы произвольный стиль. **При неправильном использовании верстка может поломаться!**

### Использование react-data-table с нестандартными шрифтами
При одновременном использования пропса `stickyHead` и нестандартного шрифта для отображения данных таблицы,
может возникнуть проблема рассинхронизации размеров колонок шапки и колонок самой таблицы. Это возникает в
том случае, если данные для таблицы были загружены, а сама таблица отрисована до загрузки браузером
специфичного шрифта.

Что бы избежать этой проблемы необходимо загружать нужный шрифт до рендера таблицы. Сделать это можно одним
из следующий способов:
1. Использовать `<link rel="preload">` в элементе `<head>` вашего HTML кода

```html
<head>
  <meta charset="utf-8">
  <title>Web font example</title>

  <link rel="preload" href="fonts/my-font.woff2" as="font" type="font/woff2" crossorigin="crossorigin">
  <link rel="preload" href="fonts/my-font.woff" as="font" type="font/woff" crossorigin="crossorigin">
  <link rel="preload" href="fonts/my-font.ttf" as="font" type="font/ttf" crossorigin="crossorigin">

  <link href="style.css" rel="stylesheet" type="text/css">
</head>
<body>
  ...
</body>
```
Обратите внимание, что в таком случае шрифт загрузится перед получением и отрисовкой всего контента на
странице. Если в сервисе данный шрифт не используется нигде, кроме показа таблиц, а таблицы -- не основная
часть всего сервиса, то пользователь будет ожидать загрузки шрифта, который ему может не пригодиться. Так же
данный способ поддерживается не всеми современными браузерами. Подробней можно почитать
[тут](https://developer.mozilla.org/ru/docs/Web/HTML/Preloading_content).

2. Использовать пакет [fontfaceobserver](https://github.com/bramstein/fontfaceobserver)

Что бы загрузить шрифт из js кода, сначала нужно определить его как обычно через директиву @font-face в css коде:
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
Затем уже можно предзагрузить шрифт непосредственно с загрузкой данных для самой таблицы.

Для одного начертания:
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

Для нескольких начертаний:
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
Данный способ позволяет загрузить шрифт только для тех пользователей, которые открыли таблицу, а так же имеет
полную браузерную поддержку.

### Usage
```jsx harmony
const data = [];
const columns = [];
const startIndex = 0;

return (
    <DataTable
        data={data}
        columns={columns}
        startIndex={startIndex}/>
);
```

Подробнее можно посмотреть в коде примеров.
