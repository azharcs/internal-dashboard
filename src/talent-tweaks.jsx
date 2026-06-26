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
    </window.TweaksPanel>
  );
}

window.TalentTweaks = TalentTweaks;
