import { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import Header from './components/Header';
import BalanceSection from './components/BalanceSection';
import TransactionList from './components/TransactionList';
import MonthSelect from './components/MonthSelect';
import logo from './assets/pic.svg';

import './App.css';

function App() {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: '',
    date: new Date().toISOString().split('T')[0]  // Today's date in YYYY-MM-DD format
  });

  // Update the initial transactions state
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];  // Empty array instead of default transactions
  });
  
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem('balance');
    return savedBalance ? JSON.parse(savedBalance) : {
      current: 0,    // Start with zero
      income: 0,     // Start with zero
      expense: 0     // Start with zero
    };
  });

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis'); // Add this state
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);  
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [selectedPieMonth, setSelectedPieMonth] = useState('');
  const [selectedAnalysisMonth, setSelectedAnalysisMonth] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    // Set loading false setelah semua asset dimuat
    window.onload = () => {
      setIsLoading(false);
    };
  
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('balance', JSON.stringify(balance));
  }, [transactions, balance]);

  useEffect(() => {
    if (activeTab === 'charts') {
      const ctx = document.getElementById('transactionChart');
      if (!ctx) return;
  
      // Filter transactions by selected month
      const filteredTransactions = filterTransactionsByMonth(transactions, selectedAnalysisMonth);
  
      const monthlyData = filteredTransactions.reduce((acc, tx) => {
        const date = new Date(tx.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) {
          acc[monthKey] = { income: 0, expense: 0, label: date.toLocaleString('default', { month: 'short', year: 'numeric' }) };
        }
        if (tx.type === 'income') {
          acc[monthKey].income += tx.amount;
        } else {
          acc[monthKey].expense += tx.amount;
        }
        return acc;
      }, {});
  
      const sortedKeys = Object.keys(monthlyData).sort();
  
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: sortedKeys.map(k => monthlyData[k].label),
          datasets: [
            {
              label: 'Pemasukan',
              data: sortedKeys.map(k => monthlyData[k].income),
              backgroundColor: 'rgba(34, 197, 94, 0.33)',
              borderColor: '#1e1e2e',
              borderWidth: 1.5,
              borderRadius: 12
            },
            {
              label: 'Pengeluaran',
              data: sortedKeys.map(k => monthlyData[k].expense),
              backgroundColor: 'rgba(244, 63, 94, 0.33)',
              borderColor: '#1e1e2e',
              borderWidth: 1.5,
              borderRadius: 12
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.03)',
                drawBorder: false
              },
              ticks: {
                callback: value => formatRupiah(value),
                color: '#a8b1cf',
                font: {
                  family: "'Inter', sans-serif",
                  size: 12
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#a8b1cf',
                font: {
                  family: "'Inter', sans-serif",
                  size: 12
                }
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: '#585a5b',
                font: {
                  family: "'Inter', sans-serif",
                  size: 12
                },
                usePointStyle: true,
              }
            },
            title: {
              display: true,
              text: 'Pemasukan dan Pengeluaran per Bulan',
              color: '#a8b1cf',
              font: {
                size: 16
              },
              padding: {
                top: 10,
                bottom: 10
              }
            },
            tooltip: {
              backgroundColor: '#1e1e2e',
              titleColor: '#f1f5f9',
              bodyColor: '#a8b1cf',
              padding: 12,
              borderColor: 'rgba(255,255,255,0.05)',
              borderWidth: 1,
              displayColors: true,
              usePointStyle: true,
              titleFont: {
                size: 13,
                family: "'Inter', sans-serif"
              },
              bodyFont: {
                size: 12,
                family: "'Inter', sans-serif"
              },
              callbacks: {
                label: function(context) {
                  return `  ${context.dataset.label}: ${formatRupiah(context.raw)}`;
                }
              }
            }
          }
        }
      });
  
      return () => chart.destroy();
    }
  }, [activeTab, transactions, selectedAnalysisMonth]);

  useEffect(() => {
    if (activeTab === 'pie') {
      const expenseCtx = document.getElementById('expensePieChart');
      const incomeCtx = document.getElementById('incomePieChart');
      if (!expenseCtx || !incomeCtx) return;
  
      // Filter transaksi sesuai bulan yang dipilih
      let filteredTx = transactions;
      if (selectedPieMonth) {
        filteredTx = transactions.filter(tx =>
          new Date(tx.date).toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedPieMonth
        );
      }
  
      const categoryData = filteredTx.reduce((acc, tx) => {
        if (!acc[tx.type]) {
          acc[tx.type] = {};
        }
        if (!acc[tx.type][tx.category]) {
          acc[tx.type][tx.category] = 0;
        }
        acc[tx.type][tx.category] += tx.amount;
        return acc;
      }, {});
  
      // Update di dalam useEffect untuk pie chart
      const expenseChart = new Chart(expenseCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(categoryData.expense || {}),
          datasets: [{
            data: Object.values(categoryData.expense || {}),
            backgroundColor: [
              'rgba(248, 113, 113, 0.5)',  // Merah
              'rgba(251, 146, 60, 0.5)',   // Oranye
              'rgba(250, 204, 21, 0.5)',   // Kuning
              'rgba(34, 197, 94, 0.5)',    // Hijau
              'rgba(59, 130, 246, 0.5)',   // Biru
              'rgba(99, 102, 241, 0.5)',   // Indigo
              'rgba(168, 85, 247, 0.5)',   // Ungu
              'rgba(236, 72, 153, 0.5)',   // Pink
              'rgba(45, 212, 191, 0.5)'    // Teal
            ],
            borderColor: '#1e1e2e',        // Warna border sama dengan background
            borderWidth: 1.5,
            hoverBorderWidth: 0,
            hoverOffset: 20
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',                   // Buat donut hole lebih besar
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#a8b1cf',
                padding: 20,
                font: {
                  size: 14,
                  family: "'Inter', sans-serif"
                },
                usePointStyle: true,       // Gunakan style bulat untuk legend
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: '#23272b',
              titleColor: '#fff',
              titleFont: {
                size: 16,
                weight: '600',
                family: "'Inter', sans-serif"
              },
              bodyColor: '#a8b1cf',
              bodyFont: {
                size: 14,
                family: "'Inter', sans-serif"
              },
              padding: 12,
              boxPadding: 8,
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1,
              displayColors: true,
              usePointStyle: true,       // Gunakan style bulat untuk tooltip
              callbacks: {
                label: function(context) {
                  const value = context.raw;
                  return `${formatRupiah(value)}`;
                }
              }
            }
          }
        }
      });

      const incomeChart = new Chart(incomeCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(categoryData.income || {}),
          datasets: [{
            data: Object.values(categoryData.income || {}),
            backgroundColor: [
              'rgba(34, 197, 94, 0.5)',    // Hijau Utama
              'rgba(16, 185, 129, 0.5)',   // Hijau Emerald
              'rgba(45, 212, 191, 0.5)',   // Hijau Teal
              'rgba(6, 182, 212, 0.5)',    // Cyan
              'rgba(14, 165, 233, 0.5)',   // Light Blue
              'rgba(59, 130, 246, 0.5)'    // Biru
            ],
            borderColor: '#1e1e2e',
            borderWidth: 1.5,
            hoverBorderWidth: 0,
            hoverOffset: 20
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#a8b1cf',
                padding: 20,
                font: {
                  size: 14,
                  family: "'Inter', sans-serif"
                },
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: '#23272b',
              titleColor: '#fff',
              titleFont: {
                size: 16,
                weight: '600',
                family: "'Inter', sans-serif"
              },
              bodyColor: '#a8b1cf',
              bodyFont: {
                size: 14,
                family: "'Inter', sans-serif"
              },
              padding: 12,
              boxPadding: 8,
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1,
              displayColors: true,
              usePointStyle: true,
              callbacks: {
                label: function(context) {
                  const value = context.raw;
                  return `${formatRupiah(value)}`;
                }
              }
            }
          }
        }
      });
  
      return () => {
        expenseChart.destroy();
        incomeChart.destroy();
      };
    }
  }, [activeTab, transactions, selectedPieMonth]);

  useEffect(() => {
    if (activeTab === 'trends') {
      const ctx = document.getElementById('trendChart');
      if (!ctx) return;
  
      // Filter transactions by selected month
      const filteredTransactions = filterTransactionsByMonth(transactions, selectedAnalysisMonth);
  
      const dailyBalances = filteredTransactions
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .reduce((acc, tx) => {
          const date = tx.date;
          if (!acc[date]) acc[date] = 0;
          if (tx.type === 'income') {
            acc[date] += tx.amount;
          } else {
            acc[date] -= tx.amount;
          }
          return acc;
        }, {});
  
      let runningBalance = 0;
      const trendData = Object.entries(dailyBalances).map(([date, amount]) => {
        runningBalance += amount;
        return { date, balance: runningBalance };
      });
  
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: trendData.map(d => new Date(d.date).toLocaleDateString('id-ID', { dateStyle: 'short' })),
          datasets: [{
            label: 'Saldo',
            data: trendData.map(d => d.balance),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              ticks: {
                callback: value => formatRupiah(value)
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Tren Saldo',
              color: '#a8b1cf',
              font: { size: 16 }
            }
          },
          
        }
      });
  
      return () => chart.destroy();
    }
  }, [activeTab, transactions, selectedAnalysisMonth]);

  const handleInputChange = (e) => {
    const { id, name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [type === 'radio' ? name : id]: value
    }));
  };

  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (value) {
      value = parseInt(value).toLocaleString('id-ID');
    }
    setFormData(prev => ({
      ...prev,
      amount: value
    }));
  };

  const recalculateBalances = (allTransactions) => {
    // First sort by date chronologically for balance calculation
    const chronologicalTransactions = [...allTransactions].sort((a, b) => {
      const dateCompare = new Date(a.date) - new Date(b.date);
      if (dateCompare === 0) {
        return a.id - b.id; // For same date, use chronological ID order
      }
      return dateCompare;
    });
  
    // Calculate running balance chronologically
    let runningBalance = 0;
    const withBalances = chronologicalTransactions.map(tx => {
      const previousBalance = runningBalance;
      if (tx.type === 'income') {
        runningBalance += tx.amount;
      } else {
        runningBalance -= tx.amount;
      }
      return {
        ...tx,
        previousBalance
      };
    });
  
    // Now sort for display (newer first for same date)
    return withBalances.sort((a, b) => {
      const dateCompare = new Date(a.date) - new Date(b.date);
      if (dateCompare === 0) {
        return b.id - a.id; // Reverse order for display
      }
      return dateCompare;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.type) {
      alert('Pilih tipe transaksi');
      return;
    }

    const amount = parseInt(formData.amount.replace(/[^\d]/g, ''));
    
    // Create new transaction without previousBalance first
    const newTransaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
      ...formData,
      amount: amount,
      date: formData.date || new Date().toISOString().split('T')[0]
    };

    // Add new transaction and recalculate all balances
    const updatedTransactions = recalculateBalances([...transactions, newTransaction]);

    // Calculate final balance from all transactions
    const finalBalance = updatedTransactions.reduce((acc, tx) => {
      if (tx.type === 'income') {
        acc.income += tx.amount;
        acc.current += tx.amount;
      } else {
        acc.expense += tx.amount;
        acc.current -= tx.amount;
      }
      return acc;
    }, { income: 0, expense: 0, current: 0 });

    // Update state with new values
    setBalance(finalBalance);
    setTransactions(updatedTransactions);
    resetForm();
    setShowAddModal(false);
  };

  const handleDeleteTransaction = (transactionId) => {
    const updatedTransactions = recalculateBalances(
      transactions.filter(t => t.id !== transactionId)
    );

    const finalBalance = updatedTransactions.reduce((acc, tx) => {
      if (tx.type === 'income') {
        acc.income += tx.amount;
        acc.current += tx.amount;
      } else {
        acc.expense += tx.amount;
        acc.current -= tx.amount;
      }
      return acc;
    }, { income: 0, expense: 0, current: 0 });

    setBalance(finalBalance);
    setTransactions(updatedTransactions);
  };

  // Helper functions
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      type: '',
      date: new Date().toISOString().split('T')[0]  // Always set to today's date
    });
  };

  const groupTransactions = (transactions) => {
    const grouped = {};
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      // Week number in month
      const week = Math.ceil((date.getDate() - date.getDay()) / 7) + 1;
      if (!grouped[month]) grouped[month] = {};
      if (!grouped[month][week]) grouped[month][week] = [];
      grouped[month][week].push(tx);
    });
    return grouped;
  };

  const getMonths = (transactions) => {
    const months = Array.from(
      new Set(
        transactions.map(tx =>
          new Date(tx.date).toLocaleString('default', { month: 'long', year: 'numeric' })
        )
      )
    );
    return months;
  };

  const calculateRateOfChange = (transactions) => {
    if (transactions.length < 2) return 0;
    
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const recentExpenses = sortedTx.filter(t => t.type === 'expense').slice(-30); // Last 30 days
    
    if (recentExpenses.length < 2) return 0;
    
    const daysDiff = (new Date(recentExpenses[recentExpenses.length-1].date) - new Date(recentExpenses[0].date)) / (1000 * 60 * 60 * 24);
    const expenseDiff = recentExpenses[recentExpenses.length-1].amount - recentExpenses[0].amount;
    
    return ((expenseDiff / recentExpenses[0].amount) / daysDiff * 100).toFixed(2);
  };

