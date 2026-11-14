/* INTANIA MUSIC FEST 2027 — shared client code (no build step) */
(function () {
  const CFG = window.IMF_CONFIG || {};
  const DEMO = !CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY;
  const sb = DEMO ? null : window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' }
  });

  const GROUPS = ['A','B','C','Dog','E','F','G','H','J','K','L','M','N','P','Q','R','S','T'];
  const CATEGORY = { eng: 'นิสิตวิศวะ', chula_student: 'นิสิตจุฬาฯ', chula_staff: 'บุคลากรจุฬาฯ', external: 'บุคคลทั่วไป' };
  const YEAR = { '1': 'ปี 1', '2': 'ปี 2', '3': 'ปี 3', '4': 'ปี 4', '5+': 'ปี 5+', grad: 'ป.โท/เอก' };

  const ERRORS = {
    NOT_LOGGED_IN: 'กรุณาเข้าสู่ระบบก่อน',
    ALREADY_REGISTERED: 'บัญชีนี้ลงทะเบียนไปแล้ว',
    ENG_ONLY: 'รอบนี้เปิดเฉพาะนิสิตคณะวิศวกรรมศาสตร์ (อีเมล @student.chula.ac.th ที่รหัสนิสิตลงท้ายด้วย 21)',
    CHULA_ONLY: 'รอบนี้เปิดเฉพาะนิสิตและบุคลากรจุฬาฯ',
    CLOSED: 'ตอนนี้ยังไม่เปิดลงทะเบียน',
    BAD_NAME: 'กรุณากรอกชื่อและนามสกุล',
    BAD_PHONE: 'เบอร์โทรไม่ถูกต้อง (ตัวเลข 10 หลัก ขึ้นต้นด้วย 0)',
    BAD_YEAR: 'กรุณาเลือกชั้นปี',
    BAD_GROUP: 'กรุณาเลือกกรุ๊ป',
    NO_CONSENT: 'กรุณายอมรับเงื่อนไขการใช้ข้อมูล',
    BAD_REF: 'ไม่พบรหัสเพื่อนนี้ ลองเช็กอีกครั้ง หรือเว้นว่างไว้',
    NOT_STAFF: 'บัญชีนี้ไม่ใช่ทีมงาน',
    NOT_ADMIN: 'บัญชีนี้ไม่ใช่แอดมิน',
    NOT_FOUND: 'ไม่พบผู้ลงทะเบียน',
    REDEEM_CLOSED: 'ยังไม่เปิดระบบแลกแต้ม',
    BAD_REWARD: 'ของรางวัลนี้ปิดอยู่',
    NOT_ENOUGH_POINTS: 'แต้มไม่พอ',
    OUT_OF_STOCK: 'ของรางวัลหมดแล้ว',
    USER_NOT_FOUND: 'ไม่พบบัญชีนี้ ให้เจ้าของอีเมลเข้าสู่ระบบเว็บนี้อย่างน้อย 1 ครั้งก่อน',
    CANNOT_REMOVE_SELF: 'ลบสิทธิ์ตัวเองไม่ได้',
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
  //  Demo backend (used when config has no Supabase keys)
  // ------------------------------------------------------------------
  const demo = (function () {
    const KEY = 'imf_demo_v1';
    const firsts = ['ภูมิ','ต้นข้าว','มายด์','ปั้น','ฟ้า','ไนน์','บีม','แพรว','ภู','เฟิร์น','กาย','ข้าวหอม','ปลื้ม','อิง','ชิน','น้ำ','บอส','พลอย'];
    const lasts = ['ศรีสุข','วงศ์ใหญ่','ทองดี','สายสุวรรณ','บุญมา','เจริญผล','แก้วกาญจนา','สุขเกษม'];
    const rnd = (a) => a[Math.floor(Math.random() * a.length)];
    const code = () => Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
    const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => ((Math.random() * 16) | 0).toString(16)));

    function seed() {
      const profiles = [];
      const start = Date.now() - 6 * 864e5;
      for (let i = 0; i < 420; i++) {
        const cat = i < 340 ? 'eng' : rnd(['chula_student', 'chula_student', 'chula_staff', 'external']);
        const g = GROUPS[Math.min(17, Math.floor(Math.pow(Math.random(), 1.6) * 18))];
        profiles.push({
          id: uuid(), email: 'demo' + i + '@student.chula.ac.th', category: cat, round: cat === 'eng' ? 'eng_early' : 'general',
          first_name: rnd(firsts), last_name: rnd(lasts), nickname: null, phone: '08' + String(10000000 + i * 7919).slice(0, 8),
          student_id: cat === 'eng' ? '6' + (5 + (i % 4)) + String(30000 + i).padStart(6, '0') + '21' : null,
          year: cat === 'eng' ? String(1 + (i % 4)) : (cat === 'chula_student' ? '2' : null),
          group_code: cat === 'eng' ? g : null, affiliation: cat === 'eng' ? 'คณะวิศวกรรมศาสตร์' : 'คณะอักษรศาสตร์',
          food_allergy: null, ref_code: code(), referred_by: null, points: 0, qr_token: uuid(),
          checked_in_at: null, created_at: new Date(start + Math.random() * 6 * 864e5).toISOString()
        });
      }
      profiles.forEach((p, i) => { if (i > 20 && Math.random() < .55) { const r = profiles[Math.floor(Math.pow(Math.random(), 2.2) * 60)]; if (r !== p) { p.referred_by = r.id; r.points++; } } });
      return {
        user: null,
        settings: { eng_round_open: true, general_round_open: false, allow_external: true, referral_open: true, points_per_referral: 1, points_signup_bonus: 0, ticket_open: true, redeem_open: true, target: 12000 },
        groups: GROUPS.map((c, i) => ({ code: c, sort: i + 1, member_count: null })),
        profiles, ledger: [], staff: [],
        rewards: [{ id: 1, name: 'สติกเกอร์ IMF', cost: 1, stock: 500, active: true, sort: 1 }, { id: 2, name: 'ริสแบนด์', cost: 3, stock: 200, active: true, sort: 2 }, { id: 3, name: 'เสื้อยืด IMF 2027', cost: 10, stock: 30, active: true, sort: 3 }],
        announcements: [
          { id: 1, title: 'เปิดลงทะเบียนรอบนิสิตวิศวะแล้ว!', body: 'ลงทะเบียนด้วยอีเมลจุฬาฯ ได้ถึงวันที่ 13 ธ.ค.\nชวนเพื่อนมาลงทะเบียนด้วยรหัสของคุณ รับแต้มไปแลกของในวันงาน', pinned: true, published: true, created_at: new Date().toISOString() },
          { id: 2, title: 'ประกาศไลน์อัปศิลปิน', body: 'เร็ว ๆ นี้ ติดตามได้ที่ IG @' + (CFG.CONTACT_IG || ''), pinned: false, published: true, created_at: new Date(Date.now() - 864e5).toISOString() }
        ]
      };
    }
    let db;
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!db) db = seed();
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} };
    save();
    const me = () => db.user && db.profiles.find(p => p.email === db.user.email);
    const fail = (c) => { throw new Error(c); };
    const mask = (p) => (p.nickname || p.first_name) + ' ' + p.last_name.slice(0, 1) + '.';

    const rpc = {
      my_email_info() {
        if (!db.user) return { logged_in: false };
        const em = db.user.email, local = em.split('@')[0];
        let cat = 'external', sid = null, yr = null;
        if (em.endsWith('@student.chula.ac.th')) {
          if (/^\d{10}$/.test(local)) sid = local;
          cat = sid && sid.endsWith('21') ? 'eng' : 'chula_student';
          if (sid) { const n = new Date(); const acad = n.getFullYear() + 543 - (n.getMonth() < 7 ? 1 : 0); const y = acad - (2500 + +sid.slice(0, 2)) + 1; yr = y >= 1 && y <= 4 ? String(y) : (y > 4 ? '5+' : null); }
        } else if (em.endsWith('@chula.ac.th')) cat = 'chula_staff';
        return { logged_in: true, email: em, category: cat, student_id: sid, suggested_year: yr, registered: !!me(), is_staff: true, is_admin: true };
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
        if (!/^0\d{8,9}$/.test(phone)) fail('BAD_PHONE');
        if (['eng', 'chula_student'].includes(info.category) && !YEAR[p.year]) fail('BAD_YEAR');
        if (info.category === 'eng' && !GROUPS.includes(p.group_code)) fail('BAD_GROUP');
        if (!p.consent) fail('NO_CONSENT');
        let referrer = null;
        if (p.ref_code) { referrer = db.profiles.find(x => x.ref_code === String(p.ref_code).toUpperCase()); if (!referrer) fail('BAD_REF'); }
        const row = { id: uuid(), email: info.email, category: info.category, round, first_name: p.first_name.trim(), last_name: p.last_name.trim(), nickname: p.nickname || null, phone,
          student_id: info.student_id, year: ['eng', 'chula_student'].includes(info.category) ? p.year : null, group_code: info.category === 'eng' ? p.group_code : null,
          affiliation: info.category === 'eng' ? 'คณะวิศวกรรมศาสตร์' : (p.affiliation || null), food_allergy: p.food_allergy || null, ref_code: code(),
          referred_by: referrer ? referrer.id : null, points: 0, qr_token: uuid(), checked_in_at: null, created_at: new Date().toISOString() };
        db.profiles.push(row);
        if (referrer && s.referral_open) {
          if (+s.points_per_referral > 0) { referrer.points += +s.points_per_referral; db.ledger.push({ user_id: referrer.id, delta: +s.points_per_referral, reason: 'referral', related_user: row.id, created_at: row.created_at }); }
          if (+s.points_signup_bonus > 0) { row.points += +s.points_signup_bonus; db.ledger.push({ user_id: row.id, delta: +s.points_signup_bonus, reason: 'signup_bonus', related_user: referrer.id, created_at: row.created_at }); }
        }
        save(); return { ref_code: row.ref_code };
      },
      update_my_profile({ p }) { const m = me(); const phone = String(p.phone || '').replace(/\D/g, ''); if (!/^0\d{8,9}$/.test(phone)) fail('BAD_PHONE'); Object.assign(m, { phone, nickname: p.nickname || null, food_allergy: p.food_allergy || null }); save(); return null; },
      my_points_history() { const m = me(); return db.ledger.filter(l => l.user_id === m.id).reverse().map(l => { const f = db.profiles.find(x => x.id === l.related_user); const r = db.rewards.find(x => x.id === l.reward_id); return { created_at: l.created_at, delta: l.delta, reason: l.reason, detail: r ? r.name : (f ? mask(f) : l.note) }; }); },
      public_stats() { return { registered: db.profiles.length, eng: db.profiles.filter(p => p.category === 'eng').length }; },
      group_leaderboard() {
        return db.groups.map(g => { const ps = db.profiles.filter(p => p.group_code === g.code && p.category === 'eng'); return { group_code: g.code, registered: ps.length, points: ps.reduce((a, p) => a + p.points, 0), member_count: g.member_count, pct: g.member_count ? Math.round(ps.length * 1000 / g.member_count) / 10 : null, sort: g.sort }; })
          .sort((a, b) => b.registered - a.registered || a.sort - b.sort);
      },
      top_referrers({ n }) { return db.profiles.filter(p => p.points > 0).sort((a, b) => b.points - a.points).slice(0, n || 20).map(p => ({ display_name: mask(p), group_code: p.group_code, year: p.year, points: p.points, friends: db.profiles.filter(f => f.referred_by === p.id).length })); },
      staff_lookup({ q }) {
        const s = String(q || '').trim().replace(/^IMF27:/, '');
        const by_token = /^[0-9a-f-]{36}$/i.test(s);
        const r = by_token ? db.profiles.find(p => p.qr_token === s) : db.profiles.find(p => p.ref_code === s.toUpperCase() || p.student_id === s || p.email === s.toLowerCase());
        if (!r) fail('NOT_FOUND');
        return { id: r.id, by_token, name: r.first_name + ' ' + r.last_name, nickname: r.nickname, category: r.category, student_id: r.student_id, year: r.year, group_code: r.group_code, affiliation: r.affiliation, food_allergy: r.food_allergy, points: r.points, checked_in_at: r.checked_in_at };
      },
      staff_checkin({ uid }) { const r = db.profiles.find(p => p.id === uid); if (r.checked_in_at) return { ok: false, checked_in_at: r.checked_in_at }; r.checked_in_at = new Date().toISOString(); save(); return { ok: true, checked_in_at: r.checked_in_at }; },
      staff_redeem({ uid, reward }) {
        if (!db.settings.redeem_open) fail('REDEEM_CLOSED');
        const r = db.profiles.find(p => p.id === uid), w = db.rewards.find(x => x.id === reward && x.active);
        if (!w) fail('BAD_REWARD'); if (r.points < w.cost) fail('NOT_ENOUGH_POINTS'); if (w.stock !== null && w.stock <= 0) fail('OUT_OF_STOCK');
        if (w.stock !== null) w.stock--; r.points -= w.cost; db.ledger.push({ user_id: r.id, delta: -w.cost, reason: 'redeem', reward_id: w.id, created_at: new Date().toISOString() }); save();
        return { points: r.points, reward: w.name };
      },
      admin_stats() {
        const P = db.profiles, cnt = (f) => P.reduce((o, p) => { const k = f(p); o[k] = (o[k] || 0) + 1; return o; }, {});
        const days = cnt(p => p.created_at.slice(0, 10));
        const red = db.ledger.filter(l => l.reason === 'redeem');
        return {
          total: P.length, target: +db.settings.target, checked_in: P.filter(p => p.checked_in_at).length, referred: P.filter(p => p.referred_by).length,
          points_out: P.reduce((a, p) => a + p.points, 0) + red.reduce((a, l) => a - l.delta, 0), points_redeemed: red.reduce((a, l) => a - l.delta, 0),
          by_category: cnt(p => p.category), by_year: cnt(p => p.year || '-'),
          by_group: GROUPS.map(c => ({ code: c, n: P.filter(p => p.group_code === c).length })),
          by_day: Object.keys(days).sort().map(d => ({ d, n: days[d] })),
          by_reward: db.rewards.map(w => ({ name: w.name, stock: w.stock, n: red.filter(l => l.reward_id === w.id).length })).filter(x => x.n)
        };
      },
      admin_list({ q, lim, off }) {
        q = (q || '').toLowerCase();
        const rows = db.profiles.filter(p => !q || [p.first_name, p.last_name, p.nickname, p.email, p.phone, p.ref_code, p.student_id].some(v => v && String(v).toLowerCase().includes(q)))
          .sort((a, b) => b.created_at.localeCompare(a.created_at));
        return rows.slice(off, off + lim).map(p => ({ ...p, referrer_code: (db.profiles.find(r => r.id === p.referred_by) || {}).ref_code || null, friends: db.profiles.filter(f => f.referred_by === p.id).length, total_count: rows.length }));
      },
      admin_add_staff({ em, r }) { db.staff = db.staff.filter(s => s.email !== em); db.staff.push({ user_id: uuid(), email: em, role: r, added_at: new Date().toISOString() }); save(); return null; },
      admin_remove_staff({ uid }) { db.staff = db.staff.filter(s => s.user_id !== uid); save(); return null; },
      admin_adjust_points({ uid, delta, note }) { const r = db.profiles.find(p => p.id === uid); if (r.points + delta < 0) fail('NOT_ENOUGH_POINTS'); r.points += delta; db.ledger.push({ user_id: uid, delta, reason: 'adjust', note, created_at: new Date().toISOString() }); save(); return r.points; }
    };

    return {
      rpc: async (name, args) => { await new Promise(r => setTimeout(r, 120)); return rpc[name](args || {}); },
      db, save, me,
      login(email) { db.user = { email: email || '6730000021@student.chula.ac.th' }; save(); },
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

  async function q(promise) {
    const { data, error } = await promise;
    if (error) throw error;
    return data;
  }

  const api = {
    rpc,
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
    async signOut() {
      if (DEMO) demo.logout(); else await sb.auth.signOut();
    },
    async settings() {
      if (DEMO) return { ...demo.db.settings };
      const rows = await q(sb.from('settings').select('key,value'));
      return Object.fromEntries(rows.map(r => [r.key, r.value]));
    },
    async setSetting(key, value) {
      if (DEMO) { demo.db.settings[key] = value; demo.save(); return; }
      await q(sb.from('settings').update({ value }).eq('key', key).select());
    },
    async myProfile() {
      if (DEMO) { const m = demo.me(); return m ? { ...m } : null; }
      const s = await api.session(); if (!s) return null;
      return q(sb.from('profiles').select('*').eq('id', s.user.id).maybeSingle());
    },
    async announcements() {
      if (DEMO) return demo.db.announcements.filter(a => a.published).sort((a, b) => (b.pinned - a.pinned) || b.created_at.localeCompare(a.created_at));
      return q(sb.from('announcements').select('*').eq('published', true).order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(20));
    },
    async allAnnouncements() {
      if (DEMO) return demo.db.announcements.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
      return q(sb.from('announcements').select('*').order('created_at', { ascending: false }));
    },
    async saveAnnouncement(a) {
      if (DEMO) { if (a.id) Object.assign(demo.db.announcements.find(x => x.id === a.id), a); else demo.db.announcements.push({ ...a, id: Date.now(), created_at: new Date().toISOString() }); demo.save(); return; }
      if (a.id) { const { id, ...rest } = a; await q(sb.from('announcements').update(rest).eq('id', id).select()); }
      else await q(sb.from('announcements').insert(a).select());
    },
    async deleteAnnouncement(id) {
      if (DEMO) { demo.db.announcements = demo.db.announcements.filter(x => x.id !== id); demo.save(); return; }
      await q(sb.from('announcements').delete().eq('id', id));
    },
    async rewards(includeInactive) {
      if (DEMO) return demo.db.rewards.filter(r => includeInactive || r.active).sort((a, b) => a.sort - b.sort || a.cost - b.cost);
      let qq = sb.from('rewards').select('*').order('sort').order('cost');
      if (!includeInactive) qq = qq.eq('active', true);
      return q(qq);
    },
    async saveReward(r) {
      if (DEMO) { if (r.id) Object.assign(demo.db.rewards.find(x => x.id === r.id), r); else demo.db.rewards.push({ ...r, id: Date.now() }); demo.save(); return; }
      if (r.id) { const { id, ...rest } = r; await q(sb.from('rewards').update(rest).eq('id', id).select()); }
      else await q(sb.from('rewards').insert(r).select());
    },
    async groups() {
      if (DEMO) return demo.db.groups.slice();
      return q(sb.from('groups').select('*').order('sort'));
    },
    async setGroupSize(code, n) {
      if (DEMO) { demo.db.groups.find(g => g.code === code).member_count = n; demo.save(); return; }
      await q(sb.from('groups').update({ member_count: n }).eq('code', code).select());
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

  const NAV = [
    ['index.html', 'หน้าหลัก'],
    ['register.html', 'ลงทะเบียน'],
    ['leaderboard.html', 'อันดับกรุ๊ป'],
    ['me.html', 'บัตร & แต้มของฉัน']
  ];

  async function header() {
    const page = location.pathname.split('/').pop() || 'index.html';
    let extra = '';
    try {
      const info = await rpc('my_email_info');
      if (info.is_staff) extra += `<a href="staff.html" class="${page === 'staff.html' ? 'active' : ''}">สแกน</a>`;
      if (info.is_admin) extra += `<a href="admin.html" class="${page === 'admin.html' ? 'active' : ''}">หลังบ้าน</a>`;
    } catch (e) {}
    const el = document.createElement('header');
    el.className = 'topbar';
    el.innerHTML = `<div class="wrap">
      <a class="brand" href="index.html">IMF<span>2027</span></a>
      <nav class="nav">${NAV.map(([h, t]) => `<a href="${h}" class="${page === h ? 'active' : ''}">${t}</a>`).join('')}${extra}</nav>
    </div>`;
    document.body.prepend(el);
    if (DEMO) {
      const b = document.createElement('div');
      b.className = 'demo-banner';
      b.innerHTML = 'โหมดตัวอย่าง (DEMO) · ข้อมูลทั้งหมดเป็นข้อมูลปลอม · ใส่คีย์ Supabase ใน assets/config.js เพื่อใช้งานจริง · <a href="#" id="demoReset">รีเซ็ต</a>';
      document.body.prepend(b);
      $('#demoReset').onclick = (e) => { e.preventDefault(); demo.reset(); location.reload(); };
    }
  }

  function footer() {
    const f = document.createElement('footer');
    f.innerHTML = `<div class="wrap row" style="justify-content:space-between">
      <span>${esc(CFG.EVENT_NAME)} · ${esc(CFG.EVENT_PLACE)}</span>
      <span>ติดต่อ IG <a href="https://instagram.com/${esc(CFG.CONTACT_IG)}" target="_blank" rel="noopener">@${esc(CFG.CONTACT_IG)}</a></span>
    </div>`;
    document.body.appendChild(f);
  }

  const STAR = '<svg viewBox="0 0 40 40"><path d="M20 0 C21 15 25 19 40 20 C25 21 21 25 20 40 C19 25 15 21 0 20 C15 19 19 15 20 0Z" fill="#fff"/></svg>';
  function sparkles() {
    const spots = [[76,6,54,0],[57,42,35,.8],[4,74,48,1.5],[36,62,25,.4],[93,30,22,2.1],[20,20,19,1.1],[46,8,16,2.6],[85,88,28,1.9],[2,30,16,.2]];
    return spots.map(([x, y, s, d]) => `<span class="sp" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${d}s">${STAR}</span>`).join('') + '<i class="shine"></i>';
  }

  function calendarLinks() {
    const g = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(CFG.EVENT_NAME) +
      '&dates=20270128T170000/20270128T220000&ctz=Asia/Bangkok&details=' + encodeURIComponent('See you at ' + CFG.EVENT_NAME + '!') +
      '&location=' + encodeURIComponent(CFG.EVENT_PLACE);
    return { google: g, ics: 'intania-music-fest-2027.ics' };
  }

  function qrSvg(text) {
    const qr = window.qrcode(0, 'M');
    qr.addData(text); qr.make();
    return qr.createSvgTag({ cellSize: 6, margin: 0, scalable: true });
  }

  async function shareInvite(code) {
    const url = location.origin + location.pathname.replace(/[^/]*$/, '') + 'register.html?ref=' + code;
    const text = `มาลงทะเบียน ${CFG.EVENT_NAME} ด้วยกัน! ใช้รหัสเพื่อน ${code} ตอนลงทะเบียนนะ 🎵⚙️`;
    if (navigator.share) { try { await navigator.share({ title: CFG.EVENT_NAME, text, url }); return; } catch (e) { return; } }
    copy(text + '\n' + url);
  }

  function inviteUrl(code) {
    return location.origin + location.pathname.replace(/[^/]*$/, '') + 'register.html?ref=' + code;
  }

  window.IMF = { CFG, DEMO, sb, api, rpc, demo, GROUPS, CATEGORY, YEAR, errMsg, $, $$, esc, fmt, dateTH, toast, copy, header, footer, sparkles, calendarLinks, qrSvg, shareInvite, inviteUrl };
})();
