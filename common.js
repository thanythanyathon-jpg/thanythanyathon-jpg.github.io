/* Shared helper: Supabase client, login screen, sign-out bar, toast messages. */
(function () {
  const cfg = window.APP_CONFIG || {};
  const el = (t, p = {}, k = []) => { const n = Object.assign(document.createElement(t), p); [].concat(k).forEach(x => n.append(x)); return n; };
  const App = window.App = { sb: null, user: null };

  const toast = el("div", { id: "toast", role: "status" });
  document.addEventListener("DOMContentLoaded", () => document.body.append(toast));
  let timer;
  App.notify = (text, isError) => {
    toast.textContent = text;
    toast.style.outline = isError ? "2px solid #c23b3b" : "none";
    clearTimeout(timer);
    timer = setTimeout(() => (toast.textContent = ""), 5000);
  };

  function loginBox() {
    const email = el("input", { type: "email", required: true, autocomplete: "email" });
    const pass = el("input", { type: "password", required: true, minLength: 6, autocomplete: "current-password" });
    const signIn = el("button", { className: "p", type: "submit", textContent: "Sign in" });
    const signUp = el("button", { type: "button", textContent: "Create account" });
    const guest = el("button", { type: "button", textContent: "Continue as guest" });
    const msg = el("p", { role: "status", style: "margin:0;min-height:1.4em;font-size:14px" });
    const show = (t, err) => { msg.textContent = t; msg.style.color = err ? "var(--err,#c23b3b)" : "var(--muted)"; };
    const form = el("form", { className: "login" }, [
      el("label", {}, ["Email", email]), el("label", {}, ["Password (min 6 characters)", pass]),
      signIn, signUp, guest, msg
    ]);
    form.onsubmit = async e => {
      e.preventDefault();
      const { error } = await App.sb.auth.signInWithPassword({ email: email.value, password: pass.value });
      if (error) show(error.message, true);
    };
    signUp.onclick = async () => {
      if (!form.reportValidity()) return;
      const { data, error } = await App.sb.auth.signUp({ email: email.value, password: pass.value });
      if (error) return show(error.message, true);
      if (!data.session) show("Account created. Check your email to confirm it, then sign in.");
    };
    guest.onclick = async () => {
      const { error } = await App.sb.auth.signInAnonymously();
      if (error) show("Guest sign-in is not enabled: " + error.message, true);
    };
    return el("section", { className: "box" }, [el("h2", { textContent: "Sign in to continue" }),
      el("p", { style: "color:var(--muted);margin:0 0 12px", textContent: "Your data is stored securely in the cloud and tied to your account." }), form]);
  }

  function userBar(user) {
    return el("div", { className: "userbar" }, [
      el("span", { textContent: user.is_anonymous ? "Signed in as guest" : "Signed in as " + user.email }),
      el("button", { type: "button", textContent: "Sign out", onclick: () => App.sb.auth.signOut() })
    ]);
  }

  /* Demo mode: same query API as Supabase, but data lives in this browser (localStorage). */
  function localClient() {
    const read = t => { try { return JSON.parse(localStorage.getItem("local." + t)) || []; } catch (e) { return []; } };
    const write = (t, rows) => { try { localStorage.setItem("local." + t, JSON.stringify(rows)); } catch (e) {} };
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
    const from = t => {
      const q = { op: "select", filters: [], orders: [] };
      const b = {
        select() { q.op = "select"; return b; },
        insert(row) { q.op = "insert"; q.row = row; return b; },
        delete() { q.op = "delete"; return b; },
        eq(c, v) { q.filters.push(r => r[c] === v); return b; },
        gte(c, v) { q.filters.push(r => r[c] >= v); return b; },
        lt(c, v) { q.filters.push(r => r[c] < v); return b; },
        order(c, o) { q.orders.push([c, !(o && o.ascending === false)]); return b; },
        then(res, rej) { return Promise.resolve(run()).then(res, rej); }
      };
      function run() {
        const rows = read(t);
        if (q.op === "insert") {
          const r = Object.assign({ id: uid(), user_id: "local", created_at: new Date().toISOString() }, q.row);
          if (t === "bookings" && rows.some(x => x.room === r.room && x.date === r.date && r.start_min < x.end_min && r.end_min > x.start_min))
            return { error: { code: "23P01", message: "Overlapping booking" } };
          rows.push(r); write(t, rows); return { error: null };
        }
        if (q.op === "delete") { write(t, rows.filter(r => !q.filters.every(f => f(r)))); return { error: null }; }
        const out = rows.filter(r => q.filters.every(f => f(r)));
        q.orders.slice().reverse().forEach(([c, asc]) => out.sort((x, y) => (x[c] > y[c] ? 1 : x[c] < y[c] ? -1 : 0) * (asc ? 1 : -1)));
        return { data: out, error: null };
      }
      return b;
    };
    return { from, channel: () => ({ on() { return this; }, subscribe() { return this; } }), removeChannel() {}, auth: {} };
  }

  const LIB_FALLBACK = "https://unpkg.com/@supabase/supabase-js@2.118.0/dist/umd/supabase.js";
  function loadLib(done) {                 // second chance if the first CDN was blocked or slow
    let finished = false;
    const finish = () => { if (!finished) { finished = true; done(); } };
    const tag = el("script", { src: LIB_FALLBACK, onload: finish, onerror: finish });
    document.head.append(tag);
    setTimeout(finish, 6000);
  }

  /* opts: { onUser(user), onSignedOut() } */
  App.start = function (opts) {
    const hasKeys = !!(cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes("YOUR-") && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes("YOUR-"));
    if (hasKeys && !window.supabase) loadLib(() => begin(opts, hasKeys)); else begin(opts, hasKeys);
  };

  function startDemo(opts, message) {      // data lives in this browser only
    const gate = document.getElementById("gate"), app = document.getElementById("app");
    App.local = true;
    App.sb = localClient();
    App.user = { id: "local", is_anonymous: true };
    gate.replaceChildren(el("div", { className: "userbar" }, [el("span", { textContent: message })]));
    app.hidden = false;
    opts.onUser(App.user);
  }

  function trouble(opts) {                 // shown when the server does not answer, instead of a blank page
    return el("section", { className: "box" }, [
      el("h2", { textContent: "Can't reach the server" }),
      el("p", { textContent: "The connection to Supabase is taking too long. If this is a free Supabase project that has been inactive, it may be paused: open the Supabase dashboard and press Restore. Your network or browser may also be blocking supabase.co." }),
      el("div", { style: "display:flex;gap:10px;flex-wrap:wrap" }, [
        el("button", { className: "p", type: "button", textContent: "Try again", onclick: () => location.reload() }),
        el("button", { type: "button", textContent: "Use demo mode (saved in this browser)", onclick: () => startDemo(opts, "Demo mode: the server could not be reached, so your data is saved only in this browser.") })
      ])]);
  }

  function begin(opts, hasKeys) {
    const gate = document.getElementById("gate"), app = document.getElementById("app");
    if (!hasKeys) {                         // works out of the box, no backend needed
      startDemo(opts, "Demo mode: your data is saved only in this browser. Supabase is not connected because config.js still has placeholder values (see README).");
      return;
    }
    if (!window.supabase) {                 // keys are set but the library could not be loaded: say so, do not hide it
      gate.replaceChildren(el("section", { className: "box" }, [
        el("h2", { textContent: "Could not connect" }),
        el("p", { textContent: "The Supabase library failed to load (network, ad blocker or firewall). Reload the page, or try another network or browser." })]));
      return;
    }
    App.sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    gate.replaceChildren(el("div", { className: "userbar" }, [el("span", { textContent: "Connecting…" })]));
    let lastId = "init", settled = false;
    const slow = setTimeout(() => { if (!settled && !App.local) gate.replaceChildren(trouble(opts)); }, Number(cfg.CONNECT_TIMEOUT_MS) || 7000);
    App.sb.auth.onAuthStateChange((_event, session) => {
      if (App.local) return;                // user chose demo mode while the server was unreachable
      settled = true; clearTimeout(slow);
      const user = session ? session.user : null;
      const id = user ? user.id : "none";
      if (id === lastId) return;            // ignore token refreshes
      lastId = id;
      setTimeout(() => {                    // never call Supabase directly inside this callback
        App.user = user;
        if (user) { gate.replaceChildren(userBar(user)); app.hidden = false; opts.onUser(user); }
        else { gate.replaceChildren(loginBox()); app.hidden = true; if (opts.onSignedOut) opts.onSignedOut(); }
      }, 0);
    });
  };
})();
