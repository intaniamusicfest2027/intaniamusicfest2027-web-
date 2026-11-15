/* INTANIA MUSIC FEST — shared client code (no build step) */
(function () {
  const CFG = window.IMF_CONFIG || {};
  // accept URLs pasted with /rest/v1, /auth/v1 or a trailing slash
  CFG.SUPABASE_URL = String(CFG.SUPABASE_URL || '').trim().replace(/\/+$/, '').replace(/\/(rest|auth)\/v1$/, '');
  CFG.SUPABASE_ANON_KEY = String(CFG.SUPABASE_ANON_KEY || '').trim();
  const EVENT = {
    name: 'INTANIA MUSIC FEST',
    start: CFG.EVENT_START || '2027-01-28T17:00:00+07:00',
    place: 'ลานอินทาเนีย คณะวิศวกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย',
    ig: CFG.CONTACT_IG || 'intaniamusicfest',
    hashtag: '#IntaniaMusicFest2027isBack'
  };
  const DEMO = !CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY;
  const sb = DEMO ? null : window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' }
  });

  const GROUPS = ['A','B','C','Dog','E','F','G','H','J','K','L','M','N','P','Q','R','S','T'];
  const CATEGORY = { eng: 'นิสิตวิศวะ', chula_student: 'นิสิตจุฬาฯ', chula_staff: 'บุคลากรจุฬาฯ', external: 'บุคคลทั่วไป' };
  const YEAR = { '1': 'ปี 1', '2': 'ปี 2', '3': 'ปี 3', '4': 'ปี 4', '5+': 'ปี 5 ขึ้นไป' };
  const GENDER = { male: 'ชาย', female: 'หญิง', other: 'LGBTQ+', na: 'ไม่ระบุ' };
  const REASON = { referral: 'เพื่อนลงทะเบียนด้วยรหัสของคุณ', signup_bonus: 'ใช้รหัสเพื่อนตอนลงทะเบียน', redeem: 'แลกของรางวัล', adjust: 'ปรับแต้มโดยทีมงาน', activity: 'ร่วมกิจกรรม' };

  const ERRORS = {
    NOT_LOGGED_IN: 'กรุณาเข้าสู่ระบบก่อน',
    ALREADY_REGISTERED: 'บัญชีนี้ลงทะเบียนไปแล้ว',
    ENG_ONLY: 'รอบนี้เปิดเฉพาะนิสิตคณะวิศวกรรมศาสตร์ (อีเมล @student.chula.ac.th ที่รหัสนิสิตลงท้ายด้วย 21)',
    CHULA_ONLY: 'รอบนี้เปิดเฉพาะนิสิตและบุคลากรจุฬาฯ',
    CLOSED: 'ตอนนี้ยังไม่เปิดลงทะเบียน',
    BAD_NAME: 'กรุณากรอกชื่อและนามสกุล',
    BAD_NICKNAME: 'กรุณากรอกชื่อเล่น',
    BAD_GENDER: 'กรุณาเลือกเพศ',
    BAD_PHONE: 'เบอร์โทรไม่ถูกต้อง (ตัวเลข 10 หลัก ขึ้นต้นด้วย 0)',
    BAD_GROUP: 'กรุณาเลือกกรุ๊ป',
    NO_CONSENT: 'กรุณายอมรับเงื่อนไขการใช้ข้อมูล',
    BAD_REF: 'ไม่พบรหัสเพื่อนนี้ ลองเช็กอีกครั้ง หรือเว้นว่างไว้',
    NOT_STAFF: 'บัญชีนี้ไม่ใช่ทีมงาน',
    NOT_ADMIN: 'บัญชีนี้ไม่ใช่แอดมิน',
    NOT_FOUND: 'ไม่พบผู้ลงทะเบียน',
    REDEEM_CLOSED: 'ยังไม่เปิดระบบแลกแต้ม',
    BAD_REWARD: 'ของรางวัลนี้ปิดอยู่',
    BAD_ACTIVITY: 'กิจกรรมนี้ปิดอยู่',
    ALREADY_AWARDED: 'คนนี้รับแต้มกิจกรรมนี้ไปแล้ว',
    NOT_ENOUGH_POINTS: 'แต้มไม่พอ',
    OUT_OF_STOCK: 'ของรางวัลหมดแล้ว',
    USER_NOT_FOUND: 'ไม่พบบัญชีนี้ ให้เจ้าของอีเมลเข้าสู่ระบบเว็บนี้อย่างน้อย 1 ครั้งก่อน',
    CANNOT_REMOVE_SELF: 'ลบตัวเองไม่ได้',
    IS_STAFF: 'คนนี้เป็นทีมงาน ให้ลบสิทธิ์ทีมงานก่อน',
    BAD_ROLE: 'สิทธิ์ไม่ถูกต้อง'
  };
  function errMsg(e) {
    const m = String((e && (e.message || e.code)) || e || '');
    for (const k in ERRORS) if (m.includes(k)) return ERRORS[k];
    if (/JWT|session/i.test(m)) return 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่';
    if (/fetch|network/i.test(m)) return 'เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง';
    return m || 'เกิดข้อผิดพลาด';
  }

  // ------------------------------------------------------------------
  //  Demo backend (used only when config.js has no Supabase keys)
  // ------------------------------------------------------------------
  const demo = (function () {
    if (!DEMO) return null;
    const KEY = 'imf_demo_v2';
    const FAC = { '21': 'วิศวกรรมศาสตร์', '22': 'อักษรศาสตร์', '23': 'วิทยาศาสตร์', '24': 'รัฐศาสตร์', '25': 'สถาปัตยกรรมศาสตร์', '26': 'พาณิชยศาสตร์และการบัญชี', '27': 'ครุศาสตร์', '28': 'นิเทศศาสตร์', '29': 'เศรษฐศาสตร์', '30': 'แพทยศาสตร์', '33': 'เภสัชศาสตร์', '34': 'นิติศาสตร์' };
    const firsts = ['ภูมิ','ต้นข้าว','มายด์','ปั้น','ฟ้า','ไนน์','บีม','แพรว','ภู','เฟิร์น','กาย','ข้าวหอม','ปลื้ม','อิง','ชิน','น้ำ','บอส','พลอย'];
    const lasts = ['ศรีสุข','วงศ์ใหญ่','ทองดี','สายสุวรรณ','บุญมา','เจริญผล','แก้วกาญจนา','สุขเกษม'];
    const rnd = (a) => a[Math.floor(Math.random() * a.length)];
    const code = () => Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
    const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => ((Math.random() * 16) | 0).toString(16)));
    const yearOf = (sid) => { if (!/^\d{10}$/.test(sid || '')) return null; const n = new Date(); const acad = n.getFullYear() + 543 - (n.getMonth() < 7 ? 1 : 0); const y = acad - (2500 + +sid.slice(0, 2)) + 1; return y >= 1 && y <= 4 ? String(y) : (y > 4 ? '5+' : null); };
    const facOf = (sid) => /^\d{10}$/.test(sid || '') ? (FAC[sid.slice(-2)] || 'รหัสคณะ ' + sid.slice(-2)) : null;

    function seed() {
      const profiles = [], start = Date.now() - 6 * 864e5, n = new Date();
      const acadShort = (n.getFullYear() + 543 - (n.getMonth() < 7 ? 1 : 0)) % 100;
      for (let i = 0; i < 420; i++) {
        const cat = i < 320 ? 'eng' : rnd(['chula_student', 'chula_student', 'chula_student', 'chula_staff', 'external']);
        const fc = cat === 'eng' ? '21' : rnd(Object.keys(FAC).filter(k => k !== '21'));
        const sid = cat === 'eng' || cat === 'chula_student' ? String(acadShort - (i % 4)) + String(30000 + i).padStart(6, '0') + fc : null;
        profiles.push({
          id: uuid(), email: sid ? sid + '@student.chula.ac.th' : 'demo' + i + (cat === 'chula_staff' ? '@chula.ac.th' : '@gmail.com'), category: cat, round: cat === 'eng' ? 'eng_early' : 'general',
          first_name: rnd(firsts), last_name: rnd(lasts), nickname: rnd(firsts), gender: rnd(['male', 'male', 'female', 'female', 'other', 'na']), phone: '08' + String(10000000 + i * 7919).slice(0, 8),
          student_id: sid, year: yearOf(sid), faculty: facOf(sid), group_code: cat === 'eng' ? GROUPS[Math.min(17, Math.floor(Math.pow(Math.random(), 1.6) * 18))] : null,
          ref_code: code(), referred_by: null, points: 0, qr_token: uuid(), checked_in_at: null, created_at: new Date(start + Math.random() * 6 * 864e5).toISOString()
        });
      }
      const ledger = [];
      profiles.forEach((p, i) => { if (i > 20 && Math.random() < .5) { const r = profiles[Math.floor(Math.pow(Math.random(), 2.2) * 60)]; if (r !== p) { p.referred_by = r.id; const pts = r.category === 'eng' ? 2 : 1; r.points += pts; p.points += 1; ledger.push({ user_id: r.id, delta: pts, reason: 'referral', related_user: p.id, created_at: p.created_at }, { user_id: p.id, delta: 1, reason: 'signup_bonus', related_user: r.id, created_at: p.created_at }); } } });
      return {
        user: null,
        settings: { eng_round_open: true, general_round_open: false, allow_external: true, referral_open: true, points_per_referral: 1, points_per_referral_eng: 2, points_signup_bonus: 1, leaderboard_open: true, ticket_open: true, redeem_open: true, target: 12000 },
        profiles, ledger, staff: [],
        rewards: [{ id: 1, name: 'สติกเกอร์', description: 'สติกเกอร์ลายโลโก้งาน', cost: 1, stock: 500, active: true, sort: 1, image: null }, { id: 2, name: 'ริสแบนด์', description: '', cost: 3, stock: 200, active: true, sort: 2, image: null }, { id: 3, name: 'เสื้อยืด', description: 'ไซซ์ S–XL', cost: 10, stock: 0, active: true, sort: 3, image: null }],
        activities: [{ id: 1, name: 'ถ่ายรูปที่ Photo booth', points: 2, active: true }, { id: 2, name: 'เล่นเกมบูธสปอนเซอร์', points: 1, active: true }],
        announcements: []
      };
    }
    let db;
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!db) db = seed();
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} };
    save();
    const me = () => db.user && db.profiles.find(p => p.email === db.user.email);
    const fail = (c) => { throw new Error(c); };
    const full = (p) => p.first_name + ' ' + p.last_name;
    const detail = (l) => { const f = db.profiles.find(x => x.id === l.related_user), r = db.rewards.find(x => x.id === l.reward_id), a = db.activities.find(x => x.id === l.activity_id); return r ? r.name : a ? a.name : f ? full(f) : (l.note || null); };

    const rpc = {
      my_email_info() {
        if (!db.user) return { logged_in: false };
        const em = db.user.email, local = em.split('@')[0];
        let cat = 'external', sid = null;
        if (em.endsWith('@student.chula.ac.th')) { if (/^\d{10}$/.test(local)) sid = local; cat = sid && sid.endsWith('21') ? 'eng' : 'chula_student'; }
        else if (em.endsWith('@chula.ac.th')) cat = 'chula_staff';
        return { logged_in: true, email: em, category: cat, student_id: sid, year: yearOf(sid), faculty: facOf(sid), registered: !!me(), is_staff: true, is_admin: true };
      },
      register({ p }) {
        const info = rpc.my_email_info(), s = db.settings;
        if (!info.logged_in) fail('NOT_LOGGED_IN');
        if (info.registered) fail('ALREADY_REGISTERED');
        let round;
        if (s.general_round_open) { if (info.category === 'external' && !s.allow_external) fail('CHULA_ONLY'); round = 'general'; }
        else if (info.category === 'eng' && s.eng_round_open) round = 'eng_early';
        else if (s.eng_round_open) fail('ENG_ONLY'); else fail('CLOSED');
        const phone = String(p.phone || '').replace(/\D/g, '');
        if (!p.first_name || !p.last_name) fail('BAD_NAME');
        if (!p.nickname) fail('BAD_NICKNAME');
        if (!GENDER[p.gender]) fail('BAD_GENDER');
        if (!/^0\d{8,9}$/.test(phone)) fail('BAD_PHONE');
        if (info.category === 'eng' && !GROUPS.includes(p.group_code)) fail('BAD_GROUP');
        if (!p.consent) fail('NO_CONSENT');
        let referrer = null;
        if (p.ref_code && s.referral_open) { referrer = db.profiles.find(x => x.ref_code === String(p.ref_code).toUpperCase()); if (!referrer) fail('BAD_REF'); }
        const row = { id: uuid(), email: info.email, category: info.category, round, first_name: p.first_name.trim(), last_name: p.last_name.trim(), nickname: p.nickname.trim(), gender: p.gender, phone,
          student_id: info.student_id, year: info.year, faculty: info.faculty, group_code: info.category === 'eng' ? p.group_code : null, ref_code: code(),
          referred_by: referrer ? referrer.id : null, points: 0, qr_token: uuid(), checked_in_at: null, created_at: new Date().toISOString() };
        db.profiles.push(row);
        if (referrer) {
          const pts = +(referrer.category === 'eng' ? s.points_per_referral_eng : s.points_per_referral);
          if (pts > 0) { referrer.points += pts; db.ledger.push({ user_id: referrer.id, delta: pts, reason: 'referral', related_user: row.id, created_at: row.created_at }); }
          if (+s.points_signup_bonus > 0) { row.points += +s.points_signup_bonus; db.ledger.push({ user_id: row.id, delta: +s.points_signup_bonus, reason: 'signup_bonus', related_user: referrer.id, created_at: row.created_at }); }
        }
        save(); return { ref_code: row.ref_code };
      },
      update_my_profile({ p }) { const m = me(); const phone = String(p.phone || '').replace(/\D/g, ''); if (!/^0\d{8,9}$/.test(phone)) fail('BAD_PHONE'); if (!p.nickname) fail('BAD_NICKNAME'); Object.assign(m, { phone, nickname: p.nickname }); save(); return null; },
      my_points_history() { const m = me(); return db.ledger.filter(l => l.user_id === m.id).slice().reverse().map(l => ({ created_at: l.created_at, delta: l.delta, reason: l.reason, detail: detail(l) })); },
      group_leaderboard() {
        if (!db.settings.leaderboard_open) return GROUPS.map(c => ({ group_code: c, registered: db.profiles.filter(p => p.group_code === c).length })).sort((a, b) => b.registered - a.registered); // demo user is admin
        return GROUPS.map(c => ({ group_code: c, registered: db.profiles.filter(p => p.group_code === c).length })).sort((a, b) => b.registered - a.registered);
      },
      staff_lookup({ q }) {
        const s = String(q || '').trim().replace(/^IMF27:/, '');
        const by_token = /^[0-9a-f-]{36}$/i.test(s);
        const r = by_token ? db.profiles.find(p => p.qr_token === s) : db.profiles.find(p => p.ref_code === s.toUpperCase() || p.student_id === s || p.email === s.toLowerCase());
        if (!r) fail('NOT_FOUND');
        return { id: r.id, by_token, name: full(r), nickname: r.nickname, gender: r.gender, category: r.category, student_id: r.student_id, year: r.year, faculty: r.faculty, group_code: r.group_code, points: r.points, checked_in_at: r.checked_in_at };
      },
      staff_checkin({ uid }) { const r = db.profiles.find(p => p.id === uid); if (r.checked_in_at) return { ok: false, checked_in_at: r.checked_in_at }; r.checked_in_at = new Date().toISOString(); save(); return { ok: true, checked_in_at: r.checked_in_at }; },
      staff_redeem({ uid, reward }) {
        if (!db.settings.redeem_open) fail('REDEEM_CLOSED');
        const r = db.profiles.find(p => p.id === uid), w = db.rewards.find(x => x.id === reward && x.active);
        if (!w) fail('BAD_REWARD'); if (r.points < w.cost) fail('NOT_ENOUGH_POINTS'); if (w.stock !== null && w.stock <= 0) fail('OUT_OF_STOCK');
        if (w.stock !== null) w.stock--; r.points -= w.cost; db.ledger.push({ user_id: r.id, delta: -w.cost, reason: 'redeem', reward_id: w.id, created_at: new Date().toISOString() }); save();
        return { points: r.points, reward: w.name };
      },
      staff_award({ uid, activity }) {
        const r = db.profiles.find(p => p.id === uid), a = db.activities.find(x => x.id === activity && x.active);
        if (!a) fail('BAD_ACTIVITY');
        if (db.ledger.some(l => l.user_id === uid && l.activity_id === a.id)) fail('ALREADY_AWARDED');
        r.points += a.points; db.ledger.push({ user_id: uid, delta: a.points, reason: 'activity', activity_id: a.id, created_at: new Date().toISOString() }); save();
        return { points: r.points, added: a.points, activity: a.name };
      },
      admin_stats() {
        const P = db.profiles, cnt = (f) => P.reduce((o, p) => { const k = f(p); o[k] = (o[k] || 0) + 1; return o; }, {});
        const days = cnt(p => p.created_at.slice(0, 10)), fac = cnt(p => p.faculty || (p.category === 'chula_staff' ? 'บุคลากรจุฬาฯ' : p.category === 'external' ? 'บุคคลทั่วไป' : 'ไม่ทราบคณะ'));
        const red = db.ledger.filter(l => l.reason === 'redeem');
        return {
          total: P.length, target: +db.settings.target, checked_in: P.filter(p => p.checked_in_at).length, referred: P.filter(p => p.referred_by).length,
          points_out: db.ledger.filter(l => l.delta > 0).reduce((a, l) => a + l.delta, 0), points_redeemed: red.reduce((a, l) => a - l.delta, 0),
          by_category: cnt(p => p.category), by_gender: cnt(p => p.gender || '-'), by_year: cnt(p => p.year || '-'),
          by_faculty: Object.keys(fac).map(k => ({ name: k, n: fac[k] })).sort((a, b) => b.n - a.n),
          by_group: GROUPS.map(c => ({ code: c, n: P.filter(p => p.group_code === c).length })),
          by_day: Object.keys(days).sort().map(d => ({ d, n: days[d] })),
          by_reward: db.rewards.map(w => ({ name: w.name, stock: w.stock, n: red.filter(l => l.reward_id === w.id).length })).filter(x => x.n)
        };
      },
      admin_list({ q, lim, off }) {
        q = (q || '').toLowerCase();
        const rows = db.profiles.filter(p => !q || [p.first_name, p.last_name, p.nickname, p.email, p.phone, p.ref_code, p.student_id, p.faculty].some(v => v && String(v).toLowerCase().includes(q)))
          .sort((a, b) => b.created_at.localeCompare(a.created_at));
        return rows.slice(off, off + lim).map(p => ({ ...p, referrer_code: (db.profiles.find(r => r.id === p.referred_by) || {}).ref_code || null, friends: db.profiles.filter(f => f.referred_by === p.id).length, total_count: rows.length }));
      },
      admin_person({ uid }) {
        const p = db.profiles.find(x => x.id === uid); if (!p) fail('NOT_FOUND');
        const r = db.profiles.find(x => x.id === p.referred_by);
        return { profile: { ...p }, referrer: r ? { name: full(r), ref_code: r.ref_code } : null,
          invited: db.profiles.filter(f => f.referred_by === p.id).map(f => ({ name: full(f), student_id: f.student_id, created_at: f.created_at })),
          ledger: db.ledger.filter(l => l.user_id === uid).slice().reverse().map(l => ({ created_at: l.created_at, delta: l.delta, reason: l.reason, detail: detail(l) })) };
      },
      admin_delete_person({ uid }) { const m = me(); if (m && m.id === uid) fail('CANNOT_REMOVE_SELF'); db.profiles = db.profiles.filter(p => p.id !== uid); db.profiles.forEach(p => { if (p.referred_by === uid) p.referred_by = null; }); db.ledger = db.ledger.filter(l => l.user_id !== uid); save(); return null; },
      admin_add_staff({ em, r }) { db.staff = db.staff.filter(s => s.email !== em); db.staff.push({ user_id: uuid(), email: em, role: r, added_at: new Date().toISOString() }); save(); return null; },
      admin_remove_staff({ uid }) { db.staff = db.staff.filter(s => s.user_id !== uid); save(); return null; },
      admin_adjust_points({ uid, delta, note }) { const r = db.profiles.find(p => p.id === uid); if (r.points + delta < 0) fail('NOT_ENOUGH_POINTS'); r.points += delta; db.ledger.push({ user_id: uid, delta, reason: 'adjust', note, created_at: new Date().toISOString() }); save(); return r.points; }
    };
    return {
      rpc: async (name, args) => { await new Promise(r => setTimeout(r, 80)); return rpc[name](args || {}); },
      db, save, me,
      login(email) { db.user = { email: email || '6830000021@student.chula.ac.th' }; save(); },
      logout() { db.user = null; save(); },
      reset() { localStorage.removeItem(KEY); }
    };
  })();

  // ------------------------------------------------------------------
  //  API
  // ------------------------------------------------------------------
  async function rpc(name, args) {
    if (DEMO) return demo.rpc(name, args);
    const { data, error } = await sb.rpc(name, args || {});
    if (error) throw error;
    return data;
  }
  async function q(promise) { const { data, error } = await promise; if (error) throw error; return data; }

  // simple CRUD for the small admin-managed tables
  function table(name, order) {
    return {
      async list(all) {
        if (DEMO) return demo.db[name].filter(r => all || r.active !== false).slice().sort((a, b) => (a.sort || 0) - (b.sort || 0) || a.id - b.id);
        let qq = sb.from(name).select('*');
        (order || ['id']).forEach(o => { qq = qq.order(o); });
        if (!all) qq = qq.eq('active', true);
        return q(qq);
      },
      async save(r) {
        if (DEMO) { if (r.id) Object.assign(demo.db[name].find(x => x.id === r.id), r); else demo.db[name].push({ ...r, id: Date.now() }); demo.save(); return; }
        if (r.id) { const { id, ...rest } = r; await q(sb.from(name).update(rest).eq('id', id).select('id')); }
        else await q(sb.from(name).insert(r).select('id'));
      }
    };
  }

  let settingsP = null, infoP = null;
  const api = {
    rpc,
    rewards: table('rewards', ['sort', 'cost']),
    activities: table('activities', ['id']),
    async session() {
      if (DEMO) return demo.db.user ? { user: { email: demo.db.user.email } } : null;
      const { data } = await sb.auth.getSession();
      return data.session;
    },
    async signIn(opts = {}) {
      if (DEMO) { demo.login(opts.demoEmail); location.reload(); return; }
      const redirectTo = opts.redirectTo || (location.origin + location.pathname + location.search);
      const queryParams = { prompt: 'select_account' };
      if (opts.hd) queryParams.hd = opts.hd;
      const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, queryParams } });
      if (error) throw error;
    },
    async signOut() { if (DEMO) demo.logout(); else await sb.auth.signOut(); },
    settings(fresh) {
      if (!settingsP || fresh) settingsP = DEMO ? Promise.resolve({ ...demo.db.settings })
        : q(sb.from('settings').select('key,value')).then(rows => Object.fromEntries(rows.map(r => [r.key, r.value])));
      return settingsP;
    },
    info() { if (!infoP) infoP = rpc('my_email_info').catch(() => ({ logged_in: false })); return infoP; },
    async setSetting(key, value) {
      settingsP = null;
      if (DEMO) { demo.db.settings[key] = value; demo.save(); return; }
      await q(sb.from('settings').update({ value }).eq('key', key).select('key'));
    },
    async myProfile() {
      if (DEMO) { const m = demo.me(); return m ? { ...m } : null; }
      const s = await api.session(); if (!s) return null;
      return q(sb.from('profiles').select('*').eq('id', s.user.id).maybeSingle());
    },
    async announcements(all) {
      if (DEMO) return demo.db.announcements.filter(a => all || a.published).sort((a, b) => (b.pinned - a.pinned) || b.created_at.localeCompare(a.created_at));
      let qq = sb.from('announcements').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false });
      if (!all) qq = qq.eq('published', true).limit(20);
      return q(qq);
    },
    async saveAnnouncement(a) {
      if (DEMO) { if (a.id) Object.assign(demo.db.announcements.find(x => x.id === a.id), a); else demo.db.announcements.push({ ...a, id: Date.now(), created_at: new Date().toISOString() }); demo.save(); return; }
      if (a.id) { const { id, ...rest } = a; await q(sb.from('announcements').update(rest).eq('id', id).select('id')); }
      else await q(sb.from('announcements').insert(a).select('id'));
    },
    async deleteAnnouncement(id) {
      if (DEMO) { demo.db.announcements = demo.db.announcements.filter(x => x.id !== id); demo.save(); return; }
      await q(sb.from('announcements').delete().eq('id', id));
    },
    async staffList() {
      if (DEMO) return demo.db.staff.slice();
      return q(sb.from('staff').select('*').order('added_at'));
    }
  };

  // ------------------------------------------------------------------
  //  UI helpers
  // ------------------------------------------------------------------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => Number(n || 0).toLocaleString('th-TH');
  const dateTH = (d) => new Date(d).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  let toastTimer;
  function toast(msg, bad) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.toggle('bad', !!bad); t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    toast('คัดลอกแล้ว');
  }

  // pop-up; returns { el, close }.  Closing by backdrop / ✕ calls onClose.
  function modal(html, opts = {}) {
    const m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = `<div class="sheet ${opts.lg ? 'lg' : ''}" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(m);
    const close = () => { if (!m.isConnected) return; m.remove(); if (opts.onClose) opts.onClose(); };
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) close(); });
    return { el: m.firstElementChild, close };
  }

  // person summary used by ticket / staff pop-up / admin
  function personLine(p) {
    const bits = p.student_id ? [p.faculty ? 'คณะ' + p.faculty : '', p.year ? YEAR[p.year] : ''] : [CATEGORY[p.category]];
    return bits.filter(Boolean).join(' · ');
  }

  // Renders header + footer and returns { info, settings }
  async function boot(opts = {}) {
    const [info, settings] = await Promise.all([api.info(), api.settings().catch(() => ({}))]);
    const page = location.pathname.split('/').pop() || 'index.html';
    const nav = [['index.html', 'หน้าหลัก'], info.registered ? ['me.html', 'บัตรของฉัน'] : ['register.html', 'ลงทะเบียน'], ['rewards.html', 'ของรางวัล']];
    if (settings.leaderboard_open) nav.push(['leaderboard.html', 'อันดับกรุ๊ป']);
    if (info.is_staff) nav.push(['staff.html', 'สแกน']);
    if (info.is_admin) nav.push(['admin.html', 'หลังบ้าน']);
    const stage = $('.stage');
    const bar = document.createElement('header');
    bar.className = 'topbar';
    bar.innerHTML = `${opts.noBrand ? '' : '<a class="brand" href="index.html" aria-label="INTANIA MUSIC FEST"><img src="assets/logo.png" alt=""></a>'}
      <nav class="nav">${nav.map(([h, t]) => `<a href="${h}" class="${page === h ? 'active' : ''}">${t}</a>`).join('')}</nav>`;
    if (opts.overlay) { bar.style.position = 'absolute'; bar.style.left = 0; bar.style.right = 0; bar.style.top = 0; }
    else { const art = document.createElement('div'); art.className = 'art'; stage.prepend(art); }
    stage.prepend(bar);
    if (DEMO) {
      const b = document.createElement('div');
      b.className = 'demo-banner';
      b.innerHTML = 'โหมดตัวอย่าง (DEMO) · ข้อมูลปลอม · <a href="#" id="demoReset">รีเซ็ต</a>';
      document.body.prepend(b);
      $('#demoReset').onclick = (e) => { e.preventDefault(); demo.reset(); location.reload(); };
    }
    const f = document.createElement('footer');
    if (stage.classList.contains('wide')) f.className = 'wide';
    f.innerHTML = `${esc(EVENT.hashtag)} · IG <a href="https://instagram.com/${esc(EVENT.ig)}" target="_blank" rel="noopener">@${esc(EVENT.ig)}</a>`;
    document.body.appendChild(f);
    return { info, settings };
  }

  function calendarLinks() {
    return {
      google: 'https://www.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('INTANIA MUSIC FEST 2027') +
        '&dates=20270128T170000/20270128T220000&ctz=Asia/Bangkok&details=' + encodeURIComponent('See you at INTANIA MUSIC FEST 2027!') +
        '&location=' + encodeURIComponent('Faculty of Engineering, Chulalongkorn University'),
      ics: 'intania-music-fest-2027.ics'
    };
  }
  function qrSvg(text) { const qr = window.qrcode(0, 'M'); qr.addData(text); qr.make(); return qr.createSvgTag({ cellSize: 6, margin: 0, scalable: true }); }
  const inviteUrl = (code) => location.origin + location.pathname.replace(/[^/]*$/, '') + 'register.html?ref=' + code;
  async function shareInvite(code) {
    const url = inviteUrl(code), text = `มาลงทะเบียน ${EVENT.name} ด้วยกัน! ใช้รหัสเพื่อน ${code} ตอนลงทะเบียนนะ`;
    if (navigator.share) { try { await navigator.share({ title: EVENT.name, text, url }); } catch (e) {} return; }
    copy(text + '\n' + url);
  }
  // what the current person earns per invited friend
  const invitePoints = (s, category) => +(category === 'eng' ? s.points_per_referral_eng : s.points_per_referral) || 0;

  // the invite card (code + share buttons), shared by the home page and "my ticket"
  function inviteCard(me, s) {
    const mine = invitePoints(s, me.category), bonus = +s.points_signup_bonus || 0;
    return `<div class="card white stack">
      <div class="card-title" style="margin:0"><h3>ชวนเพื่อน รับแต้ม</h3></div>
      <div class="code-box"><b>${esc(me.ref_code)}</b><button class="btn dark small" data-copy="${esc(me.ref_code)}">คัดลอก</button></div>
      <div class="grid-2"><button class="btn red block" data-share="${esc(me.ref_code)}">ส่งลิงก์ชวนเพื่อน</button><button class="btn dark block" data-copy="${esc(inviteUrl(me.ref_code))}">คัดลอกลิงก์</button></div>
      <div class="small muted">เพื่อนลงทะเบียนด้วยรหัสนี้ 1 คน คุณได้ <b>${fmt(mine)} แต้ม</b>${bonus ? ` และเพื่อนได้ <b>${fmt(bonus)} แต้ม</b>` : ''} · สะสมไว้<a href="rewards.html">แลกของรางวัล</a>ในวันงาน</div>
    </div>`;
  }
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-copy]'); if (c) return copy(c.dataset.copy);
    const s = e.target.closest('[data-share]'); if (s) return shareInvite(s.dataset.share);
  });

  window.IMF = { CFG, EVENT, DEMO, sb, api, rpc, demo, GROUPS, CATEGORY, YEAR, GENDER, REASON, errMsg, $, $$, esc, fmt, dateTH, toast, copy, modal, personLine, boot, calendarLinks, qrSvg, inviteUrl, shareInvite, invitePoints, inviteCard };
})();
