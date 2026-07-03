/* Access control — roles, team members, permission helpers */

const ROLES = {
  admin: {
    label: 'Admin',
    description: 'Full access — all services, all orders, user management',
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
  resume_writer: {
    label: 'Resume Writer',
    description: 'RR + MRR — sees only orders assigned to them',
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
};

const TEAM_MEMBERS = [
  { id: 'sushant', name: 'Sushant V.', email: 'sushant@talent500.co',  role: 'admin',         initials: 'SV', status: 'active',    joinedDaysAgo: 180 },
  { id: 'priya',   name: 'Priya M.',   email: 'priya@talent500.co',    role: 'admin',         initials: 'PM', status: 'active',    joinedDaysAgo: 120 },
  { id: 'aditi',   name: 'Aditi K.',   email: 'aditi@talent500.co',    role: 'resume_writer', initials: 'AK', status: 'active',    joinedDaysAgo: 90 },
  { id: 'vivek',   name: 'Vivek M.',   email: 'vivek@talent500.co',    role: 'resume_writer', initials: 'VM', status: 'active',    joinedDaysAgo: 60 },
  { id: 'sana',    name: 'Sana R.',    email: 'sana@talent500.co',     role: 'resume_writer', initials: 'SR', status: 'active',    joinedDaysAgo: 45 },
  { id: 'riya',    name: 'Riya S.',    email: 'riya@talent500.co',     role: 'resume_writer', initials: 'RS', status: 'suspended', joinedDaysAgo: 20 },
];

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
// WriterPickerBtn — reusable assign-writer control
// ─────────────────────────────────────────────────────────────────────

function WriterPickerBtn({ value, onChange, size = 'sm' }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    function close(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const writers = TEAM_MEMBERS.filter(m => m.role === 'resume_writer' && m.status === 'active');
  const me = window.CURRENT_USER;
  const iAmWriter = me && me.role === 'resume_writer';

  const rrAssigned = (w) => (window.RR_ORDERS_FULL || []).filter(o => o.writer === w.name && !['Closed','Cancelled'].includes(o.state)).length;
  const mrrAssigned = (w) => (window.MRR_ORDERS || []).filter(o => o.writer === w.name && !['Delivered','Cancelled'].includes(o.state)).length;

  const display = value && value !== '—' ? value : 'Unassigned';
  const isAssigned = value && value !== '—';

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className={`btn btn-secondary btn-${size}`}
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          width: 20, height: 20, borderRadius: 99,
          background: isAssigned ? 'var(--blue-soft)' : 'var(--bg-alt)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700,
          color: isAssigned ? 'var(--blue-strong)' : 'var(--fg-4)',
          flexShrink: 0,
        }}>
          {isAssigned ? value.split(' ').map(p => p[0]).join('').slice(0,2) : '?'}
        </span>
        {display}
        <window.Icon name="chevron-down" size={11} style={{ stroke: 'var(--fg-3)' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200,
          background: '#fff', border: '1px solid var(--border-1)', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: 260, overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid var(--border-1)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)' }}>
              Assign to writer
            </div>
          </div>

          {iAmWriter && value !== me.name && (
            <button
              onClick={() => { onChange(me.name); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 0, background: 'var(--primary-50)', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border-1)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 99, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {me.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-800)' }}>Assign to me</div>
                <div style={{ fontSize: 10, color: 'var(--primary-600)' }}>{me.name}</div>
              </div>
            </button>
          )}

          {value && value !== '—' && (
            <button
              onClick={() => { onChange('—'); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', border: 0, background: '#fff', cursor: 'pointer', borderBottom: '1px solid var(--border-1)', color: 'var(--fg-3)', fontSize: 12 }}>
              <span style={{ width: 28, height: 28, borderRadius: 99, background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <window.Icon name="x" size={11} style={{ stroke: 'var(--fg-4)' }} />
              </span>
              Unassign
            </button>
          )}

          {writers.map(w => {
            const rr = rrAssigned(w);
            const mrr = mrrAssigned(w);
            const total = rr + mrr;
            const isCurrent = value === w.name;
            return (
              <button key={w.id}
                onClick={() => { onChange(w.name); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '10px 12px', border: 0,
                  background: isCurrent ? 'var(--primary-50)' : '#fff',
                  cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border-1)',
                }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 99,
                  background: isCurrent ? 'var(--primary)' : 'var(--blue-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  color: isCurrent ? '#fff' : 'var(--blue-strong)',
                  flexShrink: 0,
                }}>{w.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{w.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--fg-3)' }}>
                    {total === 0 ? 'No open orders' : `${rr > 0 ? `${rr} RR` : ''}${rr > 0 && mrr > 0 ? ' · ' : ''}${mrr > 0 ? `${mrr} MRR` : ''} open`}
                  </div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700,
                  color: total > 5 ? 'var(--amber-strong)' : 'var(--fg-3)',
                  background: total > 5 ? 'var(--amber-soft)' : 'var(--bg-alt)',
                  padding: '1px 6px', borderRadius: 4,
                }}>{total}</div>
                {isCurrent && <window.Icon name="check" size={13} style={{ stroke: 'var(--primary)', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

function ServiceAccessChips({ services, allServices = ['RR','MRR'] }) {
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

  const writerCount = members.filter(m => m.role === 'resume_writer' && m.status === 'active').length;
  const adminCount = members.filter(m => m.role === 'admin' && m.status === 'active').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: member ? '1fr 380px' : '1fr', gap: 20 }}>
      <div>
        {/* Summary chips */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ padding: '10px 16px', background: 'var(--violet-soft)', borderRadius: 8, textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--violet-strong)' }}>{adminCount}</div>
            <div style={{ fontSize: 11, color: 'var(--violet-strong)', fontWeight: 600 }}>Admins</div>
          </div>
          <div style={{ padding: '10px 16px', background: 'var(--blue-soft)', borderRadius: 8, textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--blue-strong)' }}>{writerCount}</div>
            <div style={{ fontSize: 11, color: 'var(--blue-strong)', fontWeight: 600 }}>Writers</div>
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary btn-sm" onClick={() => setInviteOpen(true)}>
            <window.Icon name="plus" size={13} /> Invite member
          </button>
        </div>

        {/* Role filter */}
        <div className="flex gap-2 mb-4">
          {['all', 'admin', 'resume_writer'].map(r => (
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

        <table className="tbl">
          <thead><tr>
            <th>Member</th><th>Role</th><th>Services</th><th>Status</th><th>Open orders</th><th>Joined</th><th></th>
          </tr></thead>
          <tbody>
            {filtered.map(m => {
              const role = ROLES[m.role];
              const services = m.serviceOverrides || role.services;
              const rrOpen = m.role === 'resume_writer' ? (window.RR_ORDERS_FULL || []).filter(o => o.writer === m.name && !['Closed','Cancelled'].includes(o.state)).length : null;
              const mrrOpen = m.role === 'resume_writer' ? (window.MRR_ORDERS || []).filter(o => o.writer === m.name && !['Delivered','Cancelled'].includes(o.state)).length : null;
              return (
                <tr key={m.id} onClick={() => setSelected(selected === m.id ? null : m.id)}
                  style={{ cursor: 'pointer', background: selected === m.id ? 'var(--primary-50)' : '' }}>
                  <td>
                    <div className="av-row">
                      <div style={{ width: 32, height: 32, borderRadius: 99, background: role.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: role.color, flexShrink: 0 }}>{m.initials}</div>
                      <div><div className="n">{m.name}</div><div className="e">{m.email}</div></div>
                    </div>
                  </td>
                  <td><RolePill roleKey={m.role} /></td>
                  <td><ServiceAccessChips services={services} allServices={['RR','RB','LO','IIQ','RC','MRR']} /></td>
                  <td><StatusDot status={m.status} /></td>
                  <td>
                    {m.role === 'resume_writer' && m.status === 'active' ? (
                      <div className="flex items-center gap-2 text-xs">
                        {rrOpen > 0 && <span style={{ padding: '1px 6px', borderRadius: 4, background: 'var(--primary-50)', color: 'var(--primary-800)', fontWeight: 600 }}>{rrOpen} RR</span>}
                        {mrrOpen > 0 && <span style={{ padding: '1px 6px', borderRadius: 4, background: 'var(--violet-soft)', color: 'var(--violet-strong)', fontWeight: 600 }}>{mrrOpen} MRR</span>}
                        {rrOpen === 0 && mrrOpen === 0 && <span className="text-muted">None</span>}
                      </div>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="text-xs text-muted">{m.joinedDaysAgo}d ago</td>
                  <td><button className="row-actions" onClick={e => e.stopPropagation()}><window.Icon name="more" /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {member && <MemberDetailPanel member={member} members={members} setMembers={setMembers} onClose={() => setSelected(null)} />}
      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onInvite={(m) => { setMembers([...members, m]); setInviteOpen(false); }} />}
    </div>
  );
}

function MemberDetailPanel({ member, members, setMembers, onClose }) {
  const role = ROLES[member.role];
  const [editRole, setEditRole] = React.useState(member.role);
  const [saved, setSaved] = React.useState(false);

  const save = () => {
    setMembers(members.map(m => m.id === member.id ? { ...m, role: editRole } : m));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleStatus = () => {
    const next = member.status === 'active' ? 'suspended' : 'active';
    setMembers(members.map(m => m.id === member.id ? { ...m, status: next } : m));
  };

  // Assigned orders for resume writers
  const assignedRR  = member.role === 'resume_writer'
    ? (window.RR_ORDERS_FULL || []).filter(o => o.writer === member.name && !['Closed','Cancelled'].includes(o.state))
    : [];
  const assignedMRR = member.role === 'resume_writer'
    ? (window.MRR_ORDERS || []).filter(o => o.writer === member.name && !['Delivered','Cancelled'].includes(o.state))
    : [];

  return (
    <div className="card" style={{ alignSelf: 'flex-start', position: 'sticky', top: 0 }}>
      <div className="card-head">
        <h3 className="card-title">Member details</h3>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><window.Icon name="x" size={14} /></button>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Identity */}
        <div className="flex items-center gap-3">
          <div style={{ width: 44, height: 44, borderRadius: 99, background: role.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: role.color }}>{member.initials}</div>
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
              <label key={key} onClick={() => setEditRole(key)}
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

        {/* Access summary */}
        <div style={{ padding: '10px 14px', background: 'var(--bg-alt)', borderRadius: 8 }}>
          <div className="flex items-center gap-2 mb-1">
            <window.Icon name={ROLES[editRole].scope === 'all' ? 'users' : 'user'} size={13} style={{ stroke: 'var(--fg-3)' }} />
            <span className="text-xs font-semi" style={{ color: 'var(--fg-2)' }}>
              {ROLES[editRole].scope === 'all'
                ? 'Sees all orders across all services'
                : 'Sees only orders assigned to them in RR + MRR'}
            </span>
          </div>
          <div className="text-xs text-muted">
            Services: {ROLES[editRole].services.join(', ')}
          </div>
        </div>

        {/* Assigned orders (for resume writers) */}
        {member.role === 'resume_writer' && (
          <div>
            <div className="text-xs cap mb-2" style={{ color: 'var(--fg-3)' }}>
              Current workload
              <span style={{ marginLeft: 6, fontWeight: 700, color: 'var(--fg-2)' }}>
                {assignedRR.length + assignedMRR.length} open
              </span>
            </div>

            {assignedRR.length === 0 && assignedMRR.length === 0 && (
              <div className="text-xs text-muted" style={{ padding: '8px 0' }}>No open orders assigned.</div>
            )}

            {assignedRR.map(o => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, background: 'var(--bg-alt)', marginBottom: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: 'var(--primary-50)', color: 'var(--primary-800)' }}>RR</span>
                <span className="text-xs font-semi" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.candidate.name}</span>
                <window.SlaBadge minutesLeft={o.slaRemainingMin} />
              </div>
            ))}

            {assignedMRR.map(o => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, background: 'var(--bg-alt)', marginBottom: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: 'var(--violet-soft)', color: 'var(--violet-strong)' }}>MRR</span>
                <span className="text-xs font-semi" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.candidate.name}</span>
                <window.Pill tone={window.mrrStateTone ? window.mrrStateTone(o.state) : 'grey'} dot>{o.state}</window.Pill>
              </div>
            ))}
          </div>
        )}

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
      id: 'new-' + Math.floor(Math.random() * 100000),
      name, email, role,
      initials: name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase(),
      status: 'invited',
      joinedDaysAgo: 0,
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
              {Object.entries(ROLES).map(([key, r]) => (
                <label key={key} onClick={() => setRole(key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${role === key ? 'var(--primary)' : 'var(--border-1)'}`, background: role === key ? 'var(--primary-50)' : '#fff' }}>
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
window.WriterPickerBtn = WriterPickerBtn;
