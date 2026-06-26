/* Talent500 Tweaks panel — wires useful overrides into the prototype */

function TalentTweaks({ tweaks, setTweak }) {
  return (
    <window.TweaksPanel title="Tweaks">
      <window.TweakSection label="Layout">
        <window.TweakRadio
          label="Density"
          value={tweaks.density}
          options={[{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfy' }]}
          onChange={(v) => setTweak('density', v)} />
        <window.TweakToggle
          label="Collapse sidebar"
          value={tweaks.sidebarCollapsed}
          onChange={(v) => setTweak('sidebarCollapsed', v)} />
        <window.TweakRadio
          label="Surface"
          value={tweaks.contentSurface}
          options={[{ value: 'white', label: 'White' }, { value: 'tinted', label: 'Tinted' }]}
          onChange={(v) => setTweak('contentSurface', v)} />
      </window.TweakSection>

      <window.TweakSection label="Components">
        <window.TweakRadio
          label="Score badge"
          value={tweaks.scoreBadgeStyle}
          options={[{ value: 'solid', label: 'Solid' }, { value: 'outline', label: 'Outline' }]}
          onChange={(v) => setTweak('scoreBadgeStyle', v)} />
        <window.TweakRadio
          label="Status pill"
          value={tweaks.statusPillStyle}
          options={[{ value: 'tinted', label: 'Tinted' }, { value: 'dot', label: 'Dot+text' }]}
          onChange={(v) => setTweak('statusPillStyle', v)} />
      </window.TweakSection>

      <window.TweakSection label="Home">
        <window.TweakRadio
          label="Layout"
          value={tweaks.homeLayout}
          options={[{ value: 'ops', label: 'Ops' }, { value: 'metrics', label: 'Metrics' }]}
          onChange={(v) => setTweak('homeLayout', v)} />
      </window.TweakSection>

      <window.TweakSection label="Preview as user">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {(window.TEAM_MEMBERS || []).filter(m => m.status !== 'suspended').map(m => {
            const role = (window.ROLES || {})[m.role] || {};
            const isCurrent = window._currentUserId === m.id;
            return (
              <button key={m.id} onClick={() => { window._currentUserId = m.id; setTweak('_userSwitch', m.id); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, border: `1px solid ${isCurrent ? 'var(--primary)' : 'transparent'}`, background: isCurrent ? 'var(--primary-50)' : 'transparent', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <div style={{ width: 24, height: 24, borderRadius: 99, background: isCurrent ? 'var(--primary)' : 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: isCurrent ? '#fff' : 'var(--fg-3)', flexShrink: 0 }}>{m.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: isCurrent ? 'var(--primary-800)' : 'var(--fg-1)', lineHeight: 1.2 }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: role.color || 'var(--fg-3)' }}>{role.label}</div>
                </div>
                {isCurrent && <window.Icon name="check" size={11} style={{ stroke: 'var(--primary)', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      </window.TweakSection>
    </window.TweaksPanel>
  );
}

window.TalentTweaks = TalentTweaks;
