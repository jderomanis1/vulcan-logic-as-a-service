export function landingHtml(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Vulcan Logic as a Service</title>
<meta name="description" content="A free API dispensing original Vulcan-register logic pronouncements. Probability of success: 0.0417%.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0900;--surface:#111008;--border:#2a2408;
  --amber:#d4860a;--amber-dim:#8a5806;--amber-bright:#f0a020;
  --cyan:#00b4c8;--cyan-dim:#006878;
  --text:#c8a050;--text-dim:#6a5028;--text-faint:#3a2c14;
  --font:ui-monospace,'Cascadia Code','Fira Code','Source Code Pro',monospace;
  --radius:2px;
}
body{background:var(--bg);color:var(--text);font-family:var(--font);font-size:15px;line-height:1.6;min-height:100dvh;display:flex;flex-direction:column}
a{color:var(--cyan);text-decoration:none}a:hover,a:focus{color:var(--amber-bright);text-decoration:underline}
:focus-visible{outline:2px solid var(--amber-bright);outline-offset:3px}
header{border-bottom:1px solid var(--border);padding:1.5rem 1rem;text-align:center}
.logo{font-size:clamp(1.4rem,5vw,2.4rem);font-weight:700;color:var(--amber-bright);letter-spacing:.04em;text-shadow:0 0 18px var(--amber-dim)}
.logo span{color:var(--cyan);text-shadow:0 0 14px var(--cyan-dim)}
.tagline{margin:.4rem 0 0;color:var(--text-dim);font-size:.85rem;letter-spacing:.08em;text-transform:uppercase}
main{flex:1;max-width:800px;width:100%;margin:0 auto;padding:2rem 1rem}
section{margin-bottom:2.5rem}
.section-label{font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:var(--text-dim);margin-bottom:.8rem;padding-bottom:.3rem;border-bottom:1px solid var(--border)}

