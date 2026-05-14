import { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiDollarSign, FiTrendingUp, FiShoppingBag, FiPackage, FiDownload, FiRefreshCw, FiCalendar, FiFileText } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axiosInstance from '../../utils/axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const fmt = (n) => `ETB ${Number(n || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtShort = (n) => Number(n || 0).toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const today = () => new Date().toISOString().split('T')[0];
const monthStart = () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; };

const CARD_ACCENT = [
  'var(--primary-color)', 
  'var(--primary-color)', 
  'var(--warning-color)', 
  'var(--primary-color)', 
  'var(--danger-color)', 
  'var(--primary-color)'
];

export default function FinancePage() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [groupBy, setGroupBy] = useState('day');
  const [startDate, setStartDate] = useState(monthStart());
  const [endDate, setEndDate] = useState(today());
  const [exportFormat, setExportFormat] = useState('excel');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = { startDate, endDate };
      const [finRes, chartRes, topRes] = await Promise.all([
        axiosInstance.get('/orders/reports/financial', { params }),
        axiosInstance.get('/orders/reports/revenue-chart', { params: { ...params, groupBy } }),
        axiosInstance.get('/orders/reports/top-products', { params: { ...params, limit: 10 } }),
      ]);
      setSummary(finRes.data.summary);
      setChartData(chartRes.data.map(d => ({ date: d._id, Revenue: d.revenue, 'Net Sales': d.netSales, Tax: d.tax, Shipping: d.shipping })));
      setTopProducts(topRes.data);
    } catch (error) {
      console.error('Finance error:', error);
      toast.error(error.response?.data?.message || 'Failed to load financial data');
    } finally {

      setLoading(false);
    }
  }, [startDate, endDate, groupBy]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const kpis = summary ? [
    { label: t('admin.finance.kpis.revenue'), value: fmt(summary.totalRevenue), icon: FiDollarSign, color: CARD_ACCENT[0] },
    { label: t('admin.finance.kpis.net_sales'), value: fmt(summary.totalItemsCost), icon: FiTrendingUp, color: CARD_ACCENT[1] },
    { label: t('admin.finance.kpis.tax'), value: fmt(summary.totalTax), icon: FiFileText, color: CARD_ACCENT[2] },
    { label: t('admin.finance.kpis.shipping'), value: fmt(summary.totalShipping), icon: FiPackage, color: CARD_ACCENT[3] },
    { label: t('admin.finance.kpis.orders'), value: summary.totalOrders, icon: FiShoppingBag, color: CARD_ACCENT[4] },
    { label: t('admin.finance.kpis.aov'), value: summary.totalOrders > 0 ? fmt(summary.totalRevenue / summary.totalOrders) : fmt(0), icon: FiCalendar, color: CARD_ACCENT[5] },
  ] : [];

  const exportExcel = () => {
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();
      // Sheet 1: Summary
      const sumRows = [
        ['Metric', 'Value'],
        ['Period', `${startDate} to ${endDate}`],
        ['Total Revenue (ETB)', summary?.totalRevenue || 0],
        ['Net Sales (ETB)', summary?.totalItemsCost || 0],
        ['Tax Collected (ETB)', summary?.totalTax || 0],
        ['Shipping Revenue (ETB)', summary?.totalShipping || 0],
        ['Paid Orders', summary?.totalOrders || 0],
        ['Average Order Value (ETB)', summary?.totalOrders > 0 ? (summary.totalRevenue / summary.totalOrders).toFixed(2) : 0],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sumRows), 'Summary');
      // Sheet 2: Revenue Breakdown
      const chartRows = [['Date', 'Revenue', 'Net Sales', 'Tax', 'Shipping'], ...chartData.map(r => [r.date, r.Revenue, r['Net Sales'], r.Tax, r.Shipping])];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(chartRows), 'Revenue Breakdown');
      // Sheet 3: Top Products
      const prodRows = [['Product', 'Units Sold', 'Revenue (ETB)', 'Revenue Share %'], ...topProducts.map(p => [p.name, p.totalQuantity, p.totalRevenue, p.revenueShare])];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(prodRows), 'Top Products');
      XLSX.writeFile(wb, `Alex_Retail_Financial_Report_${startDate}_${endDate}.xlsx`);
      toast.success('Excel report downloaded!');
    } catch { toast.error('Excel export failed'); }
    finally { setExporting(false); }
  };

  const exportPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pw = doc.internal.pageSize.getWidth();
      // Header
      doc.setFillColor(61, 122, 40);
      doc.rect(0, 0, pw, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18); doc.setFont('helvetica', 'bold');
      doc.text('Alex Retail', 14, 12);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.text('Financial Report', 14, 20);
      doc.text(`Period: ${startDate} → ${endDate}`, pw - 14, 12, { align: 'right' });
      doc.text(`Generated: ${new Date().toLocaleString()}`, pw - 14, 20, { align: 'right' });
      // Summary KPIs
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(13); doc.setFont('helvetica', 'bold');
      doc.text('Financial Summary', 14, 38);
      autoTable(doc, {
        startY: 42,
        head: [['Metric', 'Amount']],
        body: [
          ['Total Revenue', fmt(summary?.totalRevenue)],
          ['Net Sales', fmt(summary?.totalItemsCost)],
          ['Tax Collected', fmt(summary?.totalTax)],
          ['Shipping Revenue', fmt(summary?.totalShipping)],
          ['Paid Orders', String(summary?.totalOrders || 0)],
          ['Average Order Value', summary?.totalOrders > 0 ? fmt(summary.totalRevenue / summary.totalOrders) : fmt(0)],
        ],
        headStyles: { fillColor: [61, 122, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 248, 243] },
        styles: { fontSize: 10 },
      });
      // Revenue Breakdown
      if (chartData.length > 0) {
        doc.setFontSize(13); doc.setFont('helvetica', 'bold');
        doc.text('Revenue Breakdown', 14, doc.lastAutoTable.finalY + 12);
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 16,
          head: [['Date', 'Revenue (ETB)', 'Net Sales (ETB)', 'Tax (ETB)', 'Shipping (ETB)']],
          body: chartData.map(r => [r.date, fmtShort(r.Revenue), fmtShort(r['Net Sales']), fmtShort(r.Tax), fmtShort(r.Shipping)]),
          headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [239, 246, 255] },
          styles: { fontSize: 9 },
        });
      }
      // Top Products
      if (topProducts.length > 0) {
        doc.setFontSize(13); doc.setFont('helvetica', 'bold');
        doc.text('Top Products', 14, doc.lastAutoTable.finalY + 12);
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 16,
          head: [['Product', 'Units Sold', 'Revenue (ETB)', 'Share %']],
          body: topProducts.map(p => [p.name, p.totalQuantity, fmtShort(p.totalRevenue), `${p.revenueShare}%`]),
          headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 243, 255] },
          styles: { fontSize: 9 },
        });
      }
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8); doc.setTextColor(150, 150, 150);
        doc.text(`Alex Retail — Confidential | Page ${i} of ${pageCount}`, pw / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
      }
      doc.save(`Alex_Retail_Financial_Report_${startDate}_${endDate}.pdf`);
      toast.success('PDF report downloaded!');
    } catch (e) { console.error(e); toast.error('PDF export failed'); }
    finally { setExporting(false); }
  };

  const handleExport = () => exportFormat === 'excel' ? exportExcel() : exportPDF();

  const S = {
    page: { padding: '0' },
    header: { marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em', margin: 0 },
    sub: { color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
    row: { display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2.5rem' },
    kpiCard: (color) => ({ flex: '1 1 180px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '1.75rem', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }),
    kpiAccent: (color) => ({ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: color, borderRadius: '24px 0 0 24px' }),
    kpiLabel: { fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' },
    kpiValue: { fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' },
    kpiIcon: (color) => ({ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: color + '12', color: color, marginBottom: '1rem' }),
    card: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '28px', padding: '2.5rem', marginBottom: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' },
    cardTitle: { fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'Outfit, sans-serif' },
    toolbar: { display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end', marginBottom: '2.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' },
    inputGroup: { flex: 1, minWidth: '200px' },
    label: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' },
    input: { width: '100%', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-sub)', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 700, outline: 'none', transition: 'all 0.2s' },
    btnPrimary: { padding: '1rem 2rem', borderRadius: '16px', background: 'var(--text-main)', color: 'var(--bg-main)', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', border: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.2s', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
    btnSecondary: { padding: '1rem 1.5rem', borderRadius: '16px', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.2s' },
    th: { padding: '1.25rem 1rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' },
    td: { padding: '1.5rem 1rem', fontSize: '0.9rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', fontWeight: 700 },
    barBg: { background: 'var(--bg-sub)', borderRadius: '9999px', height: '8px', flex: 1, overflow: 'hidden' },
    barFill: (pct, color) => ({ width: `${pct}%`, height: '100%', borderRadius: '9999px', background: color, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }),
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)' }}>
        <p style={{ fontWeight: 900, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ fontSize: '0.75rem', color: p.color, margin: '4px 0', fontWeight: 800, display: 'flex', justifyContent: 'space-between', gap: '2rem' }}>
            <span>{p.name}</span>
            <span>ETB {Number(p.value).toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  };

  const maxRevenue = topProducts[0]?.totalRevenue || 1;

  return (
    <div style={S.page}>
      {/* Page Header */}
      <div style={S.header}>
        <div>
          <p style={S.sub}>{t('admin.finance.header.subtitle')}</p>
          <h1 style={S.title}>{t('admin.finance.header.title')}</h1>
        </div>
        <button onClick={fetchAll} disabled={loading} style={S.btnSecondary}>
          <FiRefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> 
          {t('common.refresh')}
        </button>
      </div>

      {/* Filters Toolbar */}
      <div style={S.toolbar}>
        <div style={S.inputGroup}>
          <label style={S.label}><FiCalendar size={12} /> {t('admin.finance.filters.from')}</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={S.input} />
        </div>
        <div style={S.inputGroup}>
          <label style={S.label}><FiCalendar size={12} /> {t('admin.finance.filters.to')}</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={S.input} />
        </div>
        <div style={S.inputGroup}>
          <label style={S.label}><FiTrendingUp size={12} /> {t('admin.finance.filters.group_by')}</label>
          <select value={groupBy} onChange={e => setGroupBy(e.target.value)} style={S.input}>
            <option value="day">{t('admin.finance.filters.daily')}</option>
            <option value="month">{t('admin.finance.filters.monthly')}</option>
            <option value="year">{t('admin.finance.filters.yearly')}</option>
          </select>
        </div>
        <button onClick={fetchAll} style={S.btnPrimary}>{t('admin.finance.filters.apply')}</button>
      </div>

      {/* Export Toolbar */}
      <div style={{ ...S.toolbar, marginTop: '-1rem', padding: '1.25rem 2rem' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
            <p style={{ ...S.label, marginBottom: 0 }}>{t('admin.finance.filters.export_format')}</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' }}>
                <input type="radio" checked={exportFormat === 'excel'} onChange={() => setExportFormat('excel')} style={{ accentColor: 'var(--primary-color)' }} /> Excel
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' }}>
                <input type="radio" checked={exportFormat === 'pdf'} onChange={() => setExportFormat('pdf')} style={{ accentColor: 'var(--primary-color)' }} /> PDF
              </label>
            </div>
         </div>
         <button onClick={handleExport} disabled={exporting || loading || !summary} style={S.btnSecondary}>
            <FiDownload size={14} /> 
            {exporting ? t('admin.finance.filters.generating') : t('admin.finance.filters.generate')}
         </button>
      </div>

      {/* KPI Cards */}
      <div style={S.row}>
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} style={{ ...S.kpiCard('#ccc'), height: '140px', animation: 'pulse 1.5s infinite' }} />
          ))
        ) : (
          kpis.map((k) => (
            <div key={k.label} style={S.kpiCard(k.color)}>
              <div style={S.kpiAccent(k.color)} />
              <div style={S.kpiIcon(k.color)}><k.icon size={18} /></div>
              <p style={S.kpiLabel}>{k.label}</p>
              <p style={S.kpiValue}>{k.value}</p>
            </div>
          ))
        )}
      </div>

      {/* Revenue Chart */}
      <div style={S.card}>
        <div style={S.cardTitle}>
          <div style={{ width: '32px', height: '32px', background: 'var(--bg-sub)', color: 'var(--primary-color)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiTrendingUp size={16} />
          </div>
          {t('admin.finance.charts.trend')}
        </div>
        {loading ? (
          <div style={{ height: '350px', background: 'var(--bg-sub)', borderRadius: '20px', animation: 'pulse 1.5s infinite' }} />
        ) : chartData.length === 0 ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
            {t('admin.finance.charts.empty')}
          </div>
        ) : (
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 700 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-color)', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="Revenue" stroke="var(--primary-color)" strokeWidth={3} fill="url(#gRev)" dot={false} activeDot={{ r: 6, fill: 'var(--primary-color)', stroke: 'var(--bg-main)', strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Products */}
      <div style={S.card}>
        <div style={S.cardTitle}>
          <div style={{ width: '32px', height: '32px', background: 'var(--bg-sub)', color: 'var(--primary-color)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiPackage size={16} />
          </div>
          {t('admin.finance.charts.top_products')}
        </div>
        {loading ? (
          <div style={{ height: '250px', background: 'var(--bg-sub)', borderRadius: '20px', animation: 'pulse 1.5s infinite' }} />
        ) : topProducts.length === 0 ? (
          <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
            {t('admin.finance.charts.products_empty')}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['rank', 'product', 'units', 'revenue', 'share', 'breakdown'].map(h => (
                    <th key={h} style={S.th}>{t(`admin.finance.charts.table.${h}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p._id} style={{ transition: 'background 0.2s' }}>
                    <td style={{ ...S.td, width: '60px' }}>
                      <span style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--bg-sub)', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>{i + 1}</span>
                    </td>
                    <td style={{ ...S.td, minWidth: '200px' }}>
                      <p style={{ margin: 0, fontWeight: 800 }}>{p.name}</p>
                    </td>
                    <td style={S.td}>{p.totalQuantity}</td>
                    <td style={{ ...S.td, color: 'var(--primary-color)', fontWeight: 900 }}>{fmt(p.totalRevenue)}</td>
                    <td style={S.td}>
                      <span style={{ background: 'var(--bg-sub)', color: 'var(--text-main)', borderRadius: '8px', padding: '0.4rem 0.8rem', fontWeight: 800, fontSize: '0.75rem', border: '1px solid var(--border-color)' }}>{p.revenueShare}%</span>
                    </td>
                    <td style={{ ...S.td, minWidth: '160px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={S.barBg}>
                          <div style={S.barFill((p.totalRevenue / maxRevenue) * 100, i === 0 ? 'var(--primary-color)' : 'var(--text-muted)')} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
