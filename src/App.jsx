import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { supabase } from './supabase.js'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

// ─── AUTH CONTEXT ────────────────────────────────────────────────────────────
const AuthCtx = createContext(null)
const useAuth = () => useContext(AuthCtx)

async function fetchPerfil(uid) {
  try {
    const { data } = await supabase.from('usuarios').select('*, roles(nombre)').eq('id', uid).single()
    return data || null
  } catch {
    return null
  }
}

// ─── ESTILOS GLOBALES ────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --r:#E63946;--rd:#B5282F;
  --sb:#0D1117;--bg:#F7F8FA;--w:#fff;--br:#E8EAF0;
  --t1:#0D1117;--t2:#6B7280;--t3:#9CA3AF;
  --g:#10B981;--gb:#ECFDF5;
  --a:#F59E0B;--ab:#FFFBEB;
  --b:#3B82F6;--bb:#EFF6FF;
  --e:#EF4444;--eb:#FEF2F2;
  --rad:10px;--rads:6px;--radl:14px;
  font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:var(--t1);
}
body{background:var(--bg);margin:0}

/* LAYOUT */
.layout{display:flex;height:100vh;overflow:hidden}
.sidebar{width:250px;min-width:250px;background:var(--sb);display:flex;flex-direction:column;overflow-y:auto}
.main{flex:1;overflow-y:auto;display:flex;flex-direction:column;min-width:0}

