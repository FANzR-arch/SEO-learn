/* ============================================================
   SEO × GEO 入门课 · 交互组件库  SEO.widgets.*
   每个组件 = 一个工厂：传入容器元素 + 配置，自建 DOM、自动登记重绘。
   无第三方依赖；SVG 颜色取自 CSS 变量，主题切换时由 SEO.redrawAll 重绘。
   ============================================================ */
(function(){
  "use strict";
  var S = window.SEO = window.SEO || {};

  // ---- 基础工具 ----
  S.cssv = function(v){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); };
  S.esc = function(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); };
  var _redraws = [];
  S.registerRedraw = function(fn){ _redraws.push(fn); };
  S.redrawAll = function(){ _redraws.forEach(function(f){ try{ f(); }catch(e){} }); };

  var esc = S.esc;
  var W = S.widgets = S.widgets || {};

  // ---- 文本像素宽度（Canvas 测量，用于 SERP 截断判断）----
  var _mc = null;
  function textW(t, px){
    if(!_mc) _mc = document.createElement("canvas").getContext("2d");
    _mc.font = px + 'px Arial,"PingFang SC","Microsoft YaHei",sans-serif';
    return _mc.measureText(t || "").width;
  }
  function cutPx(t, px, max){
    if(textW(t, px) <= max) return esc(t);
    var s = t;
    while(s.length && textW(s + "…", px) > max) s = s.slice(0, -1);
    return esc(s + "…");
  }

  // ---- SERP 通用小件 ----
  function favChar(site){ return esc((site || "W").trim().charAt(0)); }
  function srcRow(site, url){
    return '<div class="sr-src"><span class="sr-fav">'+favChar(site)+'</span>'+
      '<span><span class="sr-name">'+esc(site)+'</span> · <span class="sr-url">'+esc(url)+'</span></span></div>';
  }

  /* ---------- SERP 预览器 ----------
     编辑 Title / Meta Description，实时看搜索结果长什么样。
     opts: { title, desc, site, url, keyword? } */
  W.serpPreview = function(host, opts){
    opts = opts || {};
    var st = {
      title: opts.title != null ? opts.title : "我的页面标题",
      desc:  opts.desc  != null ? opts.desc  : "",
      site:  opts.site || "示例站点",
      url:   opts.url  || "example.com › article"
    };
    var T_MAX = 580, D_MAX = 920;   // 桌面端近似像素上限（教学近似值）
    var T_PX = 20, D_PX = 14;       // 与 Google 桌面端一致的字号
    host.innerHTML =
      '<div class="card pad"><div class="spv">'+
        '<div class="spv-fields">'+
          '<div class="spv-field"><label>页面标题 &lt;title&gt; <span class="cnt" data-el="tc"></span></label>'+
            '<input type="text" data-el="ti" value="'+esc(st.title)+'" aria-label="页面标题">'+
            '<div class="meter" data-el="tm"><span></span></div></div>'+
          '<div class="spv-field"><label>描述 meta description <span class="cnt" data-el="dc"></span></label>'+
            '<textarea rows="3" data-el="di" aria-label="页面描述">'+esc(st.desc)+'</textarea>'+
            '<div class="meter" data-el="dm"><span></span></div></div>'+
        '</div>'+
        '<div>'+
          '<div class="spv-cap">搜索结果预览 · 桌面端示意</div>'+
          '<div class="serp"><div class="serp-body" style="padding:12px 16px">'+
            '<div class="serp-block" style="padding:4px 0">'+srcRow(st.site, st.url)+
              '<span class="sr-title" data-el="pt"></span><p class="sr-desc" data-el="pd"></p></div>'+
          '</div></div>'+
          '<div class="verdict" data-el="v"></div>'+
        '</div>'+
      '</div></div>';
    var ti = host.querySelector('[data-el="ti"]'), di = host.querySelector('[data-el="di"]');
    function meter(el, w, max){
      el.className = "meter" + (w > max ? " over" : (w > max*0.88 ? " warn" : ""));
      el.firstChild.style.width = Math.min(100, w/max*100) + "%";
    }
    function update(){
      st.title = ti.value; st.desc = di.value;
      var tw = textW(st.title, T_PX), dw = textW(st.desc, D_PX);
      host.querySelector('[data-el="pt"]').innerHTML = st.title ? cutPx(st.title, T_PX, T_MAX) : '<span style="opacity:.4">（标题空着，搜索引擎会自己拼一个）</span>';
      host.querySelector('[data-el="pd"]').innerHTML = st.desc ? cutPx(st.desc, D_PX, D_MAX) : '<span style="opacity:.5">（没写描述时，搜索引擎常从正文里自动截一段）</span>';
      host.querySelector('[data-el="tc"]').textContent = st.title.length + " 字 · " + Math.round(tw) + " / " + T_MAX + " px";
      host.querySelector('[data-el="dc"]').textContent = st.desc.length + " 字 · " + Math.round(dw) + " / " + D_MAX + " px";
      meter(host.querySelector('[data-el="tm"]'), tw, T_MAX);
      meter(host.querySelector('[data-el="dm"]'), dw, D_MAX);
      var msgs = [];
      if(!st.title) msgs.push("✗ 标题还空着——它是排名和点击最重要的一行字。");
      else if(tw > T_MAX) msgs.push("✗ 标题超宽，结果里会被截成「…」，关键信息尽量放前面。");
      else if(tw < T_MAX*0.35) msgs.push("△ 标题偏短：门面还有空间，可以补上更具体的信息。");
      else msgs.push("✓ 标题长度合适。");
      if(opts.keyword){
        if(st.title.toLowerCase().indexOf(opts.keyword.toLowerCase()) > -1) msgs.push("✓ 标题包含关键词「"+esc(opts.keyword)+"」。");
        else msgs.push("△ 标题里还没出现关键词「"+esc(opts.keyword)+"」——搜索者和引擎都靠它对上号。");
      }
      if(st.desc){
        if(dw > D_MAX) msgs.push("✗ 描述超长，尾部会被截断。");
        else msgs.push("✓ 描述长度合适。描述不直接参与排名，但决定「要不要点你」。");
      }
      host.querySelector('[data-el="v"]').innerHTML = msgs.join("<br>");
    }
    ti.addEventListener("input", update);
    di.addEventListener("input", update);
    update();
  };

  /* ---------- SERP 解剖 ----------
     渲染一页（简化的）搜索结果，点按钮逐块高亮讲解。
     opts: { query, parts:[...], ad, ai, snippet, organic:[], paa:[], related:[], intro?, info? } */
  var PART_META = {
    ad:      { btn:"广告",     tag:"广告位",
               info:"<strong>广告。</strong>标着「赞助」，广告主按点击付费，位置来自竞价（这属于 SEM 的范围）。广告预算再多，也不会改变下面自然结果的排序。" },
    ai:      { btn:"AI 概览",  tag:"AI 概览",
               info:"<strong>AI 概览（AI Overview）。</strong>生成式 AI 汇总多个网页直接给出答案，并附引用来源。让 AI 在这里引用你，就是 GEO 要解决的问题（阶段六专讲）。" },
    snippet: { btn:"精选摘要", tag:"精选摘要",
               info:"<strong>精选摘要（Featured Snippet）。</strong>算法从某条自然结果里「抽」出来直接展示的答案，位置在第 1 名之上，所以俗称「位置 0」。结构清晰的内容（步骤、定义、表格）更容易入选。" },
    organic: { btn:"自然结果", tag:"自然结果",
               info:"<strong>自然结果（Organic）。</strong>免费、由算法按相关性与质量排序——SEO 的主战场。这门课的大部分内容，都是为了让页面在这里排得更好。" },
    paa:     { btn:"相关问题", tag:"相关问题",
               info:"<strong>相关问题（People Also Ask）。</strong>围绕这次搜索的真实追问，点开每条都是一个新答案。它既是额外的曝光位，也是现成的内容选题库。" },
    related: { btn:"相关搜索", tag:"相关搜索",
               info:"<strong>相关搜索。</strong>搜完这个词的人还会搜什么。做关键词研究时，这里是理解搜索路径、挖长尾词的免费线索。" }
  };
  var SPARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19.5 15l1 2.8 2.8 1-2.8 1-1 2.8-1-2.8-2.8-1 2.8-1z"/></svg>';

  W.serpAnatomy = function(host, opts){
    opts = opts || {};
    var parts = opts.parts || ["ad","organic","related"];
    function block(part, inner){
      return '<div class="serp-block" data-part="'+part+'"><span class="serp-tag">'+PART_META[part].tag+'</span>'+inner+'</div>';
    }
    var html = "";
    parts.forEach(function(p){
      if(p === "ad" && opts.ad){
        html += block("ad",
          '<div class="sr-sponsor">赞助</div>'+srcRow(opts.ad.site, opts.ad.url)+
          '<span class="sr-title">'+esc(opts.ad.title)+'</span><p class="sr-desc">'+esc(opts.ad.desc)+'</p>');
      } else if(p === "ai" && opts.ai){
        html += block("ai",
          '<div class="serp-ai"><div class="ai-head">'+SPARK+'AI 概览</div>'+
          '<p class="sr-desc" style="font-size:13.5px;color:var(--ink)">'+esc(opts.ai.text)+'</p>'+
          '<div class="ai-src">'+(opts.ai.sources||[]).map(function(x){ return '<span>'+esc(x)+'</span>'; }).join("")+'</div></div>');
      } else if(p === "snippet" && opts.snippet){
        html += block("snippet",
          '<div class="serp-snip"><ol>'+(opts.snippet.list||[]).map(function(x){ return "<li>"+esc(x)+"</li>"; }).join("")+'</ol></div>'+
          srcRow(opts.snippet.site, opts.snippet.url)+'<span class="sr-title">'+esc(opts.snippet.title)+'</span>');
      } else if(p === "organic"){
        (opts.organic||[]).forEach(function(r){
          html += block("organic", srcRow(r.site, r.url)+'<span class="sr-title">'+esc(r.title)+'</span><p class="sr-desc">'+esc(r.desc)+'</p>');
        });
      } else if(p === "paa" && opts.paa){
        html += block("paa", '<div class="paa-head">其他人还搜了</div>'+
          opts.paa.map(function(q){ return '<div class="paa-q"><span>'+esc(q)+'</span><span class="paa-x">⌄</span></div>'; }).join(""));
      } else if(p === "related" && opts.related){
        html += block("related", '<div class="paa-head">相关搜索</div><div class="serp-rel">'+
          opts.related.map(function(x){ return "<span>"+esc(x)+"</span>"; }).join("")+'</div>');
      }
    });
    var seen = {};
    var btns = parts.filter(function(p){ if(seen[p]) return false; seen[p]=1; return true; })
      .map(function(p){ return '<button data-p="'+p+'" type="button">'+PART_META[p].btn+'</button>'; }).join("");
    var intro = opts.intro || "点上面的按钮，逐块认识这页结果。";
    host.innerHTML =
      '<div class="card pad">'+
        '<div class="parts" data-el="btns">'+btns+'</div>'+
        '<div class="serp" style="margin-top:14px">'+
          '<div class="serp-bar"><div class="serp-q"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>'+esc(opts.query||"")+'</div></div>'+
          '<div class="serp-body">'+html+'</div>'+
        '</div>'+
        '<div class="verdict" data-el="v">'+intro+'</div>'+
      '</div>';
    var blocks = host.querySelectorAll(".serp-block");
    var bts = host.querySelectorAll('[data-el="btns"] button');
    var cur = null;
    function show(p){
      cur = p;
      Array.prototype.forEach.call(bts, function(b){ b.classList.toggle("on", b.dataset.p === p); });
      Array.prototype.forEach.call(blocks, function(bl){
        bl.classList.toggle("on", p != null && bl.dataset.part === p);
        bl.classList.toggle("dim", p != null && bl.dataset.part !== p);
      });
      host.querySelector('[data-el="v"]').innerHTML = p ? ((opts.info && opts.info[p]) || PART_META[p].info) : intro;
    }
    Array.prototype.forEach.call(bts, function(b){
      b.addEventListener("click", function(){ show(cur === b.dataset.p ? null : b.dataset.p); });
    });
  };

  /* ---------- 爬虫模拟 ----------
     链接是爬虫唯一的路：逐步抓取一个小站点，孤岛页永远不会被发现。
     opts 可自定义 nodes / edges / start；默认自带教学用小站点。 */
  W.crawlerSim = function(host, opts){
    opts = opts || {};
    var nodes = opts.nodes || [
      { id:"home",   label:"首页",    x:320, y:42 },
      { id:"catA",   label:"栏目 A",  x:170, y:130 },
      { id:"catB",   label:"栏目 B",  x:470, y:130 },
      { id:"p1",     label:"文章 A1", x:80,  y:222 },
      { id:"p2",     label:"文章 A2", x:255, y:222 },
      { id:"p3",     label:"文章 B1", x:470, y:222 },
      { id:"orphan", label:"孤岛页",  x:585, y:42, orphan:true }
    ];
    var edges = opts.edges || [["home","catA"],["home","catB"],["catA","p1"],["catA","p2"],["catB","p3"]];
    var start = opts.start || "home";
    var NW = 96, NH = 34;
    host.innerHTML =
      '<div class="card pad">'+
        '<div class="chartbox"><svg viewBox="0 0 640 280" role="img" aria-label="爬虫抓取模拟：页面链接图"></svg></div>'+
        '<div class="crawl-foot">'+
          '<button class="btn mini" data-act="step" type="button">抓取下一页</button>'+
          '<button class="btn ghost mini" data-act="all" type="button">一键抓完</button>'+
          '<button class="btn ghost mini" data-act="reset" type="button">重置</button>'+
          '<span class="crawl-status" data-el="st"></span>'+
        '</div>'+
        '<div class="verdict" data-el="v" style="display:none"></div>'+
      '</div>';
    var svg = host.querySelector("svg"), status = host.querySelector('[data-el="st"]'), v = host.querySelector('[data-el="v"]');
    var nextBtn = host.querySelector('[data-act="step"]'), allBtn = host.querySelector('[data-act="all"]');
    var queue, crawled, discovered, done;
    function byId(id){ for(var i=0;i<nodes.length;i++) if(nodes[i].id===id) return nodes[i]; }
    function defs(){
      var acc = S.cssv("--accent"), line = S.cssv("--line");
      return '<defs>'+
        '<marker id="arrA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="'+acc+'"/></marker>'+
        '<marker id="arrL" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="'+line+'"/></marker>'+
        '</defs>';
    }
    function render(){
      var line = S.cssv("--line"), faint = S.cssv("--ink-faint"), acc = S.cssv("--accent"),
          ink = S.cssv("--ink"), surface = S.cssv("--surface"), red = S.cssv("--hue-red"), paper = S.cssv("--paper");
      var f = "";
      edges.forEach(function(e){
        var a = byId(e[0]), b = byId(e[1]), hot = crawled[e[0]];
        f += '<line x1="'+a.x+'" y1="'+(a.y+NH/2)+'" x2="'+b.x+'" y2="'+(b.y-NH/2-6)+'" stroke="'+(hot?acc:line)+'" stroke-width="'+(hot?2:1.4)+'" marker-end="url(#arr'+(hot?'A':'L')+')"/>';
      });
      nodes.forEach(function(n){
        var stt = crawled[n.id] ? "crawled" : (discovered[n.id] ? "queued" : "hidden");
        var fill = stt==="crawled" ? acc : surface;
        var stroke = stt!=="hidden" ? acc : (done && n.orphan ? red : line);
        var txt = stt==="crawled" ? paper : (stt==="hidden" ? faint : ink);
        var dash = stt==="hidden" ? ' stroke-dasharray="4 3"' : '';
        f += '<rect x="'+(n.x-NW/2)+'" y="'+(n.y-NH/2)+'" width="'+NW+'" height="'+NH+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.5"'+dash+'/>';
        f += '<text x="'+n.x+'" y="'+(n.y+4.5)+'" text-anchor="middle" font-size="13" font-weight="600" fill="'+txt+'">'+esc(n.label)+'</text>';
        if(done && n.orphan) f += '<text x="'+n.x+'" y="'+(n.y+NH/2+17)+'" text-anchor="middle" font-size="11.5" font-weight="700" fill="'+red+'">从未被发现</text>';
      });
      svg.innerHTML = defs() + f;
      var nC = Object.keys(crawled).length;
      status.innerHTML = '已抓取 <b>'+nC+'</b> 页' + (queue.length ? ' · 待抓取：'+queue.map(function(id){ return byId(id).label; }).join("、") : "");
      if(done){
        v.style.display = "";
        v.innerHTML = '<strong>抓取结束。</strong>爬虫顺着链接找到了 '+nC+' 个页面——但<strong style="color:'+red+'">孤岛页从头到尾没有被发现</strong>：没有任何链接指向它，它就不存在于爬虫的世界里。给页面「修路」（内部链接，第 12 课）和「递地图」（sitemap，第 14 课）就是为了解决这个问题。';
      } else {
        v.style.display = "none";
      }
      nextBtn.disabled = done; allBtn.disabled = done;
    }
    function step(){
      if(!queue.length) return;
      var id = queue.shift(); crawled[id] = 1;
      edges.forEach(function(e){ if(e[0]===id && !discovered[e[1]]){ discovered[e[1]] = 1; queue.push(e[1]); } });
      if(!queue.length) done = true;
      render();
    }
    function reset(){ queue = [start]; crawled = {}; discovered = {}; discovered[start] = 1; done = false; render(); }
    nextBtn.addEventListener("click", step);
    allBtn.addEventListener("click", function(){ var g = 0; while(queue.length && g++ < 99) step(); });
    host.querySelector('[data-act="reset"]').addEventListener("click", reset);
    reset();
    S.registerRedraw(render);
  };

  /* ---------- 排名位置 → 点击率（示意数据）----------
     opts: { data?:[10 个百分比] } */
  W.ctrCurve = function(host, opts){
    opts = opts || {};
    var data = opts.data || [27.6, 15.8, 11.0, 8.4, 6.3, 4.9, 3.9, 3.3, 2.7, 2.4];
    host.innerHTML =
      '<div class="card pad">'+
        '<div class="chartbox"><svg viewBox="0 0 640 250" role="img" aria-label="不同排名位置的平均点击率柱状图"></svg></div>'+
        '<div class="controls" style="margin-top:14px">'+
          '<div class="sld"><label>你的排名位置</label><input type="range" min="1" max="10" step="1" value="3" data-el="pos" aria-label="排名位置"><span class="v" data-el="pv"></span></div>'+
          '<div class="sld"><label>这个词每月搜索次数</label><input type="range" min="100" max="10000" step="100" value="1000" data-el="vol" aria-label="每月搜索次数"><span class="v" data-el="vv"></span></div>'+
        '</div>'+
        '<div class="verdict" data-el="v"></div>'+
        '<p class="muted" style="font-size:12.5px;margin:10px 0 0">示意数据：取自公开 CTR 研究的平均量级（不同行业、不同 SERP 版块差异很大），用于建立直觉，不是精确预测。</p>'+
      '</div>';
    var svg = host.querySelector("svg"), pos = host.querySelector('[data-el="pos"]'), vol = host.querySelector('[data-el="vol"]');
    function draw(){
      var p = +pos.value, mv = +vol.value;
      var acc = S.cssv("--accent"), line = S.cssv("--line"), soft = S.cssv("--ink-soft"), faint = S.cssv("--ink-faint");
      var WD = 640, HT = 250, pL = 20, pB = 32, pT = 26, bw = 40;
      var gap = (WD - pL - 20 - 10*bw) / 9;
      var max = Math.max.apply(null, data);
      var f = "";
      data.forEach(function(val, i){
        var x = pL + i*(bw+gap), h = (val/max)*(HT-pT-pB), y = HT-pB-h, on = (i+1)===p;
        f += '<rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+h+'" fill="'+(on?acc:line)+'"/>';
        f += '<text x="'+(x+bw/2)+'" y="'+(y-7)+'" text-anchor="middle" font-size="11.5" font-weight="'+(on?800:400)+'" fill="'+(on?acc:faint)+'">'+val+'%</text>';
        f += '<text x="'+(x+bw/2)+'" y="'+(HT-pB+20)+'" text-anchor="middle" font-size="12.5" font-weight="'+(on?800:400)+'" fill="'+(on?acc:soft)+'">'+(i+1)+'</text>';
      });
      svg.innerHTML = f;
      host.querySelector('[data-el="pv"]').textContent = "第 "+p+" 名";
      host.querySelector('[data-el="vv"]').textContent = mv.toLocaleString()+" 次";
      var clicks = Math.round(mv*data[p-1]/100), top = Math.round(mv*data[0]/100);
      host.querySelector('[data-el="v"]').innerHTML =
        '排在<strong>第 '+p+' 名</strong> ≈ '+data[p-1]+'% 的点击率 → 每月约 <strong>'+clicks.toLocaleString()+'</strong> 次访问。'+
        (p === 1 ? " 你已经站在最值钱的位置上了。" : ' 如果爬到第 1 名，同样的搜索量能带来约 <strong>'+top.toLocaleString()+'</strong> 次——是现在的 '+Math.round(top/Math.max(clicks,1)*10)/10+' 倍。');
    }
    pos.addEventListener("input", draw);
    vol.addEventListener("input", draw);
    draw();
    S.registerRedraw(draw);
  };

  /* ---------- 单选题（任选反复点，逐项讲对错，带重做）----------
     opts: { q, options:[{t, ok, why?}], explain? } */
  W.quizChoice = function(host, opts){
    opts = opts || {};
    host.innerHTML =
      '<div class="card pad"><p class="qtext" style="margin-top:0">'+opts.q+'</p>'+
        '<div class="optlist" data-el="opts">'+opts.options.map(function(o,i){ return '<button data-ok="'+(o.ok?1:0)+'" data-i="'+i+'"><span class="opt-key">'+String.fromCharCode(65+i)+'</span><span class="opt-t">'+o.t+'</span></button>'; }).join("")+'</div>'+
        '<div class="fb" data-el="fb"></div>'+
        '<div class="quiz-foot"><button class="btn ghost mini" data-act="reset" type="button" style="display:none">重做</button></div></div>';
    var btns = host.querySelectorAll('[data-el="opts"] button'), fb = host.querySelector('[data-el="fb"]'), reset = host.querySelector('[data-act="reset"]');
    function clearMarks(){ Array.prototype.forEach.call(btns, function(b){ b.classList.remove("correct","wrong"); }); }
    Array.prototype.forEach.call(btns, function(btn){
      btn.addEventListener("click", function(){
        clearMarks();
        var ok = btn.dataset.ok === "1", why = (opts.options[+btn.dataset.i]||{}).why;
        btn.classList.add(ok ? "correct" : "wrong");
        fb.className = "fb show " + (ok ? "ok" : "no");
        fb.innerHTML = '<span class="fb-tag">'+(ok ? "✓ 答对了" : "✗ 再想想")+'</span><span class="fb-body">'+(why||opts.explain||"")+(ok ? "" : "（换一个选项再看看）")+'</span>';
        reset.style.display = "";
      });
    });
    reset.addEventListener("click", function(){ clearMarks(); fb.className = "fb"; fb.innerHTML = ""; reset.style.display = "none"; });
  };

  /* ---------- 填空 ----------
     opts: { prompt?, parts:[ "文字" | {a:[可接受答案], w?} ], okText?, noText?, revealText? } */
  W.fillBlank = function(host, opts){
    opts = opts || {};
    var idx = 0, ans = [];
    var inner = opts.parts.map(function(p){
      if(typeof p === "string") return '<span>'+p+'</span>';
      var id = "b"+(idx++); ans.push({id:id, a:p.a});
      return '<input type="text" data-b="'+id+'" aria-label="填空" placeholder="? ?"'+(p.w ? (' style="width:'+p.w+'px"') : '')+'>';
    }).join(" ");
    host.innerHTML =
      '<div class="card pad">'+(opts.prompt ? ('<p class="qtext" style="margin-top:0">'+opts.prompt+'</p>') : '')+
        '<div class="blank">'+inner+'</div>'+
        '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-act="check">检查答案</button><button class="btn ghost" data-act="reveal">显示答案</button></div>'+
        '<div class="fb" data-el="fb"></div></div>';
    function norm(s){ return (s||"").trim().replace(/\s+/g,"").toLowerCase().replace(/[。，,、．.]/g,""); }
    var fb = host.querySelector('[data-el="fb"]');
    function run(reveal){
      var allok = true;
      ans.forEach(function(a){
        var el = host.querySelector('[data-b="'+a.id+'"]');
        if(reveal){ el.value = a.a[0]; el.classList.remove("bad"); el.classList.add("good"); return; }
        var ok = a.a.some(function(x){ return norm(x) === norm(el.value); });
        el.classList.toggle("good", ok); el.classList.toggle("bad", !ok); if(!ok) allok = false;
      });
      if(reveal){ fb.className = "fb show ok"; fb.innerHTML = opts.revealText || "答案已填入。"; return; }
      fb.className = "fb show " + (allok ? "ok" : "no");
      fb.innerHTML = allok ? (opts.okText || "✓ 全对！") : (opts.noText || "有几个还不对（标红的框），改完再点一次检查。");
    }
    host.querySelector('[data-act="check"]').addEventListener("click", function(){ run(false); });
    host.querySelector('[data-act="reveal"]').addEventListener("click", function(){ run(true); });
  };

  /* ---------- 关键词归类 ----------
     把每个词分到若干类别（如四种搜索意图 / 三类关键词）。点错给提示，全对亮进度条。
     opts: { intro?, cats:[{key,label,hint?}], items:[{kw,cat,why?}], doneText? } */
  W.classify = function(host, opts){
    opts = opts || {};
    var cats = opts.cats || [], items = opts.items || [], total = items.length, doneN = 0;
    function labelOf(k){ for(var i=0;i<cats.length;i++) if(cats[i].key===k) return cats[i].label; return k; }
    var legend = cats.map(function(c){ return '<div class="kw-leg"><b>'+esc(c.label)+'</b><span>'+esc(c.hint||"")+'</span></div>'; }).join("");
    var rows = items.map(function(it,i){
      var btns = cats.map(function(c){ return '<button data-cat="'+c.key+'" type="button">'+esc(c.label)+'</button>'; }).join("");
      return '<div class="kw-row" data-i="'+i+'" data-cat="'+esc(it.cat)+'">'+
        '<span class="kw-term">'+esc(it.kw)+' <span class="kw-tick">✓</span></span>'+
        '<div class="kw-btns">'+btns+'</div>'+
        '<p class="kw-why"></p></div>';
    }).join("");
    host.innerHTML =
      '<div class="card pad"><div class="kwbucket">'+
        (opts.intro ? '<p class="qtext" style="margin-top:0">'+opts.intro+'</p>' : '')+
        '<div class="kw-legend" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))">'+legend+'</div>'+
        '<div class="kw-list">'+rows+'</div>'+
        '<div class="kw-bar"><span></span></div><div class="kw-progt"></div>'+
        '<div class="kw-done"></div>'+
      '</div></div>';
    var bar = host.querySelector('.kw-bar span'), progt = host.querySelector('.kw-progt'), done = host.querySelector('.kw-done');
    function refresh(){
      bar.style.width = (total ? doneN/total*100 : 0) + "%";
      progt.textContent = "已归类 " + doneN + " / " + total;
      if(doneN === total && total){ done.className = "kw-done show"; done.innerHTML = opts.doneText || "✓ 全部归类正确！读懂意图，是给对内容的第一步。"; }
    }
    Array.prototype.forEach.call(host.querySelectorAll(".kw-row"), function(row){
      var want = row.dataset.cat, why = (items[+row.dataset.i]||{}).why || "";
      Array.prototype.forEach.call(row.querySelectorAll(".kw-btns button"), function(b){
        b.addEventListener("click", function(){
          if(row.classList.contains("correct")) return;
          if(b.dataset.cat === want){
            row.classList.remove("wrong"); row.classList.add("correct"); doneN++;
            row.querySelector(".kw-why").innerHTML = '<span class="lead">'+esc(labelOf(want))+'</span> · ' + why;
            refresh();
          } else {
            row.classList.add("wrong");
            Array.prototype.forEach.call(row.querySelectorAll(".kw-btns button"), function(x){ x.classList.remove("pick"); });
            b.classList.add("pick");
            row.querySelector(".kw-why").innerHTML = '<span class="lead" style="color:var(--hue-red)">再想想</span> · 这个词的目的更接近另一类，换一个试试。';
          }
        });
      });
    });
    refresh();
  };
})();
