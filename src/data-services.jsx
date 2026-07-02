/* Extended data for service detail screens */

const RR_STATES_ALL = ['New','In Review','Report Ready','Delivered','Cancelled'];
const RC_STATES_ALL = ['New','Scheduled','Conducted','No-show','Report Ready','Delivered','Cancelled'];

function _rand(seed) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

// Expanded RR orders with full state machine + writer/reviewer/coupon
function buildRROrdersFull() {
  const r = _rand(7);
  const writers = ['—','Aditi K.','Vivek M.','Sana R.'];
  const coupons = [null, null, null, 'RR99FREE', 'WELCOME99'];
  const list = [];
  for (let i = 0; i < 22; i++) {
    const cand = window.CANDIDATES[Math.floor(r() * window.CANDIDATES.length)];
    const state = RR_STATES_ALL[Math.floor(r() * (RR_STATES_ALL.length - 1))];
    const placed = window.relDate(Math.floor(r() * 6), 8 + Math.floor(r()*10), Math.floor(r()*60));
    const slaTotal = 48 * 60;
    const elapsed = Math.floor((Date.now() - placed) / 60000);
    const remaining = slaTotal - elapsed;
    const writer = ['New','Cancelled'].includes(state) ? '—' : writers[1 + Math.floor(r()*3)];
    const coupon = coupons[Math.floor(r() * coupons.length)];
    const amountPaid = coupon === 'RR99FREE' ? 49 : coupon === 'WELCOME99' ? 0 : 99;
    list.push({
      id: 'RR-' + (5400 + i),
      candidate: cand, tier: 'Standard', state, placed,
      slaRemainingMin: remaining, writer, coupon, amountPaid,
      score: cand.score,
    });
  }
  list.sort((a, b) => a.slaRemainingMin - b.slaRemainingMin);
  return list;
}

// Resume Builder sessions (one per resume)
function buildRBSessions() {
  const r = _rand(31);
  const stages = window.FUNNEL_LABELS.RB;
  const list = [];
  for (let i = 0; i < 32; i++) {
    const cand = window.CANDIDATES[Math.floor(r() * window.CANDIDATES.length)];
    const stageIdx = Math.floor(r() * stages.length);
    const furthestIdx = Math.max(stageIdx, Math.floor(r() * stages.length));
    const started = window.relDate(Math.floor(r() * 14), 9 + Math.floor(r()*9), Math.floor(r()*60));
    const lastActive = window.relDate(Math.floor(r() * 7), 9 + Math.floor(r()*9), Math.floor(r()*60));
    const paid = stageIdx === stages.length - 1;
    const initialScore = cand.score == null ? null : Math.max(20, cand.score - 10 - Math.floor(r()*15));
    const latestScore = cand.score;
    const live = i < 4 && !paid;
    const coupon = paid && r() < 0.3 ? 'RBPRO20' : null;
    list.push({
      id: 'RB-' + (7800 + i),
      candidate: cand, started, lastActive,
      currentStage: stages[stageIdx], currentStageIdx: stageIdx,
      furthestStage: stages[furthestIdx], furthestStageIdx: furthestIdx,
      status: live ? 'active' : paid ? 'paid' : stageIdx >= 4 ? 'completed' : (lastActive < window.relDate(2) ? 'dropped' : 'active'),
      live, initialScore, latestScore,
      scoreDelta: initialScore != null && latestScore != null ? latestScore - initialScore : null,
      amountPaid: paid ? 299 : 0, coupon,
    });
  }
  return list;
}

function buildLOSessions() {
  const r = _rand(57);
  const stages = window.FUNNEL_LABELS.LO;
  const list = [];
  for (let i = 0; i < 18; i++) {
    const cand = window.CANDIDATES[Math.floor(r() * window.CANDIDATES.length)];
    const stageIdx = Math.floor(r() * stages.length);
    const furthestIdx = Math.max(stageIdx, Math.floor(r() * stages.length));
    const started = window.relDate(Math.floor(r() * 12), 9 + Math.floor(r()*9), Math.floor(r()*60));
    const paid = stageIdx >= 4;
    const slug = cand.name.toLowerCase().replace(/\s+/g,'-');
    list.push({
      id: 'LO-' + (2100 + i),
      candidate: cand, started,
      linkedinUrl: 'https://linkedin.com/in/' + slug,
      currentStage: stages[stageIdx], currentStageIdx: stageIdx,
      furthestStage: stages[furthestIdx], furthestStageIdx: furthestIdx,
      status: paid ? 'paid' : stageIdx >= 2 ? 'progress' : (Math.random() < 0.3 ? 'dropped' : 'active'),
      score: cand.score,
      amountPaid: paid ? 199 : 0,
      coupon: paid && r() < 0.2 ? 'LINKED15' : null,
    });
  }
  return list;
}

