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

  /* opts: { onUser(user), onSignedOut() } */
  App.start = function (opts) {
    const gate = document.getElementById("gate"), app = document.getElementById("app");
    const configured = window.supabase && cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes("YOUR-") && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes("YOUR-");
    if (!configured) {                      // works out of the box, no backend needed
      App.local = true;
      App.sb = localClient();
      App.user = { id: "local", is_anonymous: true };
      gate.replaceChildren(el("div", { className: "userbar" }, [el("span", { textContent: "Demo mode: your data is saved only in this browser. Connect Supabase in config.js to sync accounts and share data (see README)." })]));
      app.hidden = false;
      opts.onUser(App.user);
      return;
    }
    App.sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    let lastId = "init";
    App.sb.auth.onAuthStateChange((_event, session) => {
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
