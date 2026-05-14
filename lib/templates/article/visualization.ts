import { Scene, ArticleScript, VisualizationType, FlowchartData, FigureSheetData, ModuleMapData } from "../../types";
import { escapeHtml } from "../../pipeline/shared";

export function renderVisualization(scene: Scene, script: ArticleScript): string {
  const viz = scene.content.visualization;
  if (!viz) return "";

  const cs = script.style_dna.color_scheme;

  let innerHTML = "";
  switch (viz.type) {
    case "flowchart":
      innerHTML = renderFlowchart(viz.data as FlowchartData, cs);
      break;
    case "figure_sheet":
      innerHTML = renderFigureSheet(viz.data as FigureSheetData, cs);
      break;
    case "module_map":
      innerHTML = renderModuleMap(viz.data as ModuleMapData, cs);
      break;
    case "animation_sandbox":
      innerHTML = renderAnimationSandbox(viz.data as any, cs);
      break;
    default:
      innerHTML = `<p class="text-center text-sm opacity-60">暂不支持的可视化类型: ${viz.type}</p>`;
  }

  return `<section class="scene article-viz" id="${scene.id}" data-section-index="${scene.chapterIndex}">
  <div class="max-w-4xl mx-auto px-6 w-full">
    <div class="reveal viz-container">
      <div class="viz-title">${escapeHtml(viz.title)}</div>
      ${innerHTML}
    </div>
  </div>
</section>`;
}

// ============================================
// 1. Annotated Flowchart
// ============================================

function renderFlowchart(data: FlowchartData, cs: any): string {
  const nodes = data.nodes || [];
  const edges = data.edges || [];
  const annotations = data.annotations || {};

  if (nodes.length === 0) return `<p class="text-center opacity-60">暂无流程数据</p>`;

  const nodeWidth = 140;
  const nodeHeight = 50;
  const gapX = 60;
  const startX = 40;
  const startY = 40;

  // 自动布局：水平排列
  const positioned = nodes.map((n, i) => ({
    ...n,
    x: n.x !== undefined ? n.x * (nodeWidth + gapX) + startX : i * (nodeWidth + gapX) + startX,
    y: n.y !== undefined ? n.y * 80 + startY : startY,
  }));

  const maxX = Math.max(...positioned.map((n) => n.x + nodeWidth)) + startX;
  const maxY = Math.max(...positioned.map((n) => n.y + nodeHeight)) + 80 + startY;

  const nodeMap = new Map(positioned.map((n) => [n.id, n]));

  return `<div class="flowchart-wrapper overflow-x-auto">
<svg viewBox="0 0 ${maxX} ${maxY}" class="mx-auto" style="min-width:${maxX}px">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="${cs.text}66"/>
    </marker>
  </defs>
  ${edges.map((e) => {
    const from = nodeMap.get(e.from);
    const to = nodeMap.get(e.to);
    if (!from || !to) return "";
    const x1 = from.x + nodeWidth;
    const y1 = from.y + nodeHeight / 2;
    const x2 = to.x;
    const y2 = to.y + nodeHeight / 2;
    return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${cs.text}44" stroke-width="2" marker-end="url(#arrow)"/>`;
  }).join("\n")}
  ${positioned.map((n, i) => {
    const anno = annotations[n.id];
    const colors = [cs.primary, cs.secondary, cs.accent, "#8B5CF6", "#EC4899"];
    const fill = colors[i % colors.length];
    return `<g class="flow-node" data-node="${escapeHtml(n.id)}">
      <rect x="${n.x}" y="${n.y}" width="${nodeWidth}" height="${nodeHeight}" rx="8" fill="${fill}" opacity="0.85"/>
      <text x="${n.x + nodeWidth / 2}" y="${n.y + nodeHeight / 2 + 5}" text-anchor="middle" fill="white" font-size="13" font-weight="500">${escapeHtml(n.label)}</text>
      ${anno ? `<g class="flow-annotation" opacity="0" style="transition:opacity 0.3s">
        <rect x="${n.x - 10}" y="${n.y + nodeHeight + 8}" width="${nodeWidth + 20}" height="36" rx="6" fill="#1E293B" stroke="${fill}" stroke-width="1"/>
        <text x="${n.x + nodeWidth / 2}" y="${n.y + nodeHeight + 30}" text-anchor="middle" fill="#CBD5E1" font-size="11">${escapeHtml(anno)}</text>
      </g>` : ""}
    </g>`;
  }).join("\n")}
