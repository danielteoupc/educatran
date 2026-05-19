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
  --r:#E63946;--rd:#B5282F;--r-glow:rgba(230,57,70,0.15);
  --sb:#0A0E1A;--sb2:#111827;
  --bg:#F0F2F8;--w:#FFFFFF;--br:#E2E8F0;
  --t1:#0F172A;--t2:#64748B;--t3:#94A3B8;
  --g:#10B981;--gb:#ECFDF5;
  --a:#F59E0B;--ab:#FFFBEB;
  --b:#3B82F6;--bb:#EFF6FF;
  --e:#EF4444;--eb:#FEF2F2;
  --glass:rgba(255,255,255,0.7);
  --shadow-sm:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04);
  --shadow:0 4px 16px rgba(0,0,0,0.08);
  --shadow-lg:0 12px 40px rgba(0,0,0,0.12);
  --shadow-red:0 8px 24px rgba(230,57,70,0.2);
  --rad:10px;--rads:6px;--radl:14px;
  font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;color:var(--t1);
}
body{font-size:16px}
body{background:linear-gradient(135deg,#EEF2FF 0%,#F0F2F8 50%,#FFF5F5 100%);background-attachment:fixed;margin:0}

::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#E63946,#B5282F);border-radius:10px}
::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,#B5282F,#7D1D26)}

/* LAYOUT */
.layout{display:flex;height:100vh;overflow:hidden}
.sidebar{width:240px;min-width:240px;background:linear-gradient(180deg,#0D1117 0%,#111827 100%);display:flex;flex-direction:column;overflow-y:auto;border-right:1px solid rgba(255,255,255,0.05)}
.main{flex:1;overflow-y:auto;display:flex;flex-direction:column;min-width:0}

/* LOGO */
.s-logo{padding:20px 16px 18px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:12px;margin-bottom:8px}
.s-logo-box{width:38px;height:38px;background:linear-gradient(135deg,#E63946,#B5282F);border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:18px;color:#fff;flex-shrink:0;box-shadow:0 4px 14px rgba(230,57,70,0.4);transition:all 0.3s ease}
.s-logo:hover .s-logo-box{transform:rotate(-8deg) scale(1.1);box-shadow:0 6px 20px rgba(230,57,70,0.6)}
.s-logo h1{color:#fff;font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:800;line-height:1.2;letter-spacing:-0.3px}
.s-logo p{color:rgba(255,255,255,0.3);font-size:10px;text-transform:uppercase;letter-spacing:1.5px;margin-top:1px}

/* SECCIÓN LABELS */
.s-sec{padding:16px 16px 5px;color:rgba(255,255,255,0.25);font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700}

/* NAV ITEMS */
.s-item{display:flex;align-items:center;gap:10px;padding:9px 16px;margin:1px 8px;color:rgba(255,255,255,0.55);font-size:15px;font-weight:500;cursor:pointer;position:relative;border:none;background:none;width:calc(100% - 16px);text-align:left;border-radius:10px;transition:all 0.18s cubic-bezier(0.4,0,0.2,1);letter-spacing:-0.1px}
.s-item svg{opacity:0.55;flex-shrink:0;width:16px;height:16px;transition:all 0.18s ease}
.s-item:hover{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.9);transform:translateX(2px)}
.s-item:hover svg{opacity:0.9;color:#E63946}
.s-item.on{background:linear-gradient(135deg,rgba(230,57,70,0.18),rgba(230,57,70,0.06));color:#fff;font-weight:600;box-shadow:inset 0 0 0 1px rgba(230,57,70,0.25)}
.s-item.on svg{opacity:1;color:#E63946}
.s-item.on::before{content:'';position:absolute;left:0;top:25%;bottom:25%;width:3px;background:linear-gradient(180deg,#E63946,#FF6B6B);border-radius:0 3px 3px 0;box-shadow:0 0 8px rgba(230,57,70,0.7)}

/* FOOTER */
.s-foot{margin-top:auto;border-top:1px solid rgba(255,255,255,0.06);padding:10px 0}
.s-user{padding:10px 16px 6px;display:flex;align-items:center;gap:10px;margin:0 8px;border-radius:10px;transition:background 0.15s}
.s-user:hover{background:rgba(255,255,255,0.04)}
.s-uname{color:rgba(255,255,255,0.75);font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-0.2px}
.s-urole{color:rgba(255,255,255,0.3);font-size:10px;margin-top:1px}

/* TOPBAR */
.topbar{background:rgba(255,255,255,0.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(226,232,240,0.8);box-shadow:0 1px 20px rgba(0,0,0,0.04);padding:0 26px;height:58px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:5;flex-shrink:0}
.topbar-t{background:linear-gradient(135deg,#0F172A 0%,#E63946 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:'Space Grotesk',sans-serif;font-size:19px;font-weight:700}

/* CONTENT */
.content{padding:26px;flex:1;animation:pageIn 0.3s cubic-bezier(0.4,0,0.2,1)}

/* STAT CARDS */
.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:22px}
.stat{background:var(--w);border:1px solid var(--br);border-radius:16px;padding:20px;cursor:pointer;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden}
.stat::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#E63946,#FF6B6B,#E63946);transform:scaleX(0);transition:transform 0.3s ease}
.stat:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(230,57,70,0.12),0 4px 12px rgba(0,0,0,0.06);border-color:rgba(230,57,70,0.2)}
.stat:hover::before{transform:scaleX(1)}
.stat-ico{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:11px;box-shadow:var(--shadow-sm)}
.stat-l{font-size:11px;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px}
.stat-v{font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;margin-bottom:3px;line-height:1.1;transition:all 0.25s ease}
.stat-s{font-size:12px;color:var(--t2)}

/* CARDS */
.card{background:var(--w);border:1px solid var(--br);border-radius:16px;padding:22px;box-shadow:var(--shadow-sm);transition:all 0.25s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#E63946,#FF6B6B);transform:scaleX(0);transition:transform 0.3s ease;transform-origin:left}
.card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(13,188,188,0.12),0 4px 12px rgba(0,0,0,0.06);border-color:rgba(13,188,188,0.25);background:linear-gradient(135deg,#ffffff 0%,#f0fffe 100%)}
.card:hover::before{transform:scaleX(1)}
.card:hover .card-t{color:#0d9488}
.card-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.card-t{background:linear-gradient(135deg,#0F172A 0%,#334155 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.mt16{margin-top:16px}.mt22{margin-top:22px}

/* TABLES */
.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;border-spacing:0;font-size:13px}
thead th{background:linear-gradient(180deg,#F8FAFC 0%,#F1F5F9 100%);color:#64748B;font-size:11px;letter-spacing:0.8px;padding:10px 14px;position:sticky;top:0;z-index:1;text-align:left;font-weight:700;text-transform:uppercase;border-bottom:1px solid var(--br);white-space:nowrap}
tbody td{padding:11px 12px;border-bottom:1px solid var(--br);vertical-align:middle;font-size:15px;line-height:1.5}
tbody tr{transition:all 0.15s cubic-bezier(0.4,0,0.2,1)}
tbody tr:last-child td{border-bottom:none}
tbody tr:hover td{background:linear-gradient(135deg,#FFF5F5 0%,#FEF2F2 100%)}
tbody tr:hover td:first-child{border-left:3px solid #E63946;padding-left:11px}
tbody tr:hover td:last-child{border-right:3px solid rgba(230,57,70,0.1)}

/* BADGES */
.tag{border-radius:6px;font-size:11px;padding:4px 10px;font-weight:700;letter-spacing:0.5px;transition:all 0.15s ease;display:inline-flex;align-items:center;white-space:nowrap;text-transform:uppercase}
.tag-g{background:linear-gradient(135deg,#ECFDF5,#D1FAE5);color:#065F46;box-shadow:0 1px 4px rgba(16,185,129,0.15)}
.tag-a{background:linear-gradient(135deg,#FFFBEB,#FEF3C7);color:#92400E;box-shadow:0 1px 4px rgba(245,158,11,0.15)}
.tag-e{background:linear-gradient(135deg,#FEF2F2,#FEE2E2);color:#991B1B;box-shadow:0 1px 4px rgba(239,68,68,0.15)}
.tag-b{background:linear-gradient(135deg,#EFF6FF,#DBEAFE);color:#1E40AF;box-shadow:0 1px 4px rgba(59,130,246,0.15)}
.tag-n{background:linear-gradient(135deg,#F8FAFC,#F1F5F9);color:#475569}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;border:none;transition:all 0.15s;font-family:'Plus Jakarta Sans',sans-serif;line-height:1}
.btn-p{background:linear-gradient(135deg,#E63946 0%,#B5282F 100%);color:#fff;box-shadow:0 4px 14px rgba(230,57,70,0.3);border-radius:8px;transition:all 0.2s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden}
.btn-p::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent);opacity:0;transition:opacity 0.2s}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(230,57,70,0.45)}
.btn-p:hover::before{opacity:1}
.btn-p:active{transform:translateY(0)}
.btn-p:disabled{opacity:0.5;cursor:not-allowed}
.btn-s{background:var(--w);border:1px solid var(--br);border-radius:8px;color:var(--t1);transition:all 0.2s ease}
.btn-s:hover{border-color:#E63946;color:#E63946;background:#FEF2F2;box-shadow:0 0 0 3px rgba(230,57,70,0.08)}
.btn-sm{padding:5px 11px;font-size:11px}
.btn-ic{width:30px;height:30px;border-radius:8px;transition:all 0.2s cubic-bezier(0.4,0,0.2,1);display:inline-flex;align-items:center;justify-content:center;background:var(--bg);border:1px solid var(--br);cursor:pointer;padding:0}
.btn-ic:nth-child(1):hover{background:#EFF6FF;border-color:var(--b);color:#2563EB;transform:scale(1.15)}
.btn-ic:nth-child(2):hover{background:#ECFDF5;border-color:var(--g);color:#059669;transform:scale(1.15)}
.btn-ic:nth-child(3):hover{background:#FEF2F2;border-color:var(--e);color:#DC2626;transform:scale(1.15)}

/* SEARCH */
.srch-w{position:relative}
.srch-w svg{position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--t3);pointer-events:none;width:14px;height:14px}
.srch{padding:8px 10px 8px 30px;border:1px solid var(--br);border-radius:10px;font-size:13px;outline:none;background:#F8FAFC;font-family:'Plus Jakarta Sans',sans-serif;width:210px;color:var(--t1);transition:all 0.2s ease}
.srch:focus{background:#fff;width:250px;box-shadow:0 0 0 3px rgba(230,57,70,0.1);border-color:var(--r)}

/* FORMS */
.fg{display:flex;flex-direction:column;gap:5px}
.fl{font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px}
input,select,textarea{padding:9px 11px;border:1px solid var(--br);border-radius:8px;font-size:13px;outline:none;font-family:'Plus Jakarta Sans',sans-serif;color:var(--t1);background:#FAFBFC;transition:all 0.2s ease;width:100%}
input:focus,select:focus,textarea:focus{background:#fff;border-color:#E63946;box-shadow:0 0 0 3px rgba(230,57,70,0.1),0 1px 8px rgba(230,57,70,0.08)}
textarea{resize:vertical;min-height:72px}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.full{grid-column:span 2}

/* MODAL */
.overlay{position:fixed;inset:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;animation:overlayIn 0.2s ease}
.modal{background:var(--w);border-radius:20px;padding:26px;width:100%;max-width:620px;max-height:90vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,0.2),0 0 0 1px rgba(255,255,255,0.1);animation:modalIn 0.25s cubic-bezier(0.4,0,0.2,1)}
.modal-t{font-family:'Space Grotesk',sans-serif;font-size:20px;background:linear-gradient(135deg,#0F172A,#E63946);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:20px}
.modal-f{display:flex;justify-content:flex-end;gap:9px;margin-top:22px;padding-top:16px;border-top:1px solid var(--br)}

/* MISC */
.amt{font-family:'Space Grotesk',sans-serif;font-weight:600}
.amt-g{color:#059669}.amt-a{color:#D97706}.amt-e{color:#DC2626}
.divider{height:1px;background:var(--br);margin:14px 0}
.notif{position:fixed;bottom:22px;right:22px;background:var(--t1);color:#fff;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:500;backdrop-filter:blur(20px);box-shadow:0 12px 40px rgba(0,0,0,0.2),0 0 0 1px rgba(255,255,255,0.1);z-index:200;animation:slideUp 0.3s cubic-bezier(0.4,0,0.2,1)}
.notif.err{background:#DC2626}
@keyframes slideUp{from{transform:translateY(20px) scale(0.95);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
@keyframes pageIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes modalIn{from{opacity:0;transform:scale(0.95) translateY(-12px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes overlayIn{from{opacity:0}to{opacity:1}}
.spin{display:inline-block;width:15px;height:15px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:sp .6s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.ring{width:24px;height:24px;border:2px solid var(--br);border-top-color:var(--r);border-radius:50%;animation:sp .7s linear infinite}
.loader{display:flex;align-items:center;justify-content:center;padding:60px;gap:12px;color:var(--t2)}

/* LOGIN */
.lw{display:grid;grid-template-columns:1fr 1fr;min-height:100vh}
.ll{background:url('/fondo3.jpg') center center / cover no-repeat;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;position:relative;overflow:hidden}
.ll::before{content:'';position:absolute;inset:0;background:rgba(0,0,0,0.55);z-index:0}
.ll > *{position:relative;z-index:1}
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
.bar-r{display:flex;align-items:center;gap:8px;font-size:11px;transition:all 0.15s ease;padding:4px;border-radius:4px}
.bar-r:hover{background:#FEF2F2}
.bar-r:hover .bar-f{opacity:0.8}
.bar-l{width:110px;flex-shrink:0;color:var(--t2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar-t{flex:1;height:7px;background:var(--bg);border-radius:4px;overflow:hidden}
.bar-f{height:100%;border-radius:4px;background:linear-gradient(90deg,#E63946,#FF6B6B);transition:width 0.5s ease,opacity 0.15s ease}
.bar-v{width:80px;text-align:right;flex-shrink:0;font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:600}

/* ROW ITEMS */
.ri{display:flex;justify-content:space-between;align-items:center;padding:9px 8px;border-bottom:1px solid var(--br);transition:all 0.15s ease;border-radius:6px;margin:0 -8px}
.ri:hover{background:#FEF2F2;padding-left:12px}
.ri:last-child{border-bottom:none}
.ri-m{font-size:12px;font-weight:600}
.ri-s{font-size:10px;color:var(--t3);margin-top:1px}

/* FIN TILES */
.fin-bar{display:flex;gap:14px;padding:16px 0 4px}
.fin-tile{background:var(--w);border:1px solid var(--br);border-radius:16px;padding:18px 22px;flex:1;cursor:default;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden}
.fin-tile::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#E63946,#FF6B6B,#E63946);transform:scaleX(0);transition:transform 0.3s ease;transform-origin:left}
.fin-tile:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(230,57,70,0.12),0 4px 12px rgba(0,0,0,0.06);border-color:rgba(230,57,70,0.2)}
.fin-tile:hover::before{transform:scaleX(1)}
.fin-l{font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px}
.fin-v{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;transition:all 0.25s ease;line-height:1.2;margin-bottom:2px}

/* AVATAR */
.av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#E63946 0%,#B5282F 100%);box-shadow:0 2px 8px rgba(230,57,70,0.3);transition:all 0.2s ease;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px;flex-shrink:0}

/* INFO BOX */
.ib{border-radius:var(--rads);padding:10px 13px;font-size:12px;font-weight:500;margin-bottom:14px}
.ib-b{background:var(--bb);color:#1D4ED8;border:1px solid #BFDBFE}
.ib-a{background:var(--ab);color:#92400E;border:1px solid #FDE68A}
.ib-g{background:var(--gb);color:#065F46;border:1px solid #A7F3D0}

/* STATION HOVER CARD */
.st-card{position:absolute;width:260px;background:var(--w);border:1px solid var(--br);border-radius:var(--radl);box-shadow:0 8px 32px rgba(0,0,0,.15);z-index:9999;animation:stFadeIn .15s ease}
.st-card-logo{background:#FEF2F2;border-radius:var(--radl) var(--radl) 0 0;padding:20px;display:flex;align-items:center;justify-content:center;min-height:120px}
.st-card-logo img{width:80px;height:80px;object-fit:contain}
.st-card-logo-emoji{font-size:64px}
.st-card-info{padding:16px}
.st-info-row{display:flex;gap:8px;margin-bottom:10px;align-items:flex-start;font-size:12px}
.st-info-row:last-child{margin-bottom:0}
.st-info-label{color:var(--t1);flex:1}
.st-name{font-weight:700;font-size:13px;margin-bottom:4px}
.st-location{color:var(--t3);font-size:11px;margin-bottom:8px}
.st-divider{height:1px;background:var(--br);margin:8px -16px}
@keyframes stFadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}

/* GALERIA */
.gal-upload{background:var(--bb);border:1px solid #BFDBFE;border-radius:var(--rad);padding:16px;margin-bottom:20px}
.gal-upload-status{margin-top:12px;padding:8px;background:rgba(0,0,0,.05);border-radius:var(--rads);font-size:12px;color:var(--t2)}
.gal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
.gal-item{position:relative;cursor:pointer;overflow:hidden;border-radius:8px;transition:transform .2s,box-shadow .2s}
.gal-item:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.15)}
.gal-img-wrap{position:relative;overflow:hidden;border-radius:8px;background:#f0f0f0;height:160px}
.gal-img{width:100%;height:100%;object-fit:cover;display:block}
.gal-overlay{position:absolute;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s}
.gal-item:hover .gal-overlay{opacity:1}
.gal-overlay-icon{font-size:32px}
.gal-info{padding:8px 0;font-size:11px}
.gal-desc{font-weight:600;color:var(--t1);margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gal-date{color:var(--t3);font-size:10px;margin-bottom:4px}
.gal-del{position:absolute;top:6px;right:6px;background:rgba(220,38,38,.9);border:none;color:#fff;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:14px;display:none;align-items:center;justify-content:center;transition:background .2s;opacity:0}
.gal-item:hover .gal-del{display:flex;opacity:1}
.gal-del:hover{background:rgba(220,38,38,1)}
.lightbox{position:fixed;inset:0;background:rgba(0,0,0,.95);display:flex;align-items:center;justify-content:center;z-index:1000}
.lightbox-content{position:relative;max-width:90vw;max-height:90vh;display:flex;flex-direction:column;align-items:center}
.lightbox-img{max-width:100%;max-height:80vh;object-fit:contain}
.lightbox-desc{color:#fff;margin-top:16px;text-align:center;max-width:600px}
.lightbox-close{position:absolute;top:20px;right:20px;width:40px;height:40px;background:rgba(255,255,255,.2);border:none;color:#fff;font-size:24px;cursor:pointer;border-radius:50%;transition:background .2s}
.lightbox-close:hover{background:rgba(255,255,255,.3)}

/* ── RESPONSIVE ── */

/* Tablet (768px - 1024px) */
@media (max-width: 1024px) {
  .stats{grid-template-columns:repeat(3,1fr)}
  .g2{grid-template-columns:1fr}
  .g3{grid-template-columns:repeat(2,1fr)}
}

/* Móvil (< 768px) */
@media (max-width: 768px) {
  .layout{flex-direction:column}
  .sidebar{display:none}
  .topbar{position:fixed;top:0;left:0;right:0;z-index:1001;height:54px;padding:0 14px}
  .topbar-t{font-size:16px;font-weight:700}
  .main{padding-top:110px;padding-bottom:16px;height:100svh;overflow-y:auto}
  .content{padding:16px 14px 24px}
  .stats{grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:16px}
  .stat{padding:16px 14px;border-radius:14px}
  .stat-l{font-size:10px}
  .stat-v{font-size:20px}
  .stat-s{font-size:11px}
  .stat-ico{width:34px;height:34px;font-size:16px;margin-bottom:10px}
  .g2,.g3{grid-template-columns:1fr;gap:14px}
  .fin-bar{flex-direction:column;gap:10px}
  .fin-tile{border-radius:12px;padding:16px 18px}
  .fin-v{font-size:22px}
  .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:10px}
  table{min-width:580px;font-size:13px}
  thead th{font-size:10px;padding:10px 12px}
  tbody td{padding:12px}
  .card{padding:16px 14px;border-radius:14px}
  .card-h{flex-direction:column;align-items:flex-start;gap:12px;margin-bottom:14px}
  .card-h > div:last-child{width:100%;display:flex;gap:8px}
  .srch{width:100%;flex:1}
  .overlay{padding:0;align-items:flex-end}
  .modal{border-radius:24px 24px 0 0;max-height:92svh;width:100%;max-width:100%;padding:24px 20px 32px}
  .modal-t{font-size:18px}
  .fgrid{grid-template-columns:1fr;gap:14px}
  .full{grid-column:span 1}
  input,select,textarea{font-size:16px !important;padding:12px 14px;border-radius:10px}
  .btn{padding:12px 18px;font-size:14px;border-radius:10px}
  .btn-p{min-height:44px}
  .btn-ic{width:36px;height:36px;border-radius:8px}
  .lw{grid-template-columns:1fr;min-height:100svh}
  .ll{padding:40px 24px 30px;min-height:auto;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .ll::before{z-index:0}
  .ll > *{position:relative;z-index:1}
  .lr{padding:32px 24px 40px;background:var(--bg)}
  .lform{max-width:100%}
  .l-creds{display:none}
  .l-h{font-size:24px}
  .l-sub{font-size:13px}
  .notif{bottom:80px;left:14px;right:14px;text-align:center}
}

/* Móvil pequeño (< 380px) */
@media (max-width: 380px) {
  .stat-v{font-size:17px}
  .topbar-t{font-size:14px}
  .s-item{font-size:8px;max-width:56px}
}
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

// ─── MODULE DETECTION AND DETAIL RENDERING ────────────────────────────────────
const detectModule = (data) => {
  if (data.patrocinador_id && data.monto && data.comision_gestor) return 'donaciones'
  if (data.nombre_comercial && data.ruc) return 'patrocinadores'
  if (data.numero_contrato && data.monto_comprometido) return 'contratos'
  if (data.banco && data.cci && (data.nombre || data.apellido)) return 'gestores'
  if (data.departamento && (data.comandante || data.voluntarios)) return 'estaciones'
  if (data.codigo_modular && data.nivel) return 'colegios'
  if (data.colegios && data.cantidad_kits_entregados) return 'visitas'
  if (data.tipo && data.categoria && data.monto && data.proveedor) return 'gastos'
  if (data.monto_comision && data.porcentaje && (data.nombre || data.gestor_id)) return 'comisiones'
  if (data.cantidad && (data.tipo === 'ingreso' || data.tipo === 'salida')) return 'inventario'
  return null
}

const renderDetalleField = (label, value, currency = false) => {
  if (!label) return null
  let displayValue = value
  if (value === null || value === undefined) displayValue = '—'
  else if (typeof value === 'boolean') displayValue = value ? 'Sí' : 'No'
  else if (typeof value === 'object') displayValue = '—'
  else if (currency) displayValue = fmt(value)
  return (
    <div key={label} style={{ paddingBottom: 12 }}>
      <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--t1)', fontWeight: 500 }}>{displayValue}</div>
    </div>
  )
}

const renderDetalleSection = (titulo, campos) => (
  <div style={{ marginBottom: 18, background: '#F9FAFB', padding: 14, borderRadius: 8 }}>
    {titulo && <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>{titulo}</div>}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
      {campos}
    </div>
  </div>
)

function ModalDetalle({ data, onClose }) {
  if (!data) return null
  const mod = detectModule(data)

  let headerIcon = '👁️', headerTitle = 'Detalle', sections = []

  if (mod === 'donaciones') {
    headerIcon = '💰'
    headerTitle = data.patrocinadores?.nombre_comercial || 'Donación'
    sections = [
      { titulo: 'Información General', campos: [
        renderDetalleField('Patrocinador', data.patrocinadores?.nombre_comercial),
        renderDetalleField('Gestor', data.gestores ? `${data.gestores.nombre} ${data.gestores.apellido}` : '—'),
        renderDetalleField('Contrato', data.contratos?.numero_contrato),
      ]},
      { titulo: 'Monto', campos: [
        renderDetalleField('Monto', fmt(data.monto, data.moneda)),
        renderDetalleField('Comisión (5%)', fmt(data.comision_gestor)),
        renderDetalleField('Estado', data.estado),
        renderDetalleField('Método de Pago', data.metodo_pago),
        renderDetalleField('Fecha', fmtDate(data.fecha_donacion)),
        renderDetalleField('N° Referencia', data.referencia_pago),
      ]},
      data.descripcion && { titulo: 'Descripción', campos: [renderDetalleField(null, data.descripcion)] },
    ]
  } else if (mod === 'patrocinadores') {
    headerIcon = data.logo_url ? '🖼️' : '🏢'
    headerTitle = data.nombre_comercial
    sections = [
      { titulo: 'Datos de la Empresa', campos: [
        renderDetalleField('Razón Social', data.razon_social),
        renderDetalleField('RUC', data.ruc),
        renderDetalleField('Sector', data.sector),
        renderDetalleField('País', data.pais),
        renderDetalleField('Ciudad', data.ciudad),
      ]},
      { titulo: 'Contacto', campos: [
        renderDetalleField('Contacto', data.nombre_contacto),
        renderDetalleField('Email', data.email_contacto),
        renderDetalleField('Teléfono', data.telefono_contacto),
      ]},
      { titulo: 'Actividad', campos: [
        <div key="total" style={{ paddingBottom: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 4 }}>Total Donado</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--g)', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(data.total_donado)}</div>
        </div>,
        renderDetalleField('Estado', data.activo ? 'Activo' : 'Inactivo'),
      ]},
    ]
  } else if (mod === 'contratos') {
    headerIcon = '📄'
    headerTitle = data.numero_contrato
    sections = [
      { titulo: 'Partes', campos: [
        renderDetalleField('Patrocinador', data.patrocinadores?.nombre_comercial),
        renderDetalleField('Gestor', data.gestores ? `${data.gestores.nombre} ${data.gestores.apellido}` : '—'),
      ]},
      { titulo: 'Condiciones', campos: [
        renderDetalleField('Título', data.titulo),
        renderDetalleField('Tipo', data.tipo),
        renderDetalleField('Monto', fmt(data.monto_comprometido, data.moneda)),
        renderDetalleField('Moneda', data.moneda),
        renderDetalleField('Inicio', fmtDate(data.fecha_inicio)),
        renderDetalleField('Vencimiento', fmtDate(data.fecha_vencimiento)),
        renderDetalleField('Estado', data.estado),
      ]},
    ]
  } else if (mod === 'gestores') {
    headerIcon = '🤝'
    headerTitle = `${data.nombre} ${data.apellido}`
    sections = [
      { titulo: 'Datos Personales', campos: [
        renderDetalleField('DNI', data.dni),
        renderDetalleField('Email', data.email),
        renderDetalleField('Teléfono', data.telefono),
      ]},
      { titulo: 'Datos Bancarios', campos: [
        renderDetalleField('Banco', data.banco),
        renderDetalleField('N° Cuenta', data.cuenta_bancaria),
        renderDetalleField('CCI', data.cci),
      ]},
      { titulo: 'Actividad', campos: [
        <div key="total" style={{ paddingBottom: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 4 }}>Total Gestionado</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--g)', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(data.total_donaciones_gestionadas)}</div>
        </div>,
        renderDetalleField('Comisiones Pagadas', fmt(data.total_comisiones_pagadas)),
        renderDetalleField('Comisión %', `${data.comision_porcentaje}%`),
      ]},
    ]
  } else if (mod === 'estaciones') {
    headerIcon = '🚒'
    headerTitle = data.nombre
    sections = [
      { titulo: 'Ubicación', campos: [
        renderDetalleField('Departamento', data.departamento),
        renderDetalleField('Provincia', data.provincia),
        renderDetalleField('Distrito', data.distrito),
        renderDetalleField('Dirección', data.direccion),
      ]},
      { titulo: 'Personal', campos: [
        renderDetalleField('Comandante', data.comandante),
        renderDetalleField('N° Voluntarios', data.voluntarios),
      ]},
      { titulo: 'Contacto', campos: [
        renderDetalleField('Email', data.email),
        renderDetalleField('Teléfono', data.telefono),
      ]},
    ]
  } else if (mod === 'colegios') {
    headerIcon = '🏫'
    headerTitle = data.nombre
    sections = [
      { titulo: 'Institución', campos: [
        renderDetalleField('Nivel', data.nivel),
        renderDetalleField('Código Modular', data.codigo_modular),
        renderDetalleField('N° Alumnos', data.num_alumnos),
        renderDetalleField('Director', data.director),
      ]},
      { titulo: 'Ubicación', campos: [
        renderDetalleField('Distrito', data.distrito),
        renderDetalleField('Provincia', data.provincia),
        renderDetalleField('Departamento', data.departamento),
        renderDetalleField('Dirección', data.direccion),
      ]},
      { titulo: 'Asignación', campos: [
        renderDetalleField('Estación Bomberos', data.estaciones_bomberos?.nombre),
      ]},
    ]
  } else if (mod === 'visitas') {
    headerIcon = '🎮'
    headerTitle = `${data.colegios?.nombre} - ${fmtDate(data.fecha_visita)}`
    sections = [
      { titulo: 'Entrega', campos: [
        <div key="kits" style={{ paddingBottom: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 4 }}>Kits Entregados</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--b)', fontFamily: "'Space Grotesk',sans-serif" }}>{data.cantidad_kits_entregados || 0}</div>
        </div>,
        renderDetalleField('Alumnos Capacitados', data.num_alumnos_capacitados),
        renderDetalleField('Profesores Presentes', data.num_profesores_presentes),
      ]},
      { titulo: 'Detalles', campos: [
        renderDetalleField('Colegio', data.colegios?.nombre),
        renderDetalleField('Estación', data.estaciones_bomberos?.nombre),
        renderDetalleField('Bombero', data.usuarios ? `${data.usuarios.nombre} ${data.usuarios.apellido}` : '—'),
        renderDetalleField('Hora Inicio', data.hora_inicio),
        renderDetalleField('Hora Fin', data.hora_fin),
      ]},
      { titulo: 'Contenido', campos: [
        renderDetalleField('Temas Tratados', data.temas_tratados),
        renderDetalleField('Observaciones', data.observaciones),
      ]},
      { titulo: 'Estado', campos: [
        <div key="estado" style={{ paddingBottom: 12, gridColumn: '1 / -1' }}>
          <span className={`tag tag-${data.estado === 'completada' ? 'g' : data.estado === 'programada' ? 'a' : 'n'}`} style={{ fontSize: 12, padding: '6px 12px' }}>
            {data.estado}
          </span>
        </div>,
      ]},
    ]
  } else if (mod === 'gastos') {
    headerIcon = '💸'
    headerTitle = data.tipo
    sections = [
      { titulo: 'Gasto', campos: [
        renderDetalleField('Tipo', data.tipo),
        renderDetalleField('Categoría', data.categoria),
        <div key="monto" style={{ paddingBottom: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 4 }}>Monto</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--e)', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(data.monto)}</div>
        </div>,
        renderDetalleField('Fecha', fmtDate(data.fecha)),
      ]},
      { titulo: 'Proveedor', campos: [
        renderDetalleField('Nombre', data.proveedor),
        renderDetalleField('N° Factura', data.numero_factura),
      ]},
      { titulo: 'Estado', campos: [
        <div key="estado" style={{ paddingBottom: 12, gridColumn: '1 / -1' }}>
          <span className={`tag tag-${data.estado === 'pagado' ? 'g' : 'a'}`} style={{ fontSize: 12, padding: '6px 12px' }}>
            {data.estado}
          </span>
        </div>,
      ]},
    ]
  } else if (mod === 'comisiones') {
    headerIcon = '🤝'
    headerTitle = data.nombre || (data.gestores ? `${data.gestores.nombre} ${data.gestores.apellido}` : 'Comisión')
    sections = [
      { titulo: 'Comisión', campos: [
        <div key="monto" style={{ paddingBottom: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 4 }}>Monto Comisión</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--g)', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(data.monto_comision)}</div>
        </div>,
        renderDetalleField('Porcentaje', `${data.porcentaje}%`),
        renderDetalleField('Donación Base', fmt(data.monto_donacion_base)),
      ]},
      { titulo: 'Pago', campos: [
        renderDetalleField('Fecha Pago', fmtDate(data.fecha_pago)),
        renderDetalleField('Método', data.metodo_pago),
        renderDetalleField('N° Referencia', data.numero_referencia),
      ]},
      { titulo: 'Estado', campos: [
        <div key="estado" style={{ paddingBottom: 12, gridColumn: '1 / -1' }}>
          <span className={`tag tag-${data.estado === 'pagada' ? 'g' : 'a'}`} style={{ fontSize: 12, padding: '6px 12px' }}>
            {data.estado}
          </span>
        </div>,
      ]},
    ]
  } else if (mod === 'inventario') {
    const badge = data.tipo === 'ingreso' ? 'tag-g' : 'tag-e'
    headerIcon = '📦'
    headerTitle = `${data.tipo === 'ingreso' ? 'INGRESO' : 'SALIDA'}`
    sections = [
      { titulo: 'Movimiento', campos: [
        <div key="tipo" style={{ paddingBottom: 12, gridColumn: '1 / -1' }}>
          <span className={`tag ${badge}`} style={{ fontSize: 12, padding: '6px 12px' }}>
            {data.tipo === 'ingreso' ? 'INGRESO' : 'SALIDA'}
          </span>
        </div>,
        renderDetalleField('Cantidad', data.cantidad),
        renderDetalleField('Stock Resultante', data.stock_resultante),
        renderDetalleField('Fecha', fmtDate(data.fecha)),
      ]},
      { titulo: 'Detalles', campos: [
        renderDetalleField('Motivo', data.motivo),
        renderDetalleField('Lote', data.lote),
        renderDetalleField('Proveedor', data.proveedor),
        renderDetalleField('Costo Unitario', fmt(data.costo_unitario)),
      ]},
    ]
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 700 }}>
        <div className="modal-t" style={{ background: '#FEF2F2', padding: '16px 20px', fontSize: 16 }}>
          <span style={{ fontSize: 20, marginRight: 8 }}>{headerIcon}</span>
          <strong>{headerTitle}</strong>
          <button onClick={onClose} style={{ position: 'absolute', right: 20, top: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: '20px' }}>
          {sections.filter(Boolean).map((sec, i) => (
            <div key={i}>
              {renderDetalleSection(sec.titulo, sec.campos)}
            </div>
          ))}
        </div>
        <div className="modal-f">
          <button className="btn btn-s" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

// ─── EXPORTACIÓN Y PDF ────────────────────────────────────────────────────────
function exportXLSX(rows, filename, reportTitle = filename) {
  const wb = XLSX.utils.book_new()
  const wsData = []
  const now = new Date()
  const dateStr = now.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const timeStr = now.toLocaleTimeString('es-PE')

  // Encabezado
  wsData.push([])
  wsData.push(['EDUCATRAN - PATROCINIOS VIALES', '', '', '', '', ''])
  wsData.push([reportTitle, '', '', '', '', ''])
  wsData.push([`Generado el: ${dateStr} ${timeStr}`, '', '', '', '', ''])
  wsData.push([])
  wsData.push(Object.keys(rows[0] || {}))

  // Datos
  rows.forEach(row => {
    wsData.push(Object.values(row))
  })

  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Estilos
  const headerFill = { fgColor: { rgb: '1a1a2e' } }
  const headerFont = { bold: true, color: { rgb: 'FFFFFF' }, sz: 14 }
  const subtitleFill = { fgColor: { rgb: 'c0392b' } }
  const subtitleFont = { bold: true, color: { rgb: 'FFFFFF' }, sz: 12 }
  const colHeaderFill = { fgColor: { rgb: '2c3e50' } }
  const colHeaderFont = { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }
  const grayFill = { fgColor: { rgb: 'f8f9fa' } }
  const border = { left: { style: 'thin' }, right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } }

  // Aplicar estilos header
  ws['A2'] = { v: 'EDUCATRAN - PATROCINIOS VIALES', s: { fill: headerFill, font: headerFont, alignment: { horizontal: 'center', vertical: 'center' }, border } }
  ws['A3'] = { v: reportTitle, s: { fill: subtitleFill, font: subtitleFont, alignment: { horizontal: 'center' }, border } }
  ws['A4'] = { v: `Generado el: ${dateStr} ${timeStr}`, s: { font: { sz: 10, color: { rgb: '666666' } }, alignment: { horizontal: 'left' }, border } }

  // Column headers (fila 6)
  const cols = Object.keys(rows[0] || {})
  for (let i = 0; i < cols.length; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 5, c: i })
    if (!ws[cellRef]) ws[cellRef] = {}
    ws[cellRef].s = { fill: colHeaderFill, font: colHeaderFont, alignment: { horizontal: 'center', vertical: 'center' }, border }
  }

  // Datos con estilos
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < cols.length; j++) {
      const cellRef = XLSX.utils.encode_cell({ r: 6 + i, c: j })
      if (!ws[cellRef]) ws[cellRef] = {}
      const bgColor = i % 2 === 0 ? 'FFFFFF' : 'f8f9fa'
      ws[cellRef].s = { fill: { fgColor: { rgb: bgColor } }, alignment: { horizontal: 'left', vertical: 'center' }, border }
    }
  }

  // Ancho de columnas
  ws['!cols'] = cols.map(col => ({ wch: Math.max(15, col.length + 2) }))
  ws['!rows'] = [{ hpx: 40 }, {}, {}, {}, {}, { hpx: 25 }, ...rows.map(() => ({ hpx: 20 }))]

  XLSX.utils.book_append_sheet(wb, ws, 'Datos')
  XLSX.writeFile(wb, `${filename}_${dateStr.replace(/\//g, '-')}.xlsx`)
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
  doc.text('Sistema de Patrocinios Viales', w/2, y+16, { align:'center' })
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
  vencido:['tag-a','Vencido'], ingreso:['tag-g','Ingreso'], salida:['tag-e','Salida'],
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
  inv:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
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
      <div className="ll" style={{ backgroundImage: 'url(/img/FONDO3.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
          <img
            src="/img/logo.jpg"
            alt="EDUCATRAN"
            style={{
              width: 400,
              height: 'auto',
              objectFit: 'contain',
              margin: '0 auto 20px',
              display: 'block',
              border: '3px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              padding: '8px',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(4px)'
            }}
          />
          <h1 className="l-h">EDUCATRAN</h1>
          <p className="l-sub" style={{ textAlign:'center', margin:'0 auto 28px' }}>Sistema de gestion de patrocinios para seguridad vial y educacion infantil</p>
          <div style={{ margin:'28px 0', display:'flex', gap:24, justifyContent:'center' }}>
            {[
              {e:'🚗',l:'Marcas',bg:'linear-gradient(135deg,#EF4444,#DC2626)',color:'#EF4444',delay:'0s'},
              {e:'🎮',l:'Juegos',bg:'linear-gradient(135deg,#A855F7,#7C3AED)',color:'#A855F7',delay:'0.3s'},
              {e:'🚒',l:'Bomberos',bg:'linear-gradient(135deg,#DC2626,#B91C1C)',color:'#DC2626',delay:'0.6s'},
              {e:'🏫',l:'Colegios',bg:'linear-gradient(135deg,#F97316,#EA580C)',color:'#F97316',delay:'0.9s'}
            ].map(({e,l,bg,color,delay}) => (
              <div key={l} style={{ textAlign:'center' }} onMouseEnter={e => { e.currentTarget.querySelector('.icon-circle').style.transform='scale(1.2)'; e.currentTarget.querySelector('.icon-circle').style.boxShadow=`0 12px 40px ${color}55, 0 0 24px ${color}77` }} onMouseLeave={e => { e.currentTarget.querySelector('.icon-circle').style.transform='scale(1)'; e.currentTarget.querySelector('.icon-circle').style.boxShadow='0 8px 24px rgba(0,0,0,0.4)' }}>
                <div className="icon-circle" style={{ fontSize:36, width:70, height:70, background:bg, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px', animation:`float 3.5s ease-in-out infinite ${delay}`, boxShadow:'0 8px 24px rgba(0,0,0,0.4)', transition:'all 0.3s ease', cursor:'pointer' }}>{e}</div>
                <div style={{ color:'rgba(255,255,255,1)', fontSize:13, fontWeight:700, letterSpacing:'0.5px', marginTop:8 }}>{l}</div>
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

  const checkDependencies = async (id) => {
    if (deleteTable === 'patrocinadores') {
      const { count: donCount } = await supabase.from('donaciones').select('id', { count:'exact', head:true }).eq('patrocinador_id', id)
      const { count: contCount } = await supabase.from('contratos').select('id', { count:'exact', head:true }).eq('patrocinador_id', id)
      const total = (donCount || 0) + (contCount || 0)
      if (total > 0) return { ok:false, msg:`❌ No se puede eliminar: tiene ${donCount||0} donación(es) y ${contCount||0} contrato(s) vinculados. Elimine primero esos registros.` }
    }
    else if (deleteTable === 'gestores') {
      const { count: donCount } = await supabase.from('donaciones').select('id', { count:'exact', head:true }).eq('gestor_id', id)
      const { count: comCount } = await supabase.from('comisiones').select('id', { count:'exact', head:true }).eq('gestor_id', id)
      const total = (donCount || 0) + (comCount || 0)
      if (total > 0) return { ok:false, msg:`❌ No se puede eliminar: tiene ${donCount||0} donación(es) y ${comCount||0} comisión(es) vinculadas. Elimine primero esos registros.` }
    }
    else if (deleteTable === 'estaciones_bomberos') {
      const { count: colCount } = await supabase.from('colegios').select('id', { count:'exact', head:true }).eq('estacion_id', id)
      const { count: visCount } = await supabase.from('visitas_entregas').select('id', { count:'exact', head:true }).eq('estacion_id', id)
      const total = (colCount || 0) + (visCount || 0)
      if (total > 0) return { ok:false, msg:`❌ No se puede eliminar: tiene ${colCount||0} colegio(s) y ${visCount||0} visita(s) vinculadas. Elimine primero esos registros.` }
    }
    else if (deleteTable === 'colegios') {
      const { count } = await supabase.from('visitas_entregas').select('id', { count:'exact', head:true }).eq('colegio_id', id)
      if (count > 0) return { ok:false, msg:`❌ No se puede eliminar: tiene ${count} visita(s) vinculada(s). Elimine primero esos registros.` }
    }
    else if (deleteTable === 'contratos') {
      const { count } = await supabase.from('donaciones').select('id', { count:'exact', head:true }).eq('contrato_id', id)
      if (count > 0) return { ok:false, msg:`❌ No se puede eliminar: tiene ${count} donación(es) vinculada(s). Elimine primero esos registros.` }
    }
    return { ok:true }
  }

  const handleDeleteClick = async (row) => {
    const check = await checkDependencies(row.id)
    if (!check.ok) {
      showN(check.msg, 'err')
      return
    }
    setDeleteRow(row)
  }

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
                            {deleteTable && <button className="btn btn-s btn-sm" title="Eliminar" style={{color:'var(--e)'}} onClick={() => handleDeleteClick(row)}>🗑️</button>}
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

      {viewRow && <ModalDetalle data={viewRow} onClose={() => setViewRow(null)} />}

      {deleteRow && (
        <div className="overlay">
          <div style={{background:'white',borderRadius:14,padding:32,maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.15)',textAlign:'center'}}>
            <div style={{width:60,height:60,background:'#FEF2F2',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:28}}>🗑️</div>
            <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:700,marginBottom:8,color:'#0D1117'}}>Eliminar registro</h3>
            <p style={{color:'#6B7280',fontSize:13,lineHeight:1.6,marginBottom:24}}>¿Estás seguro de que deseas eliminar este registro?<br/><strong style={{color:'#DC2626'}}>Esta acción no se puede deshacer.</strong></p>
            <div style={{display:'flex',gap:10,justifyContent:'center'}}>
              <button className="btn btn-s" disabled={deleting} onClick={() => setDeleteRow(null)} style={{minWidth:100}}>Cancelar</button>
              <button className="btn btn-p" disabled={deleting} onClick={doDelete} style={{minWidth:100,background:'#DC2626'}}>
                {deleting ? <><span className="spin"/>Eliminando...</> : '🗑️ Sí, eliminar'}
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
      const [rD, rG, rC, rE, rV, rInv] = await Promise.all([
        supabase.from('donaciones').select('monto,comision_gestor,comision_pagada,estado,fecha_donacion,patrocinadores(nombre_comercial),gestores(nombre,apellido)').order('created_at',{ascending:false}),
        supabase.from('gastos').select('monto,estado'),
        supabase.from('colegios').select('id',{count:'exact',head:true}),
        supabase.from('estaciones_bomberos').select('id',{count:'exact',head:true}),
        supabase.from('visitas_entregas').select('id,estado,fecha_visita,cantidad_kits_entregados,colegios(nombre),estaciones_bomberos(nombre)').order('fecha_visita',{ascending:false}).limit(4),
        supabase.from('inventario_kits').select('cantidad,tipo'),
      ])
      const recibidas = (rD.data||[]).filter(d => d.estado==='recibida')
      const totDon = recibidas.reduce((a,d) => a+(d.monto||0),0)
      const totGas = (rG.data||[]).filter(g => g.estado==='aprobado').reduce((a,g) => a+(g.monto||0),0)
      const totCom = (rD.data||[]).filter(d => d.comision_pagada===true).reduce((a,d) => a+(d.comision_gestor||0),0)
      const kitsEntregados = (rInv.data||[]).filter(r => r.tipo==='salida').reduce((a,r) => a+r.cantidad,0)
      const kitsPorEntregar = (rV.data||[]).filter(v => v.estado==='programada').reduce((a,v) => a+(v.cantidad_kits_entregados||0),0)
      setS({ donaciones:totDon, saldo:totDon-totGas, gastos:totGas, comisiones:totCom, kitsEntregados, kitsPorEntregar, nDon:(rD.data||[]).length, nVis:(rV.data||[]).length, nCol:rC.count||0, nEst:rE.count||0 })
      setDons((rD.data||[]).slice(0,5))

      // Calculate top sponsors from donations with real totals
      const { data: allDons } = await supabase
        .from('donaciones')
        .select('monto, estado, patrocinador_id, patrocinadores(id, nombre_comercial, logo_url)')
      const patMap = {}
      allDons?.forEach(d => {
        const p = d.patrocinadores
        if (!p) return
        if (!patMap[p.id]) patMap[p.id] = {
          id: p.id,
          nombre_comercial: p.nombre_comercial,
          logo_url: p.logo_url,
          total: 0
        }
        patMap[p.id].total += (d.monto || 0)
      })
      const pats = Object.values(patMap)
        .filter(p => p.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 6)
      setPats(pats)

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
      { Concepto: 'Total Patrocinios Recibidos', Valor: (rD.data||[]).filter(d=>d.estado==='recibida').reduce((a,d)=>a+d.monto,0) },
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
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(donacionesExcel), 'Patrocinios')
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

  const maxD = Math.max(...pats.map(p => p.total||0), 1)

  const statCards = [
    { l:'Total Patrocinios',  v:fmt(s.donaciones), sub:`${s.nDon} registrados`,      ico:'💰', bg:'#FEF2F2', page:'donaciones' },
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
          <div key={x.l} className="stat" style={{ cursor:'pointer', transition:'all 0.2s ease' }} onClick={() => onNavigate?.(x.page)} onMouseEnter={e => { e.currentTarget.style.backgroundColor='#bae6fd'; e.currentTarget.style.borderTop='2px solid #0284c7'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(2,132,199,0.25)' }} onMouseLeave={e => { e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.borderTop='none'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}>
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
          <div className="card-h"><span className="card-t">Ultimos Patrocinios</span><span className="tag tag-b">{s.nDon}</span></div>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Patrocinador</th><th>Monto</th><th>Estado</th></tr></thead>
              <tbody>
                {dons.length === 0
                  ? <tr><td colSpan={3} style={{ textAlign:'center', color:'var(--t3)', padding:30 }}>Sin donaciones aun</td></tr>
                  : dons.map((d,i) => (
                    <tr key={i} onMouseEnter={e => e.currentTarget.style.backgroundColor='#86efac'} onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
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
                  <div key={p.id} className="bar-r">
                    <span className="bar-l">{p.logo_url && <img src={p.logo_url} style={{width:18,height:18,objectFit:'contain',marginRight:6,verticalAlign:'middle'}} alt="" />}{p.nombre_comercial}</span>
                    <div className="bar-t"><div className="bar-f" style={{ width:`${((p.total||0)/maxD)*100}%` }} /></div>
                    <span className="bar-v">{fmt(p.total)}</span>
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
  exportXLSX(filas, 'Patrocinios', 'REPORTE DE PATROCINIOS')
}

function FmDonacion({ onClose, onSave, onError, initial }) {
  const [f, setF] = useState(initial ? { ...initial } : { patrocinador_id:'', gestor_id:'', monto:'', moneda:'PEN', fecha_donacion:'', metodo_pago:'Transferencia Bancaria', referencia_pago:'', estado:'pendiente', descripcion:'', contrato_id:'' })
  const [pats, setPats] = useState([]); const [gests, setGests] = useState([]); const [saving, setSaving] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [contratosEncontrados, setContratosEncontrados] = useState([])
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null)
  useEffect(() => {
    supabase.from('patrocinadores').select('id,nombre_comercial').eq('activo',true).then(({data}) => setPats(data||[]))
    supabase.from('gestores').select('id,nombre,apellido').eq('activo',true).then(({data}) => setGests(data||[]))
  }, [])
  const up = (k,v) => setF(p => ({...p,[k]:v}))
  const comision = f.monto ? (parseFloat(f.monto)*0.05).toFixed(2) : '0.00'
  const montoNumerico = parseFloat(f.monto) || 0
  const montoContrato = contratoSeleccionado?.monto_comprometido || 0
  const esMontoMenor = montoNumerico > 0 && montoNumerico < montoContrato

  const buscarContrato = async () => {
    if (!busqueda.trim()) return
    const { data } = await supabase
      .from('contratos')
      .select('*, patrocinadores(id, nombre_comercial, logo_url), gestores(id, nombre, apellido)')
      .or(`numero_contrato.ilike.%${busqueda}%,titulo.ilike.%${busqueda}%`)
      .eq('estado', 'activo')
      .limit(5)
    setContratosEncontrados(data || [])
  }

  const seleccionarContrato = (contrato) => {
    setContratoSeleccionado(contrato)
    setContratosEncontrados([])
    setBusqueda('')
    setF(prev => ({
      ...prev,
      patrocinador_id: contrato.patrocinador_id || '',
      gestor_id: contrato.gestor_id || '',
      monto: contrato.monto_comprometido?.toString() || '',
      moneda: contrato.moneda || 'PEN',
      contrato_id: contrato.id,
      descripcion: `Pago según contrato ${contrato.numero_contrato} - ${contrato.titulo}`,
      estado: 'recibida',
      fecha_donacion: new Date().toISOString().split('T')[0]
    }))
  }

  const save = async () => {
    if (!f.patrocinador_id||!f.gestor_id||!f.monto||!f.fecha_donacion) { onError('Patrocinador, gestor, monto y fecha son obligatorios'); return }
    setSaving(true)
    const payload = { patrocinador_id:f.patrocinador_id, gestor_id:f.gestor_id, monto:parseFloat(f.monto), moneda:f.moneda, fecha_donacion:f.fecha_donacion, metodo_pago:f.metodo_pago, referencia_pago:f.referencia_pago, estado:f.estado, descripcion:f.descripcion, comision_gestor:parseFloat(comision), contrato_id: contratoSeleccionado?.id || null }
    const { error } = initial?.id
      ? await supabase.from('donaciones').update(payload).eq('id', initial.id)
      : await supabase.from('donaciones').insert(payload)
    setSaving(false)
    if (error) { onError(error.message); return }

    // Auto-update total_donado when donation status changes
    if (f.estado === 'recibida' || (initial?.estado !== 'recibida' && f.estado === 'recibida')) {
      const { data: todasDon } = await supabase
        .from('donaciones')
        .select('monto')
        .eq('patrocinador_id', f.patrocinador_id)
        .eq('estado', 'recibida')
      const nuevoTotal = todasDon?.reduce((s, d) => s + (d.monto || 0), 0) || 0
      await supabase.from('patrocinadores')
        .update({ total_donado: nuevoTotal })
        .eq('id', f.patrocinador_id)
    }

    onSave(initial?.id ? 'Donacion actualizada correctamente' : 'Donacion registrada. Comision al 5% calculada automaticamente.')
  }
  return (
    <>
      <div className="modal-t">{initial?.id ? '✏️ Editar' : '💰 Nueva'} Donacion</div>

      {!initial?.id && (
        <>
          <div className="fg full">
            <label className="fl">Buscar por N° Contrato o Patrocinador</label>
            <div style={{display:'flex', gap:8}}>
              <input
                type="text"
                placeholder="Ej: CONT-2025-001 o Toyota Perú"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{flex:1}}
              />
              <button className="btn btn-s" onClick={buscarContrato}>
                🔍 Buscar
              </button>
            </div>
          </div>

          {contratosEncontrados.length > 0 && (
            <div style={{border:'1px solid #E8EAF0', borderRadius:8, overflow:'hidden', marginBottom:14}}>
              {contratosEncontrados.map(c => (
                <div key={c.id}
                  onClick={() => seleccionarContrato(c)}
                  style={{
                    padding:'10px 14px', cursor:'pointer',
                    borderBottom:'1px solid #E8EAF0',
                    background: contratoSeleccionado?.id === c.id ? '#FEF2F2' : 'white',
                    display:'flex', justifyContent:'space-between', alignItems:'center'
                  }}
                >
                  <div>
                    <strong style={{color:'#E63946'}}>{c.numero_contrato}</strong>
                    <span style={{margin:'0 8px', color:'#9CA3AF'}}>·</span>
                    <span>{c.patrocinadores?.nombre_comercial}</span>
                    <span style={{margin:'0 8px', color:'#9CA3AF'}}>·</span>
                    <span style={{color:'#6B7280'}}>{c.titulo}</span>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:600, fontFamily:"'Space Grotesk',sans-serif"}}>
                      S/ {c.monto_comprometido?.toLocaleString()}
                    </div>
                    <span className={`tag ${c.estado === 'activo' ? 'tag-g' : 'tag-n'}`}>
                      {c.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {contratoSeleccionado && (
            <div className="ib ib-g" style={{marginBottom:14}}>
              ✅ Contrato vinculado: <strong>{contratoSeleccionado.numero_contrato}</strong>
              — {contratoSeleccionado.patrocinadores?.nombre_comercial}
              <button onClick={() => { setContratoSeleccionado(null); setContratosEncontrados([]); setF(p => ({...p, contrato_id:'', patrocinador_id:'', gestor_id:'', monto:'', descripcion:''})) }}
                style={{marginLeft:8, background:'none', border:'none', cursor:'pointer', color:'#DC2626'}}>
                ✕
              </button>
            </div>
          )}
        </>
      )}

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
        <div className="fg full"><label className="fl">Descripcion</label><textarea placeholder="Detalle del patrocinio..." value={f.descripcion} onChange={e => up('descripcion',e.target.value)} /></div>
      </div>
      {esMontoMenor && <div className="ib ib-a" style={{ marginTop:14 }}>⚠️ Pago parcial: monto registrado es menor que el monto comprometido en el contrato (S/ {montoContrato?.toLocaleString()}). Se registrará como pago parcial.</div>}
      {parseFloat(f.monto) > 0 && <div className="ib ib-a" style={{ marginTop:14 }}>💡 Comision automatica al gestor (5%): <strong>S/ {comision}</strong></div>}
      <div className="modal-f">
        <button className="btn btn-s" onClick={onClose}>Cancelar</button>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving ? <><span className="spin" /> Guardando...</> : 'Registrar Patrocinio'}</button>
      </div>
    </>
  )
}

function Donaciones() {
  const { data, loading, reload } = useTable('donaciones','*, patrocinadores(nombre_comercial), gestores(nombre,apellido), contratos(numero_contrato)')
  const totR = data.filter(d => d.estado==='recibida').reduce((a,d) => a+(d.monto||0),0)
  const totP = data.filter(d => d.estado==='pendiente').reduce((a,d) => a+(d.monto||0),0)
  const cols = [
    { key:'patrocinadores', label:'Patrocinador', render:(v,r) => <><strong>{v?.nombre_comercial||'—'}</strong><div style={{ color:'var(--t3)',fontSize:11 }}>{r.gestores ? `${r.gestores.nombre} ${r.gestores.apellido}` : '—'}</div></> },
    { key:'contratos', label:'Contrato', render:v => v ? <code style={{background:'#F3F4F6',padding:'2px 6px',borderRadius:4,fontSize:11}}>{v.numero_contrato}</code> : <span style={{color:'var(--t3)'}}>—</span> },
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
  return <Page title="Patrocinios" data={data} loading={loading} reload={reload} cols={cols} addLabel="Nuevo Patrocinio" Form={FmDonacion} headerExtra={header} deleteTable="donaciones" exportFn={exportarDonaciones} filterFn={(r,q) => [r.patrocinadores?.nombre_comercial,r.gestores?.nombre,r.estado,r.metodo_pago].some(v => v&&v.toLowerCase().includes(q.toLowerCase()))} />
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
  exportXLSX(filas, 'Gestores', 'REPORTE DE GESTORES')
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
  exportXLSX(filas, 'Patrocinadores', 'REPORTE DE PATROCINADORES')
}

function FmPatrocinador({ onClose, onSave, onError, initial }) {
  const [f, setF] = useState(initial ? { ...initial } : { razon_social:'', nombre_comercial:'', ruc:'', pais:'Peru', ciudad:'Lima', direccion:'', email_contacto:'', telefono_contacto:'', nombre_contacto:'', sector:'Automotriz', logo_url:'', activo:true, notas:'' })
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState(initial?.logo_url || null)
  const [duplicateWarning, setDuplicateWarning] = useState(null)
  const up = (k,v) => {
    setF(p => ({...p,[k]:v}))
    if (k === 'razon_social') checkDuplicate(v)
  }
  const checkDuplicate = async (razonSocial) => {
    if (!razonSocial || razonSocial.length < 3) { setDuplicateWarning(null); return }
    const { data } = await supabase
      .from('patrocinadores')
      .select('id, nombre_comercial')
      .ilike('razon_social', razonSocial)
      .limit(1)
    if (data?.length > 0 && data[0].id !== initial?.id) {
      setDuplicateWarning(`⚠️ Ya existe: ${data[0].nombre_comercial}`)
    } else {
      setDuplicateWarning(null)
    }
  }
  const handleLogoUpload = async (file) => {
    if (!file) return null
    const ext = file.name.split('.').pop()
    const fileName = `patrocinador-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from('logos-patrocinadores')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true
      })
    if (error) {
      console.error('Upload error:', error)
      onError('Error al subir logo: ' + error.message)
      return null
    }
    const { data: urlData } = supabase.storage
      .from('logos-patrocinadores')
      .getPublicUrl(fileName)
    up('logo_url', urlData.publicUrl)
    setLogoPreview(urlData.publicUrl)
    return urlData.publicUrl
  }
  const save = async () => {
    if (!f.razon_social) { onError('Razon social es obligatoria'); return }

    if (!initial?.id) {
      const { data: exists } = await supabase
        .from('patrocinadores')
        .select('id, nombre_comercial')
        .ilike('razon_social', f.razon_social.trim())
        .limit(1)

      if (exists?.length > 0) {
        onError(`Ya existe un patrocinador con esta razón social: ${exists[0].nombre_comercial}`)
        return
      }
    }

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
        <div className="fg full"><label className="fl">Logo</label><input type="file" accept="image/*" onChange={e => handleLogoUpload(e.target.files?.[0])} />{logoPreview && <img src={logoPreview} style={{width:60, height:60, objectFit:'contain', marginTop:8}} />}</div>
        <div className="fg"><label className="fl">Razon Social *</label><input value={f.razon_social} onChange={e => up('razon_social',e.target.value)} placeholder="Empresa S.A." />{duplicateWarning && <div style={{fontSize:12,color:'#D97706',marginTop:6,padding:'6px 10px',background:'#FFFBEB',borderRadius:4,border:'1px solid #FCD34D'}}>{duplicateWarning}</div>}</div>
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
  useEffect(() => {
    ensureHyundaiExists()
  }, [])
  const ensureHyundaiExists = async () => {
    const { data: hyundai } = await supabase
      .from('patrocinadores')
      .select('id')
      .ilike('razon_social', 'Hyundai%')
      .limit(1)
    if (!hyundai || hyundai.length === 0) {
      await supabase.from('patrocinadores').insert({
        razon_social: 'Hyundai Perú S.A.C.',
        nombre_comercial: 'Hyundai Perú',
        ruc: '20605485000',
        pais: 'Peru',
        ciudad: 'Lima',
        sector: 'Automotriz',
        activo: true,
        total_donado: 0
      })
      reload()
    }
  }
  const cols = [
    { key:'nombre_comercial', label:'Marca / Empresa', render:(v,r) => <><div style={{display:'flex',alignItems:'center',gap:10}}>{r.logo_url ? <img src={r.logo_url} style={{width:36,height:36,objectFit:'contain',borderRadius:6,border:'1px solid #E8EAF0'}} alt="" /> : <div style={{width:36,height:36,background:'#F3F4F6',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🏢</div>}<div><strong>{v||r.razon_social}</strong><div style={{ color:'var(--t3)',fontSize:11 }}>{r.razon_social}</div></div></div></> },
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
  exportXLSX(filas, 'Estaciones', 'REPORTE DE ESTACIONES BOMBEROS')
}

// ─── GALERIA DE FOTOS ─────────────────────────────────────────────────────────
function Lightbox({ foto, onClose }) {
  if (!foto) return null
  return (
    <div className="lightbox" onClick={onClose}>
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>✕</button>
        <img src={foto.url} alt="" className="lightbox-img" />
        {foto.descripcion && <div className="lightbox-desc">{foto.descripcion}</div>}
      </div>
    </div>
  )
}

function GaleriaFotos({ tabla, foreignKey, foreignId, titulo, extraInfo, placeholders }) {
  const [fotos, setFotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState(null)
  const [descripcion, setDescripcion] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [lightboxFoto, setLightboxFoto] = useState(null)
  const placeholderText = placeholders?.[Math.floor(Math.random() * placeholders.length)] || 'Ej: Descripción de la foto'

  useEffect(() => {
    const cargarFotos = async () => {
      const { data, error } = await supabase.from(tabla).select('*').eq(foreignKey, foreignId).order('fecha', { ascending: false })
      if (!error) setFotos(data || [])
      setLoading(false)
    }
    cargarFotos()
  }, [tabla, foreignKey, foreignId])

  const subirMultiples = async () => {
    if (!files || files.length === 0) { alert('Selecciona al menos una imagen'); return }
    setUploading(true)
    setUploadStatus('')
    try {
      const uploads = Array.from(files).map(async (file, idx) => {
        setUploadStatus(`Subiendo ${idx + 1} de ${files.length} fotos...`)
        const ext = file.name.split('.').pop()
        const path = `${tabla === 'fotos_estaciones' ? 'estaciones' : 'visitas'}/${foreignId}/${Date.now()}-${idx}.${ext}`
        const { error: uploadErr } = await supabase.storage.from('fotos-educatran').upload(path, file)
        if (uploadErr) throw uploadErr
        const { data: { publicUrl } } = supabase.storage.from('fotos-educatran').getPublicUrl(path)
        const { error: insertErr } = await supabase.from(tabla).insert({
          [foreignKey]: foreignId,
          url: publicUrl,
          descripcion: descripcion || null,
          fecha: new Date().toISOString()
        })
        if (insertErr) throw insertErr
      })
      await Promise.all(uploads)
      setFiles(null)
      setDescripcion('')
      setUploadStatus('')
      const { data } = await supabase.from(tabla).select('*').eq(foreignKey, foreignId).order('fecha', { ascending: false })
      setFotos(data || [])
    } catch (e) {
      alert('Error: ' + e.message)
      setUploadStatus('')
    }
    setUploading(false)
  }

  const eliminar = async (fotoId, url) => {
    if (!confirm('¿Eliminar foto?')) return
    try {
      const path = url.split('/').pop()
      await supabase.storage.from('fotos-educatran').remove([path])
      await supabase.from(tabla).delete().eq('id', fotoId)
      setFotos(fotos.filter(f => f.id !== fotoId))
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }

  return (
    <>
      <div className="modal-t">📷 {titulo}</div>
      {extraInfo && <div style={{fontSize:12,color:'var(--t3)',marginBottom:16}}>{extraInfo}</div>}

      <div className="gal-upload">
        <div style={{marginBottom:12}}>
          <label className="fl">Fotos (puedes seleccionar varias)</label>
          <input type="file" accept="image/*" multiple onChange={e => setFiles(e.target.files)} disabled={uploading} />
        </div>
        <div style={{marginBottom:12}}>
          <label className="fl">Descripción (opcional - se aplica a todas)</label>
          <input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder={placeholderText} disabled={uploading} />
        </div>
        <button className="btn btn-p" onClick={subirMultiples} disabled={uploading || !files || files.length === 0}>
          {uploading ? 'Subiendo...' : `Subir ${files?.length || 0} foto${files?.length !== 1 ? 's' : ''}`}
        </button>
        {uploadStatus && <div className="gal-upload-status">{uploadStatus}</div>}
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:40,color:'var(--t3)'}}>Cargando fotos...</div>
      ) : fotos.length === 0 ? (
        <div style={{textAlign:'center',padding:40,color:'var(--t3)'}}>Sin fotos aún</div>
      ) : (
        <div className="gal-grid">
          {fotos.map(foto => (
            <div key={foto.id} className="gal-item">
              <div className="gal-img-wrap">
                <img src={foto.url} alt="" className="gal-img" onClick={() => setLightboxFoto(foto)} />
                <div className="gal-overlay" onClick={() => setLightboxFoto(foto)}>
                  <div className="gal-overlay-icon">🔍</div>
                </div>
              </div>
              <button className="gal-del" onClick={() => eliminar(foto.id, foto.url)}>🗑️</button>
              <div className="gal-info">
                {foto.descripcion && <div className="gal-desc">{foto.descripcion}</div>}
                <div className="gal-date">{new Date(foto.fecha).toLocaleDateString('es-PE')}</div>
                <a
                  href={foto.url}
                  download={`foto-${foto.id}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  style={{display:'inline-block',padding:'4px 8px',background:'#EFF6FF',color:'#2563EB',borderRadius:4,fontSize:11,fontWeight:600,textDecoration:'none',marginTop:4}}
                >
                  ⬇️ Descargar
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <Lightbox foto={lightboxFoto} onClose={() => setLightboxFoto(null)} />
    </>
  )
}

function FmEstacion({ onClose, onSave, onError, initial }) {
  const [f, setF] = useState(initial ? { ...initial } : { nombre:'', codigo:'', departamento:'Lima', provincia:'Lima', distrito:'', direccion:'', telefono:'', email:'', comandante:'', num_voluntarios:0, logo_url:'', activa:true, notas:'' })
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState(initial?.logo_url || null)
  const up = (k,v) => setF(p => ({...p,[k]:v}))
  const handleLogoUpload = async (file) => {
    if (!file) return null
    const ext = file.name.split('.').pop()
    const fileName = `estacion-${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('logos-estaciones')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true
      })

    if (error) {
      console.error('Upload error:', error)
      onError('Error al subir logo: ' + error.message)
      return null
    }

    const { data: urlData } = supabase.storage
      .from('logos-estaciones')
      .getPublicUrl(fileName)

    up('logo_url', urlData.publicUrl)
    setLogoPreview(urlData.publicUrl)
    return urlData.publicUrl
  }
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
        <div className="fg full"><label className="fl">Logo de la Estacion</label><input type="file" accept="image/*" onChange={e => handleLogoUpload(e.target.files?.[0])} />{logoPreview && <img src={logoPreview} style={{width:80, height:80, objectFit:'contain', marginTop:8}} />}</div>
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


function StationHoverCard({ station, position }) {
  if (!station) return null
  return (
    <div className="st-card" style={{ top: position.top + 'px' }}>
      <div className="st-card-logo">
        {station.logo_url
          ? <img src={station.logo_url} alt={station.nombre} />
          : <div className="st-card-logo-emoji">🚒</div>
        }
      </div>
      <div className="st-card-info">
        <div className="st-name">{station.nombre}</div>
        <div className="st-location">{station.distrito||'—'}, {station.departamento||'—'}</div>
        <div className="st-divider"></div>
        <div className="st-info-row">
          <span>👤</span>
          <span className="st-info-label">{station.comandante||'Sin asignar'}</span>
        </div>
        <div className="st-info-row">
          <span>👥</span>
          <span className="st-info-label">{station.num_voluntarios||0} voluntarios</span>
        </div>
        {station.email && (
          <div className="st-info-row">
            <span>📧</span>
            <span className="st-info-label">{station.email}</span>
          </div>
        )}
        {station.telefono && (
          <div className="st-info-row">
            <span>📞</span>
            <span className="st-info-label">{station.telefono}</span>
          </div>
        )}
        {station.direccion && (
          <div className="st-info-row">
            <span>📍</span>
            <span className="st-info-label">{station.direccion}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function Estaciones() {
  const { data, loading, reload } = useTable('estaciones_bomberos')
  const [hoveredStation, setHoveredStation] = useState(null)
  const [hoverPos, setHoverPos] = useState({ top: 0 })
  const [modal, setModal] = useState(false)
  const [galeriaRow, setGaleriaRow] = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [viewRow, setViewRow] = useState(null)
  const [deleteRow, setDeleteRow] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notif, setNotif] = useState(null)
  const showN = (msg, type = 'ok') => setNotif({ msg, type })

  const handleRowHover = (row, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setHoveredStation(row)
    setHoverPos({ top: rect.top })
  }

  const cols = [
    { key:'nombre', label:'Estacion', render:(v,r) => <><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:16}}>🚒</span><div><strong>{v}</strong><div style={{ color:'var(--t3)',fontSize:11 }}>Codigo: {r.codigo||'—'}</div></div></div></> },
    { key:'departamento', label:'Ubicacion', render:(v,r) => `${r.distrito||'—'}, ${v}` },
    { key:'comandante', label:'Comandante' },
    { key:'num_voluntarios', label:'Voluntarios', render:v => <span className="tag tag-b">{v||0}</span> },
    { key:'activa', label:'Estado', render:v => <Tag s={v?'activa':'inactivo'} /> },
  ]
  const doDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('estaciones_bomberos').delete().eq('id', deleteRow.id)
    setDeleting(false)
    if (error) { showN(error.message, 'err'); return }
    setDeleteRow(null)
    showN('Registro eliminado')
    reload()
  }
  return (
    <div className="content">
      {notif && <Notif msg={notif.msg} type={notif.type} onClose={() => setNotif(null)} />}
      <div className="card">
        <div className="card-h">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span className="card-t">Estaciones de Bomberos</span>
            <span className="tag tag-n">{data.length}</span>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button className="btn btn-s" onClick={reload} title="Recargar">{IC.ref}</button>
            <button className="btn btn-s" onClick={() => exportarEstaciones(data)}>📊 Excel</button>
            <button className="btn btn-p" onClick={() => setModal(true)}>{IC.plus}Nueva Estacion</button>
          </div>
        </div>
        <div style={{ position:'relative', overflow:'visible' }}>
          <div className="tbl-wrap">
            {loading
              ? <div className="loader"><div className="ring" /> Cargando...</div>
              : <table>
                  <thead><tr>{cols.map(c => <th key={c.key}>{c.label}</th>)}<th>Acciones</th></tr></thead>
                  <tbody>
                    {data.length === 0
                      ? <tr><td colSpan={cols.length+1} style={{ textAlign:'center', color:'var(--t3)', padding:40 }}>Sin registros</td></tr>
                      : data.map((row, i) => (
                        <tr key={row.id||i} onMouseEnter={e => handleRowHover(row, e)} onMouseLeave={() => setHoveredStation(null)}>
                          {cols.map(c => <td key={c.key}>{c.render ? c.render(row[c.key], row) : (row[c.key]??'—')}</td>)}
                          <td>
                            <div style={{ display:'flex', gap:4 }}>
                              <button className="btn btn-s btn-sm" title="Fotos" onClick={() => setGaleriaRow(row)}>📷</button>
                              <button className="btn btn-s btn-sm" title="Editar" onClick={() => setEditRow(row)}>✏️</button>
                              <button className="btn btn-s btn-sm" title="Ver" onClick={() => setViewRow(row)}>👁️</button>
                              <button className="btn btn-s btn-sm" title="Eliminar" style={{color:'var(--e)'}} onClick={() => setDeleteRow(row)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
            }
          </div>
          <StationHoverCard station={hoveredStation} position={hoverPos} />
        </div>
      </div>

      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <FmEstacion
              onClose={() => setModal(false)}
              onSave={msg => { setModal(false); showN(msg||'Guardado correctamente'); reload() }}
              onError={msg => showN(msg, 'err')}
            />
          </div>
        </div>
      )}

      {editRow && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setEditRow(null)}>
          <div className="modal">
            <FmEstacion
              initial={editRow}
              onClose={() => setEditRow(null)}
              onSave={msg => { setEditRow(null); showN(msg||'Actualizado correctamente'); reload() }}
              onError={msg => showN(msg, 'err')}
            />
          </div>
        </div>
      )}

      {viewRow && <ModalDetalle data={viewRow} onClose={() => setViewRow(null)} />}

      {deleteRow && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setDeleteRow(null)}>
          <div className="modal">
            <div className="modal-t">🗑️ Eliminar</div>
            <p>¿Eliminar "{deleteRow.nombre}"?</p>
            <div className="modal-f">
              <button className="btn btn-s" onClick={() => setDeleteRow(null)}>Cancelar</button>
              <button className="btn btn-p" style={{background:'var(--e)'}} onClick={doDelete} disabled={deleting}>{deleting ? 'Eliminando...' : 'Eliminar'}</button>
            </div>
          </div>
        </div>
      )}

      {galeriaRow && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setGaleriaRow(null)}>
          <div className="modal" style={{maxHeight:'90vh',overflow:'auto'}}>
            <GaleriaFotos
              tabla="fotos_estaciones"
              foreignKey="estacion_id"
              foreignId={galeriaRow.id}
              titulo={`Galería de ${galeriaRow.nombre}`}
              placeholders={[
                'Ej: Firma del convenio con EDUCATRAN',
                'Ej: Entrega de equipos a la estación',
                'Ej: Personal de la estación recibiendo kits',
                'Ej: Reunión de coordinación con bomberos'
              ]}
            />
            <div className="modal-f">
              <button className="btn btn-s" onClick={() => setGaleriaRow(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
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
  exportXLSX(filas, 'Colegios', 'REPORTE DE COLEGIOS')
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
  const [modal, setModal] = useState(false)
  const [galeriaRow, setGaleriaRow] = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [viewRow, setViewRow] = useState(null)
  const [deleteRow, setDeleteRow] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notif, setNotif] = useState(null)
  const showN = (msg, type = 'ok') => setNotif({ msg, type })
  const [q, setQ] = useState('')

  const cols = [
    { key:'nombre', label:'Institucion Educativa', render:(v,r) => <><strong>{v}</strong><div style={{ color:'var(--t3)',fontSize:11 }}>Dir: {r.director||'—'}</div></> },
    { key:'nivel', label:'Nivel', render:v => <span className="tag tag-n">{v}</span> },
    { key:'distrito', label:'Ubicacion', render:(v,r) => `${v||'—'}, ${r.departamento}` },
    { key:'num_alumnos', label:'Alumnos', render:v => (v||0).toLocaleString() },
    { key:'estaciones_bomberos', label:'Estacion', render:v => v ? <span style={{ color:'var(--b)',fontSize:12 }}>🚒 {v.nombre}</span> : <span style={{ color:'var(--t3)' }}>Sin asignar</span> },
    { key:'activo', label:'Estado', render:v => <Tag s={v?'activo':'inactivo'} /> },
  ]

  const filtered = data.filter(row => {
    if (!q) return true
    return [row.nombre,row.director,row.distrito,row.departamento,row.estaciones_bomberos?.nombre].some(v => v&&v.toLowerCase().includes(q.toLowerCase()))
  })

  const doDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('colegios').delete().eq('id', deleteRow.id)
    setDeleting(false)
    if (error) { showN(error.message, 'err'); return }
    setDeleteRow(null)
    showN('Registro eliminado')
    reload()
  }

  return (
    <div className="content">
      {notif && <Notif msg={notif.msg} type={notif.type} onClose={() => setNotif(null)} />}
      <div className="card">
        <div className="card-h">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span className="card-t">Colegios</span>
            <span className="tag tag-n">{filtered.length}</span>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div className="srch-w">{IC.srch}<input className="srch" placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} /></div>
            <button className="btn-ic" onClick={reload} title="Recargar">{IC.ref}</button>
            <button className="btn btn-s" onClick={() => exportarColegios(filtered)}>📊 Excel</button>
            <button className="btn btn-p" onClick={() => setModal(true)}>{IC.plus}Nuevo Colegio</button>
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
                            <button className="btn btn-s btn-sm" title="Fotos" onClick={() => setGaleriaRow(row)}>📷</button>
                            <button className="btn btn-s btn-sm" title="Editar" onClick={() => setEditRow(row)}>✏️</button>
                            <button className="btn btn-s btn-sm" title="Ver" onClick={() => setViewRow(row)}>👁️</button>
                            <button className="btn btn-s btn-sm" title="Eliminar" style={{color:'var(--e)'}} onClick={() => setDeleteRow(row)}>🗑️</button>
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

      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <FmColegio
              onClose={() => setModal(false)}
              onSave={msg => { setModal(false); showN(msg||'Guardado correctamente'); reload() }}
              onError={msg => showN(msg, 'err')}
            />
          </div>
        </div>
      )}

      {editRow && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setEditRow(null)}>
          <div className="modal">
            <FmColegio
              initial={editRow}
              onClose={() => setEditRow(null)}
              onSave={msg => { setEditRow(null); showN(msg||'Actualizado correctamente'); reload() }}
              onError={msg => showN(msg, 'err')}
            />
          </div>
        </div>
      )}

      {viewRow && <ModalDetalle data={viewRow} onClose={() => setViewRow(null)} />}

      {deleteRow && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setDeleteRow(null)}>
          <div className="modal">
            <div className="modal-t">🗑️ Eliminar</div>
            <p>¿Eliminar "{deleteRow.nombre}"?</p>
            <div className="modal-f">
              <button className="btn btn-s" onClick={() => setDeleteRow(null)}>Cancelar</button>
              <button className="btn btn-p" style={{background:'var(--e)'}} onClick={doDelete} disabled={deleting}>{deleting ? 'Eliminando...' : 'Eliminar'}</button>
            </div>
          </div>
        </div>
      )}

      {galeriaRow && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setGaleriaRow(null)}>
          <div className="modal" style={{maxHeight:'90vh',overflow:'auto'}}>
            <GaleriaFotos
              tabla="fotos_colegios"
              foreignKey="colegio_id"
              foreignId={galeriaRow.id}
              titulo={`Galería de ${galeriaRow.nombre}`}
              placeholders={[
                'Ej: Alumnos recibiendo los kits de seguridad vial',
                'Ej: Aula durante la capacitación',
                'Ej: Director firmando el convenio',
                'Ej: Foto grupal con los bomberos',
                'Ej: Entrega de materiales educativos'
              ]}
            />
            <div className="modal-f">
              <button className="btn btn-s" onClick={() => setGaleriaRow(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
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
  exportXLSX(filas, 'Visitas', 'REPORTE DE VISITAS Y ENTREGAS')
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
    const isNew = !initial?.id
    const wasNotCompleted = initial?.id && initial.estado !== 'completada'
    const willBeCompleted = f.estado === 'completada'

    const payload = {
      colegio_id: f.colegio_id,
      estacion_id: f.estacion_id || null,
      bombero_responsable_id: user?.id || null,
      fecha_visita: f.fecha_visita,
      hora_inicio: f.hora_inicio || null,
      hora_fin: f.hora_fin || null,
      cantidad_kits_entregados: f.cantidad_kits_entregados,
      num_alumnos_capacitados: f.num_alumnos_capacitados,
      num_profesores_presentes: f.num_profesores_presentes,
      temas_tratados: f.temas_tratados,
      observaciones: f.observaciones,
      estado: f.estado
    }

    const { error, data } = isNew
      ? await supabase.from('visitas_entregas').insert(payload)
      : await supabase.from('visitas_entregas').update(payload).eq('id', initial.id)

    if (error) { setSaving(false); onError(error.message); return }

    // Auto-create inventory entry when visit is completed (new or status change to completada)
    if (willBeCompleted && (isNew || wasNotCompleted) && f.cantidad_kits_entregados > 0) {
      const visitaId = isNew ? (data && data[0]?.id) || initial?.id : initial?.id
      const { data: colegios } = await supabase.from('colegios').select('nombre').eq('id',f.colegio_id)
      const colegio = colegios?.[0]?.nombre || 'Colegio'
      const { data: inventory } = await supabase.from('inventario_kits').select('stock_resultante').eq('tipo','ingreso').order('created_at',{ascending:false}).limit(1)
      const stockActual = inventory?.[0]?.stock_resultante || 0
      const stockResultante = Math.max(0, stockActual - f.cantidad_kits_entregados)

      const invPayload = {
        tipo: 'salida',
        cantidad: f.cantidad_kits_entregados,
        fecha: f.fecha_visita,
        motivo: `Entrega en visita a ${colegio}`,
        visita_id: visitaId,
        stock_resultante: stockResultante,
      }
      await supabase.from('inventario_kits').insert(invPayload)
    }

    setSaving(false)
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
  const [modal, setModal] = useState(false)
  const [galeriaRow, setGaleriaRow] = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [viewRow, setViewRow] = useState(null)
  const [deleteRow, setDeleteRow] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notif, setNotif] = useState(null)
  const showN = (msg, type = 'ok') => setNotif({ msg, type })
  const [q, setQ] = useState('')

  const cols = [
    { key:'colegios', label:'Colegio', render:v => <strong>{v?.nombre||'—'}</strong> },
    { key:'estaciones_bomberos', label:'Estacion', render:v => v ? <span style={{ fontSize:12 }}>🚒 {v.nombre}</span> : '—' },
    { key:'usuarios', label:'Bombero', render:v => v ? `${v.nombre} ${v.apellido}` : '—' },
    { key:'fecha_visita', label:'Fecha', render:v => fmtDate(v) },
    { key:'cantidad_kits_entregados', label:'Kits', render:v => <span className="tag tag-b">{v||0} kits</span> },
    { key:'num_alumnos_capacitados', label:'Alumnos', render:v => v>0 ? v : '—' },
    { key:'estado', label:'Estado', render:v => <Tag s={v} /> },
  ]

  const filtered = data.filter(row => {
    if (!q) return true
    return [row.colegios?.nombre,row.estaciones_bomberos?.nombre,row.estado].some(v => v&&v.toLowerCase().includes(q.toLowerCase()))
  })

  const doDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('visitas_entregas').delete().eq('id', deleteRow.id)
    setDeleting(false)
    if (error) { showN(error.message, 'err'); return }
    setDeleteRow(null)
    showN('Registro eliminado')
    reload()
  }

  return (
    <div className="content">
      {notif && <Notif msg={notif.msg} type={notif.type} onClose={() => setNotif(null)} />}
      <div className="card">
        <div className="card-h">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span className="card-t">Visitas y Entregas de Kits</span>
            <span className="tag tag-n">{filtered.length}</span>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div className="srch-w">{IC.srch}<input className="srch" placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} /></div>
            <button className="btn-ic" onClick={reload} title="Recargar">{IC.ref}</button>
            <button className="btn btn-s" onClick={() => exportarVisitas(filtered)}>📊 Excel</button>
            <button className="btn btn-p" onClick={() => setModal(true)}>{IC.plus}Registrar Visita</button>
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
                            <button className="btn btn-s btn-sm" title="Fotos" onClick={() => setGaleriaRow(row)}>📷</button>
                            <button className="btn btn-s btn-sm" title="Editar" onClick={() => setEditRow(row)}>✏️</button>
                            <button className="btn btn-s btn-sm" title="Ver" onClick={() => setViewRow(row)}>👁️</button>
                            <button className="btn btn-s btn-sm" title="Eliminar" style={{color:'var(--e)'}} onClick={() => setDeleteRow(row)}>🗑️</button>
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

      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <FmVisita
              onClose={() => setModal(false)}
              onSave={msg => { setModal(false); showN(msg||'Guardado correctamente'); reload() }}
              onError={msg => showN(msg, 'err')}
            />
          </div>
        </div>
      )}

      {editRow && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setEditRow(null)}>
          <div className="modal">
            <FmVisita
              initial={editRow}
              onClose={() => setEditRow(null)}
              onSave={msg => { setEditRow(null); showN(msg||'Actualizado correctamente'); reload() }}
              onError={msg => showN(msg, 'err')}
            />
          </div>
        </div>
      )}

      {viewRow && <ModalDetalle data={viewRow} onClose={() => setViewRow(null)} />}

      {deleteRow && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setDeleteRow(null)}>
          <div className="modal">
            <div className="modal-t">🗑️ Eliminar</div>
            <p>¿Eliminar esta visita?</p>
            <div className="modal-f">
              <button className="btn btn-s" onClick={() => setDeleteRow(null)}>Cancelar</button>
              <button className="btn btn-p" style={{background:'var(--e)'}} onClick={doDelete} disabled={deleting}>{deleting ? 'Eliminando...' : 'Eliminar'}</button>
            </div>
          </div>
        </div>
      )}

      {galeriaRow && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setGaleriaRow(null)}>
          <div className="modal" style={{maxHeight:'90vh',overflow:'auto'}}>
            <GaleriaFotos
              tabla="fotos_visitas"
              foreignKey="visita_id"
              foreignId={galeriaRow.id}
              titulo={`Galería de la Visita`}
              extraInfo={`${galeriaRow.colegios?.nombre} • ${fmtDate(galeriaRow.fecha_visita)}`}
              placeholders={[
                'Ej: Entrega de kits de seguridad vial',
                'Ej: Alumnos recibiendo los kits',
                'Ej: Capacitación sobre señales de tránsito',
                'Ej: Bomberos con estudiantes del colegio',
                'Ej: Demostración de cruce peatonal seguro',
                'Ej: Foto grupal al finalizar la visita'
              ]}
            />
            <div className="modal-f">
              <button className="btn btn-s" onClick={() => setGaleriaRow(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── INVENTARIO KITS ──────────────────────────────────────────────────────────
function exportarInventario(rows) {
  const filas = rows.map(r => ({
    'Fecha': r.fecha,
    'Tipo': r.tipo,
    'Kit': r.kits_juegos?.nombre || '—',
    'Cantidad': r.cantidad,
    'Lote': r.numero_lote,
    'Fecha Fabricacion': r.fecha_fabricacion,
    'Fecha Vencimiento': r.fecha_vencimiento,
    'Proveedor': r.proveedor || '—',
    'Costo Unitario': r.costo_unitario || '—',
    'Costo Total': r.costo_total || '—',
    'Stock Resultante': r.stock_resultante,
    'Motivo': r.motivo || '—',
    'Observaciones': r.observaciones || '—',
  }))
  exportXLSX(filas, 'Inventario_Kits', 'REPORTE DE INVENTARIO DE KITS')
}

function FmInventario({ onClose, onSave, onError, initial }) {
  const [f, setF] = useState(initial ? { ...initial } : {
    tipo:'ingreso', kit_id:'', cantidad:0, fecha:'', fecha_fabricacion:'',
    fecha_vencimiento:'', numero_lote:'', proveedor:'', costo_unitario:'',
    motivo:'', visita_id:'', observaciones:''
  })
  const [kits, setKits] = useState([]); const [visitas, setVisitas] = useState([]); const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('kits_juegos').select('id,nombre').then(({data}) => setKits(data||[]))
    supabase.from('visitas_entregas').select('id,fecha_visita,colegios(nombre)').eq('estado','programada').then(({data}) => setVisitas(data||[]))
  }, [])

  const up = (k,v) => setF(p => ({...p,[k]:v}))

  const save = async () => {
    if (!f.kit_id||!f.cantidad||!f.fecha) { onError('Kit, cantidad y fecha son obligatorios'); return }
    if (f.tipo==='salida' && !f.visita_id) { onError('Para salidas debe vincular una visita'); return }

    setSaving(true)

    const { data: existing } = await supabase.from('inventario_kits').select('cantidad,tipo').eq('kit_id',f.kit_id)
    const stockActual = (existing||[]).reduce((a,r) => a + (r.tipo==='ingreso'?r.cantidad:-r.cantidad),0)

    if (f.tipo==='salida' && (stockActual - f.cantidad) < 0) {
      setSaving(false)
      onError(`Stock insuficiente. Disponible: ${stockActual}, Solicitado: ${f.cantidad}`)
      return
    }

    const stockResultante = f.tipo==='ingreso' ? stockActual + parseInt(f.cantidad) : stockActual - parseInt(f.cantidad)
    const payload = {
      ...f,
      cantidad: parseInt(f.cantidad),
      costo_unitario: f.costo_unitario ? parseFloat(f.costo_unitario) : null,
      costo_total: f.costo_unitario ? parseFloat(f.costo_unitario) * parseInt(f.cantidad) : null,
      stock_resultante: stockResultante,
      visita_id: f.visita_id || null,
    }

    const { error } = initial?.id
      ? await supabase.from('inventario_kits').update(payload).eq('id', initial.id)
      : await supabase.from('inventario_kits').insert(payload)

    if (!error && !initial?.id && f.kit_id) {
      await supabase.from('kits_juegos').update({ cantidad_disponible:stockResultante }).eq('id',f.kit_id)
    }

    setSaving(false)
    if (error) { onError(error.message); return }
    onSave(initial?.id ? 'Movimiento actualizado correctamente' : 'Movimiento registrado exitosamente')
  }

  return (
    <>
      <div className="modal-t">{initial?.id ? '✏️ Editar' : '📦 Nuevo'} Movimiento</div>
      <div className="fgrid">
        <div className="fg"><label className="fl">Tipo *</label>
          <select value={f.tipo} onChange={e => up('tipo',e.target.value)}>
            <option value="ingreso">Ingreso</option>
            <option value="salida">Salida</option>
          </select>
        </div>
        <div className="fg"><label className="fl">Kit de Juego *</label>
          <select value={f.kit_id} onChange={e => up('kit_id',e.target.value)}>
            <option value="">— Seleccionar kit —</option>
            {kits.map(k => <option key={k.id} value={k.id}>{k.nombre}</option>)}
          </select>
        </div>
        <div className="fg"><label className="fl">Cantidad *</label><input type="number" min="0" value={f.cantidad} onChange={e => up('cantidad',e.target.value)} /></div>
        <div className="fg"><label className="fl">Fecha *</label><input type="date" value={f.fecha} onChange={e => up('fecha',e.target.value)} /></div>
        <div className="fg"><label className="fl">Fecha Fabricación</label><input type="date" value={f.fecha_fabricacion} onChange={e => up('fecha_fabricacion',e.target.value)} /></div>
        <div className="fg"><label className="fl">Fecha Vencimiento</label><input type="date" value={f.fecha_vencimiento} onChange={e => up('fecha_vencimiento',e.target.value)} /></div>
        <div className="fg"><label className="fl">N° Lote</label><input value={f.numero_lote} onChange={e => up('numero_lote',e.target.value)} /></div>
        {f.tipo==='ingreso' && (
          <>
            <div className="fg"><label className="fl">Proveedor</label><input value={f.proveedor} onChange={e => up('proveedor',e.target.value)} /></div>
            <div className="fg"><label className="fl">Costo Unitario</label><input type="number" min="0" step="0.01" value={f.costo_unitario} onChange={e => up('costo_unitario',e.target.value)} /></div>
          </>
        )}
        {f.tipo==='salida' && (
          <div className="fg"><label className="fl">Visita Vinculada *</label>
            <select value={f.visita_id} onChange={e => up('visita_id',e.target.value)}>
              <option value="">— Seleccionar visita —</option>
              {visitas.map(v => <option key={v.id} value={v.id}>{v.colegios?.nombre} - {fmtDate(v.fecha_visita)}</option>)}
            </select>
          </div>
        )}
        <div className="fg full"><label className="fl">Motivo</label><input value={f.motivo} onChange={e => up('motivo',e.target.value)} placeholder="Compra, donacion, entrega programada, etc." /></div>
        <div className="fg full"><label className="fl">Observaciones</label><textarea value={f.observaciones} onChange={e => up('observaciones',e.target.value)} /></div>
      </div>
      <div className="modal-f">
        <button className="btn btn-s" onClick={onClose}>Cancelar</button>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving ? <><span className="spin" /> Guardando...</> : 'Registrar Movimiento'}</button>
      </div>
    </>
  )
}

function InventarioKits() {
  const { data, loading, reload } = useTable('inventario_kits', '*, kits_juegos(nombre), visitas_entregas(colegios(nombre))')

  const stockTotal = data.reduce((a,r) => a + (r.tipo==='ingreso'?r.cantidad:-r.cantidad),0)
  const totalIngresos = data.filter(r => r.tipo==='ingreso').reduce((a,r) => a+r.cantidad,0)
  const totalSalidas = data.filter(r => r.tipo==='salida').reduce((a,r) => a+r.cantidad,0)
  const costoPromedio = data.filter(r => r.costo_unitario).length > 0
    ? data.filter(r => r.costo_unitario).reduce((a,r) => a+r.costo_unitario,0) / data.filter(r => r.costo_unitario).length
    : 0
  const valorStock = stockTotal * costoPromedio

  const cols = [
    { key:'fecha', label:'Fecha', render:v => fmtDate(v) },
    { key:'tipo', label:'Tipo', render:v => <Tag s={v} /> },
    { key:'kits_juegos', label:'Kit', render:v => v?.nombre||'—' },
    { key:'numero_lote', label:'Lote', render:v => v||'—' },
    { key:'cantidad', label:'Cantidad', render:v => <span className="tag tag-b">{v} unid.</span> },
    { key:'fecha_fabricacion', label:'Fab.', render:v => fmtDate(v) },
    { key:'proveedor', label:'Proveedor', render:v => v||'—' },
    { key:'costo_unitario', label:'Costo Unit.', render:v => v ? fmt(v) : '—' },
    { key:'stock_resultante', label:'Stock Resultante', render:v => <strong>{v}</strong> },
    { key:'visitas_entregas', label:'Visita Vinculada', render:v => v?.colegios?.nombre ? `📍 ${v.colegios.nombre}` : '—' },
    { key:'motivo', label:'Motivo', render:v => v||'—' },
  ]

  const header = (
    <div className="fin-bar">
      <div className="fin-tile"><div className="fin-l">Stock Total</div><div className="fin-v">{stockTotal} unid.</div></div>
      <div className="fin-tile"><div className="fin-l">Total Ingresos</div><div className="fin-v" style={{color:'var(--g)'}}>{totalIngresos} unid.</div></div>
      <div className="fin-tile"><div className="fin-l">Total Salidas</div><div className="fin-v" style={{color:'var(--e)'}}>- {totalSalidas} unid.</div></div>
      <div className="fin-tile"><div className="fin-l">Valor en Stock</div><div className="fin-v">{fmt(valorStock)}</div></div>
    </div>
  )

  return <Page title="Inventario de Kits" data={data} loading={loading} reload={reload} cols={cols} addLabel="Nuevo Movimiento" Form={FmInventario} deleteTable="inventario_kits" exportFn={exportarInventario} headerExtra={header} filterFn={(r,q) => [r.tipo,r.numero_lote,r.proveedor,r.motivo,fmtDate(r.fecha)].some(v => v&&v.toLowerCase().includes(q.toLowerCase()))} />
}

// ─── CONTRATOS ────────────────────────────────────────────────────────────────
async function subirPDFFirmado(contratoId, file) {
  if (!file) return
  try {
    const fileName = `contrato-${contratoId}-firmado.pdf`
    const { error: uploadErr } = await supabase.storage
      .from('contratos-pdf')
      .upload(fileName, file, { upsert: true })
    if (uploadErr) throw uploadErr
    const { data: { publicUrl } } = supabase.storage
      .from('contratos-pdf')
      .getPublicUrl(fileName)
    const { error: updateErr } = await supabase.from('contratos').update({
      pdf_firmado_url: publicUrl,
      pdf_firmado_fecha: new Date().toISOString()
    }).eq('id', contratoId)
    if (updateErr) throw updateErr
    alert('PDF firmado subido correctamente')
    window.location.reload()
  } catch (e) {
    alert('Error al subir PDF: ' + e.message)
  }
}

async function generarPDFContrato(contratoId, download = false) {
  const { data: contrato } = await supabase.from('contratos').select('*, patrocinadores(*), gestores(*)').eq('id', contratoId).single()
  if (!contrato) return

  const doc = new window.jspdf.jsPDF('p', 'mm', 'A4')
  const w = 210; const h = 297; const m = 20; let y = m
  const rojo = '#E63946'; const negro = '#0D1117'; const gris = '#6B7280'

  // Cabecera
  doc.setFont('helvetica', 'bold'); doc.setFontSize(32); doc.setTextColor(230, 57, 70)
  doc.text('EDUCATRAN', w/2, y, { align:'center' }); y += 12
  doc.setFontSize(9); doc.setTextColor(107, 114, 128)
  doc.text('Sistema de Gestión de Donaciones para Seguridad Vial', w/2, y, { align:'center' }); y += 8
  doc.setDrawColor(230, 57, 70); doc.line(m, y, w-m, y); y += 6

  // Título
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(13, 17, 23)
  doc.text('CONTRATO DE DONACIÓN CORPORATIVA', w/2, y, { align:'center' }); y += 10
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(107, 114, 128)
  doc.text(`N° Contrato: ${contrato.numero_contrato || '—'}`, m, y); y += 5
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-PE')}`, m, y); y += 8

  // Sección 1: Partes involucradas
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(13, 17, 23)
  doc.text('PARTES INVOLUCRADAS', m, y); y += 6

  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(13, 17, 23)
  doc.text('PRIMERA PARTE (RECEPTOR):', m, y); y += 5
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(107, 114, 128)
  doc.text('Organización: EDUCATRAN', m+5, y); y += 4
  doc.text('RUC: 20XXXXXXXXX', m+5, y); y += 4
  doc.text('Representante Legal: [Administrador]', m+5, y); y += 4
  doc.text('Dirección: Lima, Perú', m+5, y); y += 8

  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(13, 17, 23)
  doc.text('SEGUNDA PARTE (DONANTE):', m, y); y += 5
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(107, 114, 128)
  doc.text(`Empresa: ${contrato.patrocinadores?.razon_social || '—'}`, m+5, y); y += 4
  doc.text(`Nombre Comercial: ${contrato.patrocinadores?.nombre_comercial || '—'}`, m+5, y); y += 4
  doc.text(`RUC: ${contrato.patrocinadores?.ruc || '—'}`, m+5, y); y += 4
  doc.text(`Contacto: ${contrato.patrocinadores?.nombre_contacto || '—'}`, m+5, y); y += 4
  doc.text(`Email: ${contrato.patrocinadores?.email_contacto || '—'}`, m+5, y); y += 4
  doc.text(`País: ${contrato.patrocinadores?.pais || '—'}`, m+5, y); y += 8

  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(13, 17, 23)
  doc.text('GESTOR RESPONSABLE:', m, y); y += 5
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(107, 114, 128)
  doc.text(`Nombre: ${contrato.gestores?.nombre} ${contrato.gestores?.apellido || ''}`, m+5, y); y += 4
  doc.text(`Comisión pactada: 5%`, m+5, y); y += 8

  if (y > h - 40) { doc.addPage(); y = m }

  // Sección 2: Objeto del contrato
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(13, 17, 23)
  doc.text('OBJETO DEL CONTRATO', m, y); y += 6
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(107, 114, 128)
  const objText = doc.splitTextToSize(`${contrato.descripcion || 'La empresa dona el monto para fabricación de kits de seguridad vial para colegios, distribuidos por bomberos voluntarios.'}`, w - 2*m)
  doc.text(objText, m, y); y += objText.length * 4 + 4

  if (y > h - 40) { doc.addPage(); y = m }

  // Sección 3: Monto y condiciones
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(13, 17, 23)
  doc.text('MONTO Y CONDICIONES', m, y); y += 6
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(107, 114, 128)
  doc.text(`Monto Comprometido: ${fmt(contrato.monto_comprometido, contrato.moneda)}`, m+5, y); y += 4
  doc.text(`Vigencia: ${fmtDate(contrato.fecha_inicio)} al ${fmtDate(contrato.fecha_fin)}`, m+5, y); y += 4
  doc.text(`Tipo: ${contrato.tipo}`, m+5, y); y += 4
  doc.text(`Estado: ${contrato.estado}`, m+5, y); y += 8

  if (y > h - 50) { doc.addPage(); y = m }

  // Sección 4: Cláusulas
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(13, 17, 23)
  doc.text('CLÁUSULAS', m, y); y += 6

  const clausulas = [
    { titulo: 'Cláusula 1: Destino de los fondos', texto: 'Los fondos donados serán destinados exclusivamente a la fabricación y distribución de kits educativos de seguridad vial en colegios e instituciones públicas.' },
    { titulo: 'Cláusula 2: Reconocimiento al donante', texto: 'EDUCATRAN se compromete a reconocer públicamente la contribución del donante en sus comunicaciones y reportes.' },
    { titulo: 'Cláusula 3: Comisión del gestor', texto: `El gestor ${contrato.gestores?.nombre} recibirá una comisión del 5% sobre el monto donado, conforme a los términos pactados.` },
    { titulo: 'Cláusula 4: Vigencia', texto: `El presente contrato tiene vigencia desde ${fmtDate(contrato.fecha_inicio)} hasta ${fmtDate(contrato.fecha_fin)}.` }
  ]

  clausulas.forEach(c => {
    if (y > h - 30) { doc.addPage(); y = m }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(13, 17, 23)
    doc.text(c.titulo, m, y); y += 4
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(107, 114, 128)
    const textoSplit = doc.splitTextToSize(c.texto, w - 2*m - 5)
    doc.text(textoSplit, m+5, y); y += textoSplit.length * 3.5 + 4
  })

  if (contrato.notas && y < h - 30) {
    if (y > h - 40) { doc.addPage(); y = m }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(13, 17, 23)
    doc.text('OBSERVACIONES ADICIONALES:', m, y); y += 4
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(107, 114, 128)
    const notasSplit = doc.splitTextToSize(contrato.notas, w - 2*m - 5)
    doc.text(notasSplit, m+5, y); y += notasSplit.length * 3.5 + 6
  }

  if (y > h - 50) { doc.addPage(); y = m }

  // Sección 5: Firmas
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(13, 17, 23)
  doc.text('FIRMAS Y AUTORIZACIONES', m, y); y += 12
  const colW = (w - 2*m - 10) / 3; const firmaY = y + 25

  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(107, 114, 128)
  doc.line(m, firmaY, m + colW - 5, firmaY)
  doc.text('Por EDUCATRAN', m, firmaY + 4, { align:'left' }); doc.text('Representante Legal', m, firmaY + 8, { align:'left' })

  doc.line(m + colW + 5, firmaY, m + 2*colW, firmaY)
  doc.text(`Por ${contrato.patrocinadores?.nombre_comercial || 'Patrocinador'}`, m + colW + 5, firmaY + 4, { align:'left' }); doc.text(contrato.patrocinadores?.nombre_contacto || '', m + colW + 5, firmaY + 8, { align:'left' })

  doc.line(m + 2*colW + 10, firmaY, w - m, firmaY)
  doc.text('Gestor Responsable', m + 2*colW + 10, firmaY + 4, { align:'left' }); doc.text(`${contrato.gestores?.nombre || ''}`, m + 2*colW + 10, firmaY + 8, { align:'left' })

  // Pie de página
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(107, 114, 128)
  doc.text('Documento generado por EDUCATRAN | educatran.vercel.app', w/2, h - 8, { align:'center' })
  doc.text(`Lima, Perú | ${new Date().toLocaleDateString('es-PE')}`, w/2, h - 4, { align:'center' })

  if (download) {
    doc.save(`Contrato_${contrato.numero_contrato || 'documento'}.pdf`)
  } else {
    doc.output('dataurlnewwindow')
  }
}

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
  exportXLSX(filas, 'Contratos', 'REPORTE DE CONTRATOS')
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
  const { data, loading, reload } = useTable('contratos','*, patrocinadores(nombre_comercial,logo_url), gestores(nombre,apellido)')
  const cols = [
    { key:'numero_contrato', label:'N° Contrato', render:v => <code style={{ background:'var(--bg)',padding:'2px 7px',borderRadius:4,fontSize:11 }}>{v||'—'}</code> },
    { key:'titulo', label:'Titulo' },
    { key:'tipo', label:'Tipo', render:v => <span className="tag tag-n">{v}</span> },
    { key:'patrocinadores', label:'Patrocinador', render:(v,r) => <div style={{display:'flex',alignItems:'center',gap:8}}>{v?.logo_url ? <img src={v.logo_url} style={{width:32,height:32,objectFit:'contain',borderRadius:4,border:'1px solid #E8EAF0'}} alt="" /> : <span style={{marginRight:0}}>🏢</span>}<span>{v?.nombre_comercial||'—'}</span></div> },
    { key:'monto_comprometido', label:'Monto', render:(v,r) => v ? <span className="amt">{fmt(v,r.moneda)}</span> : '—' },
    { key:'fecha_fin', label:'Vence', render:v => fmtDate(v) },
    { key:'estado', label:'Estado', render:(v,r) => <div style={{display:'flex',gap:6,alignItems:'center'}}><Tag s={v} />{r.pdf_firmado_url && <span className="tag tag-g">✅ Firmado</span>}{!r.pdf_firmado_url && <span className="tag tag-a">⚠️ Sin firmar</span>}</div> },
    { key:'id', label:'Documento', render:(v,r) => (
      <div style={{ display:'flex', gap:6, fontSize:11, flexWrap:'wrap' }}>
        <button onClick={() => generarPDFContrato(v, false)} style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',background:'#EFF6FF',color:'#2563EB',border:'1px solid #BFDBFE',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer'}}>📄 Generar</button>
        <label style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',background:'#F0FDF4',color:'#059669',border:'1px solid #A7F3D0',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer'}} title="Subir PDF firmado">📎 Subir <input type="file" accept=".pdf" onChange={e => subirPDFFirmado(v, e.target.files?.[0])} style={{display:'none'}} /></label>
        {r.pdf_firmado_url && <button onClick={() => window.open(r.pdf_firmado_url, '_blank')} style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',background:'#F5F3FF',color:'#7C3AED',border:'1px solid #DDD6FE',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer'}}>👁️ Ver</button>}
        {r.pdf_firmado_url && <a href={r.pdf_firmado_url} download={`Contrato_${r.numero_contrato}_firmado.pdf`} style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',background:'#FFF7ED',color:'#C2410C',border:'1px solid #FED7AA',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',textDecoration:'none'}}>⬇️ PDF</a>}
      </div>
    ) },
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
  exportXLSX(filas, 'Gastos', 'REPORTE DE GASTOS')
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
  exportXLSX(filas, 'Comisiones', 'REPORTE DE COMISIONES')
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

function FmPagarComision({ onClose, onSave, onError, donacion, gestor }) {
  const [f, setF] = useState({ fecha_pago: new Date().toISOString().split('T')[0], metodo_pago: 'Transferencia', referencia_pago: '' })
  const [saving, setSaving] = useState(false)
  const up = (k,v) => setF(p => ({...p,[k]:v}))
  const save = async () => {
    setSaving(true)
    const payload = {
      gestor_id: gestor.id,
      donacion_id: donacion.id,
      monto_donacion: donacion.monto,
      porcentaje: 5,
      monto_comision: donacion.comision_gestor,
      fecha_pago: f.fecha_pago,
      metodo_pago: f.metodo_pago,
      referencia_pago: f.referencia_pago,
      estado: 'pagado'
    }
    const { error: err1 } = await supabase.from('comisiones').insert(payload)
    if (err1) { setSaving(false); onError(err1.message); return }

    await supabase.from('donaciones').update({ comision_pagada: true }).eq('id', donacion.id)

    const { data: totalGest } = await supabase
      .from('comisiones')
      .select('monto_comision')
      .eq('gestor_id', gestor.id)
      .eq('estado', 'pagado')
    const nuevoTotal = totalGest?.reduce((s, c) => s + (c.monto_comision || 0), 0) || 0
    await supabase.from('gestores').update({ total_comisiones_pagadas: nuevoTotal }).eq('id', gestor.id)

    setSaving(false)
    onSave('✅ Comisión pagada correctamente')
  }
  return (
    <>
      <div className="modal-t">💸 Pagar Comisión</div>
      <div className="fgrid">
        <div className="fg full"><label className="fl">Gestor</label><div style={{ padding:'8px 0', fontWeight: 500 }}>{gestor.nombre} {gestor.apellido}</div></div>
        <div className="fg full"><label className="fl">Monto Comisión</label><div style={{ padding:'8px 0', fontWeight: 600, fontSize: 16, color: 'var(--a)' }}>{fmt(donacion.comision_gestor)}</div></div>
        <div className="fg"><label className="fl">Fecha de Pago *</label><input type="date" value={f.fecha_pago} onChange={e => up('fecha_pago',e.target.value)} /></div>
        <div className="fg"><label className="fl">Método de Pago</label><select value={f.metodo_pago} onChange={e => up('metodo_pago',e.target.value)}><option>Transferencia</option><option>Efectivo</option><option>Cheque</option></select></div>
        <div className="fg full"><label className="fl">N° Referencia</label><input value={f.referencia_pago} onChange={e => up('referencia_pago',e.target.value)} placeholder="N° operación" /></div>
      </div>
      <div className="modal-f">
        <button className="btn btn-s" onClick={onClose}>Cancelar</button>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving ? <><span className="spin" /> Guardando...</> : 'Confirmar Pago'}</button>
      </div>
    </>
  )
}

function Comisiones() {
  const { data, loading, reload } = useTable('comisiones','*, gestores(nombre,apellido), donaciones(monto,patrocinadores(nombre_comercial))')
  const [pendientesData, setPendientesData] = useState([])
  const [pendLoading, setPendLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editRow, setEditRow] = useState(null)
  const [notif, setNotif] = useState(null)
  const [payModal, setPayModal] = useState(null)
  const [q, setQ] = useState('')
  const showN = (msg, type = 'ok') => setNotif({ msg, type })

  useEffect(() => {
    const cargarPendientes = async () => {
      setPendLoading(true)
      const { data: pend } = await supabase
        .from('donaciones')
        .select('*, gestores(id,nombre,apellido,banco,cuenta_bancaria), patrocinadores(nombre_comercial)')
        .eq('comision_pagada', false)
        .eq('estado', 'recibida')
        .not('gestor_id', 'is', null)
        .gt('comision_gestor', 0)
        .order('fecha_donacion', { ascending: false })
      setPendientesData(pend || [])
      setPendLoading(false)
    }
    cargarPendientes()
  }, [])

  const totalPorPagar = (pendientesData || []).reduce((a, d) => a + (d.comision_gestor || 0), 0)
  const totalPagado = (data || []).filter(c => c.estado === 'pagado').reduce((a, c) => a + (c.monto_comision || 0), 0)

  const exportComisiones = () => {
    const comisionesData = (data || []).filter(c => c.estado === 'pagado')

    const ws1Data = [
      ['GESTOR', 'PATROCINADOR', 'MONTO DONACIÓN', 'COMISIÓN 5%', 'FECHA PAGO', 'MÉTODO', 'ESTADO'],
      ...comisionesData.map(c => [
        c.gestores ? `${c.gestores.nombre} ${c.gestores.apellido}` : '—',
        c.donaciones?.patrocinadores?.nombre_comercial || '—',
        c.monto_donacion || 0,
        c.monto_comision || 0,
        c.fecha_pago || '',
        c.metodo_pago || '',
        c.estado || ''
      ]),
      ['TOTAL', '', '', comisionesData.reduce((s,c) => s+(c.monto_comision||0), 0), '', '', '']
    ]

    const ws2Data = [
      ['GESTOR', 'BANCO', 'CUENTA', 'PATROCINADOR', 'MONTO DONACIÓN', 'COMISIÓN PENDIENTE', 'FECHA DONACIÓN'],
      ...(pendientesData || []).map(d => [
        d.gestores ? `${d.gestores.nombre} ${d.gestores.apellido}` : '—',
        d.gestores?.banco || '—',
        d.gestores?.cuenta_bancaria || '—',
        d.patrocinadores?.nombre_comercial || '—',
        d.monto || 0,
        d.comision_gestor || 0,
        d.fecha_donacion || ''
      ]),
      ['TOTAL', '', '', '', '', (pendientesData || []).reduce((s,d) => s+(d.comision_gestor||0), 0), '']
    ]

    const wb = XLSX.utils.book_new()
    const ws1 = XLSX.utils.aoa_to_sheet(ws1Data)
    const ws2 = XLSX.utils.aoa_to_sheet(ws2Data)

    ws1['!cols'] = [{wch:25},{wch:20},{wch:18},{wch:18},{wch:15},{wch:15},{wch:12}]
    ws2['!cols'] = [{wch:25},{wch:15},{wch:20},{wch:20},{wch:18},{wch:22},{wch:15}]

    ws1.A1.s = { fill: { fgColor: { rgb: 'FFE63946' } }, font: { bold: true, color: { rgb: 'FFFFFFFF' } } }
    ws2.A1.s = { fill: { fgColor: { rgb: 'FFF59E0B' } }, font: { bold: true, color: { rgb: 'FFFFFFFF' } } }

    XLSX.utils.book_append_sheet(wb, ws1, 'Comisiones Pagadas')
    XLSX.utils.book_append_sheet(wb, ws2, 'Comisiones Pendientes')

    XLSX.writeFile(wb, `EDUCATRAN_Comisiones_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const colsPagadas = [
    { key:'gestores', label:'Gestor', render:(v, r) => v ? <strong>{v.nombre} {v.apellido}</strong> : '—' },
    { key:'donaciones', label:'Donacion', render:(v, r) => v ? <span style={{ fontSize:12,color:'var(--t2)' }}>{v.patrocinadores?.nombre_comercial} — {fmt(v.monto)}</span> : '—' },
    { key:'porcentaje', label:'%', render:(v, r) => <span className="tag tag-b">{v||5}%</span> },
    { key:'monto_comision', label:'Comision', render:(v, r) => <span className="amt amt-a">{fmt(v)}</span> },
    { key:'fecha_pago', label:'Fecha Pago', render:(v, r) => v ? fmtDate(v) : <span style={{ color:'var(--t3)' }}>Pendiente</span> },
    { key:'metodo_pago', label:'Metodo', render:(v, r) => v || '—' },
  ]

  const colsPendientes = [
    { key:'gestores', label:'Gestor', render:(v, r) => v ? <><strong>{v.nombre} {v.apellido}</strong><div style={{ fontSize:11,color:'var(--t3)' }}>{v.banco} {v.cuenta_bancaria ? `- ${v.cuenta_bancaria}` : ''}</div></> : '—' },
    { key:'patrocinadores', label:'Patrocinador', render:(v, r) => v?.nombre_comercial || '—' },
    { key:'monto', label:'Donación', render:(v, r) => <span className="amt">{fmt(v)}</span> },
    { key:'comision_gestor', label:'Comisión (5%)', render:(v, r) => <span style={{ fontWeight:600, color:'var(--a)' }}>{fmt(v)}</span> },
    { key:'gestores', label:'Banco', render:(v, r) => v?.banco || '—' },
  ]

  const dataFiltered = pendientesData.filter(row => !q || [row.gestores?.nombre,row.patrocinadores?.nombre_comercial].some(v => v?.toLowerCase().includes(q.toLowerCase())))

  const header = (
    <div className="fin-bar">
      <div className="fin-tile"><div className="fin-l">Por Pagar</div><div className="fin-v" style={{ color:'var(--a)' }}>{fmt(totalPorPagar)}</div></div>
      <div className="fin-tile"><div className="fin-l">Ya Pagado</div><div className="fin-v" style={{ color:'var(--g)' }}>{fmt(totalPagado)}</div></div>
    </div>
  )

  return (
    <div className="content">
      {notif && <Notif msg={notif.msg} type={notif.type} onClose={() => setNotif(null)} />}

      {/* SECTION: COMISIONES PAGADAS */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-h">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span className="card-t">✅ Comisiones Pagadas</span>
            <span className="tag tag-g">{data.length}</span>
          </div>
          <button className="btn btn-p" onClick={() => { setEditRow(null); setModal(true) }}>+ Registrar Pago</button>
        </div>
        {header}
        <div className="tbl-wrap" style={{ marginTop: 16 }}>
          {loading
            ? <div className="loader"><div className="ring" /> Cargando...</div>
            : data.filter(d => d.estado === 'pagado').length === 0
            ? <div style={{ textAlign:'center', color:'var(--t3)', padding:40 }}>Sin registros</div>
            : <table>
                <thead><tr>{colsPagadas.map(c => <th key={c.key}>{c.label}</th>)}<th>Acciones</th></tr></thead>
                <tbody>
                  {data.filter(d => d.estado === 'pagado').map(row => (
                    <tr key={row.id}>
                      {colsPagadas.map(c => <td key={c.key}>{c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}</td>)}
                      <td>
                        <div style={{ display:'flex', gap:4 }}>
                          <button className="btn btn-s btn-sm" title="Editar" onClick={() => setEditRow(row)}>✏️</button>
                          <button className="btn btn-s btn-sm" title="Ver" onClick={() => setEditRow(row)}>👁️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </div>

      {/* SECTION: COMISIONES PENDIENTES */}
      <div className="card" style={{ border:'1px solid #FDE68A', background:'#FFFBEB' }}>
        <div className="card-h" style={{ color:'#D97706' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span className="card-t" style={{ color:'#D97706' }}>⏳ Comisiones Pendientes de Pago</span>
            <span className="tag tag-a">{dataFiltered.length}</span>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div className="srch-w">{IC.srch}<input className="srch" placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} /></div>
            <button className="btn-ic" onClick={reload} title="Recargar">{IC.ref}</button>
            <button className="btn btn-s" onClick={exportComisiones}>📊 Excel</button>
          </div>
        </div>
        <div className="tbl-wrap">
          {pendLoading
            ? <div className="loader"><div className="ring" /> Cargando pendientes...</div>
            : dataFiltered.length === 0
            ? <div style={{ textAlign:'center', color:'var(--t3)', padding:40 }}>Sin comisiones pendientes</div>
            : <table>
                <thead><tr>{colsPendientes.map(c => <th key={c.key}>{c.label}</th>)}<th>Acción</th></tr></thead>
                <tbody>
                  {dataFiltered.map(row => (
                    <tr key={row.id}>
                      {colsPendientes.map(c => <td key={c.key}>{c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}</td>)}
                      <td>
                        <button className="btn btn-s btn-p" onClick={() => setPayModal(row)} style={{ fontSize:12, padding:'6px 12px' }}>💸 Pagar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </div>

      {/* MODALS */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <FmComision
              initial={editRow}
              onClose={() => { setModal(false); setEditRow(null) }}
              onSave={msg => { setModal(false); setEditRow(null); showN(msg||'Guardado correctamente'); reload(); setPendientesData(pd => pd.filter(p => p.id !== editRow?.id)) }}
              onError={msg => showN(msg, 'err')}
            />
          </div>
        </div>
      )}

      {payModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setPayModal(null)}>
          <div className="modal" style={{ maxWidth: 450 }}>
            <FmPagarComision
              donacion={payModal}
              gestor={payModal.gestores}
              onClose={() => setPayModal(null)}
              onSave={msg => { setPayModal(null); showN(msg); reload(); setPendientesData(pd => pd.filter(p => p.id !== payModal.id)) }}
              onError={msg => showN(msg, 'err')}
            />
          </div>
        </div>
      )}
    </div>
  )
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
  { id:'inventario',   label:'Inventario Kits',      icon:IC.inv,  roles:['admin'],           sec:'Operaciones' },
]
const PAGES = { dashboard:Dashboard, donaciones:Donaciones, patrocinadores:Patrocinadores, contratos:Contratos, gestores:Gestores, comisiones:Comisiones, gastos:Gastos, estaciones:Estaciones, colegios:Colegios, visitas:Visitas, inventario:InventarioKits }
const ROLE_LABELS = { admin:'Administrador', gestor:'Gestor', bombero:'Bombero', auditor:'Auditor' }

// ─── SHELL ────────────────────────────────────────────────────────────────────
function MobileNav({ visible, page, setPage, openGroup, setOpenGroup, onLogout, nombre, apellido }) {
  const groups = [
    { label: 'Fondos', icon: '💰', sec: 'Fondos' },
    { label: 'Admin', icon: '⚙️', sec: 'Admin' },
    { label: 'Ops', icon: '🚒', sec: 'Operaciones' }
  ]
  const noSec = visible.filter(n => !n.sec)

  return (
    <div style={{ position: 'fixed', top: 54, left: 0, right: 0, background: 'rgba(10,14,26,0.98)', backdropFilter: 'blur(20px)', zIndex: 999, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', height: 52, gap: 4, overflowX: 'auto' }}>
        {noSec.map(item => (
          <button key={item.id} onClick={() => { setPage(item.id); setOpenGroup(null) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 10px', borderRadius: 10, border: 'none', background: page === item.id ? 'rgba(230,57,70,0.2)' : 'none', color: page === item.id ? '#E63946' : 'rgba(255,255,255,0.6)', cursor: 'pointer', minWidth: 60, flexShrink: 0, fontSize: 10, fontWeight: page === item.id ? 700 : 500 }}>
            <span style={{fontSize:20}}>{item.icon || '🏠'}</span>
            {item.label}
          </button>
        ))}
        {groups.map(g => visible.filter(n => n.sec === g.sec).length > 0 && (
          <button key={g.label} onClick={() => setOpenGroup(openGroup === g.label ? null : g.label)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 10px', borderRadius: 10, border: 'none', background: openGroup === g.label || visible.filter(n => n.sec === g.sec).some(i => i.id === page) ? 'rgba(230,57,70,0.2)' : 'none', color: openGroup === g.label || visible.filter(n => n.sec === g.sec).some(i => i.id === page) ? '#E63946' : 'rgba(255,255,255,0.6)', cursor: 'pointer', minWidth: 64, flexShrink: 0, fontSize: 10, fontWeight: 600 }}>
            <span style={{fontSize:18}}>{g.icon}</span>
            {g.label} {openGroup === g.label ? '▲' : '▼'}
          </button>
        ))}
      </div>
      {openGroup && (
        <div style={{ padding: '8px 12px 12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {visible.filter(n => n.sec === groups.find(g => g.label === openGroup)?.sec).map(item => (
            <button key={item.id} onClick={() => { setPage(item.id); setOpenGroup(null) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 8px', borderRadius: 12, border: 'none', background: page === item.id ? 'rgba(230,57,70,0.2)' : 'rgba(255,255,255,0.04)', color: page === item.id ? '#fff' : 'rgba(255,255,255,0.65)', cursor: 'pointer', fontSize: 11, fontWeight: page === item.id ? 700 : 500, boxShadow: page === item.id ? 'inset 0 0 0 1px rgba(230,57,70,0.3)' : 'none', transition: 'all 0.15s ease' }}>
              <span style={{fontSize:22, opacity: page === item.id ? 1 : 0.8}}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Shell({ user, onLogout }) {
  const role = user?.perfil?.roles?.nombre || 'admin'
  const visible = NAV.filter(n => n.roles.includes(role))
  const defaultPage = role === 'bombero' ? 'visitas' : 'dashboard'
  const [page, setPage] = useState(defaultPage)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768)
  const [openGroup, setOpenGroup] = useState(null)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const sections = [...new Set(visible.filter(n => n.sec).map(n => n.sec))]
  const noSec = visible.filter(n => !n.sec)
  const PageComp = PAGES[page] || Dashboard
  const pageLabel = NAV.find(n => n.id === page)?.label || ''
  const nombre = user?.perfil?.nombre || user?.email?.split('@')[0] || 'Usuario'
  const apellido = user?.perfil?.apellido || ''

  return (
    <div className="layout">
      {isMobile && <MobileNav visible={visible} page={page} setPage={setPage} openGroup={openGroup} setOpenGroup={setOpenGroup} onLogout={onLogout} nombre={nombre} apellido={apellido} />}
      {!isMobile && <nav className="sidebar">
        <div className="s-logo">
          <img
            src="/logo.jpg"
            alt="EDUCATRAN"
            style={{
              width: '100%',
              maxWidth: '160px',
              height: 'auto',
              display: 'block',
              margin: '0 auto',
              padding: '8px 12px',
              objectFit: 'contain'
            }}
          />
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
      </nav>}

      <div className="main" style={{ paddingTop: isMobile ? (openGroup ? '120px' : '106px') : 0 }}>
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
