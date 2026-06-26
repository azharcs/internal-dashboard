/* Access control — roles, team members, permission helpers */

const ROLES = {
  admin: {
    label: 'Admin',
    description: 'Full access + user management',
    color: 'var(--violet-strong)',
    bg: 'var(--violet-soft)',
    services: ['RR','RB','LO','IIQ','RC','MRR'],
    scope: 'all',
    canManageUsers: true,
    canViewCandidates: true,
    canViewDropoffs: true,
    canViewOffers: true,
    canViewSettings: true,
    canTransition: true,
  },
  ops_lead: {
    label: 'Ops Lead',
    description: 'Full service access, no user management',
    color: 'var(--primary-800)',
    bg: 'var(--primary-50)',
    services: ['RR','RB','LO','IIQ','RC','MRR'],
    scope: 'all',
    canManageUsers: false,
    canViewCandidates: true,
    canViewDropoffs: true,
    canViewOffers: true,
    canViewSettings: true,
    canTransition: true,
  },
  resume_writer: {
    label: 'Resume Writer',
    description: 'RR + MRR — assigned orders only',
    color: 'var(--blue-strong)',
    bg: 'var(--blue-soft)',
    services: ['RR','MRR'],
    scope: 'assigned',
    canManageUsers: false,
    canViewCandidates: false,
    canViewDropoffs: false,
    canViewOffers: false,
    canViewSettings: false,
    canTransition: true,
  },
  recruiter: {
    label: 'Recruiter',
    description: 'RC + MRR — assigned orders only',
    color: 'var(--green-strong)',
    bg: 'var(--green-soft)',
    services: ['RC','MRR'],
    scope: 'assigned',
    canManageUsers: false,
    canViewCandidates: false,
    canViewDropoffs: false,
    canViewOffers: false,
    canViewSettings: false,
    canTransition: true,
  },
  qc_reviewer: {
    label: 'QC Reviewer',
    description: 'All services — assigned orders, review only',
    color: 'var(--amber-strong)',
    bg: 'var(--amber-soft)',
    services: ['RR','RB','LO','IIQ','RC','MRR'],
    scope: 'assigned',
    canManageUsers: false,
    canViewCandidates: false,
    canViewDropoffs: false,
    canViewOffers: false,
    canViewSettings: false,
    canTransition: false,
  },
};

const TEAM_MEMBERS = [
  { id: 'sushant', name: 'Sushant V.', email: 'sushant@talent500.co', role: 'admin',          initials: 'SV', status: 'active',   joinedDaysAgo: 180 },
  { id: 'priya',   name: 'Priya M.',   email: 'priya@talent500.co',   role: 'ops_lead',       initials: 'PM', status: 'active',   joinedDaysAgo: 120 },
  { id: 'aditi',   name: 'Aditi K.',   email: 'aditi@talent500.co',   role: 'resume_writer',  initials: 'AK', status: 'active',   joinedDaysAgo: 90,  serviceOverrides: null },
  { id: 'vivek',   name: 'Vivek M.',   email: 'vivek@talent500.co',   role: 'resume_writer',  initials: 'VM', status: 'active',   joinedDaysAgo: 60 },
  { id: 'sana',    name: 'Sana R.',    email: 'sana@talent500.co',    role: 'resume_writer',  initials: 'SR', status: 'active',   joinedDaysAgo: 45 },
  { id: 'anjali',  name: 'Anjali V.',  email: 'anjali@talent500.co',  role: 'recruiter',      initials: 'AV', status: 'active',   joinedDaysAgo: 75 },
  { id: 'rohit',   name: 'Rohit S.',   email: 'rohit@talent500.co',   role: 'recruiter',      initials: 'RS', status: 'active',   joinedDaysAgo: 30 },
  { id: 'naveen',  name: 'Naveen K.',  email: 'naveen@talent500.co',  role: 'qc_reviewer',    initials: 'NK', status: 'active',   joinedDaysAgo: 100 },
  { id: 'karthik', name: 'Karthik S.', email: 'karthik@talent500.co', role: 'qc_reviewer',   initials: 'KS', status: 'invited',  joinedDaysAgo: 5 },
  { id: 'riya',    name: 'Riya S.',    email: 'riya@talent500.co',    role: 'resume_writer',  initials: 'RS', status: 'suspended',joinedDaysAgo: 20 },
];

