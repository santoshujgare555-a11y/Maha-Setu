/* ===== v1.5: ब्रोकर प्लॅन (Maha Setu) ===== */
(function(){
  var LSK={b:'ms_bk_brokers',l:'ms_bk_listings',s:'ms_bk_session'};
  function get(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
  function set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var ADMIN_WA='917775057917';
  var brokers=get(LSK.b,[]), listings=get(LSK.l,[]), sess=get(LSK.s,null);

  function waPhone(p){p=String(p||'').replace(/[^0-9]/g,''); if(p.length===10)p='91'+p; if(p.length===11&&p[0]==='0')p='91'+p.slice(1); return p;}
  function waLink(p,t){var txt='नमस्कार, महा सेतूवर पाहिलेल्या "'+t+'" या जाहिरातीबाबत माहिती हवी आहे.'; return 'https://wa.me/'+waPhone(p)+'?text='+encodeURIComponent(txt);}
  function reraOk(r){return /^P52[0-9]{9}$/i.test(String(r||'').replace(/[^a-zA-Z0-9]/g,'').trim());}
function money(n){n=Number(n);return (n&&isFinite(n)&&n>0)?fmtINR(n):'';}

  function renderTabs(){var cur=$('.bk-tab.on');$$('.bk-tab').forEach(function(b){b.addEventListener('click',function(){
    $$('.bk-tab').forEach(function(x){x.classList.remove('on')});b.classList.add('on');
    $$('.bk-pane').forEach(function(p){p.hidden=(p.getAttribute('data-bk')!==b.getAttribute('data-bk'))});
    if(b.getAttribute('data-bk')==='mine')renderMine(); if(b.getAttribute('data-bk')==='all')renderAll();
  })});}

  function sessBroker(){return sess?brokers.filter(function(b){return b.phone===sess})[0]:null}
  function refreshLogin(){
    var b=sessBroker();
    $('#bkPostLogin').hidden=!!b; $('#bkPostForm').hidden=!b;
    if(b)$('#bkPostWho').textContent='नोंदणी: '+b.name+' ('+b.phone+')';
    var mine=$('#bkMineOpen'); if(mine)mine.hidden=!b;
  }

  function regSave(e){e.preventDefault();
    var f=e.target, d={name:f.name.value.trim(),shop:f.shop.value.trim(),phone:f.phone.value.trim(),village:f.village.value.trim(),taluka:f.taluka.value.trim(),district:f.district.value.trim(),rera:f.rera.value.trim(),added:new Date().toISOString().slice(0,10)};
    if(!/^[0-9]{10}$/.test(d.phone)){$('#bkRegMsg').textContent='10 अंकी मोबाईल नंबर भरा.';return}
    if(brokers.some(function(x){return x.phone===d.phone})){$('#bkRegMsg').textContent='हा नंबर आधीच नोंदवलेला आहे — मोबाईलने सुरू करा.';return}
    brokers.push(d); set(LSK.b,brokers); sess=d.phone; set(LSK.s,sess);
    $('#bkRegMsg').textContent='नोंदणी पूर्ण ✅ आता जाहिरात टाका. आपला नंबर लक्षात ठेवा — पुढीलवेळी त्याच नंबरने सुरू करा.';
    f.reset(); refreshLogin(); switchTab('post');
  }
  function phoneGo(){var p=$('#bkPhoneIn').value.replace(/[^0-9]/g,''); if(p.length===10&&brokers.some(function(x){return x.phone===p})){sess=p;set(LSK.s,sess);refreshLogin();switchTab('post')} else $('#bkPostWho').textContent='या नंबरची नोंदणी सापडली नाही — आधी नोंदणी करा.'}

  function postSave(e){e.preventDefault();
    var b=sessBroker(); if(!b){switchTab('intro');return}
    var f=e.target;
    var d={id:'B'+Date.now().toString(36),phone:b.phone,bname:b.name,ptype:f.ptype.value,mode:f.mode.value,title:f.title.value.trim(),price:f.price.value.trim(),area:f.area.value.trim(),unit:f.unit.value,village:f.village.value.trim(),taluka:f.taluka.value.trim(),district:f.district.value.trim(),desc:f.desc.value.trim(),photos:f.photos.value.trim().split(/\n+/).filter(function(u){return /^https?:\/\//i.test(u.trim())}).slice(0,6),newproj:f.newproj.checked,rera:f.rera.value.trim(),brera:f.brera.value.trim(),added:new Date().toISOString().slice(0,10),ok:false,leads:0};
    if(!d.title){$('#bkPostMsg').textContent='जाहिरातीचं शीर्षक भरा.';return}
    if(d.newproj&&!reraOk(d.rera)){$('#bkPostMsg').textContent='नवीन प्रकल्पासाठी MahaRERA क्रमांक आवश्यक (उदा. P52100012345).';return}
    listings.unshift(d); set(LSK.l,listings); f.reset(); f.newproj.checked=false; $('#bkReraWrap').hidden=true;
    $('#bkPostMsg').textContent='जाहिरात जतन झाली ✅ Admin पडताळल्यावर "✅ तपासले" होईल.';
    renderMine(); renderAll();
  }
  function delMine(id){listings=listings.filter(function(x){return x.id!==id});set(LSK.l,listings);renderMine();renderAll()}

  function card(d,mine){
    var img=(d.photos&&d.photos[0])?'<img class="bkimg" src="'+esc(d.photos[0])+'" alt="फोटो" loading="lazy">':'<div class="bkimg bknop">🏡</div>';
    var photos=(d.photos&&d.photos.length)?'<span class="bkmeta">📷 '+d.photos.length+' फोटो</span>':'';
    var rera=d.newproj?(reraOk(d.rera)?'<span class="bkbadge ok">✅ MahaRERA '+esc(d.rera)+'</span>':'<span class="bkbadge warn">RERA क्रमांक तपासा</span>'):'';
    var brera=d.brera&&reraOk(d.brera)?'<span class="bkmeta">एजंट MahaRERA '+esc(d.brera)+'</span>':'';
    var status=d.ok?'<span class="bkbadge ok">✅ Admin तपासले</span>':'<span class="bkbadge warn">⏳ पडताळणी बाकी</span>';
    var act='<a class="btn bkw" href="'+waLink(d.bphone||d.phone,d.title)+'" target="_blank" rel="noopener" data-walead="'+esc(d.id)+'">WhatsApp चौकशी</a>';
    var del=mine?'<button class="btn btn-o bkdel" data-del="'+esc(d.id)+'">काढा</button>':'';
    return '<div class="bkcard">'+img+'<div class="bkbody"><h3>'+esc(d.title)+'</h3><p class="bkprice">'+(money(d.price)||'भाव विचारा')+'<span class="bkmeta"> · '+esc(d.mode)+'</span></p><p class="bkmeta">'+esc(d.ptype)+' · '+esc(d.area)+' '+esc(d.unit)+' · '+esc(d.village)+(d.taluka?', '+esc(d.taluka):'')+(d.district?', '+esc(d.district):'')+'</p>'+(d.desc?'<p class="bkdesc">'+esc(d.desc)+'</p>':'')+'<p>'+status+' '+rera+' '+brera+' '+photos+'</p><p class="bkmeta">ब्रोकर: '+esc(d.bname)+' ('+esc(d.bphone||d.phone)+')</p><div class="bkact">'+act+del+'</div></div></div>';
  }
  function renderMine(){var b=sessBroker();var el=$('#bkMine');if(!b){el.innerHTML='<p class="small">आधी मोबाईल नंबरने सुरू करा.</p>';return}
    var mine=listings.filter(function(x){return x.phone===b.phone});
    el.innerHTML=mine.length?mine.map(function(d){return card(d,true)}).join(''):'<p class="small">अजून जाहिरात टाकलेली नाही. "जाहिरात टाका" मधून टाका.</p>';
  }
  function renderAll(){var el=$('#bkAll');var ok=listings.filter(function(x){return x.ok});var pen=listings.filter(function(x){return !x.ok});
    el.innerHTML=(ok.length?'<p class="small">✅ पडताळलेल्या जाहिराती ('+ok.length+')</p>'+ok.map(function(d){return card(d,false)}).join(''):'')+(pen.length?'<p class="small" style="margin-top:10px">⏳ पडताळणी बाकी जाहिराती ('+pen.length+')</p>'+pen.map(function(d){return card(d,false)}).join(''):'')||'<p class="small">सध्या जाहिराती नाहीत — पहिली जाहिरात ब्रोकर टाकू शकतो.</p>';
  }
  function renderAdmin(){var el=$('#bkAdminList');
    var all=listings.slice();
    el.innerHTML=all.length?all.map(function(d){return '<div class="bkrow">'+esc(d.title)+' — '+esc(d.bname)+' ('+esc(d.bphone||d.phone)+') '+(d.ok?'<span class="bkbadge ok">✅</span>':'<span class="bkbadge warn">बाकी</span>')+' <span style="flex:1"></span>'+(d.ok?'':'<button class="btn bkok" data-ok="'+esc(d.id)+'">पडताळा</button>')+'<button class="btn btn-o bkdel2" data-dela="'+esc(d.id)+'">काढा</button></div>'}).join(''):'<p class="small">कोणतीच जाहिरात नाही.</p>';
  }
  function switchTab(k){var b=$('.bk-tab[data-bk="'+k+'"]');if(b)b.click()}

  function boot(){
    renderTabs(); refreshLogin(); renderAll();
    $('#bkRegForm').addEventListener('submit',regSave);
    $('#bkPhoneGo').addEventListener('click',phoneGo);
    $('#bkPostForm').addEventListener('submit',postSave);
    var np=$('#bkPostForm').querySelector('input[name=newproj]');
    np.addEventListener('change',function(){$('#bkReraWrap').hidden=!np.checked});
    document.addEventListener('click',function(ev){
      var t=ev.target.closest?ev.target.closest('[data-del],[data-dela],[data-ok],#bkAdminBtn,[data-walead]'):null; if(!t)return;
      if(t.hasAttribute('data-walead')){var l=listings.filter(function(x){return x.id===t.getAttribute('data-walead')})[0]; if(l){l.leads=(l.leads||0)+1;set(LSK.l,listings)} return}
      var id=t.getAttribute('data-del'); if(id){delMine(id);return}
      id=t.getAttribute('data-dela'); if(id){listings=listings.filter(function(x){return x.id!==id});set(LSK.l,listings);renderAdmin();renderAll();return}
      id=t.getAttribute('data-ok'); if(id){var d=listings.filter(function(x){return x.id===id})[0]; if(d){d.ok=true;set(LSK.l,listings);renderAdmin();renderAll()}return}
      if(t.id==='bkAdminBtn'){var a=$('#bkAdmin');a.hidden=!a.hidden;if(!a.hidden)renderAdmin();return}
    });
    var g2=$('#bkPhoneGo2'); if(g2) g2.addEventListener('click',function(){var p=$('#bkPhoneIn2').value.replace(/[^0-9]/g,'');if(p.length===10&&brokers.some(function(x){return x.phone===p})){sess=p;set(LSK.s,sess);$('#bkMineOpenWrap').hidden=true;refreshLogin();renderMine()}else{var el=$('#bkMine'); if(el) el.innerHTML='<p class="small">या नंबरची नोंदणी सापडली नाही — आधी नोंदणी करा.</p>'}});
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',boot)}else{boot()}
})();
try{ if(typeof VIEWS!=='undefined'&&VIEWS.indexOf('broker')<0) VIEWS.push('broker'); if(typeof route==='function'){ route(); } }catch(e){}
