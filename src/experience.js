// The Wallet experience, end to end: personalise, install, live, disrupted.
export function experienceCSS() { return `
.stage{max-width:1080px;margin:0 auto;padding:0 22px}
.step{border-top:1px solid var(--rule);padding:30px 0}
.step .no{font-size:10.5px;letter-spacing:.16em;color:var(--ink-3)}
.step h2{font-size:clamp(26px,4.4vw,40px);letter-spacing:-.03em;font-weight:700;margin:9px 0 8px;line-height:1.1}
.step p.k{font-size:15.5px;color:var(--ink-2);max-width:34em;line-height:1.55}

.picks{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin-top:20px}
.pick{background:var(--card);border:1px solid var(--rule);border-radius:3px;padding:13px 14px}
.pick label{display:block;font-size:9.5px;letter-spacing:.15em;color:var(--ink-3);margin-bottom:7px}
.pick select{width:100%;border:none;background:transparent;font-size:16px;color:var(--ink);
  font-family:inherit;-webkit-appearance:none;appearance:none;outline:none;cursor:pointer;
  background-image:linear-gradient(45deg,transparent 50%,var(--ink-3) 50%),linear-gradient(135deg,var(--ink-3) 50%,transparent 50%);
  background-position:calc(100% - 9px) 9px,calc(100% - 4px) 9px;background-size:5px 5px;background-repeat:no-repeat;padding-right:20px}

.addwrap{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin-top:22px}
.addbtn{display:inline-flex;align-items:center;gap:10px;background:#000;color:#fff;border:none;
  border-radius:9px;padding:12px 20px;font-family:inherit;font-size:15px;cursor:pointer;
  transition:transform .14s ease,opacity .2s}
.addbtn:active{transform:scale(.97)}
.addbtn .apl{font-size:19px;line-height:1;margin-top:-2px}
.addbtn .tx{text-align:left;line-height:1.12}
.addbtn .tx b{display:block;font-weight:600;font-size:15px}
.addbtn .tx span{font-size:10px;opacity:.72;letter-spacing:.02em}
.hint{font-size:12.5px;color:var(--ink-3)}

.phonewrap{display:flex;gap:34px;flex-wrap:wrap;align-items:flex-start;margin-top:24px}
.phone{width:328px;flex:0 0 328px;background:#0a0c10;border-radius:38px;padding:13px;
  border:1px solid #23262c;position:relative;overflow:hidden}
.notch{width:96px;height:22px;background:#0a0c10;border-radius:0 0 13px 13px;margin:0 auto 8px}
.lock{border-radius:26px;padding:20px 14px 22px;min-height:520px;position:relative;
  background:linear-gradient(178deg,#16202e 0%,#22303f 42%,#3c4a53 100%)}
.lock .clock{text-align:center;color:#fff;padding:10px 0 22px}
.lock .clock .t{font-size:52px;font-weight:250;letter-spacing:-2px;line-height:1}
.lock .clock .d{font-size:12.5px;opacity:.82;margin-top:5px}

.notif{background:rgba(255,255,255,.17);backdrop-filter:blur(18px);border-radius:15px;
  padding:11px 12px;margin-bottom:11px;color:#fff;
  opacity:0;transform:translateY(-9px);transition:opacity .45s ease,transform .45s ease}
.notif.in{opacity:1;transform:none}
.notif .hd{display:flex;align-items:center;gap:7px;font-size:10px;letter-spacing:.06em;opacity:.86}
.notif .hd .ic{width:14px;height:14px;border-radius:3.5px;background:#f6f3ec;color:#1b2a41;
  font-size:8px;font-weight:800;display:flex;align-items:center;justify-content:center}
.notif .ti{font-size:13.5px;font-weight:600;margin-top:5px;line-height:1.28}
.notif .bo{font-size:12.5px;opacity:.88;margin-top:2px;line-height:1.35}

/* the pass itself, at Wallet proportions */
.pass{width:100%;border-radius:13px;background:var(--navy);color:#f6f3ec;overflow:hidden;
  box-shadow:0 12px 34px rgba(0,0,0,.34);transition:transform .5s cubic-bezier(.3,.8,.3,1)}
.pass.flip{transform:rotateY(180deg)}
.pass .top{display:flex;align-items:flex-start;padding:13px 14px 0}
.pass .top .lg{font-size:11px;letter-spacing:.15em;color:#8fa3bb;font-weight:600}
.pass .top .hf{margin-left:auto;text-align:right}
.pass .top .hf .k{font-size:8px;letter-spacing:.15em;color:#8fa3bb}
.pass .top .hf .v{font-size:19px;font-weight:660;margin-top:2px;letter-spacing:-.03em}
.pass .prim{padding:14px 14px 13px}
.pass .prim .k{font-size:8px;letter-spacing:.15em;color:#8fa3bb}
.pass .prim .v{font-size:22px;font-weight:660;letter-spacing:-.04em;margin-top:4px;line-height:1.14}
.pass .fields{display:flex;padding:0 14px 13px;gap:14px}
.pass .fields div{flex:1;min-width:0}
.pass .fields .k{font-size:8px;letter-spacing:.14em;color:#8fa3bb}
.pass .fields .v{font-size:13.5px;margin-top:3px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pass .strip{padding:9px 14px;font-size:12px;background:#16233a;border-top:1px solid #2b3d57;
  border-bottom:1px solid #2b3d57;display:flex;align-items:center;gap:8px}
.pass .strip .dot{width:7px;height:7px;border-radius:50%;background:#7fd6a0;flex:0 0 7px}
.pass.warn .strip{background:#3a2f18;border-color:#5a4a22}
.pass.warn .strip .dot{background:#f2c14e}
.pass.bad .strip{background:#3d2020;border-color:#5e2f2f}
.pass.bad .strip .dot{background:#e08a7a}
.pass .qr{background:#f6f3ec;margin:13px 14px 14px;border-radius:7px;padding:9px;text-align:center}
.pass .back{padding:4px 0 8px}
.pass .back .r{padding:10px 14px;border-bottom:1px solid #2b3d57}
.pass .back .r:last-child{border-bottom:none}
.pass .back .k{font-size:8px;letter-spacing:.15em;color:#8fa3bb}
.pass .back .v{font-size:12.8px;margin-top:4px;line-height:1.45;color:#e7ebf1}

.ctl{flex:1;min-width:250px}
.ctl .hd{font-size:10.5px;letter-spacing:.15em;color:var(--ink-3);margin-bottom:11px}
.states{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:22px}
.stbtn{font-size:12.5px;background:var(--card);border:1px solid var(--rule);color:var(--ink-2);
  padding:7px 12px;border-radius:15px;cursor:pointer;font-family:inherit;transition:all .16s}
.stbtn.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.sim{background:var(--brick);color:#fff;border:none;border-radius:9px;padding:13px 18px;
  font-family:inherit;font-size:14.5px;cursor:pointer;width:100%;transition:transform .14s,opacity .2s}
.sim:active{transform:scale(.985)}
.sim:disabled{opacity:.45;cursor:default}
.log{margin-top:16px;border-top:1px solid var(--rule)}
.log .e{display:flex;gap:13px;padding:9px 0;border-bottom:1px solid var(--rule);
  opacity:0;transform:translateX(-6px);transition:opacity .35s,transform .35s}
.log .e.in{opacity:1;transform:none}
.log .e .t{font-size:11px;color:var(--ink-3);width:64px;flex:0 0 64px}
.log .e .m{font-size:13.5px;line-height:1.4}
.flipbtn{background:none;border:none;color:var(--ink-2);font-family:inherit;font-size:13px;
  cursor:pointer;padding:0;border-bottom:1px solid var(--rule);margin-top:14px}
`; }
