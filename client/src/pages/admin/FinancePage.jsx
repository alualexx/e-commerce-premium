import { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiDollarSign, FiTrendingUp, FiShoppingBag, FiPackage, FiDownload, FiRefreshCw, FiCalendar, FiFileText } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axiosInstance from '../../utils/axios';
import toast from 'react-hot-toast';

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
    { label: 'Total Revenue', value: fmt(summary.totalRevenue), icon: FiDollarSign, color: CARD_ACCENT[0] },
    { label: 'Net Sales', value: fmt(summary.totalItemsCost), icon: FiTrendingUp, color: CARD_ACCENT[1] },
    { label: 'Tax Collected', value: fmt(summary.totalTax), icon: FiFileText, color: CARD_ACCENT[2] },
    { label: 'Shipping Revenue', value: fmt(summary.totalShipping), icon: FiPackage, color: CARD_ACCENT[3] },
    { label: 'Paid Orders', value: summary.totalOrders, icon: FiShoppingBag, color: CARD_ACCENT[4] },
    { label: 'Avg Order Value', value: summary.totalOrders > 0 ? fmt(summary.totalRevenue / summary.totalOrders) : fmt(0), icon: FiCalendar, color: CARD_ACCENT[5] },
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
      XLSX.writeFile(wb, `Alex_Studio_Financial_Report_${startDate}_${endDate}.xlsx`);
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
      doc.text('Alex Studio', 14, 12);
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
        doc.text(`Alex Studio — Confidential | Page ${i} of ${pageCount}`, pw / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
      }
      doc.save(`Alex_Studio_Financial_Report_${startDate}_${endDate}.pdf`);
      toast.success('PDF report downloaded!');
    } catch (e) { console.error(e); toast.error('PDF export failed'); }
    finally { setExporting(false); }
  };

  const handleExport = () => exportFormat === 'excel' ? exportExcel() : exportPDF();

  const S = {
    page: { padding: '0' },
    header: { marginBottom: '2rem' },
    title: { fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em', margin: 0 },
    sub: { color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' },
    row: { display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' },
    kpiCard: (color) => ({ flex: '1 1 160px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }),
    kpiAccent: (color) => ({ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: color, borderRadius: '16px 0 0 16px' }),
    kpiLabel: { fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' },
    kpiValue: { fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif' },
    kpiIcon: (color) => ({ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: color + '18', color: color, marginBottom: '0.75rem' }),
    card: { background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' },
    cardTitle: { fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' },
    toolbar: { display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '2rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem 1.5rem' },
    input: { padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-sub)', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, outline: 'none' },
    btn: (color, outline) => ({ padding: '0.65rem 1.4rem', borderRadius: '10px', border: outline ? `1.5px solid ${color}` : 'none', background: outline ? 'transparent' : color, color: outline ? color : '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', letterSpacing: '0.02em' }),
    label: { fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' },
    select: { padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-sub)', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, outline: 'none', cursor: 'pointer' },
    th: { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' },
    td: { padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', fontWeight: 600 },
    barBg: { background: 'var(--border-color)', borderRadius: '9999px', height: '6px', flex: 1 },
    barFill: (pct, color) => ({ width: `${pct}%`, height: '100%', borderRadius: '9999px', background: color, transition: 'width 0.6s ease' }),
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.9rem 1.2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
        <p style={{ fontWeight: 800, fontSize: '0.82rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ fontSize: '0.78rem', color: p.color, margin: '2px 0', fontWeight: 700 }}>{p.name}: ETB {Number(p.value).toLocaleString()}</p>
        ))}
      </div>
    );
  };

  const maxRevenue = topProducts[0]?.totalRevenue || 1;

  return (
    <div style={S.page}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={S.title}>Financial Dashboard</h1>
          <p style={S.sub}>Revenue analytics, financial summaries &amp; report generation</p>
        </div>
        <button onClick={fetchAll} disabled={loading} style={S.btn('var(--primary-color)', true)}>
          <FiRefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Filters & Export Toolbar */}
      <div style={S.toolbar}>
        <div>
          <p style={S.label}>From</p>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={S.input} />
        </div>
        <div>
          <p style={S.label}>To</p>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={S.input} />
        </div>
        <div>
          <p style={S.label}>Group By</p>
          <select value={groupBy} onChange={e => setGroupBy(e.target.value)} style={S.select}>
            <option value="day">Daily</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
        <button onClick={fetchAll} style={{ ...S.btn('var(--primary-color)', false), marginTop: '1.2rem' }}>Apply Filter</button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div>
            <p style={S.label}>Export Format</p>
            <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} style={S.select}>
              <option value="excel">Excel (.xlsx)</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <button onClick={handleExport} disabled={exporting || loading || !summary} style={S.btn('var(--primary-color)', false)}>
            <FiDownload size={14} /> {exporting ? 'Generating…' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ ...S.kpiCard('#ccc'), flex: '1 1 160px', height: '110px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : (
        <div style={S.row}>
          {kpis.map((k) => (
            <div key={k.label} style={S.kpiCard(k.color)}>
              <div style={S.kpiAccent(k.color)} />
              <div style={{ paddingLeft: '0.5rem' }}>
                <div style={S.kpiIcon(k.color)}><k.icon size={16} /></div>
                <p style={S.kpiLabel}>{k.label}</p>
                <p style={S.kpiValue}>{k.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Chart */}
      <div style={S.card}>
        <div style={S.cardTitle}><FiTrendingUp size={18} color="var(--primary-color)" /> Revenue Trend</div>
        {loading ? (
          <div style={{ height: '280px', background: 'var(--bg-sub)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
        ) : chartData.length === 0 ? (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No revenue data for this period.</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gTax" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--warning-color)" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="var(--warning-color)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.78rem', fontWeight: 700, paddingTop: '1rem' }} />
              <Area type="monotone" dataKey="Revenue" stroke="var(--primary-color)" strokeWidth={2.5} fill="url(#gRev)" dot={false} activeDot={{ r: 5, fill: 'var(--primary-color)' }} />
              <Area type="monotone" dataKey="Net Sales" stroke="var(--primary-color)" strokeWidth={2} fill="url(#gNet)" dot={false} activeDot={{ r: 4, fill: 'var(--primary-color)' }} />
              <Area type="monotone" dataKey="Tax" stroke="var(--warning-color)" strokeWidth={1.5} fill="url(#gTax)" dot={false} activeDot={{ r: 4, fill: 'var(--warning-color)' }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Products */}
      <div style={S.card}>
        <div style={S.cardTitle}><FiPackage size={18} color="var(--primary-color)" /> Top Products by Revenue</div>
        {loading ? (
          <div style={{ height: '200px', background: 'var(--bg-sub)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
        ) : topProducts.length === 0 ? (
          <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No product data for this period.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Product', 'Units Sold', 'Revenue', 'Share', 'Breakdown'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p._id} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-sub)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...S.td, width: '40px' }}>
                      <span style={{ width: '26px', height: '26px', borderRadius: '8px', background: CARD_ACCENT[i % CARD_ACCENT.length] + '20', color: CARD_ACCENT[i % CARD_ACCENT.length], display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>{i + 1}</span>
                    </td>
                    <td style={{ ...S.td, fontWeight: 700 }}>{p.name}</td>
                    <td style={S.td}>{p.totalQuantity}</td>
                    <td style={{ ...S.td, color: 'var(--primary-color)', fontWeight: 800 }}>{fmt(p.totalRevenue)}</td>
                    <td style={S.td}><span style={{ background: 'var(--primary-color)15', color: 'var(--primary-color)', borderRadius: '6px', padding: '2px 8px', fontWeight: 800, fontSize: '0.8rem' }}>{p.revenueShare}%</span></td>
                    <td style={{ ...S.td, minWidth: '140px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={S.barBg}>
                          <div style={S.barFill((p.totalRevenue / maxRevenue) * 100, CARD_ACCENT[i % CARD_ACCENT.length])} />
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
