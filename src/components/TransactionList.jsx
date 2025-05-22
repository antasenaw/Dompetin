// filepath: src/components/TransactionList.jsx
function TransactionList({ transactions, formatRupiah, handleDeleteTransaction }) {
    if (transactions.length === 0) {
      return <div className="empty-state">Belum ada transaksi</div>;
    }
    return (
      <div className="transaction-list">
        {transactions
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map(transaction => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-info">
                <h3 className="transaction-desc">{transaction.description}</h3>
                <div className="transaction-subtext">
                  <span className="category">{transaction.category}</span>
                  <span className="date">{new Date(transaction.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</span>
                </div>
              </div>
              <div className="transaction-amounts">
                <div className={`amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatRupiah(transaction.amount)}
                </div>
                <div className="previous-balance">
                  Saldo sebelumnya: {formatRupiah(transaction.previousBalance)}
                </div>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDeleteTransaction(transaction.id)}
                  aria-label="Hapus transaksi"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
      </div>
    );
  }
  export default TransactionList;