</svg>
<style>
.flow-node { cursor: pointer; }
.flow-node:hover rect { opacity: 1; filter: brightness(1.2); }
.flow-node:hover .flow-annotation { opacity: 1 !important; }
</style>
</div>`;
}

// ============================================
// 2. SVG Figure Sheet
// ============================================

function renderFigureSheet(data: FigureSheetData, cs: any): string {
  const components = data.components || [];
  if (components.length === 0) return `<p class="text-center opacity-60">暂无图解数据</p>`;

  const boxW = 160;
  const boxH = 48;
  const cols = 2;
  const gap = 20;
  const startX = 40;
  const startY = 40;

  const positioned = components.map((c, i) => ({
    ...c,
    x: startX + (i % cols) * (boxW + gap),
    y: startY + Math.floor(i / cols) * (boxH + gap + 30),
  }));

  const maxX = startX + cols * (boxW + gap);
  const rows = Math.ceil(components.length / cols);
  const maxY = startY + rows * (boxH + gap + 30) + 20;

  const colors = ["#3B82F6", "#F59E0B", "#10B981", "#EC4899", "#8B5CF6", "#06B6D4"];

  return `<div class="figure-wrapper overflow-x-auto">
<svg viewBox="0 0 ${maxX} ${maxY}" class="mx-auto" style="min-width:${maxX}px">
  ${positioned.map((c, i) => {
    const color = colors[i % colors.length];
    return `<g class="figure-component" data-component="${escapeHtml(c.id)}">
      <rect x="${c.x}" y="${c.y}" width="${boxW}" height="${boxH}" rx="6" fill="${color}18" stroke="${color}" stroke-width="1.5"/>
      <text x="${c.x + boxW / 2}" y="${c.y + 20}" text-anchor="middle" fill="${color}" font-size="12" font-weight="600">${escapeHtml(c.label)}</text>
      ${c.description ? `<text x="${c.x + boxW / 2}" y="${c.y + 38}" text-anchor="middle" fill="${cs.text}88" font-size="10">${escapeHtml(c.description.slice(0, 20))}</text>` : ""}
    </g>`;
  }).join("\n")}
</svg>
<div class="figure-legend mt-4 grid grid-cols-2 gap-2 max-w-lg mx-auto">
  ${components.map((c, i) => {
    const color = colors[i % colors.length];
    return `<div class="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1.5 rounded transition" onclick="highlightFigure('${c.id}')">
      <div class="w-3 h-3 rounded" style="background:${color}33;border:1.5px solid ${color}"></div>
      <span class="text-xs" style="color:${cs.text}bb">${escapeHtml(c.label)}</span>
    </div>`;
  }).join("\n")}
</div>
<script>
function highlightFigure(id) {
  document.querySelectorAll('.figure-component rect').forEach(r => r.style.opacity = '0.4');
  const target = document.querySelector('.figure-component[data-component="' + id + '"] rect');
  if (target) target.style.opacity = '1';
  setTimeout(() => document.querySelectorAll('.figure-component rect').forEach(r => r.style.opacity = '1'), 1500);
}
</script>
</div>`;
}

// ============================================
// 3. Module Map
// ============================================

function renderModuleMap(data: ModuleMapData, cs: any): string {
  const root = data.root;
  const modules = data.modules || [];
  if (!root) return `<p class="text-center opacity-60">暂无模块数据</p>`;

  const width = 600;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const rootR = 50;
  const childR = 36;

  const children = modules.filter((m) => m.parent === root.id || !m.parent);
  const angleStep = children.length > 0 ? (Math.PI * 2) / children.length : 0;
  const dist = 140;

  const positioned = children.map((m, i) => {
    const angle = i * angleStep - Math.PI / 2;
    return {
      ...m,
      cx: centerX + Math.cos(angle) * dist,
      cy: centerY + Math.sin(angle) * dist,
    };
  });

  const colors = [cs.primary, cs.secondary, cs.accent, "#EC4899", "#F59E0B", "#8B5CF6"];

  return `<div class="module-wrapper overflow-x-auto">
