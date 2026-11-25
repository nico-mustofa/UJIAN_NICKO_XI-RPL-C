// 1. Fungsi memuat daftar alat ke dalam tabel
async function loadAlat() {
    const alatList = document.getElementById('alat-list');
    if (!alatList) return;
    try {
        const response = await fetch('http://localhost:3000/api/alat');
        const result = await response.json();
        alatList.innerHTML = '';
        if (result && result.length > 0) {
            result.forEach(alat => {
                const row = `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="py-4 px-6 font-medium text-gray-900">${alat.nama_alat}</td>
                    <td class="py-4 px-6 font-medium text-gray-900">${alat.nama_kategori}</td>
                    <td class="py-4 px-6 font-medium text-gray-900">${alat.kondisi}</td>
                    <td class="py-4 px-6 text-gray-900">${alat.stok}</td>
                    <td class="py-4 px-6 text-gray-900">${alat.lokasi}</td>
                    <td class="py-4 px-6">
                    <button onclick="editAlat(${alat.id_alat})">Edit</button>
                    <button onclick="hapusAlat(${alat.id_alat})">Hapus</button>
                    </td>
                </tr>`;
                alatList.innerHTML += row;
            });
        } else {
            alatList.innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-gray-500">Belum ada produk yang ditambahkan.</td></tr>`;
        }
    } catch (error) {
        console.error('Gagal mengambil data produk:', error);
        document.getElementById('alat-list').innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-red-500">Gagal memuat data produk. Pastikan server aktif.</td></tr>`;
    }
}

// 2. Fungsi memuat daftar peminjaman ke dalam tabel
async function loadPeminjaman() {
    const alatList = document.getElementById('peminjaman-list');
    if (!alatList) return;
    try {
        const response = await fetch('http://localhost:3000/api/peminjaman');
        const result = await response.json();
        alatList.innerHTML = '';
        if (result && result.length > 0) {
            result.forEach(datapinjaman => {
                const row = `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="py-4 px-6 font-medium text-gray-900">${datapinjaman.nama_peminjam}</td>
                    <td class="py-4 px-6 font-medium text-gray-900">${datapinjaman.nama_alat}</td>
                    <td class="py-4 px-6 font-medium text-gray-900">${datapinjaman.kelas}</td>
                    <td class="py-4 px-6 font-medium text-gray-900">${datapinjaman.tanggal_pinjam ? datapinjaman.tanggal_pinjam.slice(0,10) : '-'}</td>
                    <td class="py-4 px-6 text-center text-gray-900">${datapinjaman.tanggal_kembali ? datapinjaman.tanggal_kembali.slice(0,10) : '-'}</td>
                    <td class="py-4 px-6 text-gray-900">${datapinjaman.jumlah}</td>
                    <td class="py-4 px-6 text-gray-900">${datapinjaman.status}</td>
                    <td class="py-4 px-6">
                    <button onclick="editPeminjaman(${datapinjaman.id_peminjaman})">Edit</button>
                    <button onclick="hapusPeminjaman(${datapinjaman.id_peminjaman})">Hapus</button>
                    </td>
                </tr>`;
                alatList.innerHTML += row;
            });
        } else {
            alatList.innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-gray-500">Belum ada produk yang ditambahkan.</td></tr>`;
        }
    } catch (error) {
        console.error('Gagal mengambil data produk:', error);
        document.getElementById('Peminjaman-list').innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-red-500">Gagal memuat data produk. Pastikan server aktif.</td></tr>`;
    }
}

