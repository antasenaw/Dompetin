// filepath: src/components/BalanceSection.jsx
function BalanceSection({ balance, formatRupiah, transactions }) {
  // Hitung pemasukan & pengeluaran bulan ini
  const now = new Date();
  const incomeThisMonth = transactions
    .filter(t => t.type === 'income' &&
      new Date(t.date).getMonth() === now.getMonth() &&
      new Date(t.date).getFullYear() === now.getFullYear())
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseThisMonth = transactions
    .filter(t => t.type === 'expense' &&
      new Date(t.date).getMonth() === now.getMonth() &&
      new Date(t.date).getFullYear() === now.getFullYear())
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="balance-section">
      <h2 className="section-label">Saldo Saat Ini</h2>
      <div className="main-balance">{formatRupiah(balance.current)}</div>
      <div className="balance-details-row">
        <div className="detail income">
          <span className="detail-label">Pemasukan Bulan Ini</span>
          <span className="detail-amount">+{formatRupiah(incomeThisMonth)}</span>
        </div>
        <div className="detail expense">
          <span className="detail-label">Pengeluaran Bulan Ini</span>
          <span className="detail-amount">-{formatRupiah(expenseThisMonth)}</span>
        </div>
      </div>
    </div>
  );
}
export default BalanceSection;