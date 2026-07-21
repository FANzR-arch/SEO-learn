/* ============================================================
   SEO × GEO 入门课 · 课程外壳  SEO.initLesson(cfg)
   自动注入：顶栏 + 章节导航 + 进度条 + 左侧栏 + 滚动高亮
   每课只需在末尾调用一次，无需重复这些样板。
   ============================================================ */
(function(){
  "use strict";
  var S = window.SEO = window.SEO || {};

  function cn(n){
    var d = ["零","一","二","三","四","五","六","七","八","九"];
    if(n < 10) return d[n];
    if(n === 10) return "十";
    if(n < 20) return "十" + d[n - 10];
    return d[Math.floor(n / 10)] + "十" + (n % 10 ? d[n % 10] : "");
  }

  S.initLesson = function(cfg){
    cfg = cfg || {};
    var sections = cfg.sections || [];

    // ---- 顶栏 ----
    var steps = sections.map(function(s,i){
      return '<a href="#'+s.id+'"'+(i===0?' class="on"':'')+'>'+s.label+'</a>';
    }).join("");
    var bar = document.createElement("div");
    bar.className = "topbar";
    bar.innerHTML =
      '<div class="row">' +
        '<a class="brand" href="../index.html">← SEO×GEO · <b>第'+cn(cfg.n)+'课</b></a>' +
        '<nav class="steps" id="seo-steps">'+steps+'</nav>' +
      '</div>' +
      '<div class="progline" id="progline"></div>';
    var _skip = document.querySelector(".skip-link");
    document.body.insertBefore(bar, _skip ? _skip.nextSibling : document.body.firstChild);
    if(S.mountThemeToggle) S.mountThemeToggle();

    // ---- 左侧栏（宽屏：课程小节列表 + 学习进度）----
    var h1 = document.querySelector(".hero h1");
    var titleText = h1 ? h1.textContent.trim() : ("第"+cn(cfg.n)+"课");
    var pad2 = function(i){ return ("0"+(i+1)).slice(-2); };
    var railSteps = sections.map(function(s,i){
      return '<a class="lr-item'+(i===0?' on':'')+'" href="#'+s.id+'"><span class="lr-n">'+pad2(i)+'</span><span>'+s.label+'</span></a>';
    }).join("");
    var rail = document.createElement("aside");
    rail.className = "lesson-rail";
    rail.innerHTML =
      '<a class="lr-back" href="../index.html">← 课程地图</a>' +
      '<div class="lr-eyebrow">第'+cn(cfg.n)+'课</div>' +
      '<div class="lr-title">'+titleText+'</div>' +
      '<div class="lr-prog"><div class="lr-prog-bar"><span id="lr-fill"></span></div><div class="lr-prog-t" id="lr-ptext">第 1 / '+sections.length+' 节</div></div>' +
      '<nav class="lr-list">'+railSteps+'</nav>';
    document.body.appendChild(rail);
    document.body.classList.add("has-rail");
    var railLinks = Array.prototype.slice.call(rail.querySelectorAll(".lr-item"));
    var lrFill = document.getElementById("lr-fill"), lrPtext = document.getElementById("lr-ptext");

    // ---- 进度条 + 章节高亮（顶栏 + 左侧栏同步）----
    var links = Array.prototype.slice.call(bar.querySelectorAll("#seo-steps a"));
    var secs = links.map(function(a){ return document.querySelector(a.getAttribute("href")); });
    var progline = document.getElementById("progline");
    var total = sections.length || 1;
    function onScroll(){
      var st = window.scrollY, dh = document.documentElement.scrollHeight - window.innerHeight;
      if(progline) progline.style.width = (dh>0 ? (st/dh*100) : 0) + "%";
      var idx = 0;
      for(var i=0;i<secs.length;i++){ if(secs[i] && secs[i].getBoundingClientRect().top<=140) idx=i; }
      links.forEach(function(a,i){ a.classList.toggle("on", i===idx); });
      railLinks.forEach(function(a,i){ a.classList.toggle("on", i===idx); });
      if(lrFill) lrFill.style.width = ((idx+1)/total*100) + "%";
      if(lrPtext) lrPtext.textContent = "第 " + (idx+1) + " / " + total + " 节";
    }
    window.addEventListener("scroll", onScroll, {passive:true});
    onScroll();
  };
})();
