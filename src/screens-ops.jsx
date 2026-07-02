/* Hi-fi Drop-offs, Offers, Cohort Export, Service Catalog — replaces wireframe versions */
const { Icon, Pill, ScoreBadge, SvcChip, Avatar, Currency, FilterRail, FilterGroup,
        FunnelBar, Sparkline, PageHead, CodePreview, fmtINR, fmtDate, fmtDateTime, relDate } = window;

function MiniKpi({ label, value, sub, tone }) {
  const c = tone === 'red' ? 'var(--red-strong)' : tone === 'amber' ? 'var(--amber-strong)' : tone === 'green' ? 'var(--green-strong)' : 'var(--fg-1)';
  return <div className="kpi"><div className="kpi-label">{label}</div><div className="kpi-value" style={{ color: c }}>{value}</div><div className="kpi-meta"><span>{sub}</span></div></div>;
}

// ── DROP-OFFS ─────────────────────────────────────────────────────────
function DropoffsScreen({ go }) {
  const [scoreMin, setScoreMin] = React.useState(0);
  const [scoreMax, setScoreMax] = React.useState(100);
  const [svcFilter, setSvcFilter] = React.useState([]);
  const [sevFilter, setSevFilter] = React.useState([]);
  const allDrops = window.DROPOFFS;
  let filtered = allDrops;
  if (svcFilter.length) filtered = filtered.filter(d => svcFilter.includes(d.service));
  if (sevFilter.length) filtered = filtered.filter(d => sevFilter.includes(d.severity));
  filtered = filtered.filter(d => d.score == null || (d.score >= scoreMin && d.score <= scoreMax));

  const since = (days) => allDrops.filter(d => (Date.now() - d.when) / 86400000 <= days);
  const codes = ['RR','RB','LO','IIQ','RC'];
  const cohort24 = since(1), cohort7 = since(7), cohort30 = since(30);

  return (
    <div className="page">
      <PageHead title="Drop-offs" sub="Where candidates pause across all five services. Build cohorts, generate codes, hand off to outreach."
        actions={<>

          <button className="btn btn-primary" onClick={() => go && go({ id: 'cohort-export' })}><Icon name="download" /> Export cohort</button>
        </>} />

      {/* Cohort tiles per service */}
      <div className="card mb-4">
        <div className="card-head"><h3 className="card-title">Drop-off cohorts</h3><span className="text-xs text-muted">Last 24h · 7d · 30d</span></div>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
          {codes.map(c => {
            const d24 = cohort24.filter(x => x.service === c).length;
            const d7 = cohort7.filter(x => x.service === c).length;
            const d30 = cohort30.filter(x => x.service === c).length;
            return (
              <div key={c} style={{ padding: 14, background: 'var(--bg-alt)', borderRadius: 8, border: '1px solid var(--border-1)' }}>
                <div className="flex items-center gap-2 mb-3"><SvcChip code={c} state="dropped" /><span className="text-xs font-semi">{window.SERVICES[c].name}</span></div>
                <div className="flex justify-between text-sm mb-1"><span className="text-muted">24h</span><span className="font-semi tnum">{d24}</span></div>
                <div className="flex justify-between text-sm mb-1"><span className="text-muted">7d</span><span className="font-semi tnum">{d7}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted">30d</span><span className="font-semi tnum">{d30}</span></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Funnel breakdown per service */}
      <div className="card mb-4">
        <div className="card-head"><h3 className="card-title">Funnel breakdown by service</h3><span className="text-xs text-muted">Drops at each stage · last 30d</span></div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {codes.map(c => {
            const stages = window.FUNNEL_LABELS[c];
            const counts = stages.map((_, i) => Math.max(8, Math.floor(220 - i * 32 + (i%2)*8)));
            const max = Math.max(...counts);
            return (
              <div key={c}>
                <div className="flex items-center gap-2 mb-2"><SvcChip code={c} /><span className="font-semi text-sm">{window.SERVICES[c].name}</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {stages.map((s, i) => {
                    const conv = i > 0 ? Math.round((counts[i] / counts[i-1]) * 100) : null;
                    return (
                      <div key={s} className="flex items-center gap-3" style={{ fontSize: 11 }}>
                        <span style={{ width: 130, color: 'var(--fg-2)' }}>{s}</span>
                        <div style={{ flex: 1, height: 18, background: 'var(--bg-alt)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: (counts[i] / max * 100) + '%', height: '100%', background: `var(--primary)`, opacity: 1 - i*0.13 }}></div>
                        </div>
                        <span className="tnum font-semi" style={{ width: 36, textAlign: 'right' }}>{counts[i]}</span>
                        <span className="text-xs text-muted" style={{ width: 36, textAlign: 'right' }}>{conv != null ? conv + '%' : '—'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dropped sessions table */}
      <div className="list-layout">
        <FilterRail onClear={() => { setSvcFilter([]); setSevFilter([]); setScoreMin(0); setScoreMax(100); }}>
          <FilterGroup title="Service" options={codes.map(c => ({value:c, label: window.SERVICES[c].name}))} selected={svcFilter} onToggle={v => setSvcFilter(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v])} />
          <FilterGroup title="Severity" options={[{value:'high',label:'High'},{value:'med',label:'Medium'},{value:'low',label:'Low'}]} selected={sevFilter} onToggle={v => setSevFilter(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v])} />
          <h4>Resume score range</h4>
          <div style={{ padding: '4px 6px' }}>
            <div className="flex justify-between text-xs text-muted mb-2"><span>{scoreMin}</span><span>{scoreMax}</span></div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input type="number" value={scoreMin} min={0} max={100} onChange={e => setScoreMin(+e.target.value)} className="t500-input" style={{ width: '50%', height: 28, padding: '0 8px', fontSize: 12 }} />
              <input type="number" value={scoreMax} min={0} max={100} onChange={e => setScoreMax(+e.target.value)} className="t500-input" style={{ width: '50%', height: 28, padding: '0 8px', fontSize: 12 }} />
            </div>
            <div className="flex gap-1 mt-2">
              {[['<50','red'],['50–70','amber'],['>70','green']].map(([l,t]) => (
                <button key={l} className="filter-chip" style={{ flex: 1, justifyContent: 'center', fontSize: 11 }} onClick={() => { if (l==='<50') {setScoreMin(0); setScoreMax(49);} else if (l==='50–70') {setScoreMin(50); setScoreMax(70);} else {setScoreMin(71); setScoreMax(100);} }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: `var(--${t}-strong)` }}></span>{l}
                </button>
              ))}
            </div>
          </div>
          <h4>Time window</h4>
          <div className="filter-group">
            {['Last 24h','Last 7 days','Last 30 days'].map(o => <label key={o} className="filter-chip"><span className="filter-chip-cb"></span><span>{o}</span></label>)}
          </div>
        </FilterRail>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="left">

              <span className="text-xs text-muted">{filtered.length} of {allDrops.length}</span>
            </div>
            <button className="btn btn-violet-ghost btn-sm" onClick={() => go && go({ id: 'cohort-export' })}><Icon name="plus" /> Build cohort</button>
          </div>
          <table className="tbl">
            <thead><tr><th>Severity</th><th>Candidate</th><th>Service</th><th>Drop stage</th><th>Last activity</th><th>Score</th><th></th></tr></thead>
            <tbody>
              {filtered.slice(0, 24).map(d => (
                <tr key={d.id}>
                  <td><span className={`dropoff-sev ${d.severity}`}></span><span className="text-xs cap" style={{ color: 'var(--fg-3)' }}>{d.severity}</span></td>
                  <td><div className="av-row"><Avatar initials={d.candidate.avatarInitials} /><div className="n">{d.candidate.name}</div></div></td>
                  <td><SvcChip code={d.service} state="dropped" /></td>
                  <td className="text-sm">{d.reason}</td>
                  <td className="muted">{fmtDate(d.when)}</td>
                  <td><ScoreBadge value={d.score} /></td>
                  <td><button className="row-actions"><Icon name="more" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── COHORT EXPORT FLOW ────────────────────────────────────────────────
function CohortExportScreen({ go }) {
  const [step, setStep] = React.useState(1);
  const [attachCoupon, setAttachCoupon] = React.useState(false);
  const [discount, setDiscount] = React.useState({ kind: '%', value: 20 });
  const [expiry, setExpiry] = React.useState(7);
  const [services, setServices] = React.useState(['RB']);

  const drops = window.DROPOFFS.filter(d => services.includes(d.service)).slice(0, 38);
  const sample = drops.slice(0, 6);
  const cohortName = 'RB Paywall — last 7 days';

  const Step = ({ n, title, sub }) => (
    <div className="flex items-center gap-2 flex-1">
      <div style={{ width: 24, height: 24, borderRadius: 99, background: step >= n ? 'var(--primary)' : 'var(--bg-alt)', color: step >= n ? '#fff' : 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{step > n ? <Icon name="check" size={12} style={{ stroke: '#fff' }} /> : n}</div>
      <div><div className="text-sm font-semi" style={{ color: step >= n ? 'var(--fg-1)' : 'var(--fg-3)' }}>{title}</div><div className="text-xs text-muted">{sub}</div></div>
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 920, margin: '0 auto' }}>
      <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--fg-3)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => go && go({ id: 'dropoffs' })} style={{ padding: '0 8px' }}><Icon name="chevron-left" /> Drop-offs</button>
        <span>›</span><span className="font-semi" style={{ color: 'var(--fg-1)' }}>Export cohort</span>
      </div>
      <PageHead title="Export cohort" sub="Generate a CSV (and optional unique coupon codes) for outreach via your existing channels." />

      <div className="card mb-4">
        <div style={{ padding: 18, display: 'flex', gap: 14, borderBottom: '1px solid var(--border-1)' }}>
          <Step n={1} title="Review cohort" sub="who's in it" />
          <Step n={2} title="Attach coupons" sub="optional" />
          <Step n={3} title="Confirm" sub="& download" />
          <Step n={4} title="Done" sub="" />
        </div>
        <div style={{ padding: 24 }}>
          {step === 1 && <>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Review cohort</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
              <div style={{ padding: 14, background: 'var(--bg-alt)', borderRadius: 8 }}><div className="text-xs cap" style={{ color: 'var(--fg-3)' }}>Cohort</div><div className="font-semi text-sm mt-1">{cohortName}</div></div>
              <div style={{ padding: 14, background: 'var(--bg-alt)', borderRadius: 8 }}><div className="text-xs cap" style={{ color: 'var(--fg-3)' }}>Candidates</div><div className="font-semi mt-1" style={{ fontSize: 22, fontFamily: 'var(--font-display)' }}>{drops.length}</div></div>
              <div style={{ padding: 14, background: 'var(--bg-alt)', borderRadius: 8 }}><div className="text-xs cap" style={{ color: 'var(--fg-3)' }}>Avg score</div><div className="font-semi mt-1" style={{ fontSize: 22, fontFamily: 'var(--font-display)' }}>{Math.round(drops.filter(d => d.score).reduce((s,d) => s+d.score,0) / drops.filter(d => d.score).length) || '—'}</div></div>
            </div>
            <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Sample (6 of {drops.length})</div>
            <table className="tbl"><thead><tr><th>Candidate</th><th>Email</th><th>Service</th><th>Drop stage</th><th>Score</th></tr></thead><tbody>
              {sample.map(d => <tr key={d.id}><td><div className="av-row"><Avatar initials={d.candidate.avatarInitials} /><div className="n">{d.candidate.name}</div></div></td><td className="text-sm muted">{d.candidate.email}</td><td><SvcChip code={d.service} state="dropped" /></td><td className="text-sm">{d.reason}</td><td><ScoreBadge value={d.score} /></td></tr>)}
            </tbody></table>
          </>}
          {step === 2 && <>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Attach coupons</h3>
            <p className="text-sm text-muted" style={{ marginBottom: 16 }}>Optional. If on, the system generates one unique personal code per candidate and includes it in the CSV.</p>
            <label className="flex items-center gap-3" style={{ padding: 14, border: '1px solid var(--border-1)', borderRadius: 8, marginBottom: 16, cursor: 'pointer' }}>
              <input type="checkbox" checked={attachCoupon} onChange={e => setAttachCoupon(e.target.checked)} />
              <div><div className="font-semi text-sm">Generate unique personal codes</div><div className="text-xs text-muted">e.g. RBPRO20-AAR3F2 · one per candidate · single use</div></div>
            </label>
            {attachCoupon && (
              <div style={{ padding: 18, background: 'var(--bg-alt)', borderRadius: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Discount</div>
                  <div className="flex gap-2">
                    <select value={discount.kind} onChange={e => setDiscount({...discount, kind: e.target.value})} style={{ height: 32, padding: '0 8px', borderRadius: 6, border: '1px solid var(--border-1)' }}><option>%</option><option>₹</option></select>
                    <input type="number" value={discount.value} onChange={e => setDiscount({...discount, value: +e.target.value})} className="t500-input" style={{ flex: 1, height: 32, padding: '0 8px' }} />
                  </div>
                </div>
                <div><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Expires in (days)</div>
                  <input type="number" value={expiry} onChange={e => setExpiry(+e.target.value)} className="t500-input" style={{ width: '100%', height: 32, padding: '0 8px' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Applicable services</div>
                  <div className="flex gap-2">{['RR','RB','LO','IIQ','RC'].map(c => {
                    const on = services.includes(c);
                    return <button key={c} className={`filter-chip ${on ? 'is-on' : ''}`} onClick={() => setServices(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c])}><SvcChip code={c} /></button>;
                  })}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Sample generated codes</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: '#fff', padding: 12, borderRadius: 6, border: '1px solid var(--border-1)' }}>
                    RBPRO20-AAR3F2 · RBPRO20-PRY8K1 · RBPRO20-ROH9M4 · RBPRO20-ANY2X7 · …
                  </div>
                </div>
              </div>
            )}
          </>}
          {step === 3 && <>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Confirm</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Cohort', cohortName],['Candidates', drops.length],['Coupons', attachCoupon ? `Yes · ${discount.value}${discount.kind} off · ${expiry}d expiry` : 'None'],['Services', services.join(', ')],['CSV columns', 'name, email, phone, service, drop stage, last activity, resume score' + (attachCoupon ? ', coupon code' : '')]].map(([l,v]) => (
                <div key={l} className="flex justify-between" style={{ padding: '12px 14px', background: 'var(--bg-alt)', borderRadius: 6 }}><span className="text-sm text-muted">{l}</span><span className="font-semi text-sm">{v}</span></div>
              ))}
            </div>
            <div style={{ background: 'var(--primary-50)', padding: 12, borderRadius: 6, marginTop: 16, fontSize: 13, color: 'var(--primary-800)', display: 'flex', alignItems: 'center', gap: 10 }}><Icon name="info" size={14} style={{ stroke: 'var(--primary)' }} />The dashboard generates the CSV. Outreach happens through your existing channels.</div>
          </>}
          {step === 4 && <>
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: 99, background: 'var(--green-soft)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon name="check" size={28} style={{ stroke: 'var(--green-strong)' }} /></div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Cohort exported</h3>
              <p className="text-sm text-muted" style={{ marginBottom: 24 }}>Logged in <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--primary-800)' }}>Cohort Exports history</a> · CX-2026-0142</p>
              <a href="#" onClick={e => e.preventDefault()} className="btn btn-primary"><Icon name="download" /> Download {cohortName.replace(/\s+/g,'_')}_{drops.length}c.csv</a>
            </div>
          </>}
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-1)', display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-ghost" onClick={() => step === 1 ? go && go({ id: 'dropoffs' }) : setStep(step - 1)}>{step === 1 ? 'Cancel' : 'Back'}</button>
          {step < 4 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>{step === 3 ? 'Generate & download' : 'Continue'}</button> : <button className="btn btn-secondary" onClick={() => go && go({ id: 'dropoffs' })}>Back to drop-offs</button>}
        </div>
      </div>
    </div>
  );
}

// ── OFFERS LIST ───────────────────────────────────────────────────────
function OffersScreen({ go }) {
  const [tab, setTab] = React.useState('Active');
  const [copied, setCopied] = React.useState(null);
  const all = window.OFFERS.map(o => ({
    ...o,
    type: ['OFF-201','OFF-203'].includes(o.id) ? 'Campaign' : 'Personal',
    revenue: 1000 + (o.uses * (o.discount.includes('₹') ? +o.discount.replace(/[₹]/g,'') * 5 : 80)),
  }));
  const tabFilter = (o) => tab === 'All' ? true : tab === 'Active' ? o.status === 'live' : tab === 'Scheduled' ? o.status === 'paused' : o.status === 'ending' || o.uses >= (o.cap || 1e9);
  const filtered = all.filter(tabFilter);

  return (
    <div className="page">
      <PageHead title="Offers" sub="Coupon codes for the team to share via existing channels. Dashboard generates codes; outreach happens elsewhere."
        actions={<>
          <button className="btn btn-secondary"><Icon name="download" /> Download redemptions</button>
          <button className="btn btn-primary" onClick={() => go && go({ id: 'offer-create' })}><Icon name="plus" /> New offer</button>
        </>} />

      <div className="kpi-row mb-4">
        <MiniKpi label="Live offers" value={all.filter(o => o.status === 'live').length} sub="redeemable today" />
        <MiniKpi label="Redemptions · 7d" value={48} sub="up 18%" tone="green" />
        <MiniKpi label="Discount given · 7d" value={fmtINR(8740)} sub="vs. revenue" />
        <MiniKpi label="Conversion lift" value="+12.4%" sub="vs. baseline" tone="green" />
      </div>

      <div className="card mb-4">
        <div className="card-head">
          <div className="flex gap-1">
            {['Active','Scheduled','Expired','All'].map(t => (
              <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t)}>{t} <span style={{ opacity: 0.7, marginLeft: 4 }}>{t === 'All' ? all.length : all.filter(o => (t === 'Active' ? o.status === 'live' : t === 'Scheduled' ? o.status === 'paused' : o.status === 'ending')).length}</span></button>
            ))}
          </div>
          <span className="text-xs text-muted">{filtered.length} offers</span>
        </div>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {filtered.map(o => {
            const used = o.uses, cap = o.cap || 1000;
            const pct = Math.min(100, (used / cap) * 100);
            return (
              <div key={o.id} className="card" style={{ borderTop: '3px solid var(--primary)', cursor: 'pointer', padding: 16 }} onClick={() => go && go({ id: 'offer-detail', offerId: o.id })}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--primary-800)', background: 'var(--primary-50)', padding: '4px 10px', borderRadius: 4 }} onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(o.code); setCopied(o.id); setTimeout(() => setCopied(null), 1500); }} title="Copy">
                    {o.code} {copied === o.id ? <Icon name="check" size={11} style={{ stroke: 'var(--green-strong)' }} /> : <Icon name="tag" size={10} />}
                  </span>
                  <Pill tone={o.status === 'live' ? 'green' : o.status === 'ending' ? 'amber' : 'grey'} dot>{o.status[0].toUpperCase() + o.status.slice(1)}</Pill>
                </div>
                <div className="text-sm" style={{ color: 'var(--fg-1)', fontWeight: 500, marginBottom: 8 }}>{o.label}</div>
                <div className="flex items-center gap-2 mb-3">
                  <Pill tone={o.type === 'Personal' ? 'blue' : 'violet'}>{o.type}</Pill>
                  <span className="text-xs font-semi" style={{ color: 'var(--fg-2)' }}>{o.discount} off</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {o.service === 'all' ? <Pill tone="grey">All services</Pill> : <SvcChip code={o.service} />}
                </div>
                <div className="flex justify-between text-xs mb-1"><span className="text-muted">Redeemed</span><span className="font-semi tnum">{used} / {o.cap || '∞'}</span></div>
                <div style={{ height: 4, background: 'var(--bg-alt)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{ width: pct + '%', height: '100%', background: pct >= 80 ? 'var(--amber-strong)' : 'var(--primary)' }}></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Valid until {fmtDate(o.validUntil)}</span>
                  <span className="font-semi" style={{ color: 'var(--green-strong)' }}>{fmtINR(o.revenue)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── CREATE OFFER ──────────────────────────────────────────────────────
function OfferCreateScreen({ go }) {
  const [type, setType] = React.useState('Campaign');
  const [discountKind, setDiscountKind] = React.useState('%');
  const [discount, setDiscount] = React.useState(20);
  const [maxCap, setMaxCap] = React.useState(200);
  const [minOrder, setMinOrder] = React.useState(0);
  const [services, setServices] = React.useState(['RB']);
  const [code, setCode] = React.useState('NEWOFFER20');
  const [bulk, setBulk] = React.useState(false);
  const [bulkCount, setBulkCount] = React.useState(50);
  const [bulkPattern, setBulkPattern] = React.useState('RBPRO20-{xxxx}');
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState('');
  const [saved, setSaved] = React.useState(false);

  const blocked = (discountKind === '%' && discount > 90);
  const needsConfirm = (discountKind === '%' && discount > 50);
  const sampleCodes = Array.from({ length: 5 }, (_, i) => bulkPattern.replace('{xxxx}', Math.random().toString(36).slice(2,6).toUpperCase()));

  const handleSave = () => {
    if (blocked) return;
    if (needsConfirm && !showConfirm) { setShowConfirm(true); return; }
    if (needsConfirm && confirmText !== String(discount)) return;
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="page" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 99, background: 'var(--green-soft)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon name="check" size={28} style={{ stroke: 'var(--green-strong)' }} /></div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Offer saved</h2>
          {!bulk ? <>
            <p className="text-sm text-muted" style={{ marginBottom: 16 }}>Single code · ready to share</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--primary-50)', borderRadius: 8, marginBottom: 16 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--primary-800)' }}>{code}</span>
              <button className="btn btn-primary btn-sm" onClick={() => navigator.clipboard?.writeText(code)}><Icon name="tag" size={12} /> Copy</button>
            </div>
            <div className="text-xs text-muted">For campaigns: <span style={{ fontFamily: 'var(--font-mono)' }}>https://talent500.com/?coupon={code}</span></div>
          </> : <>
            <p className="text-sm text-muted" style={{ marginBottom: 16 }}>{bulkCount} codes generated</p>
            <button className="btn btn-primary"><Icon name="download" /> Download CSV</button>
          </>}
          <div style={{ marginTop: 24 }}><button className="btn btn-ghost" onClick={() => go && go({ id: 'offers' })}>Back to offers</button></div>
        </div>
      </div>
    );
  }

  const Section = ({ title, children }) => (
    <div className="card mb-4"><div className="card-head"><h3 className="card-title">{title}</h3></div><div style={{ padding: 20 }}>{children}</div></div>
  );

  return (
    <div className="page" style={{ maxWidth: 820, margin: '0 auto' }}>
      <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--fg-3)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => go && go({ id: 'offers' })} style={{ padding: '0 8px' }}><Icon name="chevron-left" /> Offers</button>
        <span>›</span><span className="font-semi" style={{ color: 'var(--fg-1)' }}>New offer</span>
      </div>
      <PageHead title="Create offer" sub="Generate a coupon code (or bulk batch). Outreach via existing channels." />

      <Section title="Type">
        <div className="flex gap-2">
          {['Personal','Campaign'].map(t => (
            <button key={t} className={`filter-chip ${type === t ? 'is-on' : ''}`} onClick={() => setType(t)} style={{ flex: 1, justifyContent: 'center' }}>
              <span className="filter-chip-cb">{type === t && <Icon name="check" size={9} />}</span>
              <div style={{ textAlign: 'left' }}><div className="font-semi text-sm">{t}</div><div className="text-xs text-muted">{t === 'Personal' ? 'one user · unique code' : 'shared link · cap controls volume'}</div></div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Discount">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <div><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Type</div>
            <div className="flex gap-1">{['%','₹'].map(k => <button key={k} className={`filter-chip ${discountKind === k ? 'is-on' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setDiscountKind(k)}>{k}</button>)}</div>
          </div>
          <div><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Value</div>
            <input type="number" value={discount} onChange={e => setDiscount(+e.target.value)} className="t500-input" style={{ width: '100%', height: 32, padding: '0 8px' }} />
          </div>
          {discountKind === '%' && <div><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Max discount cap (₹)</div>
            <input type="number" value={maxCap} onChange={e => setMaxCap(+e.target.value)} className="t500-input" style={{ width: '100%', height: 32, padding: '0 8px' }} />
          </div>}
          <div style={{ gridColumn: '1 / -1' }}><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Min order value (₹)</div>
            <input type="number" value={minOrder} onChange={e => setMinOrder(+e.target.value)} className="t500-input" style={{ width: 200, height: 32, padding: '0 8px' }} />
          </div>
        </div>
        {blocked && <div style={{ background: 'var(--red-soft)', padding: 10, borderRadius: 6, marginTop: 12, fontSize: 13, color: 'var(--red-strong)', display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="alert" size={14} style={{ stroke: 'var(--red-strong)' }} /> Discounts &gt;90% are blocked. Set a lower value or contact admin.</div>}
        {needsConfirm && !blocked && <div style={{ background: 'var(--amber-soft)', padding: 10, borderRadius: 6, marginTop: 12, fontSize: 13, color: 'var(--amber-strong)', display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="alert" size={14} style={{ stroke: 'var(--amber-strong)' }} /> Discount &gt;50%. You'll be asked to confirm by typing the value.</div>}
      </Section>

      <Section title="Scope">
        <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Applicable services & tiers</div>
        <div className="flex gap-2 flex-wrap">{['RR','RB','LO','IIQ','RC'].map(c => {
          const on = services.includes(c);
          return <button key={c} className={`filter-chip ${on ? 'is-on' : ''}`} onClick={() => setServices(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c])}><span className="filter-chip-cb">{on && <Icon name="check" size={9} />}</span><SvcChip code={c} /><span className="text-sm">{window.SERVICES[c].name}</span></button>;
        })}</div>
      </Section>

      <Section title="Validity">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Start (IST)</div><input type="datetime-local" defaultValue="2026-05-08T00:00" className="t500-input" style={{ width: '100%', height: 32, padding: '0 8px' }} /></div>
          <div><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>End (IST)</div><input type="datetime-local" defaultValue="2026-05-15T23:59" className="t500-input" style={{ width: '100%', height: 32, padding: '0 8px' }} /></div>
        </div>
      </Section>

      <Section title="Limits">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Total redemption cap</div><input type="number" defaultValue="500" className="t500-input" style={{ width: '100%', height: 32, padding: '0 8px' }} /></div>
          <div><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Per-user cap</div><input type="number" defaultValue="1" className="t500-input" style={{ width: '100%', height: 32, padding: '0 8px' }} /></div>
        </div>
      </Section>

      <Section title="Code">
        <label className="flex items-center gap-3 mb-3"><input type="checkbox" checked={bulk} onChange={e => setBulk(e.target.checked)} /><span className="text-sm">Generate bulk batch (one code per candidate)</span></label>
        {!bulk ? <>
          <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Code</div>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="t500-input" style={{ width: 280, height: 32, padding: '0 10px', fontFamily: 'var(--font-mono)', fontWeight: 600 }} />
        </> : <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Pattern</div><input value={bulkPattern} onChange={e => setBulkPattern(e.target.value)} className="t500-input" style={{ width: '100%', height: 32, padding: '0 10px', fontFamily: 'var(--font-mono)' }} /></div>
            <div><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Count</div><input type="number" value={bulkCount} onChange={e => setBulkCount(+e.target.value)} className="t500-input" style={{ width: '100%', height: 32, padding: '0 10px' }} /></div>
          </div>
          <div className="text-xs cap mb-2 mt-3" style={{ color: 'var(--fg-3)' }}>Sample preview</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--bg-alt)', padding: 12, borderRadius: 6 }}>{sampleCodes.join(' · ')} · …</div>
        </>}
      </Section>

      <Section title="Review & save">
        <p className="text-sm text-muted" style={{ marginBottom: 12 }}>Review all sections above. Saving creates the offer (or batch) and logs to the audit log.</p>
        {showConfirm && needsConfirm && (
          <div style={{ background: 'var(--amber-soft)', padding: 14, borderRadius: 8, marginBottom: 12 }}>
            <div className="text-sm font-semi" style={{ color: 'var(--amber-strong)', marginBottom: 8 }}>Confirm large discount</div>
            <p className="text-xs text-muted mb-2">Type <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{discount}</span> to confirm.</p>
            <input value={confirmText} onChange={e => setConfirmText(e.target.value)} className="t500-input" style={{ width: 200, height: 32, padding: '0 10px' }} />
          </div>
        )}
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => go && go({ id: 'offers' })}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={blocked || (showConfirm && needsConfirm && confirmText !== String(discount))}>Save offer</button>
        </div>
      </Section>
    </div>
  );
}

// ── OFFER DETAIL ──────────────────────────────────────────────────────
function OfferDetailScreen({ offerId, go }) {
  const offer = window.OFFERS.find(o => o.id === offerId) || window.OFFERS[0];
  const issued = offer.cap || 500, redeemed = offer.uses;
  const grossRevenue = redeemed * (offer.discount.includes('₹') ? 1500 : 350);
  const discountGiven = redeemed * (offer.discount.includes('₹') ? +offer.discount.replace(/[₹]/g,'') : 0.2 * 350);
  const netRevenue = grossRevenue - discountGiven;
  const series = Array.from({ length: 14 }, (_, i) => Math.max(0, Math.floor(redeemed/14 * (i+1) * (0.7 + Math.random()*0.6))));

  const redemptions = Array.from({ length: 8 }, (_, i) => ({
    candidate: window.CANDIDATES[i + 3],
    service: offer.service === 'all' ? ['RR','RB','LO','IIQ','RC'][i % 5] : offer.service,
    orderId: ['RB','LO','IIQ'].includes(offer.service) ? 'RB-78' + (10 + i) : 'RR-54' + (10 + i),
    amount: 299, discount: 60, when: relDate(i, 10 + i % 6, i*7),
  }));

  return (
    <div className="page">
      <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--fg-3)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => go && go({ id: 'offers' })} style={{ padding: '0 8px' }}><Icon name="chevron-left" /> Offers</button>
        <span>›</span><span className="font-semi" style={{ color: 'var(--fg-1)' }}>{offer.code}</span>
      </div>

      <div className="page-head">
        <div>
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--primary-800)', background: 'var(--primary-50)', padding: '6px 14px', borderRadius: 6 }}>{offer.code}</span>
            <Pill tone={offer.status === 'live' ? 'green' : offer.status === 'ending' ? 'amber' : 'grey'} dot>{offer.status[0].toUpperCase()+offer.status.slice(1)}</Pill>
            <Pill tone="violet">{['OFF-201','OFF-203'].includes(offer.id) ? 'Campaign' : 'Personal'}</Pill>
          </div>
          <p>{offer.label} · valid until {fmtDate(offer.validUntil)}</p>
        </div>
        <div className="page-head-actions">
          {offer.status === 'live' ? <button className="btn btn-secondary"><Icon name="pause" size={12} /> Pause</button> : <button className="btn btn-secondary"><Icon name="play" size={12} /> Resume</button>}
          <button className="btn btn-secondary">Clone</button>
          <button className="btn btn-secondary">Archive</button>
          <button className="btn btn-primary"><Icon name="download" /> Download redemptions</button>
        </div>
      </div>

      <div className="kpi-row mb-4" style={{ gridTemplateColumns: 'repeat(6,1fr)' }}>
        <MiniKpi label="Issued" value={issued} sub="codes generated" />
        <MiniKpi label="Redeemed" value={redeemed} sub={`${Math.round(redeemed/issued*100)}% of issued`} tone="green" />
        <MiniKpi label="Gross revenue" value={fmtINR(grossRevenue)} sub="from redemptions" />
        <MiniKpi label="Discount given" value={fmtINR(discountGiven)} sub="cost of offer" tone="amber" />
        <MiniKpi label="Net revenue" value={fmtINR(netRevenue)} sub="gross − discount" tone="green" />
        <MiniKpi label="Conversion" value={(redeemed/issued*100).toFixed(1)+'%'} sub="redeem rate" />
      </div>

      <div className="card mb-4">
        <div className="card-head"><h3 className="card-title">Redemption time-series</h3><span className="text-xs text-muted">Last 14 days</span></div>
        <div style={{ padding: 20 }}><Sparkline values={series} color="var(--primary)" height={120} /></div>
      </div>

      <div className="card mb-4">
        <div className="card-head"><h3 className="card-title">Service / tier breakdown</h3></div>
        <table className="tbl"><thead><tr><th>Service</th><th>Tier</th><th>Redemptions</th><th>Revenue</th><th>Avg discount</th></tr></thead><tbody>
          {(offer.service === 'all' ? ['RR','RB','LO','IIQ','RC'] : [offer.service]).map(c => (
            <tr key={c}><td><div className="flex items-center gap-2"><SvcChip code={c} /><span className="text-sm">{window.SERVICES[c].name}</span></div></td><td className="text-sm muted">Standard</td><td className="tnum">{Math.floor(redeemed / (offer.service === 'all' ? 5 : 1))}</td><td><Currency value={Math.floor(grossRevenue / (offer.service === 'all' ? 5 : 1))} /></td><td><Currency value={Math.floor(discountGiven / (offer.service === 'all' ? 5 : 1) / Math.max(1, Math.floor(redeemed / (offer.service === 'all' ? 5 : 1))))} /></td></tr>
          ))}
        </tbody></table>
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">Redemptions <span className="count">{redemptions.length}</span></h3>
          <button className="btn btn-secondary btn-sm"><Icon name="download" size={12} /> Download CSV</button>
        </div>
        <table className="tbl"><thead><tr><th>Candidate</th><th>Service</th><th>Order / session</th><th>Amount</th><th>Discount</th><th>Redeemed at</th></tr></thead><tbody>
          {redemptions.map((r, i) => (
            <tr key={i}><td><div className="av-row"><Avatar initials={r.candidate.avatarInitials} /><div className="n">{r.candidate.name}</div></div></td><td><SvcChip code={r.service} /></td><td className="tnum text-sm muted">{r.orderId}</td><td><Currency value={r.amount} /></td><td className="text-sm font-semi" style={{ color: 'var(--green-strong)' }}>−{fmtINR(r.discount)}</td><td className="muted">{fmtDateTime(r.when)}</td></tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}

// ── SERVICE CATALOG ADMIN ─────────────────────────────────────────────
function CatalogScreen({ go }) {
  const [editing, setEditing] = React.useState(null);
  const list = Object.values(window.SERVICES).map(s => ({ ...s, status: ['RR','RB','LO','IIQ','RC'].includes(s.code) ? 'Live' : 'Draft' }));

  if (editing) return <CatalogEdit code={editing} goBack={() => setEditing(null)} />;

  return (
    <div className="page">
      <PageHead title="Service catalog" sub="Configure each service: pricing, funnel stages, artefacts, SLA. No communication template mapping."
        actions={<button className="btn btn-primary"><Icon name="plus" /> New service</button>} />

      <div className="card">
        <div className="card-head"><h3 className="card-title">All services <span className="count">{list.length}</span></h3></div>
        <table className="tbl"><thead><tr><th>Service</th><th>Type</th><th>Price</th><th>Status</th><th>Funnel stages</th><th>SLA</th><th></th></tr></thead><tbody>
          {list.map(s => (
            <tr key={s.code} onClick={() => setEditing(s.code)} style={{ cursor: 'pointer' }}>
              <td><div className="flex items-center gap-3"><SvcChip code={s.code} /><span className="font-semi text-sm">{s.name}</span></div></td>
              <td><Pill tone={s.mode === 'manual' ? 'violet' : 'blue'}>{s.mode === 'manual' ? 'Manual delivery' : 'Self-serve'}</Pill></td>
              <td className="font-semi">{s.price ? fmtINR(s.price) : <span className="text-muted">Freemium</span>}</td>
              <td><Pill tone={s.status === 'Live' ? 'green' : 'grey'} dot>{s.status}</Pill></td>
              <td className="text-sm muted">{window.FUNNEL_LABELS[s.code]?.length || 0} stages</td>
              <td className="text-sm muted">{s.sla || '—'}</td>
              <td><Icon name="chevron-right" size={14} style={{ stroke: 'var(--fg-4)' }} /></td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}

function CatalogEdit({ code, goBack }) {
  const svc = window.SERVICES[code];
  const [stages, setStages] = React.useState(window.FUNNEL_LABELS[code].map((s, i) => ({ name: s, dropoffEligible: i > 0 && i < window.FUNNEL_LABELS[code].length - 1, timeoutMin: 60 * (i + 1) })));
  const [hasResume, setHasResume] = React.useState(code !== 'IIQ');

  const Section = ({ title, children, sub }) => (
    <div className="card mb-4"><div className="card-head"><div><h3 className="card-title">{title}</h3>{sub && <div className="text-xs text-muted">{sub}</div>}</div></div><div style={{ padding: 20 }}>{children}</div></div>
  );

  return (
    <div className="page" style={{ maxWidth: 880, margin: '0 auto' }}>
      <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--fg-3)' }}>
        <button className="btn btn-ghost btn-sm" onClick={goBack} style={{ padding: '0 8px' }}><Icon name="chevron-left" /> Service catalog</button>
        <span>›</span><span className="font-semi" style={{ color: 'var(--fg-1)' }}>{svc.name}</span>
      </div>
      <PageHead title={svc.name} sub="Edit pricing, stages, artefacts, and SLA"
        actions={<><button className="btn btn-secondary">Pause</button><button className="btn btn-primary">Save changes</button></>} />

      <Section title="Identity">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Name</div><input className="t500-input" defaultValue={svc.name} style={{ width: '100%', height: 32, padding: '0 10px' }} /></div>
          <div><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Code</div><input className="t500-input" defaultValue={svc.code} disabled style={{ width: '100%', height: 32, padding: '0 10px', fontFamily: 'var(--font-mono)' }} /></div>
        </div>
      </Section>

      <Section title="Type & pricing">
        <div className="flex gap-2 mb-3">
          {['manual_delivery','self_serve_automated'].map(t => {
            const on = (t === 'manual_delivery' && svc.mode === 'manual') || (t === 'self_serve_automated' && svc.mode === 'self-serve');
            return <button key={t} className={`filter-chip ${on ? 'is-on' : ''}`} style={{ flex: 1, justifyContent: 'flex-start', padding: 12 }}>
              <span className="filter-chip-cb">{on && <Icon name="check" size={9} />}</span>
              <div style={{ textAlign: 'left' }}><div className="font-semi text-sm">{t === 'manual_delivery' ? 'Manual delivery' : 'Self-serve automated'}</div><div className="text-xs text-muted">{t === 'manual_delivery' ? 'Team writes / delivers' : 'Candidate flows through unattended'}</div></div>
            </button>;
          })}
        </div>
        <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Tiers</div>
        <table className="tbl">
          <thead><tr><th>Tier</th><th>Price (₹)</th><th>Description</th><th></th></tr></thead>
          <tbody>
            <tr><td className="font-semi text-sm">Standard</td><td><input type="number" defaultValue={svc.price || 0} className="t500-input" style={{ width: 120, height: 28, padding: '0 8px' }} /></td><td className="text-sm muted">Default tier</td><td><button className="btn btn-ghost btn-sm"><Icon name="x" size={12} /></button></td></tr>
            {code === 'IIQ' && <tr><td className="font-semi text-sm">Free</td><td><input type="number" defaultValue={0} className="t500-input" style={{ width: 120, height: 28, padding: '0 8px' }} /></td><td className="text-sm muted">10-min mock</td><td></td></tr>}
          </tbody>
        </table>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}><Icon name="plus" size={12} /> Add tier</button>
      </Section>

      <Section title="Funnel stages" sub="Drag to reorder. Mark stages as drop-off-eligible and configure timeouts.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {stages.map((s, i) => (
            <div key={i} className="flex items-center gap-3" style={{ padding: '10px 12px', background: 'var(--bg-alt)', borderRadius: 6 }}>
              <Icon name="more" size={14} style={{ stroke: 'var(--fg-4)', cursor: 'grab' }} />
              <span className="tnum text-xs text-muted" style={{ width: 18 }}>{i+1}</span>
              <input className="t500-input" defaultValue={s.name} style={{ flex: 1, height: 28, padding: '0 8px' }} />
              <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--fg-2)' }}><input type="checkbox" defaultChecked={s.dropoffEligible} /> Drop-off eligible</label>
              <div className="flex items-center gap-1 text-xs"><span className="text-muted">Timeout</span><input type="number" defaultValue={s.timeoutMin} className="t500-input" style={{ width: 70, height: 26, padding: '0 6px' }} /><span className="text-muted">min</span></div>
              <button className="btn btn-ghost btn-sm"><Icon name="x" size={12} /></button>
            </div>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => setStages([...stages, { name: 'New stage', dropoffEligible: true, timeoutMin: 60 }])}><Icon name="plus" size={12} /> Add stage</button>
      </Section>

      <Section title="Artefacts">
        <label className="flex items-center justify-between" style={{ padding: '10px 0' }}>
          <div><div className="font-semi text-sm">Has resume artefact</div><div className="text-xs text-muted">Determines whether resume score is shown for this service</div></div>
          <input type="checkbox" checked={hasResume} onChange={e => setHasResume(e.target.checked)} />
        </label>
        <div className="text-xs cap mb-2 mt-3" style={{ color: 'var(--fg-3)' }}>Schema</div>
        <div style={{ background: 'var(--bg-alt)', padding: 14, borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-2)' }}>
          {`{`}<br/>
          &nbsp;&nbsp;{`"source_resume": "pdf",`}<br/>
          {hasResume && <>&nbsp;&nbsp;{`"resume_score": "int (0-100)",`}<br/></>}
          &nbsp;&nbsp;{`"final_report": "pdf | json",`}<br/>
          &nbsp;&nbsp;{`"versions": "array<File>"`}<br/>
          {`}`}
        </div>
      </Section>

      <Section title="SLA & timeouts">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>SLA window (hours)</div><input type="number" defaultValue={svc.mode === 'manual' ? (code === 'RR' ? 48 : 168) : 0} className="t500-input" style={{ width: '100%', height: 32, padding: '0 10px' }} /></div>
          <div><div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Inactivity timeout (days)</div><input type="number" defaultValue={7} className="t500-input" style={{ width: '100%', height: 32, padding: '0 10px' }} /></div>
        </div>
      </Section>

      <Section title="Status">
        <div className="flex gap-2">{['Draft','Live','Paused'].map(s => <button key={s} className={`filter-chip ${s === 'Live' ? 'is-on' : ''}`} style={{ flex: 1, justifyContent: 'center' }}>{s}</button>)}</div>
      </Section>
    </div>
  );
}

window.DropoffsScreen = DropoffsScreen;
window.CohortExportScreen = CohortExportScreen;
window.OffersScreen = OffersScreen;
window.OfferCreateScreen = OfferCreateScreen;
window.OfferDetailScreen = OfferDetailScreen;
window.CatalogScreen = CatalogScreen;
