/* Candidates list — hi-fi.
   Filter rail + sortable table + saved views + persistent download. */

function CandidatesScreen({ openCandidate, search }) {
  const [filters, setFilters] = React.useState({
    services: [],
    lc: [],
    joined: 'all',
    active: 'all',
    drops: 'all',
  });
  const [sort, setSort] = React.useState({ key: 'lastActive', dir: 'desc' });
  const [savedView, setSavedView] = React.useState('All candidates');
  const [savedViewOpen, setSavedViewOpen] = React.useState(false);

  const toggle = (key, val) => {
    setFilters(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val] }));
  };
  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const clearAll = () => setFilters({ services: [], lc: [], joined: 'all', active: 'all', drops: 'all' });

  // Apply filters
  let rows = window.CANDIDATES;
  if (filters.services.length) {
    rows = rows.filter(c => c.svcStates.some(s => filters.services.includes(s.code)));
  }
  if (filters.lc.length) rows = rows.filter(c => filters.lc.includes(c.lc));
  if (filters.drops === 'open') rows = rows.filter(c => c.openDropoffs > 0);
  if (filters.drops === 'none') rows = rows.filter(c => c.openDropoffs === 0);
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }

  // Sort
  rows = [...rows].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    const k = sort.key;
    let av = a[k], bv = b[k];
    if (k === 'score') { av = av ?? -1; bv = bv ?? -1; }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });

  const setSortKey = (k) => {
    setSort(s => s.key === k ? { key: k, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: 'desc' });
  };

  // Filter rail counts (against full list)
  const allCands = window.CANDIDATES;
  const svcCounts = {};
  ['RR','RB','LO','IIQ','RC'].forEach(c => svcCounts[c] = allCands.filter(x => x.svcStates.some(s => s.code === c)).length);
  const lcCounts = {};
  window.LIFECYCLE.forEach(l => lcCounts[l] = allCands.filter(c => c.lc === l).length);

  return (
    <div className="page">
      <PageHead
        title="Candidates"
        sub={`${rows.length} of ${allCands.length} candidates · live across 5 services`}
        actions={<>
          <button className="btn btn-secondary"><window.Icon name="plus" /> New candidate</button>
          <button className="btn btn-primary"><window.Icon name="download" /> Download CSV</button>
        </>}
      />

      <div className="list-layout">
        <FilterRail onClear={clearAll}>
          <FilterGroup title="Services" options={[
            { value: 'RR', label: 'Resume Report' },
            { value: 'RB', label: 'Resume Builder' },
            { value: 'LO', label: 'LinkedIn Optimiser' },
            { value: 'IIQ', label: 'Interview IQ' },
            { value: 'RC', label: 'Recruiter Connect' },
          ]} selected={filters.services} onToggle={v => toggle('services', v)} counts={svcCounts} />

          <FilterGroup title="Lifecycle stage" options={window.LIFECYCLE.map(l => ({ value: l, label: l[0].toUpperCase() + l.slice(1) }))}
            selected={filters.lc} onToggle={v => toggle('lc', v)} counts={lcCounts} />

          <h4>Date joined</h4>
          <div className="filter-group">
            {[
              { v: 'all', l: 'Any time' },
              { v: '7', l: 'Last 7 days' },
              { v: '30', l: 'Last 30 days' },
              { v: '90', l: 'Last 90 days' },
            ].map(o => (
              <label key={o.v} className={`filter-chip ${filters.joined === o.v ? 'is-on' : ''}`} onClick={() => setFilter('joined', o.v)}>
                <span className="filter-chip-cb">{filters.joined === o.v && <window.Icon name="check" size={9} />}</span>
                <span>{o.l}</span>
              </label>
            ))}
          </div>

          <h4>Last active</h4>
          <div className="filter-group">
            {[
              { v: 'all', l: 'Any time' },
              { v: '24h', l: 'Last 24h' },
              { v: '7d', l: 'Last 7 days' },
              { v: '30d', l: 'Last 30 days' },
            ].map(o => (
              <label key={o.v} className={`filter-chip ${filters.active === o.v ? 'is-on' : ''}`} onClick={() => setFilter('active', o.v)}>
                <span className="filter-chip-cb">{filters.active === o.v && <window.Icon name="check" size={9} />}</span>
                <span>{o.l}</span>
              </label>
            ))}
          </div>

          <h4>Drop-off status</h4>
          <div className="filter-group">
            {[
              { v: 'all', l: 'All' },
              { v: 'open', l: 'Has open drop-off' },
              { v: 'none', l: 'No drop-offs' },
            ].map(o => (
              <label key={o.v} className={`filter-chip ${filters.drops === o.v ? 'is-on' : ''}`} onClick={() => setFilter('drops', o.v)}>
                <span className="filter-chip-cb">{filters.drops === o.v && <window.Icon name="check" size={9} />}</span>
                <span>{o.l}</span>
              </label>
            ))}
          </div>
        </FilterRail>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="left">
              <div className="saved-views">
                <button className="saved-views-btn" onClick={() => setSavedViewOpen(v => !v)}>
                  <window.Icon name="bookmark" size={12} />
                  {savedView}
                  <window.Icon name="chevron-down" size={12} />
                </button>
                {savedViewOpen && (
                  <div style={{ position: 'absolute', top: 36, left: 0, background: '#fff', border: '1px solid var(--border-1)', borderRadius: 8, boxShadow: 'var(--shadow-3)', minWidth: 220, zIndex: 20, padding: 6 }}>
                    {['All candidates','Active paid users','High-score (>70)','Open drop-offs','Dormant ≥ 30d','New this week'].map(v => (
                      <button key={v} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 6, fontSize: 13, border: 0, background: v === savedView ? 'var(--primary-50)' : 'transparent', color: v === savedView ? 'var(--primary-700)' : 'var(--fg-1)', cursor: 'pointer', fontWeight: v === savedView ? 600 : 400 }} onClick={() => { setSavedView(v); setSavedViewOpen(false); }}>
                        {v}
                      </button>
                    ))}
                    <div style={{ height: 1, background: 'var(--border-1)', margin: '4px 0' }}></div>
                    <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 6, fontSize: 13, border: 0, background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}>+ Save current view…</button>
                  </div>
                )}
              </div>
              <div style={{ width: 1, height: 20, background: 'var(--border-1)' }}></div>
              <span className="text-xs text-muted">{rows.length} results</span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <Th label="Name" sortKey="name" sort={sort} setSort={setSortKey} />
                  <Th label="Email" />
                  <Th label="Lifecycle" sortKey="lc" sort={sort} setSort={setSortKey} />
                  <Th label="Furthest funnel stage" />
                  <Th label="Services" />
                  <Th label="Last active" sortKey="lastActive" sort={sort} setSort={setSortKey} />
                  <Th label="Paid" sortKey="amount" sort={sort} setSort={setSortKey} className="num" />
                  <Th label="Score" sortKey="score" sort={sort} setSort={setSortKey} />
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 40).map(c => (
                  <tr key={c.id} onClick={() => openCandidate(c.id)}>
                    <td className="col-name">
                      <div className="av-row">
                        <Avatar initials={c.avatarInitials} />
                        <div>
                          <div className="n">{c.name} {c.dnc && <span className="dnc" style={{ marginLeft: 6 }}>DNC</span>}</div>
                          <div className="e tnum">{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="muted">{c.email}</td>
                    <td><LifecyclePill stage={c.lc} /></td>
                    <td className="text-sm" style={{ color: 'var(--fg-2)' }}>{c.furthestFunnel}</td>
                    <td><SvcChipStack items={c.svcStates} max={3} /></td>
                    <td className="muted">{fmtDate(c.lastActive)}</td>
                    <td className="num"><Currency value={c.amount} /></td>
                    <td><ScoreBadge value={c.score} /></td>
                    <td><button className="row-actions" onClick={e => e.stopPropagation()}><window.Icon name="more" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pager">
            <span>Showing 1–{Math.min(40, rows.length)} of {rows.length}</span>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" disabled><window.Icon name="chevron-left" /> Prev</button>
              <button className="btn btn-secondary btn-sm">Next <window.Icon name="chevron-right" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({ label, sortKey, sort, setSort, className = '' }) {
  if (!sortKey) return <th className={className}>{label}</th>;
  const sorted = sort && sort.key === sortKey;
  return (
    <th className={`sortable ${sorted ? 'sorted' : ''} ${className}`} onClick={() => setSort(sortKey)}>
      {label}
      <span className="sort-arrow">{sorted ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}</span>
    </th>
  );
}

window.CandidatesScreen = CandidatesScreen;
