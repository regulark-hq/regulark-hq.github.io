(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;

  // Sections rise once as they come into view.
  var rise = document.querySelectorAll('.rise');
  if (reduce || !('IntersectionObserver' in window)) { rise.forEach(function(e){e.classList.add('in');}); }
  else {
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }); },{threshold:.15});
    rise.forEach(function(e){ io.observe(e); });
  }

  // Tiles tilt toward the cursor.
  if (fine && !reduce) {
    document.querySelectorAll('.tile').forEach(function(t){
      t.addEventListener('pointermove', function(ev){
        var r=t.getBoundingClientRect(), x=(ev.clientX-r.left)/r.width, y=(ev.clientY-r.top)/r.height;
        t.style.transform='perspective(1000px) rotateX('+((.5-y)*5).toFixed(2)+'deg) rotateY('+((x-.5)*6).toFixed(2)+'deg) translateY(-2px)';
        t.style.setProperty('--mx',(x*100)+'%'); t.style.setProperty('--my',(y*100)+'%');
      });
      t.addEventListener('pointerleave', function(){ t.style.transform=''; });
    });
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

  // Exploded view: the four layers separate as you scroll.
  var sec=document.querySelector('.explode'); if(!sec) return;
  var stack=sec.querySelector('.stack'), layers=[].slice.call(sec.querySelectorAll('.layer')), items=[].slice.call(sec.querySelectorAll('.steps3d li'));
  var tiltX=0, tiltY=0, last=-1;
  var cap=sec.querySelector('.stepcap');
  var mq=window.matchMedia('(max-width:900px)');
  var vh=window.innerHeight; // fixed until the width changes, so the phone address bar can't make it jump
  function frame(){
    var r=sec.getBoundingClientRect(), total=sec.offsetHeight-vh;
    var p=reduce?1:Math.min(1,Math.max(0,-r.top/Math.max(1,total)));
    var spread=Math.min(1,p/0.35);
    var gap=1+(mq.matches?44:85)*spread;
    var cur=Math.min(3,Math.floor(p*4.0001));
    var n=layers.length-1;
    layers.forEach(function(l,i){
      l.style.transform='translateZ('+((n-i)*gap)+'px)';
      // fade the other sheets smoothly as the stack opens; the current one stays solid
      l.style.opacity = (i===cur) ? 1 : (1-0.4*spread).toFixed(3);
    });
    if(cur!==last){
      items.forEach(function(li,i){li.classList.toggle('on',i===cur);});
      if(cap){ var d=items[cur].querySelector('p'); cap.textContent=d?d.textContent:''; }
      last=cur;
    }
    stack.style.setProperty('--s', spread.toFixed(3));
    stack.style.transform='rotateX('+(58-tiltY)+'deg) rotateZ('+(-38+tiltX)+'deg)';
  }
  // Clicking a step glides the page to that stage of the exploded view.
  items.forEach(function(li,i){
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
    sec.addEventListener('pointermove',function(ev){ tiltX=(ev.clientX/window.innerWidth-.5)*10; tiltY=(ev.clientY/window.innerHeight-.5)*8; frame(); });
  }
  var ticking=false;
  window.addEventListener('scroll',function(){ if(!ticking){ ticking=true; requestAnimationFrame(function(){ frame(); ticking=false; }); } },{passive:true});
  var lastW=window.innerWidth;
  window.addEventListener('resize',function(){ if(window.innerWidth!==lastW){ lastW=window.innerWidth; vh=window.innerHeight; frame(); } });
  frame();
})();
