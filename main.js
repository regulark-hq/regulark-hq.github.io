(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal: things appear one after another as they come into view.
  // Inside a [data-g] group, each [data-r] gets a growing delay.
  document.querySelectorAll('[data-g]').forEach(function(g){
    g.querySelectorAll('[data-r]').forEach(function(e,i){ e.style.setProperty('--i', i); });
  });
  var items = document.querySelectorAll('[data-r]');
  function show(e){ e.classList.add('in'); }
  if (reduce || !('IntersectionObserver' in window)) { items.forEach(show); }
  else {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ show(e.target); io.unobserve(e.target); } });
    },(window.matchMedia('(max-width:640px)').matches ? {threshold:0, rootMargin:'0px 0px 8% 0px'} : {threshold:.12, rootMargin:'0px 0px -6% 0px'}));
    items.forEach(function(e){ io.observe(e); });
  }

  // Hero window: the review plays out one change at a time, then it is approved and recorded.
  var demo = document.querySelector('.demo');
  if (demo) {
    var steps = [].slice.call(demo.querySelectorAll('[data-step]'));
    var state = demo.querySelector('.state');
    function run(n){
      steps.forEach(function(s){ if(+s.getAttribute('data-step') <= n) s.classList.add('on'); });
      if (n >= 4) { demo.classList.add('s5'); if(state) state.textContent = 'Approved'; }
    }
    if (reduce) { run(4); }
    else {
      var t0 = 1700, gap = 1150;
      [1,2,3,4].forEach(function(n,i){ setTimeout(function(){ run(n); }, t0 + gap*i); });
    }
  }

  // Modules strip: click a module to select it (turns gold) and show what it covers.
  var mods=[].slice.call(document.querySelectorAll('.mod')), descs=[].slice.call(document.querySelectorAll('.moddesc p'));
  mods.forEach(function(m){
    m.addEventListener('click',function(){
      var i=m.getAttribute('data-i');
      mods.forEach(function(x){ var on=x===m; x.classList.toggle('on',on); x.setAttribute('aria-pressed',on?'true':'false'); });
      descs.forEach(function(d){ d.classList.toggle('on', d.getAttribute('data-i')===i); });
    });
  });

  // Exploded view: the four sheets separate as you scroll; the current one is outlined.
  var sec=document.querySelector('.explode'); if(!sec) return;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var stack=sec.querySelector('.stack'), layers=[].slice.call(sec.querySelectorAll('.layer')), lis=[].slice.call(sec.querySelectorAll('.steps3d li'));
  var tiltX=0, tiltY=0, last=-1, cap=sec.querySelector('.stepcap');
  var pick=0, count=sec.querySelector('.sn-count b'), timer=null, stopped=false;
  var mq=window.matchMedia('(max-width:900px)');
  var vh=window.innerHeight; // fixed until the width changes, so the phone address bar can't make it jump
  var k=1; // laptop: shrink the stack so it fits a short window
  function fit(){ k = mq.matches ? 1 : Math.max(.5, Math.min(1, (vh-100)/540)); }
  fit();
  function frame(){
    var spread, cur;
    if(mq.matches){ spread=1; cur=pick; }  // phone: steps change by tap / swipe / arrows
    else {
      var r=sec.getBoundingClientRect(), total=sec.offsetHeight-vh;
      var p=reduce?1:Math.min(1,Math.max(0,-r.top/Math.max(1,total)));
      spread=Math.min(1,p/0.35); cur=Math.min(3,Math.floor(p*4.0001));
    }
    var gap=1+(mq.matches?44:90)*spread;
    var n=layers.length-1;
    layers.forEach(function(l,i){
      l.style.transform='translateZ('+((n-i)*gap)+'px)';
      l.style.opacity = (i===cur) ? 1 : (i<cur ? (1-0.93*spread) : (1-0.6*spread)).toFixed(3);
      l.classList.toggle('cur', i===cur && spread>0.5);
    });
    if(cur!==last){
      lis.forEach(function(li,i){li.classList.toggle('on',i===cur);});
      if(cap){ var d=lis[cur].querySelector('p'); cap.textContent=d?d.textContent:''; }
      if(count) count.textContent=cur+1;
      last=cur;
    }
    stack.style.setProperty('--s', spread.toFixed(3));
    stack.style.transform='scale3d('+k+','+k+','+k+') rotateX('+(44-tiltY)+'deg) rotateZ('+(-26+tiltX)+'deg)';
  }
  lis.forEach(function(li,i){
    li.setAttribute('tabindex','0'); li.setAttribute('role','button');
    function go(){
      if(mq.matches){ stop(); goStep(i); return; }
      var total=sec.offsetHeight-window.innerHeight;
      var y=sec.getBoundingClientRect().top+window.pageYOffset+total*((i+0.5)/4);
      window.scrollTo({top:y,behavior:reduce?'auto':'smooth'});
    }
    li.addEventListener('click',go);
    li.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } });
  });
  // phone controls
  function goStep(i){ pick=(i+4)%4; frame(); }
  function stop(){ stopped=true; if(timer){ clearInterval(timer); timer=null; } }
  var prev=sec.querySelector('.sn-prev'), next=sec.querySelector('.sn-next');
  if(prev) prev.addEventListener('click',function(){ stop(); goStep(pick-1); });
  if(next) next.addEventListener('click',function(){ stop(); goStep(pick+1); });
  var stage=sec.querySelector('.stage'), sx=null, sy=0;
  stage.addEventListener('touchstart',function(e){ sx=e.touches[0].clientX; sy=e.touches[0].clientY; },{passive:true});
  stage.addEventListener('touchend',function(e){
    if(sx===null || !mq.matches) return;
    var dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy; sx=null;
    if(Math.abs(dx)>40 && Math.abs(dx)>Math.abs(dy)){ stop(); goStep(pick+(dx<0?1:-1)); }
  },{passive:true});
  stage.addEventListener('click',function(){ if(mq.matches){ stop(); goStep(pick+1); } });
  // auto-play on phone while the section is on screen, until the visitor touches it
  if(!reduce && 'IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting && mq.matches && !stopped && !timer){ timer=setInterval(function(){ goStep(pick+1); },3800); }
        else if(!e.isIntersecting && timer){ clearInterval(timer); timer=null; }
      });
    },{threshold:.5}).observe(stage);
  }
  if(fine && !reduce){
    sec.addEventListener('pointermove',function(ev){ tiltX=(ev.clientX/window.innerWidth-.5)*8; tiltY=(ev.clientY/window.innerHeight-.5)*6; frame(); });
  }
  var ticking=false;
  window.addEventListener('scroll',function(){ if(!ticking){ ticking=true; requestAnimationFrame(function(){ frame(); ticking=false; }); } },{passive:true});
  var lastW=window.innerWidth;
  window.addEventListener('resize',function(){
    var w=window.innerWidth, h=window.innerHeight;
    if(w!==lastW || (!mq.matches && h!==vh)){ lastW=w; vh=h; fit(); frame(); }
  });
  frame();
})();