<svg viewBox="0 0 ${width} ${height}" class="mx-auto" style="min-width:${width}px">
  ${positioned.map((m, i) => {
    const color = colors[i % colors.length];
    return `<path d="M${centerX} ${centerY} Q${(centerX + m.cx) / 2} ${(centerY + m.cy) / 2 - 20} ${m.cx} ${m.cy}" stroke="${cs.text}33" stroke-width="1.5" fill="none"/>`;
  }).join("\n")}
  <g class="module-node root" data-module="${escapeHtml(root.id)}">
    <circle cx="${centerX}" cy="${centerY}" r="${rootR}" fill="${cs.primary}" opacity="0.9"/>
    <text x="${centerX}" y="${centerY + 5}" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${escapeHtml(root.label)}</text>
  </g>
  ${positioned.map((m, i) => {
    const color = colors[i % colors.length];
    return `<g class="module-node child" data-module="${escapeHtml(m.id)}" data-parent="${escapeHtml(root.id)}">
      <circle cx="${m.cx}" cy="${m.cy}" r="${childR}" fill="${color}" opacity="0.85"/>
      <text x="${m.cx}" y="${m.cy + 4}" text-anchor="middle" fill="white" font-size="11" font-weight="500">${escapeHtml(m.label)}</text>
    </g>`;
  }).join("\n")}
</svg>
<style>
.module-node { cursor: pointer; transition: transform 0.3s; }
.module-node:hover { transform: scale(1.08); }
.module-node:hover circle { filter: brightness(1.2); }
</style>
</div>`;
}

// ============================================
// 4. Animation Sandbox
// ============================================

function renderAnimationSandbox(data: any, cs: any): string {
  const steps = data.steps || [{ caption: "步骤 1" }, { caption: "步骤 2" }];

  return `<div class="animation-sandbox" style="background:rgba(255,255,255,0.03);border-radius:12px;padding:1.5rem">
  <div class="sandbox-controls mb-4 flex flex-wrap gap-2 items-center">
    <button onclick="sandboxPlay()" class="sandbox-btn px-3 py-1.5 rounded text-sm font-medium" style="background:${cs.primary};color:white">▶ 播放</button>
    <button onclick="sandboxPause()" class="sandbox-btn px-3 py-1.5 rounded text-sm" style="background:${cs.text}22;color:${cs.text}">⏸ 暂停</button>
    <button onclick="sandboxStep()" class="sandbox-btn px-3 py-1.5 rounded text-sm" style="background:${cs.text}22;color:${cs.text}">⏭ 步进</button>
    <input type="range" min="0.5" max="2" step="0.5" value="1" onchange="sandboxSpeed=this.value" class="w-20 accent-[${cs.primary}]"/>
  </div>
  <div class="sandbox-canvas flex items-center justify-center" style="height:180px;background:rgba(0,0,0,0.2);border-radius:8px;position:relative;overflow:hidden">
    <div id="sandbox-stage" class="text-center transition-all duration-500" style="color:${cs.primary};font-size:3rem;font-weight:800">
      ●
    </div>
  </div>
  <div class="sandbox-caption mt-4 text-sm" style="color:${cs.text}88">
    第 <span id="sandbox-step-num" class="font-bold" style="color:${cs.primary}">1</span> 步：<span id="sandbox-caption">${escapeHtml(steps[0].caption)}</span>
  </div>
</div>
<script>
(function(){
  const steps = ${JSON.stringify(steps)};
  let current = 0;
  let playing = false;
  let timer = null;
  window.sandboxSpeed = 1;
  const stage = document.getElementById('sandbox-stage');
  const numEl = document.getElementById('sandbox-step-num');
  const capEl = document.getElementById('sandbox-caption');

  function update() {
    if (current >= steps.length) current = 0;
    const s = steps[current];
    numEl.textContent = current + 1;
    capEl.textContent = s.caption;
    const offsets = [0, 40, -40, 20, -20];
    const scales = [1, 1.3, 0.8, 1.1, 0.9];
    stage.style.transform = 'translateX(' + (offsets[current % offsets.length]) + 'px) scale(' + scales[current % scales.length] + ')';
    stage.style.color = ['${cs.primary}','${cs.secondary}','${cs.accent}','#EC4899','#F59E0B'][current % 5];
  }

  window.sandboxPlay = function() {
    if (playing) return;
    playing = true;
    function loop() {
      if (!playing) return;
      update();
      current++;
      timer = setTimeout(loop, 1200 / window.sandboxSpeed);
    }
    loop();
  };
  window.sandboxPause = function() {
    playing = false;
    clearTimeout(timer);
  };
  window.sandboxStep = function() {
    window.sandboxPause();
    update();
    current++;
  };
})();
</script>`;
}