// 3. Fungsi memuat daftar kategori ke dalam tabel
async function loadKategori() {
    const kategoriList = document.getElementById('kategori-list');
    if (!kategoriList) return;
    try {
        const response = await fetch('http://localhost:3000/api/kategori_alat');
        const result = await response.json();
        kategoriList.innerHTML = '';
        if (result && result.length > 0) {
            result.forEach(kategori => {
                const row = `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="py-4 px-6 font-medium text-gray-900">${kategori.id_kategori}</td>
                    <td class="py-4 px-6 font-medium text-gray-900">${kategori.nama_kategori}</td>
                    <td class="py-4 px-6 text-gray-900">${kategori.deskripsi}</td>
                </tr>`;
                kategoriList.innerHTML += row;
            });
        } else {
            kategoriList.innerHTML = `<tr><td colspan="4" class="py-4 px-6 text-center text-gray-500">Belum ada kategori yang ditambahkan.</td></tr>`;
        }
    } catch (error) { console.error('Gagal mengambil data kategori:', error); }
}

//edit and delete alat
document.addEventListener('DOMContentLoaded', () => { loadAlat(); loadPeminjaman(); loadKategori(); });
async function hapusAlat(id) {
  // Cek dulu, alat ini masih dipinjam nggak?
  const resP = await fetch('http://localhost:3000/api/peminjaman');
  const resultP = await resP.json();
  const listP = Array.isArray(resultP) ? resultP : resultP.data;

  const masihDipinjam = listP.find(p => p.id_alat == id && (p.status || '').trim().toLowerCase() !== 'dikembalikan');

  if (masihDipinjam) {
    alert(`Tidak bisa dihapus!\n\nAlat ini masih dipinjam oleh ${masihDipinjam.nama_peminjam} (${masihDipinjam.kelas}).\nStatus: ${masihDipinjam.status}\n\nTunggu sampai dikembalikan dulu.`);
    return;
  }

  if (!confirm("Yakin hapus?")) return;

  const res = await fetch(`http://localhost:3000/api/alat/${id}`, { method: "DELETE" });

  // Kalau backend nolak (misal masih ada riwayat peminjaman), tampilin notifnya, jangan diam aja
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    alert(data.message || 'Tidak bisa dihapus! Alat ini masih ada riwayat peminjamannya.');
    return;
  }

  loadAlat();
}