// Access helpers — call these anywhere with window.ACCESS
function makeAccess(user) {
  if (!user) return makeAccess(TEAM_MEMBERS[0]);
  const role = ROLES[user.role] || ROLES.admin;
  const services = user.serviceOverrides || role.services;
  return {
    user,
    role,
    services,
    can: (key) => !!role[key],
    canAccess: (code) => services.includes(code),
    isAdmin: () => user.role === 'admin',
    isRestricted: () => role.scope === 'assigned',
    filterOrders: (orders, writerKey = 'writer') => {
      if (role.scope === 'all') return orders;
      return orders.filter(o => {
        const val = o[writerKey] || '';
        return val.toLowerCase().includes(user.name.split(' ')[0].toLowerCase());
      });
    },
  };
}

// Current user state — defaults to admin (Sushant)
window._currentUserId = window._currentUserId || 'sushant';

Object.defineProperty(window, 'CURRENT_USER', {
  get: () => TEAM_MEMBERS.find(m => m.id === window._currentUserId) || TEAM_MEMBERS[0],
  configurable: true,
});

Object.defineProperty(window, 'ACCESS', {
  get: () => makeAccess(window.CURRENT_USER),
  configurable: true,
});

window.ROLES = ROLES;
window.TEAM_MEMBERS = TEAM_MEMBERS;
window.makeAccess = makeAccess;

// ─────────────────────────────────────────────────────────────────────
// Settings → Team & Access tab
// ─────────────────────────────────────────────────────────────────────

function RolePill({ roleKey }) {
  const role = ROLES[roleKey];
  if (!role) return null;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: role.color, background: role.bg, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>
      {role.label}
    </span>
  );
}

function StatusDot({ status }) {
  const colors = { active: 'var(--green-strong)', invited: 'var(--amber-strong)', suspended: 'var(--fg-4)' };
  const labels = { active: 'Active', invited: 'Invited', suspended: 'Suspended' };
  return (
    <span className="flex items-center gap-1" style={{ fontSize: 12, color: colors[status] }}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: colors[status], display: 'inline-block' }}></span>
      {labels[status]}
    </span>
  );
}

function ServiceAccessChips({ services, allServices = ['RR','RB','LO','IIQ','RC','MRR'] }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {allServices.map(code => (
        <span key={code} style={{
          fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 3,
          color: services.includes(code) ? 'var(--primary-800)' : 'var(--fg-4)',
          background: services.includes(code) ? 'var(--primary-50)' : 'var(--bg-alt)',
          border: `1px solid ${services.includes(code) ? 'var(--primary-200, #c7bffd)' : 'var(--border-1)'}`,
          opacity: services.includes(code) ? 1 : 0.5,
        }}>{code}</span>
      ))}
    </div>
  );
}

