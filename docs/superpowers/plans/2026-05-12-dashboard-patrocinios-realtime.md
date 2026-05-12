# Dashboard Real-time Sponsorships Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the Dashboard to display sponsorship data instead of donations, calculate totals in real-time from the donations table, and display sponsor logos in the top sponsors section.

**Architecture:** 
- Refactor Dashboard calculations to compute totals dynamically from donations table instead of relying on static patronage totals
- Implement a custom hook for calculating sponsor totals in real-time
- Add a helper function to recalculate sponsor totals whenever donations change
- Update text labels to reflect "patrocinios" (sponsorships) instead of "donaciones" (donations)
- Execute SQL to backfill sponsor totals in the database

**Tech Stack:** React, Supabase, SQL

---

## Task 1: Update Dashboard text labels

**Files:**
- Modify: `src/App.jsx:741-782`

- [ ] **Step 1: Update card labels**

In the `statCards` array (around line 741), change:
```javascript
const statCards = [
    { l:'Total Patrocinios',  v:fmt(s.donaciones), sub:`${s.nDon} registrados`,      ico:'💰', bg:'#FEF2F2', page:'donaciones' },
    { l:'Saldo Disponible',  v:fmt(s.saldo),      sub:'Fondos activos',              ico:'💳', bg:'#ECFDF5', vc:'#059669', page:'donaciones' },
    { l:'Total Gastos',      v:fmt(s.gastos),     sub:'Kits + equipos + operativos', ico:'📦', bg:'#EFF6FF', vc:'#2563EB', page:'gastos' },
    { l:'Comisiones Gestores',v:fmt(s.comisiones),sub:'Comisiones pagadas',         ico:'🤝', bg:'#FFFBEB', vc:'#D97706', page:'comisiones' },
    { l:'Kits Entregados',   v:s.kitsEntregados,  sub:`${s.kitsPorEntregar} por entregar`, ico:'🎮', bg:'#F0FDF4', page:'visitas' },
]
```

- [ ] **Step 2: Update section titles**

At line 782, change:
```javascript
<span className="card-t">Ultimos Patrocinios</span>
```

And at line 817, change:
```javascript
<span className="card-t">Ultimas Visitas</span>
```

- [ ] **Step 3: Commit text changes**

```bash
git add src/App.jsx
git commit -m "fix: update dashboard labels to patrocinios terminology"
```

---

## Task 2: Refactor Dashboard calculation logic

**Files:**
- Modify: `src/App.jsx:649-671` (the useEffect load function)

- [ ] **Step 1: Update donation data fetch**

Replace the existing query to include all donations without filtering by state:
```javascript
const rD = await supabase
  .from('donaciones')
  .select('monto,comision_gestor,comision_pagada,estado,fecha_donacion,patrocinadores(nombre_comercial,logo_url),gestores(nombre,apellido)')
  .order('fecha_donacion', { ascending: false })
```

- [ ] **Step 2: Update calculations**

Replace the calculation section (lines 658-664) with:
```javascript
const totDon = (rD.data || []).reduce((a, d) => a + (d.monto || 0), 0)
const recibidas = (rD.data || []).filter(d => d.estado === 'recibida')
const totRecibido = recibidas.reduce((a, d) => a + (d.monto || 0), 0)
const totGas = (rG.data || []).filter(g => g.estado === 'aprobado').reduce((a, g) => a + (g.monto || 0), 0)
const saldo = totRecibido - totGas
const totCom = (rD.data || []).filter(d => d.comision_pagada === true).reduce((a, d) => a + (d.comision_gestor || 0), 0)
const kitsEntregados = (rInv.data || []).filter(r => r.tipo === 'salida').reduce((a, r) => a + r.cantidad, 0)
const kitsPorEntregar = (rV.data || []).filter(v => v.estado === 'programada').reduce((a, v) => a + (v.cantidad_kits_entregados || 0), 0)
```

- [ ] **Step 3: Update state with new totals**

Change the `setS` call to use the new `saldo`:
```javascript
setS({ donaciones:totDon, saldo:saldo, gastos:totGas, comisiones:totCom, kitsEntregados, kitsPorEntregar, nDon:(rD.data||[]).length, nVis:(rV.data||[]).length, nCol:rC.count||0, nEst:rE.count||0 })
```

