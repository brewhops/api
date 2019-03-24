"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crud_1 = require("../crud");
describe('CrudController ', () => {
    let tableName;
    let controller;
    let columns;
    let conditions;
    let escapes;
    beforeAll(() => {
        tableName = 'test-table';
        controller = new crud_1.CrudController(tableName);
        escapes = ['escapes'];
        columns = 'columns';
        conditions = 'conditions';
    });
    beforeEach(() => {
        controller = new crud_1.CrudController(tableName);
    });
    it('create', async () => {
        controller.pool.query = jest.fn();
        await controller.create(columns, conditions, escapes);
        expect(controller.pool.query).toHaveBeenCalledWith(`INSERT INTO ${tableName} (${columns}) VALUES (${conditions}) RETURNING *`, escapes);
    });
    it('createInTable', async () => {
        controller.pool.query = jest.fn();
        await controller.createInTable(columns, tableName, conditions, escapes);
        expect(controller.pool.query).toHaveBeenCalledWith(`INSERT INTO ${tableName} (${columns}) VALUES (${conditions}) RETURNING *`, escapes);
    });
    it('read', async () => {
        controller.pool.query = jest.fn();
        await controller.read(columns, conditions, escapes);
        expect(controller.pool.query).toHaveBeenCalledWith(`SELECT ${columns} FROM ${tableName} WHERE (${conditions})`, escapes);
    });
    it('readById', async () => {
        controller.pool.query = jest.fn();
        await controller.readById(escapes);
        expect(controller.pool.query).toHaveBeenCalledWith(`SELECT * FROM ${tableName} WHERE id = $1`, [escapes]);
    });
    it('readByUsername', async () => {
        controller.pool.query = jest.fn();
        await controller.readByUsername(columns);
        expect(controller.pool.query).toHaveBeenCalledWith(`SELECT * FROM ${tableName} WHERE username = $1`, [columns]);
    });
    it('readInTable', async () => {
        controller.pool.query = jest.fn();
        await controller.readInTable(columns, tableName, conditions, escapes);
        expect(controller.pool.query).toHaveBeenCalledWith(`Select ${columns} FROM ${tableName} WHERE ${conditions}`, escapes);
    });
    it('update', async () => {
        controller.pool.query = jest.fn();
        await controller.update(columns, conditions, escapes);
        expect(controller.pool.query).toHaveBeenCalledWith(`UPDATE ${tableName} SET ${columns} WHERE ${conditions} RETURNING *`, escapes);
    });
    it('updateInTable', async () => {
        controller.pool.query = jest.fn();
        await controller.updateInTable(columns, tableName, conditions, escapes);
        expect(controller.pool.query).toHaveBeenCalledWith(`UPDATE ${tableName} SET ${columns} WHERE ${conditions} RETURNING *`, escapes);
    });
    it('delete', async () => {
        controller.pool.query = jest.fn();
        await controller.delete(conditions, escapes);
        expect(controller.pool.query).toHaveBeenCalledWith(`DELETE FROM ${tableName} WHERE ${conditions}`, escapes);
    });
    it('deleteById', async () => {
        controller.pool.query = jest.fn();
        await controller.deleteById(escapes);
        expect(controller.pool.query).toHaveBeenCalledWith(`DELETE FROM ${tableName} WHERE id = $1`, [escapes]);
    });
    it('deleteByTable', async () => {
        controller.pool.query = jest.fn();
        await controller.deleteInTable(tableName, conditions, escapes);
        expect(controller.pool.query).toHaveBeenCalledWith(`DELETE FROM ${tableName} WHERE ${conditions}`, escapes);
    });
});
//# sourceMappingURL=crud.test.js.map