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
  var mq=window.matchMedia('(max-width:900px)');
  var vh=window.innerHeight; // fixed until the width changes, so the phone address bar can't make it jump
  function frame(){
    var r=sec.getBoundingClientRect(), total=sec.offsetHeight-vh;
    var p=reduce?1:Math.min(1,Math.max(0,-r.top/Math.max(1,total)));
    var spread=Math.min(1,p/0.35);
    var gap=1+(mq.matches?44:90)*spread;
    var cur=Math.min(3,Math.floor(p*4.0001));
    var n=layers.length-1;
    layers.forEach(function(l,i){
      l.style.transform='translateZ('+((n-i)*gap)+'px)';
      l.style.opacity = (i===cur) ? 1 : (i<cur ? (1-0.93*spread) : (1-0.6*spread)).toFixed(3);
      l.classList.toggle('cur', i===cur && spread>0.5);
    });
    if(cur!==last){
      lis.forEach(function(li,i){li.classList.toggle('on',i===cur);});
      if(cap){ var d=lis[cur].querySelector('p'); cap.textContent=d?d.textContent:''; }
      last=cur;
    }
    stack.style.setProperty('--s', spread.toFixed(3));
    stack.style.transform='rotateX('+(44-tiltY)+'deg) rotateZ('+(-26+tiltX)+'deg)';
  }
  lis.forEach(function(li,i){
    li.setAttribute('tabindex','0'); li.setAttribute('role','button');
    function go(){
      var total=sec.offsetHeight-window.innerHeight;
      var y=sec.getBoundingClientRect().top+window.pageYOffset+total*((i+0.5)/4);
      window.scrollTo({top:y,behavior:reduce?'auto':'smooth'});
    }
    li.addEventListener('click',go);
    li.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } });
  });
  if(fine && !reduce){
    sec.addEventListener('pointermove',function(ev){ tiltX=(ev.clientX/window.innerWidth-.5)*8; tiltY=(ev.clientY/window.innerHeight-.5)*6; frame(); });
  }
  var ticking=false;
  window.addEventListener('scroll',function(){ if(!ticking){ ticking=true; requestAnimationFrame(function(){ frame(); ticking=false; }); } },{passive:true});
  var lastW=window.innerWidth;
  window.addEventListener('resize',function(){ if(window.innerWidth!==lastW){ lastW=window.innerWidth; vh=window.innerHeight; frame(); } });
  frame();
})();