function buildIIQSessions() {
  const r = _rand(83);
  const stages = window.FUNNEL_LABELS.IIQ;
  const targets = ['SDE-2 (Bengaluru GCC)','PM (Hyderabad)','Frontend (Pune)','Data Scientist (Mumbai)','Backend (Chennai)','UX (Bengaluru)'];
  const attempts = ['In progress','Completed','No-show','Cancelled'];
  const list = [];
  for (let i = 0; i < 26; i++) {
    const cand = window.CANDIDATES[Math.floor(r() * window.CANDIDATES.length)];
    const plan = r() < 0.65 ? 'free' : 'paid';
    const stageIdx = Math.floor(r() * stages.length);
    const started = window.relDate(Math.floor(r() * 15), 9 + Math.floor(r()*9), Math.floor(r()*60));
    const status = attempts[Math.floor(r() * attempts.length)];
    const interviewScore = status === 'Completed' ? Math.floor(50 + r() * 45) : null;
    list.push({
      id: 'IIQ-' + (4400 + i),
      candidate: cand, plan,
      target: targets[Math.floor(r() * targets.length)],
      duration: plan === 'free' ? '10 min' : '45 min',
      attemptStatus: status,
      interviewScore,
      currentStage: stages[stageIdx], currentStageIdx: stageIdx,
      started,
      amountPaid: plan === 'paid' ? 299 : 0,
    });
  }
  return list;
}

function buildRCOrdersFull() {
  const r = _rand(91);
  const recs = ['—','Anjali Verma','Rohit Singh','Maya Krishnan','Devika P.','Akash R.'];
  const callStatuses = ['—','Awaiting','Confirmed','Conducted','Missed'];
  const coupons = [null, null, null, 'GCC500'];
  const list = [];
  for (let i = 0; i < 14; i++) {
    const cand = window.CANDIDATES[Math.floor(r() * window.CANDIDATES.length)];
    const state = RC_STATES_ALL[Math.floor(r() * (RC_STATES_ALL.length - 1))];
    const placed = window.relDate(Math.floor(r() * 14), 9 + Math.floor(r()*8), Math.floor(r()*60));
    const slot = state === 'New' ? null : window.relDate(-Math.floor(r() * 7) + Math.floor(r() * 5), 11 + Math.floor(r()*7), [0,15,30,45][Math.floor(r()*4)]);
    const recruiter = state === 'New' ? '—' : recs[1 + Math.floor(r()*5)];
    const callStatus = state === 'New' ? '—' : state === 'Scheduled' ? 'Confirmed' : state === 'Conducted' ? 'Conducted' : state === 'No-show' ? 'Missed' : ['Conducted','Confirmed'][Math.floor(r()*2)];
    const coupon = coupons[Math.floor(r() * coupons.length)];
    const daysSincePayment = Math.floor((Date.now() - placed) / 86400000);
    list.push({
      id: 'RC-' + (3200 + i),
      candidate: cand, state, recruiter, slot, callStatus,
      daysSincePayment, amountPaid: coupon === 'GCC500' ? 999 : 1499, coupon,
      score: cand.score, placed,
    });
  }
  list.sort((a, b) => (a.slot || 0) - (b.slot || 0));
  return list;
}

const MRR_STATES_ALL = ['New','Resume Received','In Rewrite','Delivered','Cancelled'];

