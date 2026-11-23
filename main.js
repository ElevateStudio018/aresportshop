(function(){
  var d=document, doc=d.documentElement, L=doc.lang==='en'?'en':'sv', RM=doc.classList.contains('rm');
  var $=function(s,c){return (c||d).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};
  var T={sv:{menu:'meny',close:'stäng',copied:'Kopierat',noRes:'Inga träffar',day:'dag',days:'dagar',season:'Hela säsongen',none:'Säsongshyra finns inte för den här nivån',kr:'kr',incl:'Ingår: ',person:'Person',total:'Totalt',remove:'ta bort'},
         en:{menu:'menu',close:'close',copied:'Copied',noRes:'No results',day:'day',days:'days',season:'Full season',none:'Season rental is not available for this level',kr:'SEK',incl:'Includes: ',person:'Person',total:'Total',remove:'remove'}}[L];

  // Season mode: May-October = summer
  var m=new Date().getMonth()+1; doc.dataset.season=(m>=5&&m<=10)?'summer':'winter';

  // Toast
  var toastEl;
  function toast(msg){ if(!toastEl){toastEl=d.createElement('div');toastEl.className='toast';toastEl.setAttribute('role','status');d.body.appendChild(toastEl)}
    toastEl.textContent=msg; toastEl.classList.add('show'); clearTimeout(toastEl._t); toastEl._t=setTimeout(function(){toastEl.classList.remove('show')},5000)}

  // Nav: shrink, mobile panel
  var nav=$('.nav'), top=$('.totop');
  function onScroll(){var y=scrollY; if(nav)nav.classList.toggle('small',y>40); if(top)top.classList.toggle('show',y>700)}
  addEventListener('scroll',onScroll,{passive:true}); onScroll();
  if(top)top.addEventListener('click',function(){scrollTo({top:0,behavior:RM?'auto':'smooth'});var s=$('.skip');if(s)s.focus()});
  var btn=$('.nav__btn'), panel=$('#menu');
  if(btn&&panel){
    var set=function(o){panel.hidden=!o;btn.setAttribute('aria-expanded',o);btn.textContent=o?T.close:T.menu};
    set(false); btn.addEventListener('click',function(){set(panel.hidden)});
    $$('a',panel).forEach(function(a){a.addEventListener('click',function(){set(false)})});
    addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden){set(false);btn.focus()}});
  }
  // Scroll-spy for in-page nav links and sub-nav pills
  var spyLinks=$$('.nav__links a[href*="#"], .subnav a');
  if('IntersectionObserver' in window&&spyLinks.length){
    var map={}; spyLinks.forEach(function(a){var id=a.getAttribute('href').split('#')[1]; var t=id&&d.getElementById(id); if(t&&(a.closest('.subnav')||a.getAttribute('href').charAt(0)==='#')){(map[id]=map[id]||[]).push(a)}});
    var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){spyLinks.forEach(function(a){a.classList.remove('on');if(a.closest('.nav__links'))a.removeAttribute('aria-current')});(map[e.target.id]||[]).forEach(function(a){if(a.closest('.subnav'))a.classList.add('on');else a.setAttribute('aria-current','location')})}})},{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(map).forEach(function(id){so.observe(d.getElementById(id))});
  }

  // Search over sections and links
  var data=[]; try{data=JSON.parse($('#search-data').textContent)}catch(e){}
  $$('.search').forEach(function(box){
    var inp=$('input',box), res=$('.search__res',box);
    function render(){var q=inp.value.trim().toLowerCase(); if(q.length<2){res.hidden=true;return}
      var hits=data.filter(function(x){return (x.t+' '+x.k).toLowerCase().indexOf(q)>-1}).slice(0,6);
      res.innerHTML=hits.length?hits.map(function(x){return '<li><a href="'+x.u+'">'+x.t+'<small>'+x.k.split(' ').slice(0,8).join(' ')+'</small></a></li>'}).join(''):'<li><span style="display:block;padding:10px 12px">'+T.noRes+'</span></li>';
      res.hidden=false}
    inp.addEventListener('input',render); inp.addEventListener('focus',render);
    inp.addEventListener('keydown',function(e){if(e.key==='Escape'){res.hidden=true;inp.blur()} if(e.key==='Enter'){var a=$('a',res);if(a){e.preventDefault();location.href=a.href}}});
    d.addEventListener('click',function(e){if(!box.contains(e.target))res.hidden=true});
    box.addEventListener('submit',function(e){e.preventDefault()});
  });

  // Reveal once
  if(doc.classList.contains('js')&&!RM&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    $$('.rv').forEach(function(el){io.observe(el)});
    // Word-by-word heading fade
    $$('h1.words, .words h1, .door__t strong').forEach(function(h){var i=0; Array.prototype.slice.call(h.childNodes).forEach(function(n){ if(n.nodeType===3){var f=d.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(function(w){ if(/^\s+$/.test(w)||!w){f.appendChild(d.createTextNode(w))} else {var s=d.createElement('span');s.className='w';s.style.animationDelay=(i++*70)+'ms';s.textContent=w;f.appendChild(s)}}); n.replaceWith(f)} })});
    // Subtle parallax inside images
    var pars=$$('.par');
    if(pars.length){var tick=false; var upd=function(){tick=false; var vh=innerHeight; pars.forEach(function(p){var r=p.getBoundingClientRect(); if(r.bottom<0||r.top>vh)return; var k=((r.top+r.height/2)-vh/2)/vh; p.style.setProperty('--py',(k*-6).toFixed(2)+'%')})};
      addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true}); upd();}
  } else { $$('.rv').forEach(function(el){el.classList.add('in')}) }

  // Atmosphere videos: autoplay only when motion is allowed (poster otherwise)
  if(!RM&&!matchMedia('(prefers-reduced-motion: reduce)').matches){$$('video.bgv').forEach(function(v){v.autoplay=true;var p=v.play();if(p&&p.catch)p.catch(function(){})})}

  // Carousel buttons
  $$('[data-car]').forEach(function(nv){var c=d.getElementById(nv.dataset.car); $$('button',nv).forEach(function(b){b.addEventListener('click',function(){c.scrollBy({left:(b.dataset.dir==='1'?1:-1)*c.clientWidth*.8,behavior:RM?'auto':'smooth'})})})});

  // Copy buttons
  $$('[data-copy]').forEach(function(b){b.addEventListener('click',function(){var v=b.dataset.copy;
    var done=function(){toast(T.copied+': '+v)};
    if(navigator.clipboard){navigator.clipboard.writeText(v).then(done,done)}else{done()}})});

  // Opening hours: highlight today
  var today=(new Date().getDay()+6)%7; $$('.hours li').forEach(function(li,i){if(i===today){li.classList.add('today');li.setAttribute('aria-current','date')}});

  // Cookie box
  var ck=$('.cookie'); var seen=false; try{seen=localStorage.getItem('ck')==='1'}catch(e){}
  if(ck&&!seen){ck.hidden=false; $('button',ck).addEventListener('click',function(){ck.hidden=true;try{localStorage.setItem('ck','1')}catch(e){}})}

  // Forms: no backend, toast confirmation
  $$('form[data-toast]').forEach(function(f){
    f.addEventListener('submit',function(e){e.preventDefault(); if(!f.checkValidity()){f.reportValidity();return}
      toast(f.dataset.toast); f.reset();});
  });

  // ===== Price calculator =====
  var c=$('#calc');
  if(c&&window.PRICES){
    var P=window.PRICES, ICON=window.LVL_ICONS||{};
    var lvlBox=$('.lvl',c), dayOut=$('#days-out',c), minus=$('[data-d="-1"]',c), plus=$('[data-d="1"]',c), seas=$('#season',c),
        out=$('.calc__price',c), meta=$('.calc__meta',c), fam=$('.fam',c), add=$('#add-person',c);
    var people=[{pkg:'alpin',lvl:P.alpin.def}], cur=0, days=3;
    var fmt=function(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ')};
    function price(p){var r=P[p.pkg].rows[p.lvl]; return seas.checked?r.season:r.d[days-1]}
    function drawLevels(){var p=people[cur], rows=P[p.pkg].rows; lvlBox.innerHTML='';
      rows.forEach(function(r,i){var l=d.createElement('label'); l.innerHTML='<input type="radio" name="niva" value="'+i+'"'+(i===p.lvl?' checked':'')+'><span>'+(ICON[r.icon]||'')+r[L]+'</span>'; lvlBox.appendChild(l)});
      $$('input',lvlBox).forEach(function(i){i.addEventListener('change',function(){people[cur].lvl=+i.value;calc()})});
      $$('input[name=paket]',c).forEach(function(i){i.checked=i.value===p.pkg});
    }
    function calc(){
      dayOut.textContent=seas.checked?T.season:days+' '+(days===1?T.day:T.days);
      minus.disabled=seas.checked||days<=1; plus.disabled=seas.checked||days>=7;
      var total=0, missing=false;
      fam.innerHTML='';
      people.forEach(function(p,i){var v=price(p); if(v==null)missing=true; else total+=v;
        if(people.length>1){var li=d.createElement('li'); if(i===cur)li.className='cur';
          li.innerHTML='<button type="button" data-sel="'+i+'">'+T.person+' '+(i+1)+': '+P[p.pkg][L]+', '+P[p.pkg].rows[p.lvl][L]+'</button><span>'+(v==null?'–':fmt(v)+' '+T.kr)+'</span>'+'<button type="button" data-rm="'+i+'" aria-label="'+T.remove+' '+T.person+' '+(i+1)+'">'+T.remove+'</button>';
          fam.appendChild(li)}});
      $$('[data-sel]',fam).forEach(function(b){b.addEventListener('click',function(){cur=+b.dataset.sel;drawLevels();calc()})});
      $$('[data-rm]',fam).forEach(function(b){b.addEventListener('click',function(){people.splice(+b.dataset.rm,1);cur=Math.min(cur,people.length-1);drawLevels();calc()})});
      var one=people.length===1, v1=price(people[0]);
      if(one){out.textContent=v1==null?T.none:fmt(v1)+' '+T.kr; out.dataset.value=v1==null?'':v1;
        var p=people[0]; meta.textContent=P[p.pkg].rows[p.lvl][L]+' · '+dayOut.textContent.toLowerCase()+'. '+T.incl+P[p.pkg].incl[L];}
      else {out.textContent=fmt(total)+' '+T.kr; out.dataset.value=total;
        meta.textContent=T.total+', '+people.length+' '+(L==='sv'?'personer':'people')+' · '+dayOut.textContent.toLowerCase()+(missing?(L==='sv'?'. Någon nivå saknar säsongspris och räknas inte.':'. A level without season price is not counted.'):'')}
    }
    $$('input[name=paket]',c).forEach(function(i){i.addEventListener('change',function(){people[cur]={pkg:i.value,lvl:P[i.value].def};drawLevels();calc()})});
    minus.addEventListener('click',function(){days=Math.max(1,days-1);calc()});
    plus.addEventListener('click',function(){days=Math.min(7,days+1);calc()});
    seas.addEventListener('change',calc);
    add.addEventListener('click',function(){people.push({pkg:people[cur].pkg,lvl:people[cur].lvl});cur=people.length-1;drawLevels();calc()});
    c.addEventListener('submit',function(e){e.preventDefault()});
    window.__calc={set:function(pkg,lvl,dd,season){people=[{pkg:pkg,lvl:lvl}];cur=0;days=dd;seas.checked=!!season;drawLevels();calc()},add:function(pkg,lvl){people.push({pkg:pkg,lvl:lvl});cur=people.length-1;drawLevels();calc()}};
    c.hidden=false; var fb=$('#calc-fallback'); if(fb)fb.hidden=true;
    drawLevels(); calc();
    // bottom sheet on mobile
    var col=$('.calc-col'), scrim=$('.scrim'), opener=$$('.sheet-open'), x=$('.sheet-x',c);
    var openS=function(o){col.classList.toggle('open',o); scrim.hidden=!o; if(o){var f=$('input:checked',c);if(f)f.focus()}};
    opener.forEach(function(b){b.addEventListener('click',function(){openS(true)})});
    if(x)x.addEventListener('click',function(){openS(false);if(opener[0])opener[0].focus()});
    if(scrim)scrim.addEventListener('click',function(){openS(false)});
    addEventListener('keydown',function(e){if(e.key==='Escape'&&col.classList.contains('open'))openS(false)});
  }

  // Bootfitting scroll story: switch sticky image per step
  var fig=$('.story__fig');
  if(fig&&'IntersectionObserver' in window){
    var imgs=$$('img',fig), steps=$$('.step');
    var so2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var k=e.target.dataset.img;
      steps.forEach(function(s){s.classList.toggle('on',s===e.target)}); imgs.forEach(function(im){im.classList.toggle('on',im.dataset.k===k)})}})},{rootMargin:'-45% 0px -45% 0px'});
    steps.forEach(function(s){so2.observe(s)}); if(steps[0])steps[0].classList.add('on');
  }
})();
