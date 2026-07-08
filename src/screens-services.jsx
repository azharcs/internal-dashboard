/* Hi-fi service list + detail screens for RR, RB, LO, IIQ, RC */

const { Icon, Pill, ScoreBadge, SlaBadge, Avatar, Currency, SvcChip, PlanPill,
        FilterRail, FilterGroup, FunnelBreadcrumb, Sparkline, PageHead, CodePreview,
        fmtINR, fmtDate, fmtDateTime, relDate } = window;

// ─────────────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────────────

function ServicePageHead({ code, title, sub, actions, extraRight }) {
  return (
    <div className="page-head">
      <div className="flex items-center gap-3">
        <SvcChip code={code} />
        <div>
          <h1>{title}</h1>
          {sub && <p>{sub}</p>}
        </div>
      </div>
      <div className="page-head-actions">{actions}{extraRight}</div>
    </div>
  );
}

function CouponCell({ code }) {
  if (!code) return <span className="text-xs text-muted">—</span>;
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--primary-800)', background: 'var(--primary-50)', padding: '2px 7px', borderRadius: 4 }}>{code}</span>;
}

function StatusOnlyPill({ tone, label }) { return <Pill tone={tone} dot>{label}</Pill>; }

function URLCell({ url, max = 32 }) {
  const trunc = url.length > max ? url.slice(0, max - 1) + '…' : url;
  return <a href={url} target="_blank" rel="noopener" className="text-sm" style={{ color: 'var(--primary-800)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>{trunc} <Icon name="external" size={11} /></a>;
}

function ContextRail({ candidate, payment, slaMinutes, sections, score, scoreLive }) {
  return (
    <aside className="cand-rail" style={{ width: 280, flex: '0 0 280px' }}>
      <div className="cand-rail-card">
        <div className="cand-rail-section">
          <div className="flex items-center gap-3 mb-3">
            <Avatar initials={candidate.avatarInitials} size="lg" />
            <div>
              <div className="font-semi" style={{ fontSize: 14 }}>{candidate.name}</div>
              <div className="text-xs text-muted">{candidate.email}</div>
            </div>
          </div>
          {score !== undefined && (
            <div className="flex items-center justify-between" style={{ padding: '8px 10px', background: 'var(--bg-alt)', borderRadius: 8, marginBottom: 8 }}>
              <span className="text-xs text-muted">Resume score</span>
              <ScoreBadge value={score} live={scoreLive} />
            </div>
          )}
        </div>
        {payment && (
          <div className="cand-rail-section" style={{ borderTop: '1px solid var(--border-1)' }}>
            <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Payment</div>
            <div className="flex justify-between items-center mb-1"><span className="text-xs text-muted">Amount</span><span className="font-semi text-sm tnum">{fmtINR(payment.amount)}</span></div>
            {payment.coupon && <div className="flex justify-between items-center mb-1"><span className="text-xs text-muted">Coupon</span><CouponCell code={payment.coupon} /></div>}
            <div className="flex justify-between items-center"><span className="text-xs text-muted">Paid on</span><span className="text-sm tnum">{fmtDate(payment.when)}</span></div>
          </div>
        )}
        {slaMinutes != null && (
          <div className="cand-rail-section" style={{ borderTop: '1px solid var(--border-1)' }}>
            <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>SLA</div>
            <SlaBadge minutesLeft={slaMinutes} />
          </div>
        )}
        {sections}
      </div>
    </aside>
  );
}

function StatusTransitionPanel({ currentState, transitions, tone, history, writerNode, onTransition, requirements, blockedTransitions }) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const opts = transitions[currentState] || [];
  const allRequirementsMet = !requirements || requirements.every(r => r.met);
  return (
    <div className="card mb-4">
      <div className="card-head">
        <h3 className="card-title">Status & assignment</h3>
        <span className="text-xs text-muted">{history?.length || 0} transitions</span>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs cap" style={{ color: 'var(--fg-3)' }}>Current</span>
            <Pill tone={tone(currentState)} dot>{currentState}</Pill>
          </div>
          <div className="flex gap-2 items-center" style={{ position: 'relative' }}>
            {writerNode}
            <button className="btn btn-primary btn-sm" disabled={!opts.length || !allRequirementsMet} onClick={() => setPickerOpen(!pickerOpen)}>
              Move to next status <Icon name="chevron-down" size={12} />
            </button>
            {pickerOpen && (
              <div style={{ position: 'absolute', top: 32, right: 0, background: '#fff', border: '1px solid var(--border-1)', borderRadius: 8, boxShadow: 'var(--shadow-md)', zIndex: 10, minWidth: 220 }}>
                {opts.map(o => {
                  const blockReason = blockedTransitions && blockedTransitions[o];
                  return (
                    <button key={o} className="dropdown-item"
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 0, background: blockReason ? 'var(--bg-alt)' : 'none', cursor: blockReason ? 'not-allowed' : 'pointer', fontSize: 13, color: blockReason ? 'var(--fg-3)' : 'var(--fg-1)', borderBottom: '1px solid var(--border-1)', opacity: blockReason ? 0.6 : 1 }}
                      onClick={() => { if (!blockReason) { if (onTransition) onTransition(o); setPickerOpen(false); } }}>
                      <Pill tone={tone(o)} dot>{o}</Pill>
                      {blockReason && <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 3 }}>{blockReason}</div>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {requirements && (
          <div style={{ borderTop: '1px solid var(--border-1)', paddingTop: 14, marginBottom: history && history.length > 0 ? 14 : 0 }}>
            <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Required before next stage</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {requirements.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 18, height: 18, borderRadius: 99, background: r.met ? 'var(--green-soft)' : 'var(--bg-alt)', border: r.met ? 'none' : '1.5px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {r.met && <Icon name="check" size={10} style={{ stroke: 'var(--green-strong)' }} />}
                  </span>
                  <span className="text-sm" style={{ color: r.met ? 'var(--fg-1)' : 'var(--fg-3)' }}>{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {history && history.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-1)', paddingTop: 14 }}>
            <div className="text-xs cap mb-3" style={{ color: 'var(--fg-3)' }}>Assignment history</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-sm" style={{ padding: '8px 10px', background: 'var(--bg-alt)', borderRadius: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--primary)' }}></span>
                  <span className="font-semi">{h.actor}</span>
                  <span className="text-muted">{h.action}</span>
                  <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>{fmtDateTime(h.when)}</span>
                  {h.reason && <span className="text-xs" style={{ background: 'var(--bg-alt)', padding: '2px 6px', borderRadius: 4, color: 'var(--fg-2)' }}>{h.reason}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NotesPanel() {
  const [notes, setNotes] = React.useState([
    { actor: 'Aditi K.', when: relDate(0, 11, 30), text: 'Candidate requested emphasis on GCC roles. Adjusted summary accordingly.' },
    { actor: 'Sushant V.', when: relDate(1, 9, 5), text: 'High-quality source resume. Should be a quick turnaround.' },
  ]);
  const [draft, setDraft] = React.useState('');
  return (
    <div className="card mb-4">
      <div className="card-head"><h3 className="card-title">Internal notes</h3><span className="text-xs text-muted">Team-only</span></div>
      <div style={{ padding: '14px 20px' }}>
        {notes.map((n, i) => (
          <div key={i} className="flex gap-3 items-start" style={{ padding: '10px 0', borderBottom: i === notes.length - 1 ? 'none' : '1px solid var(--border-1)' }}>
            <Avatar initials={n.actor.split(' ').map(p => p[0]).join('').slice(0,2)} />
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-2 mb-1"><span className="font-semi text-sm">{n.actor}</span><span className="text-xs text-muted">{fmtDateTime(n.when)}</span></div>
              <div className="text-sm" style={{ color: 'var(--fg-2)' }}>{n.text}</div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 12 }}>
          <textarea className="t500-input" placeholder="Add an internal note…" value={draft} onChange={e => setDraft(e.target.value)} style={{ width: '100%', minHeight: 60, padding: 10, resize: 'vertical' }}></textarea>
          <div className="flex justify-end mt-2"><button className="btn btn-primary btn-sm" onClick={() => { if (draft.trim()) { setNotes([...notes, { actor: 'You', when: new Date(), text: draft }]); setDraft(''); } }}>Add note</button></div>
        </div>
      </div>
    </div>
  );
}

function ActivityLogPanel({ events }) {
  return (
    <div className="card mb-4">
      <div className="card-head"><h3 className="card-title">Activity log</h3><span className="text-xs text-muted">Immutable · system events</span></div>
      <div style={{ padding: '14px 20px' }}>
        {events.map((e, i) => (
          <div key={i} className="flex items-start gap-3" style={{ padding: '8px 0', borderBottom: i === events.length - 1 ? 'none' : '1px solid var(--border-1)' }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: `var(--${e.tone || 'violet'}-soft)`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={e.icon || 'pulse'} size={13} style={{ stroke: `var(--${e.tone || 'violet'}-strong)` }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="text-sm" style={{ color: 'var(--fg-1)' }}>{e.text}</div>
              {e.meta?.length > 0 && <div className="text-xs text-muted">{e.meta.join(' · ')}</div>}
            </div>
            <span className="text-xs text-muted tnum">{fmtDateTime(e.when)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 1. RESUME REPORT  ────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────

function RRListScreen({ openOrder }) {
  const [stateFilter, setStateFilter] = React.useState([]);
  const [slaFilter, setSlaFilter] = React.useState([]);
  const orders = window.RR_ORDERS_FULL;
  let filtered = orders;
  if (stateFilter.length) filtered = filtered.filter(o => stateFilter.includes(o.state));
  if (slaFilter.length) filtered = filtered.filter(o => {
    const m = o.slaRemainingMin;
    return slaFilter.some(s => (s === 'breached' && m < 0) || (s === 'risk' && m >= 0 && m < 4*60) || (s === 'healthy' && m >= 4*60));
  });
  const counts = {};
  window.RR_STATES_ALL.forEach(s => counts[s] = orders.filter(o => o.state === s).length);

  const open = orders.filter(o => !['Delivered','Cancelled'].includes(o.state));
  const breached = open.filter(o => o.slaRemainingMin < 0).length;
  const risk = open.filter(o => o.slaRemainingMin >= 0 && o.slaRemainingMin < 4*60).length;

  return (
    <div className="page">
      <ServicePageHead code="RR" title="Resume Report" sub="Manual delivery · ₹99 · 48-hour SLA"
        actions={<>

          <button className="btn btn-primary"><Icon name="download" /> Download CSV</button>
        </>} />

      <div className="kpi-row mb-4" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <KpiTile label="New" value={orders.filter(o => o.state === 'New').length} sub="no resume or writer yet" tone="amber" />
        <KpiTile label="In Review" value={orders.filter(o => o.state === 'In Review').length} sub="with writer" tone="violet" />
        <KpiTile label="Report Ready" value={orders.filter(o => o.state === 'Report Ready').length} sub="awaiting approval" tone="blue" />
        <KpiTile label="Delivered" value={orders.filter(o => o.state === 'Delivered').length} sub="completed" tone="green" />
      </div>

      <div className="list-layout">
        <FilterRail onClear={() => { setStateFilter([]); setSlaFilter([]); }}>
          <FilterGroup title="Status" options={window.RR_STATES_ALL} selected={stateFilter} onToggle={v => setStateFilter(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v])} counts={counts} />
          <h4>SLA state</h4>
          <div className="filter-group">
            {[{value:'breached',label:'Breached'},{value:'risk',label:'At risk (<4h)'},{value:'healthy',label:'Healthy (>24h)'}].map(o => {
              const on = slaFilter.includes(o.value);
              return <label key={o.value} className={`filter-chip ${on ? 'is-on' : ''}`} onClick={() => setSlaFilter(s => s.includes(o.value) ? s.filter(x => x !== o.value) : [...s, o.value])}><span className="filter-chip-cb">{on && <Icon name="check" size={9} />}</span><span>{o.label}</span></label>;
            })}
          </div>
          {!window.ACCESS.isRestricted() && (
            <>
              <h4>Writer</h4>
              <div className="filter-group">
                {[...(window.TEAM_MEMBERS || []).filter(m => m.role === 'resume_writer' && m.status === 'active').map(m => m.name), 'Unassigned'].map(w => (
                  <label key={w} className="filter-chip"><span className="filter-chip-cb"></span><span>{w}</span></label>
                ))}
              </div>
            </>
          )}
        </FilterRail>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="left">

              <span className="text-xs text-muted">{filtered.length} of {orders.length}</span>
            </div>
          </div>
          <table className="tbl">
            <thead><tr>
              <th>Order</th><th>Candidate</th><th>Status</th>
              <th>Writer</th><th>SLA</th><th>Score</th><th>Paid</th><th>Coupon</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} onClick={() => openOrder && openOrder(o.id)} style={{ cursor: 'pointer' }}>
                  <td className="tnum text-muted">{o.id}</td>
                  <td><div className="av-row"><Avatar initials={o.candidate.avatarInitials} /><div><div className="n">{o.candidate.name}</div><div className="e">{o.candidate.email}</div></div></div></td>
                  <td><Pill tone={window.rrStateTone(o.state)} dot>{o.state}</Pill></td>
                  <td className="muted text-sm">{o.writer}</td>
                  <td><SlaBadge minutesLeft={o.slaRemainingMin} /></td>
                  <td>{o.originalResume ? <ScoreBadge value={o.score} /> : <span className="text-xs text-muted">—</span>}</td>
                  <td><Currency value={o.amountPaid} /></td>
                  <td><CouponCell code={o.coupon} /></td>
                  <td><button className="row-actions" onClick={e => e.stopPropagation()}><Icon name="more" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function openReportEditor(order) {
  const c = order.candidate;
  const dateStr = new Date(order.placed).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${c.name} — Resume Report</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F4F5F7;color:#1D2B3A;font-size:14px;height:100vh;display:flex;flex-direction:column}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:52px;background:#fff;border-bottom:1px solid #E0E4EA;flex-shrink:0;gap:12px}
.topbar-left{display:flex;align-items:center;gap:10px;min-width:0}
.topbar-title{font-size:14px;font-weight:600;color:#1D2B3A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.topbar-meta{font-size:11px;color:#8896A5;white-space:nowrap}
.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:6px;border:none;cursor:pointer;font-size:13px;font-weight:600;transition:background .12s;font-family:inherit}
.btn-primary{background:#0052CC;color:#fff}.btn-primary:hover{background:#0065FF}
.btn-secondary{background:#F4F5F7;color:#344563;border:1px solid #DDE3EA}.btn-secondary:hover{background:#EBECF0}
.save-status{font-size:12px;color:#8896A5}
.toolbar{display:flex;align-items:center;gap:2px;padding:6px 20px;background:#fff;border-bottom:1px solid #E0E4EA;flex-shrink:0;flex-wrap:wrap}
.toolbar-sep{width:1px;height:20px;background:#DDE3EA;margin:0 4px}
.tb-btn{display:inline-flex;align-items:center;justify-content:center;min-width:28px;height:28px;padding:0 6px;border:none;background:transparent;border-radius:4px;cursor:pointer;font-size:12px;color:#344563;font-family:inherit;font-weight:600;transition:background .1s}
.tb-btn:hover{background:#EBECF0}
.editor-wrap{flex:1;overflow-y:auto;display:flex;justify-content:center;padding:32px 20px 80px}
.editor-paper{background:#fff;width:100%;max-width:760px;min-height:900px;padding:56px 64px;box-shadow:0 1px 4px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06);border-radius:4px;outline:none;font-size:14px;line-height:1.75;color:#1D2B3A}
.editor-paper h1{font-size:24px;font-weight:700;color:#0052CC;margin-bottom:8px}
.editor-paper h2{font-size:16px;font-weight:600;color:#1D2B3A;margin:24px 0 8px;padding-bottom:6px;border-bottom:1px solid #E0E4EA}
.editor-paper h3{font-size:14px;font-weight:600;color:#344563;margin:16px 0 6px}
.editor-paper p{margin-bottom:10px}
.editor-paper ul,.editor-paper ol{margin:8px 0 10px 22px}
.editor-paper li{margin-bottom:4px}
.editor-paper hr{border:none;border-top:1px solid #E0E4EA;margin:20px 0}
.meta-band{background:#F4F7FF;border:1px solid #DEEBFF;border-radius:6px;padding:10px 16px;margin-bottom:24px;display:flex;gap:24px;flex-wrap:wrap}
.meta-band .lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#8896A5;display:block;margin-bottom:2px}
.meta-band .val{font-size:13px;font-weight:600;color:#1D2B3A}
</style>
</head>
<body>
<div class="topbar">
  <div class="topbar-left">
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="1" width="14" height="16" rx="2" stroke="#0052CC" stroke-width="1.5"/><path d="M5 6h8M5 9h8M5 12h5" stroke="#0052CC" stroke-width="1.5" stroke-linecap="round"/></svg>
    <div>
      <div class="topbar-title">${c.name} — Resume Report</div>
      <div class="topbar-meta">Order ${order.id} &nbsp;·&nbsp; Score: ${order.score}/100</div>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:10px">
    <span class="save-status" id="ss"></span>
    <button class="btn btn-secondary" onclick="window.close()">Close</button>
    <button class="btn btn-primary" onclick="saveDraft()">Save draft</button>
  </div>
</div>
<div class="toolbar">
  <button class="tb-btn" onclick="ex('bold')" title="Bold"><b>B</b></button>
  <button class="tb-btn" onclick="ex('italic')" title="Italic"><i>I</i></button>
  <button class="tb-btn" onclick="ex('underline')" title="Underline"><u>U</u></button>
  <div class="toolbar-sep"></div>
  <button class="tb-btn" onclick="blk('h1')">H1</button>
  <button class="tb-btn" onclick="blk('h2')">H2</button>
  <button class="tb-btn" onclick="blk('h3')">H3</button>
  <button class="tb-btn" onclick="blk('p')" style="font-weight:400">¶</button>
  <div class="toolbar-sep"></div>
  <button class="tb-btn" onclick="ex('insertUnorderedList')" title="Bullet list">• list</button>
  <button class="tb-btn" onclick="ex('insertOrderedList')" title="Numbered list">1. list</button>
  <div class="toolbar-sep"></div>
  <button class="tb-btn" onclick="ex('insertHorizontalRule')">— rule</button>
  <div class="toolbar-sep"></div>
  <button class="tb-btn" onclick="ex('undo')">↩</button>
  <button class="tb-btn" onclick="ex('redo')">↪</button>
</div>
<div class="editor-wrap">
  <div class="editor-paper" id="ed" contenteditable="true" spellcheck="true">
    <h1>${c.name}</h1>
    <div class="meta-band">
      <div><span class="lbl">Order ID</span><span class="val">${order.id}</span></div>
      <div><span class="lbl">Date</span><span class="val">${dateStr}</span></div>
      <div><span class="lbl">Score</span><span class="val">${order.score} / 100</span></div>
      <div><span class="lbl">Email</span><span class="val">${c.email}</span></div>
    </div>
    <h2>Executive Summary</h2>
    <p>Write an overall assessment of the candidate's resume here. Summarise their profile, experience level, and key highlights in 2–3 sentences.</p>
    <h2>Strengths</h2>
    <ul><li>Strong experience in...</li><li>Clear career progression in...</li><li>Well-structured presentation of...</li></ul>
    <h2>Areas for Improvement</h2>
    <ul><li>Quantify achievements in the experience section — add metrics where possible.</li><li>The summary section needs to be more targeted to the candidate's goal role.</li><li>Consider adding a skills section with relevant tools and technologies.</li></ul>
    <h2>Recommendations</h2>
    <p>Provide 2–3 specific, actionable recommendations the candidate can act on immediately to improve their resume and job prospects.</p>
    <h2>Score Breakdown</h2>
    <ul>
      <li><strong>Content quality:</strong> — / 25</li>
      <li><strong>Structure &amp; formatting:</strong> — / 25</li>
      <li><strong>Keyword relevance:</strong> — / 25</li>
      <li><strong>Overall impression:</strong> — / 25</li>
    </ul>
    <p><strong>Total: ${order.score} / 100</strong></p>
    <hr>
    <p style="font-size:12px;color:#8896A5">Prepared by Talent500 Candidate Services &nbsp;·&nbsp; ${dateStr}</p>
  </div>
</div>
<script>
function ex(cmd){document.getElementById('ed').focus();document.execCommand(cmd,false,null)}
function blk(tag){document.getElementById('ed').focus();document.execCommand('formatBlock',false,tag)}
function saveDraft(){
  const blob=new Blob(['<!DOCTYPE html><html><head><meta charset="utf-8"><title>Resume Report</title><style>body{font-family:sans-serif;max-width:760px;margin:40px auto;padding:0 20px;line-height:1.75;color:#1D2B3A}h1{color:#0052CC}h2{border-bottom:1px solid #eee;padding-bottom:6px;margin-top:24px}ul{margin-left:20px}</style></head><body>'+document.getElementById('ed').innerHTML+'</body></html>'],{type:'text/html'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='resume-report-${order.id}.html';a.click();
  document.getElementById('ss').textContent='Draft saved';setTimeout(()=>document.getElementById('ss').textContent='',2000)
}
let t;document.getElementById('ed').addEventListener('input',()=>{document.getElementById('ss').textContent='Unsaved';clearTimeout(t);t=setTimeout(()=>document.getElementById('ss').textContent='',4000)})
<\/script>
<\/body><\/html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  window.open(url, '_blank');
}

function RRDetailScreen({ orderId, goBack }) {
  const order = window.RR_ORDERS_FULL.find(o => o.id === orderId) || window.RR_ORDERS_FULL[0];
  const [assignedWriter, setAssignedWriter] = React.useState(order.writer || '—');
  const [currentState, setCurrentState] = React.useState(order.state);
  const [rrResume, setRRResume] = React.useState(order.originalResume);
  const [showResumeUploadModal, setShowResumeUploadModal] = React.useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = React.useState(false);
  const slaCritical = order.slaRemainingMin < 4 * 60;

  const handleRRTransition = (nextState) => {
    if (nextState === 'Delivered') {
      setShowDeliveryModal(true);
    } else {
      setCurrentState(nextState);
    }
  };

  const rrRequirements = currentState === 'New' ? [
    { label: 'Resume uploaded', met: !!rrResume },
    { label: 'Writer assigned', met: assignedWriter !== '—' },
  ] : null;

  const rrBlockedTransitions = (currentState === 'New' && rrRequirements && !rrRequirements.every(r => r.met))
    ? { 'In Review': !rrResume && assignedWriter === '—' ? 'Upload resume and assign a writer first'
                    : !rrResume ? 'Upload resume first'
                    : 'Assign a writer first' }
    : {};

  const history = [
    { actor: 'System', action: 'created order', when: order.placed },
    { actor: 'Sushant V.', action: `assigned writer ${order.writer}`, when: relDate(0, 10, 5), reason: 'Manual' },
  ].filter((_, i) => i < (order.writer === '—' ? 1 : 2));

  const versions = [
    { v: 'v2', uploader: assignedWriter !== '—' ? assignedWriter : 'Aditi K.', when: relDate(0, 16, 0), note: 'Final pass — clarified GCC alignment in summary' },
    { v: 'v1', uploader: assignedWriter !== '—' ? assignedWriter : 'Aditi K.', when: relDate(0, 13, 22), note: 'Initial report draft' },
  ];

  return (
    <div className="page">
      {slaCritical && order.slaRemainingMin >= 0 && (
        <div style={{ background: 'var(--red-soft)', borderLeft: '3px solid var(--red-strong)', padding: '12px 20px', marginBottom: 16, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="alert" size={16} style={{ stroke: 'var(--red-strong)' }} />
          <span className="font-semi text-sm" style={{ color: 'var(--red-strong)' }}>SLA critical: {Math.floor(order.slaRemainingMin / 60)}h {order.slaRemainingMin % 60}m remaining</span>
        </div>
      )}
      <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--fg-3)' }}>
        <button className="btn btn-ghost btn-sm" onClick={goBack} style={{ padding: '0 8px' }}><Icon name="chevron-left" /> Resume Report</button>
        <span>›</span>
        <span className="font-semi" style={{ color: 'var(--fg-1)' }}>{order.id}</span>
      </div>

      <div className="page-head">
        <div>
          <div className="flex items-center gap-3"><h1>{order.id}</h1><Pill tone={window.rrStateTone(currentState)} dot>{currentState}</Pill></div>
          <p>Resume Report · placed {fmtDateTime(order.placed)}</p>
        </div>
        <div className="page-head-actions">
          <button className="btn btn-secondary"><Icon name="more" /></button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <ContextRail
          candidate={order.candidate}
          score={rrResume ? order.score : undefined}
          payment={{ amount: order.amountPaid, coupon: order.coupon, when: order.placed }}
          slaMinutes={order.slaRemainingMin}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <StatusTransitionPanel currentState={currentState} transitions={window.RR_TRANSITIONS} tone={window.rrStateTone} history={history} onTransition={handleRRTransition}
            requirements={rrRequirements} blockedTransitions={rrBlockedTransitions}
            writerNode={!window.ACCESS.isRestricted() && <window.WriterPickerBtn value={assignedWriter} onChange={setAssignedWriter} />} />

          {/* Candidate's resume */}
          <div className="card mb-4">
            <div className="card-head">
              <h3 className="card-title">Candidate's resume</h3>
              {rrResume && (
                <div className="flex items-center gap-3">
                  <ScoreBadge value={order.score} />
                  <button className="btn btn-ghost btn-sm"><Icon name="download" size={12} /> Download</button>
                  <button className="btn btn-ghost btn-sm"><Icon name="external" size={12} /> Open PDF</button>
                </div>
              )}
            </div>
            {rrResume ? (
              <div style={{ padding: 20, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ width: 110, height: 148, background: 'linear-gradient(180deg,#fff 0%,#f5f5f7 100%)', border: '1px solid var(--border-1)', borderRadius: 6, flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '14px 10px', gap: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ height: 8, width: '60%', background: '#1D2B3A', opacity: 0.8, borderRadius: 2 }}></div>
                  <div style={{ height: 5, width: '80%', background: 'var(--border-2)', borderRadius: 2 }}></div>
                  <div style={{ height: 5, width: '70%', background: 'var(--border-2)', borderRadius: 2, marginBottom: 6 }}></div>
                  {[90,75,85,65,80,70,75].map((w, i) => <div key={i} style={{ height: 3, width: w+'%', background: 'var(--border-1)', borderRadius: 2 }}></div>)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-semi text-sm" style={{ marginBottom: 4 }}>{rrResume.name}</div>
                  <div className="text-xs text-muted" style={{ marginBottom: 2 }}>Uploaded {fmtDateTime(rrResume.uploadedAt)}</div>
                  <div className="text-xs text-muted" style={{ marginBottom: 12 }}>312 KB · 2 pages</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-alt)', borderRadius: 6, width: 'fit-content' }}>
                    <span className="text-xs text-muted">Resume score</span>
                    <ScoreBadge value={order.score} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: 20 }}>
                <div style={{ padding: '20px 24px', background: 'var(--bg-alt)', borderRadius: 8, border: '2px dashed var(--border-2)', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fff', border: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="upload" size={18} style={{ stroke: 'var(--fg-3)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="font-semi text-sm" style={{ marginBottom: 2 }}>No resume uploaded during payment</div>
                    <div className="text-xs text-muted">Obtain the resume from the candidate and upload it manually.</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowResumeUploadModal(true)}>Upload resume</button>
                </div>
              </div>
            )}
          </div>

          {/* Report */}
          <div className="card mb-4">
            <div className="card-head">
              <div>
                <h3 className="card-title">Report <span className="count">{versions.length}</span></h3>
                <p className="card-sub" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>Written by the assigned writer in the report editor.</p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => openReportEditor(order)}
                title="Open report editor in a new tab">
                <Icon name="external" size={13} /> Create a Report
              </button>
            </div>

            <div style={{ padding: '8px 0' }}>
              {versions.map((v, i) => (
                  <div key={i} className="flex items-center gap-3" style={{ padding: '12px 20px', borderBottom: i === versions.length - 1 ? 'none' : '1px solid var(--border-1)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12, color: 'var(--primary-800)', background: 'var(--primary-50)', padding: '3px 8px', borderRadius: 4 }}>{v.v}</span>
                    <div style={{ flex: 1 }}>
                      <div className="font-semi text-sm">Created by {v.uploader}</div>
                      {v.note && <div className="text-xs text-muted">{v.note}</div>}
                    </div>
                    <span className="text-xs text-muted">{fmtDateTime(v.when)}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => openReportEditor(order)}><Icon name="external" size={12} /> Edit</button>
                  </div>
                ))}
              </div>
          </div>

          <NotesPanel />
          <ActivityLogPanel events={[
            { icon: 'card', tone: 'violet', when: order.placed, text: 'Order placed', meta: [fmtINR(order.amountPaid), order.coupon ? `Coupon ${order.coupon}` : null].filter(Boolean) },
            ...(rrResume && !order.originalResume ? [{ icon: 'upload', tone: 'blue', when: rrResume.uploadedAt, text: 'Resume uploaded manually by ops', meta: [] }] : []),
            { icon: 'user', tone: 'green', when: relDate(0, 10, 5), text: 'Writer assigned: ' + (assignedWriter !== '—' ? assignedWriter : 'pending'), meta: [] },
            { icon: 'pulse', tone: 'blue', when: relDate(0, 15, 30), text: 'Status: ' + order.state, meta: [] },
          ].filter((_, i) => i < (order.state === 'New' ? 1 : 4))} />
        </div>
      </div>

      {showDeliveryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 480, boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Deliver report to candidate</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDeliveryModal(false)}><Icon name="x" size={14} /></button>
            </div>
            <p className="text-sm" style={{ color: 'var(--fg-2)', marginBottom: 20, lineHeight: 1.6 }}>
              The completed resume report will be sent to the candidate by email. Please confirm the delivery details before proceeding.
            </p>
            <div style={{ background: 'var(--bg-alt)', borderRadius: 10, padding: '16px 18px', marginBottom: 20, border: '1px solid var(--border-1)' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--border-1)' }}>
                <span className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Candidate</span>
                <span className="font-semi text-sm">{order.candidate.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Email</span>
                <span className="font-semi text-sm" style={{ color: 'var(--primary)' }}>{order.candidate.email}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--primary-50)', borderRadius: 8, marginBottom: 20 }}>
              <Icon name="pulse" size={13} style={{ stroke: 'var(--primary)', flexShrink: 0 }} />
              <span className="text-xs" style={{ color: 'var(--primary-800)' }}>Once delivered, the order will be marked as completed and cannot be moved back.</span>
            </div>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-secondary" onClick={() => setShowDeliveryModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setCurrentState('Delivered'); setShowDeliveryModal(false); }}>Confirm &amp; deliver</button>
            </div>
          </div>
        </div>
      )}

      {showResumeUploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 440, boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Upload candidate resume</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowResumeUploadModal(false)}><Icon name="x" size={14} /></button>
            </div>
            <div style={{ padding: '24px', background: 'var(--bg-alt)', borderRadius: 8, border: '2px dashed var(--border-2)', textAlign: 'center', marginBottom: 16 }}>
              <Icon name="upload" size={24} style={{ stroke: 'var(--fg-3)', marginBottom: 8 }} />
              <div className="text-sm font-semi" style={{ marginBottom: 4 }}>Click to choose a file or drag & drop</div>
              <div className="text-xs text-muted">PDF or DOCX</div>
            </div>
            <p className="text-xs text-muted" style={{ marginBottom: 16 }}>Manually obtained from the candidate. Will be visible to the assigned writer.</p>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-secondary" onClick={() => setShowResumeUploadModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                setRRResume({ name: `${order.candidate.name.split(' ')[0]}_Resume.pdf`, uploadedAt: new Date() });
                setShowResumeUploadModal(false);
              }}>Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mini KPI tile
function KpiTile({ label, value, sub, tone }) {
  const c = tone === 'red' ? 'var(--red-strong)' : tone === 'amber' ? 'var(--amber-strong)' : tone === 'green' ? 'var(--green-strong)' : 'var(--fg-1)';
  return (
    <div className="kpi"><div className="kpi-label">{label}</div><div className="kpi-value" style={{ color: c }}>{value}</div><div className="kpi-meta"><span>{sub}</span></div></div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 2. RESUME BUILDER  ───────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────

function RBListScreen({ openSession }) {
  const [grouped, setGrouped] = React.useState(false);
  const [stageFilter, setStageFilter] = React.useState([]);
  const [paidFilter, setPaidFilter] = React.useState('all');
  let sessions = window.RB_SESSIONS;
  if (stageFilter.length) sessions = sessions.filter(s => stageFilter.includes(s.currentStage));
  if (paidFilter === 'yes') sessions = sessions.filter(s => s.amountPaid > 0);
  if (paidFilter === 'no') sessions = sessions.filter(s => s.amountPaid === 0);

  const grouping = grouped
    ? Object.values(sessions.reduce((acc, s) => {
        const k = s.candidate.id;
        if (!acc[k]) acc[k] = { candidate: s.candidate, latest: s, count: 0, totalPaid: 0 };
        acc[k].count++;
        acc[k].totalPaid += s.amountPaid;
        if (s.lastActive > acc[k].latest.lastActive) acc[k].latest = s;
        return acc;
      }, {})).sort((a, b) => b.latest.lastActive - a.latest.lastActive)
    : null;

  return (
    <div className="page">
      <ServicePageHead code="RB" title="Resume Builder" sub="Self-serve · DIY editor · multi-resume per candidate"
        actions={<button className="btn btn-primary"><Icon name="download" /> Download CSV</button>} />

      <div className="kpi-row mb-4">
        <KpiTile label="Sessions today" value={47} sub="started" />
        <KpiTile label="Live editors" value={4} sub="active right now" tone="green" />
        <KpiTile label="Conversion · 7d" value="11.2%" sub="paywall → paid" />
        <KpiTile label="Avg score lift" value="+9" sub="initial → latest" tone="green" />
      </div>

      <div className="list-layout">
        <FilterRail onClear={() => { setStageFilter([]); setPaidFilter('all'); }}>
          <FilterGroup title="Funnel stage" options={window.FUNNEL_LABELS.RB} selected={stageFilter} onToggle={v => setStageFilter(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v])} />
          <h4>Has paid</h4>
          <div className="filter-group">
            {[{value:'all',label:'All'},{value:'yes',label:'Yes'},{value:'no',label:'No'}].map(o => (
              <label key={o.value} className={`filter-chip ${paidFilter === o.value ? 'is-on' : ''}`} onClick={() => setPaidFilter(o.value)}><span className="filter-chip-cb">{paidFilter === o.value && <Icon name="check" size={9} />}</span><span>{o.label}</span></label>
            ))}
          </div>
          <h4>Score range</h4>
          <div style={{ padding: '4px 6px' }}>
            <div className="text-xs text-muted" style={{ marginBottom: 4 }}>Latest score</div>
            <div style={{ height: 4, background: 'var(--bg-alt)', borderRadius: 4, position: 'relative' }}>
              <div style={{ position: 'absolute', left: '0%', right: '0%', top: 0, bottom: 0, background: 'var(--primary)', borderRadius: 4 }}></div>
            </div>
            <div className="text-xs text-muted" style={{ marginTop: 6, textAlign: 'center' }}>0 – 100</div>
          </div>
          <h4>Score delta</h4>
          <div style={{ padding: '4px 6px' }}>
            <div className="text-xs text-muted">−10 to +30</div>
          </div>
        </FilterRail>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="left">

              <span className="text-xs text-muted">{sessions.length} sessions</span>
              <span className="live-pulse" style={{ marginLeft: 8 }}>● 4 live editors</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm" style={{ cursor: 'pointer', color: 'var(--fg-2)' }}>
                <input type="checkbox" checked={grouped} onChange={e => setGrouped(e.target.checked)} /> Group by candidate
              </label>
            </div>
          </div>
          {grouped ? (
            <table className="tbl">
              <thead><tr><th>Candidate</th><th>Sessions</th><th>Latest stage</th><th>Latest score</th><th>Total paid</th><th>Last activity</th><th></th></tr></thead>
              <tbody>
                {grouping.map(g => (
                  <tr key={g.candidate.id} onClick={() => openSession && openSession(g.latest.id)} style={{ cursor: 'pointer' }}>
                    <td><div className="av-row"><Avatar initials={g.candidate.avatarInitials} /><div><div className="n">{g.candidate.name}</div><div className="e">{g.candidate.email}</div></div></div></td>
                    <td><Pill tone="violet">{g.count}</Pill></td>
                    <td className="text-sm">{g.latest.currentStage}</td>
                    <td><ScoreBadge value={g.latest.latestScore} live={g.latest.live} /></td>
                    <td><Currency value={g.totalPaid} /></td>
                    <td className="muted">{fmtDate(g.latest.lastActive)}</td>
                    <td><button className="row-actions" onClick={e => e.stopPropagation()}><Icon name="more" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="tbl">
              <thead><tr>
                <th>Session</th><th>Candidate</th><th>Started</th><th>Last activity</th>
                <th>Current stage</th><th>Furthest stage</th><th>Status</th><th>Score</th><th>Δ</th><th>Paid</th><th>Coupon</th><th></th>
              </tr></thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} onClick={() => openSession && openSession(s.id)} style={{ cursor: 'pointer' }}>
                    <td className="tnum text-muted">{s.id}</td>
                    <td><div className="av-row"><Avatar initials={s.candidate.avatarInitials} /><div className="n">{s.candidate.name}</div></div></td>
                    <td className="muted">{fmtDate(s.started)}</td>
                    <td className="muted">{fmtDate(s.lastActive)}</td>
                    <td className="text-sm">{s.currentStage}</td>
                    <td className="text-sm muted">{s.furthestStage}</td>
                    <td><Pill tone={s.status === 'paid' ? 'violet' : s.status === 'active' ? 'green' : s.status === 'completed' ? 'blue' : 'amber'} dot>{s.status[0].toUpperCase()+s.status.slice(1)}</Pill></td>
                    <td><ScoreBadge value={s.latestScore} live={s.live} /></td>
                    <td>{s.scoreDelta != null ? <span style={{ fontWeight: 600, fontSize: 12, color: s.scoreDelta > 0 ? 'var(--green-strong)' : s.scoreDelta < 0 ? 'var(--red-strong)' : 'var(--fg-3)' }}>{s.scoreDelta > 0 ? '+' : ''}{s.scoreDelta}</span> : <span className="text-xs text-muted">—</span>}</td>
                    <td><Currency value={s.amountPaid} /></td>
                    <td><CouponCell code={s.coupon} /></td>
                    <td><button className="row-actions" onClick={e => e.stopPropagation()}><Icon name="more" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function RBDetailScreen({ sessionId, goBack }) {
  const session = window.RB_SESSIONS.find(s => s.id === sessionId) || window.RB_SESSIONS[0];
  const stages = window.FUNNEL_LABELS.RB;
  const otherSessions = window.RB_SESSIONS.filter(s => s.candidate.id === session.candidate.id && s.id !== session.id).slice(0, 5);

  // Score progression — synthetic per session
  const events = [
    { t: 0, score: session.initialScore, label: 'Initial upload' },
    { t: 1, score: (session.initialScore || 60) + 3 },
    { t: 2, score: (session.initialScore || 60) + 6, label: 'Section saved' },
    { t: 3, score: (session.initialScore || 60) + 9 },
    { t: 4, score: session.latestScore, label: session.amountPaid > 0 ? 'Exported' : 'Latest' },
  ].filter(e => e.score != null);

  return (
    <div className="page">
      <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--fg-3)' }}>
        <button className="btn btn-ghost btn-sm" onClick={goBack} style={{ padding: '0 8px' }}><Icon name="chevron-left" /> Resume Builder</button>
        <span>›</span><span className="font-semi" style={{ color: 'var(--fg-1)' }}>{session.id}</span>
      </div>

      <div className="page-head">
        <div>
          <div className="flex items-center gap-3">
            <h1>{session.id}</h1>
            <Pill tone={session.status === 'paid' ? 'violet' : session.status === 'active' ? 'green' : session.status === 'completed' ? 'blue' : 'amber'} dot>{session.status[0].toUpperCase()+session.status.slice(1)}</Pill>
            {session.live && <span className="live-pulse">● Live editor</span>}
          </div>
          <p>Resume Builder session · started {fmtDateTime(session.started)}</p>
        </div>
        <div className="page-head-actions">
          <button className="btn btn-secondary"><Icon name="external" /> Open candidate</button>
          <button className="btn btn-secondary"><Icon name="more" /></button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <ContextRail
          candidate={session.candidate} score={session.latestScore} scoreLive={session.live}
          payment={session.amountPaid > 0 ? { amount: session.amountPaid, coupon: session.coupon, when: session.lastActive } : null}
          sections={
            <>
              <div className="cand-rail-section" style={{ borderTop: '1px solid var(--border-1)' }}>
                <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Session</div>
                <div className="flex justify-between text-sm mb-1"><span className="text-muted">Started</span><span>{fmtDate(session.started)}</span></div>
                <div className="flex justify-between text-sm mb-1"><span className="text-muted">Last activity</span><span>{fmtDate(session.lastActive)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted">Score Δ</span>
                  <span style={{ fontWeight: 600, color: (session.scoreDelta||0) > 0 ? 'var(--green-strong)' : 'var(--fg-1)' }}>
                    {session.scoreDelta != null ? (session.scoreDelta > 0 ? '+' : '') + session.scoreDelta : '—'}
                  </span>
                </div>
              </div>
            </>
          }
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Funnel progress</h3></div>
            <div style={{ padding: '16px 20px' }}>
              <FunnelBreadcrumb stages={stages} currentIdx={session.currentStageIdx} />
              <div className="flex justify-between text-xs text-muted mt-3">
                <span>Current: <span className="font-semi" style={{ color: 'var(--fg-1)' }}>{session.currentStage}</span></span>
                <span>Furthest: <span className="font-semi" style={{ color: 'var(--fg-1)' }}>{session.furthestStage}</span></span>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Resume preview</h3><span className="text-xs text-muted">Source vs. current</span></div>
            <div style={{ padding: 20, display: 'flex', gap: 16 }}>
              {[{ label: 'Source resume', sub: 'v1 · uploaded at start', score: session.initialScore },
                { label: 'Current working', sub: session.live ? 'editing now' : 'last saved', score: session.latestScore }].map((p, i) => (
                <div key={i} style={{ flex: 1 }}>
                  <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>{p.label}</div>
                  <div style={{ aspectRatio: '8.5/11', background: 'linear-gradient(180deg,#fff 0%, #f7f7f9 100%)', border: '1px solid var(--border-1)', borderRadius: 6, padding: 16, position: 'relative' }}>
                    <div style={{ height: 12, width: '50%', background: 'var(--fg-1)', opacity: 0.85, borderRadius: 2, marginBottom: 8 }}></div>
                    <div style={{ height: 6, width: '70%', background: 'var(--border-1)', borderRadius: 2, marginBottom: 6 }}></div>
                    <div style={{ height: 6, width: '60%', background: 'var(--border-1)', borderRadius: 2, marginBottom: 14 }}></div>
                    {[80,90,75,85,70].map((w,j) => <div key={j} style={{ height: 4, width: w + '%', background: 'var(--border-1)', borderRadius: 2, marginBottom: 4 }}></div>)}
                    <div style={{ position: 'absolute', top: 8, right: 8 }}><ScoreBadge value={p.score} live={i === 1 && session.live} /></div>
                  </div>
                  <div className="text-xs text-muted mt-2 text-center">{p.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Score progression</h3>
              <div className="flex items-center gap-2"><ScoreBadge value={session.initialScore} /><Icon name="arrow-right" size={12} style={{ stroke: 'var(--fg-4)' }} /><ScoreBadge value={session.latestScore} live={session.live} /></div>
            </div>
            <div style={{ padding: 20 }}>
              <Sparkline values={events.map(e => e.score)} color="var(--primary)" height={80} />
              <div className="flex justify-between text-xs text-muted mt-2">
                {events.map((e, i) => <span key={i}>{e.label || `t${i}`}</span>)}
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Artefacts</h3></div>
            <div style={{ padding: 12 }}>
              {[
                { n: 'source-resume.pdf', t: 'Source · v1', when: session.started },
                { n: 'snapshot-latest.json', t: 'Latest snapshot', when: session.lastActive },
                ...(session.amountPaid > 0 ? [{ n: 'final-export.pdf', t: 'Final export', when: session.lastActive }] : []),
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3" style={{ padding: '10px 8px', borderRadius: 6 }}>
                  <Icon name="file" size={16} style={{ stroke: 'var(--fg-3)' }} />
                  <div style={{ flex: 1 }}><div className="font-semi text-sm">{a.n}</div><div className="text-xs text-muted">{a.t}</div></div>
                  <span className="text-xs text-muted">{fmtDate(a.when)}</span>
                  <button className="btn btn-ghost btn-sm"><Icon name="external" size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          {otherSessions.length > 0 && (
            <div className="card mb-4">
              <div className="card-head"><h3 className="card-title">Other resumes by this candidate</h3><span className="count">{otherSessions.length}</span></div>
              <div style={{ padding: 8 }}>
                {otherSessions.map(s => (
                  <div key={s.id} className="flex items-center gap-3" style={{ padding: '10px 12px', borderRadius: 6, cursor: 'pointer' }}>
                    <span className="tnum text-muted text-sm">{s.id}</span>
                    <span className="text-sm" style={{ flex: 1 }}>{s.currentStage}</span>
                    <ScoreBadge value={s.latestScore} />
                    <span className="text-xs text-muted">{fmtDate(s.lastActive)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 3. LINKEDIN OPTIMISER  ───────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────

function LOListScreen({ openSession }) {
  const sessions = window.LO_SESSIONS;
  return (
    <div className="page">
      <ServicePageHead code="LO" title="LinkedIn Optimiser" sub="Self-serve · ₹199 · resume + LinkedIn URL → profile copy"
        actions={<button className="btn btn-primary"><Icon name="download" /> Download CSV</button>} />

      <div className="kpi-row mb-4">
        <KpiTile label="Sessions today" value={12} sub="started" />
        <KpiTile label="Conversions today" value={5} sub="paid" tone="green" />
        <KpiTile label="Conversion · 7d" value="34.6%" sub="of paywall views" />
        <KpiTile label="Avg resume score" value={68} sub="incoming" />
      </div>

      <div className="list-layout">
        <FilterRail>
          <FilterGroup title="Funnel stage" options={window.FUNNEL_LABELS.LO} selected={[]} onToggle={() => {}} />
          <h4>Has paid</h4>
          <div className="filter-group">
            {['All','Yes','No'].map(o => <label key={o} className="filter-chip"><span className="filter-chip-cb"></span><span>{o}</span></label>)}
          </div>
          <h4>Resume score</h4>
          <div style={{ padding: 6 }}><div className="text-xs text-muted">0 – 100</div></div>
        </FilterRail>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="left">

              <span className="text-xs text-muted">{sessions.length} sessions</span>
            </div>
          </div>
          <table className="tbl">
            <thead><tr><th>Session</th><th>Candidate</th><th>LinkedIn</th><th>Started</th><th>Current stage</th><th>Furthest</th><th>Status</th><th>Score</th><th>Paid</th><th></th></tr></thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} onClick={() => openSession && openSession(s.id)} style={{ cursor: 'pointer' }}>
                  <td className="tnum text-muted">{s.id}</td>
                  <td><div className="av-row"><Avatar initials={s.candidate.avatarInitials} /><div className="n">{s.candidate.name}</div></div></td>
                  <td onClick={e => e.stopPropagation()}><URLCell url={s.linkedinUrl} max={26} /></td>
                  <td className="muted">{fmtDate(s.started)}</td>
                  <td className="text-sm">{s.currentStage}</td>
                  <td className="text-sm muted">{s.furthestStage}</td>
                  <td><Pill tone={s.status === 'paid' ? 'violet' : s.status === 'progress' ? 'blue' : s.status === 'dropped' ? 'amber' : 'green'} dot>{s.status[0].toUpperCase()+s.status.slice(1)}</Pill></td>
                  <td><ScoreBadge value={s.score} /></td>
                  <td><Currency value={s.amountPaid} /></td>
                  <td><button className="row-actions" onClick={e => e.stopPropagation()}><Icon name="more" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LOCopyTabs({ candidate }) {
  const [tab, setTab] = React.useState('headline');
  const [copied, setCopied] = React.useState(false);
  const copy = (t) => { navigator.clipboard?.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const content = {
    headline: `${candidate.role} · Building global product teams · ex-${candidate.city} GCC · Open to senior IC roles`,
    about: `I'm a ${candidate.role} who's spent the last six years shipping production systems used by millions. I care about clean architecture, fast feedback loops, and great documentation. Currently looking for senior IC roles at GCCs of global product companies — Bengaluru, Hyderabad, or remote.\n\nIf you're hiring, my work is at github.com/${candidate.name.split(' ')[0].toLowerCase()}.`,
    experience: `Senior ${candidate.role} @ Talent500 · Aug 2023 – Present\n• Owned billing service migration — Kafka + Postgres, 40% p99 latency reduction\n• Mentored 4 engineers, partnered with PM and design on quarterly roadmaps\n• Shipped 12 features end-to-end, handled on-call rotation`,
  };

  return (
    <div className="card mb-4">
      <div className="card-head">
        <div className="flex items-center gap-1">
          {[['headline','Headline'],['about','About'],['experience','Experience']].map(([k,l]) => (
            <button key={k} className={`btn btn-sm ${tab === k ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(k)} style={{ padding: '0 12px' }}>{l}</button>
          ))}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => copy(content[tab])}><Icon name="tag" size={12} /> {copied ? 'Copied' : 'Copy'}</button>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ background: 'var(--bg-alt)', padding: 16, borderRadius: 8, border: '1px solid var(--border-1)', whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6, color: 'var(--fg-1)' }}>{content[tab]}</div>
      </div>
    </div>
  );
}

function LODetailScreen({ sessionId, goBack }) {
  const session = window.LO_SESSIONS.find(s => s.id === sessionId) || window.LO_SESSIONS[0];
  const stages = window.FUNNEL_LABELS.LO;
  return (
    <div className="page">
      <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--fg-3)' }}>
        <button className="btn btn-ghost btn-sm" onClick={goBack} style={{ padding: '0 8px' }}><Icon name="chevron-left" /> LinkedIn Optimiser</button>
        <span>›</span><span className="font-semi" style={{ color: 'var(--fg-1)' }}>{session.id}</span>
      </div>

      <div className="page-head">
        <div>
          <div className="flex items-center gap-3"><h1>{session.id}</h1><Pill tone={session.status === 'paid' ? 'violet' : 'green'} dot>{session.status[0].toUpperCase()+session.status.slice(1)}</Pill></div>
          <p>LinkedIn Optimiser · started {fmtDateTime(session.started)}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <ContextRail candidate={session.candidate} score={session.score}
          payment={session.amountPaid > 0 ? { amount: session.amountPaid, coupon: session.coupon, when: session.started } : null}
          sections={
            <div className="cand-rail-section" style={{ borderTop: '1px solid var(--border-1)' }}>
              <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>LinkedIn URL</div>
              <CodePreview code={session.linkedinUrl} />
            </div>
          }
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Funnel progress</h3></div>
            <div style={{ padding: 20 }}><FunnelBreadcrumb stages={stages} currentIdx={session.currentStageIdx} /></div>
          </div>

          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Source resume</h3><ScoreBadge value={session.score} /></div>
            <div style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 80, height: 105, background: 'linear-gradient(180deg,#fff,#f5f5f7)', border: '1px solid var(--border-1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="file" size={22} style={{ stroke: 'var(--fg-4)' }} />
              </div>
              <div>
                <div className="font-semi text-sm">{session.candidate.name.replace(/\s+/g, '_')}_resume.pdf</div>
                <div className="text-xs text-muted">Uploaded {fmtDateTime(session.started)}</div>
              </div>
            </div>
          </div>

          <LOCopyTabs candidate={session.candidate} />

          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Artefacts</h3></div>
            <div style={{ padding: 12 }}>
              {[{ n: 'source-resume.pdf', t: 'Source resume', when: session.started },
                { n: 'profile-copy.json', t: 'Generated copy', when: session.started }].map((a, i) => (
                <div key={i} className="flex items-center gap-3" style={{ padding: '10px 8px' }}>
                  <Icon name="file" size={16} style={{ stroke: 'var(--fg-3)' }} />
                  <div style={{ flex: 1 }}><div className="font-semi text-sm">{a.n}</div><div className="text-xs text-muted">{a.t}</div></div>
                  <span className="text-xs text-muted">{fmtDate(a.when)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 4. INTERVIEW IQ  ─────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────

function IIQListScreen({ openSession }) {
  const [planFilter, setPlanFilter] = React.useState([]);
  let sessions = window.IIQ_SESSIONS;
  if (planFilter.length) sessions = sessions.filter(s => planFilter.includes(s.plan));

  return (
    <div className="page">
      <ServicePageHead code="IIQ" title="Interview IQ" sub="Freemium · Free 10-min mock · Paid ₹299 · 45-min mock"
        actions={<button className="btn btn-primary"><Icon name="download" /> Download CSV</button>} />

      <div className="kpi-row mb-4">
        <KpiTile label="Sessions today" value={32} sub="all plans" />
        <KpiTile label="Free → paid · 7d" value={11} sub="upgrades" tone="green" />
        <KpiTile label="No-show rate" value="14%" sub="last 30 days" tone="amber" />
        <KpiTile label="Avg IQ score" value={72} sub="paid mocks · /100" />
      </div>

      <div className="list-layout">
        <FilterRail onClear={() => setPlanFilter([])}>
          <FilterGroup title="Plan" options={[{value:'free',label:'Free'},{value:'paid',label:'Paid'}]} selected={planFilter} onToggle={v => setPlanFilter(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v])} />
          <h4>Target job</h4>
          <div className="filter-group">
            {['SDE-2','PM','Frontend','Data Scientist','Backend','UX'].map(o => <label key={o} className="filter-chip"><span className="filter-chip-cb"></span><span>{o}</span></label>)}
          </div>
          <h4>Attempt status</h4>
          <div className="filter-group">
            {['In progress','Completed','No-show','Cancelled'].map(o => <label key={o} className="filter-chip"><span className="filter-chip-cb"></span><span>{o}</span></label>)}
          </div>
          <h4>Interview score</h4>
          <div style={{ padding: 6 }}><div className="text-xs text-muted">0 – 100</div></div>
          <h4>Funnel stage</h4>
          <div className="filter-group">
            {window.FUNNEL_LABELS.IIQ.map(o => <label key={o} className="filter-chip"><span className="filter-chip-cb"></span><span>{o}</span></label>)}
          </div>
        </FilterRail>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="left">

              <span className="text-xs text-muted">{sessions.length} sessions</span>
            </div>
          </div>
          <table className="tbl">
            <thead><tr><th>Session</th><th>Candidate</th><th>Plan</th><th>Target job</th><th>Duration</th><th>Attempt</th><th>IQ score</th><th>Started</th><th>Paid</th><th></th></tr></thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} onClick={() => openSession && openSession(s.id)} style={{ cursor: 'pointer' }}>
                  <td className="tnum text-muted">{s.id}</td>
                  <td><div className="av-row"><Avatar initials={s.candidate.avatarInitials} /><div className="n">{s.candidate.name}</div></div></td>
                  <td><PlanPill plan={s.plan} /></td>
                  <td className="text-sm">{s.target}</td>
                  <td className="muted text-sm">{s.duration}</td>
                  <td><Pill tone={s.attemptStatus === 'Completed' ? 'green' : s.attemptStatus === 'In progress' ? 'violet' : s.attemptStatus === 'No-show' ? 'red' : 'grey'} dot>{s.attemptStatus}</Pill></td>
                  <td>{s.interviewScore != null ? <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: s.interviewScore >= 70 ? 'var(--green-strong)' : s.interviewScore >= 50 ? 'var(--amber-strong)' : 'var(--red-strong)' }}>{s.interviewScore}<span style={{ color: 'var(--fg-3)', fontSize: 11, fontWeight: 400 }}>/100</span></span> : <span className="text-xs text-muted">—</span>}</td>
                  <td className="muted">{fmtDate(s.started)}</td>
                  <td>{s.plan === 'free' ? <span className="text-xs text-muted">Free</span> : <Currency value={s.amountPaid} />}</td>
                  <td><button className="row-actions" onClick={e => e.stopPropagation()}><Icon name="more" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function IIQDetailScreen({ sessionId, goBack }) {
  const session = window.IIQ_SESSIONS.find(s => s.id === sessionId) || window.IIQ_SESSIONS[0];
  const stages = window.FUNNEL_LABELS.IIQ;
  const others = window.IIQ_SESSIONS.filter(s => s.candidate.id === session.candidate.id && s.id !== session.id).slice(0, 4);

  const breakdown = [
    { c: 'Communication', v: 78 },
    { c: 'Technical depth', v: 64 },
    { c: 'Problem solving', v: 71 },
    { c: 'Cultural fit', v: 82 },
  ];

  return (
    <div className="page">
      <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--fg-3)' }}>
        <button className="btn btn-ghost btn-sm" onClick={goBack} style={{ padding: '0 8px' }}><Icon name="chevron-left" /> Interview IQ</button>
        <span>›</span><span className="font-semi" style={{ color: 'var(--fg-1)' }}>{session.id}</span>
      </div>

      <div className="page-head">
        <div>
          <div className="flex items-center gap-3"><h1>{session.id}</h1><PlanPill plan={session.plan} /><Pill tone={session.attemptStatus === 'Completed' ? 'green' : session.attemptStatus === 'In progress' ? 'violet' : 'grey'} dot>{session.attemptStatus}</Pill></div>
          <p>Interview IQ · {session.target}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <ContextRail candidate={session.candidate}
          sections={
            <>
              <div className="cand-rail-section" style={{ borderTop: '1px solid var(--border-1)' }}>
                <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Plan</div>
                <PlanPill plan={session.plan} />
              </div>
              <div className="cand-rail-section" style={{ borderTop: '1px solid var(--border-1)' }}>
                <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Target job</div>
                <div className="text-sm font-semi">{session.target}</div>
                <div className="text-xs text-muted mt-1">Duration: {session.duration}</div>
              </div>
            </>
          }
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Session summary</h3></div>
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {[
                { l: 'Started', v: fmtDateTime(session.started) },
                { l: 'Plan', v: session.plan === 'paid' ? 'Paid · ₹299' : 'Free' },
                { l: 'Duration', v: session.duration },
                { l: 'IQ score', v: session.interviewScore != null ? session.interviewScore + '/100' : '—' },
              ].map((it, i) => (
                <div key={i}><div className="text-xs cap" style={{ color: 'var(--fg-3)' }}>{it.l}</div><div className="font-semi text-sm mt-1">{it.v}</div></div>
              ))}
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Recording & transcript</h3></div>
            <div style={{ padding: 20 }}>
              {session.attemptStatus === 'Completed' ? (
                <div className="flex gap-3">
                  <a href="#" target="_blank" rel="noopener" className="btn btn-secondary" onClick={e => e.preventDefault()}><Icon name="external" /> Open recording</a>
                  <a href="#" target="_blank" rel="noopener" className="btn btn-secondary" onClick={e => e.preventDefault()}><Icon name="external" /> Open transcript</a>
                </div>
              ) : (
                <div className="text-sm text-muted">Not available — session not completed.</div>
              )}
            </div>
          </div>

          {session.interviewScore != null && (
            <div className="card mb-4">
              <div className="card-head"><h3 className="card-title">Interview score & feedback</h3>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: session.interviewScore >= 70 ? 'var(--green-strong)' : 'var(--amber-strong)' }}>{session.interviewScore}<span style={{ color: 'var(--fg-3)', fontSize: 12, fontWeight: 400 }}>/100</span></span>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  {breakdown.map(b => (
                    <div key={b.c} className="flex items-center gap-3">
                      <span className="text-xs" style={{ width: 130, color: 'var(--fg-2)' }}>{b.c}</span>
                      <div style={{ flex: 1, height: 6, background: 'var(--bg-alt)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: b.v + '%', height: '100%', background: b.v >= 70 ? 'var(--green-strong)' : b.v >= 50 ? 'var(--amber-strong)' : 'var(--red-strong)' }}></div>
                      </div>
                      <span className="text-xs font-semi tnum" style={{ width: 32 }}>{b.v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'var(--bg-alt)', padding: 14, borderRadius: 6 }}>
                  <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Narrative</div>
                  <p className="text-sm" style={{ color: 'var(--fg-2)', lineHeight: 1.6 }}>Strong communication and good cultural alignment with global product teams. Technical depth on system design solid; recommend more practice on dynamic-programming style algorithmic questions before next attempt.</p>
                </div>
              </div>
            </div>
          )}

          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Funnel progress</h3></div>
            <div style={{ padding: 20 }}><FunnelBreadcrumb stages={stages} currentIdx={session.currentStageIdx} /></div>
          </div>

          {others.length > 0 && (
            <div className="card mb-4">
              <div className="card-head"><h3 className="card-title">Other attempts by this candidate</h3><span className="count">{others.length}</span></div>
              <div style={{ padding: 8 }}>
                {others.map(o => (
                  <div key={o.id} className="flex items-center gap-3" style={{ padding: '10px 12px', borderRadius: 6 }}>
                    <span className="tnum text-muted text-sm">{o.id}</span>
                    <PlanPill plan={o.plan} />
                    <span className="text-sm" style={{ flex: 1 }}>{o.target}</span>
                    <span className="text-sm">{o.interviewScore != null ? o.interviewScore + '/100' : '—'}</span>
                    <span className="text-xs text-muted">{fmtDate(o.started)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 5. RECRUITER CONNECT  ────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────

function RCListScreen({ openOrder }) {
  const [stateFilter, setStateFilter] = React.useState([]);
  let orders = window.RC_ORDERS_FULL;
  if (stateFilter.length) orders = orders.filter(o => stateFilter.includes(o.state));
  const counts = {};
  window.RC_STATES_ALL.forEach(s => counts[s] = window.RC_ORDERS_FULL.filter(o => o.state === s).length);

  return (
    <div className="page">
      <ServicePageHead code="RC" title="Recruiter Connect" sub="Manual delivery · ₹1,499 · 30-min recruiter call + post-call report"
        actions={<button className="btn btn-primary"><Icon name="download" /> Download CSV</button>} />

      <div style={{ background: 'var(--primary-50)', padding: '10px 16px', borderRadius: 6, marginBottom: 16, fontSize: 13, color: 'var(--primary-800)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="info" size={14} style={{ stroke: 'var(--primary)' }} />
        <span>v1: manual assignment only. No recruiter availability calendar — assign from the row action menu.</span>
      </div>

      <div className="kpi-row mb-4">
        <KpiTile label="Awaiting schedule" value={orders.filter(o => o.state === 'New').length} sub="needs assignment" tone="amber" />
        <KpiTile label="Calls this week" value={orders.filter(o => o.state === 'Scheduled').length} sub="confirmed" />
        <KpiTile label="Reports pending" value={orders.filter(o => o.state === 'Conducted').length} sub="post-call" />
        <KpiTile label="Report ready" value={orders.filter(o => o.state === 'Report Ready').length} sub="ready to deliver" tone="green" />
      </div>

      <div className="list-layout">
        <FilterRail onClear={() => setStateFilter([])}>
          <FilterGroup title="Status" options={window.RC_STATES_ALL} selected={stateFilter} onToggle={v => setStateFilter(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v])} counts={counts} />
          <h4>Recruiter</h4>
          <div className="filter-group">
            {['Anjali Verma','Rohit Singh','Maya Krishnan','Devika P.','Akash R.','Unassigned'].map(o => <label key={o} className="filter-chip"><span className="filter-chip-cb"></span><span>{o}</span></label>)}
          </div>
          <h4>Call status</h4>
          <div className="filter-group">
            {['Awaiting','Proposed','Confirmed','Conducted','Missed'].map(o => <label key={o} className="filter-chip"><span className="filter-chip-cb"></span><span>{o}</span></label>)}
          </div>
          <h4>Days since payment</h4>
          <div style={{ padding: 6 }}><div className="text-xs text-muted">0 – 30 days</div></div>
        </FilterRail>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="left">

              <span className="text-xs text-muted">{orders.length} orders</span>
            </div>
          </div>
          <table className="tbl">
            <thead><tr><th>Order</th><th>Candidate</th><th>Status</th><th>Recruiter</th><th>Slot</th><th>Call</th><th>Days since pay</th><th>Paid</th><th>Coupon</th><th></th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} onClick={() => openOrder && openOrder(o.id)} style={{ cursor: 'pointer' }}>
                  <td className="tnum text-muted">{o.id}</td>
                  <td><div className="av-row"><Avatar initials={o.candidate.avatarInitials} /><div className="n">{o.candidate.name}</div></div></td>
                  <td><Pill tone={window.rcStateTone(o.state)} dot>{o.state}</Pill></td>
                  <td className="muted text-sm">{o.recruiter}</td>
                  <td className="muted text-sm">{o.slot ? fmtDateTime(o.slot) + ' IST' : '—'}</td>
                  <td><span className="text-xs cap" style={{ color: 'var(--fg-2)' }}>{o.callStatus}</span></td>
                  <td className="tnum text-sm">{o.daysSincePayment}d</td>
                  <td><Currency value={o.amountPaid} /></td>
                  <td><CouponCell code={o.coupon} /></td>
                  <td><button className="row-actions" onClick={e => e.stopPropagation()}><Icon name="more" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RCDetailScreen({ orderId, goBack }) {
  const order = window.RC_ORDERS_FULL.find(o => o.id === orderId) || window.RC_ORDERS_FULL[0];
  const [currentState, setCurrentState] = React.useState(order.state);
  const slotPassed = order.slot && order.slot < new Date();

  const scheduleHistory = order.slot ? [
    { actor: 'Anjali Verma', action: 'proposed slot', when: relDate(order.daysSincePayment - 1, 12, 0) },
    { actor: 'Candidate', action: 'confirmed slot', when: relDate(order.daysSincePayment - 1, 14, 22) },
  ] : [];

  const history = [
    { actor: 'System', action: 'order created', when: order.placed },
    ...(order.recruiter !== '—' ? [{ actor: 'Sushant V.', action: `assigned recruiter ${order.recruiter}`, when: relDate(order.daysSincePayment, 9, 30), reason: 'Domain match' }] : []),
  ];

  return (
    <div className="page">
      <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--fg-3)' }}>
        <button className="btn btn-ghost btn-sm" onClick={goBack} style={{ padding: '0 8px' }}><Icon name="chevron-left" /> Recruiter Connect</button>
        <span>›</span><span className="font-semi" style={{ color: 'var(--fg-1)' }}>{order.id}</span>
      </div>

      <div className="page-head">
        <div>
          <div className="flex items-center gap-3"><h1>{order.id}</h1><Pill tone={window.rcStateTone(order.state)} dot>{order.state}</Pill></div>
          <p>Recruiter Connect · placed {fmtDateTime(order.placed)}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <ContextRail candidate={order.candidate} score={order.score}
          payment={{ amount: order.amountPaid, coupon: order.coupon, when: order.placed }}
          sections={
            <div className="cand-rail-section" style={{ borderTop: '1px solid var(--border-1)' }}>
              <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Days since payment</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: order.daysSincePayment > 7 ? 'var(--amber-strong)' : 'var(--fg-1)', lineHeight: 1 }}>{order.daysSincePayment}<span style={{ fontSize: 14, color: 'var(--fg-3)', fontWeight: 500 }}>d</span></div>
            </div>
          }
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <StatusTransitionPanel currentState={currentState} transitions={window.RC_TRANSITIONS} tone={window.rcStateTone} history={history} onTransition={setCurrentState} />

          {/* Scheduling panel */}
          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Scheduling</h3>
              <button className="btn btn-secondary btn-sm"><Icon name="refresh" size={12} /> Reschedule</button>
            </div>
            <div style={{ padding: 20 }}>
              {order.slot ? (
                <div className="flex items-start gap-3" style={{ padding: 14, background: 'var(--bg-alt)', borderRadius: 8, marginBottom: 14 }}>
                  <Icon name="clock" size={16} style={{ stroke: 'var(--primary)' }} />
                  <div style={{ flex: 1 }}>
                    <div className="font-semi text-sm">{fmtDateTime(order.slot)} IST</div>
                    <div className="text-xs text-muted">30 min · with {order.recruiter}</div>
                  </div>
                  <Pill tone={slotPassed ? 'grey' : 'green'} dot>{slotPassed ? 'Passed' : 'Confirmed'}</Pill>
                </div>
              ) : (
                <div className="text-sm text-muted" style={{ marginBottom: 14 }}>No slot proposed yet.</div>
              )}
              {scheduleHistory.length > 0 && (
                <>
                  <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Schedule history</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {scheduleHistory.map((h, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm" style={{ padding: '6px 0' }}>
                        <span className="font-semi">{h.actor}</span>
                        <span className="text-muted">{h.action}</span>
                        <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>{fmtDateTime(h.when)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Call panel */}
          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Call</h3>
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm" disabled={!slotPassed || order.state !== 'Scheduled'}><Icon name="check" size={12} /> Mark conducted</button>
                <button className="btn btn-secondary btn-sm" disabled={!slotPassed || order.state !== 'Scheduled'}><Icon name="x" size={12} /> Mark no-show</button>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              {!slotPassed && order.state === 'Scheduled' && <div className="text-sm text-muted" style={{ marginBottom: 14 }}>Mark actions enable after the slot has passed.</div>}
              {['Conducted','Report Ready','Delivered'].includes(order.state) && (
                <>
                  <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Recruiter summary</div>
                  <div style={{ background: 'var(--bg-alt)', padding: 14, borderRadius: 8, marginBottom: 14 }}>
                    <p className="text-sm" style={{ color: 'var(--fg-2)', lineHeight: 1.6 }}>Solid 30-min conversation. {order.candidate.name.split(' ')[0]} is open to mid-2026 senior IC roles in Bengaluru/Hyderabad GCCs. Strong fundamentals, good comm, expecting 35-40 LPA. Notice period: 60 days. Recommend introducing to GCC product roles in the queue.</p>
                  </div>
                </>
              )}
              <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Post-call notes</div>
              <textarea className="t500-input" placeholder="Add internal notes about this call…" style={{ width: '100%', minHeight: 60, padding: 10, resize: 'vertical' }}></textarea>
            </div>
          </div>

          {/* Report panel */}
          {['Report Ready','Delivered'].includes(order.state) && (
            <div className="card mb-4">
              <div className="card-head"><h3 className="card-title">Report</h3><span className="text-xs text-muted">2 versions</span></div>
              <div style={{ padding: 8 }}>
                {[{ v: 'v2', uploader: order.recruiter, when: relDate(0, 14, 30), note: 'Polished tone in recommendation block', isFinal: order.state === 'Delivered' },
                  { v: 'v1', uploader: order.recruiter, when: relDate(1, 11, 0) }].map((v, i) => (
                  <div key={i} className="flex items-center gap-3" style={{ padding: '12px 14px', borderBottom: i === 0 ? '1px solid var(--border-1)' : 'none' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12, color: 'var(--primary-800)', background: 'var(--primary-50)', padding: '3px 8px', borderRadius: 4 }}>{v.v}</span>
                    <div style={{ flex: 1 }}><div className="font-semi text-sm">Uploaded by {v.uploader}</div>{v.note && <div className="text-xs text-muted">{v.note}</div>}</div>
                    <span className="text-xs text-muted">{fmtDateTime(v.when)}</span>
                    {v.isFinal ? <Pill tone="green" dot>Final</Pill> : <button className="btn btn-ghost btn-sm">Mark as final</button>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <NotesPanel />
          <ActivityLogPanel events={[
            { icon: 'card', tone: 'violet', when: order.placed, text: 'Order placed', meta: [fmtINR(order.amountPaid), order.coupon ? `Coupon ${order.coupon}` : null].filter(Boolean) },
            ...(order.recruiter !== '—' ? [{ icon: 'user', tone: 'green', when: relDate(order.daysSincePayment, 10, 0), text: `Recruiter assigned: ${order.recruiter}`, meta: [] }] : []),
            ...(order.slot ? [{ icon: 'clock', tone: 'blue', when: relDate(order.daysSincePayment - 1, 14, 22), text: `Slot confirmed: ${fmtDateTime(order.slot)}`, meta: [] }] : []),
            { icon: 'pulse', tone: 'blue', when: relDate(0, 12, 0), text: 'Status: ' + order.state, meta: [] },
          ]} />
        </div>
      </div>
    </div>
  );
}

// Service router that picks the right list
// ─────────────────────────────────────────────────────────────────────
// 6. MANUAL RESUME REWRITE
// ─────────────────────────────────────────────────────────────────────

function MRRListScreen({ openOrder }) {
  const [stateFilter, setStateFilter] = React.useState([]);
  const orders = window.MRR_ORDERS;
  let filtered = orders;
  if (stateFilter.length) filtered = filtered.filter(o => stateFilter.includes(o.state));

  const counts = {};
  window.MRR_STATES_ALL.forEach(s => counts[s] = orders.filter(o => o.state === s).length);
  const open = orders.filter(o => !['Delivered','Cancelled'].includes(o.state));

  return (
    <div className="page">
      <ServicePageHead code="MRR" title="Manual Resume Rewrite" sub="Manual delivery"
        actions={<>

          <button className="btn btn-primary"><Icon name="download" /> Download CSV</button>
        </>} />

      <div className="kpi-row mb-4" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <KpiTile label="New" value={orders.filter(o => o.state === 'New').length} sub="no resume or writer yet" tone="amber" />
        <KpiTile label="In Rewrite" value={orders.filter(o => o.state === 'In Rewrite').length} sub="writer working" tone="violet" />
        <KpiTile label="Delivered" value={orders.filter(o => o.state === 'Delivered').length} sub="completed" tone="green" />
        <KpiTile label="Cancelled" value={orders.filter(o => o.state === 'Cancelled').length} sub="cancelled" tone="red" />
      </div>

      <div className="list-layout">
        <FilterRail onClear={() => setStateFilter([])}>
          <FilterGroup title="Status" options={window.MRR_STATES_ALL} selected={stateFilter} onToggle={v => setStateFilter(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v])} counts={counts} />
          {!window.ACCESS.isRestricted() && (
            <>
              <h4>Writer</h4>
              <div className="filter-group">
                {[...(window.TEAM_MEMBERS || []).filter(m => m.role === 'resume_writer' && m.status === 'active').map(m => m.name), 'Unassigned'].map(w => (
                  <label key={w} className="filter-chip"><span className="filter-chip-cb"></span><span>{w}</span></label>
                ))}
              </div>
            </>
          )}
        </FilterRail>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="left">

              <span className="text-xs text-muted">{filtered.length} of {orders.length}</span>
            </div>
          </div>
          <table className="tbl">
            <thead><tr>
              <th>Order</th><th>Candidate</th><th>Status</th>
              <th>Writer</th><th>Score (before)</th><th>Score (after)</th><th>Paid</th><th>RR Discount</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} onClick={() => openOrder && openOrder(o.id)} style={{ cursor: 'pointer' }}>
                  <td className="tnum text-muted">{o.id}</td>
                  <td><div className="av-row"><Avatar initials={o.candidate.avatarInitials} /><div><div className="n">{o.candidate.name}</div><div className="e">{o.candidate.email}</div></div></div></td>
                  <td><Pill tone={window.mrrStateTone(o.state)} dot>{o.state}</Pill></td>
                  <td className="text-sm text-muted">{o.writer}</td>
                  <td>{o.originalResume ? <ScoreBadge value={o.originalScore} /> : <span className="text-xs text-muted">—</span>}</td>
                  <td>{o.rewrittenScore ? <ScoreBadge value={o.rewrittenScore} /> : <span className="text-xs text-muted">—</span>}</td>
                  <td><Currency value={o.amountPaid} /></td>
                  <td>{o.rrDiscount > 0 ? <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green-strong)', background: 'var(--green-soft)', padding: '2px 7px', borderRadius: 4 }}>-₹99</span> : <span className="text-xs text-muted">—</span>}</td>
                  <td><button className="row-actions" onClick={e => e.stopPropagation()}><Icon name="more" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MRRDetailScreen({ orderId, goBack }) {
  const order = window.MRR_ORDERS.find(o => o.id === orderId) || window.MRR_ORDERS[0];
  const [rewrittenUploaded, setRewrittenUploaded] = React.useState(!!order.rewrittenResume);
  const [uploadedScore, setUploadedScore] = React.useState(order.rewrittenScore);
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [mrrOriginalResume, setMrrOriginalResume] = React.useState(order.originalResume);
  const [showOriginalUploadModal, setShowOriginalUploadModal] = React.useState(false);
  const [assignedWriter, setAssignedWriter] = React.useState(order.writer || '—');
  const [currentState, setCurrentState] = React.useState(order.state);

  const history = [
    { actor: 'System', action: 'order created', when: order.placed },
    ...(order.originalResume ? [{ actor: 'Candidate', action: 'uploaded original resume', when: order.originalResume.uploadedAt }] : []),
    ...(order.writer !== '—' ? [{ actor: 'Sushant V.', action: `assigned writer ${order.writer}`, when: relDate(0, 10, 0), reason: 'Manual' }] : []),
    ...(order.rewrittenResume ? [{ actor: order.writer, action: 'uploaded rewritten resume', when: order.rewrittenResume.uploadedAt }] : []),
  ].filter(h => h.when);

  const mrrRequirements = currentState === 'New' ? [
    { label: 'Resume uploaded', met: !!mrrOriginalResume },
    { label: 'Writer assigned', met: assignedWriter !== '—' },
  ] : null;

  const mrrBlockedTransitions = currentState === 'New' && (!mrrOriginalResume || assignedWriter === '—')
    ? { 'In Rewrite': !mrrOriginalResume && assignedWriter === '—' ? 'Upload resume and assign a writer first'
        : !mrrOriginalResume ? 'Upload candidate resume first'
        : 'Assign a writer first' }
    : null;

  return (
    <div className="page">
      <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--fg-3)' }}>
        <button className="btn btn-ghost btn-sm" onClick={goBack} style={{ padding: '0 8px' }}><Icon name="chevron-left" /> Manual Resume Rewrite</button>
        <span>›</span><span className="font-semi" style={{ color: 'var(--fg-1)' }}>{order.id}</span>
      </div>

      <div className="page-head">
        <div>
          <div className="flex items-center gap-3">
            <h1>{order.id}</h1>
            <Pill tone={window.mrrStateTone(currentState)} dot>{currentState}</Pill>
          </div>
          <p>Manual Resume Rewrite · placed {fmtDateTime(order.placed)}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Left context rail */}
        <aside className="cand-rail" style={{ width: 280, flex: '0 0 280px' }}>
          <div className="cand-rail-card">
            {/* Candidate */}
            <div className="cand-rail-section">
              <div className="flex items-center gap-3 mb-3">
                <Avatar initials={order.candidate.avatarInitials} size="lg" />
                <div>
                  <div className="font-semi" style={{ fontSize: 14 }}>{order.candidate.name}</div>
                  <div className="text-xs text-muted">{order.candidate.email}</div>
                </div>
              </div>
              {/* Score before/after */}
              <div style={{ padding: '10px', background: 'var(--bg-alt)', borderRadius: 8 }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted">Score before</span>
                  {mrrOriginalResume ? <ScoreBadge value={order.originalScore} /> : <span className="text-xs text-muted">—</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Score after</span>
                  {uploadedScore ? <ScoreBadge value={uploadedScore} /> : <span className="text-xs text-muted">Pending rewrite</span>}
                </div>
                {uploadedScore && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-1)', display: 'flex', justifyContent: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-strong)' }}>+{uploadedScore - order.originalScore} pts improvement</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="cand-rail-section" style={{ borderTop: '1px solid var(--border-1)' }}>
              <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Payment</div>
              {order.rrDiscount > 0 && (
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted">RR discount</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-strong)' }}>-{fmtINR(order.rrDiscount)}</span>
                </div>
              )}
              {order.coupon && (
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted">Coupon</span>
                  <CouponCell code={order.coupon} />
                </div>
              )}
              <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-1)', paddingTop: 6, marginTop: 4 }}>
                <span className="text-xs font-semi">Total paid</span>
                <span className="font-semi text-sm tnum">{fmtINR(order.amountPaid)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-muted">Paid on</span>
                <span className="text-sm tnum">{fmtDate(order.placed)}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <StatusTransitionPanel currentState={currentState} transitions={window.MRR_TRANSITIONS} tone={window.mrrStateTone} history={history} onTransition={setCurrentState}
            writerNode={!window.ACCESS.isRestricted() && <window.WriterPickerBtn value={assignedWriter} onChange={setAssignedWriter} />}
            requirements={mrrRequirements} blockedTransitions={mrrBlockedTransitions} />

          {/* Documents */}
          <div className="card mb-4">
            <div className="card-head"><h3 className="card-title">Resumes</h3></div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Original resume */}
              <div>
                <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Original resume (from candidate)</div>
                {mrrOriginalResume ? (
                  <div className="flex items-center gap-3" style={{ padding: '12px 14px', background: 'var(--bg-alt)', borderRadius: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="file" size={15} style={{ stroke: 'var(--primary)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="font-semi text-sm">{mrrOriginalResume.name}</div>
                      <div className="text-xs text-muted">Uploaded {fmtDateTime(mrrOriginalResume.uploadedAt)} · Score: <span style={{ fontWeight: 600 }}>{order.originalScore}</span></div>
                    </div>
                    <button className="btn btn-ghost btn-sm"><Icon name="download" size={13} /> Download</button>
                  </div>
                ) : (
                  <div style={{ padding: '14px 16px', background: 'var(--bg-alt)', borderRadius: 8, border: '2px dashed var(--border-2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Icon name="upload" size={16} style={{ stroke: 'var(--fg-3)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="text-sm font-semi" style={{ marginBottom: 1 }}>No resume uploaded during payment</div>
                      <div className="text-xs text-muted">Obtain the resume from the candidate and upload it manually.</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowOriginalUploadModal(true)}>Upload resume</button>
                  </div>
                )}
              </div>

              {/* Rewritten resume — only shown from In Rewrite onwards */}
              {(currentState === 'In Rewrite' || currentState === 'Delivered' || rewrittenUploaded) && <div>
                <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Rewritten resume (writer upload)</div>
                {rewrittenUploaded && order.rewrittenResume ? (
                  <div className="flex items-center gap-3" style={{ padding: '12px 14px', background: 'var(--green-soft)', borderRadius: 8, border: '1px solid var(--green-strong)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="file" size={15} style={{ stroke: 'var(--green-strong)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="font-semi text-sm">{order.rewrittenResume.name}</div>
                      <div className="text-xs" style={{ color: 'var(--green-strong)' }}>Uploaded {fmtDateTime(order.rewrittenResume.uploadedAt)} · Score: <span style={{ fontWeight: 700 }}>{uploadedScore}</span></div>
                    </div>
                    <Pill tone="green" dot>Uploaded</Pill>
                    <button className="btn btn-ghost btn-sm"><Icon name="download" size={13} /> Download</button>
                  </div>
                ) : (
                  <div style={{ padding: '14px 16px', background: 'var(--bg-alt)', borderRadius: 8, border: '2px dashed var(--border-2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Icon name="upload" size={16} style={{ stroke: 'var(--fg-3)' }} />
                    <div style={{ flex: 1 }}>
                      <div className="text-sm font-semi">Upload rewritten resume</div>
                      <div className="text-xs text-muted">PDF or DOCX · Score will be auto-calculated on upload</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowUploadModal(true)} disabled={!mrrOriginalResume || currentState !== 'In Rewrite'}>Upload</button>
                  </div>
                )}
              </div>}

            </div>
          </div>

          <NotesPanel />
          <ActivityLogPanel events={[
            { icon: 'card', tone: 'violet', when: order.placed, text: 'Order placed', meta: [fmtINR(order.amountPaid), order.rrDiscount > 0 ? `RR discount -₹99 applied` : null, order.coupon ? `Coupon ${order.coupon}` : null].filter(Boolean) },
            ...(mrrOriginalResume ? [{ icon: 'upload', tone: 'blue', when: mrrOriginalResume.uploadedAt, text: order.originalResume ? 'Candidate submitted original resume' : 'Resume uploaded manually by ops', meta: [`Score: ${order.originalScore}`] }] : []),
            ...(order.writer !== '—' ? [{ icon: 'user', tone: 'green', when: relDate(0, 10, 0), text: `Writer assigned: ${order.writer}`, meta: [] }] : []),
            ...(order.rewrittenResume ? [{ icon: 'file', tone: 'green', when: order.rewrittenResume.uploadedAt, text: 'Rewritten resume uploaded', meta: [`Score: ${uploadedScore}`] }] : []),
          ].filter(e => e.when)} />
        </div>
      </div>

      {/* Upload candidate resume modal */}
      {showOriginalUploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 440, boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Upload candidate resume</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowOriginalUploadModal(false)}><Icon name="x" size={14} /></button>
            </div>
            <div style={{ padding: '24px', background: 'var(--bg-alt)', borderRadius: 8, border: '2px dashed var(--border-2)', textAlign: 'center', marginBottom: 16 }}>
              <Icon name="upload" size={24} style={{ stroke: 'var(--fg-3)', marginBottom: 8 }} />
              <div className="text-sm font-semi" style={{ marginBottom: 4 }}>Drop file here or click to browse</div>
              <div className="text-xs text-muted">PDF or DOCX</div>
            </div>
            <p className="text-xs text-muted" style={{ marginBottom: 16 }}>Manually obtained from the candidate. Will be visible to the assigned writer.</p>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-secondary" onClick={() => setShowOriginalUploadModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                setMrrOriginalResume({ name: `${order.candidate.name.split(' ')[0]}_Resume.pdf`, uploadedAt: new Date() });
                setShowOriginalUploadModal(false);
              }}>Upload</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload rewritten resume modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 440, boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Upload rewritten resume</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowUploadModal(false)}><Icon name="x" size={14} /></button>
            </div>
            <div style={{ padding: '24px', background: 'var(--bg-alt)', borderRadius: 8, border: '2px dashed var(--border-2)', textAlign: 'center', marginBottom: 16 }}>
              <Icon name="upload" size={24} style={{ stroke: 'var(--fg-3)', marginBottom: 8 }} />
              <div className="text-sm font-semi" style={{ marginBottom: 4 }}>Drop file here or click to browse</div>
              <div className="text-xs text-muted">PDF or DOCX</div>
            </div>
            <div className="flex items-center justify-between" style={{ padding: '10px 14px', background: 'var(--primary-50)', borderRadius: 8, marginBottom: 16 }}>
              <span className="text-xs" style={{ color: 'var(--primary-800)' }}>Resume score will be auto-calculated after upload</span>
              <Icon name="pulse" size={13} style={{ stroke: 'var(--primary)' }} />
            </div>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const newScore = order.rewrittenScore || Math.min(95, order.originalScore + 18);
                setUploadedScore(newScore);
                setRewrittenUploaded(true);
                setShowUploadModal(false);
              }}>Upload & calculate score</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceListRouter({ code, openOrder }) {
  if (code === 'RR') return <RRListScreen openOrder={openOrder} />;
  if (code === 'RB') return <RBListScreen openSession={openOrder} />;
  if (code === 'LO') return <LOListScreen openSession={openOrder} />;
  if (code === 'IIQ') return <IIQListScreen openSession={openOrder} />;
  if (code === 'RC') return <RCListScreen openOrder={openOrder} />;
  if (code === 'MRR') return <MRRListScreen openOrder={openOrder} />;
  return null;
}

function ServiceDetailRouter({ code, id, goBack }) {
  if (code === 'RR') return <RRDetailScreen orderId={id} goBack={goBack} />;
  if (code === 'RB') return <RBDetailScreen sessionId={id} goBack={goBack} />;
  if (code === 'LO') return <LODetailScreen sessionId={id} goBack={goBack} />;
  if (code === 'IIQ') return <IIQDetailScreen sessionId={id} goBack={goBack} />;
  if (code === 'RC') return <RCDetailScreen orderId={id} goBack={goBack} />;
  if (code === 'MRR') return <MRRDetailScreen orderId={id} goBack={goBack} />;
  return null;
}

window.ServiceListRouter = ServiceListRouter;
window.ServiceDetailRouter = ServiceDetailRouter;
