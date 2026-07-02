/* Mock data for Talent500 Candidate Services dashboard.
   Predominantly Indian names. Realistic distribution of states. */

const SERVICES = {
  RR: { code: 'RR', name: 'Resume Report',     mode: 'manual',     price: 99,   sla: '48h SLA' },
  RB: { code: 'RB', name: 'Resume Builder',    mode: 'self-serve', price: null, sla: null },
  LO: { code: 'LO', name: 'LinkedIn Optimiser', mode: 'self-serve', price: 199, sla: null },
  IIQ:{ code: 'IIQ',name: 'Interview IQ',       mode: 'self-serve', price: 299, sla: null, freemium: true },
  RC: { code: 'RC', name: 'Recruiter Connect',  mode: 'manual',     price: 1499, sla: '7-day schedule' },
};

const LIFECYCLE = ['new', 'engaged', 'paid', 'dormant', 'churned'];

const FUNNEL_LABELS = {
  RR: ['Landed', 'Pricing seen', 'Checkout', 'Paid', 'Writer assigned', 'In Review', 'Delivered'],
  RB: ['Landed', 'Editor opened', 'Section completed', 'Resume saved', 'Downloaded', 'Paywall seen', 'Paid'],
  LO: ['Landed', 'Resume uploaded', 'LinkedIn URL added', 'Pricing seen', 'Paid', 'Profile generated', 'Downloaded'],
  IIQ:['Landed', 'Free mock booked', 'Free mock done', 'Score viewed', 'Paywall seen', 'Paid', 'Paid mock done'],
  RC: ['Landed', 'Pricing seen', 'Paid', 'Slot proposed', 'Slot confirmed', 'Call done', 'Report delivered'],
};

const FIRST = ['Aarav','Priya','Rohan','Ananya','Vikram','Ishita','Kabir','Riya','Arjun','Diya','Aditya','Saanvi','Karthik','Meera','Devansh','Tanya','Yash','Zoya','Krish','Avani','Nikhil','Radhika','Aryan','Ira','Reyansh','Naina','Veer','Aanya','Aditi','Pranav','Kavya','Siddharth','Pooja','Ayaan','Anika','Rishabh','Trisha','Manav','Sneha','Dhruv','Sara','Aman','Khushi','Kunal','Neha','Vihaan','Tara','Shivansh','Anjali','Neil'];
const LAST = ['Mehta','Iyer','Das','Sharma','Verma','Reddy','Nair','Kapoor','Khanna','Patel','Joshi','Singh','Bansal','Bose','Chopra','Rao','Pillai','Gupta','Malhotra','Saxena','Krishnan','Banerjee','Gandhi','Bhatt','Menon','Agarwal','Sinha','Desai','Ahuja','Roy','Pandey','Naidu','Bhattacharya','Lal','Kumar','Bedi','Mahajan','Shetty','Trivedi','Choudhury'];

const CITIES = ['Bengaluru','Mumbai','Delhi','Hyderabad','Pune','Chennai','Gurgaon','Noida','Kolkata','Ahmedabad'];
const ROLES_BG = ['SDE-2','Frontend Engineer','Product Manager','Data Scientist','UX Designer','Backend Engineer','DevOps Engineer','QA Engineer','Marketing Manager','Sales Lead'];

