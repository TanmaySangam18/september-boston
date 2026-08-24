// September in Boston — the design system.
// Palette is late summer turning into a school year. Deliberately not autumn orange.
export const TOKENS = `
:root{
  --paper:#f6f3ec;        /* orientation packet */
  --paper-2:#efebe1;      /* folded map */
  --ink:#1c1e22;          /* graphite */
  --ink-2:#4a4e55;
  --ink-3:#84888f;
  --rule:#ddd7ca;
  --brick:#9a4a37;        /* Boston brick, used sparingly */
  --navy:#1b2a41;         /* deep navy */
  --denim:#3e5c76;        /* transit blue */
  --green:#4f6f52;        /* muted campus green */
  --highlight:#f2e06b;    /* highlighter, not orange */
  --card:#fffdf8;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{-webkit-text-size-adjust:100%}
body{background:var(--paper);color:var(--ink);
  font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;
  line-height:1.5;font-size:16px}
a{color:inherit;text-decoration:none}
.mono{font-family:ui-monospace,SFMono-Regular,"SF Mono",Menlo,monospace;
  font-variant-numeric:tabular-nums;letter-spacing:.02em}

/* transit-signage nav — a directory strip, not a website nav */
.strip{border-bottom:1px solid var(--rule);background:var(--paper);
  position:sticky;top:0;z-index:20}
.strip .in{max-width:1080px;margin:0 auto;padding:0 22px;display:flex;align-items:stretch;
  overflow-x:auto;scrollbar-width:none}
.strip .in::-webkit-scrollbar{display:none}
.strip a{font-size:11px;letter-spacing:.16em;color:var(--ink-3);padding:15px 0;margin-right:26px;
  white-space:nowrap;border-bottom:2px solid transparent;transition:color .18s,border-color .18s}
.strip a.on{color:var(--ink);border-bottom-color:var(--brick)}
.strip a:hover{color:var(--ink)}
.bullet{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:7px;
  vertical-align:1px;background:var(--denim)}

.wrap{max-width:1080px;margin:0 auto;padding:0 22px}
.rule{height:1px;background:var(--rule);margin:0}

/* metadata strip — timestamps, coordinates, route numbers */
.meta{display:flex;flex-wrap:wrap;gap:0 26px;padding:13px 0;font-size:10.5px;
  letter-spacing:.13em;color:var(--ink-3);border-bottom:1px solid var(--rule)}

h1.display{font-size:clamp(64px,15vw,168px);line-height:.86;letter-spacing:-.055em;
  font-weight:760;margin:38px 0 0}
.sub{font-size:clamp(17px,2.4vw,23px);color:var(--ink-2);max-width:22em;
  margin:20px 0 0;line-height:1.42}

.sh{font-size:10.5px;letter-spacing:.17em;color:var(--ink-3);
  padding:34px 0 13px;display:flex;align-items:baseline}
.sh .c{margin-left:auto;letter-spacing:.04em;text-transform:none;font-size:11.5px}

/* a moment: timestamp + one observed line */
.moments{border-top:1px solid var(--rule)}
.moment{display:flex;gap:20px;padding:11px 0;border-bottom:1px solid var(--rule);align-items:baseline}
.moment .t{font-size:11.5px;color:var(--ink-3);width:78px;flex:0 0 78px}
.moment .l{font-size:16px;color:var(--ink)}

/* timeline — the month as a platform you walk down */
.tl{border-left:2px solid var(--rule);margin:8px 0 0 5px;padding-left:0}
.tl .stop{position:relative;padding:0 0 26px 26px}
.tl .stop:before{content:"";position:absolute;left:-7px;top:5px;width:12px;height:12px;
  border-radius:50%;background:var(--paper);border:2px solid var(--denim)}
.tl .stop.now:before{background:var(--brick);border-color:var(--brick)}
.tl .d{font-size:11px;letter-spacing:.14em;color:var(--ink-3)}
.tl .h{font-size:20px;font-weight:640;letter-spacing:-.02em;margin-top:3px}
.tl .p{font-size:14.5px;color:var(--ink-2);margin-top:5px;max-width:34em;line-height:1.5}

/* artifacts */
.grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
.art{background:var(--card);border:1px solid var(--rule);border-radius:3px;padding:15px 16px 17px;
  transition:transform .16s ease,box-shadow .16s ease}
.art:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(28,30,34,.07)}
.art .k{font-size:9.5px;letter-spacing:.15em;color:var(--ink-3)}
.art .n{font-size:17px;font-weight:600;margin-top:7px;line-height:1.28;letter-spacing:-.01em}
.art .s{font-size:13.5px;color:var(--ink-2);margin-top:6px;line-height:1.5}
.art .f{font-size:10px;letter-spacing:.12em;color:var(--green);margin-top:10px}

/* flyer — campus bulletin board */
.flyer{background:var(--card);border:1px solid var(--rule);padding:15px 16px 16px;
  border-radius:2px;position:relative}
.flyer:before{content:"";position:absolute;top:-1px;left:16px;right:16px;height:3px;background:var(--highlight)}
.flyer .when{font-size:10.5px;letter-spacing:.13em;color:var(--brick)}
.flyer .t{font-size:16px;font-weight:600;margin-top:8px;line-height:1.3}
.flyer .w{font-size:13px;color:var(--ink-2);margin-top:5px}
.flyer .open{font-size:9.5px;letter-spacing:.12em;color:var(--green);margin-top:9px}

/* label — moving box inventory */
.label{background:var(--paper-2);border:1px dashed var(--ink-3);padding:14px 15px;border-radius:2px}
.label .k{font-size:9.5px;letter-spacing:.15em;color:var(--ink-3)}
.label .v{font-size:15px;margin-top:5px;line-height:1.45}

/* schedule — printed class schedule */
.sched{background:var(--card);border:1px solid var(--rule)}
.sched .r{display:flex;gap:16px;padding:12px 15px;border-bottom:1px solid var(--rule);align-items:baseline}
.sched .r:last-child{border-bottom:none}
.sched .r .w{font-size:11.5px;color:var(--ink-3);width:74px;flex:0 0 74px}
.sched .r .b{flex:1}
.sched .r .t{font-size:15px;line-height:1.35}
.sched .r .s{font-size:12.5px;color:var(--ink-2);margin-top:2px}

/* id card */
.idc{background:var(--navy);color:#eef1f5;border-radius:8px;padding:16px 17px 18px}
.idc .k{font-size:9px;letter-spacing:.16em;color:#8fa3bb}
.idc .n{font-size:19px;font-weight:640;margin-top:6px;letter-spacing:-.01em}
.idc .row{display:flex;gap:18px;margin-top:14px;border-top:1px solid #2e4159;padding-top:12px}
.idc .row div .k{font-size:8.5px}
.idc .row div .v{font-size:14px;margin-top:3px}

/* first-visit gate */
.gate{position:fixed;inset:0;z-index:100;background:var(--paper);display:flex;
  align-items:center;justify-content:center;padding:26px;
  opacity:0;pointer-events:none;transition:opacity .32s ease}
.gate.on{opacity:1;pointer-events:auto}
.gate .in{max-width:470px;width:100%}
.gate .tag{font-size:10.5px;letter-spacing:.17em;color:var(--ink-3);margin-bottom:16px}
.gate h2{font-size:clamp(38px,8vw,62px);line-height:.94;letter-spacing:-.045em;font-weight:760;margin-bottom:16px}
.gate p{font-size:16px;color:var(--ink-2);line-height:1.55;margin-bottom:20px}
.gate form{display:flex;gap:9px;flex-wrap:wrap}
.gate input{flex:1;min-width:210px;border:1px solid var(--rule);background:var(--card);
  border-radius:3px;padding:14px 14px;font-size:16px;font-family:inherit;color:var(--ink);outline:none}
.gate input:focus{border-color:var(--ink)}
.gate button{background:var(--ink);color:var(--paper);border:none;border-radius:3px;
  padding:14px 22px;font-size:15px;font-family:inherit;cursor:pointer}
.gate .promise{font-size:12.5px;color:var(--ink-3);line-height:1.65;margin-top:16px;
  border-top:1px solid var(--rule);padding-top:14px}
.gate .skip{display:inline-block;margin-top:16px;font-size:13px;color:var(--ink-3);
  border-bottom:1px solid var(--rule);cursor:pointer;background:none;border-top:none;
  border-left:none;border-right:none;font-family:inherit;padding:0 0 2px}
.gate .ok{display:none;font-size:16px;color:var(--green);margin-top:6px}

.cap-box{background:var(--card);border:1px solid var(--rule);border-radius:3px;padding:17px 18px 18px}
.cap-l{font-size:15px;color:var(--ink-2);line-height:1.5;max-width:32em;margin-bottom:13px}
.cap-f{display:flex;gap:9px;flex-wrap:wrap}
.cap-f input{flex:1;min-width:200px;border:1px solid var(--rule);background:var(--paper);
  border-radius:3px;padding:12px 13px;font-size:16px;font-family:inherit;color:var(--ink);outline:none}
.cap-f input:focus{border-color:var(--ink-3)}
.cap-f button{background:var(--ink);color:var(--paper);border:none;border-radius:3px;
  padding:12px 20px;font-size:15px;font-family:inherit;cursor:pointer}
.cap-f button:active{transform:scale(.98)}
.cap-ok{display:none;font-size:15px;color:var(--green)}

.ft{border-top:1px solid var(--rule);margin-top:44px;padding:20px 0 60px;
  font-size:11.5px;color:var(--ink-3);line-height:1.85}
`;