function buildMRROrders() {
  const r = _rand(137);
  const writers = ['—','Aditi K.','Vivek M.','Sana R.','Riya S.'];
  const reviewers = ['—','Naveen K.','Priya M.','Karthik S.'];
  const plans = [
    { key: 'pro',     label: 'Resume Pro',     price: 2300, services: ['Resume Report','Recruiter Connect','Manual Resume Rewriting'] },
    { key: 'package', label: 'Resume Package', price: 2800, services: ['Resume Report','Recruiter Connect','Manual Resume Rewriting','LinkedIn Optimisation','Manual Cover Letter'] },
  ];
  const scores = [42,51,58,63,67,71,74,78,82];
  const rewrittenScores = [68,74,79,82,85,87,89,91,93];
  const list = [];
  for (let i = 0; i < 18; i++) {
    const cand = window.CANDIDATES[Math.floor(r() * window.CANDIDATES.length)];
    const plan = plans[Math.floor(r() * plans.length)];
    const state = MRR_STATES_ALL[Math.floor(r() * (MRR_STATES_ALL.length - 2))];
    const placed = window.relDate(Math.floor(r() * 10), 9 + Math.floor(r()*9), Math.floor(r()*60));
    const hadRR = r() < 0.45;
    const rrDiscount = hadRR ? 99 : 0;
    const amountPaid = plan.price - rrDiscount;
    const writer = ['New','Cancelled'].includes(state) ? '—' : writers[1 + Math.floor(r() * (writers.length-1))];
    const originalScore = scores[Math.floor(r() * scores.length)];
    const hasRewritten = ['Delivered'].includes(state);
    const rewrittenScore = hasRewritten ? rewrittenScores[Math.floor(r() * rewrittenScores.length)] : null;
    const hasOriginalResume = state !== 'New';
    list.push({
      id: 'MRR-' + (6100 + i),
      candidate: cand,
      plan,
      state,
      placed,
      rrDiscount,
      amountPaid,
      writer,
      originalScore,
      rewrittenScore,
      originalResume: hasOriginalResume ? { name: `${cand.name.split(' ')[0]}_Resume.pdf`, uploadedAt: window.relDate(Math.floor(r()*8), 10 + Math.floor(r()*6), Math.floor(r()*60)) } : null,
      rewrittenResume: hasRewritten ? { name: `${cand.name.split(' ')[0]}_Resume_Rewritten.pdf`, uploadedAt: window.relDate(Math.floor(r()*3), 14 + Math.floor(r()*4), Math.floor(r()*60)) } : null,
      coupon: r() < 0.2 ? 'MRRSAVE200' : null,
    });
  }
  list.sort((a, b) => a.placed - b.placed);
  return list;
}

window.MRR_STATES_ALL = MRR_STATES_ALL;
window.MRR_ORDERS = buildMRROrders();

window.mrrStateTone = (s) => ({
  'New':'grey','Resume Received':'blue','In Rewrite':'violet',
  'Delivered':'green','Cancelled':'red'
}[s] || 'grey');

window.MRR_TRANSITIONS = {
  'New': ['Resume Received','Cancelled'],
  'Resume Received': ['In Rewrite','Cancelled'],
  'In Rewrite': ['Delivered'],
  'Delivered': [],
  'Cancelled': [],
};

window.RR_STATES_ALL = RR_STATES_ALL;
window.RC_STATES_ALL = RC_STATES_ALL;
window.RR_ORDERS_FULL = buildRROrdersFull();
window.RB_SESSIONS = buildRBSessions();
window.LO_SESSIONS = buildLOSessions();
window.IIQ_SESSIONS = buildIIQSessions();
window.RC_ORDERS_FULL = buildRCOrdersFull();

window.rrStateTone = (s) => ({
  'New':'grey','In Review':'violet',
  'Report Ready':'green','Delivered':'grey','Cancelled':'red'
}[s] || 'grey');

window.rcStateTone = (s) => ({
  'New':'grey','Scheduled':'blue','Conducted':'violet',
  'No-show':'red','Report Ready':'green','Delivered':'grey','Cancelled':'red'
}[s] || 'grey');

window.RR_TRANSITIONS = {
  'New': ['In Review','Cancelled'],
  'In Review': ['Report Ready','Cancelled'],
  'Report Ready': ['Delivered'],
  'Delivered': [],
  'Cancelled': [],
};
window.RC_TRANSITIONS = {
  'New': ['Scheduled','Cancelled'],
  'Scheduled': ['Conducted','No-show'],
  'Conducted': ['Report Ready'],
  'No-show': ['Scheduled','Cancelled'],
  'Report Ready': ['Delivered'],
  'Delivered': [],
  'Cancelled': [],
};
