/* Candidate 360 detail — hi-fi.
   Two-column: left context rail + right work area with tabs. */

function Candidate360({ candidateId, goBack }) {
  const c = window.CANDIDATES.find(x => x.id === candidateId) || window.CANDIDATES[0];
  const [tab, setTab] = React.useState('overview');
  const [tags, setTags] = React.useState(c.tags);
  const [modal, setModal] = React.useState(null);
  const timeline = window.buildTimelineFor(c);

  const addTag = (t) => { if (t && !tags.includes(t)) setTags([...tags, t]); };

  return (
    <div className="page">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--fg-3)' }}>
        <button className="btn btn-ghost btn-sm" onClick={goBack} style={{ padding: '0 8px' }}>
          <window.Icon name="chevron-left" /> Candidates
        </button>
        <span>/</span>
        <span style={{ color: 'var(--fg-1)', fontWeight: 500 }}>{c.name}</span>
        <span className="tnum text-xs" style={{ color: 'var(--fg-4)' }}>· {c.id}</span>
      </div>

      {/* Header */}
      <div className="card card-pad mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'flex-start' }}>
        <div className="flex gap-4 items-start">
          <Avatar initials={c.avatarInitials} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2" style={{ flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.014em', color: 'var(--fg-1)', margin: 0 }}>{c.name}</h2>
              <LifecyclePill stage={c.lc} />
              {c.dnc && <span className="dnc">Do not contact</span>}
            </div>
            <div className="flex gap-4 text-sm" style={{ color: 'var(--fg-3)', flexWrap: 'wrap' }}>
              <span className="flex items-center gap-2"><window.Icon name="mail" size={13} />{c.email}</span>
              <span className="flex items-center gap-2"><window.Icon name="phone" size={13} />{c.phone}</span>
              <span className="flex items-center gap-2"><window.Icon name="pin" size={13} />{c.city}</span>
            </div>
            <div className="flex gap-3 mt-3" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <TagList tags={tags} onAdd={() => setModal('tag')} />
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div className="text-xs cap" style={{ color: 'var(--fg-3)', marginBottom: 6 }}>Resume score</div>
          <ScoreBadge value={c.score} size="xl" />
          <div className="text-xs" style={{ color: 'var(--fg-3)', marginTop: 6 }}>Last updated {fmtDate(c.lastActive)}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setModal('lc')}><window.Icon name="flag" /> Lifecycle</button>
            <ActionMenu onAction={(a) => setModal(a)} />
          </div>
          <div className="flex gap-4 mt-3 text-xs" style={{ color: 'var(--fg-3)', justifyContent: 'flex-end' }}>
            <div>
              <div className="cap" style={{ marginBottom: 2 }}>Paid</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--fg-1)' }}><Currency value={c.amount} /></div>
            </div>
            <div>
              <div className="cap" style={{ marginBottom: 2 }}>Last active</div>
              <div style={{ fontWeight: 600, color: 'var(--fg-1)', fontSize: 14 }}>{fmtDate(c.lastActive)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'overview' ? 'is-on' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`tab ${tab === 'timeline' ? 'is-on' : ''}`} onClick={() => setTab('timeline')}>Timeline <span className="badge">{timeline.length}</span></button>
        <button className={`tab ${tab === 'services' ? 'is-on' : ''}`} onClick={() => setTab('services')}>Services purchased <span className="badge">{c.svcStates.filter(s => s.state === 'paid' || s.state === 'active').length}</span></button>
        <button className={`tab ${tab === 'docs' ? 'is-on' : ''}`} onClick={() => setTab('docs')}>Documents</button>
        <button className={`tab ${tab === 'drops' ? 'is-on' : ''}`} onClick={() => setTab('drops')}>Drop-offs <span className="badge">{c.openDropoffs}</span></button>
        <button className={`tab ${tab === 'notes' ? 'is-on' : ''}`} onClick={() => setTab('notes')}>Notes</button>
      </div>

      {tab === 'overview'  && <OverviewTab cand={c} />}
      {tab === 'timeline'  && <TimelineTab events={timeline} />}
      {tab === 'services'  && <ServicesTab cand={c} />}
      {tab === 'docs'      && <DocsTab cand={c} />}
      {tab === 'drops'     && <DropsTab cand={c} />}
      {tab === 'notes'     && <NotesTab cand={c} />}

      {modal === 'coupon' && <CouponModal cand={c} onClose={() => setModal(null)} />}
      {modal === 'lc'     && <LcModal cand={c} onClose={() => setModal(null)} />}
      {modal === 'tag'    && <TagModal current={tags} onAdd={addTag} onClose={() => setModal(null)} />}
      {modal === 'note'   && <NoteModal cand={c} onClose={() => setModal(null)} />}
      {modal === 'refund' && <RefundModal cand={c} onClose={() => setModal(null)} />}
    </div>
  );
}

