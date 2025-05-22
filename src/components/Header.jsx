import { useState } from 'react';
import './Header.css'; // (opsional, untuk styling khusus header)
import logo from '../assets/pic.svg'; // pastikan path sesuai

import gambar9 from '../assets/gambar9.jpg'; // pastikan path sesuai

function Header() {
  const [showAbout, setShowAbout] = useState(false);
  const [showGuide, setShowGuide] = useState(false);


  return (
    <>
      <header className="header">
        <div className="header-left">
          <a href="/" className='app-logo-link'>
            <img src={logo} alt="Logo" className="app-logo" />
            <h1 className="app-title">Dompetin</h1>
          </a>
        </div>
        <div className="header-buttons">
          <button className="guide-btn" onClick={() => setShowGuide(true)}>
            Panduan
          </button>
          <button className="about-btn" onClick={() => setShowAbout(true)}>
            About
          </button>
        </div>
      </header>

      {showAbout && (
  <div className="modal-overlay" onClick={() => setShowAbout(false)}>
    <div className="modal-content about-modal" onClick={e => e.stopPropagation()}>
      <button className="close-btn" onClick={() => setShowAbout(false)}>Tutup</button>
      <h2>Tentang Kami</h2>
      <p className="about-desc">
        Dompetin adalah aplikasi manajemen keuangan yang membantu Anda mencatat pemasukan, pengeluaran, dan menganalisis tren keuangan secara mudah. Aplikasi ini hadir untuk mendukung pengelolaan keuangan yang lebih baik.
      </p>
      <div className="profiles-grid">
        <div className="profile-card">
          <div className="profile-avatar">
            <img src={gambar9} alt="Muhammad Iqbal Nugraha" />
          </div>
          <div className="profile-name">Muhammad Iqbal Nugraha</div>
          <div className="profile-role">Developer</div>
          <div className="profile-links">
            <a
              className="profile-ig"
              href="https://github.com/antasenaw"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      {showGuide && (
        <div className="modal-overlay" onClick={() => setShowGuide(false)}>
          <div className="modal-content guide-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowGuide(false)}>Tutup</button>
            <h2>Panduan Lengkap Penggunaan Aplikasi</h2>
            
            <div className="guide-content">
              <section className="guide-section">
                <h3>1. Mengelola Transaksi</h3>
                <ul>
                  <li>
                    <strong>Tambah Transaksi Baru</strong>
                    <p>Klik tombol "Tambah Transaksi" untuk mencatat transaksi baru. Isi detail berikut:</p>
                    <ul>
                      <li>Deskripsi: Nama atau keterangan transaksi</li>
                      <li>Jumlah: Nominal transaksi dalam Rupiah</li>
                      <li>Kategori: Pilih kategori yang sesuai</li>
                      <li>Tipe: Pilih Pemasukan atau Pengeluaran</li>
                      <li>Tanggal: Kapan transaksi terjadi</li>
                    </ul>
                    <div className="guide-tip">
                      Tip: Gunakan kategori yang tepat untuk analisis yang lebih akurat
                    </div>
                  </li>
                  <li>
                    <strong>Riwayat Transaksi</strong>
                    <p>Akses riwayat lengkap melalui tombol "Lihat Riwayat Lengkap". Fitur yang tersedia:</p>
                    <ul>
                      <li>Filter berdasarkan bulan</li>
                      <li>Pengelompokan per minggu</li>
                      <li>Detail saldo sebelumnya</li>
                      <li>Opsi hapus transaksi</li>
                    </ul>
                    <div className="guide-warning">
                      Peringatan: Penghapusan transaksi tidak dapat dibatalkan
                    </div>
                  </li>
                </ul>
              </section>

              <section className="guide-section">
                <h3>2. Analisis Data Keuangan</h3>
                <ul>
                  <li>
                    <strong>Analisis Kalkulus</strong>
                    <p>Fitur analisis mendalam menggunakan konsep matematika:</p>
                    <ul>
                      <li>Laju Perubahan: Menggunakan turunan untuk menganalisis kecepatan perubahan pengeluaran</li>
                      <li>Akumulasi: Perhitungan integral untuk total pemasukan</li>
                      <li>Titik Infleksi: Identifikasi perubahan tren signifikan</li>
                      <li>Model Pertumbuhan: Analisis pertumbuhan eksponensial</li>
                    </ul>
                    <div className="guide-note">
                      Note: Klik pada setiap kartu analisis untuk detail lebih lanjut
                    </div>
                  </li>
                  <li>
                    <strong>Visualisasi Data</strong>
                    <p>Tersedia beberapa jenis visualisasi:</p>
                    <ul>
                      <li>Grafik Batang: Perbandingan pemasukan dan pengeluaran bulanan</li>
                      <li>Diagram Pie: Distribusi kategori transaksi</li>
                      <li>Grafik Garis: Tren saldo dari waktu ke waktu</li>
                    </ul>
                  </li>
                </ul>
              </section>

              <section className="guide-section">
                <h3>3. Fitur Statistik & Monitoring</h3>
                <ul>
                  <li>
                    <strong>Dashboard Utama</strong>
                    <p>Informasi penting yang ditampilkan:</p>
                    <ul>
                      <li>Saldo Terkini</li>
                      <li>Total Pemasukan</li>
                      <li>Total Pengeluaran</li>
                      <li>Jumlah Transaksi</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Pemantauan Tren</strong>
                    <p>Fitur monitoring keuangan:</p>
                    <ul>
                      <li>Tren bulanan</li>
                      <li>Perbandingan periode</li>
                      <li>Pola pengeluaran</li>
                      <li>Indikator pertumbuhan</li>
                    </ul>
                    <div className="guide-tip">
                      Tip: Gunakan filter bulan untuk analisis periode spesifik
                    </div>
                  </li>
                </ul>
              </section>

              <section className="guide-section">
                <h3>4. Tips Penggunaan Optimal</h3>
                <ul>
                  <li>
                    <strong>Pencatatan Rutin</strong>
                    <p>Untuk hasil optimal:</p>
                    <ul>
                      <li>Catat transaksi segera setelah terjadi</li>
                      <li>Gunakan kategori yang konsisten</li>
                      <li>Periksa riwayat secara berkala</li>
                      <li>Manfaatkan fitur analisis untuk evaluasi</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Analisis Berkala</strong>
                    <p>Langkah-langkah evaluasi rutin:</p>
                    <ul>
                      <li>Periksa tren mingguan/bulanan</li>
                      <li>Evaluasi distribusi pengeluaran</li>
                      <li>Pantau pertumbuhan saldo</li>
                      <li>Sesuaikan strategi berdasarkan analisis</li>
                    </ul>
                    <div className="guide-note">
                      Note: Analisis rutin membantu pengambilan keputusan keuangan yang lebih baik
                    </div>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
  
}

export default Header;