async function editAlat(id) {
  const res = await fetch('http://localhost:3000/api/alat');
  const list = await res.json();
  const a = list.find(x => x.id_alat == id);
  if(!a) return;
  const resK = await fetch('http://localhost:3000/api/kategori_alat');
  const listK = await resK.json();
  const sel = document.getElementById('edit_kategori');
  sel.innerHTML = '';
  listK.forEach(k=>{ const opt = document.createElement('option'); opt.value = k.id_kategori; opt.textContent = k.nama_kategori; sel.appendChild(opt); });
  document.getElementById('edit_id').value = a.id_alat;
  document.getElementById('edit_kategori').value = a.id_kategori;
  document.getElementById('edit_nama').value = a.nama_alat;
  document.getElementById('edit_kondisi').value = a.kondisi;
  document.getElementById('edit_stok').value = a.stok;
  document.getElementById('edit_lokasi').value = a.lokasi;
  document.getElementById('formEditBox').hidden = false;
  window.scrollTo(0, document.body.scrollHeight);
}
document.getElementById('formEditAlat')?.addEventListener('submit', async function(e){
  e.preventDefault();
  const id = document.getElementById('edit_id').value;
  await fetch(`http://localhost:3000/api/alat/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_kategori: document.getElementById('edit_kategori').value,
      nama_alat: document.getElementById('edit_nama').value,
      kondisi: document.getElementById('edit_kondisi').value,
      stok: document.getElementById('edit_stok').value,
      lokasi: document.getElementById('edit_lokasi').value
    })
  });
  document.getElementById('formEditBox').hidden = true;
  loadAlat();
});

//edit and delete peminjaman
document.addEventListener('DOMContentLoaded', () => { loadAlat(); loadPeminjaman(); loadKategori(); });
async function hapusPeminjaman(id) {
  const res = await fetch('http://localhost:3000/api/peminjaman');
  const result = await res.json();
  const list = Array.isArray(result) ? result : result.data;
  const p = list.find(x => x.id_peminjaman == id);

  console.log('Yang mau dihapus:', p);

  if (p && (p.status === 'Dipinjam' || p.status === 'Terlambat')) {
    alert(`Tidak bisa dihapus!\n\nAlat "${p.nama_alat}" masih dipinjam oleh ${p.nama_peminjam} (${p.kelas}).\nStatus: ${p.status}\n\nTunggu sampai dikembalikan dulu, atau edit jadi Dikembalikan.`);
    return;
  }

  if (!confirm("Yakin hapus?")) return;
  await fetch(`http://localhost:3000/api/peminjaman/${id}`, { method: "DELETE" });
  loadPeminjaman();
}
async function editPeminjaman(id) {
  const res = await fetch('http://localhost:3000/api/peminjaman');
  const result = await res.json();
  const list = Array.isArray(result) ? result : result.data;
  const p = list.find(x => x.id_peminjaman == id);
  if(!p) return;
  const resA = await fetch('http://localhost:3000/api/alat');
  const listA = await resA.json();
  const sel = document.getElementById('edit_alat');
  sel.innerHTML = '';
  listA.forEach(a=>{ const opt = document.createElement('option'); opt.value = a.id_alat; opt.textContent = a.nama_alat; sel.appendChild(opt); });
  document.getElementById('edit_id_peminjaman').value = p.id_peminjaman;
  document.getElementById('edit_alat').value = p.id_alat;
  document.getElementById('edit_peminjam').value = p.nama_peminjam;
  document.getElementById('edit_kelas').value = p.kelas;
  document.getElementById('edit_tgl_pinjam').value = p.tanggal_pinjam ? p.tanggal_pinjam.slice(0,10) : '';
  document.getElementById('edit_tgl_kembali').value = p.tanggal_kembali ? p.tanggal_kembali.slice(0,10) : '';
  document.getElementById('edit_jumlah').value = p.jumlah;
  document.getElementById('edit_sudah').checked = (p.status === 'Dikembalikan');
  updateStatusPeminjaman();
  document.getElementById('formEditBoxPeminjaman').hidden = false;
  window.scrollTo(0, document.body.scrollHeight);
}
function hitungStatusPeminjaman(){
  const tglKembali = document.getElementById('edit_tgl_kembali').value;
  const sudah = document.getElementById('edit_sudah').checked;
  if(sudah) return 'Dikembalikan';
  if(!tglKembali) return 'Dipinjam';
  const hariIni = new Date(); hariIni.setHours(0,0,0,0);
  const kembali = new Date(tglKembali); kembali.setHours(0,0,0,0);
  return kembali < hariIni ? 'Terlambat' : 'Dipinjam';
}
function updateStatusPeminjaman(){
  const el = document.getElementById('edit_status');
  if(el) el.value = hitungStatusPeminjaman();
}
document.getElementById('edit_tgl_kembali')?.addEventListener('change', updateStatusPeminjaman);
document.getElementById('edit_sudah')?.addEventListener('change', updateStatusPeminjaman);
document.getElementById('formEditPeminjaman')?.addEventListener('submit', async function(e){
  e.preventDefault();
  const id = document.getElementById('edit_id_peminjaman').value;
  await fetch(`http://localhost:3000/api/peminjaman/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_alat: document.getElementById('edit_alat').value,
      nama_peminjam: document.getElementById('edit_peminjam').value,
      kelas: document.getElementById('edit_kelas').value,
      tanggal_pinjam: document.getElementById('edit_tgl_pinjam').value,
      tanggal_kembali: document.getElementById('edit_tgl_kembali').value || null,
      jumlah: document.getElementById('edit_jumlah').value,
      status: hitungStatusPeminjaman()
    })
  });
  document.getElementById('formEditBoxPeminjaman').hidden = true;
  loadPeminjaman();
});