const calculateIncomeIntegral = (transactions) => {
  // Filter hanya transaksi pemasukan dan urutkan berdasarkan tanggal
  const sortedTx = [...transactions]
    .filter(t => t.type === 'income')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (sortedTx.length === 0) return 0; // Jika tidak ada transaksi, kembalikan 0

  let total = 0;
  let lastDate = new Date(sortedTx[0].date); // Mulai dari tanggal transaksi pertama

  sortedTx.forEach(tx => {
    const currentDate = new Date(tx.date);
    // Calculate the difference in days (not used in this context)
    Math.max((currentDate - lastDate) / (1000 * 60 * 60 * 24), 1); // Minimal 1 hari
    total += tx.amount; // Tambahkan jumlah pemasukan (tanpa dikalikan daysDiff)
    lastDate = currentDate; // Update lastDate
  });

  return formatRupiah(total); // Format hasil dalam bentuk mata uang
};

  const findInflectionPoints = (transactions) => {
    if (transactions.length < 3) return 0;
    
    const dailyBalances = transactions
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .reduce((acc, tx) => {
        const date = tx.date;
        acc[date] = (acc[date] || 0) + (tx.type === 'income' ? tx.amount : -tx.amount);
        return acc;
      }, {});
      
    let inflectionPoints = 0;
    const balances = Object.values(dailyBalances);
    
    for (let i = 1; i < balances.length - 1; i++) {
      const prevDiff = balances[i] - balances[i-1];
      const nextDiff = balances[i+1] - balances[i];
      if (prevDiff * nextDiff < 0) inflectionPoints++;
    }
    
    return inflectionPoints;
  };

  const calculateGrowthRate = (transactions) => {
    const monthlySums = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, tx) => {
        const month = new Date(tx.date).getMonth();
        acc[month] = (acc[month] || 0) + tx.amount;
        return acc;
      }, {});
      
    const monthlyGrowth = Object.values(monthlySums);
    if (monthlyGrowth.length < 2) return 0;
    
    const rate = (monthlyGrowth[monthlyGrowth.length-1] / monthlyGrowth[0]) ** (1/monthlyGrowth.length) - 1;
    return (rate * 100).toFixed(2);
  };

  const filterTransactionsByMonth = (transactions, month) => {
    if (!month) return transactions;
    return transactions.filter(tx =>
      new Date(tx.date).toLocaleString('default', { month: 'long', year: 'numeric' }) === month
    );
  };

  const getAnalysisDetails = (type, transactions) => {
    const getUserState = () => {
      const rateOfChange = calculateRateOfChange(transactions);
      const monthlyGrowth = calculateGrowthRate(transactions);
      const inflectionPoints = findInflectionPoints(transactions);
      // Removed unused variable 'recentTransactions'
      
      const expenseRatio = transactions.reduce((acc, tx) => {
        if (tx.type === 'expense') acc.expense += tx.amount;
        if (tx.type === 'income') acc.income += tx.amount;
        return acc;
      }, { expense: 0, income: 0 });

      return {
        rateOfChange,
        monthlyGrowth,
        inflectionPoints,
        expenseRatio: expenseRatio.income ? (expenseRatio.expense / expenseRatio.income * 100) : 0,
        volatility: inflectionPoints > 5 ? 'tinggi' : inflectionPoints > 2 ? 'sedang' : 'rendah',
        trend: rateOfChange > 0 ? 'naik' : rateOfChange < 0 ? 'turun' : 'stabil',
        health: expenseRatio.income ? 
          (expenseRatio.expense / expenseRatio.income) < 0.7 ? 'sehat' :
          (expenseRatio.expense / expenseRatio.income) < 0.9 ? 'perlu perhatian' : 'kritis'
          : 'belum dapat ditentukan'
      };
    };

    const state = getUserState();

    const details = {
      rateOfChange: {
        title: "Laju Perubahan Pengeluaran (Turunan/Derivative)",
        formula: "dy/dx = lim[h→0] (f(x+h) - f(x))/h",
        theory: `Konsep Turunan dalam Kalkulus menjelaskan laju perubahan seketika suatu fungsi.
  
  1. Definisi Formal Turunan:
     • Turunan adalah limit dari rasio perubahan
     • Mengukur seberapa cepat fungsi berubah di suatu titik
     • Memberikan kemiringan garis singgung pada kurva
  
  2. Interpretasi Geometris:
     • Kemiringan positif → fungsi meningkat
     • Kemiringan negatif → fungsi menurun
     • Kemiringan nol → titik stasioner/kritis
  
  3. Sifat-sifat Penting:
     • Turunan fungsi konstan = 0
     • Power Rule: d/dx(x^n) = n·x^(n-1)
     • Product Rule: d/dx(fg) = f'g + fg'
     • Chain Rule: d/dx(f(g(x))) = f'(g(x))·g'(x)
  
  4. Aplikasi Finansial:
     • Mengukur laju perubahan pengeluaran
     • Mendeteksi tren perubahan keuangan
     • Memprediksi titik kritis dalam pola pengeluaran`,
        properties: [
          "Power Rule: d/dx(x^n) = n·x^(n-1)",
          "Product Rule: d/dx(fg) = f'g + fg'",
          "Chain Rule: d/dx(f(g(x))) = f'(g(x))·g'(x)",
          "Linearitas: d/dx(af + bg) = af' + bg'"
        ],
        analysis: `Analisis Laju Perubahan:
  
  • Laju Saat Ini: ${state.rateOfChange}% per hari
  • Tren: ${state.trend}
  • Volatilitas: ${state.volatility}
  
  ${state.rateOfChange > 5 ? 
    `⚠️ Percepatan Pengeluaran Tinggi:
    • Laju perubahan positif signifikan
    • Indikasi ketidakstabilan keuangan
    • Perlu tindakan pengendalian segera` :
  
    state.rateOfChange > 2 ?
    `⚠️ Percepatan Pengeluaran Moderat:
    • Laju perubahan positif moderat
    • Tren peningkatan yang perlu diperhatikan
    • Waspada terhadap pola konsumsi` :
  
    state.rateOfChange > 0 ?
    `📈 Percepatan Pengeluaran Normal:
    • Laju perubahan positif minimal
    • Masih dalam batas wajar
    • Perlu monitoring berkelanjutan` :
  
    `✅ Perlambatan Pengeluaran:
    • Laju perubahan negatif/stabil
    • Indikasi pengelolaan baik
    • Potensi peningkatan tabungan`}`,
        primaryRecommendation: `Rekomendasi Berdasarkan Analisis Derivative:
  
  ${state.rateOfChange > 5 ? 
    'Perlunya pengendalian pengeluaran segera untuk menghindari ketidakstabilan keuangan jangka panjang.' :
    state.rateOfChange > 2 ?
    'Evaluasi pola pengeluaran dan identifikasi area penghematan potensial.' :
    'Pertahankan pola pengeluaran saat ini dan tingkatkan proporsi tabungan.'}`,
        actionSteps: [
          `${state.rateOfChange > 5 ? 'Evaluasi pengeluaran harian secara detail' : 'Monitor pengeluaran berkala'}`,
          `${state.rateOfChange > 2 ? 'Terapkan batasan pengeluaran kategori' : 'Pertahankan tracking pengeluaran'}`,
          `${state.rateOfChange > 0 ? 'Identifikasi pengeluaran non-esensial' : 'Optimalkan alokasi dana'}`,
          'Buat rencana penghematan terstruktur',
          'Evaluasi kebutuhan vs keinginan'
        ]
      },
      integral: {
        title: "Akumulasi Pemasukan (Integral)",
        formula: "∫f(t)dt = lim[n→∞] Σ[i=1 to n] f(ti)∆t",
        theory: `Integral dalam Kalkulus menghitung total akumulasi nilai dalam interval waktu.
      
      1. Konsep Dasar Integral:
         • Antiderivative (fungsi primitif)
         • Area di bawah kurva fungsi
         • Jumlah Riemann untuk aproksimasi
         • Limit dari penjumlahan partisi
      
      2. Teorema Fundamental Kalkulus:
         • Bagian I: d/dx[∫(a to x)f(t)dt] = f(x)
         • Bagian II: ∫(a to b)f(x)dx = F(b) - F(a)
         • Hubungan antara turunan dan integral
         • Konsep fungsi akumulasi
      
      3. Metode Integrasi:
         • Integral tak tentu vs tertentu
         • Substitusi (u-substitution)
         • Integrasi parsial
         • Penjumlahan dan pengurangan integral
      
      4. Aplikasi dalam Analisis Keuangan:
         • Menghitung total akumulasi pemasukan
         • Analisis arus kas kumulatif
         • Nilai rata-rata pemasukan
         • Proyeksi pendapatan total`,
        properties: [
          "Linearitas: ∫(af + bg)dx = a∫f dx + b∫g dx",
          "Additive: ∫[a to c] = ∫[a to b] + ∫[b to c]",
          "Substitusi: ∫f(g(x))g'(x)dx = ∫f(u)du",
          "Mean Value: ∫[a to b]f(x)dx = f(c)(b-a)"
        ],
        analysis: `Analisis Akumulasi Pemasukan:
      
      • Total Akumulasi: ${calculateIncomeIntegral(transactions)}
      • Rasio Pengeluaran: ${state.expenseRatio.toFixed(1)}% dari pemasukan
      • Kesehatan Keuangan: ${state.health}
      
      ${state.expenseRatio > 90 ? 
        `⚠️ Rasio Kritis:
        • Pengeluaran hampir menyamai pemasukan
        • Risiko defisit keuangan tinggi
        • Perlu tindakan penyesuaian segera` :
      
        state.expenseRatio > 70 ?
        `⚠️ Rasio Perlu Perhatian:
        • Pengeluaran cukup tinggi
        • Potensi masalah cashflow
        • Perlu evaluasi pengeluaran` :
      
        `✅ Rasio Sehat:
        • Balance pemasukan-pengeluaran baik
        • Potensi tabungan/investasi tinggi
        • Manajemen keuangan efektif`}`,
        primaryRecommendation: `Rekomendasi Berdasarkan Analisis Integral:
      
      ${state.expenseRatio > 90 ? 
        'Perlunya penyesuaian besar untuk memperbaiki rasio pemasukan-pengeluaran dan menghindari risiko defisit.' :
        state.expenseRatio > 70 ?
        'Evaluasi dan kurangi pengeluaran non-esensial untuk meningkatkan potensi akumulasi aset.' :
        'Maksimalkan surplus dengan alokasi pada investasi produktif dan emergency fund.'}`,
        actionSteps: [
          `${state.expenseRatio > 90 ? 'Audit pengeluaran secara menyeluruh' : 'Pertahankan pola pengeluaran'}`,
          `${state.expenseRatio > 70 ? 'Identifikasi area pemborosan' : 'Tingkatkan porsi investasi'}`,
          `${state.expenseRatio > 50 ? 'Cari sumber pemasukan tambahan' : 'Diversifikasi portofolio investasi'}`,
          'Buat rencana cadangan keuangan',
          'Evaluasi cashflow secara berkala'
        ]
      },
        inflection: {
          title: "Titik Infleksi (Turunan Kedua)",
          formula: "d²y/dx² = 0",
          theory: `Titik Infleksi dalam Kalkulus:
    
    1. Definisi Formal:
       • Titik dimana turunan kedua bernilai nol (d²y/dx² = 0)
       • Menandai perubahan konkavitas kurva
       • Menunjukkan perubahan laju perubahan
    
    2. Karakteristik Matematika:
       • Turunan pertama (dy/dx): arah perubahan
       • Turunan kedua (d²y/dx²): laju perubahan dari perubahan
       • Perubahan konkavitas: cekung ke cembung atau sebaliknya
    
    3. Analisis Konkavitas:
       • d²y/dx² > 0: kurva cekung ke atas (percepatan positif)
       • d²y/dx² < 0: kurva cekung ke bawah (percepatan negatif)
       • d²y/dx² = 0: titik infleksi (perubahan perilaku)
    
    4. Aplikasi dalam Analisis Keuangan:
       • Identifikasi perubahan tren signifikan
       • Deteksi titik balik dalam pola keuangan
       • Analisis percepatan/perlambatan pengeluaran`,
          properties: [
            "Perubahan konkavitas di titik infleksi",
            "Syarat perlu: d²y/dx² = 0",
            "Syarat cukup: d³y/dx³ ≠ 0",
            "Perubahan tanda pada d²y/dx²"
          ],
          analysis: `Analisis Titik Infleksi:
    
    • Jumlah Titik Infleksi: ${state.inflectionPoints}
    • Volatilitas: ${state.volatility}
    • Tren Umum: ${state.trend}
    
    ${state.inflectionPoints > 5 ? 
      `⚠️ Volatilitas Tinggi:
      • Banyak perubahan signifikan terdeteksi
      • Pola keuangan tidak stabil
      • Risiko ketidakpastian tinggi` :
    
      state.inflectionPoints > 2 ?
      `📊 Volatilitas Moderat:
      • Beberapa perubahan pola terdeteksi
      • Dinamika keuangan normal
      • Perlu monitoring berkelanjutan` :
    
      `✅ Stabilitas Tinggi:
      • Minimal perubahan signifikan
      • Pola keuangan konsisten
      • Manajemen keuangan baik`}`,
          primaryRecommendation: `Rekomendasi Berdasarkan Titik Infleksi:
    
    ${state.inflectionPoints > 5 ? 
      'Perlu strategi stabilisasi untuk mengurangi fluktuasi keuangan yang signifikan.' :
      state.inflectionPoints > 2 ?
      'Pertahankan monitoring dan evaluasi berkala untuk menjaga stabilitas.' :
      'Lanjutkan pola manajemen keuangan yang sudah stabil ini.'}`,
          actionSteps: [
            `${state.inflectionPoints > 5 ? 'Buat anggaran lebih terstruktur' : 'Pertahankan struktur anggaran'}`,
            `${state.inflectionPoints > 2 ? 'Evaluasi setiap perubahan signifikan' : 'Monitor perubahan secara berkala'}`,
            `${state.inflectionPoints > 0 ? 'Tingkatkan dana darurat' : 'Optimalkan investasi'}`,
            'Dokumentasikan pola perubahan',
            'Evaluasi faktor eksternal'
          ]
        },
        growth: {
          title: "Model Pertumbuhan Eksponensial",
          formula: "y = ae^(rt)",
          theory: `Model Pertumbuhan Eksponensial dalam Kalkulus:
        
        1. Konsep Dasar:
           • Pertumbuhan dimana laju perubahan proporsional dengan nilai saat ini
           • Diekspresikan sebagai dy/dt = ry, dimana r adalah konstanta pertumbuhan
           • Solusi umum: y = ae^(rt), a adalah nilai awal
           • e adalah bilangan Euler (≈ 2.71828)
        
        2. Karakteristik Matematika:
           • Turunan: d/dt[ae^(rt)] = are^(rt)
           • Integral: ∫ae^(rt)dt = (a/r)e^(rt) + C
           • Pertumbuhan tak terbatas saat t → ∞
           • Sifat self-multiplying: y(t₁ + t₂) = y(t₁)·e^(rt₂)
        
        3. Sifat-sifat Penting:
           • Laju pertumbuhan relatif konstan (r)
           • Waktu doubling = ln(2)/r
           • Pertumbuhan kontinu dan smooth
           • Tidak ada batas atas teoritis
        
        4. Aplikasi dalam Keuangan:
           • Analisis compound interest
           • Proyeksi pertumbuhan aset
           • Perhitungan return investasi
           • Model akumulasi kekayaan`,
          properties: [
            "dy/dt = ry (persamaan diferensial dasar)",
            "y = ae^(rt) (solusi umum)",
            "r = (1/t)ln(y/a) (tingkat pertumbuhan)",
            "T = ln(2)/r (waktu doubling)"
          ],
          analysis: `Analisis Pertumbuhan Eksponensial:
        
        • Tingkat Pertumbuhan: ${state.monthlyGrowth}% per bulan
        • Waktu Doubling: ${(Math.log(2)/(state.monthlyGrowth/100)).toFixed(1)} bulan
        • Status: ${state.health}
        
        ${state.monthlyGrowth > 10 ? 
          `📈 Pertumbuhan Sangat Baik:
          • Tingkat pertumbuhan di atas rata-rata
          • Potensi doubling cepat
          • Momentum kuat untuk investasi` :
        
          state.monthlyGrowth > 5 ?
          `✅ Pertumbuhan Sehat:
          • Tingkat pertumbuhan stabil
          • Proyeksi jangka panjang positif
          • Basis yang baik untuk akumulasi` :
        
          state.monthlyGrowth > 0 ?
          `📊 Pertumbuhan Moderat:
          • Arah positif tapi perlu peningkatan
          • Potensi optimisasi masih besar
          • Perlu strategi akselerasi` :
        
          `⚠️ Pertumbuhan Negatif:
          • Indikasi penurunan nilai
          • Risiko deplesi aset
          • Membutuhkan intervensi segera`}`,
          primaryRecommendation: `Rekomendasi Berdasarkan Model Eksponensial:
        
        ${state.monthlyGrowth > 10 ? 
          'Maksimalkan momentum pertumbuhan dengan diversifikasi dan reinvestasi yang agresif.' :
          state.monthlyGrowth > 5 ?
          'Pertahankan tren positif dengan kombinasi investasi konservatif dan moderat.' :
          state.monthlyGrowth > 0 ?
          'Tingkatkan rate pertumbuhan melalui optimisasi pendapatan dan efisiensi pengeluaran.' :
          'Lakukan restrukturisasi keuangan menyeluruh untuk membalikkan tren negatif.'}`,
          actionSteps: [
            `${state.monthlyGrowth > 10 ? 'Diversifikasi portofolio investasi' : 'Evaluasi struktur pendapatan'}`,
            `${state.monthlyGrowth > 5 ? 'Tingkatkan alokasi investasi' : 'Optimalkan arus kas'}`,
            `${state.monthlyGrowth > 0 ? 'Eksplorasi peluang pertumbuhan' : 'Lakukan penyesuaian anggaran'}`,
            'Pantau metrik pertumbuhan secara berkala',
            'Sesuaikan strategi berdasarkan tren'
          ]
        }
    };
    
    return details[type];
  };

  return (
    <>
      {(isLoading || showIntro) && (
        <div className="intro-overlay">
          <div className="intro-content">
            <img src={logo} alt="Logo" className="intro-logo" />
            <h1>Dompetin</h1>
          </div>
        </div>
      )}

      

      <div className="app-container">
        <Header />
        
        <div className="content-box">
        <BalanceSection balance={balance} formatRupiah={formatRupiah} transactions={transactions}/>
        </div>

        <div className="boxes-container">
          <div className="split-box">
            <div className="add-transaction-container">
              <button className="add-transaction-btn" onClick={() => setShowAddModal(true)}>
                Tambah Transaksi
              </button>
            </div>
          </div>

          <div className="split-box right">
            <div className="history-container">
              <h2 className="history-title">Riwayat Transaksi Terbaru</h2>
              <TransactionList 
                transactions={transactions} 
                formatRupiah={formatRupiah} 
                handleDeleteTransaction={handleDeleteTransaction} 
              />
              <div className="history-actions">
                <button className="action-btn" onClick={() => setShowHistoryModal(true)}>
                  Lihat Riwayat Lengkap
                </button>
              </div>
            </div>
          </div>
        </div>



        <div className="boxes-container bottom">
          <div className="split-box full-width">
            <div className="last-box-container">
              <div className="tabs-container">
                <button 
                  className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analysis')}
                >
                  Analisis Kalkulus
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('charts')}
                >
                  Grafik Transaksi
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'pie' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pie')}
                >
                  Distribusi Kategori
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
                  onClick={() => setActiveTab('trends')}
                >
                  Tren Keuangan
                </button>
              </div>

              {activeTab === 'analysis' && (
                <div className="analysis-grid-wrapper">
                  <MonthSelect
                    id="analysis-month-select"
                    value={selectedAnalysisMonth}
                    onChange={e => setSelectedAnalysisMonth(e.target.value)}
                    months={getMonths(transactions)}
                    label="Pilih Bulan:"
                  />
                  <div className="analysis-grid">
                    <div 
                      className="analysis-card clickable"
                      onClick={() => {
                        setSelectedAnalysis('rateOfChange');
                        setShowAnalysisModal(true);
                      }}
                    >
                      <h3 className="analysis-title">Laju Perubahan Pengeluaran</h3>
                      <div className="analysis-value">
                        {calculateRateOfChange(filterTransactionsByMonth(transactions, selectedAnalysisMonth))}%
                        <span className="trend-indicator">
                          {calculateRateOfChange(filterTransactionsByMonth(transactions, selectedAnalysisMonth)) > 0 ? '↗' : '↘'}
                        </span>
                      </div>
                      <p className="analysis-description">
                        Turunan pertama (dy/dx) dari fungsi pengeluaran menunjukkan kecepatan perubahan pengeluaran per hari
                      </p>
                    </div>
                    
                    <div 
                      className="analysis-card clickable"
                      onClick={() => {
                        setSelectedAnalysis('integral');
                        setShowAnalysisModal(true);
                      }}
                    >
                      <h3 className="analysis-title">Akumulasi Pemasukan</h3>
                      <div className="analysis-value">
                        {calculateIncomeIntegral(filterTransactionsByMonth(transactions, selectedAnalysisMonth))}
                      </div>
                      <p className="analysis-description">
                        Integral dari fungsi pemasukan terhadap waktu (∫f(t)dt)
                      </p>
                    </div>

                    <div 
                      className="analysis-card clickable"
                      onClick={() => {
                        setSelectedAnalysis('inflection');
                        setShowAnalysisModal(true);
                      }}
                    >
                      <h3 className="analysis-title">Titik Infleksi</h3>
                      <div className="analysis-value">
                        {findInflectionPoints(filterTransactionsByMonth(transactions, selectedAnalysisMonth))}
                      </div>
                      <p className="analysis-description">
                        Jumlah titik balik (d²y/dx² = 0) dalam tren keuangan
                      </p>
                    </div>

                    <div 
                      className="analysis-card clickable"
                      onClick={() => {
                        setSelectedAnalysis('growth');
                        setShowAnalysisModal(true);
                      }}
                    >
                      <h3 className="analysis-title">Tingkat Pertumbuhan</h3>
                      <div className="analysis-value">
                        {calculateGrowthRate(filterTransactionsByMonth(transactions, selectedAnalysisMonth))}%
                      </div>
                      <p className="analysis-description">
                        Model pertumbuhan eksponensial (y = ae^(rt))
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'charts' && (
                <div className="chart-container">
                  <div className="pie-month-select">
                    <MonthSelect
                      id="chart-month-select"
                      value={selectedAnalysisMonth}
                      onChange={e => setSelectedAnalysisMonth(e.target.value)}
                      months={getMonths(transactions)}
                      label="Pilih Bulan:"
                    />
                  </div>
                  <canvas id="transactionChart"></canvas>
                </div>
              )}

              {activeTab === 'pie' && (
                <div className="pie-container">
                  <div className="pie-month-filter">
                    <MonthSelect
                      id="pie-month-select"
                      value={selectedPieMonth}
                      onChange={e => setSelectedPieMonth(e.target.value)}
                      months={getMonths(transactions)}
                      label="Pilih Bulan:"
                    />
                  </div>
                    <div className="pie-grid">
                      <div className="pie-section">
                        <h3>Distribusi Pengeluaran</h3>
                        <canvas id="expensePieChart"></canvas>
                      </div>
                      <div className="pie-section">
                        <h3>Distribusi Pemasukan</h3>
                        <canvas id="incomePieChart"></canvas>
                      </div>
                    </div>
                </div>
              )}

              {activeTab === 'trends' && (
                <div className="trend-container">
                  <div className="pie-month-filter">
                    <MonthSelect
                      id="trend-month-select"
                      value={selectedAnalysisMonth}
                      onChange={e => setSelectedAnalysisMonth(e.target.value)}
                      months={getMonths(transactions)}
                      label="Pilih Bulan:"
                    />
                  </div>
                  <canvas id="trendChart"></canvas>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowHistoryModal(false)}>Tutup</button>
            <h2>Riwayat Transaksi Lengkap</h2>
            <div className="month-select-row">
              <label htmlFor="month-select" className="month-select-label">Pilih Bulan</label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
              >
                <option value="">-</option>
                {getMonths(transactions).map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div className="full-history-list">
              {selectedMonth && (() => {
                const weeks = groupTransactions(transactions)[selectedMonth];
                if (!weeks) return (
                  <div className="empty-state">
                    Tidak ada transaksi di bulan ini
                  </div>
                );
                return Object.entries(weeks)
                  .sort(([weekA], [weekB]) => weekB - weekA)
                  .map(([week, txs]) => (
                    <div key={week} className="week-group">
                      <strong>Minggu ke-{week}</strong>
                      {txs
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(tx => (
                          <div key={tx.id} className="transaction-item">
                            <div className="transaction-info">
                              <h3 className="transaction-desc">{tx.description}</h3>
                              <div className="transaction-subtext">
                                <span className="category">{tx.category}</span>
                                <span className="date">
                                  {new Date(tx.date).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="transaction-amounts">
                              <div className={`amount ${tx.type}`}>
                                {tx.type === 'income' ? '+' : '-'}
                                {formatRupiah(tx.amount)}
                              </div>
                              <div className="previous-balance">
                                Saldo sebelumnya: {formatRupiah(tx.previousBalance)}
                              </div>
                            </div>
                            <button 
                              className="delete-btn" 
                              onClick={() => handleDeleteTransaction(tx.id)}
                              aria-label="Hapus transaksi"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                    </div>
                  ));
              })()}
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAddModal(false)}>Tutup</button>
            <h2 className="form-title">Tambah Transaksi</h2>
            <form className="form-content" onSubmit={(e) => {
              handleSubmit(e);
              setShowAddModal(false);
            }}>
              {/* Pindahkan seluruh form yang ada di box kiri ke sini */}
              <div className="form-group">
                  <label htmlFor="description">Deskripsi</label>
                  <input 
                    type="text" 
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Masukkan deskripsi transaksi"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="amount">Jumlah</label>
                  <div className="amount-input-wrapper">
                    <input 
                      type="text"
                      id="amount"
                      value={formData.amount}
                      onChange={handleAmountChange}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="category">Kategori</label>
                  <select 
                    id="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Pilih kategori</option>
                    <optgroup label="Pengeluaran">
                      <option value="food">Makanan & Minuman</option>
                      <option value="transport">Transportasi</option>
                      <option value="bills">Tagihan & Utilitas</option>
                      <option value="shopping">Belanja</option>
                      <option value="health">Kesehatan</option>
                      <option value="education">Pendidikan</option>
                      <option value="entertainment">Hiburan</option>
                      <option value="charity">Donasi & Amal</option>
                      <option value="other expense">Lainnya (Pengeluaran)</option>
                    </optgroup>
                    <optgroup label="Pemasukan">
                      <option value="salary">Gaji</option>
                      <option value="bonus">Bonus</option>
                      <option value="investment">Investasi</option>
                      <option value="gift">Hadiah</option>
                      <option value="side income">Penghasilan Sampingan</option>
                      <option value="other income">Lainnya (Pemasukan)</option>
                    </optgroup>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tipe Transaksi</label>
                  <div className="type-selector">
                    <div className="type-option">
                      <input 
                        type="radio" 
                        id="expense"
                        name="type"
                        value="expense"
                        checked={formData.type === 'expense'}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="expense">Pengeluaran</label>
                    </div>
                    <div className="type-option">
                      <input 
                        type="radio" 
                        id="income"
                        name="type"
                        value="income"
                        checked={formData.type === 'income'}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="income">Pemasukan</label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="date">Tanggal</label>
                  <input 
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              {/* ...sisa form fields... */}
              <button type="submit" className="submit-btn">
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}

      {showAnalysisModal && selectedAnalysis && (
        <div className="modal-overlay" onClick={() => setShowAnalysisModal(false)}>
          <div className="modal-content analysis-detail" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAnalysisModal(false)}>
              Tutup
            </button>
            <div className="analysis-detail-content">
              <h2>{getAnalysisDetails(selectedAnalysis, filterTransactionsByMonth(transactions, selectedAnalysisMonth)).title}</h2>
              
              <div className="theory-section">
                <div className="formula-block">
                  <h3>Formula Kalkulus:</h3>
                  <code>{getAnalysisDetails(selectedAnalysis, filterTransactionsByMonth(transactions, selectedAnalysisMonth)).formula}</code>
                </div>
                
                <div className="calculus-theory">
                  <h3>Teori Kalkulus:</h3>
                  <div className="theory-content">
                    {getAnalysisDetails(selectedAnalysis, filterTransactionsByMonth(transactions, selectedAnalysisMonth)).theory}
                  </div>
                  
                  <div className="properties">
                    <h4>Sifat-sifat Matematika:</h4>
                    <ul>
                      {getAnalysisDetails(selectedAnalysis, filterTransactionsByMonth(transactions, selectedAnalysisMonth)).properties.map((prop, index) => (
                        <li key={index}>{prop}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="content-divider">
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              </div>

              <div className="analysis-section">
                <div className="current-analysis">
                  <h3>Analisis Data:</h3>
                  <div className="analysis-content">
                    {getAnalysisDetails(selectedAnalysis, filterTransactionsByMonth(transactions, selectedAnalysisMonth)).analysis}
                  </div>
                </div>

                <div className="recommendations">
                  <h3>Rekomendasi:</h3>
                  <div className="primary-recommendation">
                    {getAnalysisDetails(selectedAnalysis, filterTransactionsByMonth(transactions, selectedAnalysisMonth)).primaryRecommendation}
                  </div>
                  <div className="action-steps">
                    <h4>Langkah-langkah yang Dapat Diambil:</h4>
                    <ul>
                      {getAnalysisDetails(selectedAnalysis, filterTransactionsByMonth(transactions, selectedAnalysisMonth)).actionSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;