// deterministic pseudo-random
function rand(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function fmtINR(n) {
  if (n == null) return '—';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function relDate(daysAgo, hour = 10, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, min, 0, 0);
  return d;
}

function fmtDate(d) {
  if (!d) return '—';
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return diffMin + 'm ago';
  if (diffHr < 24) return diffHr + 'h ago';
  if (diffDay < 7) return diffDay + 'd ago';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
}

function fmtDateTime(d) {
  if (!d) return '—';
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
}

// Build candidates ----------------------------------------------------------
function buildCandidates() {
  const r = rand(42);
  const list = [];
  const N = 38;
  for (let i = 0; i < N; i++) {
    const fn = FIRST[Math.floor(r() * FIRST.length)];
    const ln = LAST[Math.floor(r() * LAST.length)];
    const name = fn + ' ' + ln;
    const email = (fn + '.' + ln).toLowerCase().replace(/\s+/g,'') + '@' + ['gmail.com','outlook.com','yahoo.in','company.com','iitb.ac.in'][Math.floor(r()*5)];
    const phone = '+91 ' + (60000 + Math.floor(r()*30000)) + ' ' + (10000 + Math.floor(r()*89999));
    const city = CITIES[Math.floor(r()*CITIES.length)];
    const role = ROLES_BG[Math.floor(r()*ROLES_BG.length)];

    // Score: ~15% none, otherwise weighted
    const sRoll = r();
    let score = null;
    if (sRoll > 0.15) {
      const v = r();
      if (v < 0.25) score = Math.floor(35 + r() * 14);     // <50 red
      else if (v < 0.55) score = Math.floor(50 + r() * 20); // 50-70 amber
      else score = Math.floor(70 + r() * 25);                // >70 green
    }

    // services they engaged with (1-4)
    const allCodes = ['RR','RB','LO','IIQ','RC'];
    const sCount = 1 + Math.floor(r() * 4);
    const shuffled = [...allCodes].sort(() => r() - 0.5);
    const svcCodes = shuffled.slice(0, sCount);
    const svcStates = svcCodes.map(code => {
      const v = r();
      let state;
      if (v < 0.4) state = 'paid';
      else if (v < 0.6) state = 'progress';
      else if (v < 0.8) state = 'dropped';
      else if (v < 0.92) state = 'active';
      else state = 'closed';
      return { code, state };
    });

    // Lifecycle
    const hasPaid = svcStates.some(s => s.state === 'paid' || s.state === 'active');
    const hasDropped = svcStates.some(s => s.state === 'dropped');
    let lc;
    const lcRoll = r();
    if (hasPaid) lc = lcRoll < 0.85 ? 'paid' : 'engaged';
    else if (hasDropped) lc = lcRoll < 0.5 ? 'engaged' : 'dormant';
    else lc = ['new','engaged','dormant','churned'][Math.floor(r()*4)];

    // Amount paid (₹0 if no paid services; never —)
    let amount = 0;
    svcStates.forEach(s => { if (s.state === 'paid' || s.state === 'active') amount += SERVICES[s.code].price || 0; });
    if (lc === 'paid' && amount === 0) amount = 99;

    // Furthest funnel stage label
    const fsCode = svcCodes[Math.floor(r() * svcCodes.length)];
    const stages = FUNNEL_LABELS[fsCode];
    const stageIdx = Math.floor(r() * stages.length);
    const furthestFunnel = SERVICES[fsCode].name + ': ' + stages[stageIdx];

    // dates
    const joined = relDate(Math.floor(r() * 220), 9 + Math.floor(r()*8), Math.floor(r()*60));
    const lastActive = relDate(Math.floor(r() * 30), 9 + Math.floor(r()*10), Math.floor(r()*60));

    // tags
    const tagPool = ['IIT/NIT', 'GCC-target', 'Senior IC', 'Refer', 'Switch ≤6mo', 'Notice 60d', 'Repeat buyer', 'Beta user'];
    const tagN = Math.floor(r() * 3);
    const tags = [];
    for (let t = 0; t < tagN; t++) {
      const tg = tagPool[Math.floor(r() * tagPool.length)];
      if (!tags.includes(tg)) tags.push(tg);
    }

    // do not contact (3%)
    const dnc = r() < 0.03;

    // open drop-offs
    const openDropoffs = svcStates.filter(s => s.state === 'dropped').length;

    list.push({
      id: 'CDT-' + (1000 + i),
      name, email, phone, city, role,
      avatarInitials: (fn[0] + ln[0]).toUpperCase(),
      score, lc, svcStates, amount,
      furthestFunnel, joined, lastActive, tags, dnc, openDropoffs
    });
  }
  return list;
}

const CANDIDATES = buildCandidates();

// Resume Report orders ------------------------------------------------------
function buildOrders() {
  const r = rand(7);
  const list = [];
  const states = ['New','In Review','Report Ready','Delivered','Cancelled'];
  for (let i = 0; i < 22; i++) {
    const cand = CANDIDATES[Math.floor(r() * CANDIDATES.length)];
    const state = states[Math.floor(r() * (states.length - 0.5))];
    const placed = relDate(Math.floor(r() * 6), 8 + Math.floor(r()*10), Math.floor(r()*60));
    const slaTotal = 48 * 60; // minutes
    const elapsed = Math.floor((Date.now() - placed) / 60000);
    const remaining = slaTotal - elapsed;
    list.push({
      id: 'RR-' + (5400 + i),
      candidate: cand,
      state,
      placed,
      slaRemainingMin: remaining,
      score: cand.score,
    });
  }
  // sort by sla urgency
  list.sort((a, b) => a.slaRemainingMin - b.slaRemainingMin);
  return list;
}

const RR_ORDERS = buildOrders();

// Recruiter Connect calls ---------------------------------------------------
function buildCalls() {
  const r = rand(99);
  const recs = ['Anjali Verma','Rohit Singh','Maya Krishnan','Devika P.','Akash R.','Priya N.'];
  const states = ['Awaiting schedule','Slot proposed','Confirmed','Completed','Report pending'];
  const list = [];
  for (let i = 0; i < 14; i++) {
    const cand = CANDIDATES[Math.floor(r() * CANDIDATES.length)];
    const dayOffset = Math.floor(r() * 14) - 4; // -4 to +10 days
    const when = relDate(-dayOffset, 11 + Math.floor(r()*7), [0,15,30,45][Math.floor(r()*4)]);
    let state;
    if (dayOffset < -1) state = r() < 0.5 ? 'Completed' : 'Report pending';
    else if (dayOffset < 1) state = 'Confirmed';
    else state = ['Awaiting schedule','Slot proposed','Confirmed'][Math.floor(r()*3)];
    list.push({
      id: 'RC-' + (3200 + i),
      candidate: cand,
      recruiter: recs[Math.floor(r() * recs.length)],
      when,
      state,
      score: cand.score,
    });
  }
  list.sort((a, b) => a.when - b.when);
  return list;
}

const RC_CALLS = buildCalls();

// Drop-offs -----------------------------------------------------------------
function buildDropoffs() {
  const r = rand(123);
  const list = [];
  const reasons = {
    RR: ['Pricing seen, no checkout','Cart abandoned','Payment failed'],
    RB: ['Editor opened, never saved','Resume not downloaded','Paywall seen'],
    LO: ['Resume uploaded, no LinkedIn URL','Pricing seen, no payment'],
    IIQ:['Free mock booked, no-show','Paywall seen, exited'],
    RC: ['Pricing seen, no payment','Slot proposed, ignored'],
  };
  const codes = Object.keys(reasons);
  for (let i = 0; i < 28; i++) {
    const code = codes[Math.floor(r() * codes.length)];
    const reasonList = reasons[code];
    const cand = CANDIDATES[Math.floor(r() * CANDIDATES.length)];
    const reason = reasonList[Math.floor(r() * reasonList.length)];
    const sev = r() < 0.3 ? 'high' : r() < 0.7 ? 'med' : 'low';
    const when = relDate(Math.floor(r() * 10), 9 + Math.floor(r()*8), Math.floor(r()*60));
    list.push({
      id: 'DO-' + (8800 + i),
      candidate: cand,
      service: code,
      reason,
      severity: sev,
      when,
      score: cand.score,
      cohortReady: r() < 0.7,
    });
  }
  list.sort((a, b) => b.when - a.when);
  return list;
}

const DROPOFFS = buildDropoffs();

// Offers --------------------------------------------------------------------
const OFFERS = [
  { id: 'OFF-201', code: 'RBPRO20',    label: 'Resume Builder paywall — 20% off', service: 'RB', discount: '20%', validUntil: relDate(-12), uses: 47, cap: 200, status: 'live' },
  { id: 'OFF-202', code: 'RR99FREE',   label: 'Resume Report ₹99 → ₹49',          service: 'RR', discount: '₹50', validUntil: relDate(-5),  uses: 12, cap: 100, status: 'live' },
  { id: 'OFF-203', code: 'IIQUPGRADE', label: 'Interview IQ free → paid 30% off', service: 'IIQ',discount: '30%', validUntil: relDate(-21), uses: 88, cap: 500, status: 'live' },
  { id: 'OFF-204', code: 'GCC500',     label: 'Recruiter Connect — flat ₹500 off',service: 'RC', discount: '₹500',validUntil: relDate(-2),  uses: 4,  cap: 50,  status: 'ending' },
  { id: 'OFF-205', code: 'LINKED15',   label: 'LinkedIn Optimiser — 15% off',     service: 'LO', discount: '15%', validUntil: relDate(60),  uses: 220,cap: 250, status: 'paused' },
  { id: 'OFF-206', code: 'WELCOME99',  label: 'First-time buyer — 99 off any',    service: 'all',discount: '₹99', validUntil: relDate(-30), uses: 156,cap: null,status: 'live' },
];

// Timeline events for one candidate -----------------------------------------
function buildTimelineFor(cand) {
  return [
    { type: 'svc-paid',   icon: 'card',  tone: 'violet', when: relDate(0, 11, 12),   text: 'Paid for Resume Report',         meta: ['₹99', 'Order RR-5418'] },
    { type: 'svc-state',  icon: 'sparkles', tone: 'violet', when: relDate(0, 11, 13), text: 'AI draft generated',             meta: ['1.4s', 'v1'] },
    { type: 'svc-state',  icon: 'user', tone: 'green', when: relDate(0, 14, 6),     text: 'Writer assigned: Aditi K.',       meta: [] },
    { type: 'doc',        icon: 'file', tone: 'green', when: relDate(1, 17, 32),    text: 'Resume v2 uploaded by candidate', meta: ['PDF · 312 KB'] },
    { type: 'svc-state',  icon: 'pulse',tone: 'amber', when: relDate(1, 16, 4),     text: 'Drop-off recorded — RB paywall',  meta: ['Resume Builder'] },
    { type: 'lifecycle',  icon: 'flag', tone: 'violet', when: relDate(2, 9, 0),     text: 'Lifecycle changed: engaged → paid', meta: ['by Sushant V.'] },
    { type: 'tag',        icon: 'tag',  tone: 'green',  when: relDate(2, 8, 45),    text: 'Tag added: Senior IC',            meta: [] },
    { type: 'note',       icon: 'note', tone: 'green',  when: relDate(3, 18, 8),    text: 'Note added by Sushant V.',        meta: ['Repeat buyer — handled RC last quarter'] },
    { type: 'svc-paid',   icon: 'card', tone: 'violet', when: relDate(4, 19, 22),   text: 'Paid for LinkedIn Optimiser',     meta: ['₹199', 'Order LO-2102'] },
    { type: 'score',      icon: 'gauge',tone: 'green',  when: relDate(5, 12, 19),   text: 'Resume score updated: 64 → 78',   meta: ['+14'] },
    { type: 'svc-paid',   icon: 'card', tone: 'violet', when: relDate(8, 9, 45),    text: 'Paid for Resume Builder Pro',     meta: ['₹299', 'Order RB-7812'] },
    { type: 'signup',     icon: 'user-add', tone: 'green', when: relDate(34, 14, 5), text: 'Account created',                meta: ['Source: organic / google'] },
  ];
}

window.SERVICES = SERVICES;
window.LIFECYCLE = LIFECYCLE;
window.FUNNEL_LABELS = FUNNEL_LABELS;
window.CANDIDATES = CANDIDATES;
window.RR_ORDERS = RR_ORDERS;
window.RC_CALLS = RC_CALLS;
window.DROPOFFS = DROPOFFS;
window.OFFERS = OFFERS;
window.fmtINR = fmtINR;
window.fmtDate = fmtDate;
window.fmtDateTime = fmtDateTime;
window.relDate = relDate;
window.buildTimelineFor = buildTimelineFor;
