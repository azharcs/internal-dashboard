/* Wireframe screens for non-priority IA items.
   Real layout/structure but lower fidelity — labelled blocks, sketched tables. */

function WireBanner({ children }) {
  return (
    <div className="wf-banner">
      <window.Icon name="sparkles" />
      <span>{children}</span>
    </div>
  );
}

// === Service list (RR / RB / LO / IIQ / RC) =========================
function ServiceScreen({ code }) {
  const svc = window.SERVICES[code];

  // Real: Resume Report uses real RR_ORDERS, others wireframed
  if (code === 'RR') return <RRScreen />;
  if (code === 'RC') return <RCScreen />;
  return <SelfServeScreen code={code} svc={svc} />;
}

function RRScreen() {
  const [stateFilter, setStateFilter] = React.useState([]);
  const orders = window.RR_ORDERS;
  const filtered = stateFilter.length ? orders.filter(o => stateFilter.includes(o.state)) : orders;
  const states = ['Pending draft','Awaiting reviewer','In review','Ready for delivery','Delivered','Cancelled'];
  const stateCounts = {};
  states.forEach(s => stateCounts[s] = orders.filter(o => o.state === s).length);

  const sla = {
    breached: orders.filter(o => o.slaRemainingMin < 0 && !['Delivered','Cancelled'].includes(o.state)).length,
    risk:     orders.filter(o => o.slaRemainingMin >= 0 && o.slaRemainingMin < 6*60 && !['Delivered','Cancelled'].includes(o.state)).length,
    healthy:  orders.filter(o => o.slaRemainingMin >= 6*60 && !['Delivered','Cancelled'].includes(o.state)).length,
  };

  return (
    <div className="page">
      <PageHead title="Resume Report" sub="Manual delivery · ₹99 flat · 48-hour SLA"
        actions={<>

          <button className="btn btn-primary"><window.Icon name="download" /> Download CSV</button>
        </>} />

      <div className="kpi-row mb-4" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <KpiTileMini label="Pending action"  value={orders.filter(o => !['Delivered','Cancelled'].includes(o.state)).length} sub="orders open" />
        <KpiTileMini label="Breached SLA" value={sla.breached} sub="needs intervention" tone="red" />
        <KpiTileMini label="At risk (<6h)" value={sla.risk} sub="flag if >2h" tone="amber" />
        <KpiTileMini label="Healthy" value={sla.healthy} sub="on track" tone="green" />
      </div>

      <div className="list-layout">
        <FilterRail onClear={() => setStateFilter([])}>
          <FilterGroup title="State" options={states} selected={stateFilter} onToggle={(v) => setStateFilter(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v])} counts={stateCounts} />
          <h4>SLA</h4>
          <div className="filter-group">
            <label className="filter-chip"><span className="filter-chip-cb"></span><span>All</span></label>
            <label className="filter-chip"><span className="filter-chip-cb"></span><span>Breached</span></label>
            <label className="filter-chip"><span className="filter-chip-cb"></span><span>At risk (&lt;6h)</span></label>
          </div>
          <h4>Reviewer</h4>
          <div className="filter-group">
            <label className="filter-chip"><span className="filter-chip-cb"></span><span>Unassigned</span></label>
            <label className="filter-chip"><span className="filter-chip-cb"></span><span>Aditi K.</span></label>
            <label className="filter-chip"><span className="filter-chip-cb"></span><span>Vivek M.</span></label>
            <label className="filter-chip"><span className="filter-chip-cb"></span><span>Sana R.</span></label>
          </div>
          <h4>Score range</h4>
          <div style={{ padding: '4px 6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-3)', marginBottom: 4 }}><span>0</span><span>100</span></div>
            <div style={{ height: 4, background: 'var(--bg-alt)', borderRadius: 4, position: 'relative' }}>
              <div style={{ position: 'absolute', left: '20%', right: '20%', top: 0, bottom: 0, background: 'var(--primary)', borderRadius: 4 }}></div>
              <div style={{ position: 'absolute', left: '20%', top: -3, width: 10, height: 10, borderRadius: 999, background: '#fff', border: '2px solid var(--primary)' }}></div>
              <div style={{ position: 'absolute', left: '80%', top: -3, width: 10, height: 10, borderRadius: 999, background: '#fff', border: '2px solid var(--primary)' }}></div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6, textAlign: 'center' }}>20 – 80</div>
          </div>
        </FilterRail>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="left">

              <span className="text-xs text-muted">{filtered.length} orders</span>
            </div>
          </div>
          <table className="tbl">
            <thead><tr><th>Order</th><th>Candidate</th><th>Score</th><th>State</th><th>Reviewer</th><th>Placed</th><th>SLA</th><th></th></tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td className="tnum text-muted">{o.id}</td>
                  <td><div className="av-row"><Avatar initials={o.candidate.avatarInitials} /><div><div className="n">{o.candidate.name}</div><div className="e">{o.candidate.email}</div></div></div></td>
                  <td><ScoreBadge value={o.score} /></td>
                  <td><Pill tone={window.stateTone(o.state)} dot>{o.state}</Pill></td>
                  <td className="muted">{o.reviewer}</td>
                  <td className="muted">{fmtDate(o.placed)}</td>
                  <td><SlaBadge minutesLeft={o.slaRemainingMin} /></td>
                  <td><button className="row-actions"><window.Icon name="more" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RCScreen() {
  const calls = window.RC_CALLS;
  return (
    <div className="page">
      <PageHead title="Recruiter Connect" sub="Manual delivery · ₹1,499 · 30-min recruiter call + post-call report"
        actions={<>
          <button className="btn btn-secondary"><window.Icon name="filter" /> Filters</button>
          <button className="btn btn-primary"><window.Icon name="download" /> Download CSV</button>
        </>} />

      <WireBanner>v1: manual assignment only. No recruiter availability calendar — assign from the row action menu.</WireBanner>

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">All scheduled calls <span className="count">{calls.length}</span></h3>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm">Upcoming</button>
            <button className="btn btn-ghost btn-sm">Awaiting schedule</button>
            <button className="btn btn-ghost btn-sm">Completed</button>
            <button className="btn btn-ghost btn-sm">Reports pending</button>
          </div>
        </div>
        <table className="tbl">
          <thead><tr><th>ID</th><th>Candidate</th><th>Score</th><th>Recruiter</th><th>When</th><th>State</th><th></th></tr></thead>
          <tbody>
            {calls.map(c => (
              <tr key={c.id}>
                <td className="tnum text-muted">{c.id}</td>
                <td><div className="av-row"><Avatar initials={c.candidate.avatarInitials} /><div><div className="n">{c.candidate.name}</div><div className="e">{c.candidate.role}</div></div></div></td>
                <td><ScoreBadge value={c.score} /></td>
                <td className="muted">{c.recruiter}</td>
                <td className="muted">{fmtDateTime(c.when)}</td>
                <td><Pill tone={window.callTone(c.state)} dot>{c.state}</Pill></td>
                <td><button className="row-actions"><window.Icon name="more" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SelfServeScreen({ code, svc }) {
  const sessions = window.CANDIDATES.filter(c => c.svcStates.some(s => s.code === code)).slice(0, 18);
  const sub = code === 'RB' ? 'Self-serve · DIY editor · multi-resume per candidate'
            : code === 'LO' ? 'Self-serve · ₹199 · resume + LinkedIn URL → profile copy'
            : 'Freemium · Free 10-min mock · Paid ₹299 · 45-min mock';
  return (
    <div className="page">
      <PageHead title={svc.name} sub={sub}
        actions={<button className="btn btn-primary"><window.Icon name="download" /> Download CSV</button>} />

      <div className="kpi-row mb-4">
        <KpiTileMini label="Sessions today" value={code === 'RB' ? 47 : code === 'LO' ? 12 : 32} sub="started" />
        <KpiTileMini label="Conversions today" value={code === 'IIQ' ? 11 : 8} sub="paid" tone="green" />
        <KpiTileMini label="Drop-off rate" value={code === 'RB' ? '38%' : code === 'LO' ? '24%' : '52%'} sub="last 7 days" tone="amber" />
        <KpiTileMini label={code === 'IIQ' ? 'Avg score' : 'Avg resume score'} value={code === 'IIQ' ? '72' : code === 'LO' ? '68' : '64'} sub={code === 'IIQ' ? 'across paid mocks' : 'live values'} />
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">{code === 'IIQ' ? 'Mock sessions' : 'Sessions'} <span className="count">{sessions.length}</span></h3>
          <div className="flex gap-2 items-center">
            {code === 'RB' && <span className="live-pulse">Live · 4 active editors</span>}
            <button className="btn btn-ghost btn-sm"><window.Icon name="filter" /> Filter</button>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Candidate</th>
              {code === 'IIQ' && <th>Plan</th>}
              {code !== 'IIQ' && <th>Resume score</th>}
              {code === 'IIQ' && <th>IQ score</th>}
              <th>Latest action</th>
              <th>Last activity</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((c, i) => {
              const live = code === 'RB' && i < 4;
              return (
                <tr key={c.id}>
                  <td><div className="av-row"><Avatar initials={c.avatarInitials} /><div><div className="n">{c.name}</div><div className="e">{c.email}</div></div></div></td>
                  {code === 'IIQ' && <td><PlanPill plan={i % 3 === 0 ? 'paid' : 'free'} /></td>}
                  {code !== 'IIQ' && <td><ScoreBadge value={c.score} live={live} /></td>}
                  {code === 'IIQ' && <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{60 + (i % 4) * 7}</span><span className="text-xs text-muted"> /100</span></td>}
                  <td className="muted">{code === 'RB' ? (live ? 'Editing now' : 'Saved · v' + (1 + i % 3)) : code === 'LO' ? 'Profile generated' : (i % 3 === 0 ? 'Paid mock done' : 'Free mock done')}</td>
                  <td className="muted">{fmtDate(c.lastActive)}</td>
                  <td><button className="row-actions"><window.Icon name="more" /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiTileMini({ label, value, sub, tone }) {
  const c = tone === 'red' ? 'var(--red-strong)' : tone === 'amber' ? 'var(--amber-strong)' : tone === 'green' ? 'var(--green-strong)' : 'var(--fg-1)';
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color: c }}>{value}</div>
      <div className="kpi-meta"><span>{sub}</span></div>
    </div>
  );
}

// === Drop-offs =======================================================
function DropoffsScreen() {
  return (
    <div className="page">
      <PageHead title="Drop-offs" sub="Where candidates pause across all five services. Build cohorts, export, and act."
        actions={<button className="btn btn-primary"><window.Icon name="download" /> Export cohort CSV</button>} />

      <div className="kpi-row mb-4">
        <KpiTileMini label="Total drop-offs · 7d" value={142} sub="all services" tone="amber" />
        <KpiTileMini label="Worst funnel step" value="RB Paywall" sub="38% of drops" />
        <KpiTileMini label="Recoverable estimate" value="₹48,200" sub="if 12% recover" />
        <KpiTileMini label="Open cohorts" value={4} sub="exported, awaiting outreach" />
      </div>

      <div className="card mb-4">
        <div className="card-head">
          <h3 className="card-title">Funnel drop-off by service</h3>
          <span className="text-xs text-muted">Last 30 days</span>
        </div>
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {['RR','RB','LO','IIQ','RC'].map(code => {
            const stages = window.FUNNEL_LABELS[code];
            const counts = stages.map((_, i) => Math.max(20, Math.floor(180 - i * 24 + (i % 2) * 10)));
            return (
              <div key={code}>
                <div className="flex items-center gap-2 mb-3">
                  <SvcChip code={code} />
                  <span className="font-semi text-sm">{window.SERVICES[code].name}</span>
                </div>
                <FunnelBar counts={counts} colors={['#583EF5','#785EF6','#9986F8','#BBADFA','#DCD5FC','#F1EEFE','#F5F5F7']} />
                <div className="flex justify-between text-xs text-muted mt-2">
                  <span>{stages[0]}</span>
                  <span>{stages[stages.length - 1]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="list-layout">
        <FilterRail>
          <FilterGroup title="Service" options={['RR','RB','LO','IIQ','RC']} selected={[]} onToggle={() => {}} />
          <FilterGroup title="Severity" options={[{value:'high',label:'High'},{value:'med',label:'Medium'},{value:'low',label:'Low'}]} selected={[]} onToggle={() => {}} />
          <h4>Time window</h4>
          <div className="filter-group">
            {['Last 24h','Last 7 days','Last 30 days','Custom…'].map(o => (
              <label key={o} className="filter-chip"><span className="filter-chip-cb"></span><span>{o}</span></label>
            ))}
          </div>
          <h4>Cohort status</h4>
          <div className="filter-group">
            <label className="filter-chip"><span className="filter-chip-cb"></span><span>Ready to export</span></label>
            <label className="filter-chip"><span className="filter-chip-cb"></span><span>Already in cohort</span></label>
          </div>
        </FilterRail>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="left">

              <span className="text-xs text-muted">{window.DROPOFFS.length} drops</span>
            </div>
            <button className="btn btn-violet-ghost btn-sm"><window.Icon name="plus" /> Build cohort</button>
          </div>
          <table className="tbl">
            <thead><tr><th>Severity</th><th>Candidate</th><th>Service</th><th>Reason</th><th>Score</th><th>When</th><th></th></tr></thead>
            <tbody>
              {window.DROPOFFS.slice(0, 22).map(d => (
                <tr key={d.id}>
                  <td><span className={`dropoff-sev ${d.severity}`}></span><span className="text-xs cap" style={{ color: 'var(--fg-3)' }}>{d.severity}</span></td>
                  <td><div className="av-row"><Avatar initials={d.candidate.avatarInitials} /><div className="n">{d.candidate.name}</div></div></td>
                  <td><SvcChip code={d.service} state="dropped" /></td>
                  <td className="muted">{d.reason}</td>
                  <td><ScoreBadge value={d.score} /></td>
                  <td className="muted">{fmtDate(d.when)}</td>
                  <td><button className="row-actions"><window.Icon name="more" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// === Offers ==========================================================
function OffersScreen() {
  return (
    <div className="page">
      <PageHead title="Offers" sub="Coupon codes for the team to share via existing channels. The dashboard generates codes; it doesn't send them."
        actions={<>
          <button className="btn btn-secondary"><window.Icon name="download" /> Download redemptions</button>
          <button className="btn btn-primary"><window.Icon name="plus" /> New offer</button>
        </>} />

      <div className="kpi-row mb-4">
        <KpiTileMini label="Live offers" value={window.OFFERS.filter(o => o.status === 'live').length} sub="redeemable today" />
        <KpiTileMini label="Redemptions · 7d" value={48} sub="up 18%" tone="green" />
        <KpiTileMini label="Discount given · 7d" value={fmtINR(8740)} sub="vs. revenue" />
        <KpiTileMini label="Conversion lift" value="+12.4%" sub="vs. no-coupon baseline" tone="green" />
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">All offers <span className="count">{window.OFFERS.length}</span></h3>
        </div>
        <table className="tbl">
          <thead><tr><th>Code</th><th>Label</th><th>Service</th><th>Discount</th><th>Uses</th><th>Valid until</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {window.OFFERS.map(o => (
              <tr key={o.id}>
                <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--primary-800)', background: 'var(--primary-50)', padding: '3px 8px', borderRadius: 4 }}>{o.code}</span></td>
                <td>{o.label}</td>
                <td>{o.service === 'all' ? <Pill tone="grey">All</Pill> : <SvcChip code={o.service} />}</td>
                <td className="font-semi">{o.discount}</td>
                <td className="tnum">{o.uses}{o.cap ? ` / ${o.cap}` : ''}</td>
                <td className="muted">{fmtDate(o.validUntil)}</td>
                <td><Pill tone={o.status === 'live' ? 'green' : o.status === 'ending' ? 'amber' : 'grey'} dot>{o.status[0].toUpperCase() + o.status.slice(1)}</Pill></td>
                <td><button className="row-actions"><window.Icon name="more" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// === Reports =========================================================
function ReportsScreen() {
  return (
    <div className="page">
      <PageHead title="Reports" sub="Pre-built and saved analyses across services." />

      <WireBanner>Wireframe — full report builder coming in v2. v1 ships with the saved views below.</WireBanner>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {[
          { t: 'Revenue by service', s: 'Daily, weekly, monthly', i: 'bar-chart' },
          { t: 'Score progression', s: 'Average score across reviewer / cohort', i: 'gauge' },
          { t: 'Funnel velocity', s: 'Time-to-paid by entry funnel', i: 'pulse' },
          { t: 'SLA compliance', s: 'Resume Report · Recruiter Connect', i: 'clock' },
          { t: 'Reviewer throughput', s: 'Orders / day per reviewer', i: 'user' },
          { t: 'Coupon attribution', s: 'Lift vs. baseline by code', i: 'tag' },
        ].map((r, i) => (
          <div key={i} className="card card-pad" style={{ cursor: 'pointer' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary-50)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <window.Icon name={r.i} size={18} style={{ stroke: 'var(--primary)' }} />
            </div>
            <div className="font-semi" style={{ fontSize: 14, color: 'var(--fg-1)' }}>{r.t}</div>
            <div className="text-xs text-muted mt-2">{r.s}</div>
            <div style={{ marginTop: 14, height: 48 }}>
              <Sparkline values={[3,5,4,7,6,8,9,7,10,11,9,12].map(v => v + i)} color="var(--primary)" height={48} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// === Audit log =======================================================
function AuditScreen() {
  const events = [
    { actor: 'Sushant V.', action: 'changed lifecycle', target: 'Aarav Mehta · engaged → paid', when: window.relDate(0, 9, 0) },
    { actor: 'Aditi K.', action: 'marked resume as final', target: 'Priya Iyer · v3', when: window.relDate(0, 11, 14) },
    { actor: 'System', action: 'auto-assigned reviewer', target: 'RR-5418 → Aditi K.', when: window.relDate(0, 11, 13) },
    { actor: 'Vivek M.', action: 'generated coupon', target: 'ROHA RR20 · ₹99 off Resume Report', when: window.relDate(0, 14, 22) },
    { actor: 'Sushant V.', action: 'flagged for refund', target: 'RR-5402 · Quality concern', when: window.relDate(1, 10, 5) },
    { actor: 'Sana R.', action: 'added tag', target: 'Kabir Khanna · GCC-target', when: window.relDate(1, 16, 0) },
    { actor: 'Tanmay G.', action: 'exported cohort', target: 'RB Paywall — last 7 days · 38 candidates', when: window.relDate(2, 9, 30) },
    { actor: 'System', action: 'created offer', target: 'RBPRO20 · 20% off Resume Builder · 200 cap', when: window.relDate(3, 11, 0) },
  ];
  return (
    <div className="page">
      <PageHead title="Audit log" sub="Every action by every user, system events included. Read-only."
        actions={<button className="btn btn-secondary"><window.Icon name="download" /> Download CSV</button>} />
      <div className="card">
        <div className="card-head">
          <div className="flex gap-2 items-center">
            <input className="t500-input" placeholder="Filter by user, action, or target…" style={{ width: 320, height: 32, fontSize: 13 }} />
            <select style={{ height: 32, fontSize: 13, padding: '0 10px', borderRadius: 6, border: '1px solid var(--border-1)' }}><option>All actions</option></select>
            <select style={{ height: 32, fontSize: 13, padding: '0 10px', borderRadius: 6, border: '1px solid var(--border-1)' }}><option>Last 7 days</option></select>
          </div>
        </div>
        <table className="tbl">
          <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Target</th><th></th></tr></thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={i}>
                <td className="muted tnum">{fmtDateTime(e.when)}</td>
                <td><div className="av-row"><Avatar initials={e.actor === 'System' ? 'SY' : e.actor.split(' ').map(p => p[0]).join('').slice(0,2)} /><div className="n">{e.actor}</div></div></td>
                <td className="text-sm" style={{ color: 'var(--fg-2)' }}>{e.action}</td>
                <td className="text-sm font-semi">{e.target}</td>
                <td><button className="row-actions"><window.Icon name="more" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// === Settings ========================================================
function SettingsScreen() {
  const [tab, setTab] = React.useState('team');
  const tabs = [
    { id: 'team',         label: 'Team & Access',   icon: 'users' },
    { id: 'workspace',    label: 'Workspace',        icon: 'briefcase' },
    { id: 'services',     label: 'Services',         icon: 'tag' },
    { id: 'sla',          label: 'SLA & Defaults',   icon: 'clock' },
    { id: 'integrations', label: 'Integrations',     icon: 'external' },
  ];
  const wireframeSections = {
    workspace:    { items: ['Workspace name','Time zone','Currency display','Date format'] },
    services:     { items: ['Resume Report pricing','Resume Builder paywall','Interview IQ free → paid threshold','RC pricing','MRR base pricing'] },
    sla:          { items: ['RR SLA window','RC scheduling window','Drop-off severity rules','MRR turnaround target'] },
    integrations: { items: ['Payment gateway','Slack notifications (read-only digest)','Webhooks','Score calculation API'] },
  };

  return (
    <div className="page">
      <PageHead title="Settings" />
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-1)', marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', border: 'none', borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? 'var(--primary)' : 'var(--fg-3)', marginBottom: -1 }}>
            <window.Icon name={t.icon} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'team' && <window.TeamAccessTab />}

      {tab !== 'team' && (
        <>
          <WireBanner>Wireframe — {tabs.find(t => t.id === tab)?.label} settings</WireBanner>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginTop: 16 }}>
            {(wireframeSections[tab]?.items || []).map((it, j) => (
              <div key={j} className="card card-pad flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--fg-2)' }}>{it}</span>
                <window.Icon name="chevron-right" size={14} style={{ stroke: 'var(--fg-4)' }} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

window.ServiceScreen = ServiceScreen;
window.DropoffsScreen = DropoffsScreen;
window.OffersScreen = OffersScreen;
window.ReportsScreen = ReportsScreen;
window.AuditScreen = AuditScreen;
window.SettingsScreen = SettingsScreen;