- [ ] **Step 4: Update latest donations display**

Replace the `setDons` call to show the 5 most recent without status filtering:
```javascript
setDons((rD.data || []).slice(0, 5))
```

- [ ] **Step 5: Test the calculation changes**

Run the dev server and verify:
- "Total Patrocinios" shows all donations (not just received)
- "Saldo Disponible" = received donations - approved expenses
- "Ultimos Patrocinios" shows 5 most recent by date

```bash
npm run dev
```

- [ ] **Step 6: Commit calculation changes**

```bash
git add src/App.jsx
git commit -m "feat: refactor dashboard calculations to use all donations, correct saldo logic"
```

---

## Task 3: Implement real-time sponsor totals in Patrocinadores

**Files:**
- Modify: `src/App.jsx:1126-1160` (Patrocinadores function)

- [ ] **Step 1: Replace useTable with custom hook**

Replace lines 1127-1130 with:
```javascript
const [patData, setPatData] = useState([])
const [loading, setLoading] = useState(true)

const loadPatrocinadores = async () => {
  setLoading(true)
  const [patsRes, donsRes] = await Promise.all([
    supabase.from('patrocinadores').select('*').order('created_at', { ascending: false }),
    supabase.from('donaciones').select('patrocinador_id, monto')
  ])
  
  const totales = {}
  donsRes.data?.forEach(d => {
    if (d.patrocinador_id)
      totales[d.patrocinador_id] = (totales[d.patrocinador_id] || 0) + (d.monto || 0)
  })
  
  setPatData((patsRes.data || []).map(p => ({ ...p, total_donado: totales[p.id] || 0 })))
  setLoading(false)
}

useEffect(() => {
  loadPatrocinadores()
}, [])
```

- [ ] **Step 2: Create reload wrapper function**

Add after the loadPatrocinadores function:
```javascript
const reload = () => loadPatrocinadores()
```

- [ ] **Step 3: Update variable references**

Replace `data` with `patData` in the Page component call (line 1159):
```javascript
return <Page title="Patrocinadores / Marcas" data={patData} loading={loading} reload={reload} cols={cols} addLabel="Nuevo Patrocinador" Form={FmPatrocinador} deleteTable="patrocinadores" exportFn={exportarPatrocinadores} />
```

- [ ] **Step 4: Test in UI**

Run dev server and verify:
- Patrocinadores page loads
- Total_donado values are calculated from donations table
- Totals update correctly

```bash
npm run dev
```

Visit Patrocinadores page and verify numbers match the sum of donations for each sponsor.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: implement real-time sponsor totals calculation from donations"
```

---

## Task 4: Update Dashboard top sponsors to show logos

**Files:**
- Modify: `src/App.jsx:803-815` (Top Patrocinadores section)

- [ ] **Step 1: Modify dashboard sponsor calculation**

In the Dashboard function's useEffect (around line 649), replace the `rP` query with:
```javascript
const rDonPat = await supabase
  .from('donaciones')
  .select('monto, patrocinadores(id, nombre_comercial, logo_url)')
  .not('patrocinador_id', 'is', null)
  .eq('estado', 'recibida')
```

- [ ] **Step 2: Calculate sponsor totals dynamically**

Replace the `setPats` call with:
```javascript
const patMap = {}
rDonPat.data?.forEach(d => {
  const p = d.patrocinadores
  if (!p) return
  if (!patMap[p.id]) patMap[p.id] = { ...p, total: 0 }
  patMap[p.id].total += d.monto || 0
})
const pats = Object.values(patMap).sort((a, b) => b.total - a.total).slice(0, 6)
setPats(pats)
```

- [ ] **Step 3: Update sponsor bar rendering**

Replace the bars map section (lines 807-813) with:
```javascript
{pats.map(p => (
  <div key={p.id} className="bar-r">
    <span className="bar-l">
      {p.logo_url && <img src={p.logo_url} style={{width:18,height:18,objectFit:'contain',marginRight:6,verticalAlign:'middle'}} alt="" />}
      {p.nombre_comercial}
    </span>
    <div className="bar-t"><div className="bar-f" style={{ width:`${((p.total||0)/maxD)*100}%` }} /></div>
    <span className="bar-v">{fmt(p.total)}</span>
  </div>
))}
```

- [ ] **Step 4: Test sponsor logos**

Run dev server and verify:
- Top 6 sponsors appear with logos (if available)
- Logos display correctly with proper sizing
- Totals are calculated from received donations

```bash
npm run dev
```

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: display sponsor logos in dashboard top sponsors section"
```