/* SIDEBAR */
.s-logo{padding:22px 18px 16px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:11px;margin-bottom:6px}
.s-logo-box{width:36px;height:36px;background:var(--r);border-radius:9px;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:17px;color:#fff;flex-shrink:0}
.s-logo h1{color:#fff;font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;line-height:1.2}
.s-logo p{color:rgba(255,255,255,.28);font-size:9px;text-transform:uppercase;letter-spacing:1.2px;margin-top:1px}
.s-sec{padding:12px 18px 4px;color:rgba(255,255,255,.2);font-size:9px;text-transform:uppercase;letter-spacing:1.2px;font-weight:700}
.s-item{display:flex;align-items:center;gap:9px;padding:8px 18px;color:rgba(255,255,255,.52);font-size:13px;font-weight:500;cursor:pointer;position:relative;border:none;background:none;width:100%;text-align:left;transition:all .15s}
.s-item:hover{background:rgba(255,255,255,.04);color:rgba(255,255,255,.85)}
.s-item.on{background:rgba(255,255,255,.08);color:#fff}
.s-item.on::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;background:var(--r);border-radius:0 3px 3px 0}
.s-item svg{opacity:.6;flex-shrink:0;width:16px;height:16px}
.s-item.on svg{opacity:1}
.s-foot{margin-top:auto;border-top:1px solid rgba(255,255,255,.07);padding:10px 0}
.s-user{padding:8px 18px 4px;display:flex;align-items:center;gap:9px}
.s-uname{color:rgba(255,255,255,.72);font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.s-urole{color:rgba(255,255,255,.28);font-size:10px}

/* TOPBAR */
.topbar{background:var(--w);border-bottom:1px solid var(--br);padding:0 26px;height:58px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:5;flex-shrink:0}
.topbar-t{font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:700}

/* CONTENT */
.content{padding:26px;flex:1}

/* STAT CARDS */
.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:22px}
.stat{background:var(--w);border:1px solid var(--br);border-radius:var(--radl);padding:18px}
.stat-ico{width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:11px}
.stat-l{font-size:10px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px}
.stat-v{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;margin-bottom:3px;line-height:1.1}
.stat-s{font-size:11px;color:var(--t2)}

/* CARDS */
.card{background:var(--w);border:1px solid var(--br);border-radius:var(--radl);padding:22px}
.card-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.card-t{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.mt16{margin-top:16px}.mt22{margin-top:22px}

/* TABLES */
.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:13px}
thead th{text-align:left;padding:9px 12px;font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid var(--br);white-space:nowrap;background:var(--w)}
tbody td{padding:11px 12px;border-bottom:1px solid var(--br);vertical-align:middle}
tbody tr:last-child td{border-bottom:none}
tbody tr:hover td{background:#FAFBFC}

/* BADGES */
.tag{display:inline-flex;align-items:center;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;white-space:nowrap}
.tag-g{background:var(--gb);color:#059669}
.tag-a{background:var(--ab);color:#D97706}
.tag-e{background:var(--eb);color:#DC2626}
.tag-b{background:var(--bb);color:#2563EB}
.tag-n{background:#F3F4F6;color:#4B5563}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--rads);font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .15s;font-family:'Plus Jakarta Sans',sans-serif;line-height:1}
.btn-p{background:var(--r);color:#fff}.btn-p:hover{background:var(--rd)}.btn-p:disabled{opacity:.5;cursor:not-allowed}
.btn-s{background:var(--bg);color:var(--t1);border:1px solid var(--br)}.btn-s:hover{background:#eaedf2}
.btn-sm{padding:5px 11px;font-size:11px}
.btn-ic{padding:7px;background:var(--bg);border:1px solid var(--br);border-radius:var(--rads);cursor:pointer;display:inline-flex;transition:all .15s}.btn-ic:hover{background:#eaedf2}

/* SEARCH */
.srch-w{position:relative}
.srch-w svg{position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--t3);pointer-events:none;width:14px;height:14px}
.srch{padding:8px 10px 8px 30px;border:1px solid var(--br);border-radius:var(--rads);font-size:13px;outline:none;background:var(--w);font-family:'Plus Jakarta Sans',sans-serif;width:210px;color:var(--t1);transition:border .15s}
.srch:focus{border-color:var(--r);box-shadow:0 0 0 3px rgba(230,57,70,.07)}

/* FORMS */
.fg{display:flex;flex-direction:column;gap:5px}
.fl{font-size:10px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.4px}
input,select,textarea{padding:9px 11px;border:1px solid var(--br);border-radius:var(--rads);font-size:13px;outline:none;font-family:'Plus Jakarta Sans',sans-serif;color:var(--t1);background:var(--w);transition:border .15s;width:100%}
input:focus,select:focus,textarea:focus{border-color:var(--r);box-shadow:0 0 0 3px rgba(230,57,70,.07)}
textarea{resize:vertical;min-height:72px}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.full{grid-column:span 2}

/* MODAL */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px}
.modal{background:var(--w);border-radius:var(--radl);padding:26px;width:100%;max-width:620px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.15)}
.modal-t{font-family:'Space Grotesk',sans-serif;font-size:19px;font-weight:700;margin-bottom:20px}
.modal-f{display:flex;justify-content:flex-end;gap:9px;margin-top:22px;padding-top:16px;border-top:1px solid var(--br)}

/* MISC */
.amt{font-family:'Space Grotesk',sans-serif;font-weight:600}
.amt-g{color:#059669}.amt-a{color:#D97706}.amt-e{color:#DC2626}
.divider{height:1px;background:var(--br);margin:14px 0}
.notif{position:fixed;bottom:22px;right:22px;background:var(--t1);color:#fff;padding:12px 20px;border-radius:var(--rad);font-size:13px;font-weight:500;box-shadow:0 8px 30px rgba(0,0,0,.18);z-index:200;animation:su .25s ease}
.notif.err{background:#DC2626}
@keyframes su{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
.spin{display:inline-block;width:15px;height:15px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:sp .6s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
.ring{width:24px;height:24px;border:2px solid var(--br);border-top-color:var(--r);border-radius:50%;animation:sp .7s linear infinite}
.loader{display:flex;align-items:center;justify-content:center;padding:60px;gap:12px;color:var(--t2)}

/* LOGIN */
.lw{display:grid;grid-template-columns:1fr 1fr;min-height:100vh}
.ll{background:var(--sb);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;position:relative;overflow:hidden}
.ll::after{content:'';position:absolute;width:500px;height:500px;background:radial-gradient(circle,rgba(230,57,70,.12) 0%,transparent 70%);top:-120px;right:-120px;pointer-events:none}
.lr{background:var(--bg);display:flex;align-items:center;justify-content:center;padding:60px}
.lform{width:100%;max-width:360px}
.l-logo{width:68px;height:68px;background:var(--r);border-radius:18px;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:30px;color:#fff;margin:0 auto 22px}
.l-h{color:#fff;font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;text-align:center;margin-bottom:8px}
.l-sub{color:rgba(255,255,255,.38);font-size:13px;text-align:center;max-width:280px;line-height:1.65}
.l-creds{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:var(--rad);padding:14px 16px;margin-top:22px;font-size:11px;color:rgba(255,255,255,.35);line-height:2}
.l-creds strong{color:rgba(255,255,255,.5);display:block;font-size:9px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.cr{cursor:pointer;padding:2px 6px;border-radius:4px;transition:background .15s}
.cr:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.65)}
.alert{background:var(--eb);color:#DC2626;border:1px solid #FECACA;border-radius:var(--rads);padding:10px 13px;font-size:12px;font-weight:500;margin-bottom:14px}

/* BARS */
.bars{display:flex;flex-direction:column;gap:10px}
.bar-r{display:flex;align-items:center;gap:8px;font-size:11px}
.bar-l{width:110px;flex-shrink:0;color:var(--t2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar-t{flex:1;height:7px;background:var(--bg);border-radius:4px;overflow:hidden}
.bar-f{height:100%;border-radius:4px;background:var(--r);transition:width .5s ease}
.bar-v{width:80px;text-align:right;flex-shrink:0;font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:600}

/* ROW ITEMS */
.ri{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--br)}
.ri:last-child{border-bottom:none}
.ri-m{font-size:12px;font-weight:600}
.ri-s{font-size:10px;color:var(--t3);margin-top:1px}

/* FIN TILES */
.fin-bar{display:flex;gap:12px;padding:14px 0 2px}
.fin-tile{background:var(--w);border:1px solid var(--br);border-radius:var(--rad);padding:14px 18px;flex:1}
.fin-l{font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px}
.fin-v{font-family:'Space Grotesk',sans-serif;font-size:19px;font-weight:700}

/* AVATAR */
.av{width:32px;height:32px;border-radius:50%;background:var(--r);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px;flex-shrink:0}

/* INFO BOX */
.ib{border-radius:var(--rads);padding:10px 13px;font-size:12px;font-weight:500;margin-bottom:14px}
.ib-b{background:var(--bb);color:#1D4ED8;border:1px solid #BFDBFE}
.ib-a{background:var(--ab);color:#92400E;border:1px solid #FDE68A}
.ib-g{background:var(--gb);color:#065F46;border:1px solid #A7F3D0}
`

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n, cur = 'PEN') => {
  if (!n && n !== 0) return '—'
  return (cur === 'USD' ? '$ ' : 'S/ ') +
    Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
const fmtDate = d => {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}
const ini = s => s ? s[0].toUpperCase() : '?'
const inis = (a, b) => `${ini(a)}${ini(b)}`

// ─── EXPORTACIÓN Y PDF ────────────────────────────────────────────────────────
function exportXLSX(rows, filename) {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Datos')
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`)
}

function pdfContrato(row, download = true) {
  const doc = new jsPDF()
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  let y = 10

  // Cabecera
  doc.setFillColor(230, 57, 70)
  doc.rect(10, y, w-20, 18, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text('EDUCATRAN', w/2, y+12, { align:'center' })
  doc.setFontSize(8)
  doc.setFont(undefined, 'normal')
  doc.text('Sistema de Donaciones Viales', w/2, y+16, { align:'center' })
  y += 22

  // Título
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Contrato de Patrocinio', w/2, y, { align:'center' })
  y += 8

  // Datos del contrato
  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.text('Información del Contrato:', 10, y)
  y += 5
  doc.setFont(undefined, 'normal')
  doc.setFontSize(9)
  doc.text(`Número de Contrato: ${row.numero_contrato || '—'}`, 10, y)
  y += 4
  doc.text(`Fecha: ${row.fecha_inicio ? new Date(row.fecha_inicio).toLocaleDateString('es-PE') : '—'}`, 10, y)
  y += 4
  doc.text(`Tipo: ${row.tipo || '—'}`, 10, y)
  y += 4
  doc.text(`Patrocinador: ${row.patrocinadores?.nombre_comercial || '—'}`, 10, y)
  y += 4
  doc.text(`Gestor: ${row.gestores ? `${row.gestores.nombre} ${row.gestores.apellido}` : '—'}`, 10, y)
  y += 8

  // Monto y vigencia
  doc.setFont(undefined, 'bold')
  doc.text('Términos Económicos:', 10, y)
  y += 5
  doc.setFont(undefined, 'normal')
  doc.text(`Monto Comprometido: ${fmt(row.monto_comprometido, row.moneda)}`, 10, y)
  y += 4
  doc.text(`Vigencia: ${row.fecha_inicio ? new Date(row.fecha_inicio).toLocaleDateString('es-PE') : '—'} - ${row.fecha_fin ? new Date(row.fecha_fin).toLocaleDateString('es-PE') : '—'}`, 10, y)
  y += 8

  // Descripción
  doc.setFont(undefined, 'bold')
  doc.text('Descripción:', 10, y)
  y += 5
  doc.setFont(undefined, 'normal')
  doc.setFontSize(8)
  const descLines = doc.splitTextToSize(row.descripcion || '—', w-20)
  doc.text(descLines, 10, y)
  y += (descLines.length * 3) + 8

  // Firmas
  if (y > h - 30) doc.addPage()
  y = Math.max(y, h - 28)
  doc.setFontSize(8)
  doc.text('EDUCATRAN', 20, y)
  doc.text('Patrocinador', w-40, y)
  y += 3
  doc.line(10, y, 40, y)
  doc.line(w-50, y, w-10, y)

  // Pie de página
  doc.setFontSize(7)
  doc.setTextColor(100, 100, 100)
  doc.text('Educatran S.A.C. — Sistema de Donaciones para Seguridad Vial y Educación Infantil', w/2, h-5, { align:'center' })

  if (download) {
    doc.save(`contrato-${row.numero_contrato || 'sin-numero'}.pdf`)
  } else {
    doc.output('dataurlnewwindow')
  }
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const SM = {
  recibida:['tag-g','Recibida'], pendiente:['tag-a','Pendiente'],
  rechazado:['tag-e','Rechazado'], activo:['tag-g','Activo'],
  inactivo:['tag-n','Inactivo'], pagado:['tag-g','Pagado'],
  aprobado:['tag-g','Aprobado'], completada:['tag-g','Completada'],
  programada:['tag-b','Programada'], borrador:['tag-n','Borrador'],
  cancelado:['tag-e','Cancelado'], activa:['tag-g','Activa'],
  vencido:['tag-a','Vencido'],
}
const Tag = ({ s }) => { const [c,l] = SM[s] || ['tag-n', s||'—']; return <span className={`tag ${c}`}>{l}</span> }

// ─── ICONS ────────────────────────────────────────────────────────────────────
const IC = {
  dash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  don:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2m-4-6h8"/></svg>,
  gest: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  pat:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  fire: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>,
  sch:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  vis:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  doc:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  gas:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  com:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 100 4h4a2 2 0 110 4H8"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="18"/></svg>,
  out:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  srch: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  ref:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" width="14" height="14"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>,
}

// ─── NOTIF ────────────────────────────────────────────────────────────────────
function Notif({ msg, type = 'ok', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [])
  return <div className={`notif${type === 'err' ? ' err' : ''}`}>{msg}</div>
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const go = async () => {
    if (!email || !pwd) { setErr('Completa correo y contrasena'); return }
    setLoading(true)
    setErr('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pwd.trim()
      })
      if (error) {
        setErr(error.message)
        setLoading(false)
        return
      }
      const perfil = await fetchPerfil(data.user.id)
      onLogin({ ...data.user, perfil })
    } catch (e) {
      setErr('Error: ' + e.message)
      setLoading(false)
    }
  }

  const fill = e => { setEmail(e); setPwd('demo123') }

  return (
    <div className="lw">
      <div className="ll">
        <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
          <div className="l-logo">E</div>
          <h1 className="l-h">EDUCATRAN</h1>
          <p className="l-sub">Sistema de gestion de donaciones para seguridad vial y educacion infantil</p>
          <div style={{ margin:'28px 0', display:'flex', gap:20, justifyContent:'center' }}>
            {[['🚗','Marcas'],['🎮','Juegos'],['🚒','Bomberos'],['🏫','Colegios']].map(([e,l]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, marginBottom:3 }}>{e}</div>
                <div style={{ color:'rgba(255,255,255,.3)', fontSize:10 }}>{l}</div>
              </div>
            ))}
          </div>
          <div className="l-creds">
            <strong>Usuarios de acceso</strong>
            {[['admin@educatran.pe','Admin'],['gestor@educatran.pe','Gestor'],['bombero@educatran.pe','Bombero']].map(([e,r]) => (
              <div key={e} className="cr" onClick={() => fill(e)}>{e} <span style={{ opacity:.5 }}>· {r}</span></div>
            ))}
            <div style={{ marginTop:6, fontSize:10 }}>Contrasena: demo123</div>
          </div>
        </div>
      </div>

      <div className="lr">
        <div className="lform">
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700, marginBottom:6 }}>Iniciar sesion</h2>
          <p style={{ color:'var(--t2)', fontSize:13, marginBottom:22 }}>Ingresa tus credenciales para acceder</p>
          {err && <div className="alert">{err}</div>}
          <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
            <div className="fg">
              <label className="fl">Correo electronico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@educatran.pe" />
            </div>
            <div className="fg">
              <label className="fl">Contrasena</label>
              <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && go()} />
            </div>
            <button className="btn btn-p" style={{ width:'100%', justifyContent:'center', padding:'11px', fontSize:14, marginTop:4 }} onClick={go} disabled={loading}>
              {loading ? <><span className="spin" /> Ingresando...</> : 'Ingresar al sistema'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DB HOOK ─────────────────────────────────────────────────────────────────
function useTable(table, select = '*') {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    setLoading(true)
    const { data: d } = await supabase.from(table).select(select).order('created_at', { ascending: false })
    setData(d || [])
    setLoading(false)
  }, [table, select])
  useEffect(() => { load() }, [load])
  return { data, loading, reload: load }
}

// ─── GENERIC PAGE ─────────────────────────────────────────────────────────────
function Page({ title, data, loading, cols, addLabel, Form, reload, filterFn, headerExtra, deleteTable, exportFn }) {
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(false)
  const [editRow, setEditRow] = useState(null)
  const [viewRow, setViewRow] = useState(null)
  const [deleteRow, setDeleteRow] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notif, setNotif] = useState(null)
  const showN = (msg, type = 'ok') => setNotif({ msg, type })

  const filtered = data.filter(row => {
    if (!q) return true
    if (filterFn) return filterFn(row, q)
    return cols.some(c => { const v = row[c.key]; return v && String(v).toLowerCase().includes(q.toLowerCase()) })
  })

  const doDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from(deleteTable).delete().eq('id', deleteRow.id)
    setDeleting(false)
    if (error) { showN(error.message, 'err'); return }
    setDeleteRow(null)
    showN('Registro eliminado')
    reload()
  }

  return (
    <div className="content">
      {notif && <Notif msg={notif.msg} type={notif.type} onClose={() => setNotif(null)} />}
      {headerExtra}
      <div className="card">
        <div className="card-h">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span className="card-t">{title}</span>
            <span className="tag tag-n">{filtered.length}</span>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div className="srch-w">{IC.srch}<input className="srch" placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} /></div>
            <button className="btn-ic" onClick={reload} title="Recargar">{IC.ref}</button>
            {exportFn && <button className="btn btn-s" onClick={() => exportFn(filtered)}>📊 Excel</button>}
            {Form && <button className="btn btn-p" onClick={() => setModal(true)}>{IC.plus}{addLabel||'Nuevo'}</button>}
          </div>
        </div>
        <div className="tbl-wrap">
          {loading
            ? <div className="loader"><div className="ring" /> Cargando...</div>
            : <table>
                <thead><tr>{cols.map(c => <th key={c.key}>{c.label}</th>)}<th>Acciones</th></tr></thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={cols.length+1} style={{ textAlign:'center', color:'var(--t3)', padding:40 }}>Sin registros</td></tr>
                    : filtered.map((row, i) => (
                      <tr key={row.id||i}>
                        {cols.map(c => <td key={c.key}>{c.render ? c.render(row[c.key], row) : (row[c.key]??'—')}</td>)}
                        <td>
                          <div style={{ display:'flex', gap:4 }}>
                            {Form && <button className="btn btn-s btn-sm" title="Editar" onClick={() => setEditRow(row)}>✏️</button>}
                            <button className="btn btn-s btn-sm" title="Ver" onClick={() => setViewRow(row)}>👁️</button>
                            {deleteTable && <button className="btn btn-s btn-sm" title="Eliminar" style={{color:'var(--e)'}} onClick={() => setDeleteRow(row)}>🗑️</button>}
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
          }
        </div>
      </div>

      {modal && Form && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <Form
              onClose={() => setModal(false)}
              onSave={msg => { setModal(false); showN(msg||'Guardado correctamente'); reload() }}
              onError={msg => showN(msg, 'err')}
            />
          </div>
        </div>
      )}

      {editRow && Form && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setEditRow(null)}>
          <div className="modal">
            <Form
              initial={editRow}
              onClose={() => setEditRow(null)}
              onSave={msg => { setEditRow(null); showN(msg||'Actualizado correctamente'); reload() }}
              onError={msg => showN(msg, 'err')}
            />
          </div>
        </div>
      )}

      {viewRow && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setViewRow(null)}>
          <div className="modal">
            <div className="modal-t">👁️ Detalle del registro</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 20px' }}>
              {Object.entries(viewRow)
                .filter(([k]) => !['id','created_at','updated_at'].includes(k))
                .map(([k,v]) => (
                  <div key={k} className="fg">
                    <div className="fl">{k.replace(/_/g,' ').toUpperCase()}</div>
                    <div style={{ fontSize:13, padding:'6px 0' }}>
                      {v === null || v === undefined ? '—'
                        : typeof v === 'boolean' ? (v ? 'Sí' : 'No')
                        : typeof v === 'object' ? JSON.stringify(v)
                        : String(v)}
                    </div>
                  </div>
                ))
              }
            </div>
            <div className="modal-f">
              <button className="btn btn-s" onClick={() => setViewRow(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {deleteRow && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth:420 }}>
            <div className="modal-t" style={{ color:'var(--e)' }}>🗑️ Confirmar eliminación</div>
            <p style={{ color:'var(--t2)', fontSize:13 }}>¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.</p>
            <div className="modal-f">
              <button className="btn btn-s" disabled={deleting} onClick={() => setDeleteRow(null)}>Cancelar</button>
              <button className="btn btn-p" style={{ background:'var(--e)' }} disabled={deleting} onClick={doDelete}>
                {deleting ? <><span className="spin"/>Eliminando...</> : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ onNavigate }) {
  const [s, setS] = useState({ donaciones:0, saldo:0, gastos:0, comisiones:0, kits:0, nDon:0, nVis:0, nCol:0, nEst:0 })
  const [dons, setDons] = useState([])
  const [pats, setPats] = useState([])
  const [vis,  setVis]  = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function load() {
      const [rD, rG, rP, rC, rE, rV] = await Promise.all([
        supabase.from('donaciones').select('monto,comision_gestor,comision_pagada,estado,fecha_donacion,patrocinadores(nombre_comercial),gestores(nombre,apellido)').order('created_at',{ascending:false}),
        supabase.from('gastos').select('monto,estado'),
        supabase.from('patrocinadores').select('nombre_comercial,total_donado').order('total_donado',{ascending:false}).limit(6),
        supabase.from('colegios').select('id',{count:'exact',head:true}),
        supabase.from('estaciones_bomberos').select('id',{count:'exact',head:true}),
        supabase.from('visitas_entregas').select('id,estado,fecha_visita,cantidad_kits_entregados,colegios(nombre),estaciones_bomberos(nombre)').order('fecha_visita',{ascending:false}).limit(4),
      ])
      const recibidas = (rD.data||[]).filter(d => d.estado==='recibida')
      const totDon = recibidas.reduce((a,d) => a+(d.monto||0),0)
      const totGas = (rG.data||[]).filter(g => g.estado==='aprobado').reduce((a,g) => a+(g.monto||0),0)
      const totCom = (rD.data||[]).filter(d => d.comision_pagada===true).reduce((a,d) => a+(d.comision_gestor||0),0)
      const kitsEntregados = (rV.data||[]).filter(v => v.estado==='completada').reduce((a,v) => a+(v.cantidad_kits_entregados||0),0)
      const kitsPorEntregar = (rV.data||[]).filter(v => v.estado==='programada').reduce((a,v) => a+(v.cantidad_kits_entregados||0),0)
      setS({ donaciones:totDon, saldo:totDon-totGas, gastos:totGas, comisiones:totCom, kitsEntregados, kitsPorEntregar, nDon:(rD.data||[]).length, nVis:(rV.data||[]).length, nCol:rC.count||0, nEst:rE.count||0 })
      setDons((rD.data||[]).slice(0,5))
      setPats(rP.data||[])
      setVis(rV.data||[])
      setReady(true)
    }
    load()
  }, [])

  const reporteGeneral = async () => {
    const [rD, rG, rGas, rC, rV] = await Promise.all([
      supabase.from('donaciones').select('*, patrocinadores(nombre_comercial), gestores(nombre,apellido)').order('created_at',{ascending:false}),
      supabase.from('comisiones').select('*, gestores(nombre,apellido)'),
      supabase.from('gastos').select('*').order('created_at',{ascending:false}),
      supabase.from('contratos').select('*, patrocinadores(nombre_comercial)'),
      supabase.from('visitas_entregas').select('*, colegios(nombre), estaciones_bomberos(nombre)'),
    ])
    const wb = XLSX.utils.book_new()
    const resumen = [
      { Concepto: 'Total Donaciones Recibidas', Valor: (rD.data||[]).filter(d=>d.estado==='recibida').reduce((a,d)=>a+d.monto,0) },
      { Concepto: 'Total Gastos Aprobados', Valor: (rGas.data||[]).filter(g=>g.estado==='aprobado').reduce((a,g)=>a+g.monto,0) },
      { Concepto: 'Total Comisiones Pagadas', Valor: (rG.data||[]).filter(c=>c.estado==='pagado').reduce((a,c)=>a+c.monto_comision,0) },
      { Concepto: 'Total Kits Entregados', Valor: (rV.data||[]).reduce((a,v)=>a+(v.cantidad_kits_entregados||0),0) },
      { Concepto: 'Total Alumnos Capacitados', Valor: (rV.data||[]).reduce((a,v)=>a+(v.num_alumnos_capacitados||0),0) },
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen), 'Resumen')
    const donacionesExcel = (rD.data||[]).map(d => ({
      'Patrocinador': d.patrocinadores?.nombre_comercial || '—',
      'Gestor': d.gestores ? `${d.gestores.nombre} ${d.gestores.apellido}` : '—',
      'Monto': d.monto,
      'Moneda': d.moneda,
      'Comision 5%': d.comision_gestor,
      'Fecha': d.fecha_donacion,
      'Metodo': d.metodo_pago,
      'Estado': d.estado,
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(donacionesExcel), 'Donaciones')
    const gastosExcel = (rGas.data||[]).map(g => ({
      'Tipo': g.tipo,
      'Categoria': g.categoria,
      'Descripcion': g.descripcion,
      'Monto': g.monto,
      'Moneda': g.moneda,
      'Proveedor': g.proveedor,
      'Factura': g.factura_numero,
      'Fecha': g.fecha,
      'Estado': g.estado,
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(gastosExcel), 'Gastos')
    const comisionesExcel = (rG.data||[]).map(c => ({
      'Gestor': c.gestores ? `${c.gestores.nombre} ${c.gestores.apellido}` : '—',
      'Porcentaje': c.porcentaje_comision,
      'Monto Comision': c.monto_comision,
      'Fecha Pago': c.fecha_pago,
      'Metodo': c.metodo_pago,
      'Estado': c.estado,
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(comisionesExcel), 'Comisiones')
    const visitasExcel = (rV.data||[]).map(v => ({
      'Colegio': v.colegios?.nombre || '—',
      'Estacion': v.estaciones_bomberos?.nombre || '—',
      'Fecha': v.fecha_visita,
      'Kits Entregados': v.cantidad_kits_entregados,
      'Alumnos Capacitados': v.num_alumnos_capacitados,
      'Profesores Presentes': v.num_profesores_presentes,
      'Temas Tratados': v.temas_tratados,
      'Estado': v.estado,
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(visitasExcel), 'Visitas')
    XLSX.writeFile(wb, `Reporte_General_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  if (!ready) return <div className="content"><div className="loader"><div className="ring" /> Cargando dashboard...</div></div>

  const maxD = Math.max(...pats.map(p => p.total_donado||0), 1)

  const statCards = [
    { l:'Total Donaciones',  v:fmt(s.donaciones), sub:`${s.nDon} registradas`,      ico:'💰', bg:'#FEF2F2', page:'donaciones' },
    { l:'Saldo Disponible',  v:fmt(s.saldo),      sub:'Fondos activos',              ico:'💳', bg:'#ECFDF5', vc:'#059669', page:'donaciones' },
    { l:'Total Gastos',      v:fmt(s.gastos),     sub:'Kits + equipos + operativos', ico:'📦', bg:'#EFF6FF', vc:'#2563EB', page:'gastos' },
    { l:'Comisiones Gestores',v:fmt(s.comisiones),sub:'Comisiones pagadas',         ico:'🤝', bg:'#FFFBEB', vc:'#D97706', page:'comisiones' },
    { l:'Kits Entregados',   v:s.kitsEntregados,  sub:`${s.kitsPorEntregar} por entregar`, ico:'🎮', bg:'#F0FDF4', page:'visitas' },
  ]

  return (
    <div className="content">
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        <button className="btn btn-s" onClick={reporteGeneral}>📊 Reporte General</button>
      </div>
      <div className="stats">
        {statCards.map(x => (
          <div key={x.l} className="stat" style={{ cursor:'pointer', transition:'all .15s' }} onClick={() => onNavigate?.(x.page)} onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
            <div className="stat-ico" style={{ background:x.bg }}>{x.ico}</div>
            <div className="stat-l">{x.l}</div>
            <div className="stat-v" style={{ color:x.vc }}>{x.v}</div>
            <div className="stat-s">{x.sub}</div>
          </div>
        ))}
      </div>

      <div className="g3">
        {[
          { l:'Estaciones Bomberos', v:s.nEst, ico:'🚒', page:'estaciones' },
          { l:'Colegios Registrados', v:s.nCol, ico:'🏫', page:'colegios' },
          { l:'Visitas Realizadas', v:s.nVis, ico:'🎮', page:'visitas' },
        ].map(x => (
          <div key={x.l} className="stat" style={{ display:'flex', alignItems:'center', gap:16, cursor:'pointer', padding:'16px', borderRadius:'var(--radl)', border:'1px solid var(--br)', transition:'all .15s' }} onClick={() => onNavigate?.(x.page)} onMouseEnter={e => { e.currentTarget.style.background='#FAFBFC'; e.currentTarget.style.borderColor='var(--r)' }} onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='var(--br)' }}>
            <span style={{ fontSize:32 }}>{x.ico}</span>
            <div>
              <div className="stat-v" style={{ fontSize:28 }}>{x.v}</div>
              <div className="stat-l" style={{ marginBottom:0 }}>{x.l}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="g2 mt22">
        <div className="card">
          <div className="card-h"><span className="card-t">Ultimas Donaciones</span><span className="tag tag-b">{s.nDon}</span></div>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Patrocinador</th><th>Monto</th><th>Estado</th></tr></thead>
              <tbody>
                {dons.length === 0
                  ? <tr><td colSpan={3} style={{ textAlign:'center', color:'var(--t3)', padding:30 }}>Sin donaciones aun</td></tr>
                  : dons.map((d,i) => (
                    <tr key={i}>
                      <td><strong>{d.patrocinadores?.nombre_comercial||'—'}</strong><div style={{ color:'var(--t3)', fontSize:11 }}>Gestor: {d.gestores ? `${d.gestores.nombre} ${d.gestores.apellido}` : '—'}</div></td>
                      <td><span className="amt">{fmt(d.monto)}</span></td>
                      <td><Tag s={d.estado} /></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><span className="card-t">Top Patrocinadores</span></div>
          {pats.length === 0
            ? <div style={{ color:'var(--t3)', textAlign:'center', padding:20 }}>Sin patrocinadores</div>
            : <div className="bars">
                {pats.map(p => (
                  <div key={p.nombre_comercial} className="bar-r">
                    <span className="bar-l">{p.nombre_comercial}</span>
                    <div className="bar-t"><div className="bar-f" style={{ width:`${((p.total_donado||0)/maxD)*100}%` }} /></div>
                    <span className="bar-v">{fmt(p.total_donado)}</span>
                  </div>
                ))}
              </div>
          }
          <div className="divider" />
          <div className="card-h" style={{ marginBottom:10 }}><span className="card-t">Ultimas Visitas</span></div>
          {vis.length === 0
            ? <div style={{ color:'var(--t3)', textAlign:'center', padding:16 }}>Sin visitas registradas</div>
            : vis.map(v => (
              <div key={v.id} className="ri">
                <div>
                  <div className="ri-m">{v.colegios?.nombre||'—'}</div>
                  <div className="ri-s">{v.estaciones_bomberos?.nombre} · {fmtDate(v.fecha_visita)} · {v.cantidad_kits_entregados} kits</div>
                </div>
                <Tag s={v.estado} />
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

// ─── DONACIONES ───────────────────────────────────────────────────────────────
function exportarDonaciones(rows) {
  const filas = rows.map(r => ({
    'Patrocinador': r.patrocinadores?.nombre_comercial || '—',
    'Gestor': r.gestores ? `${r.gestores.nombre} ${r.gestores.apellido}` : '—',
    'Monto': r.monto,
    'Moneda': r.moneda,
    'Comision 5%': r.comision_gestor,
    'Fecha': r.fecha_donacion,
    'Metodo': r.metodo_pago,
    'Estado': r.estado,
  }))
  exportXLSX(filas, 'Donaciones')
}

function FmDonacion({ onClose, onSave, onError, initial }) {
  const [f, setF] = useState(initial ? { ...initial } : { patrocinador_id:'', gestor_id:'', monto:'', moneda:'PEN', fecha_donacion:'', metodo_pago:'Transferencia Bancaria', referencia_pago:'', estado:'pendiente', descripcion:'' })
  const [pats, setPats] = useState([]); const [gests, setGests] = useState([]); const [saving, setSaving] = useState(false)
  useEffect(() => {
    supabase.from('patrocinadores').select('id,nombre_comercial').eq('activo',true).then(({data}) => setPats(data||[]))
    supabase.from('gestores').select('id,nombre,apellido').eq('activo',true).then(({data}) => setGests(data||[]))
  }, [])
  const up = (k,v) => setF(p => ({...p,[k]:v}))
  const comision = f.monto ? (parseFloat(f.monto)*0.05).toFixed(2) : '0.00'
  const save = async () => {
    if (!f.patrocinador_id||!f.gestor_id||!f.monto||!f.fecha_donacion) { onError('Patrocinador, gestor, monto y fecha son obligatorios'); return }
    setSaving(true)
    const payload = { patrocinador_id:f.patrocinador_id, gestor_id:f.gestor_id, monto:parseFloat(f.monto), moneda:f.moneda, fecha_donacion:f.fecha_donacion, metodo_pago:f.metodo_pago, referencia_pago:f.referencia_pago, estado:f.estado, descripcion:f.descripcion, comision_gestor:parseFloat(comision) }
    const { error } = initial?.id
      ? await supabase.from('donaciones').update(payload).eq('id', initial.id)
      : await supabase.from('donaciones').insert(payload)
    setSaving(false)
    if (error) { onError(error.message); return }
    onSave(initial?.id ? 'Donacion actualizada correctamente' : 'Donacion registrada. Comision al 5% calculada automaticamente.')
  }
  return (
    <>
      <div className="modal-t">{initial?.id ? '✏️ Editar' : '💰 Nueva'} Donacion</div>
      <div className="fgrid">
        <div className="fg"><label className="fl">Patrocinador *</label>
          <select value={f.patrocinador_id} onChange={e => up('patrocinador_id',e.target.value)}>
            <option value="">— Seleccionar —</option>{pats.map(p => <option key={p.id} value={p.id}>{p.nombre_comercial}</option>)}
          </select>
        </div>
        <div className="fg"><label className="fl">Gestor *</label>
          <select value={f.gestor_id} onChange={e => up('gestor_id',e.target.value)}>
            <option value="">— Seleccionar —</option>{gests.map(g => <option key={g.id} value={g.id}>{g.nombre} {g.apellido}</option>)}
          </select>
        </div>
        <div className="fg"><label className="fl">Monto *</label><input type="number" min="0" step="0.01" placeholder="0.00" value={f.monto} onChange={e => up('monto',e.target.value)} /></div>
        <div className="fg"><label className="fl">Moneda</label>
          <select value={f.moneda} onChange={e => up('moneda',e.target.value)}><option value="PEN">PEN — Soles</option><option value="USD">USD — Dolares</option></select>
        </div>
        <div className="fg"><label className="fl">Fecha Donacion *</label><input type="date" value={f.fecha_donacion} onChange={e => up('fecha_donacion',e.target.value)} /></div>
        <div className="fg"><label className="fl">Estado</label>
          <select value={f.estado} onChange={e => up('estado',e.target.value)}><option value="pendiente">Pendiente</option><option value="recibida">Recibida</option></select>
        </div>
        <div className="fg"><label className="fl">Metodo de Pago</label>
          <select value={f.metodo_pago} onChange={e => up('metodo_pago',e.target.value)}>
            {['Transferencia Bancaria','Cheque','Efectivo','Otro'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="fg"><label className="fl">N° Referencia / Operacion</label><input type="text" placeholder="REF-001" value={f.referencia_pago} onChange={e => up('referencia_pago',e.target.value)} /></div>
        <div className="fg full"><label className="fl">Descripcion</label><textarea placeholder="Detalle de la donacion..." value={f.descripcion} onChange={e => up('descripcion',e.target.value)} /></div>
      </div>
      {parseFloat(f.monto) > 0 && <div className="ib ib-a" style={{ marginTop:14 }}>💡 Comision automatica al gestor (5%): <strong>S/ {comision}</strong></div>}
      <div className="modal-f">
        <button className="btn btn-s" onClick={onClose}>Cancelar</button>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving ? <><span className="spin" /> Guardando...</> : 'Registrar Donacion'}</button>
      </div>
    </>
  )
}

function Donaciones() {
  const { data, loading, reload } = useTable('donaciones','*, patrocinadores(nombre_comercial), gestores(nombre,apellido)')
  const totR = data.filter(d => d.estado==='recibida').reduce((a,d) => a+(d.monto||0),0)
  const totP = data.filter(d => d.estado==='pendiente').reduce((a,d) => a+(d.monto||0),0)
  const cols = [
    { key:'patrocinadores', label:'Patrocinador', render:(v,r) => <><strong>{v?.nombre_comercial||'—'}</strong><div style={{ color:'var(--t3)',fontSize:11 }}>{r.gestores ? `${r.gestores.nombre} ${r.gestores.apellido}` : '—'}</div></> },
    { key:'monto', label:'Monto', render:(v,r) => <span className="amt">{fmt(v,r.moneda)}</span> },
    { key:'comision_gestor', label:'Comision 5%', render:v => <span className="amt amt-a">{fmt(v)}</span> },
    { key:'fecha_donacion', label:'Fecha', render:v => fmtDate(v) },
    { key:'metodo_pago', label:'Metodo' },
    { key:'estado', label:'Estado', render:v => <Tag s={v} /> },
  ]
  const header = (
    <div className="fin-bar">
      <div className="fin-tile"><div className="fin-l">Recibido</div><div className="fin-v" style={{ color:'var(--g)' }}>{fmt(totR)}</div></div>
      <div className="fin-tile"><div className="fin-l">Pendiente</div><div className="fin-v" style={{ color:'var(--a)' }}>{fmt(totP)}</div></div>
      <div className="fin-tile"><div className="fin-l">Total registros</div><div className="fin-v">{data.length}</div></div>
    </div>
  )
  return <Page title="Donaciones" data={data} loading={loading} reload={reload} cols={cols} addLabel="Nueva Donacion" Form={FmDonacion} headerExtra={header} deleteTable="donaciones" exportFn={exportarDonaciones} filterFn={(r,q) => [r.patrocinadores?.nombre_comercial,r.gestores?.nombre,r.estado,r.metodo_pago].some(v => v&&v.toLowerCase().includes(q.toLowerCase()))} />
}

// ─── GESTORES ─────────────────────────────────────────────────────────────────
function exportarGestores(rows) {
  const filas = rows.map(r => ({
    'Nombre': r.nombre,
    'Apellido': r.apellido,
    'Email': r.email,
    'Telefono': r.telefono,
    'Banco': r.banco,
    'Comision %': r.comision_porcentaje,
    'Total Gestionado': r.total_donaciones_gestionadas,
    'Comisiones Pagadas': r.total_comisiones_pagadas,
    'Estado': r.activo ? 'Activo' : 'Inactivo',
  }))
  exportXLSX(filas, 'Gestores')
}

function FmGestor({ onClose, onSave, onError, initial }) {
  const [f, setF] = useState(initial ? { ...initial } : { nombre:'', apellido:'', email:'', telefono:'', dni:'', banco:'', cuenta_bancaria:'', cci:'', comision_porcentaje:5, activo:true, notas:'' })
  const [saving, setSaving] = useState(false)
  const up = (k,v) => setF(p => ({...p,[k]:v}))
  const save = async () => {
    if (!f.nombre||!f.email) { onError('Nombre y email son obligatorios'); return }
    setSaving(true)
    const { error } = initial?.id
      ? await supabase.from('gestores').update(f).eq('id', initial.id)
      : await supabase.from('gestores').insert(f)
    setSaving(false)
    if (error) { onError(error.message); return }
    onSave(initial?.id ? 'Gestor actualizado correctamente' : 'Gestor registrado exitosamente')
  }
  return (
    <>
      <div className="modal-t">{initial?.id ? '✏️ Editar' : '🤝 Nuevo'} Gestor</div>
      <div className="fgrid">
        <div className="fg"><label className="fl">Nombres *</label><input value={f.nombre} onChange={e => up('nombre',e.target.value)} placeholder="Nombres" /></div>
        <div className="fg"><label className="fl">Apellidos</label><input value={f.apellido} onChange={e => up('apellido',e.target.value)} placeholder="Apellidos" /></div>
        <div className="fg"><label className="fl">DNI</label><input value={f.dni} onChange={e => up('dni',e.target.value)} placeholder="00000000" /></div>
        <div className="fg"><label className="fl">Telefono</label><input value={f.telefono} onChange={e => up('telefono',e.target.value)} placeholder="999-000-000" /></div>
        <div className="fg full"><label className="fl">Correo Electronico *</label><input type="email" value={f.email} onChange={e => up('email',e.target.value)} placeholder="gestor@email.com" /></div>
        <div className="fg"><label className="fl">Banco</label><input value={f.banco} onChange={e => up('banco',e.target.value)} placeholder="BCP, Interbank, BBVA..." /></div>
        <div className="fg"><label className="fl">N° Cuenta</label><input value={f.cuenta_bancaria} onChange={e => up('cuenta_bancaria',e.target.value)} placeholder="Numero de cuenta" /></div>
        <div className="fg full"><label className="fl">CCI (Transferencias)</label><input value={f.cci} onChange={e => up('cci',e.target.value)} placeholder="00211234567890123456" /></div>
        <div className="fg"><label className="fl">Comision %</label><input type="number" min="0" max="100" step="0.5" value={f.comision_porcentaje} onChange={e => up('comision_porcentaje',parseFloat(e.target.value))} /></div>
        <div className="fg"><label className="fl">Estado</label><select value={f.activo?'true':'false'} onChange={e => up('activo',e.target.value==='true')}><option value="true">Activo</option><option value="false">Inactivo</option></select></div>
        <div className="fg full"><label className="fl">Notas</label><textarea value={f.notas} onChange={e => up('notas',e.target.value)} placeholder="Observaciones..." /></div>
      </div>
      <div className="modal-f">
        <button className="btn btn-s" onClick={onClose}>Cancelar</button>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving ? <><span className="spin" /> Guardando...</> : 'Guardar Gestor'}</button>
      </div>
    </>
  )
}

function Gestores() {
  const { data, loading, reload } = useTable('gestores')
  const cols = [
    { key:'nombre', label:'Gestor', render:(v,r) => <div style={{ display:'flex',alignItems:'center',gap:9 }}><div className="av">{inis(v,r.apellido)}</div><div><strong>{v} {r.apellido}</strong><div style={{ color:'var(--t3)',fontSize:11 }}>{r.email}</div></div></div> },
    { key:'telefono', label:'Telefono' },
    { key:'banco', label:'Banco' },
    { key:'comision_porcentaje', label:'Comision', render:v => <span className="tag tag-b">{v}%</span> },
    { key:'total_donaciones_gestionadas', label:'Total Gestionado', render:v => <span className="amt">{fmt(v||0)}</span> },
    { key:'total_comisiones_pagadas', label:'Comis. Pagadas', render:v => <span className="amt amt-g">{fmt(v||0)}</span> },
    { key:'activo', label:'Estado', render:v => <Tag s={v?'activo':'inactivo'} /> },
  ]
  return <Page title="Gestores" data={data} loading={loading} reload={reload} cols={cols} addLabel="Nuevo Gestor" Form={FmGestor} deleteTable="gestores" exportFn={exportarGestores} />
}

// ─── PATROCINADORES ───────────────────────────────────────────────────────────
function exportarPatrocinadores(rows) {
  const filas = rows.map(r => ({
    'Razon Social': r.razon_social,
    'Nombre Comercial': r.nombre_comercial,
    'RUC': r.ruc,
    'Pais': r.pais,
    'Sector': r.sector,
    'Contacto': r.nombre_contacto,
    'Email': r.email_contacto,
    'Total Donado': r.total_donado,
    'Estado': r.activo ? 'Activo' : 'Inactivo',
  }))
  exportXLSX(filas, 'Patrocinadores')
}

function FmPatrocinador({ onClose, onSave, onError, initial }) {
  const [f, setF] = useState(initial ? { ...initial } : { razon_social:'', nombre_comercial:'', ruc:'', pais:'Peru', ciudad:'Lima', direccion:'', email_contacto:'', telefono_contacto:'', nombre_contacto:'', sector:'Automotriz', activo:true, notas:'' })
  const [saving, setSaving] = useState(false)
  const up = (k,v) => setF(p => ({...p,[k]:v}))
  const save = async () => {
    if (!f.razon_social) { onError('Razon social es obligatoria'); return }
    setSaving(true)
    const { error } = initial?.id
      ? await supabase.from('patrocinadores').update(f).eq('id', initial.id)
      : await supabase.from('patrocinadores').insert(f)
    setSaving(false)
    if (error) { onError(error.message); return }
    onSave(initial?.id ? 'Patrocinador actualizado correctamente' : 'Patrocinador registrado exitosamente')
  }
  return (
    <>
      <div className="modal-t">{initial?.id ? '✏️ Editar' : '🏢 Nuevo'} Patrocinador</div>
      <div className="fgrid">
        <div className="fg"><label className="fl">Razon Social *</label><input value={f.razon_social} onChange={e => up('razon_social',e.target.value)} placeholder="Empresa S.A." /></div>
        <div className="fg"><label className="fl">Nombre Comercial / Marca</label><input value={f.nombre_comercial} onChange={e => up('nombre_comercial',e.target.value)} placeholder="Toyota Peru" /></div>
        <div className="fg"><label className="fl">RUC / Tax ID</label><input value={f.ruc} onChange={e => up('ruc',e.target.value)} placeholder="20100000000" /></div>
        <div className="fg"><label className="fl">Sector</label>
          <select value={f.sector} onChange={e => up('sector',e.target.value)}>{['Automotriz','Tecnologia','Banca','Seguros','Retail','Alimentos','Telecomunicaciones','Construccion','Otro'].map(s => <option key={s}>{s}</option>)}</select>
        </div>
        <div className="fg"><label className="fl">Pais</label><input value={f.pais} onChange={e => up('pais',e.target.value)} /></div>
        <div className="fg"><label className="fl">Ciudad</label><input value={f.ciudad} onChange={e => up('ciudad',e.target.value)} /></div>
        <div className="fg"><label className="fl">Nombre Contacto RSE</label><input value={f.nombre_contacto} onChange={e => up('nombre_contacto',e.target.value)} placeholder="Nombre del representante" /></div>
        <div className="fg"><label className="fl">Email de Contacto</label><input type="email" value={f.email_contacto} onChange={e => up('email_contacto',e.target.value)} placeholder="rse@empresa.com" /></div>
        <div className="fg"><label className="fl">Telefono</label><input value={f.telefono_contacto} onChange={e => up('telefono_contacto',e.target.value)} /></div>
        <div className="fg"><label className="fl">Estado</label><select value={f.activo?'true':'false'} onChange={e => up('activo',e.target.value==='true')}><option value="true">Activo</option><option value="false">Inactivo</option></select></div>
        <div className="fg full"><label className="fl">Direccion</label><input value={f.direccion} onChange={e => up('direccion',e.target.value)} /></div>
        <div className="fg full"><label className="fl">Notas</label><textarea value={f.notas} onChange={e => up('notas',e.target.value)} /></div>
      </div>
      <div className="modal-f">
        <button className="btn btn-s" onClick={onClose}>Cancelar</button>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving ? <><span className="spin" /> Guardando...</> : 'Guardar Patrocinador'}</button>
      </div>
    </>
  )
}

function Patrocinadores() {
  const { data, loading, reload } = useTable('patrocinadores')
  const cols = [
    { key:'nombre_comercial', label:'Marca / Empresa', render:(v,r) => <><strong>{v||r.razon_social}</strong><div style={{ color:'var(--t3)',fontSize:11 }}>{r.razon_social}</div></> },
    { key:'pais', label:'Pais' },
    { key:'sector', label:'Sector', render:v => <span className="tag tag-b">{v}</span> },
    { key:'nombre_contacto', label:'Contacto', render:(v,r) => <><div>{v||'—'}</div><div style={{ color:'var(--t3)',fontSize:11 }}>{r.email_contacto}</div></> },
    { key:'total_donado', label:'Total Donado', render:v => <span className="amt amt-g">{fmt(v||0)}</span> },
    { key:'activo', label:'Estado', render:v => <Tag s={v?'activo':'inactivo'} /> },
  ]
  return <Page title="Patrocinadores / Marcas" data={data} loading={loading} reload={reload} cols={cols} addLabel="Nuevo Patrocinador" Form={FmPatrocinador} deleteTable="patrocinadores" exportFn={exportarPatrocinadores} />
}

// ─── ESTACIONES ───────────────────────────────────────────────────────────────
function exportarEstaciones(rows) {
  const filas = rows.map(r => ({
    'Nombre': r.nombre,
    'Codigo': r.codigo,
    'Departamento': r.departamento,
    'Distrito': r.distrito,
    'Comandante': r.comandante,
    'Voluntarios': r.num_voluntarios,
    'Estado': r.activa ? 'Activa' : 'Inactiva',
  }))
  exportXLSX(filas, 'Estaciones')
}

function FmEstacion({ onClose, onSave, onError, initial }) {
  const [f, setF] = useState(initial ? { ...initial } : { nombre:'', codigo:'', departamento:'Lima', provincia:'Lima', distrito:'', direccion:'', telefono:'', email:'', comandante:'', num_voluntarios:0, activa:true, notas:'' })
  const [saving, setSaving] = useState(false)
  const up = (k,v) => setF(p => ({...p,[k]:v}))
  const save = async () => {
    if (!f.nombre) { onError('El nombre es obligatorio'); return }
    setSaving(true)
    const { error } = initial?.id
      ? await supabase.from('estaciones_bomberos').update(f).eq('id', initial.id)
      : await supabase.from('estaciones_bomberos').insert(f)
    setSaving(false)
    if (error) { onError(error.message); return }
    onSave(initial?.id ? 'Estacion actualizada correctamente' : 'Estacion registrada exitosamente')
  }
  return (
    <>
      <div className="modal-t">{initial?.id ? '✏️ Editar' : '🚒 Nueva'} Estacion</div>
      <div className="fgrid">
        <div className="fg full"><label className="fl">Nombre de la Estacion *</label><input value={f.nombre} onChange={e => up('nombre',e.target.value)} placeholder="CIA. de Bomberos Lima N°1" /></div>
        <div className="fg"><label className="fl">Codigo</label><input value={f.codigo} onChange={e => up('codigo',e.target.value)} placeholder="CB-LIM-001" /></div>
        <div className="fg"><label className="fl">Comandante</label><input value={f.comandante} onChange={e => up('comandante',e.target.value)} placeholder="Cnel. Nombre Apellido" /></div>
        <div className="fg"><label className="fl">Departamento</label><input value={f.departamento} onChange={e => up('departamento',e.target.value)} /></div>
        <div className="fg"><label className="fl">Provincia</label><input value={f.provincia} onChange={e => up('provincia',e.target.value)} /></div>
        <div className="fg"><label className="fl">Distrito</label><input value={f.distrito} onChange={e => up('distrito',e.target.value)} /></div>
        <div className="fg"><label className="fl">N° Voluntarios</label><input type="number" min="0" value={f.num_voluntarios} onChange={e => up('num_voluntarios',parseInt(e.target.value)||0)} /></div>
        <div className="fg"><label className="fl">Telefono</label><input value={f.telefono} onChange={e => up('telefono',e.target.value)} /></div>
        <div className="fg full"><label className="fl">Direccion</label><input value={f.direccion} onChange={e => up('direccion',e.target.value)} /></div>
        <div className="fg"><label className="fl">Email</label><input type="email" value={f.email} onChange={e => up('email',e.target.value)} /></div>
        <div className="fg"><label className="fl">Estado</label><select value={f.activa?'true':'false'} onChange={e => up('activa',e.target.value==='true')}><option value="true">Activa</option><option value="false">Inactiva</option></select></div>
        <div className="fg full"><label className="fl">Notas</label><textarea value={f.notas} onChange={e => up('notas',e.target.value)} /></div>
      </div>
      <div className="modal-f">
        <button className="btn btn-s" onClick={onClose}>Cancelar</button>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving ? <><span className="spin" /> Guardando...</> : 'Guardar Estacion'}</button>
      </div>
    </>
  )
}

function Estaciones() {
  const { data, loading, reload } = useTable('estaciones_bomberos')
  const cols = [
    { key:'nombre', label:'Estacion', render:(v,r) => <><strong>{v}</strong><div style={{ color:'var(--t3)',fontSize:11 }}>Codigo: {r.codigo||'—'}</div></> },
    { key:'departamento', label:'Ubicacion', render:(v,r) => `${r.distrito||'—'}, ${v}` },
    { key:'comandante', label:'Comandante' },
    { key:'num_voluntarios', label:'Voluntarios', render:v => <span className="tag tag-b">{v||0}</span> },
    { key:'activa', label:'Estado', render:v => <Tag s={v?'activa':'inactivo'} /> },
  ]
  return <Page title="Estaciones de Bomberos" data={data} loading={loading} reload={reload} cols={cols} addLabel="Nueva Estacion" Form={FmEstacion} deleteTable="estaciones_bomberos" exportFn={exportarEstaciones} />
}

// ─── COLEGIOS ─────────────────────────────────────────────────────────────────
function exportarColegios(rows) {
  const filas = rows.map(r => ({
    'Nombre': r.nombre,
    'Codigo Modular': r.codigo_modular,
    'Nivel': r.nivel,
    'Departamento': r.departamento,
    'Distrito': r.distrito,
    'Director': r.director,
    'Alumnos': r.num_alumnos,
    'Estacion': r.estacion_id ? 'Asignada' : 'Sin asignar',
    'Estado': r.activo ? 'Activo' : 'Inactivo',
  }))
  exportXLSX(filas, 'Colegios')
}

function FmColegio({ onClose, onSave, onError, initial }) {
  const [f, setF] = useState(initial ? { ...initial } : { nombre:'', codigo_modular:'', nivel:'Primaria', departamento:'Lima', provincia:'Lima', distrito:'', direccion:'', telefono:'', email:'', director:'', num_alumnos:0, estacion_id:'', activo:true, notas:'' })
  const [ests, setEsts] = useState([])
  const [saving, setSaving] = useState(false)
  useEffect(() => { supabase.from('estaciones_bomberos').select('id,nombre').eq('activa',true).then(({data}) => setEsts(data||[])) }, [])
  const up = (k,v) => setF(p => ({...p,[k]:v}))
  const save = async () => {
    if (!f.nombre) { onError('El nombre es obligatorio'); return }
    setSaving(true)
    const payload = { ...f, estacion_id: f.estacion_id || null }
    const { error } = initial?.id
      ? await supabase.from('colegios').update(payload).eq('id', initial.id)
      : await supabase.from('colegios').insert(payload)
    setSaving(false)
    if (error) { onError(error.message); return }
    onSave(initial?.id ? 'Colegio actualizado correctamente' : 'Colegio registrado exitosamente')
  }
  return (
    <>
      <div className="modal-t">{initial?.id ? '✏️ Editar' : '🏫 Nuevo'} Colegio</div>
      <div className="fgrid">
        <div className="fg full"><label className="fl">Nombre de la Institucion *</label><input value={f.nombre} onChange={e => up('nombre',e.target.value)} placeholder="I.E. Nombre del Colegio" /></div>
        <div className="fg"><label className="fl">Codigo Modular MINEDU</label><input value={f.codigo_modular} onChange={e => up('codigo_modular',e.target.value)} placeholder="0000000" /></div>
        <div className="fg"><label className="fl">Nivel Educativo</label>
          <select value={f.nivel} onChange={e => up('nivel',e.target.value)}><option>Inicial</option><option>Primaria</option><option>Secundaria</option></select>
        </div>
        <div className="fg"><label className="fl">Departamento</label><input value={f.departamento} onChange={e => up('departamento',e.target.value)} /></div>
        <div className="fg"><label className="fl">Provincia</label><input value={f.provincia} onChange={e => up('provincia',e.target.value)} /></div>
        <div className="fg"><label className="fl">Distrito</label><input value={f.distrito} onChange={e => up('distrito',e.target.value)} /></div>
        <div className="fg"><label className="fl">N° Alumnos</label><input type="number" min="0" value={f.num_alumnos} onChange={e => up('num_alumnos',parseInt(e.target.value)||0)} /></div>
        <div className="fg"><label className="fl">Director/a</label><input value={f.director} onChange={e => up('director',e.target.value)} placeholder="Prof. Nombre Apellido" /></div>
        <div className="fg"><label className="fl">Telefono</label><input value={f.telefono} onChange={e => up('telefono',e.target.value)} /></div>
        <div className="fg"><label className="fl">Email</label><input type="email" value={f.email} onChange={e => up('email',e.target.value)} /></div>
        <div className="fg full"><label className="fl">Estacion de Bomberos Asignada</label>
          <select value={f.estacion_id} onChange={e => up('estacion_id',e.target.value)}>
            <option value="">— Sin asignar —</option>
            {ests.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </div>
        <div className="fg full"><label className="fl">Direccion</label><input value={f.direccion} onChange={e => up('direccion',e.target.value)} /></div>
        <div className="fg full"><label className="fl">Notas</label><textarea value={f.notas} onChange={e => up('notas',e.target.value)} /></div>
      </div>
      <div className="modal-f">
        <button className="btn btn-s" onClick={onClose}>Cancelar</button>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving ? <><span className="spin" /> Guardando...</> : 'Guardar Colegio'}</button>
      </div>
    </>
  )
}

function Colegios() {
  const { data, loading, reload } = useTable('colegios','*, estaciones_bomberos(nombre)')
  const cols = [
    { key:'nombre', label:'Institucion Educativa', render:(v,r) => <><strong>{v}</strong><div style={{ color:'var(--t3)',fontSize:11 }}>Dir: {r.director||'—'}</div></> },
    { key:'nivel', label:'Nivel', render:v => <span className="tag tag-n">{v}</span> },
    { key:'distrito', label:'Ubicacion', render:(v,r) => `${v||'—'}, ${r.departamento}` },
    { key:'num_alumnos', label:'Alumnos', render:v => (v||0).toLocaleString() },
    { key:'estaciones_bomberos', label:'Estacion', render:v => v ? <span style={{ color:'var(--b)',fontSize:12 }}>🚒 {v.nombre}</span> : <span style={{ color:'var(--t3)' }}>Sin asignar</span> },
    { key:'activo', label:'Estado', render:v => <Tag s={v?'activo':'inactivo'} /> },
  ]
  return <Page title="Colegios" data={data} loading={loading} reload={reload} cols={cols} addLabel="Nuevo Colegio" Form={FmColegio} deleteTable="colegios" exportFn={exportarColegios} filterFn={(r,q) => [r.nombre,r.director,r.distrito,r.departamento,r.estaciones_bomberos?.nombre].some(v => v&&v.toLowerCase().includes(q.toLowerCase()))} />
}

// ─── VISITAS ──────────────────────────────────────────────────────────────────
function exportarVisitas(rows) {
  const filas = rows.map(r => ({
    'Colegio': r.colegios?.nombre || '—',
    'Estacion': r.estaciones_bomberos?.nombre || '—',
    'Fecha': r.fecha_visita,
    'Kits Entregados': r.cantidad_kits_entregados,
    'Alumnos Capacitados': r.num_alumnos_capacitados,
    'Profesores Presentes': r.num_profesores_presentes,
    'Temas Tratados': r.temas_tratados,
    'Estado': r.estado,
  }))
  exportXLSX(filas, 'Visitas')
}

function FmVisita({ onClose, onSave, onError, initial }) {
  const { user } = useAuth()
  const isBombero = user?.perfil?.roles?.nombre === 'bombero'
  const [f, setF] = useState(initial ? { ...initial } : { colegio_id:'', estacion_id:'', fecha_visita:'', hora_inicio:'', hora_fin:'', cantidad_kits_entregados:0, num_alumnos_capacitados:0, num_profesores_presentes:0, temas_tratados:'', observaciones:'', estado:'programada' })
  const [cols2, setCols] = useState([]); const [ests, setEsts] = useState([]); const [saving, setSaving] = useState(false)
  useEffect(() => {
    supabase.from('colegios').select('id,nombre').eq('activo',true).then(({data}) => setCols(data||[]))
    supabase.from('estaciones_bomberos').select('id,nombre').eq('activa',true).then(({data}) => setEsts(data||[]))
  }, [])
  const up = (k,v) => setF(p => ({...p,[k]:v}))
  const save = async () => {
    if (!f.colegio_id||!f.fecha_visita) { onError('Colegio y fecha son obligatorios'); return }
    setSaving(true)
    const payload = { ...f, bombero_responsable_id:user?.id||null, estacion_id:f.estacion_id||null }
    const { error } = initial?.id
      ? await supabase.from('visitas_entregas').update(payload).eq('id', initial.id)
      : await supabase.from('visitas_entregas').insert(payload)
    setSaving(false)
    if (error) { onError(error.message); return }
    onSave(initial?.id ? 'Visita actualizada correctamente' : 'Visita registrada correctamente')
  }
  return (
    <>
      <div className="modal-t">{initial?.id ? '✏️ Editar' : '🎮 Registrar'} Visita / Entrega de Kit</div>
      {isBombero && <div className="ib ib-b">Registrando como: <strong>{user?.perfil?.nombre} {user?.perfil?.apellido}</strong> — Bombero voluntario</div>}
      <div className="fgrid">
        <div className="fg full"><label className="fl">Colegio *</label>
          <select value={f.colegio_id} onChange={e => up('colegio_id',e.target.value)}>
            <option value="">— Seleccionar colegio —</option>
            {cols2.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        {!isBombero && (
          <div className="fg full"><label className="fl">Estacion de Bomberos</label>
            <select value={f.estacion_id} onChange={e => up('estacion_id',e.target.value)}>
              <option value="">— Seleccionar —</option>
              {ests.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
        )}
        <div className="fg"><label className="fl">Fecha de Visita *</label><input type="date" value={f.fecha_visita} onChange={e => up('fecha_visita',e.target.value)} /></div>
        <div className="fg"><label className="fl">Estado</label>
          <select value={f.estado} onChange={e => up('estado',e.target.value)}><option value="programada">Programada</option><option value="completada">Completada</option><option value="cancelado">Cancelada</option></select>
        </div>
        <div className="fg"><label className="fl">Hora Inicio</label><input type="time" value={f.hora_inicio} onChange={e => up('hora_inicio',e.target.value)} /></div>
        <div className="fg"><label className="fl">Hora Fin</label><input type="time" value={f.hora_fin} onChange={e => up('hora_fin',e.target.value)} /></div>
        <div className="fg"><label className="fl">Kits Entregados</label><input type="number" min="0" value={f.cantidad_kits_entregados} onChange={e => up('cantidad_kits_entregados',parseInt(e.target.value)||0)} /></div>
        <div className="fg"><label className="fl">Alumnos Capacitados</label><input type="number" min="0" value={f.num_alumnos_capacitados} onChange={e => up('num_alumnos_capacitados',parseInt(e.target.value)||0)} /></div>
        <div className="fg"><label className="fl">Profesores Presentes</label><input type="number" min="0" value={f.num_profesores_presentes} onChange={e => up('num_profesores_presentes',parseInt(e.target.value)||0)} /></div>
        <div className="fg full"><label className="fl">Temas Tratados</label><textarea value={f.temas_tratados} onChange={e => up('temas_tratados',e.target.value)} placeholder="Senales de transito, semaforos, cruce peatonal..." /></div>
        <div className="fg full"><label className="fl">Observaciones</label><textarea value={f.observaciones} onChange={e => up('observaciones',e.target.value)} placeholder="Observaciones de la visita..." /></div>
      </div>
      <div className="modal-f">
        <button className="btn btn-s" onClick={onClose}>Cancelar</button>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving ? <><span className="spin" /> Guardando...</> : 'Registrar Visita'}</button>
      </div>
    </>
  )
}

function Visitas() {
  const { data, loading, reload } = useTable('visitas_entregas','*, colegios(nombre), estaciones_bomberos(nombre), usuarios(nombre,apellido)')
  const cols = [
    { key:'colegios', label:'Colegio', render:v => <strong>{v?.nombre||'—'}</strong> },
    { key:'estaciones_bomberos', label:'Estacion', render:v => v ? <span style={{ fontSize:12 }}>🚒 {v.nombre}</span> : '—' },
    { key:'usuarios', label:'Bombero', render:v => v ? `${v.nombre} ${v.apellido}` : '—' },
    { key:'fecha_visita', label:'Fecha', render:v => fmtDate(v) },
    { key:'cantidad_kits_entregados', label:'Kits', render:v => <span className="tag tag-b">{v||0} kits</span> },
    { key:'num_alumnos_capacitados', label:'Alumnos', render:v => v>0 ? v : '—' },
    { key:'estado', label:'Estado', render:v => <Tag s={v} /> },
  ]
  return <Page title="Visitas y Entregas de Kits" data={data} loading={loading} reload={reload} cols={cols} addLabel="Registrar Visita" Form={FmVisita} deleteTable="visitas_entregas" exportFn={exportarVisitas} filterFn={(r,q) => [r.colegios?.nombre,r.estaciones_bomberos?.nombre,r.estado].some(v => v&&v.toLowerCase().includes(q.toLowerCase()))} />
}

// ─── CONTRATOS ────────────────────────────────────────────────────────────────
function exportarContratos(rows) {
  const filas = rows.map(r => ({
    'N° Contrato': r.numero_contrato,
    'Titulo': r.titulo,
    'Tipo': r.tipo,
    'Patrocinador': r.patrocinadores?.nombre_comercial || '—',
    'Monto Comprometido': r.monto_comprometido,
    'Moneda': r.moneda,
    'Fecha Inicio': r.fecha_inicio,
    'Fecha Fin': r.fecha_fin,
    'Estado': r.estado,
  }))
  exportXLSX(filas, 'Contratos')
}

function FmContrato({ onClose, onSave, onError, initial }) {
  const [f, setF] = useState(initial ? { ...initial } : { numero_contrato:'', tipo:'Donacion Corporativa', titulo:'', patrocinador_id:'', gestor_id:'', monto_comprometido:'', moneda:'PEN', fecha_inicio:'', fecha_fin:'', estado:'borrador', descripcion:'', notas:'' })
  const [pats, setPats] = useState([]); const [gests, setGests] = useState([]); const [saving, setSaving] = useState(false)
  useEffect(() => {
    supabase.from('patrocinadores').select('id,nombre_comercial').eq('activo',true).then(({data}) => setPats(data||[]))
    supabase.from('gestores').select('id,nombre,apellido').eq('activo',true).then(({data}) => setGests(data||[]))
  }, [])
  const up = (k,v) => setF(p => ({...p,[k]:v}))
  const save = async () => {
    if (!f.titulo) { onError('El titulo es obligatorio'); return }
    setSaving(true)
    const payload = { ...f, monto_comprometido:f.monto_comprometido?parseFloat(f.monto_comprometido):null, patrocinador_id:f.patrocinador_id||null, gestor_id:f.gestor_id||null }
    const { error } = initial?.id
      ? await supabase.from('contratos').update(payload).eq('id', initial.id)
      : await supabase.from('contratos').insert(payload)
    setSaving(false)
    if (error) { onError(error.message); return }
    onSave(initial?.id ? 'Contrato actualizado correctamente' : 'Contrato registrado exitosamente')
  }
  return (
    <>
      <div className="modal-t">{initial?.id ? '✏️ Editar' : '📄 Nuevo'} Contrato</div>
      <div className="fgrid">
        <div className="fg"><label className="fl">N° de Contrato</label><input value={f.numero_contrato} onChange={e => up('numero_contrato',e.target.value)} placeholder="CONT-2025-003" /></div>
        <div className="fg"><label className="fl">Tipo</label>
          <select value={f.tipo} onChange={e => up('tipo',e.target.value)}>{['Donacion Corporativa','Convenio Institucional','Acuerdo de Servicio','Otro'].map(t => <option key={t}>{t}</option>)}</select>
        </div>
        <div className="fg full"><label className="fl">Titulo del Contrato *</label><input value={f.titulo} onChange={e => up('titulo',e.target.value)} placeholder="Descripcion breve" /></div>
        <div className="fg"><label className="fl">Patrocinador</label>
          <select value={f.patrocinador_id} onChange={e => up('patrocinador_id',e.target.value)}><option value="">— Opcional —</option>{pats.map(p => <option key={p.id} value={p.id}>{p.nombre_comercial}</option>)}</select>
        </div>
        <div className="fg"><label className="fl">Gestor</label>
          <select value={f.gestor_id} onChange={e => up('gestor_id',e.target.value)}><option value="">— Opcional —</option>{gests.map(g => <option key={g.id} value={g.id}>{g.nombre} {g.apellido}</option>)}</select>
        </div>
        <div className="fg"><label className="fl">Monto Comprometido</label><input type="number" min="0" step="0.01" value={f.monto_comprometido} onChange={e => up('monto_comprometido',e.target.value)} /></div>
        <div className="fg"><label className="fl">Moneda</label><select value={f.moneda} onChange={e => up('moneda',e.target.value)}><option value="PEN">PEN</option><option value="USD">USD</option></select></div>
        <div className="fg"><label className="fl">Fecha Inicio</label><input type="date" value={f.fecha_inicio} onChange={e => up('fecha_inicio',e.target.value)} /></div>
        <div className="fg"><label className="fl">Fecha Fin</label><input type="date" value={f.fecha_fin} onChange={e => up('fecha_fin',e.target.value)} /></div>
        <div className="fg"><label className="fl">Estado</label><select value={f.estado} onChange={e => up('estado',e.target.value)}>{['borrador','activo','vencido','cancelado'].map(s => <option key={s}>{s}</option>)}</select></div>
        <div className="fg full"><label className="fl">Descripcion / Clausulas</label><textarea value={f.descripcion} onChange={e => up('descripcion',e.target.value)} placeholder="Descripcion del contrato..." /></div>
      </div>
      <div className="modal-f">
        <button className="btn btn-s" onClick={onClose}>Cancelar</button>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving ? <><span className="spin" /> Guardando...</> : 'Guardar Contrato'}</button>
      </div>
    </>
  )
}

function Contratos() {
  const { data, loading, reload } = useTable('contratos','*, patrocinadores(nombre_comercial), gestores(nombre,apellido)')
  const cols = [
    { key:'numero_contrato', label:'N° Contrato', render:v => <code style={{ background:'var(--bg)',padding:'2px 7px',borderRadius:4,fontSize:11 }}>{v||'—'}</code> },
    { key:'titulo', label:'Titulo' },
    { key:'tipo', label:'Tipo', render:v => <span className="tag tag-n">{v}</span> },
    { key:'patrocinadores', label:'Patrocinador', render:v => v?.nombre_comercial||'—' },
    { key:'monto_comprometido', label:'Monto', render:(v,r) => v ? <span className="amt">{fmt(v,r.moneda)}</span> : '—' },
    { key:'fecha_fin', label:'Vence', render:v => fmtDate(v) },
    { key:'estado', label:'Estado', render:v => <Tag s={v} /> },
  ]
  return <Page title="Contratos" data={data} loading={loading} reload={reload} cols={cols} addLabel="Nuevo Contrato" Form={FmContrato} deleteTable="contratos" exportFn={exportarContratos} filterFn={(r,q) => [r.titulo,r.numero_contrato,r.tipo,r.patrocinadores?.nombre_comercial,r.estado].some(v => v&&v.toLowerCase().includes(q.toLowerCase()))} />
}

// ─── GASTOS ───────────────────────────────────────────────────────────────────
function exportarGastos(rows) {
  const filas = rows.map(r => ({
    'Tipo': r.tipo,
    'Categoria': r.categoria,
    'Descripcion': r.descripcion,
    'Monto': r.monto,
    'Moneda': r.moneda,
    'Proveedor': r.proveedor,
    'Factura': r.factura_numero,
    'Fecha': r.fecha,
    'Estado': r.estado,
  }))
  exportXLSX(filas, 'Gastos')
}

function FmGasto({ onClose, onSave, onError, initial }) {
  const [f, setF] = useState(initial ? { ...initial } : { tipo:'Produccion Kits', categoria:'', descripcion:'', monto:'', moneda:'PEN', fecha:'', proveedor:'', factura_numero:'', estado:'pendiente', notas:'' })
  const [saving, setSaving] = useState(false)
  const up = (k,v) => setF(p => ({...p,[k]:v}))
  const save = async () => {
    if (!f.descripcion||!f.monto||!f.fecha) { onError('Descripcion, monto y fecha son obligatorios'); return }
    setSaving(true)
    const { error } = initial?.id
      ? await supabase.from('gastos').update({ ...f, monto:parseFloat(f.monto) }).eq('id', initial.id)
      : await supabase.from('gastos').insert({ ...f, monto:parseFloat(f.monto) })
    setSaving(false)
    if (error) { onError(error.message); return }
    onSave(initial?.id ? 'Gasto actualizado correctamente' : 'Gasto registrado exitosamente')
  }
  return (
    <>
      <div className="modal-t">{initial?.id ? '✏️ Editar' : '💸 Registrar'} Gasto</div>
      <div className="fgrid">
        <div className="fg"><label className="fl">Tipo de Gasto</label>
          <select value={f.tipo} onChange={e => up('tipo',e.target.value)}>{['Produccion Kits','Equipos Bomberos','Operativo','Administrativo','Comision Gestor','Transporte','Otro'].map(t => <option key={t}>{t}</option>)}</select>
        </div>
        <div className="fg"><label className="fl">Categoria</label><input value={f.categoria} onChange={e => up('categoria',e.target.value)} placeholder="Juegos, Transporte, etc." /></div>
        <div className="fg full"><label className="fl">Descripcion *</label><input value={f.descripcion} onChange={e => up('descripcion',e.target.value)} placeholder="Descripcion del gasto" /></div>
        <div className="fg"><label className="fl">Monto *</label><input type="number" min="0" step="0.01" value={f.monto} onChange={e => up('monto',e.target.value)} /></div>
        <div className="fg"><label className="fl">Moneda</label><select value={f.moneda} onChange={e => up('moneda',e.target.value)}><option value="PEN">PEN</option><option value="USD">USD</option></select></div>
        <div className="fg"><label className="fl">Fecha *</label><input type="date" value={f.fecha} onChange={e => up('fecha',e.target.value)} /></div>
        <div className="fg"><label className="fl">Estado</label><select value={f.estado} onChange={e => up('estado',e.target.value)}><option value="pendiente">Pendiente</option><option value="aprobado">Aprobado</option><option value="rechazado">Rechazado</option></select></div>
        <div className="fg"><label className="fl">Proveedor</label><input value={f.proveedor} onChange={e => up('proveedor',e.target.value)} /></div>
        <div className="fg"><label className="fl">N° Factura / RHE</label><input value={f.factura_numero} onChange={e => up('factura_numero',e.target.value)} placeholder="F001-00000" /></div>
        <div className="fg full"><label className="fl">Notas</label><textarea value={f.notas} onChange={e => up('notas',e.target.value)} /></div>
      </div>
      <div className="modal-f">
        <button className="btn btn-s" onClick={onClose}>Cancelar</button>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving ? <><span className="spin" /> Guardando...</> : 'Registrar Gasto'}</button>
      </div>
    </>
  )
}

function Gastos() {
  const { data, loading, reload } = useTable('gastos')
  const total = data.filter(g => g.estado==='aprobado').reduce((a,g) => a+(g.monto||0),0)
  const cols = [
    { key:'tipo', label:'Tipo', render:(v,r) => <><span className="tag tag-n">{v}</span>{r.categoria&&<div style={{ color:'var(--t3)',fontSize:11,marginTop:2 }}>{r.categoria}</div>}</> },
    { key:'descripcion', label:'Descripcion' },
    { key:'monto', label:'Monto', render:(v,r) => <span className="amt amt-e">- {fmt(v,r.moneda)}</span> },
    { key:'proveedor', label:'Proveedor' },
    { key:'fecha', label:'Fecha', render:v => fmtDate(v) },
    { key:'estado', label:'Estado', render:v => <Tag s={v} /> },
  ]
  const header = (
    <div className="fin-bar">
      <div className="fin-tile"><div className="fin-l">Total Aprobado</div><div className="fin-v" style={{ color:'var(--e)' }}>- {fmt(total)}</div></div>
      <div className="fin-tile"><div className="fin-l">Registros</div><div className="fin-v">{data.length}</div></div>
    </div>
  )
  return <Page title="Registro de Gastos" data={data} loading={loading} reload={reload} cols={cols} addLabel="Nuevo Gasto" Form={FmGasto} deleteTable="gastos" exportFn={exportarGastos} headerExtra={header} />
}

// ─── COMISIONES ───────────────────────────────────────────────────────────────
function exportarComisiones(rows) {
  const filas = rows.map(r => ({
    'Gestor': r.gestores ? `${r.gestores.nombre} ${r.gestores.apellido}` : '—',
    'Porcentaje': r.porcentaje_comision,
    'Monto Comision': r.monto_comision,
    'Fecha Pago': r.fecha_pago,
    'Metodo': r.metodo_pago,
    'Estado': r.estado,
  }))
  exportXLSX(filas, 'Comisiones')
}

function FmComision({ onClose, onSave, onError, initial }) {
  const [f, setF] = useState(initial ? { ...initial } : { gestor_id:'', donacion_id:'', monto_comision:'', fecha_pago:'', metodo_pago:'Transferencia', referencia_pago:'', estado:'pagado', notas:'' })
  const [dons, setDons] = useState([]); const [gests, setGests] = useState([]); const [saving, setSaving] = useState(false)
  useEffect(() => {
    supabase.from('gestores').select('id,nombre,apellido').eq('activo',true).then(({data}) => setGests(data||[]))
    supabase.from('donaciones').select('id,monto,comision_gestor,comision_pagada,patrocinadores(nombre_comercial)').eq('comision_pagada',false).then(({data}) => setDons(data||[]))
  }, [])
  const up = (k,v) => setF(p => ({...p,[k]:v}))
  const selDon = dons.find(d => d.id === f.donacion_id)
  const save = async () => {
    if (!f.gestor_id||!f.donacion_id||!f.fecha_pago) { onError('Gestor, donacion y fecha son obligatorios'); return }
    setSaving(true)
    const payload = { ...f, monto_comision:parseFloat(f.monto_comision||selDon?.comision_gestor||0), monto_donacion:selDon?.monto, porcentaje:5 }
    const { error } = initial?.id
      ? await supabase.from('comisiones').update(payload).eq('id', initial.id)
      : await supabase.from('comisiones').insert(payload)
    if (!error && !initial?.id && f.donacion_id) await supabase.from('donaciones').update({ comision_pagada:true }).eq('id',f.donacion_id)
    setSaving(false)
    if (error) { onError(error.message); return }
    onSave(initial?.id ? 'Comision actualizada correctamente' : 'Pago de comision registrado correctamente')
  }
  return (
    <>
      <div className="modal-t">{initial?.id ? '✏️ Editar' : '💸 Registrar'} Pago de Comision</div>
      <div className="fgrid">
        <div className="fg"><label className="fl">Gestor *</label>
          <select value={f.gestor_id} onChange={e => up('gestor_id',e.target.value)}><option value="">— Seleccionar —</option>{gests.map(g => <option key={g.id} value={g.id}>{g.nombre} {g.apellido}</option>)}</select>
        </div>
        <div className="fg"><label className="fl">Donacion (comision pendiente) *</label>
          <select value={f.donacion_id} onChange={e => { up('donacion_id',e.target.value); const d=dons.find(x=>x.id===e.target.value); if(d) up('monto_comision',d.comision_gestor||'') }}>
            <option value="">— Seleccionar —</option>
            {dons.map(d => <option key={d.id} value={d.id}>{d.patrocinadores?.nombre_comercial} — {fmt(d.monto)} (comis: {fmt(d.comision_gestor)})</option>)}
          </select>
        </div>
        <div className="fg"><label className="fl">Monto Comision</label><input type="number" min="0" step="0.01" value={f.monto_comision} onChange={e => up('monto_comision',e.target.value)} /></div>
        <div className="fg"><label className="fl">Fecha de Pago *</label><input type="date" value={f.fecha_pago} onChange={e => up('fecha_pago',e.target.value)} /></div>
        <div className="fg"><label className="fl">Metodo de Pago</label><select value={f.metodo_pago} onChange={e => up('metodo_pago',e.target.value)}><option>Transferencia</option><option>Efectivo</option><option>Cheque</option></select></div>
        <div className="fg"><label className="fl">N° Referencia</label><input value={f.referencia_pago} onChange={e => up('referencia_pago',e.target.value)} placeholder="N° operacion" /></div>
        <div className="fg full"><label className="fl">Notas</label><textarea value={f.notas} onChange={e => up('notas',e.target.value)} /></div>
      </div>
      <div className="modal-f">
        <button className="btn btn-s" onClick={onClose}>Cancelar</button>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving ? <><span className="spin" /> Guardando...</> : 'Registrar Pago'}</button>
      </div>
    </>
  )
}

function Comisiones() {
  const { data, loading, reload } = useTable('comisiones','*, gestores(nombre,apellido), donaciones(monto,patrocinadores(nombre_comercial))')
  const pendiente = data.filter(c => c.estado==='pendiente').reduce((a,c) => a+(c.monto_comision||0),0)
  const pagado    = data.filter(c => c.estado==='pagado').reduce((a,c) => a+(c.monto_comision||0),0)
  const cols = [
    { key:'gestores', label:'Gestor', render:v => v ? <strong>{v.nombre} {v.apellido}</strong> : '—' },
    { key:'donaciones', label:'Donacion', render:v => v ? <span style={{ fontSize:12,color:'var(--t2)' }}>{v.patrocinadores?.nombre_comercial} — {fmt(v.monto)}</span> : '—' },
    { key:'porcentaje', label:'%', render:v => <span className="tag tag-b">{v||5}%</span> },
    { key:'monto_comision', label:'Comision', render:v => <span className="amt amt-a">{fmt(v)}</span> },
    { key:'fecha_pago', label:'Fecha Pago', render:v => v ? fmtDate(v) : <span style={{ color:'var(--t3)' }}>Pendiente</span> },
    { key:'metodo_pago', label:'Metodo' },
    { key:'estado', label:'Estado', render:v => <Tag s={v} /> },
  ]
  const header = (
    <div className="fin-bar">
      <div className="fin-tile"><div className="fin-l">Por Pagar</div><div className="fin-v" style={{ color:'var(--a)' }}>{fmt(pendiente)}</div></div>
      <div className="fin-tile"><div className="fin-l">Ya Pagado</div><div className="fin-v" style={{ color:'var(--g)' }}>{fmt(pagado)}</div></div>
    </div>
  )
  return <Page title="Comisiones de Gestores (5%)" data={data} loading={loading} reload={reload} cols={cols} addLabel="Registrar Pago" Form={FmComision} deleteTable="comisiones" exportFn={exportarComisiones} headerExtra={header} filterFn={(r,q) => [r.gestores?.nombre,r.gestores?.apellido,r.estado].some(v => v&&v.toLowerCase().includes(q.toLowerCase()))} />
}

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NAV = [
  { id:'dashboard',    label:'Dashboard',           icon:IC.dash, roles:['admin','gestor','auditor','bombero'] },
  { id:'donaciones',   label:'Patrocinios',          icon:IC.don,  roles:['admin','gestor'],  sec:'Fondos' },
  { id:'patrocinadores',label:'Patrocinadores',      icon:IC.pat,  roles:['admin','gestor'],  sec:'Fondos' },
  { id:'contratos',    label:'Contratos',            icon:IC.doc,  roles:['admin','gestor'],  sec:'Fondos' },
  { id:'gestores',     label:'Gestores',             icon:IC.gest, roles:['admin'],           sec:'Administracion' },
  { id:'comisiones',   label:'Comisiones 5%',        icon:IC.com,  roles:['admin'],           sec:'Administracion' },
  { id:'gastos',       label:'Gastos',               icon:IC.gas,  roles:['admin','auditor'], sec:'Administracion' },
  { id:'estaciones',   label:'Estaciones Bomberos',  icon:IC.fire, roles:['admin'],           sec:'Operaciones' },
  { id:'colegios',     label:'Colegios',             icon:IC.sch,  roles:['admin'],           sec:'Operaciones' },
  { id:'visitas',      label:'Visitas / Entregas',   icon:IC.vis,  roles:['admin','bombero'], sec:'Operaciones' },
]
const PAGES = { dashboard:Dashboard, donaciones:Donaciones, patrocinadores:Patrocinadores, contratos:Contratos, gestores:Gestores, comisiones:Comisiones, gastos:Gastos, estaciones:Estaciones, colegios:Colegios, visitas:Visitas }
const ROLE_LABELS = { admin:'Administrador', gestor:'Gestor', bombero:'Bombero', auditor:'Auditor' }

// ─── SHELL ────────────────────────────────────────────────────────────────────
function Shell({ user, onLogout }) {
  const role = user?.perfil?.roles?.nombre || 'admin'
  const visible = NAV.filter(n => n.roles.includes(role))
  const defaultPage = role === 'bombero' ? 'visitas' : 'dashboard'
  const [page, setPage] = useState(defaultPage)

  const sections = [...new Set(visible.filter(n => n.sec).map(n => n.sec))]
  const noSec = visible.filter(n => !n.sec)
  const PageComp = PAGES[page] || Dashboard
  const pageLabel = NAV.find(n => n.id === page)?.label || ''
  const nombre = user?.perfil?.nombre || user?.email?.split('@')[0] || 'Usuario'
  const apellido = user?.perfil?.apellido || ''

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="s-logo">
          <div className="s-logo-box">E</div>
          <div><h1>EDUCATRAN</h1><p>Donaciones Viales</p></div>
        </div>

        {noSec.map(n => (
          <button key={n.id} className={`s-item${page===n.id?' on':''}`} onClick={() => setPage(n.id)}>
            {n.icon} {n.label}
          </button>
        ))}

        {sections.map(sec => (
          <div key={sec}>
            <div className="s-sec">{sec}</div>
            {visible.filter(n => n.sec===sec).map(n => (
              <button key={n.id} className={`s-item${page===n.id?' on':''}`} onClick={() => setPage(n.id)}>
                {n.icon} {n.label}
              </button>
            ))}
          </div>
        ))}

        <div className="s-foot">
          <div className="s-user">
            <div className="av">{inis(nombre,apellido)}</div>
            <div style={{ flex:1, overflow:'hidden' }}>
              <div className="s-uname">{nombre} {apellido}</div>
              <div className="s-urole">{ROLE_LABELS[role]||role}</div>
            </div>
          </div>
          <button className="s-item" style={{ color:'rgba(255,100,100,.75)', marginTop:2 }} onClick={onLogout}>
            {IC.out} Cerrar Sesion
          </button>
        </div>
      </nav>

      <div className="main">
        <div className="topbar">
          <span className="topbar-t">{pageLabel}</span>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:12, color:'var(--t2)', fontWeight:500 }}>{nombre} {apellido}</span>
            <div className="av">{inis(nombre,apellido)}</div>
          </div>
        </div>
        <AuthCtx.Provider value={{ user }}>
          <PageComp onNavigate={setPage} />
        </AuthCtx.Provider>
      </div>
    </div>
  )
}

// ─── ROOT APP ────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Con persistSession:false no hay sesión guardada, mostrar login directo
    setChecking(false)
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (checking) return (
    <>
      <style>{CSS}</style>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:20,background:'#F7F8FA'}}>
        <div style={{width:56,height:56,background:'#E63946',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:26,color:'#fff'}}>E</div>
        <div className="ring" />
      </div>
    </>
  )

  return (
    <>
      <style>{CSS}</style>
      {user
        ? <Shell user={user} onLogout={logout} />
        : <Login onLogin={setUser} />
      }
    </>
  )
}