function TeamAccessTab() {
  const [members, setMembers] = React.useState(TEAM_MEMBERS);
  const [selected, setSelected] = React.useState(null);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [roleFilter, setRoleFilter] = React.useState('all');

  const filtered = roleFilter === 'all' ? members : members.filter(m => m.role === roleFilter);
  const member = selected ? members.find(m => m.id === selected) : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: member ? '1fr 360px' : '1fr', gap: 20 }}>
      {/* Member list */}
      <div>
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4" style={{ gap: 12 }}>
          <div className="flex gap-2">
            {['all', ...Object.keys(ROLES)].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className="btn btn-sm"
                style={{ background: roleFilter === r ? 'var(--primary)' : 'transparent', color: roleFilter === r ? '#fff' : 'var(--fg-2)', border: '1px solid var(--border-1)', padding: '4px 12px', fontSize: 12 }}>
                {r === 'all' ? 'All' : ROLES[r].label}
                <span style={{ marginLeft: 4, opacity: 0.7 }}>
                  {r === 'all' ? members.length : members.filter(m => m.role === r).length}
                </span>
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setInviteOpen(true)}>
            <window.Icon name="plus" size={13} /> Invite member
          </button>
        </div>

        <table className="tbl">
          <thead><tr>
            <th>Member</th><th>Role</th><th>Services</th><th>Scope</th><th>Status</th><th>Joined</th><th></th>
          </tr></thead>
          <tbody>
            {filtered.map(m => {
              const role = ROLES[m.role];
              const services = m.serviceOverrides || role.services;
              return (
                <tr key={m.id} onClick={() => setSelected(selected === m.id ? null : m.id)}
                  style={{ cursor: 'pointer', background: selected === m.id ? 'var(--primary-50)' : '' }}>
                  <td>
                    <div className="av-row">
                      <div style={{ width: 32, height: 32, borderRadius: 99, background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--primary-800)', flexShrink: 0 }}>{m.initials}</div>
                      <div><div className="n">{m.name}</div><div className="e">{m.email}</div></div>
                    </div>
                  </td>
                  <td><RolePill roleKey={m.role} /></td>
                  <td><ServiceAccessChips services={services} /></td>
                  <td><span className="text-xs" style={{ color: role.scope === 'all' ? 'var(--fg-2)' : 'var(--amber-strong)' }}>{role.scope === 'all' ? 'All orders' : 'Assigned only'}</span></td>
                  <td><StatusDot status={m.status} /></td>
                  <td className="text-xs text-muted">{m.joinedDaysAgo}d ago</td>
                  <td><button className="row-actions" onClick={e => e.stopPropagation()}><window.Icon name="more" /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Member detail panel */}
      {member && <MemberDetailPanel member={member} members={members} setMembers={setMembers} onClose={() => setSelected(null)} />}

      {/* Invite modal */}
      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onInvite={(m) => { setMembers([...members, m]); setInviteOpen(false); }} />}
    </div>
  );
}

function MemberDetailPanel({ member, members, setMembers, onClose }) {
  const role = ROLES[member.role];
  const [editRole, setEditRole] = React.useState(member.role);
  const [editServices, setEditServices] = React.useState(member.serviceOverrides || role.services);
  const [saved, setSaved] = React.useState(false);
  const allServices = ['RR','RB','LO','IIQ','RC','MRR'];
  const editedRole = ROLES[editRole];
  const defaultServices = editedRole.services;
  const hasOverride = JSON.stringify([...editServices].sort()) !== JSON.stringify([...defaultServices].sort());

  const save = () => {
    setMembers(members.map(m => m.id === member.id ? {
      ...m, role: editRole,
      serviceOverrides: hasOverride ? editServices : null,
    } : m));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleStatus = () => {
    const next = member.status === 'active' ? 'suspended' : 'active';
    setMembers(members.map(m => m.id === member.id ? { ...m, status: next } : m));
  };

  return (
    <div className="card" style={{ alignSelf: 'flex-start', position: 'sticky', top: 0 }}>
      <div className="card-head">
        <h3 className="card-title">Edit access</h3>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><window.Icon name="x" size={14} /></button>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Identity */}
        <div className="flex items-center gap-3">
          <div style={{ width: 44, height: 44, borderRadius: 99, background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--primary-800)' }}>{member.initials}</div>
          <div>
            <div className="font-semi" style={{ fontSize: 15 }}>{member.name}</div>
            <div className="text-xs text-muted">{member.email}</div>
          </div>
        </div>

        {/* Role */}
        <div>
          <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>Role</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(ROLES).map(([key, r]) => (
              <label key={key} onClick={() => { setEditRole(key); setEditServices(r.services); }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${editRole === key ? 'var(--primary)' : 'var(--border-1)'}`, background: editRole === key ? 'var(--primary-50)' : '#fff' }}>
                <span style={{ width: 16, height: 16, borderRadius: 99, border: `2px solid ${editRole === key ? 'var(--primary)' : 'var(--border-2)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  {editRole === key && <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--primary)', display: 'block' }}></span>}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: r.color }}>{r.label}</div>
                  <div className="text-xs text-muted">{r.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Service access overrides */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs cap" style={{ color: 'var(--fg-3)' }}>Service access</div>
            {hasOverride && <span className="text-xs" style={{ color: 'var(--amber-strong)' }}>Custom override</span>}
            {!hasOverride && <span className="text-xs text-muted">From role</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
            {allServices.map(code => {
              const on = editServices.includes(code);
              return (
                <label key={code} onClick={() => setEditServices(on ? editServices.filter(s => s !== code) : [...editServices, code])}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 6, cursor: 'pointer', border: `1px solid ${on ? 'var(--primary)' : 'var(--border-1)'}`, background: on ? 'var(--primary-50)' : '#fff' }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${on ? 'var(--primary)' : 'var(--border-2)'}`, background: on ? 'var(--primary)' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {on && <window.Icon name="check" size={9} style={{ stroke: '#fff' }} />}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: on ? 'var(--primary-800)' : 'var(--fg-3)' }}>{code}</span>
                </label>
              );
            })}
          </div>
          {hasOverride && (
            <button className="btn btn-ghost btn-sm mt-2" style={{ fontSize: 11, color: 'var(--fg-3)' }} onClick={() => setEditServices(editedRole.services)}>
              Reset to role defaults
            </button>
          )}
        </div>

        {/* Scope */}
        <div style={{ padding: '10px 14px', background: 'var(--bg-alt)', borderRadius: 8 }}>
          <div className="flex items-center gap-2 mb-1">
            <window.Icon name={editedRole.scope === 'all' ? 'users' : 'user'} size={13} style={{ stroke: 'var(--fg-3)' }} />
            <span className="text-xs font-semi" style={{ color: 'var(--fg-2)' }}>
              {editedRole.scope === 'all' ? 'Sees all orders in permitted services' : 'Sees only orders assigned to them'}
            </span>
          </div>
          <div className="text-xs text-muted">Order-level scope is determined by role and cannot be overridden per person.</div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>
            {saved ? <><window.Icon name="check" size={13} /> Saved</> : 'Save changes'}
          </button>
          <button className="btn btn-secondary" onClick={toggleStatus}>
            {member.status === 'active' ? 'Suspend' : 'Reactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InviteModal({ onClose, onInvite }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState('resume_writer');

  const submit = () => {
    if (!name.trim() || !email.trim()) return;
    onInvite({
      id: 'new-' + Date.now(),
      name, email, role,
      initials: name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase(),
      status: 'invited',
      joinedDaysAgo: 0,
      serviceOverrides: null,
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 440, boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Invite team member</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><window.Icon name="x" size={14} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="text-xs cap mb-1" style={{ color: 'var(--fg-3)', display: 'block' }}>Full name</label>
            <input className="t500-input" style={{ width: '100%' }} placeholder="Anjali Sharma" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs cap mb-1" style={{ color: 'var(--fg-3)', display: 'block' }}>Work email</label>
            <input className="t500-input" style={{ width: '100%' }} placeholder="anjali@talent500.co" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs cap mb-2" style={{ color: 'var(--fg-3)', display: 'block' }}>Role</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(ROLES).filter(([k]) => k !== 'admin').map(([key, r]) => (
                <label key={key} onClick={() => setRole(key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${role === key ? 'var(--primary)' : 'var(--border-1)'}`, background: role === key ? 'var(--primary-50)' : '#fff' }}>
                  <span style={{ width: 14, height: 14, borderRadius: 99, border: `2px solid ${role === key ? 'var(--primary)' : 'var(--border-2)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {role === key && <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--primary)', display: 'block' }}></span>}
                  </span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: r.color }}>{r.label}</span>
                    <span className="text-xs text-muted" style={{ marginLeft: 8 }}>{r.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={!name.trim() || !email.trim()}>Send invite</button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.TeamAccessTab = TeamAccessTab;
window.RolePill = RolePill;