/* hero console */
.console-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem;position:relative}
.console-box::before{content:'■ LOGIC TERMINAL';position:absolute;top:-1px;left:1rem;font-size:.65rem;letter-spacing:.14em;color:var(--amber-dim);background:var(--surface);padding:0 .4rem;transform:translateY(-50%)}
#output{min-height:3.5rem;color:var(--amber-bright);font-size:1.05rem;white-space:pre-wrap;word-break:break-word}
#output.empty{color:var(--text-faint);font-style:italic}
#rebuttal{margin-top:.8rem;color:var(--cyan);font-size:.95rem;white-space:pre-wrap;word-break:break-word;display:none}
.cursor{display:inline-block;width:.6ch;height:1.1em;background:var(--amber-bright);vertical-align:text-bottom;animation:blink 1s step-end infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
.btn-row{display:flex;gap:.7rem;margin-top:1.2rem;flex-wrap:wrap;align-items:center}
button{font-family:var(--font);font-size:.85rem;cursor:pointer;border-radius:var(--radius);transition:background .15s,color .15s}
#consult-btn{background:var(--amber);color:#000;border:none;padding:.55rem 1.2rem;font-weight:700;letter-spacing:.06em}
#consult-btn:hover{background:var(--amber-bright)}
#consult-btn:disabled{opacity:.5;cursor:wait}
.toggle-wrap{display:flex;align-items:center;gap:.5rem;color:var(--text-dim);font-size:.8rem;letter-spacing:.08em;user-select:none}
#mccoy-toggle{appearance:none;width:2.6rem;height:1.3rem;background:var(--text-faint);border:1px solid var(--border);border-radius:1rem;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0}
#mccoy-toggle::after{content:'';position:absolute;width:1rem;height:1rem;border-radius:50%;background:var(--text-dim);top:.1rem;left:.1rem;transition:left .2s,background .2s}
#mccoy-toggle:checked{background:var(--cyan-dim)}
#mccoy-toggle:checked::after{left:1.4rem;background:var(--cyan)}

/* category chips */
.chips{display:flex;flex-wrap:wrap;gap:.5rem}
.chip{background:transparent;border:1px solid var(--amber-dim);color:var(--amber-dim);padding:.3rem .75rem;font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
.chip:hover,.chip:focus{border-color:var(--amber-bright);color:var(--amber-bright);background:var(--text-faint)}
.chip.active{background:var(--amber-dim);color:#000;border-color:var(--amber-dim)}

/* curl examples */
.curl-grid{display:grid;gap:.7rem}
.curl-block{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);display:flex;align-items:stretch;overflow:hidden}
.curl-block code{flex:1;padding:.65rem .8rem;font-size:.78rem;color:var(--text-dim);white-space:nowrap;overflow-x:auto;scrollbar-width:thin}
.copy-btn{background:transparent;border:none;border-left:1px solid var(--border);color:var(--text-dim);padding:.5rem .75rem;font-size:.7rem;letter-spacing:.06em;cursor:pointer;flex-shrink:0;white-space:nowrap}
.copy-btn:hover{color:var(--amber-bright)}
.copy-btn.copied{color:var(--cyan)}

footer{border-top:1px solid var(--border);padding:1rem;text-align:center;color:var(--text-faint);font-size:.72rem;line-height:1.9;letter-spacing:.04em}
footer a{color:var(--text-dim)}footer a:hover{color:var(--amber)}

@media(max-width:480px){
  .curl-block code{font-size:.7rem}
  #consult-btn{width:100%}
}
@media(prefers-reduced-motion:reduce){
  .cursor{animation:none}
  *{transition:none!important}
}
</style>
</head>
<body>
<header>
  <div class="logo">VULCAN LOGIC <span>as a Service</span></div>
  <p class="tagline">A free API dispensing original Vulcan-register logic pronouncements &mdash; probability of success: 0.0417%</p>
</header>
<main>

  <section aria-label="Logic terminal">
    <div class="section-label">Logic Terminal</div>
    <div class="console-box" role="region" aria-live="polite" aria-label="Logic output">
      <div id="output" class="empty">Awaiting query&hellip;</div>
      <div id="rebuttal" aria-label="McCoy rebuttal"></div>
    </div>
    <div class="btn-row">
      <button id="consult-btn" type="button">&#9654; CONSULT LOGIC</button>
      <label class="toggle-wrap">
        <input type="checkbox" id="mccoy-toggle" role="switch" aria-label="Invoke McCoy mode">
        INVOKE McCOY
      </label>
    </div>
  </section>

  <section aria-label="Category filter">
    <div class="section-label">Filter by Category</div>
    <div class="chips" role="group" aria-label="Category chips">
      <button class="chip" data-cat="verdict" type="button">Verdict</button>
      <button class="chip" data-cat="probability" type="button">Probability</button>
      <button class="chip" data-cat="fascinating" type="button">Fascinating</button>
      <button class="chip" data-cat="emotion" type="button">Emotion</button>
      <button class="chip" data-cat="advice" type="button">Advice</button>
    </div>
  </section>

  <section aria-label="API examples">
    <div class="section-label">API &mdash; curl Examples</div>
    <div class="curl-grid">
      <div class="curl-block"><code>curl ${origin}/logic</code><button class="copy-btn" type="button" data-copy="curl ${origin}/logic">COPY</button></div>
      <div class="curl-block"><code>curl '${origin}/logic?category=advice'</code><button class="copy-btn" type="button" data-copy="curl '${origin}/logic?category=advice'">COPY</button></div>
      <div class="curl-block"><code>curl '${origin}/assess?claim=my+sprint+will+finish+on+time'</code><button class="copy-btn" type="button" data-copy="curl '${origin}/assess?claim=my+sprint+will+finish+on+time'">COPY</button></div>
      <div class="curl-block"><code>curl '${origin}/logic?mode=mccoy'</code><button class="copy-btn" type="button" data-copy="curl '${origin}/logic?mode=mccoy'">COPY</button></div>
    </div>
  </section>

</main>
<footer>
  <p>MIT License &bull; <a href="https://github.com/jderomanis1/vulcan-logic-as-a-service" rel="noopener">GitHub</a></p>
  <p>This is an independent fan project. Not affiliated with CBS Studios, Paramount, or the Star Trek franchise.<br>
  All phrases are original writing in the Vulcan register.</p>
</footer>
<script>
(function(){
  var origin='${origin}';
  var btn=document.getElementById('consult-btn');
  var out=document.getElementById('output');
  var reb=document.getElementById('rebuttal');
  var toggle=document.getElementById('mccoy-toggle');
  var chips=document.querySelectorAll('.chip');
  var activeChip=null;
  var reduced=window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  chips.forEach(function(c){
    c.addEventListener('click',function(){
      if(activeChip===c.dataset.cat){
        activeChip=null;
        chips.forEach(function(x){x.classList.remove('active')});
      } else {
        activeChip=c.dataset.cat;
        chips.forEach(function(x){x.classList.toggle('active',x===c)});
      }
    });
  });

  document.querySelectorAll('.copy-btn').forEach(function(b){
    b.addEventListener('click',function(){
      var txt=b.dataset.copy;
      navigator.clipboard.writeText(txt).then(function(){
        var prev=b.textContent;
        b.textContent='COPIED';b.classList.add('copied');
        setTimeout(function(){b.textContent=prev;b.classList.remove('copied')},1500);
      });
    });
  });

  function typewrite(el,txt,done){
    if(reduced){el.textContent=txt;if(done)done();return}
    el.textContent='';var i=0;
    var t=setInterval(function(){
      el.textContent+=txt[i++];
      if(i>=txt.length){clearInterval(t);if(done)done()}
    },18);
  }

  btn.addEventListener('click',function(){
    btn.disabled=true;
    out.classList.remove('empty');
    out.innerHTML='<span class="cursor"></span>';
    reb.style.display='none';reb.textContent='';
    var mccoy=toggle.checked;
    var url=origin+'/logic'+(activeChip?'?category='+activeChip:'')+(mccoy?(activeChip?'&':'?')+'mode=mccoy':'');
    fetch(url).then(function(r){return r.json()}).then(function(d){
      typewrite(out,d.phrase,function(){
        btn.disabled=false;
        if(mccoy&&d.rebuttal){
          var delay=reduced?0:900;
          setTimeout(function(){
            reb.style.display='block';
            typewrite(reb,d.rebuttal);
          },delay);
        }
      });
    }).catch(function(){
      out.textContent='[TRANSMISSION LOST]';btn.disabled=false;
    });
  });
})();
</script>
</body>
</html>`;
}
