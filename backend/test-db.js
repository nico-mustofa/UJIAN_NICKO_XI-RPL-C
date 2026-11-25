const pool = require('./db');
async function testConnection() {
    try {
        const result = await pool.query(
            'SELECT * from kategori_alat'
        );
        console.log('Jumlah data yang ditampilkan:', result.rows.length);
        console.table(result.rows);
    } catch (error) {
        console.error('Gagal membaca tabel kategori_alat.');
        console.error(error.message);
    } finally {
        await pool.end();
    }
}
testConnection();






/*const pool = require('./db');

async function testProducts() {
    try {
        // Membaca tabel products
        const resultProducts = await pool.query(
            'SELECT * FROM products LIMIT 5'
        );

        console.log(
            'Jumlah data products yang ditampilkan:',
            resultProducts.rows.length
        );
        console.table(resultProducts.rows);

        // Membaca tabel categories
        const resultCategories = await pool.query(
            'SELECT * FROM categories LIMIT 5'
        );

        console.log(
            'Jumlah data categories yang ditampilkan:',
            resultCategories.rows.length
        );
        console.table(resultCategories.rows);

    } catch (error) {
        console.error('Gagal membaca tabel products atau categories.');
        console.error(error.message);

    } finally {
        await pool.end();
    }
}

testProducts();*/