function ActionMenu({ onAction }) {
  const [open, setOpen] = React.useState(false);
  const items = [
    { id: 'coupon', label: 'Generate coupon',         icon: 'tag' },
    { id: 'lc',     label: 'Change lifecycle stage',  icon: 'flag' },
    { id: 'tag',    label: 'Add tag',                 icon: 'plus' },
    { id: 'note',   label: 'Add note',                icon: 'note' },
    { id: 'refund', label: 'Flag for refund',         icon: 'alert', danger: true },
  ];
  return (
    <div style={{ position: 'relative' }}>
      <button className="btn btn-primary btn-sm" onClick={() => setOpen(o => !o)}>
        Actions <window.Icon name="chevron-down" size={12} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)}></div>
          <div style={{ position: 'absolute', top: 36, right: 0, background: '#fff', border: '1px solid var(--border-1)', borderRadius: 8, boxShadow: 'var(--shadow-3)', minWidth: 220, zIndex: 41, padding: 6 }}>
            {items.map(it => (
              <button key={it.id} onClick={() => { onAction(it.id); setOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 6, fontSize: 13, border: 0, background: 'transparent', color: it.danger ? 'var(--red)' : 'var(--fg-1)', cursor: 'pointer' }}>
                <window.Icon name={it.icon} size={14} />
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// === Overview tab ====================================================
function OverviewTab({ cand }) {
  const services = cand.svcStates;
  return (
    <div className="detail-layout">
      <aside className="context-rail">
        <div className="context-rail-section">
          <h5>Identity</h5>
          <KV k="Candidate ID" v={cand.id} mono />
          <KV k="Joined" v={fmtDate(cand.joined)} />
          <KV k="Source" v="Organic / Google" />
          <KV k="Role bg." v={cand.role} />
        </div>
        <div className="context-rail-section">
          <h5>Payments</h5>
          <KV k="Lifetime paid" v={<Currency value={cand.amount} />} bold />
          <KV k="Orders" v={cand.svcStates.filter(s => s.state === 'paid' || s.state === 'active').length} />
          <KV k="Last payment" v={cand.amount > 0 ? fmtDate(cand.lastActive) : '—'} />
          <KV k="Refunds" v="0" />
        </div>
        <div className="context-rail-section">
          <h5>Resume score</h5>
          <div className="flex items-center gap-3 mb-3">
            <ScoreBadge value={cand.score} size="lg" />
            <div className="text-sm" style={{ color: 'var(--fg-3)' }}>
              {cand.score == null ? 'No resume on file' : cand.score < 50 ? 'Needs major rework' : cand.score <= 70 ? 'Solid baseline' : 'Strong, ready for senior roles'}
            </div>
          </div>
          {cand.score != null && (
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 6, padding: 10, marginTop: 8 }}>
              <div className="text-xs cap" style={{ marginBottom: 6 }}>Score trend (last 90d)</div>
              <Sparkline values={[44, 48, 52, 50, 58, 64, 68, 72, cand.score]} color="var(--primary)" height={32} />
            </div>
          )}
        </div>
        <div className="context-rail-section">
          <h5>Drop-offs</h5>
          <div className="text-sm" style={{ color: 'var(--fg-2)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: cand.openDropoffs > 0 ? 'var(--amber-strong)' : 'var(--fg-1)' }}>{cand.openDropoffs}</span>
            <span className="text-xs" style={{ marginLeft: 6, color: 'var(--fg-3)' }}>open across services</span>
          </div>
        </div>
      </aside>

      <main className="flex-col gap-4">
        {/* Services overview */}
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Services <span className="count">{services.length}</span></h3>
            <span className="text-xs text-muted">Latest interaction state per service</span>
          </div>
          <div style={{ padding: '4px 0' }}>
            {services.map((s, i) => {
              const stages = window.FUNNEL_LABELS[s.code];
              const idx = s.state === 'paid' || s.state === 'active' ? stages.length - 2 : s.state === 'progress' ? Math.floor(stages.length / 2) : 1;
              return (
                <div key={i} style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-1)', display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 16, alignItems: 'center' }}>
                  <div className="flex items-center gap-2">
                    <SvcChip code={s.code} state={s.state} />
                    <div>
                      <div className="text-sm font-semi">{window.SERVICES[s.code].name}</div>
                      <div className="text-xs text-muted">{window.SERVICES[s.code].mode}</div>
                    </div>
                  </div>
                  <FunnelBreadcrumb stages={stages} currentIdx={idx} />
                  <Pill tone={svcStateTone(s.state)} dot>{s.state}</Pill>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent timeline preview */}
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Recent activity</h3>
            <span className="text-xs text-muted">System events only</span>
          </div>
          <div style={{ padding: '14px 18px' }}>
            <Timeline events={window.buildTimelineFor(cand).slice(0, 5)} />
          </div>
        </div>
      </main>
    </div>
  );
}

function svcStateTone(s) {
  return ({ paid: 'violet', active: 'green', progress: 'blue', dropped: 'amber', closed: 'grey' })[s] || 'grey';
}

function KV({ k, v, mono, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', fontSize: 13, gap: 12 }}>
      <span style={{ color: 'var(--fg-3)', fontSize: 12 }}>{k}</span>
      <span style={{ color: 'var(--fg-1)', fontWeight: bold ? 700 : 500, fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)', textAlign: 'right' }}>{v}</span>
    </div>
  );
}

// === Timeline tab ====================================================
function TimelineTab({ events }) {
  return (
    <div className="card card-pad">
      <Timeline events={events} />
    </div>
  );
}
function Timeline({ events }) {
  return (
    <div className="timeline">
      {events.map((e, i) => (
        <div className="tl-item" key={i}>
          <div className={`tl-icon ${e.tone}`}><window.Icon name={e.icon} size={14} /></div>
          <div className="tl-body">
            <div className="ev">{e.text}</div>
            <div className="meta">
              <span>{fmtDateTime(e.when)}</span>
              {e.meta && e.meta.map((m, j) => <span key={j}>· {m}</span>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// === Other tabs (compact, real but lighter) ==========================
function ServicesTab({ cand }) {
  const paid = cand.svcStates.filter(s => s.state === 'paid' || s.state === 'active');
  if (!paid.length) return <div className="card"><EmptyState icon="briefcase" title="No purchases yet" body="This candidate hasn't paid for any service." /></div>;
  return (
    <div className="card">
      <table className="tbl">
        <thead>
          <tr><th>Service</th><th>Order ID</th><th>State</th><th>Score impact</th><th>Paid</th><th>Date</th><th></th></tr>
        </thead>
        <tbody>
          {paid.map((s, i) => (
            <tr key={i}>
              <td><div className="flex items-center gap-2"><SvcChip code={s.code} state={s.state} /><span className="font-semi">{window.SERVICES[s.code].name}</span></div></td>
              <td className="muted tnum">{s.code}-{5400 + i * 7}</td>
              <td><Pill tone={svcStateTone(s.state)} dot>{s.state}</Pill></td>
              <td>{s.code === 'IIQ' ? <span className="text-xs text-muted">N/A</span> : <span className="text-sm">+{6 + i * 2}</span>}</td>
              <td><Currency value={window.SERVICES[s.code].price} /></td>
              <td className="muted">{fmtDate(window.relDate(2 + i * 5, 12, 0))}</td>
              <td><button className="row-actions"><window.Icon name="more" /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocsTab({ cand }) {
  const docs = [
    { v: 'v3', name: cand.name.split(' ')[0] + '_Resume_FINAL.pdf', size: '286 KB', when: window.relDate(0, 14, 6), reviewer: 'Aditi K.', final: true,  score: cand.score },
    { v: 'v2', name: cand.name.split(' ')[0] + '_Resume_v2.pdf',    size: '312 KB', when: window.relDate(1, 17, 32), reviewer: 'Aditi K.', final: false, score: cand.score ? cand.score - 7 : null },
    { v: 'v1', name: cand.name.split(' ')[0] + '_Resume_AI_draft.pdf', size: '244 KB', when: window.relDate(3, 11, 13), reviewer: 'AI generated', final: false, score: cand.score ? cand.score - 18 : null },
  ];
  return (
    <div className="card">
      <table className="tbl">
        <thead><tr><th>Version</th><th>File</th><th>Author</th><th>Score at upload</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          {docs.map((d, i) => (
            <tr key={i}>
              <td><span className="tnum text-xs cap" style={{ color: 'var(--fg-3)' }}>{d.v}</span> {d.final && <Pill tone="violet">Final</Pill>}</td>
              <td><div className="flex items-center gap-2"><window.Icon name="file" size={14} /><span className="font-semi">{d.name}</span><span className="text-xs text-muted">{d.size}</span></div></td>
              <td className="muted">{d.reviewer}</td>
              <td><ScoreBadge value={d.score} /></td>
              <td className="muted">{fmtDate(d.when)}</td>
              <td>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm"><window.Icon name="eye" /></button>
                  <button className="btn btn-ghost btn-sm"><window.Icon name="download" /></button>
                  {!d.final && <button className="btn btn-violet-ghost btn-sm">Mark as final</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DropsTab({ cand }) {
  const allByService = {};
  ['RR','RB','LO','IIQ','RC'].forEach(code => {
    allByService[code] = window.DROPOFFS.filter(d => d.candidate.id === cand.id && d.service === code);
  });
  // Inject some so it's not empty
  if (Object.values(allByService).flat().length === 0) {
    allByService.RB = [{ id: 'DO-99', service: 'RB', reason: 'Editor opened, never saved', severity: 'med', when: window.relDate(2, 14, 22) }];
    allByService.LO = [{ id: 'DO-98', service: 'LO', reason: 'Pricing seen, no payment', severity: 'high', when: window.relDate(5, 11, 4) }];
  }
  const [expanded, setExpanded] = React.useState({});
  return (
    <div className="flex-col gap-3">
      {Object.entries(allByService).filter(([_, v]) => v.length).map(([code, list]) => {
        const latest = list[0];
        const older = list.slice(1);
        return (
          <div key={code} className="card">
            <div className="card-head">
              <div className="flex items-center gap-3">
                <SvcChip code={code} state="dropped" />
                <h3 className="card-title">{window.SERVICES[code].name}</h3>
                <span className="text-xs text-muted">{list.length} drop-off{list.length > 1 ? 's' : ''}</span>
              </div>
              {older.length > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(s => ({ ...s, [code]: !s[code] }))}>
                  {expanded[code] ? 'Hide older' : `Show ${older.length} older`} <window.Icon name={expanded[code] ? 'chevron-down' : 'chevron-right'} size={12} />
                </button>
              )}
            </div>
            <DropoffRow d={latest} latest />
            {expanded[code] && older.map(d => <DropoffRow key={d.id} d={d} />)}
          </div>
        );
      })}
    </div>
  );
}

function DropoffRow({ d, latest }) {
  return (
    <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-1)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center' }}>
      <div>
        <div className="text-sm" style={{ fontWeight: 500, color: 'var(--fg-1)' }}>
          <span className={`dropoff-sev ${d.severity}`}></span>{d.reason}
          {latest && <Pill tone="violet" >Latest</Pill>}
        </div>
        <div className="text-xs text-muted mt-2">{fmtDateTime(d.when)} · ID {d.id}</div>
      </div>
      <button className="btn btn-secondary btn-sm">Add to cohort</button>
    </div>
  );
}

function NotesTab({ cand }) {
  const notes = [
    { author: 'Sushant V.', when: window.relDate(3, 18, 8), text: 'Repeat buyer — handled RC last quarter, very responsive on email. Worth the white-glove treatment.' },
    { author: 'Aditi K.', when: window.relDate(8, 11, 0), text: 'Score moved from 64 → 78 after V2 review. Strong leadership signal in current role.' },
  ];
  return (
    <div className="card">
      <div style={{ padding: 16, borderBottom: '1px solid var(--border-1)' }}>
        <button className="btn btn-secondary"><window.Icon name="plus" /> Add note</button>
      </div>
      {notes.map((n, i) => (
        <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-1)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Avatar initials={n.author.split(' ').map(p => p[0]).join('')} />
            <div>
              <div className="text-sm font-semi">{n.author}</div>
              <div className="text-xs text-muted">{fmtDateTime(n.when)}</div>
            </div>
          </div>
          <div className="text-sm" style={{ color: 'var(--fg-2)', lineHeight: 1.55 }}>{n.text}</div>
        </div>
      ))}
    </div>
  );
}

// === Modals ==========================================================
function CouponModal({ cand, onClose }) {
  const [service, setService] = React.useState('RR');
  const [discount, setDiscount] = React.useState('20');
  const [code, setCode] = React.useState(`${cand.name.split(' ')[0].toUpperCase().slice(0,4)}${service}${discount}`);
  React.useEffect(() => { setCode(`${cand.name.split(' ')[0].toUpperCase().slice(0,4)}${service}${discount}`); }, [service, discount, cand]);
  return (
    <Modal title="Generate coupon" sub={`A one-time code tied to ${cand.name}.`} onClose={onClose}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary"><window.Icon name="tag" /> Generate code</button>
      </>}>
      <div className="field">
        <label>Service</label>
        <select value={service} onChange={e => setService(e.target.value)}>
          {['RR','RB','LO','IIQ','RC'].map(c => <option key={c} value={c}>{window.SERVICES[c].name}</option>)}
          <option value="ALL">All services</option>
        </select>
      </div>
      <div className="field">
        <label>Discount</label>
        <select value={discount} onChange={e => setDiscount(e.target.value)}>
          <option value="10">10% off</option>
          <option value="20">20% off</option>
          <option value="30">30% off</option>
          <option value="50">50% off</option>
          <option value="FLAT99">Flat ₹99 off</option>
        </select>
      </div>
      <div className="field">
        <label>Generated code</label>
        <CodePreview code={code} />
        <div className="field-help">Copy this code — share via your existing channel. Single-use; expires in 14 days.</div>
      </div>
    </Modal>
  );
}

function LcModal({ cand, onClose }) {
  const [stage, setStage] = React.useState(cand.lc);
  const [reason, setReason] = React.useState('');
  return (
    <Modal title="Change lifecycle stage" sub={`Currently: ${cand.lc}`} onClose={onClose}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary">Save change</button>
      </>}>
      <div className="field">
        <label>New stage</label>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          {window.LIFECYCLE.map(l => (
            <button key={l} onClick={() => setStage(l)} style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid', borderColor: stage === l ? 'var(--primary)' : 'var(--border-1)', background: stage === l ? 'var(--primary-50)' : '#fff', color: stage === l ? 'var(--primary-700)' : 'var(--fg-2)', fontSize: 13, fontWeight: stage === l ? 600 : 500, cursor: 'pointer' }}>
              {l[0].toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Reason (optional)</label>
        <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. paid for second service this week" />
      </div>
    </Modal>
  );
}

function TagModal({ current, onAdd, onClose }) {
  const [t, setT] = React.useState('');
  const suggested = ['IIT/NIT','GCC-target','Senior IC','Refer','Switch ≤6mo','Notice 60d','Repeat buyer','Beta user'].filter(s => !current.includes(s));
  return (
    <Modal title="Add tag" onClose={onClose}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onAdd(t); onClose(); }} disabled={!t}>Add tag</button>
      </>}>
      <div className="field">
        <label>Tag name</label>
        <input autoFocus value={t} onChange={e => setT(e.target.value)} placeholder="e.g. GCC-target" />
      </div>
      <div className="field">
        <label>Suggested</label>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          {suggested.map(s => <button key={s} className="tag" style={{ cursor: 'pointer' }} onClick={() => setT(s)}>{s}</button>)}
        </div>
      </div>
    </Modal>
  );
}

function NoteModal({ cand, onClose }) {
  const [v, setV] = React.useState('');
  return (
    <Modal title="Add note" sub={`Internal note on ${cand.name}.`} onClose={onClose}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!v.trim()}>Save note</button>
      </>}>
      <div className="field">
        <label>Note</label>
        <textarea value={v} onChange={e => setV(e.target.value)} placeholder="Visible to the whole team. No formatting." style={{ minHeight: 120 }} />
        <div className="field-help">Notes appear in the Notes tab and on the candidate timeline.</div>
      </div>
    </Modal>
  );
}

function RefundModal({ cand, onClose }) {
  return (
    <Modal title="Flag for refund review" sub="This raises a flag. Actual refund execution happens in your finance system." onClose={onClose}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary">Flag for review</button>
      </>}>
      <div className="field">
        <label>Order to flag</label>
        <select>
          <option>RR-5418 · ₹99 · Resume Report · 3 days ago</option>
          <option>LO-2102 · ₹199 · LinkedIn Optimiser · 4 days ago</option>
        </select>
      </div>
      <div className="field">
        <label>Reason</label>
        <select><option>Quality concern</option><option>Service not delivered</option><option>Duplicate charge</option><option>Other</option></select>
      </div>
      <div className="field">
        <label>Notes for finance</label>
        <textarea placeholder="Context the finance team should see when reviewing." />
      </div>
    </Modal>
  );
}

window.Candidate360 = Candidate360;
