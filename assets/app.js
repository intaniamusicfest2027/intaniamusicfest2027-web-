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
    tiktok: CFG.CONTACT_TIKTOK || 'intania.musicfest',
    hashtag: '#IntaniaMusicFest2027'
  };
  const DEMO = !CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY;
  const sb = DEMO ? null : window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' }
  });

  const GROUPS = ['A','B','C','Dog','E','F','G','H','J','K','L','M','N','P','Q','R','S','T'];
  const CATEGORY = { eng: 'นิสิตวิศวะ', chula_student: 'นิสิตจุฬาฯ', chula_staff: 'บุคลากรจุฬาฯ', external: 'บุคคลทั่วไป' };
  const YEAR = { '1': 'ปี 1', '2': 'ปี 2', '3': 'ปี 3', '4': 'ปี 4', '5+': 'ปี 5 ขึ้นไป' };
  const GENDER = { male: 'ชาย', female: 'หญิง', other: 'LGBTQ+', na: 'ไม่ระบุ' };
  const REASON = { referral: 'เพื่อนลงทะเบียนด้วยรหัสของคุณ', signup_bonus: 'ใช้รหัสเพื่อนตอนลงทะเบียน', redeem: 'แลกของรางวัล', adjust: 'ปรับ Point โดยทีมงาน', activity: 'ร่วมกิจกรรม' };

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
    REDEEM_CLOSED: 'ยังไม่เปิดระบบแลก Point',
    BAD_REWARD: 'ของรางวัลนี้ปิดอยู่',
    BAD_ACTIVITY: 'กิจกรรมนี้ปิดอยู่',
    ALREADY_AWARDED: 'คนนี้รับ Point กิจกรรมนี้ไปแล้ว',
    ALREADY_REDEEMED: 'คนนี้แลกของรางวัลนี้ไปแล้ว (แลกได้คนละ 1 ครั้ง)',
    NOT_ENOUGH_POINTS: 'Point ไม่พอ',
    OUT_OF_STOCK: 'ของรางวัลหมดแล้ว',
    USER_NOT_FOUND: 'ไม่พบบัญชีนี้ ให้เจ้าของอีเมลเข้าสู่ระบบเว็บนี้อย่างน้อย 1 ครั้งก่อน',
    CANNOT_REMOVE_SELF: 'ลบตัวเองไม่ได้',
    IS_STAFF: 'คนนี้เป็นทีมงาน ให้ลบสิทธิ์ทีมงานก่อน',
    BAD_ROLE: 'สิทธิ์ไม่ถูกต้อง',
    OWNER_ONLY: 'เฉพาะ Owner เท่านั้นที่จัดการแอดมินได้',
    BAD_STUDENT_ID: 'รหัสนิสิตต้องเป็นตัวเลข 10 หลัก',
    BAD_YEAR: 'ชั้นปีไม่ถูกต้อง',
    BAD_CATEGORY: 'ประเภทไม่ถูกต้อง',
    QR_EXPIRED: 'QR หมดอายุ ให้ผู้ร่วมงานเปิด QR ใหม่แล้วสแกนอีกครั้ง',
    REQUEST_USED: 'QR นี้แลกไปแล้ว',
    REWARDS_CLOSED: 'ยังไม่เปิดหน้าของรางวัล',
    BAD_CODE: 'โค้ดต้องเป็นตัวอักษรอังกฤษหรือตัวเลข 3–12 ตัว',
    BAD_POINTS: 'Point ต้องไม่ติดลบ'
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
    const KEY = 'imf_demo_v6';
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
        settings: { eng_round_open: true, general_round_open: false, allow_external: true, referral_open: true, points_per_referral: 1, points_per_referral_eng: 2, points_signup_bonus: 1, points_signup_bonus_eng: 1, leaderboard_open: true, rewards_open: false, ticket_open: false, ticket_countdown_at: '2027-01-15T10:00:00+07:00', map_open: false, redeem_open: true, target: 12000 },
        ref_codes: [], redeem_requests: [],
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
    // another tab (e.g. the staff scanner) may have changed the data
    const reload = () => { try { const d = JSON.parse(localStorage.getItem(KEY)); if (d) Object.keys(d).forEach(k => { db[k] = d[k]; }); } catch (e) {} };
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
        return { logged_in: true, email: em, category: cat, student_id: sid, year: yearOf(sid), faculty: facOf(sid), registered: !!me(), is_staff: true, is_admin: true, is_owner: true };
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
        let referrer = null, special = null;
        const ref = s.referral_open && p.ref_code ? String(p.ref_code).toUpperCase() : null;
        if (ref) {
          special = db.ref_codes.find(c => c.code === ref) || null;
          referrer = special ? db.profiles.find(x => x.id === special.owner) || null : db.profiles.find(x => x.ref_code === ref);
          if (!special && !referrer) fail('BAD_REF');
        }
        const row = { id: uuid(), email: info.email, category: info.category, round, first_name: p.first_name.trim(), last_name: p.last_name.trim(), nickname: p.nickname.trim(), gender: p.gender, phone,
          student_id: info.student_id, year: info.year, faculty: info.faculty, group_code: info.category === 'eng' ? p.group_code : null, ref_code: code(),
          referred_by: referrer ? referrer.id : null, used_code: ref, points: 0, qr_token: uuid(), checked_in_at: null, created_at: new Date().toISOString() };
        db.profiles.push(row);
        let bonus = 0;
        if (ref) {
          const eng = referrer && referrer.category === 'eng';
          const pts = special && special.referrer_points != null ? special.referrer_points : referrer ? +(eng ? s.points_per_referral_eng : s.points_per_referral) : 0;
          bonus = special && special.invitee_points != null ? special.invitee_points : +(eng ? s.points_signup_bonus_eng : s.points_signup_bonus);
          if (referrer && pts > 0) { referrer.points += pts; db.ledger.push({ user_id: referrer.id, delta: pts, reason: 'referral', related_user: row.id, created_at: row.created_at }); }
          if (bonus > 0) { row.points += bonus; db.ledger.push({ user_id: row.id, delta: bonus, reason: 'signup_bonus', related_user: referrer ? referrer.id : null, note: referrer ? null : 'โค้ด ' + ref, created_at: row.created_at }); }
        }
        save(); return { ref_code: row.ref_code, bonus };
      },
      update_my_profile({ p }) { const m = me(); const phone = String(p.phone || '').replace(/\D/g, ''); if (!p.first_name || !p.last_name) fail('BAD_NAME'); if (!p.nickname) fail('BAD_NICKNAME'); if (!/^0\d{8,9}$/.test(phone)) fail('BAD_PHONE'); Object.assign(m, { phone, nickname: p.nickname, first_name: p.first_name, last_name: p.last_name }); save(); return null; },
      admin_update_person({ uid, p }) { const r = db.profiles.find(x => x.id === uid); if (!r) fail('NOT_FOUND'); const phone = String(p.phone || '').replace(/\D/g, ''); if (!p.first_name || !p.last_name) fail('BAD_NAME'); if (!/^0\d{8,9}$/.test(phone)) fail('BAD_PHONE'); if (p.student_id && !/^\d{10}$/.test(p.student_id)) fail('BAD_STUDENT_ID'); Object.assign(r, { first_name: p.first_name, last_name: p.last_name, nickname: p.nickname || null, gender: p.gender || null, phone, group_code: p.group_code || null, student_id: p.student_id || null, year: p.year || null, faculty: p.faculty || null, category: p.category || r.category }); if (/^\d+$/.test(p.points || '') && +p.points !== r.points) { db.ledger.push({ user_id: uid, delta: +p.points - r.points, reason: 'adjust', note: 'แก้ไขโดยแอดมิน', created_at: new Date().toISOString() }); r.points = +p.points; } if ('checked_in' in p) r.checked_in_at = p.checked_in ? (r.checked_in_at || new Date().toISOString()) : null; save(); return null; },
      my_qr() { const m = me(); const w = Math.floor(Date.now() / 180000); return { code: 'IMF27:' + m.qr_token + ':' + w + ':demo', expires_in: Math.ceil((w + 1) * 180 - Date.now() / 1000) }; },
      my_points_history() { const m = me(); return db.ledger.filter(l => l.user_id === m.id).slice().reverse().map(l => ({ created_at: l.created_at, delta: l.delta, reason: l.reason, detail: detail(l) })); },
      group_leaderboard() {
        if (!db.settings.leaderboard_open) return GROUPS.map(c => ({ group_code: c, registered: db.profiles.filter(p => p.group_code === c).length })).sort((a, b) => b.registered - a.registered); // demo user is admin
        return GROUPS.map(c => ({ group_code: c, registered: db.profiles.filter(p => p.group_code === c).length })).sort((a, b) => b.registered - a.registered);
      },
      my_friends() { const m = me(); return db.profiles.filter(f => f.referred_by === m.id).length; },
      my_redeem_start({ reward }) {
        const m = me(), s = db.settings, w = db.rewards.find(x => x.id === reward && x.active);
        if (!s.redeem_open) fail('REDEEM_CLOSED'); if (!w) fail('BAD_REWARD');
        if (w.repeatable === false && db.ledger.some(l => l.user_id === m.id && l.reward_id === w.id)) fail('ALREADY_REDEEMED');
        if (w.stock != null && w.stock <= 0) fail('OUT_OF_STOCK'); if (m.points < w.cost) fail('NOT_ENOUGH_POINTS');
        db.redeem_requests.forEach(q => { if (q.user_id === m.id && q.status === 'pending') q.status = 'cancelled'; });
        const q = { id: Date.now(), token: uuid(), user_id: m.id, reward_id: w.id, status: 'pending', created_at: new Date().toISOString() };
        db.redeem_requests.push(q); save();
        return { id: q.id, token: q.token, code: 'IMF27R:' + q.token, expires_in: 180, reward: w.name, cost: w.cost };
      },
      my_redeem_status({ tok }) {
        const q = db.redeem_requests.find(x => x.token === tok); if (!q) return null; const w = db.rewards.find(x => x.id === q.reward_id);
        const st = q.status === 'pending' && Date.now() - new Date(q.created_at) > 180000 ? 'expired' : q.status;
        return { status: st, reward: w.name, cost: w.cost, points_after: q.points_after, done_at: q.done_at };
      },
      my_redeem_cancel({ tok }) { const q = db.redeem_requests.find(x => x.token === tok); if (q && q.status === 'pending') { q.status = 'cancelled'; save(); } return null; },
      staff_redeem_confirm({ tok }) {
        const q = db.redeem_requests.find(x => x.token === tok); if (!q) fail('NOT_FOUND');
        if (q.status === 'done') fail('REQUEST_USED');
        if (q.status === 'cancelled' || Date.now() - new Date(q.created_at) > 180000) fail('QR_EXPIRED');
        const r = rpc.staff_redeem({ uid: q.user_id, reward: q.reward_id });
        Object.assign(q, { status: 'done', done_at: new Date().toISOString(), points_after: r.points }); save();
        return r;
      },
      admin_referral_stats() {
        const P = db.profiles;
        return { referred: P.filter(p => p.used_code || p.referred_by).length, points: db.ledger.filter(l => l.reason === 'referral' || l.reason === 'signup_bonus').reduce((a, l) => a + l.delta, 0),
          top: P.map(p => ({ name: full(p), code: p.ref_code, grp: p.group_code, n: P.filter(f => f.referred_by === p.id).length })).filter(x => x.n).sort((a, b) => b.n - a.n).slice(0, 10) };
      },
      admin_ref_codes() {
        return db.ref_codes.slice().reverse().map(c => { const o = db.profiles.find(p => p.id === c.owner); return { ...c, owner_name: o ? full(o) : null, used: db.profiles.filter(p => p.used_code === c.code).length }; });
      },
      admin_ref_code_save({ who, ref_pts, inv_pts, lbl }) {
        const w = String(who || '').trim(), W = w.toUpperCase();
        if (ref_pts < 0 || inv_pts < 0) fail('BAD_POINTS');
        const p = db.profiles.find(x => x.ref_code === W || x.student_id === w || x.email === w.toLowerCase());
        const code = p ? p.ref_code : W;
        if (!p && !/^[A-Z0-9]{3,12}$/.test(W)) fail('BAD_CODE');
        let c = db.ref_codes.find(x => x.code === code);
        if (!c) { c = { code, owner: p ? p.id : null, label: lbl || null, created_at: new Date().toISOString() }; db.ref_codes.push(c); }
        Object.assign(c, { referrer_points: p ? ref_pts : 0, invitee_points: inv_pts }); if (lbl) c.label = lbl;
        save(); return code;
      },
      admin_ref_code_delete({ c }) { db.ref_codes = db.ref_codes.filter(x => x.code !== String(c).toUpperCase()); save(); return null; },
      staff_lookup({ q }) {
        let s = String(q || '').trim();
        if (s.startsWith('IMF27R:')) {
          const rq = db.redeem_requests.find(x => x.token === s.slice(7)); if (!rq) fail('NOT_FOUND');
          const r = db.profiles.find(p => p.id === rq.user_id), w = db.rewards.find(x => x.id === rq.reward_id);
          const st = rq.status === 'pending' && Date.now() - new Date(rq.created_at) > 180000 ? 'expired' : rq.status;
          return { id: r.id, by_token: true, kind: 'redeem', name: full(r), nickname: r.nickname, gender: r.gender, category: r.category, student_id: r.student_id, year: r.year, faculty: r.faculty, group_code: r.group_code, points: r.points, checked_in_at: r.checked_in_at,
            request: { token: rq.token, reward: w.name, reward_id: w.id, cost: w.cost, stock: w.stock, status: st } };
        }
        const by_token = s.startsWith('IMF27:');
        if (by_token) { const parts = s.slice(6).split(':'); if (parts.length !== 3 || Math.floor(Date.now() / 180000) - +parts[1] > 1) fail('QR_EXPIRED'); s = parts[0]; }
        const r = by_token ? db.profiles.find(p => p.qr_token === s) : db.profiles.find(p => p.ref_code === s.toUpperCase() || p.student_id === s || p.email === s.toLowerCase());
        if (!r) fail('NOT_FOUND');
        return { id: r.id, by_token, kind: by_token ? 'entry' : 'search', name: full(r), nickname: r.nickname, gender: r.gender, category: r.category, student_id: r.student_id, year: r.year, faculty: r.faculty, group_code: r.group_code, points: r.points, checked_in_at: r.checked_in_at };
      },
      staff_checkin({ uid }) { const r = db.profiles.find(p => p.id === uid); if (r.checked_in_at) return { ok: false, checked_in_at: r.checked_in_at }; r.checked_in_at = new Date().toISOString(); save(); return { ok: true, checked_in_at: r.checked_in_at }; },
      staff_redeem({ uid, reward }) {
        if (!db.settings.redeem_open) fail('REDEEM_CLOSED');
        const r = db.profiles.find(p => p.id === uid), w = db.rewards.find(x => x.id === reward && x.active);
        if (!w) fail('BAD_REWARD'); if (w.repeatable === false && db.ledger.some(l => l.user_id === uid && l.reward_id === w.id)) fail('ALREADY_REDEEMED'); if (r.points < w.cost) fail('NOT_ENOUGH_POINTS'); if (w.stock !== null && w.stock <= 0) fail('OUT_OF_STOCK');
        if (w.stock !== null) w.stock--; r.points -= w.cost; db.ledger.push({ user_id: r.id, delta: -w.cost, reason: 'redeem', reward_id: w.id, created_at: new Date().toISOString() }); save();
        return { points: r.points, reward: w.name };
      },
      staff_award({ uid, activity }) {
        const r = db.profiles.find(p => p.id === uid), a = db.activities.find(x => x.id === activity && x.active);
        if (!a) fail('BAD_ACTIVITY');
        if (!a.repeatable && db.ledger.some(l => l.user_id === uid && l.activity_id === a.id)) fail('ALREADY_AWARDED');
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
      admin_list({ q, lim, off, f }) {
        q = (q || '').toLowerCase(); f = f || {};
        const friends = (p) => db.profiles.filter(x => x.referred_by === p.id).length;
        const rows = db.profiles.filter(p => (!q || [p.first_name, p.last_name, p.nickname, p.email, p.phone, p.ref_code, p.student_id, p.faculty].some(v => v && String(v).toLowerCase().includes(q)))
            && (!f.checked || (f.checked === 'yes') === !!p.checked_in_at) && (!f.category || p.category === f.category) && (!f.group || p.group_code === f.group)
            && (!f.faculty || p.faculty === f.faculty) && (!f.year || p.year === f.year) && (!f.gender || p.gender === f.gender)
            && (!f.points || (f.points === 'has' ? p.points > 0 : f.points === 'ge10' ? p.points >= 10 : p.points === 0)))
          .map(p => ({ ...p, friends: friends(p) }))
          .sort((a, b) => f.sort === 'points' ? b.points - a.points : f.sort === 'friends' ? b.friends - a.friends : f.sort === 'sid' ? String(a.student_id || '~').localeCompare(String(b.student_id || '~')) : b.created_at.localeCompare(a.created_at));
        return rows.slice(off, off + lim).map(p => ({ ...p, referrer_code: (db.profiles.find(r => r.id === p.referred_by) || {}).ref_code || null, total_count: rows.length }));
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
      rpc: async (name, args) => { await new Promise(r => setTimeout(r, 80)); reload(); return rpc[name](args || {}); },
      db, save, me, FAC, reload,
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
      if (DEMO && fresh) demo.reload();
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
      if (DEMO) { demo.reload(); const m = demo.me(); return m ? { ...m } : null; }
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
    async faculties() {
      if (DEMO) return Object.values(demo.FAC);
      return (await q(sb.from('faculties').select('name').order('code'))).map(r => r.name);
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

  // ---------- icons (stroke SVG, 24×24) ----------
  const ICON = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M12 8S10.5 3.5 8 4.2C6 4.8 6.6 8 9 8M12 8s1.5-4.5 4-3.8c2 .6 1.4 3.8-1 3.8"/>',
    ticket: '<path d="M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4z"/><path d="M15 6v2M15 11v2M15 16v2"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
    login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>',
    map: '<path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3z"/><path d="M9 3v15M15 6v15"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    chev: '<path d="m9 18 6-6-6-6"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>'
  };
  const icon = (n, size = 22, sw = 1.9) => `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n] || ''}</svg>`;

  // Which page sits in each slot of the bottom bar. Slots 2 and 4 change with the admin settings.
  function tabs(info, s) {
    return [
      ['index.html', 'home', 'Home'],
      s.leaderboard_open ? ['leaderboard.html', 'users', 'อันดับกลุ่ม'] : ['rewards.html', 'gift', 'ของรางวัล'],
      ['me.html', 'ticket', 'บัตรเข้างาน', true],
      info.is_staff ? ['staff.html', 'scan', 'สแกน'] : s.map_open ? ['map.html', 'map', 'แผนผังงาน'] : ['contact.html', 'bell', 'ติดตาม'],
      info.logged_in ? ['profile.html', 'user', 'โปรไฟล์'] : ['register.html', 'login', 'เข้าสู่ระบบ']
    ];
  }

  // Renders the bottom bar (or the admin header) and returns { info, settings }
  async function boot(opts = {}) {
    const [info, settings] = await Promise.all([api.info(), api.settings().catch(() => ({}))]);
    const page = location.pathname.split('/').pop() || 'index.html';
    const stage = $('.stage');
    if (!opts.noArt) { const art = document.createElement('div'); art.className = 'art'; stage.prepend(art); }
    if (opts.admin) {
      document.body.classList.add('admin');
    } else {
      document.body.classList.add('has-tabs');
      const nav = document.createElement('nav');
      nav.className = 'tabbar'; nav.setAttribute('aria-label', 'เมนูหลัก');
      nav.innerHTML = tabs(info, settings).map(([h, ic, label, center]) => {
        const on = page === h;
        if (center) return `<a href="${h}" class="tab center ${on ? 'on' : ''}" ${on ? 'aria-current="page"' : ''}><span class="disc">${icon(ic, 28, 2)}${info.registered ? '' : `<i class="lockb">${icon('lock', 12, 2.6)}</i>`}</span><span>${label}</span></a>`;
        return `<a href="${h}" class="tab ${on ? 'on' : ''}" ${on ? 'aria-current="page"' : ''}>${icon(ic, 24, on ? 2.2 : 1.8)}<span>${label}</span></a>`;
      }).join('');
      document.body.appendChild(nav);
    }
    if (DEMO) {
      const b = document.createElement('div');
      b.className = 'demo-banner';
      b.innerHTML = 'โหมดตัวอย่าง (DEMO) · ข้อมูลปลอม · <a href="#" id="demoReset">รีเซ็ต</a>';
      document.body.prepend(b);
      $('#demoReset').onclick = (e) => { e.preventDefault(); demo.reset(); location.reload(); };
    }
    return { info, settings };
  }

  // ---------- shared pieces ----------
  const LOGO = 'assets/logo.png';
  function countdownHTML(cls = '') { return `<div class="cd ${cls}">${['วัน', 'ชั่วโมง', 'นาที', 'วินาที'].map(l => `<div><b>00</b><span>${l}</span></div>`).join('')}</div>`; }
  // keeps every .cd inside el ticking towards target
  function startCountdown(el, target) {
    const end = new Date(target).getTime();
    const tick = () => {
      let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      const v = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
      $$('.cd', el).forEach(cd => $$('b', cd).forEach((b, i) => { b.textContent = String(v[i]).padStart(2, '0'); }));
      return s;
    };
    tick(); const t = setInterval(() => { if (!tick()) clearInterval(t); }, 1000);
  }
  function comingSoon(extra = '') {
    return `<div class="soon"><img class="soon-logo" src="${LOGO}" alt="INTANIA MUSIC FEST"><div class="soon-t">COMING SOON</div>${extra}</div>`;
  }
  const pointPill = (n) => `<span class="ppill">${icon('trophy', 16, 2)}${fmt(n)} Point</span>`;

  // Live updates: Supabase Realtime when available, plus polling as a safety net.
  // check() must return true when the thing we wait for has happened.
  function watch({ table, filter, check, every = 3000 }) {
    let done = false, ch = null, timer = null;
    const run = async () => { if (done || document.hidden) return; try { if (await check()) stop(); } catch (e) {} };
    const stop = () => { done = true; clearInterval(timer); if (ch) { sb.removeChannel(ch); ch = null; } };
    if (!DEMO && sb && table) {
      try { ch = sb.channel('w-' + table + '-' + Math.random().toString(36).slice(2)).on('postgres_changes', { event: 'UPDATE', schema: 'public', table, filter }, run).subscribe(); } catch (e) {}
    }
    timer = setInterval(run, DEMO ? Math.min(every, 2000) : every);
    if (DEMO) window.addEventListener('storage', run);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });
    return { stop };
  }

  // Sign-in buttons. Chula accounts are Google accounts, so both go through Google;
  // the CU button only offers @student.chula.ac.th accounts.
  // Put the official CU logo file at assets/cu-logo.png to show it on the button.
  const G_ICON = '<svg class="g" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';
  function loginButtons(el, opts = {}) {
    el.innerHTML = `<button class="btn big block" data-login="cu">เข้าสู่ระบบด้วยบัญชี <img class="cu" src="assets/cu-logo.png" alt="CU" onerror="this.outerHTML='<b>CU</b>'"></button>
      ${opts.cuOnly ? '' : `<button class="btn big block" data-login="google">${G_ICON} เข้าสู่ระบบด้วย Google</button>`}`;
    el.onclick = async (e) => {
      const b = e.target.closest('[data-login]'); if (!b) return;
      b.disabled = true;
      try { await api.signIn({ hd: b.dataset.login === 'cu' ? (opts.cuHd === undefined ? 'student.chula.ac.th' : (opts.cuHd || undefined)) : undefined }); }
      catch (ex) { toast(errMsg(ex), true); b.disabled = false; }
    };
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

  // Keeps an eye on my own row: pops up when staff check me in or give me activity points.
  // Realtime does the work; the slow poll is only a safety net (thousands of phones are open at once).
  function watchMe(me, { onCheckin } = {}) {
    let last = { pts: me.points, in: me.checked_in_at };
    return watch({
      table: 'profiles', filter: 'id=eq.' + me.id, every: 20000,
      check: async () => {
        const p = await api.myProfile(); if (!p) return false;
        const was = last; last = { pts: p.points, in: p.checked_in_at };
        if (!was.in && p.checked_in_at && onCheckin) onCheckin(p);
        if (p.points > was.pts && !$('.modal .done')) {
          const h = (await rpc('my_points_history').catch(() => [])).find(x => x.delta > 0);
          const what = h ? (h.reason === 'activity' ? h.detail : REASON[h.reason]) : '';
          if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
          modal(`<div class="done"><span class="okdisc star">${icon('star', 56, 2.4)}</span><h2>ได้รับ Point!</h2>
            <div class="plus">+${fmt(p.points - was.pts)} Point</div>${what ? `<div class="what">${esc(what)}</div>` : ''}
            <div class="muted">รวม ${fmt(p.points)} Point</div>
            <button class="btn red block" data-close style="margin-top:12px">ตกลง</button></div>`);
          $$('.pcard .num b').forEach(b => { b.textContent = fmt(p.points); });
        }
        return false;
      }
    });
  }

  // the invite card (code + share buttons)
  function inviteCard(me, friends) {
    return `<div class="card invite">
      <div><b class="h">ชวนเพื่อน รับ Point</b>${friends != null ? `<div class="small muted">ชวนแล้ว ${fmt(friends)} คน</div>` : ''}</div>
      <div class="row nowrap"><div class="codebox">${esc(me.ref_code)}</div>
        <button class="iconbtn" data-copy="${esc(me.ref_code)}" aria-label="คัดลอกโค้ด">${icon('copy', 20)}</button>
        <button class="iconbtn red" data-share="${esc(me.ref_code)}" aria-label="แชร์ลิงก์ชวนเพื่อน">${icon('share', 20)}</button></div>
    </div>`;
  }
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-copy]'); if (c) return copy(c.dataset.copy);
    const s = e.target.closest('[data-share]'); if (s) return shareInvite(s.dataset.share);
  });

  window.IMF = { CFG, EVENT, DEMO, sb, api, rpc, demo, GROUPS, CATEGORY, YEAR, GENDER, REASON, errMsg, $, $$, esc, fmt, dateTH, toast, copy, modal, personLine, boot, tabs, loginButtons, calendarLinks, qrSvg, inviteUrl, shareInvite, invitePoints, inviteCard, icon, ICON, LOGO, countdownHTML, startCountdown, comingSoon, pointPill, watch, watchMe };
})();
