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

  /* ================= Sign-in screen: small reusable components ================= */
  const ICON = {
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    lock: '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.4 6.5C3.7 8.3 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M8 14h.01M12 14h.01M16 14h.01"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/><circle cx="16.5" cy="15" r="1.2"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="m14 17.5 2.2 2.2L21 15"/>',
    click: '<path d="M5 3l14 7-6 2-2 6L5 3z"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3z"/><path d="m9 12 2 2 4-4"/>',
    plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M2 20h20"/>',
    userPlus: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M19 8v6M16 11h6"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5a3 3 0 0 1 0 6M18 14c2 .6 3 2.5 3 5"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.01"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>'
  };
  /* Illustrations for the left panel (inline SVG, no image files needed). Each page picks one with auth.scene. */
  const SCENES = {
    meeting: "<svg class=\"scene\" data-scene=\"meeting\" aria-hidden=\"true\" focusable=\"false\" viewBox=\"0 0 480 600\" preserveAspectRatio=\"xMidYMid slice\"><defs><linearGradient id=\"mrg1\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#101a3b\"/><stop offset=\"1\" stop-color=\"#1b2a58\"/></linearGradient><linearGradient id=\"mrg2\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0\" stop-color=\"#e0e7ff\" stop-opacity=\"0\"/><stop offset=\".5\" stop-color=\"#eef2ff\" stop-opacity=\".95\"/><stop offset=\"1\" stop-color=\"#e0e7ff\" stop-opacity=\"0\"/></linearGradient><linearGradient id=\"mrg3\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#b4c0f2\" stop-opacity=\".62\"/><stop offset=\"1\" stop-color=\"#30427c\" stop-opacity=\".3\"/></linearGradient><linearGradient id=\"mrg4\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0\" stop-color=\"#3a4e92\"/><stop offset=\"1\" stop-color=\"#1a2858\"/></linearGradient><linearGradient id=\"mrg5\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#16224a\"/><stop offset=\"1\" stop-color=\"#080e22\"/></linearGradient></defs><rect width=\"480\" height=\"600\" fill=\"#0c1430\"/><path d=\"M0 0H480L410 130H70Z\" fill=\"url(#mrg1)\"/><rect x=\"70\" y=\"130\" width=\"340\" height=\"172\" fill=\"#1a2750\"/><path d=\"M0 0 70 130V302L0 420Z\" fill=\"url(#mrg4)\"/><path d=\"M480 0 410 130V302L480 420Z\" fill=\"#162250\"/><path d=\"M0 420 70 302H410L480 420V600H0Z\" fill=\"url(#mrg5)\"/><g fill=\"#0d1636\" opacity=\".9\"><path d=\"M6 330v-60l8 6v-26l10 12v-10l10 18v-8l10 16v-14l10 14v72z\" transform=\"translate(0 6) scale(.92 .9)\"/></g><g stroke=\"#0c1431\" stroke-width=\"3\" opacity=\".95\"><path d=\"M14 40 70 140M26 80 70 160M0 200 70 232\"/></g><g fill=\"#a5b4fc\" opacity=\".6\"><rect x=\"12\" y=\"300\" width=\"3\" height=\"3\"/><rect x=\"26\" y=\"290\" width=\"3\" height=\"3\"/><rect x=\"40\" y=\"304\" width=\"3\" height=\"3\"/><rect x=\"52\" y=\"288\" width=\"3\" height=\"3\"/></g><rect x=\"170\" y=\"168\" width=\"140\" height=\"78\" rx=\"5\" fill=\"#080f26\" stroke=\"#4458a0\" stroke-width=\"2\"/><g fill=\"none\" stroke=\"#818cf8\" stroke-width=\"2.4\" stroke-linecap=\"round\" opacity=\".9\"><rect x=\"222\" y=\"184\" width=\"36\" height=\"34\" rx=\"5\"/><path d=\"M222 196h36M231 180v8M249 180v8\"/></g><g fill=\"#a5b4fc\" opacity=\".5\"><rect x=\"190\" y=\"228\" width=\"30\" height=\"3\" rx=\"1.5\"/><rect x=\"260\" y=\"228\" width=\"40\" height=\"3\" rx=\"1.5\"/></g><path d=\"M112 0h34l84 130h-12z\" fill=\"url(#mrg2)\"/><path d=\"M368 0h-34l-84 130h12z\" fill=\"url(#mrg2)\"/><path d=\"M226 0h28l-6 130h-16z\" fill=\"url(#mrg2)\" opacity=\".75\"/><path d=\"M212 300H268L420 600H60Z\" fill=\"url(#mrg3)\"/><path d=\"M212 300 60 600M268 300 420 600\" stroke=\"#dbe3ff\" stroke-width=\"2\" opacity=\".35\"/><path d=\"M212 300H268\" stroke=\"#dbe3ff\" stroke-width=\"2\" opacity=\".5\"/><g fill=\"#080f26\"><rect x=\"150\" y=\"318\" width=\"26\" height=\"30\" rx=\"8\"/><rect x=\"304\" y=\"318\" width=\"26\" height=\"30\" rx=\"8\"/><rect x=\"122\" y=\"352\" width=\"38\" height=\"46\" rx=\"11\"/><rect x=\"320\" y=\"352\" width=\"38\" height=\"46\" rx=\"11\"/><rect x=\"70\" y=\"420\" width=\"56\" height=\"72\" rx=\"16\"/><rect x=\"354\" y=\"420\" width=\"56\" height=\"72\" rx=\"16\"/><rect x=\"14\" y=\"520\" width=\"74\" height=\"96\" rx=\"20\"/><rect x=\"392\" y=\"520\" width=\"74\" height=\"96\" rx=\"20\"/></g><g fill=\"#e0e7ff\" opacity=\".12\"><rect x=\"74\" y=\"424\" width=\"48\" height=\"6\" rx=\"3\"/><rect x=\"358\" y=\"424\" width=\"48\" height=\"6\" rx=\"3\"/><rect x=\"20\" y=\"526\" width=\"62\" height=\"7\" rx=\"3.5\"/><rect x=\"398\" y=\"526\" width=\"62\" height=\"7\" rx=\"3.5\"/></g><g fill=\"#15374d\"><path d=\"M440 520c14-60-6-100-36-124 6 52-4 96 36 124z\"/><path d=\"M462 540c-4-56-34-86-66-94 18 40 22 70 66 94z\"/></g></svg>",
    chart: "<svg class=\"scene\" data-scene=\"chart\" aria-hidden=\"true\" focusable=\"false\" viewBox=\"0 0 480 600\" preserveAspectRatio=\"xMidYMid slice\"><defs><linearGradient id=\"chg1\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#26376f\"/><stop offset=\"1\" stop-color=\"#0f1834\"/></linearGradient><linearGradient id=\"chg2\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#818cf8\" stop-opacity=\".38\"/><stop offset=\"1\" stop-color=\"#818cf8\" stop-opacity=\"0\"/></linearGradient><filter id=\"chg3\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\"><feGaussianBlur stdDeviation=\"5\"/></filter></defs><rect width=\"480\" height=\"600\" fill=\"url(#chg1)\"/><g stroke=\"#8fa0d8\" stroke-opacity=\".12\" stroke-width=\"1\"><path d=\"M0 60V440\" /><path d=\"M60 60V440\" /><path d=\"M120 60V440\" /><path d=\"M180 60V440\" /><path d=\"M240 60V440\" /><path d=\"M300 60V440\" /><path d=\"M360 60V440\" /><path d=\"M420 60V440\" /><path d=\"M480 60V440\" /><path d=\"M0 80H480\" /><path d=\"M0 140H480\" /><path d=\"M0 200H480\" /><path d=\"M0 260H480\" /><path d=\"M0 320H480\" /><path d=\"M0 380H480\" /><path d=\"M0 440H480\" /></g><g transform=\"scale(.9 1)\"><rect x=\"17\" y=\"409\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"39\" y=\"409\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"61\" y=\"414\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"83\" y=\"400\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"105\" y=\"396\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"127\" y=\"413\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"149\" y=\"406\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"171\" y=\"428\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"193\" y=\"405\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"215\" y=\"407\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"237\" y=\"394\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"259\" y=\"400\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"281\" y=\"420\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"303\" y=\"416\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"325\" y=\"406\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"347\" y=\"429\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"369\" y=\"413\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"391\" y=\"424\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"413\" y=\"426\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"435\" y=\"428\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><rect x=\"457\" y=\"402\" width=\"10\" height=\"60\" fill=\"#818cf8\" opacity=\".22\"/><path d=\"M22 290.5 C33.0 290.5 33.0 279.1 44 279.1 C55.0 279.1 55.0 267.5 66 267.5 C77.0 267.5 77.0 260.6 88 260.6 C99.0 260.6 99.0 244.9 110 244.9 C121.0 244.9 121.0 229.5 132 229.5 C143.0 229.5 143.0 218.9 154 218.9 C165.0 218.9 165.0 201.8 176 201.8 C187.0 201.8 187.0 181.3 198 181.3 C209.0 181.3 209.0 168.1 220 168.1 C231.0 168.1 231.0 155.7 242 155.7 C253.0 155.7 253.0 143.5 264 143.5 C275.0 143.5 275.0 137.9 286 137.9 C297.0 137.9 297.0 129.5 308 129.5 C319.0 129.5 319.0 123.0 330 123.0 C341.0 123.0 341.0 122.8 352 122.8 C363.0 122.8 363.0 123.3 374 123.3 C385.0 123.3 385.0 117.9 396 117.9 C407.0 117.9 407.0 104.6 418 104.6 C429.0 104.6 429.0 92.5 440 92.5 C451.0 92.5 451.0 82.1 462 82.1 L462 440 L22 440Z\" fill=\"url(#chg2)\"/><path d=\"M22 296.4V330.0\" stroke=\"#34d399\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"17\" y=\"304.5\" width=\"10\" height=\"10.2\" rx=\"1.5\" fill=\"#34d399\" opacity=\".9\"/><path d=\"M44 268.1V315.6\" stroke=\"#34d399\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"39\" y=\"281.8\" width=\"10\" height=\"22.7\" rx=\"1.5\" fill=\"#34d399\" opacity=\".9\"/><path d=\"M66 245.2V288.2\" stroke=\"#34d399\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"61\" y=\"258.4\" width=\"10\" height=\"23.4\" rx=\"1.5\" fill=\"#34d399\" opacity=\".9\"/><path d=\"M88 246.8V265.6\" stroke=\"#34d399\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"83\" y=\"253.6\" width=\"10\" height=\"4.8\" rx=\"1.5\" fill=\"#34d399\" opacity=\".9\"/><path d=\"M110 224.0V261.3\" stroke=\"#34d399\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"105\" y=\"241.9\" width=\"10\" height=\"11.8\" rx=\"1.5\" fill=\"#34d399\" opacity=\".9\"/><path d=\"M132 205.1V261.5\" stroke=\"#34d399\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"127\" y=\"220.1\" width=\"10\" height=\"21.8\" rx=\"1.5\" fill=\"#34d399\" opacity=\".9\"/><path d=\"M154 204.3V240.2\" stroke=\"#34d399\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"149\" y=\"215.9\" width=\"10\" height=\"4.2\" rx=\"1.5\" fill=\"#34d399\" opacity=\".9\"/><path d=\"M176 167.0V226.0\" stroke=\"#34d399\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"171\" y=\"185.4\" width=\"10\" height=\"30.5\" rx=\"1.5\" fill=\"#34d399\" opacity=\".9\"/><path d=\"M198 152.2V195.7\" stroke=\"#34d399\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"193\" y=\"159.7\" width=\"10\" height=\"25.7\" rx=\"1.5\" fill=\"#34d399\" opacity=\".9\"/><path d=\"M220 151.2V181.7\" stroke=\"#fb7185\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"215\" y=\"159.7\" width=\"10\" height=\"7.7\" rx=\"1.5\" fill=\"#fb7185\" opacity=\".9\"/><path d=\"M242 155.0V181.2\" stroke=\"#34d399\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"237\" y=\"166.2\" width=\"10\" height=\"3.0\" rx=\"1.5\" fill=\"#34d399\" opacity=\".9\"/><path d=\"M264 129.8V175.1\" stroke=\"#34d399\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"259\" y=\"136.5\" width=\"10\" height=\"29.7\" rx=\"1.5\" fill=\"#34d399\" opacity=\".9\"/><path d=\"M286 124.4V147.9\" stroke=\"#fb7185\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"281\" y=\"136.5\" width=\"10\" height=\"3.0\" rx=\"1.5\" fill=\"#fb7185\" opacity=\".9\"/><path d=\"M308 121.2V147.7\" stroke=\"#34d399\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"303\" y=\"133.7\" width=\"10\" height=\"3.8\" rx=\"1.5\" fill=\"#34d399\" opacity=\".9\"/><path d=\"M330 117.6V149.6\" stroke=\"#fb7185\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"325\" y=\"133.7\" width=\"10\" height=\"6.6\" rx=\"1.5\" fill=\"#fb7185\" opacity=\".9\"/><path d=\"M352 122.4V158.9\" stroke=\"#34d399\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"347\" y=\"135.9\" width=\"10\" height=\"4.3\" rx=\"1.5\" fill=\"#34d399\" opacity=\".9\"/><path d=\"M374 125.9V159.4\" stroke=\"#fb7185\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"369\" y=\"135.9\" width=\"10\" height=\"3.4\" rx=\"1.5\" fill=\"#fb7185\" opacity=\".9\"/><path d=\"M396 100.4V156.2\" stroke=\"#34d399\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"391\" y=\"112.3\" width=\"10\" height=\"27.0\" rx=\"1.5\" fill=\"#34d399\" opacity=\".9\"/><path d=\"M418 74.0V118.7\" stroke=\"#34d399\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"413\" y=\"87.0\" width=\"10\" height=\"25.3\" rx=\"1.5\" fill=\"#34d399\" opacity=\".9\"/><path d=\"M440 70.0V101.5\" stroke=\"#fb7185\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"435\" y=\"87.0\" width=\"10\" height=\"3.0\" rx=\"1.5\" fill=\"#fb7185\" opacity=\".9\"/><path d=\"M462 76.9V113.9\" stroke=\"#fb7185\" stroke-width=\"2\" opacity=\".85\"/><rect x=\"457\" y=\"87.3\" width=\"10\" height=\"10.6\" rx=\"1.5\" fill=\"#fb7185\" opacity=\".9\"/><path d=\"M22 290.5 C33.0 290.5 33.0 279.1 44 279.1 C55.0 279.1 55.0 267.5 66 267.5 C77.0 267.5 77.0 260.6 88 260.6 C99.0 260.6 99.0 244.9 110 244.9 C121.0 244.9 121.0 229.5 132 229.5 C143.0 229.5 143.0 218.9 154 218.9 C165.0 218.9 165.0 201.8 176 201.8 C187.0 201.8 187.0 181.3 198 181.3 C209.0 181.3 209.0 168.1 220 168.1 C231.0 168.1 231.0 155.7 242 155.7 C253.0 155.7 253.0 143.5 264 143.5 C275.0 143.5 275.0 137.9 286 137.9 C297.0 137.9 297.0 129.5 308 129.5 C319.0 129.5 319.0 123.0 330 123.0 C341.0 123.0 341.0 122.8 352 122.8 C363.0 122.8 363.0 123.3 374 123.3 C385.0 123.3 385.0 117.9 396 117.9 C407.0 117.9 407.0 104.6 418 104.6 C429.0 104.6 429.0 92.5 440 92.5 C451.0 92.5 451.0 82.1 462 82.1\" fill=\"none\" stroke=\"#a5b4fc\" stroke-width=\"5\" opacity=\".55\" filter=\"url(#chg3)\"/><path d=\"M22 290.5 C33.0 290.5 33.0 279.1 44 279.1 C55.0 279.1 55.0 267.5 66 267.5 C77.0 267.5 77.0 260.6 88 260.6 C99.0 260.6 99.0 244.9 110 244.9 C121.0 244.9 121.0 229.5 132 229.5 C143.0 229.5 143.0 218.9 154 218.9 C165.0 218.9 165.0 201.8 176 201.8 C187.0 201.8 187.0 181.3 198 181.3 C209.0 181.3 209.0 168.1 220 168.1 C231.0 168.1 231.0 155.7 242 155.7 C253.0 155.7 253.0 143.5 264 143.5 C275.0 143.5 275.0 137.9 286 137.9 C297.0 137.9 297.0 129.5 308 129.5 C319.0 129.5 319.0 123.0 330 123.0 C341.0 123.0 341.0 122.8 352 122.8 C363.0 122.8 363.0 123.3 374 123.3 C385.0 123.3 385.0 117.9 396 117.9 C407.0 117.9 407.0 104.6 418 104.6 C429.0 104.6 429.0 92.5 440 92.5 C451.0 92.5 451.0 82.1 462 82.1\" fill=\"none\" stroke=\"#c7d2fe\" stroke-width=\"2.5\" stroke-linecap=\"round\"/><circle cx=\"462\" cy=\"82.1\" r=\"9\" fill=\"#818cf8\" opacity=\".35\"/><circle cx=\"462\" cy=\"82.1\" r=\"4.5\" fill=\"#e0e7ff\"/></g><g fill=\"#8fa0d8\" opacity=\".35\"><rect x=\"428\" y=\"84\" width=\"40\" height=\"5\" rx=\"2.5\"/><rect x=\"436\" y=\"144\" width=\"32\" height=\"5\" rx=\"2.5\"/><rect x=\"428\" y=\"204\" width=\"40\" height=\"5\" rx=\"2.5\"/><rect x=\"436\" y=\"264\" width=\"32\" height=\"5\" rx=\"2.5\"/><rect x=\"428\" y=\"324\" width=\"40\" height=\"5\" rx=\"2.5\"/></g></svg>"
  };
  const icon = (name, cls) => el("span", { className: "ai" + (cls ? " " + cls : ""), innerHTML: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICON[name] || "") + "</svg>" });
  const AUTH_CSS = `
body.auth-mode{background:radial-gradient(900px 480px at 88% -10%,rgba(129,140,248,.16),transparent 62%),radial-gradient(700px 420px at 0% 110%,rgba(99,102,241,.12),transparent 62%),#0F172A;background-attachment:fixed;color:#E6EAF6;color-scheme:dark}
body.auth-mode .wrap{max-width:1040px}
body.auth-mode .wrap>a,body.auth-mode .wrap>h1{display:none}
.auth{--a-card:#17233D;--a-accent:#818CF8;--a-text:#E6EAF6;--a-muted:#97A3BF;--a-border:rgba(148,163,184,.2);color:var(--a-text)}
.auth *{box-sizing:border-box}
.auth-top{display:flex;align-items:center;justify-content:space-between;gap:12px 20px;flex-wrap:wrap;margin:6px 0 22px}
.auth-brand{display:flex;align-items:center;gap:12px;margin:0;font-size:26px;line-height:1.2;font-weight:700;letter-spacing:-.01em;color:var(--a-text)}
.auth-brand .ai{color:var(--a-accent)}.auth-brand .ai svg{width:34px;height:34px}
.auth-brand em{font-style:normal;color:var(--a-accent)}
.auth-back{color:var(--a-muted);font-size:14px;text-decoration:none;border-radius:6px;padding:2px 4px}
.auth-back:hover{color:var(--a-text);text-decoration:underline;text-underline-offset:3px}
.auth a:focus-visible,.auth button:focus-visible{outline:2px solid #A5B4FC;outline-offset:3px}
.auth-card{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);background:var(--a-card);border:1px solid var(--a-border);border-radius:22px;overflow:hidden;box-shadow:0 34px 70px -34px rgba(0,0,0,.75),0 0 0 1px rgba(129,140,248,.05)}
.auth-art{position:relative;isolation:isolate;min-height:540px;padding:32px;display:flex;flex-direction:column;justify-content:flex-end;background:#10192f center/cover no-repeat}
.auth-art .scene{position:absolute;inset:0;width:100%;height:100%;z-index:-2}
.auth-art::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(15,23,42,.08) 0%,rgba(15,23,42,.5) 52%,rgba(15,23,42,.94) 100%)}
.auth-art h2{margin:0;font-size:28px;line-height:1.2;letter-spacing:-.01em;color:#fff;max-width:14ch}
.auth-benefits{list-style:none;margin:22px 0 0;padding:0;display:grid;gap:13px}
.auth-benefits li{display:flex;align-items:center;gap:12px;padding:0;border:0;color:#D5DCF0;font-size:14.5px}
.auth-benefits .ai{color:var(--a-accent)}.auth-benefits svg{width:20px;height:20px}
.auth-panel{padding:46px 44px;display:flex;flex-direction:column;justify-content:center;min-width:0}
.auth-panel h2{margin:0 0 6px;font-size:28px;line-height:1.2;letter-spacing:-.01em;color:var(--a-text)}
.auth-sub{margin:0 0 26px;color:var(--a-muted);font-size:15px}
.auth-form{display:block;margin:0;max-width:none}
.auth-field{margin:0 0 18px}
.auth-field label{display:block;margin:0 0 8px;font-size:14px;font-weight:500;color:var(--a-text)}
.auth-control{position:relative}
.auth-control .lead{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--a-muted);pointer-events:none}
.auth-control .lead svg{width:18px;height:18px}
.auth-control input{display:block;width:100%;height:48px;padding:0 48px 0 44px;border-radius:12px;border:1px solid var(--a-border);background:rgba(15,23,42,.55);color:var(--a-text);font:inherit;font-size:15px;transition:border-color .15s,box-shadow .15s,background .15s}
.auth-control input::placeholder{color:#8390AE}
.auth-control input:hover{border-color:rgba(129,140,248,.5)}
.auth-control input:focus{outline:none;border-color:var(--a-accent);box-shadow:0 0 0 3px rgba(129,140,248,.35);background:rgba(15,23,42,.75)}
.auth-control input[aria-invalid="true"]{border-color:#f87171;box-shadow:0 0 0 3px rgba(248,113,113,.16)}
.auth-control input:read-only{opacity:.7}
.auth-control input:-webkit-autofill{-webkit-text-fill-color:var(--a-text);box-shadow:0 0 0 1000px #101a30 inset}
.auth-toggle{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:38px;height:38px;display:grid;place-items:center;padding:0;border:0;border-radius:9px;background:none;color:var(--a-muted);cursor:pointer;transition:background .15s,color .15s}
.auth-toggle svg{width:19px;height:19px}
.auth-toggle:hover:not(:disabled){color:var(--a-text);background:rgba(129,140,248,.16)}
.auth-fielderr{margin:7px 0 0;font-size:13px;color:#fca5a5}
.auth-banner:empty{display:none}
.auth-banner{margin:0 0 16px}
.auth-msg{display:flex;gap:10px;align-items:flex-start;padding:11px 14px;border-radius:12px;font-size:14px;line-height:1.5;text-align:left}
.auth-msg .ai svg{width:18px;height:18px;margin-top:2px}
.auth-msg.error{background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.4);color:#fecaca}
.auth-msg.ok{background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.4);color:#a7f3d0}
.auth-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;height:48px;padding:0 18px;border-radius:12px;border:1px solid transparent;font:inherit;font-size:15px;font-weight:600;line-height:1;cursor:pointer;transition:transform .15s,filter .15s,box-shadow .15s,background .15s,border-color .15s,opacity .15s}
.auth-btn .ai svg{width:18px;height:18px}
.auth-btn.primary{width:100%;background:linear-gradient(135deg,#818CF8,#6F7DF0);color:#0B1226;box-shadow:0 12px 26px -14px rgba(129,140,248,.95)}
.auth-btn.primary:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.07);box-shadow:0 16px 30px -14px rgba(129,140,248,1)}
.auth-btn.primary:active:not(:disabled){transform:none}
.auth-btn.secondary{background:rgba(15,23,42,.4);border-color:var(--a-border);color:var(--a-text)}
.auth-btn.secondary:hover:not(:disabled){border-color:var(--a-accent);background:rgba(129,140,248,.14)}
.auth-btn:disabled{opacity:.55;cursor:not-allowed}
.auth-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
.auth-spin{width:16px;height:16px;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;animation:authspin .7s linear infinite}
@keyframes authspin{to{transform:rotate(360deg)}}
@media (max-width:760px){
  .auth-top{justify-content:center;text-align:center}
  .auth-brand{font-size:22px}.auth-brand .ai svg{width:28px;height:28px}
  .auth-card{grid-template-columns:1fr;max-width:480px;margin:0 auto}
  .auth-art{display:none}
  .auth-panel{padding:30px 22px;text-align:center}
}
@media (max-width:420px){.auth-actions{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.auth-btn,.auth-control input,.auth-toggle{transition:none}.auth-btn.primary:hover:not(:disabled){transform:none}.auth-spin{animation-duration:1.6s}}
`;
  function injectAuthStyles() { if (!document.getElementById("auth-styles")) document.head.append(el("style", { id: "auth-styles", textContent: AUTH_CSS })); }

  /* Labelled input with a leading icon, inline error text and aria wiring */
  function authField(o) {
    const input = el("input", { id: o.id, type: o.type, placeholder: o.placeholder, required: true, autocomplete: o.autocomplete, spellcheck: false });
    const err = el("p", { className: "auth-fielderr", id: o.id + "-error", hidden: true });
    input.setAttribute("aria-describedby", err.id);
    const control = el("div", { className: "auth-control" }, [icon(o.icon, "lead"), input]);
    const setError = msg => { err.textContent = msg || ""; err.hidden = !msg; input.setAttribute("aria-invalid", msg ? "true" : "false"); };
    input.addEventListener("input", () => setError(""));
    return { root: el("div", { className: "auth-field" }, [el("label", { htmlFor: o.id, textContent: o.label }), control, err]), input, control, setError };
  }

  /* Button with optional icon; shows a spinner while busy */
  function authButton(kind, iconName, text) {
    const b = el("button", { className: "auth-btn " + kind, type: kind === "primary" ? "submit" : "button" });
    b.setLabel = (label, busy) => b.replaceChildren(...(busy ? [el("span", { className: "auth-spin", ariaHidden: "true" })] : iconName ? [icon(iconName)] : []), label);
    b.setLabel(text, false);
    return b;
  }

  /* The whole screen. a = { icon, title, accent, scene: "meeting" | "chart", image (optional photo), heading, benefits: [{ icon, text }] } supplied by each page */
  function authView(a) {
    injectAuthStyles();
    document.body.classList.add("auth-mode");
    const email = authField({ id: "auth-email", label: "Email", type: "email", icon: "mail", placeholder: "Enter your email", autocomplete: "email" });
    const pw = authField({ id: "auth-password", label: "Password (min 6 characters)", type: "password", icon: "lock", placeholder: "Enter your password", autocomplete: "current-password" });
    const toggle = el("button", { className: "auth-toggle", type: "button" }, icon("eye"));
    toggle.setAttribute("aria-label", "Show password"); toggle.setAttribute("aria-pressed", "false");
    toggle.onclick = () => {
      const show = pw.input.type === "password";
      pw.input.type = show ? "text" : "password";
      toggle.setAttribute("aria-pressed", String(show));
      toggle.replaceChildren(icon(show ? "eyeOff" : "eye"));
      pw.input.focus();
    };
    pw.control.append(toggle);

    const banner = el("div", { className: "auth-banner" });
    const showBanner = (kind, text) => banner.replaceChildren(el("div", { className: "auth-msg " + kind, role: kind === "error" ? "alert" : "status" }, [icon(kind === "error" ? "alert" : "check"), el("span", { textContent: text })]));
    const signIn = authButton("primary", null, "Sign in");
    const signUp = authButton("secondary", "userPlus", "Create account");
    const guest = authButton("secondary", "users", "Continue as guest");
    const form = el("form", { className: "auth-form" }, [email.root, pw.root, banner, signIn, el("div", { className: "auth-actions" }, [signUp, guest])]);
    form.noValidate = true;                                  // we show our own inline messages

    let busy = null;
    const setBusy = which => {
      busy = which;
      form.setAttribute("aria-busy", String(!!which));
      [signIn, signUp, guest, toggle].forEach(b => { b.disabled = !!which; });
      email.input.readOnly = pw.input.readOnly = !!which;
      signIn.setLabel(which === "signin" ? "Signing in…" : "Sign in", which === "signin");
      signUp.setLabel(which === "signup" ? "Creating…" : "Create account", which === "signup");
      guest.setLabel(which === "guest" ? "Starting…" : "Continue as guest", which === "guest");
    };
    const validate = () => {
      const e = email.input.value.trim(), p = pw.input.value;
      email.setError(!e ? "Enter your email address." : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? "Enter a valid email address." : "");
      pw.setError(!p ? "Enter your password." : p.length < 6 ? "Password must be at least 6 characters." : "");
      const bad = [email, pw].find(f => f.input.getAttribute("aria-invalid") === "true");
      if (bad) bad.input.focus();
      return !bad;
    };
    const run = async (which, task) => {
      banner.replaceChildren(); setBusy(which);
      try { await task(); } catch (err) { showBanner("error", (err && err.message) || "Something went wrong. Please try again."); }
      finally { setBusy(null); }
    };

    form.onsubmit = ev => {                                  // Sign in (also Enter key)
      ev.preventDefault();
      if (busy || !validate()) return;
      run("signin", async () => {
        const { error } = await App.sb.auth.signInWithPassword({ email: email.input.value.trim(), password: pw.input.value });
        if (error) showBanner("error", error.message);
      });
    };
    signUp.onclick = () => {
      if (busy || !validate()) return;
      run("signup", async () => {
        const { data, error } = await App.sb.auth.signUp({ email: email.input.value.trim(), password: pw.input.value });
        if (error) return showBanner("error", error.message);
        if (!data.session) showBanner("ok", "Account created. Check your email to confirm it, then sign in.");
      });
    };
    guest.onclick = () => {
      if (busy) return;
      run("guest", async () => {
        const { error } = await App.sb.auth.signInAnonymously();
        if (error) showBanner("error", "Guest sign-in is not enabled: " + error.message);
      });
    };

    const art = el("aside", { className: "auth-art" });
    art.setAttribute("aria-label", "About this app");
    art.insertAdjacentHTML("afterbegin", SCENES[a.scene] || SCENES.meeting);   // drawn scene: used until the photo loads, and if it never does
    if (a.image) {                                                              // optional photo, e.g. image: "images/meeting-room.webp"
      const probe = new Image();
      probe.onload = () => { art.style.backgroundImage = "url(" + JSON.stringify(a.image) + ")"; const sc = art.querySelector(".scene"); if (sc) sc.remove(); };
      probe.src = a.image;
    }
    art.append(el("h2", { textContent: a.heading || "Welcome" }),
      el("ul", { className: "auth-benefits" }, (a.benefits || []).map(b => el("li", {}, [icon(b.icon), el("span", { textContent: b.text })]))));

    return el("div", { className: "auth" }, [
      el("div", { className: "auth-top" }, [
        el("h1", { className: "auth-brand" }, [icon(a.icon || "calendar"), el("span", {}, [(a.title || "Sign in") + " ", el("em", { textContent: a.accent || "" })])]),
        el("a", { className: "auth-back", href: "index.html", textContent: "← Back to portfolio" })]),
      el("section", { className: "auth-card" }, [art,
        el("div", { className: "auth-panel" }, [
          el("h2", { textContent: "Sign in to continue" }),
          el("p", { className: "auth-sub", textContent: "Your data is stored securely in the cloud and tied to your account." }),
          form])])]);
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
    document.body.classList.remove("auth-mode");
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
        if (user) { document.body.classList.remove("auth-mode"); gate.replaceChildren(userBar(user)); app.hidden = false; opts.onUser(user); }
        else { gate.replaceChildren(authView(opts.auth || {})); app.hidden = true; if (opts.onSignedOut) opts.onSignedOut(); }
      }, 0);
    });
  };
})();
