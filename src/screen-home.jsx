/* Home screen — hi-fi.
   4 KPI tiles, Today's queue (RR), RC schedule, Drop-off alerts, Live offers. */

function HomeScreen({ setRoute, openCandidate }) {
  const access = window.ACCESS || { isRestricted: () => false, can: () => true, user: { name: 'Sushant V.' }, filterOrders: o => o };
  if (access.isRestricted()) return <PersonalizedHome access={access} setRoute={setRoute} openCandidate={openCandidate} />;

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  // Queue: top 6 RR orders by SLA urgency, exclude delivered/cancelled
  const queue = window.RR_ORDERS.filter(o => o.state !== 'Delivered' && o.state !== 'Cancelled').slice(0, 6);

  // RC schedule: next 7d
  const calls = window.RC_CALLS.filter(c => {
    const ms = c.when - new Date();
    return ms > -86400000 && ms < 7 * 86400000;
  }).slice(0, 5);

  // Drop-off alerts: high severity recent
  const alerts = window.DROPOFFS.filter(d => d.severity === 'high').slice(0, 5);

  // KPI sparks (deterministic)
  const sparkOrders = [9,11,8,13,12,15,17,14,18,21,19,23];
  const sparkSessions = [42,55,48,61,58,67,72,68,75,82,79,88];
  const sparkDrops = [22,25,21,28,24,30,29,33,28,35,31,28];
  const sparkRedemptions = [3,5,4,7,6,8,9,7,10,11,9,12];

  return (
    <div className="page">
      <PageHead
        title={`Good morning, Sushant`}
        sub={`Today is ${todayStr}. Here's what needs your attention.`}
        actions={<>
          <button className="btn btn-secondary"><window.Icon name="calendar" /> This week</button>
          <button className="btn btn-primary"><window.Icon name="download" /> Export today</button>
        </>}
      />

      {/* KPI Row */}
      <div className="kpi-row">
        <KpiTile label="Orders today" value="23" delta="+18%" trend="up" sub="vs. 7-day avg" spark={sparkOrders} />
        <KpiTile label="Sessions today" value="88" delta="+12%" trend="up" sub="all self-serve" spark={sparkSessions} color="var(--green-strong)" />
        <KpiTile label="Drops · last 7d" value="142" delta="+6%" trend="up" sub="action recommended" spark={sparkDrops} color="var(--amber-strong)" warn />
        <KpiTile label="Redemptions today" value="12" delta="−2" trend="down" sub="across 4 active offers" spark={sparkRedemptions} color="var(--primary)" />
      </div>

      {/* Two-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginTop: 24, alignItems: 'flex-start' }}>
        {/* Today's Queue */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">
                Today's queue
                <span className="count">{queue.length}</span>
              </h3>
              <p className="card-sub">Resume Report orders pending action — sorted by SLA urgency.</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setRoute({ id: 'svc-rr', code: 'RR' })}>
              View all <window.Icon name="chevron-right" size={12} />
            </button>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Order</th>
                <th>Candidate</th>
                <th>Score</th>
                <th>State</th>
                <th>SLA</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {queue.map(o => (
                <tr key={o.id} onClick={() => openCandidate(o.candidate.id)}>
                  <td className="tnum text-muted">{o.id}</td>
                  <td>
                    <div className="av-row">
                      <Avatar initials={o.candidate.avatarInitials} />
                      <div>
                        <div className="n">{o.candidate.name}</div>
                        <div className="e">Placed {fmtDate(o.placed)}</div>
                      </div>
                    </div>
                  </td>
                  <td><ScoreBadge value={o.score} /></td>
                  <td><Pill tone={stateTone(o.state)} dot>{o.state}</Pill></td>
                  <td><SlaBadge minutesLeft={o.slaRemainingMin} /></td>
                  <td><button className="row-actions" onClick={e => e.stopPropagation()}><window.Icon name="more" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="card-foot">
            <span>Showing {queue.length} of {window.RR_ORDERS.filter(o => o.state !== 'Delivered' && o.state !== 'Cancelled').length} pending orders</span>
            <span className="text-xs">SLA window: 48h from payment</span>
          </div>
        </div>

        {/* RC Schedule */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">
                Recruiter Connect <span className="count">{calls.length}</span>
              </h3>
              <p className="card-sub">Calls in the next 7 days.</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setRoute({ id: 'svc-rc', code: 'RC' })}>
              All <window.Icon name="chevron-right" size={12} />
            </button>
          </div>
          <div style={{ padding: '6px 0' }}>
            {calls.map(c => (
              <div key={c.id} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-1)', cursor: 'pointer' }} onClick={() => openCandidate(c.candidate.id)}>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs cap">{fmtDateTime(c.when)}</div>
                  <Pill tone={callTone(c.state)}>{c.state}</Pill>
                </div>
                <div className="av-row">
                  <Avatar initials={c.candidate.avatarInitials} />
                  <div className="flex-1">
                    <div className="n">{c.candidate.name}</div>
                    <div className="e">with {c.recruiter}</div>
                  </div>
                  <ScoreBadge value={c.score} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Drop-off alerts + Live offers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">
                Drop-off alerts <span className="count">{alerts.length}</span>
              </h3>
              <p className="card-sub">High-severity drops in the last 24 hours.</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setRoute({ id: 'dropoffs' })}>
              Open <window.Icon name="chevron-right" size={12} />
            </button>
          </div>
          <div>
            {alerts.map(d => (
              <div key={d.id} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-1)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', cursor: 'pointer' }} onClick={() => openCandidate(d.candidate.id)}>
                <div>
                  <div className="text-sm" style={{ fontWeight: 500, color: 'var(--fg-1)' }}>
                    <span className={`dropoff-sev ${d.severity}`}></span>
                    {d.candidate.name}
                  </div>
                  <div className="e text-xs" style={{ color: 'var(--fg-3)', marginTop: 3 }}>
                    <SvcChip code={d.service} state="dropped" />
                    <span style={{ marginLeft: 6 }}>{d.reason} · {fmtDate(d.when)}</span>
                  </div>
                </div>
                <ScoreBadge value={d.score} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">
                Live offers <span className="count">{window.OFFERS.filter(o => o.status === 'live' || o.status === 'ending').length}</span>
              </h3>
              <p className="card-sub">Active codes and their redemption velocity.</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setRoute({ id: 'offers' })}>
              All offers <window.Icon name="chevron-right" size={12} />
            </button>
          </div>
          <div>
            {window.OFFERS.filter(o => o.status !== 'paused').slice(0, 5).map(o => (
              <div key={o.id} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-1)' }}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--primary-800)', background: 'var(--primary-50)', padding: '2px 7px', borderRadius: 4 }}>
                      {o.code}
                    </span>
                    {o.service !== 'all' && <SvcChip code={o.service} />}
                  </div>
                  <div className="text-xs" style={{ color: o.status === 'ending' ? 'var(--amber-strong)' : 'var(--fg-3)', fontWeight: o.status === 'ending' ? 600 : 400 }}>
                    {o.status === 'ending' ? 'Ends ' + fmtDate(o.validUntil) : 'Active'}
                  </div>
                </div>
                <div className="text-sm" style={{ color: 'var(--fg-2)', marginBottom: 8 }}>{o.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 6, background: 'var(--bg-alt)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: o.cap ? Math.min(100, o.uses / o.cap * 100) + '%' : '100%', height: '100%', background: 'var(--primary)' }}></div>
                  </div>
                  <div className="text-xs tnum" style={{ color: 'var(--fg-3)', minWidth: 60, textAlign: 'right' }}>
                    {o.uses}{o.cap ? ` / ${o.cap}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiTile({ label, value, delta, trend, sub, spark, color = 'var(--primary)', warn }) {
  return (
    <div className="kpi">
      <div className="kpi-label">
        {label}
        {warn && <window.Icon name="alert" size={13} style={{ stroke: 'var(--amber-strong)' }} />}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-meta">
        <span className={`kpi-delta ${trend}`}>
          <window.Icon name={trend === 'up' ? 'arrow-up' : 'arrow-down'} size={11} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 2 }} />
          {delta}
        </span>
        <span>{sub}</span>
      </div>
      <div style={{ marginTop: 10 }}>
        <Sparkline values={spark} color={color} />
      </div>
    </div>
  );
}

function stateTone(s) {
  if (!s) return 'grey';
  const map = {
    'Pending draft': 'amber',
    'Awaiting reviewer': 'amber',
    'In review': 'violet',
    'Ready for delivery': 'green',
    'Delivered': 'grey',
    'Cancelled': 'grey',
  };
  return map[s] || 'grey';
}
function callTone(s) {
  return ({
    'Awaiting schedule': 'amber',
    'Slot proposed': 'violet',
    'Confirmed': 'green',
    'Completed': 'grey',
    'Report pending': 'amber',
  })[s] || 'grey';
}

function PersonalizedHome({ access, setRoute, openCandidate }) {
  const user = access.user;
  const role = access.role;
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const firstName = user.name.split(' ')[0];

  // My assigned RR orders
  const myRR = access.canAccess('RR')
    ? (window.RR_ORDERS_FULL || []).filter(o => o.writer === user.name).filter(o => !['Delivered','Cancelled'].includes(o.state))
    : [];

  // My assigned MRR orders
  const myMRR = access.canAccess('MRR')
    ? (window.MRR_ORDERS || []).filter(o => o.writer === user.name).filter(o => !['Delivered','Cancelled'].includes(o.state))
    : [];

  // My RC orders
  const myRC = access.canAccess('RC')
    ? (window.RC_ORDERS_FULL || []).filter(o => o.recruiter === user.name).filter(o => !['Closed','Cancelled'].includes(o.state))
    : [];

  const totalOpen = myRR.length + myMRR.length + myRC.length;
  const urgent = myRR.filter(o => o.slaRemainingMin < 4 * 60).length;

  return (
    <div className="page">
      <PageHead
        title={`Good morning, ${firstName}`}
        sub={`Today is ${todayStr}. Here are your assigned orders.`}
        actions={<>
          <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 4, background: role.bg, color: role.color, fontWeight: 600 }}>{role.label}</span>
        </>}
      />

      {/* Personal KPI row */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <KpiTile label="My open orders" value={totalOpen} sub="assigned to me" spark={[2,3,2,4,3,5,4,6,5,7,6,totalOpen]} />
        {myRR.length > 0 && <KpiTile label="RR — urgent" value={urgent} sub="SLA < 4h" color="var(--amber-strong)" warn={urgent > 0} spark={[0,1,0,2,1,3,2,1,2,urgent,urgent,urgent]} />}
        {myMRR.length > 0 && <KpiTile label="MRR — in rewrite" value={myMRR.filter(o => o.state === 'In Rewrite').length} sub="active rewrites" color="var(--violet-strong)" spark={[1,1,2,1,2,2,3,2,3,3,2,myMRR.filter(o=>o.state==='In Rewrite').length]} />}
        {myRC.length > 0  && <KpiTile label="RC — upcoming" value={myRC.filter(o => o.state === 'Scheduled').length} sub="calls scheduled" color="var(--green-strong)" spark={[1,2,1,3,2,3,2,4,3,4,3,myRC.filter(o=>o.state==='Scheduled').length]} />}
        {myRR.length === 0 && myMRR.length === 0 && myRC.length === 0 && <KpiTile label="All caught up" value={0} sub="no open orders" color="var(--green-strong)" spark={[0,0,0,0,0,0,0,0,0,0,0,0]} />}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 24 }}>
        {/* My RR queue */}
        {myRR.length > 0 && (
          <div className="card">
            <div className="card-head">
              <div><h3 className="card-title">My Resume Report orders <span className="count">{myRR.length}</span></h3><p className="card-sub">Sorted by SLA urgency.</p></div>
              <button className="btn btn-ghost btn-sm" onClick={() => setRoute({ id: 'svc-rr', code: 'RR' })}>View all <window.Icon name="chevron-right" size={12} /></button>
            </div>
            <table className="tbl">
              <thead><tr><th>Order</th><th>Candidate</th><th>Status</th><th>SLA</th><th>Score</th></tr></thead>
              <tbody>
                {myRR.slice(0,6).map(o => (
                  <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => openCandidate && openCandidate(o.candidate.id)}>
                    <td className="tnum text-muted">{o.id}</td>
                    <td><div className="av-row"><Avatar initials={o.candidate.avatarInitials} /><div><div className="n">{o.candidate.name}</div><div className="e">{o.candidate.email}</div></div></div></td>
                    <td><Pill tone={window.rrStateTone(o.state)} dot>{o.state}</Pill></td>
                    <td><SlaBadge minutesLeft={o.slaRemainingMin} /></td>
                    <td><ScoreBadge value={o.score} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* My MRR queue */}
        {myMRR.length > 0 && (
          <div className="card">
            <div className="card-head">
              <div><h3 className="card-title">My Manual Resume Rewrite orders <span className="count">{myMRR.length}</span></h3><p className="card-sub">Assigned to me.</p></div>
              <button className="btn btn-ghost btn-sm" onClick={() => setRoute({ id: 'svc-mrr', code: 'MRR' })}>View all <window.Icon name="chevron-right" size={12} /></button>
            </div>
            <table className="tbl">
              <thead><tr><th>Order</th><th>Candidate</th><th>Plan</th><th>Status</th><th>Score before</th><th>Score after</th></tr></thead>
              <tbody>
                {myMRR.slice(0,6).map(o => (
                  <tr key={o.id} style={{ cursor: 'pointer' }}>
                    <td className="tnum text-muted">{o.id}</td>
                    <td><div className="av-row"><Avatar initials={o.candidate.avatarInitials} /><div><div className="n">{o.candidate.name}</div><div className="e">{o.candidate.email}</div></div></div></td>
                    <td><span style={{ fontSize: 11, fontWeight: 600, color: o.plan.key === 'package' ? 'var(--violet-strong)' : 'var(--primary-800)', background: o.plan.key === 'package' ? 'var(--violet-soft)' : 'var(--primary-50)', padding: '2px 7px', borderRadius: 4 }}>{o.plan.label}</span></td>
                    <td><Pill tone={window.mrrStateTone(o.state)} dot>{o.state}</Pill></td>
                    <td><ScoreBadge value={o.originalScore} /></td>
                    <td>{o.rewrittenScore ? <ScoreBadge value={o.rewrittenScore} /> : <span className="text-xs text-muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* My RC queue */}
        {myRC.length > 0 && (
          <div className="card">
            <div className="card-head">
              <div><h3 className="card-title">My Recruiter Connect orders <span className="count">{myRC.length}</span></h3><p className="card-sub">Assigned to me.</p></div>
              <button className="btn btn-ghost btn-sm" onClick={() => setRoute({ id: 'svc-rc', code: 'RC' })}>View all <window.Icon name="chevron-right" size={12} /></button>
            </div>
            <table className="tbl">
              <thead><tr><th>Order</th><th>Candidate</th><th>Status</th><th>Call slot</th><th>Score</th></tr></thead>
              <tbody>
                {myRC.slice(0,6).map(o => (
                  <tr key={o.id} style={{ cursor: 'pointer' }}>
                    <td className="tnum text-muted">{o.id}</td>
                    <td><div className="av-row"><Avatar initials={o.candidate.avatarInitials} /><div><div className="n">{o.candidate.name}</div><div className="e">{o.candidate.email}</div></div></div></td>
                    <td><Pill tone={window.rcStateTone(o.state)} dot>{o.state}</Pill></td>
                    <td className="text-sm text-muted">{o.slot ? fmtDateTime(o.slot) : '—'}</td>
                    <td><ScoreBadge value={o.score} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalOpen === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--fg-3)' }}>
            <window.Icon name="check" size={32} style={{ stroke: 'var(--green-strong)', marginBottom: 12 }} />
            <div className="font-semi" style={{ fontSize: 16 }}>All caught up!</div>
            <div className="text-sm text-muted">No orders assigned to you right now.</div>
          </div>
        )}
      </div>
    </div>
  );
}

window.HomeScreen = HomeScreen;
window.stateTone = stateTone;
window.callTone = callTone;
