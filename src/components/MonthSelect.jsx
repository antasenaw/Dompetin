import React from 'react';
import '../App.css';

export default function MonthSelect({ id, value, onChange, months, label = "Pilih Bulan" }) {
  return (
    <div className="month-select-bar">
      <label htmlFor={id} className="month-select-label">{label}</label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="month-select-dropdown"
      >
        <option value="">Semua</option>
        {months.map(month => (
          <option key={month} value={month}>{month}</option>
        ))}
      </select>
    </div>
  );
}