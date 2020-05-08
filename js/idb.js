import { openDB } from 'idb';

export async function initDB() {
    const config = window.config;

    const db = await openDB('todo', config.version || 1, {
            upgrade(db) {
                const store = db.createObjectStore('items', {
                    keyPath: 'id',
                });

                store.createIndex('id', 'id');
                store.createIndex('done', 'done');
                store.createIndex('deleted', 'deleted');
                store.createIndex('sync', 'sync');
                store.createIndex('date', 'date');
            },
        }
    );

    return db;
}

export async function setTodo(data) {
    const db = await initDB();
    const tx = db.transaction('items', 'readwrite');
    await tx.store.put(data);

    return await db.getAllFromIndex('items', 'deleted', 'false');
}

export async function getTodo(id) {
    const db = await initDB();
    return await db.getFromIndex('items', 'id', parseInt(id));
}

export async function getNotSynced() {
    const db = await initDB();
    const tx = db.transaction('items', 'readwrite');

    return await db.getAllFromIndex('items', 'sync', 'false');
}

export async function getTodosLocal() {
    const db = await initDB();

    return await db.getAllFromIndex('items', 'delete', 'false');
}