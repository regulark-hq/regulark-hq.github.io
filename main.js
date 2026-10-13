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

  // Exploded view: the four layers separate as you scroll.
  var sec=document.querySelector('.explode'); if(!sec) return;
  var stack=sec.querySelector('.stack'), layers=[].slice.call(sec.querySelectorAll('.layer')), items=[].slice.call(sec.querySelectorAll('.steps3d li'));
  var tiltX=0, tiltY=0, last=-1;
  function frame(){
    var r=sec.getBoundingClientRect(), total=sec.offsetHeight-window.innerHeight;
    var p=reduce?1:Math.min(1,Math.max(0,-r.top/Math.max(1,total)));
    var spread=Math.min(1,p/0.35);                 // separate during the first third
    var gap=1+(window.innerWidth<900?51:85)*spread;
    var n=layers.length-1; layers.forEach(function(l,i){ l.style.transform='translateZ('+((n-i)*gap)+'px)'; });
    var cur=Math.min(3,Math.floor(p*4.0001));
    if(cur!==last){ items.forEach(function(li,i){li.classList.toggle('on',i===cur);}); layers.forEach(function(l,i){l.classList.toggle('cur',i===cur);}); last=cur; }
    stack.parentNode.classList.toggle('dim', spread>0.98);
    stack.style.setProperty('--s', spread.toFixed(3));
    stack.style.transform='rotateX('+(58-tiltY)+'deg) rotateZ('+(-38+tiltX)+'deg)';
  }
  if(fine && !reduce){
    sec.addEventListener('pointermove',function(ev){ tiltX=(ev.clientX/window.innerWidth-.5)*10; tiltY=(ev.clientY/window.innerHeight-.5)*8; frame(); });
  }
  var ticking=false;
  window.addEventListener('scroll',function(){ if(!ticking){ ticking=true; requestAnimationFrame(function(){ frame(); ticking=false; }); } },{passive:true});
  window.addEventListener('resize',frame);
  frame();
})();