---

## Task 5: Add helper function for automatic total recalculation

**Files:**
- Modify: `src/App.jsx` (add helper function, update FmDonacion)

- [ ] **Step 1: Add helper function**

Add this function before the FmDonacion component (around line 850):
```javascript
const recalcularTotalPatrocinador = async (patrocinador_id) => {
  if (!patrocinador_id) return
  const { data } = await supabase
    .from('donaciones')
    .select('monto')
    .eq('patrocinador_id', patrocinador_id)
  const total = data?.reduce((s, d) => s + (d.monto || 0), 0) || 0
  await supabase
    .from('patrocinadores')
    .update({ total_donado: total })
    .eq('id', patrocinador_id)
}
```

- [ ] **Step 2: Update FmDonacion onSave**

In the FmDonacion save function (line 884), after the success message, add:
```javascript
await recalcularTotalPatrocinador(f.patrocinador_id)
onSave(initial?.id ? 'Donacion actualizada correctamente' : 'Donacion registrada. Comision al 5% calculada automaticamente.')
```

- [ ] **Step 3: Test recalculation**

Run dev server, add a new donation, and verify:
- After saving a donation, the patron's total_donado updates in the database
- Dashboard top sponsors reflect the new total

```bash
npm run dev
```

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add automatic sponsor total recalculation on donation changes"
```

---

## Task 6: Execute Supabase SQL to backfill sponsor totals

**Files:**
- Execute in Supabase SQL editor

- [ ] **Step 1: Open Supabase SQL editor**

Go to https://supabase.com, open your project, click "SQL Editor"

- [ ] **Step 2: Execute backfill query**

Run this SQL query to calculate and update all sponsor totals based on donations:
```sql
UPDATE patrocinadores p
SET total_donado = COALESCE((
  SELECT SUM(monto) FROM donaciones d 
  WHERE d.patrocinador_id = p.id
), 0);
```

- [ ] **Step 3: Verify results**

Query the database to verify totals are populated:
```sql
SELECT id, nombre_comercial, total_donado FROM patrocinadores LIMIT 10;
```

- [ ] **Step 4: Document SQL execution**

Add a note in git about when this was executed (included in next commit message)

---

## Task 7: Final integration test and commit

**Files:**
- Modified: `src/App.jsx`

- [ ] **Step 1: Full integration test**

Run dev server and verify all changes:
```bash
npm run dev
```

Checklist:
- [ ] Dashboard shows "Total Patrocinios" label
- [ ] Dashboard shows "Saldo Disponible" = received donations - expenses
- [ ] Latest 5 donations shown without status filter
- [ ] Top sponsors display with logos
- [ ] Patrocinadores page shows real-time totals from donations
- [ ] Adding/editing donation updates sponsor total_donado

- [ ] **Step 2: Check for errors**

Verify no console errors in dev tools.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "fix: dashboard patrocinios texts, real-time totals, sponsor auto-sync

- Update all dashboard labels to use 'patrocinios' terminology
- Calculate dashboard totals from all donations (not just received)
- Correct 'saldo' to be received donations minus approved expenses
- Show 5 most recent donations without status filtering
- Display sponsor logos in top sponsors section
- Implement real-time sponsor totals calculation from donations
- Add automatic sponsor total recalculation on donation changes
- Backfilled sponsor totals in database via SQL"
```

- [ ] **Step 4: Push changes**

```bash
git push origin main
```

---

## Verification Checklist

After all tasks complete:

- [ ] All text labels updated to "patrocinios"
- [ ] Dashboard saldo correctly shows received - expenses
- [ ] Top sponsors show logos and real-time totals
- [ ] Patrocinadores page calculates totals from donations
- [ ] Adding donation updates patron's total_donado
- [ ] No console errors in dev tools
- [ ] SQL backfill executed in Supabase
- [ ] All commits pushed to main
