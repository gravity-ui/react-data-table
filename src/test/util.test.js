/* eslint-env jest */
import {ASCENDING, DESCENDING} from '../lib/constants';
import {getSortOrder, getSortedData} from '../lib/util';

describe('Sort order switching', () => {
    const settings = {
        defaultOrder: DESCENDING,
    };

    const column1 = {
        name: 'id',
        defaultOrder: ASCENDING,
    };

    const column2 = {
        name: 'name',
        defaultOrder: DESCENDING,
    };

    const column3 = {
        name: 'data',
    };

    test('from none to default', () => {
        let state = {};
        state = getSortOrder(column1, state);
        expect(state).toEqual({sortOrder: {id: ASCENDING}, sortColumns: ['id']});
    });

    test('from default to reverse', () => {
        let state = {};
        state = getSortOrder(column1, state);
        state = getSortOrder(column1, state);
        expect(state).toEqual({sortOrder: {id: DESCENDING}, sortColumns: ['id']});
    });

    test('from none to none', () => {
        let state = {};
        state = getSortOrder(column1, state);
        state = getSortOrder(column1, state);
        state = getSortOrder(column1, state);
        expect(state).toEqual({sortOrder: {}, sortColumns: []});
    });

    test('immediate reset', () => {
        let state = {};
        state = getSortOrder(column1, state);
        state = getSortOrder({}, state);
        expect(state).toEqual({sortOrder: {}, sortColumns: []});
    });

    test('default without settings', () => {
        let state = {};
        state = getSortOrder(column3, state);
        expect(state).toEqual({sortOrder: {}, sortColumns: []});
    });

    test('default with settings', () => {
        let state = {};
        state = getSortOrder(column3, state, false, settings);
        expect(state).toEqual({sortOrder: {data: DESCENDING}, sortColumns: ['data']});
    });

    test('single sort another column', () => {
        let state = {};
        state = getSortOrder(column1, state);
        state = getSortOrder(column2, state);
        expect(state).toEqual({sortOrder: {name: DESCENDING}, sortColumns: ['name']});
    });

    test('multiple sort with unused column', () => {
        let state = {};
        state = getSortOrder(column1, state, true);
        state = getSortOrder(column2, state, true);
        expect(state).toEqual({
            sortOrder: {id: ASCENDING, name: DESCENDING},
            sortColumns: ['id', 'name'],
        });
    });

    test('multiple sort with used column', () => {
        let state = {};
        state = getSortOrder(column1, state, true);
        state = getSortOrder(column2, state, true);
        state = getSortOrder(column2, state, true);
        expect(state).toEqual({
            sortOrder: {id: ASCENDING, name: ASCENDING},
            sortColumns: ['id', 'name'],
        });
    });

    test('multiple sort to none', () => {
        let state = {sortOrder: {id: DESCENDING, name: DESCENDING}, sortColumns: ['id', 'name']};
        state = getSortOrder(column1, state, true);
        expect(state).toEqual({sortOrder: {name: DESCENDING}, sortColumns: ['name']});
    });

    test('multiple sort reset', () => {
        const state = {sortOrder: {id: DESCENDING, name: DESCENDING}, sortColumns: ['id', 'name']};
        expect(getSortOrder({}, state, true)).toEqual(state);
    });
});

describe('Data sorting', () => {
    const columns = [
        {
            name: 'id',
        },
        {
            name: 'name',
        },
        {
            name: 'data',
            sortAscending: ({row: row1}, {row: row2}) => {
                return row1.data.val - row2.data.val;
            },
        },
    ];

    columns.forEach((column) => {
        column._getSortValue = (row) => row[column.name];
    });

    const data = [
        {id: 1, name: 'Albert', data: {val: 5}},
        {id: 2, name: 'Stan', data: {val: 5}},
        {id: 3, name: 'Maria', data: {val: 5}},
        {id: 4, name: 'Harold', data: {val: 3}},
        {id: 5, name: 'Penelope', data: {val: 5}},
        {id: 6, name: 'Maria', data: {val: 3}},
    ];

    const sortedDataMap = ({row}) => row.id;

    test('simple ascending sorting', () => {
        const state = {sortOrder: {name: ASCENDING}, sortColumns: ['name']};
        const sortedData = getSortedData(data, columns, state, {}).map(sortedDataMap);
        expect(sortedData).toEqual([1, 4, 3, 6, 5, 2]);
    });

    test('simple descending sorting', () => {
        const state = {sortOrder: {name: DESCENDING}, sortColumns: ['name']};
        const sortedData = getSortedData(data, columns, state, {}).map(sortedDataMap);
        expect(sortedData).toEqual([2, 5, 3, 6, 4, 1]);
    });

    test('simple sorting with method', () => {
        const state = {sortOrder: {data: ASCENDING}, sortColumns: ['data']};
        const sortedData = getSortedData(data, columns, state, {}).map(sortedDataMap);
        expect(sortedData).toEqual([4, 6, 1, 2, 3, 5]);
    });

    test('multisorting data-name', () => {
        const state = {
            sortOrder: {data: ASCENDING, name: ASCENDING},
            sortColumns: ['data', 'name'],
        };
        const sortedData = getSortedData(data, columns, state, {}).map(sortedDataMap);
        expect(sortedData).toEqual([4, 6, 1, 3, 5, 2]);
    });

    test('multisorting name-data', () => {
        const state = {
            sortOrder: {data: ASCENDING, name: ASCENDING},
            sortColumns: ['name', 'data'],
        };
        const sortedData = getSortedData(data, columns, state, {}).map(sortedDataMap);
        expect(sortedData).toEqual([1, 4, 6, 3, 5, 2]);
    });

    test('sorting with externalSort property', () => {
        const state = {sortOrder: {name: ASCENDING}, sortColumns: ['name']};
        const sortedData = getSortedData(data, columns, state, {externalSort: true}).map(
            sortedDataMap,
        );
        expect(sortedData).toEqual([1, 2, 3, 4, 5, 6]);
    });
});
