/* App shell: dark sidebar nav + topbar + simple route state */

const NAV = [
  { id: 'home',       label: 'Home',       icon: 'home' },
  { id: 'candidates', label: 'Candidates', icon: 'users', badge: 38 },
  { id: 'services',   label: 'Services',   icon: 'briefcase', children: [
      { id: 'svc-rr',  label: 'Resume Report', code: 'RR' },
      { id: 'svc-rb',  label: 'Resume Builder', code: 'RB' },
      { id: 'svc-lo',  label: 'LinkedIn Optimiser', code: 'LO' },
      { id: 'svc-iiq', label: 'Interview IQ', code: 'IIQ' },
      { id: 'svc-rc',  label: 'Recruiter Connect', code: 'RC' },
      { id: 'svc-mrr', label: 'Manual Resume Rewrite', code: 'MRR' },
  ]},
  { id: 'dropoffs',   label: 'Drop-offs',  icon: 'trending-down', badge: 28 },
  { id: 'offers',     label: 'Offers',     icon: 'tag' },
  { id: 'settings',   label: 'Settings',   icon: 'settings' },
];

function Sidebar({ route, setRoute, expandedServices, setExpandedServices }) {
  const isOn = (id) => route.id === id || (id === 'services' && route.id?.startsWith('svc-'));

  return (
    <aside className="rail">
      <div className="rail-brand">
        <div className="rail-brand-mark">T5</div>
        <div className="rail-brand-text">
          Talent500
          <small>Candidate Services</small>
        </div>
      </div>

      <div className="rail-section">Workspace</div>
      <nav className="rail-nav">
        {NAV.map(item => (
          <React.Fragment key={item.id}>
            <button
              className={`rail-link ${isOn(item.id) ? 'is-on' : ''} ${item.children ? 'has-children' : ''} ${item.children && expandedServices ? 'is-expanded' : ''}`}
              onClick={() => {
                if (item.children) {
                  setExpandedServices(!expandedServices);
                } else {
                  setRoute({ id: item.id });
                }
              }}
            >
              <window.Icon name={item.icon} size={16} />
              <span>{item.label}</span>
              {item.badge != null && !item.children && <span className="badge">{item.badge}</span>}
              {item.children && <window.Icon name="chevron-right" size={14} className="chevron" />}
            </button>
            {item.children && expandedServices && (
              <div className="rail-sub">
                {item.children.map(c => (
                  <button
                    key={c.id}
                    className={`rail-link ${route.id === c.id ? 'is-on' : ''}`}
                    onClick={() => setRoute({ id: c.id, code: c.code })}
                  >
                    <span className="svc-chip" style={{ fontSize: 9, padding: '0 5px', height: 18, minWidth: 24, background: 'rgba(255,255,255,0.06)', color: 'var(--rail-text)', border: '1px solid var(--rail-border)' }}>{c.code}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </nav>

      <div className="rail-foot">
        <div className="rail-foot-avatar">SV</div>
        <div className="rail-foot-meta">
          <div className="n">Sushant V.</div>
          <div className="r">Service Ops · Lead</div>
        </div>
        <div className="rail-foot-icon" title="Help"><window.Icon name="help" size={14} /></div>
      </div>
    </aside>
  );
}

function TopBar({ search, setSearch }) {
  return (
    <div className="topbar">
      <div className="topbar-search">
        <window.Icon name="search" />
        <input
          placeholder="Search candidates, orders, coupons, drop-offs…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <kbd>⌘K</kbd>
      </div>
      <div className="topbar-spacer"></div>
      <button className="topbar-icon-btn" title="Notifications">
        <window.Icon name="bell" />
        <span className="dot"></span>
      </button>
      <div className="topbar-avatar" title="Sushant Verma">SV</div>
    </div>
  );
}

window.Sidebar = Sidebar;
window.TopBar = TopBar;
window.NAV = NAV;
