const cors = require('cors');
const express = require('express');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
//mengambil seluruh produk
app.get('/api/alat', async (req, res) => {
    try {
        const result = await pool.query(
         'SELECT alat.*, kategori_alat.nama_kategori FROM alat JOIN kategori_alat ON alat.id_kategori = kategori_alat.id_kategori'
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Gagal mengambil seluruh produk:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data produk'
        });
    }
});
//mengambil satu produk dengan id produk
app.get('/api/alat/:id', async (req, res) => {
    const id_alat = Number(req.params.id);
    if (!id_alat) {
        return res.status(400).json({
            message: 'ID produk harus berupa bilangan bulat positif'
        });
    }
    try {
        const result = await pool.query(
            `SELECT * FROM alat WHERE id_alat = $1`,
            [id_alat]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Gagal mengambil produk:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data produk'
        });
    }
});
//delete alat
app.delete('/api/alat/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM alat WHERE id_alat = ?', [req.params.id]);
    res.json({ message: 'Berhasil dihapus' });
  } catch (err) {
    // ER_ROW_IS_REFERENCED_2 = masih dipakai di tabel peminjaman
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Tidak bisa dihapus! Alat ini masih ada riwayat peminjaman.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus alat' });
  }
});
//menambahkan alat
app.post('/api/alat', async (req, res) => {
    const { id_kategori, nama_alat, kondisi, stok, lokasi } = req.body;
    if (!id_kategori || !nama_alat || !kondisi || stok == null || !lokasi) {
        return res.status(400).json({
            message: 'Data alat tidak valid'
        });
    }
    try {
        const result = await pool.query(
            `INSERT INTO alat
(id_kategori, nama_alat, kondisi, stok, lokasi)
VALUES ($1, $2, $3, $4, $5)
RETURNING *`,
            [id_kategori, nama_alat.trim(), kondisi, stok, lokasi]
        );
        res.status(201).json({
            message: 'Alat berhasil ditambahkan',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Gagal menambahkan alat:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat menambahkan alat'
        });
    }
});

//perbarui alat sesuai id
app.put('/api/alat/:id_alat', async (req, res) => {
    const id_alat = Number(req.params.id_alat);
    const { nama_alat, kondisi, stok, lokasi } = req.body;
    if (!Number.isSafeInteger(id_alat) || id_alat <= 0) {
        return res.status(400).json({
            message: 'ID alat tidak valid'
        });
    }
    try {
        const result = await pool.query(
            `UPDATE alat
SET 
nama_alat = $1,
kondisi = $2,
stok = $3,
lokasi = $4
WHERE id_alat = $5
RETURNING *`,
            [nama_alat.trim(), kondisi, stok, lokasi, id_alat]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Alat tidak ditemukan'
            });
        }
        res.status(200).json({
            message: 'Alat berhasil diperbarui',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Gagal memperbarui alat:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat memperbarui alat'
        });
    }
});
//memanggil seluruh kategori
app.get('/api/kategori_alat', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM kategori_alat ORDER BY id_kategori'
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Gagal mengambil seluruh kategori:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data kategori'
        });
    }
});
//biar frontend yang pake /api/kategori juga jalan
app.get('/api/kategori', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM kategori_alat ORDER BY id_kategori'
        );
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data kategori' });
    }
});
//memanggil kategori dengan id
app.get('/api/kategori_alat/:id', async (req, res) => {
    const id = Number (req.params.id);
    if (!id) {
        return res.status(400).json({
            message: 'ID kategori harus berupa bilangan bulat positif'
        });
    }
    try {
        const result = await pool.query(
            'SELECT * FROM kategori_alat WHERE id_kategori = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Gagal mengambil kategori:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data kategori'
        });
    }
});
//memanggil semua peminjaman
app.get('/api/peminjaman', async (req, res) => {
    try {
        const result = await pool.query(
           'SELECT peminjaman.*, alat.nama_alat FROM peminjaman JOIN alat ON peminjaman.id_alat = alat.id_alat ORDER BY id_peminjaman'
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Gagal mengambil seluruh peminjaman:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data peminjaman'
        });
    }
});
//memanggil peminjaman berdasarkan id
app.get('/api/peminjaman/:id', async (req, res) => {
    const id = Number (req.params.id);
    if (!id) {
        return res.status(400).json({
            message: 'ID peminjaman harus berupa bilangan bulat positif'
        });
    }
    try {
        const result = await pool.query(
            'SELECT * FROM peminjaman WHERE id_peminjaman = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Peminjaman tidak ditemukan' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Gagal mengambil peminjaman:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data peminjaman'
        });
    }
});
//menambahkan peminjaman - UDAH DIBENERIN, tanggal_kembali BOLEH KOSONG / BOLEH DIISI
app.post('/api/peminjaman', async (req, res) => {
    const { id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status } = req.body;
    if (!id_alat || !nama_peminjam || !kelas || !tanggal_pinjam || jumlah == null || !status) {
        return res.status(400).json({
            message: 'Data peminjaman tidak valid'
        });
    }
    const tglKembaliFix = tanggal_kembali || null;
    try {
        const result = await pool.query(
            `INSERT INTO peminjaman
(id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *`,
            [id_alat, nama_peminjam.trim(), kelas, tanggal_pinjam, tglKembaliFix, jumlah, status]
        );
        res.status(201).json({
            message: 'Peminjaman berhasil ditambahkan',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Gagal menambahkan peminjaman:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat menambahkan peminjaman'
        });
    }
});
//perbarui peminjaman sesuai id
app.put('/api/peminjaman/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status } = req.body || {};
    if (!id) {
        return res.status(400).json({ message: 'ID peminjaman tidak valid' });
    }
    if (typeof nama_peminjam !== 'string' || !nama_peminjam.trim()) {
        return res.status(400).json({ message: 'Nama peminjam tidak boleh kosong' });
    }
    try {
        const result = await pool.query(
            `UPDATE peminjaman
             SET id_alat = $1,
                 nama_peminjam = $2,
                 kelas = $3,
                 tanggal_pinjam = $4,
                 tanggal_kembali = $5,
                 jumlah = $6,
                 status = $7
             WHERE id_peminjaman = $8
             RETURNING *`,
            [id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali || null, jumlah, status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Peminjaman tidak ditemukan' });
        }
        res.status(200).json({
            message: 'Peminjaman berhasil diperbarui',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Gagal memperbarui peminjaman:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat memperbarui peminjaman'
        });
    }
});
//menjalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    setInterval(() => {}, 1000);
});