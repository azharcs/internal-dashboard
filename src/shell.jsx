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
  const access = window.ACCESS || { can: () => true, canAccess: () => true, isAdmin: () => true, user: { name: 'Sushant V.', initials: 'SV' }, role: { label: 'Admin' } };
  const user = access.user;
  const role = access.role;

  // Filter nav items by access
  const visibleNav = NAV.filter(item => {
    if (item.id === 'candidates') return access.can('canViewCandidates');
    if (item.id === 'dropoffs')   return access.can('canViewDropoffs');
    if (item.id === 'offers')     return access.can('canViewOffers');
    if (item.id === 'settings')   return access.can('canViewSettings');
    return true;
  });

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
        {visibleNav.map(item => (
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
                {item.children.filter(c => access.canAccess(c.code)).map(c => (
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
        <div className="rail-foot-avatar">{user.initials}</div>
        <div className="rail-foot-meta">
          <div className="n">{user.name}</div>
          <div className="r">{role.label}</div>
        </div>
        <div className="rail-foot-icon" title="Help"><window.Icon name="help" size={14} /></div>
      </div>
    </aside>
  );
}

function TopBar({ search, setSearch, onUserSwitch }) {
  const [open, setOpen] = React.useState(false);
  const access = window.ACCESS || { user: { name: 'Sushant V.', initials: 'SV' }, role: { label: 'Admin', color: 'var(--primary-800)', bg: 'var(--primary-50)' } };
  const user = access.user;
  const role = access.role;
  const members = (window.TEAM_MEMBERS || []).filter(m => m.status !== 'suspended');

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

      {/* User switcher */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(!open)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 6px', borderRadius: 8, border: '1px solid var(--border-1)', background: open ? 'var(--bg-alt)' : '#fff', cursor: 'pointer' }}
        >
          <div style={{ width: 28, height: 28, borderRadius: 99, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{user.initials}</div>
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-1)' }}>{user.name}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: role.color, background: role.bg, padding: '0 5px', borderRadius: 3, display: 'inline-block' }}>{role.label}</div>
          </div>
          <window.Icon name="chevron-down" size={12} style={{ stroke: 'var(--fg-3)', marginLeft: 2 }} />
        </button>

        {open && (
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', border: '1px solid var(--border-1)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200, width: 240, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px 6px', borderBottom: '1px solid var(--border-1)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)' }}>Preview as</div>
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {members.map(m => {
                const r = (window.ROLES || {})[m.role] || {};
                const isCurrent = window._currentUserId === m.id;
                return (
                  <button key={m.id}
                    onClick={() => { window._currentUserId = m.id; setOpen(false); onUserSwitch && onUserSwitch(m.id); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px', border: 0, background: isCurrent ? 'var(--primary-50)' : '#fff', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border-1)' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 99, background: isCurrent ? 'var(--primary)' : 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: isCurrent ? '#fff' : 'var(--fg-3)', flexShrink: 0 }}>{m.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{m.name}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: r.color }}>{r.label}</div>
                    </div>
                    {isCurrent && <window.Icon name="check" size={13} style={{ stroke: 'var(--primary)', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.Sidebar = Sidebar;
window.TopBar = TopBar;
window.NAV = NAV;
