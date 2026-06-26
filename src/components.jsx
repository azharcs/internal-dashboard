/* Shared components: pills, score badges, service chips, tables, etc. */

// === Pills ===========================================================
function Pill({ tone = 'grey', dot, children }) {
  return (
    <span className={`pill pill-${tone}`}>
      {dot && <span className="dot"></span>}
      {children}
    </span>
  );
}

const LIFECYCLE_TONE = { new: 'blue', engaged: 'violet', paid: 'green', dormant: 'amber', churned: 'red' };
function LifecyclePill({ stage }) {
  return <Pill tone={LIFECYCLE_TONE[stage] || 'grey'} dot>{stage[0].toUpperCase() + stage.slice(1)}</Pill>;
}

function PlanPill({ plan }) {
  if (plan === 'paid') return <Pill tone="violet">Paid</Pill>;
  return <Pill tone="grey">Free</Pill>;
}

// === Score badge =====================================================
function ScoreBadge({ value, size = 'sm', live }) {
  let tone;
  if (value == null) tone = 'na';
  else if (value < 50) tone = 'red';
  else if (value <= 70) tone = 'amber';
  else tone = 'green';
  const cls = `score score-${tone}` + (size === 'lg' ? ' score-lg' : size === 'xl' ? ' score-xl' : '') + (live ? ' score-live' : '');
  return <span className={cls}>{value == null ? '—' : value}</span>;
}

// === Service icon chip ==============================================
function SvcChip({ code, state }) {
  const s = state ? `svc-chip-state-${state}` : '';
  return <span className={`svc-chip ${s}`} title={`${window.SERVICES[code]?.name} · ${state || 'no activity'}`}>{code}</span>;
}

function SvcChipStack({ items, max = 4 }) {
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  return (
    <span className="svc-chip-stack">
      {shown.map((s, i) => <SvcChip key={i} code={s.code} state={s.state} />)}
      {rest > 0 && <span className="svc-chip-overflow">+{rest} more</span>}
    </span>
  );
}

// === SLA badge =======================================================
function SlaBadge({ minutesLeft }) {
  if (minutesLeft == null) return null;
  let tone, label, breached = false;
  if (minutesLeft < 0) {
    tone = 'breach'; label = 'Breached ' + fmtDuration(-minutesLeft); breached = true;
  } else if (minutesLeft < 60 * 6) {
    tone = 'warn'; label = fmtDuration(minutesLeft) + ' left';
  } else {
    tone = 'ok'; label = fmtDuration(minutesLeft) + ' left';
  }
  return (
    <span className={`sla sla-${tone}`}>
      <window.Icon name={breached ? 'alert' : 'clock'} size={11} />
      {label}
    </span>
  );
}

function fmtDuration(min) {
  if (min < 60) return Math.floor(min) + 'm';
  const h = Math.floor(min / 60);
  const m = Math.floor(min % 60);
  if (h < 24) return `${h}h${m ? ' ' + m + 'm' : ''}`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}

// === Avatar ==========================================================
function Avatar({ initials, size = 'sm' }) {
  return <span className={`av ${size === 'lg' ? 'av-lg' : ''}`}>{initials}</span>;
}

// === Currency cell ===================================================
function Currency({ value }) {
  if (value == null || value === 0) return <span className="ccy ccy-zero">₹0</span>;
  return <span className="ccy">{fmtINR(value)}</span>;
}

// === Tag chips =======================================================
function TagList({ tags, onAdd }) {
  return (
    <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
      {tags.map((t, i) => <span key={i} className="tag">{t}</span>)}
      {onAdd && (
        <button className="tag-add" onClick={onAdd}>
          <window.Icon name="plus" size={10} /> Add tag
        </button>
      )}
    </div>
  );
}

// === Filter rail =====================================================
function FilterRail({ children, onClear }) {
  return (
    <aside className="filter-rail">
      {children}
      {onClear && <button className="filter-clear" onClick={onClear}>Clear all filters</button>}
    </aside>
  );
}

function FilterGroup({ title, options, selected, onToggle, counts = {} }) {
  return (
    <>
      <h4>{title}</h4>
      <div className="filter-group">
        {options.map(opt => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const label = typeof opt === 'string' ? opt : opt.label;
          const on = selected.includes(val);
          return (
            <label key={val} className={`filter-chip ${on ? 'is-on' : ''}`} onClick={() => onToggle(val)}>
              <span className="filter-chip-cb">
                {on && <window.Icon name="check" size={9} />}
              </span>
              <span>{label}</span>
              {counts[val] != null && <span className="count">{counts[val]}</span>}
            </label>
          );
        })}
      </div>
    </>
  );
}

// === Funnel breadcrumb ===============================================
function FunnelBreadcrumb({ stages, currentIdx }) {
  return (
    <div className="fnl">
      {stages.map((s, i) => {
        const cls = i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'future';
        return <span key={i} className={`step ${cls}`}>{s}</span>;
      })}
    </div>
  );
}

// === Sparkline =======================================================
function Sparkline({ values, color = 'var(--primary)', height = 26, fill = true }) {
  if (!values || values.length === 0) return null;
  const w = 100; const h = height;
  const min = Math.min(...values); const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const fillPath = path + ` L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {fill && <path d={fillPath} fill={color} opacity="0.12" />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// === Mini funnel bar (cohort summary) ==========================
function FunnelBar({ counts, colors }) {
  const total = counts.reduce((a,b) => a+b, 0);
  if (total === 0) return null;
  return (
    <div className="fnl-bar">
      {counts.map((c, i) => (
        <div key={i} style={{ width: (c / total * 100) + '%', background: colors[i] || 'var(--primary)' }} title={c} />
      ))}
    </div>
  );
}

// === Modal ===========================================================
function Modal({ title, sub, onClose, children, footer, width }) {
  React.useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <>
      <div className="modal-scrim" onClick={onClose}></div>
      <div className="modal" style={width ? { width } : null}>
        <div className="modal-head">
          <div>
            <h3>{title}</h3>
            {sub && <p>{sub}</p>}
          </div>
          <button className="modal-close" onClick={onClose}><window.Icon name="x" size={16} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </>
  );
}

// === Coupon code preview =========================================
function CodePreview({ code }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };
  return (
    <div className="code-preview">
      <window.Icon name="tag" size={14} />
      {code}
      <button className="copy" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
    </div>
  );
}

// === Page wrapper ====================================================
function PageHead({ title, sub, actions }) {
  return (
    <div className="page-head">
      <div>
        <h1 className="page-title">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

// === Empty state =====================================================
function EmptyState({ icon = 'inbox', title, body }) {
  return (
    <div className="empty">
      <div className="empty-icon"><window.Icon name={icon} size={20} /></div>
      <h4>{title}</h4>
      {body && <p>{body}</p>}
    </div>
  );
}

Object.assign(window, {
  Pill, LifecyclePill, PlanPill, ScoreBadge, SvcChip, SvcChipStack,
  SlaBadge, fmtDuration, Avatar, Currency, TagList,
  FilterRail, FilterGroup, FunnelBreadcrumb, Sparkline, FunnelBar,
  Modal, CodePreview, PageHead, EmptyState
});
