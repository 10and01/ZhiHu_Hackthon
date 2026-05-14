import { Scene, StoryScript, SceneType } from "../types";
import { generateGlobalStyles, generateEmotionPulseSVG } from "./styles";
import { renderCover } from "./cover";
import { renderChapterTitle } from "./chapter";
import { renderNarrative } from "./narrative";
import { renderCharacterCard } from "./character";
import { renderDialogue } from "./dialogue";
import { renderEmotionPeak } from "./peak";
import { renderEnding } from "./ending";

export function renderFullHTML(sceneList: Scene[], storyScript: StoryScript): string {
  const { meta, style_dna, emotion_curve, characters } = storyScript;
  const cs = style_dna.color_scheme;

  // 渲染所有场景
  const scenesHTML = sceneList.map((scene) => renderScene(scene, storyScript)).join("\n");

  // 生成导航点
  const navDots = sceneList
    .map(
      (scene, i) =>
        `<div class="scene-nav-dot" data-scene-idx="${i}" onclick="goToScene(${i})"></div>`
    )
    .join("\n");

  // 生成情绪脉搏 SVG
  const pulseSVG = generateEmotionPulseSVG(emotion_curve, cs.primary);

  // 生成角色数据 JSON
  const charactersJSON = JSON.stringify(characters);
  const emotionCurveJSON = JSON.stringify(emotion_curve);
  const sceneDataJSON = JSON.stringify(
    sceneList.map((s) => ({
      id: s.id,
      type: s.type,
      chapterIndex: s.chapterIndex,
      emotion: s.emotion,
      audio: s.audio,
    }))
  );

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${meta.title} · 知乎故事重塑工坊</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Sans+SC:wght@300;400;500;700&family=Ma+Shan+Zheng&family=ZCOOL+XiaoWei&display=swap" rel="stylesheet">
${generateGlobalStyles(storyScript)}
</head>
<body>

<!-- 场景容器 -->
<main id="story-container">
${scenesHTML}
</main>

<!-- 右侧场景导航 -->
<nav class="scene-nav" id="scene-nav">
${navDots}
</nav>

<!-- 底部情绪脉搏 -->
<div class="emotion-pulse" id="emotion-pulse">
  ${pulseSVG}
</div>

<!-- TTS 播放器 -->
<div class="tts-player" id="tts-player" style="display: none;">
  <button class="tts-btn" id="tts-toggle" onclick="toggleTTS()">▶</button>
  <input type="range" class="tts-progress" id="tts-progress" min="0" max="100" value="0" oninput="seekTTS(this.value)">
  <span class="text-xs text-white/60" id="tts-label">朗读</span>
</div>

<script>
// ===== 场景数据 =====
const CHARACTERS = ${charactersJSON};
const EMOTION_CURVE = ${emotionCurveJSON};
const SCENE_DATA = ${sceneDataJSON};

// ===== 场景控制器 =====
class SceneController {
  constructor() {
    this.scenes = document.querySelectorAll('.scene');
    this.navDots = document.querySelectorAll('.scene-nav-dot');
    this.currentScene = 0;
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.init();
  }

  init() {
    // 滚轮事件（节流）
    window.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    
    // 键盘导航
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        this.nextScene();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.prevScene();
      }
    });
    
    // 触摸支持
    let touchStartY = 0;
    window.addEventListener('touchstart', e => touchStartY = e.touches[0].clientY, { passive: true });
    window.addEventListener('touchend', e => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 60) {
        diff > 0 ? this.nextScene() : this.prevScene();
      }
    }, { passive: true });
    
    // IntersectionObserver 用于检测当前场景 + 段落揭示
    this.setupObservers();
    
    // 初始状态
    this.updateNav(0);
    this.updateEmotionState(0);
  }

  handleWheel(e) {
    e.preventDefault();
    if (this.isScrolling) return;
    
    const delta = e.deltaY;
    const threshold = 30;
    
    if (delta > threshold) {
      this.isScrolling = true;
      this.nextScene();
      setTimeout(() => { this.isScrolling = false; }, 800);
    } else if (delta < -threshold) {
      this.isScrolling = true;
      this.prevScene();
      setTimeout(() => { this.isScrolling = false; }, 800);
    }
  }

  nextScene() {
    if (this.currentScene < this.scenes.length - 1) {
      this.goToScene(this.currentScene + 1);
    }
  }

  prevScene() {
    if (this.currentScene > 0) {
      this.goToScene(this.currentScene - 1);
    }
  }

  goToScene(index) {
    if (index < 0 || index >= this.scenes.length) return;
    
    const target = this.scenes[index];
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.currentScene = index;
    this.updateNav(index);
    this.updateEmotionState(index);
    
    // 同步 TTS
    if (window.ttsPlayer && window.ttsPlayer.isPlaying) {
      window.ttsPlayer.onSceneChange(index);
    }
  }

  setupObservers() {
    // 场景级 IntersectionObserver
    const sceneObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const idx = Array.from(this.scenes).indexOf(entry.target);
          if (idx !== this.currentScene) {
            this.currentScene = idx;
            this.updateNav(idx);
            this.updateEmotionState(idx);
          }
        }
      });
    }, { threshold: [0.5] });

    this.scenes.forEach(s => sceneObserver.observe(s));

    // 段落级 reveal
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }

  updateNav(index) {
    this.navDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  updateEmotionState(index) {
    const scene = SCENE_DATA[index];
    if (!scene) return;
    
    const kf = EMOTION_CURVE[scene.emotion.keyframeRef] || scene.emotion;
    
    // 更新 CSS 变量
    document.documentElement.style.setProperty('--current-intensity', kf.intensity);
    document.documentElement.style.setProperty('--current-valence', kf.valence);
    document.documentElement.style.setProperty('--current-arousal', kf.arousal);
    
    // 更新情绪脉搏光标
    const cursor = document.getElementById('pulseCursor');
    if (cursor) {
      const progress = (index / (this.scenes.length - 1)) * 400;
      cursor.setAttribute('cx', progress);
    }
  }
}

// ===== TTS 播放器 =====
class TTSPlayer {
  constructor() {
    this.audio = new Audio();
    this.isPlaying = false;
    this.currentScene = 0;
    this.sceneAudioMap = {}; // sceneIndex -> audioUrl
    this.init();
  }

  init() {
    this.audio.onplay = () => {
      this.isPlaying = true;
      document.getElementById('tts-toggle').innerHTML = '⏸';
      document.getElementById('tts-label').textContent = '播放中';
    };
    
    this.audio.onpause = () => {
      this.isPlaying = false;
      document.getElementById('tts-toggle').innerHTML = '▶';
      document.getElementById('tts-label').textContent = '朗读';
    };
    
    this.audio.onended = () => {
      this.isPlaying = false;
      document.getElementById('tts-toggle').innerHTML = '▶';
      // 自动播放下一场景
      if (this.currentScene < SCENE_DATA.length - 1) {
        setTimeout(() => {
          window.sceneController.nextScene();
          this.playScene(this.currentScene + 1);
        }, 500);
      }
    };
    
    this.audio.ontimeupdate = () => {
      if (this.audio.duration) {
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        document.getElementById('tts-progress').value = progress;
      }
    };
  }

  setAudioMap(map) {
    this.sceneAudioMap = map;
    document.getElementById('tts-player').style.display = 'flex';
  }

  toggle() {
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.playScene(window.sceneController.currentScene);
    }
  }

  playScene(sceneIndex) {
    const url = this.sceneAudioMap[sceneIndex];
    if (!url) return;
    
    this.currentScene = sceneIndex;
    this.audio.src = url;
    this.audio.play().catch(e => console.log('TTS play failed:', e));
  }

  onSceneChange(sceneIndex) {
    if (!this.isPlaying) return;
    // 如果场景有对应的音频，自动切换
    if (this.sceneAudioMap[sceneIndex]) {
      this.playScene(sceneIndex);
    }
  }

  seek(percent) {
    if (this.audio.duration) {
      this.audio.currentTime = (percent / 100) * this.audio.duration;
    }
  }
}

// ===== 角色卡片交互 =====
function toggleCharacterCard(header) {
  const body = header.nextElementSibling;
  if (body) {
    body.classList.toggle('expanded');
  }
}

// ===== 全局函数 =====
function goToScene(index) {
  window.sceneController.goToScene(index);
}

function toggleTTS() {
  window.ttsPlayer.toggle();
}

function seekTTS(value) {
  window.ttsPlayer.seek(value);
}

// ===== 初始化 =====
window.sceneController = new SceneController();
window.ttsPlayer = new TTSPlayer();

// 如果存在预加载的 TTS 音频映射
if (window.PRELOADED_TTS_MAP) {
  window.ttsPlayer.setAudioMap(window.PRELOADED_TTS_MAP);
}
</script>

</body>
</html>`;
}

function renderScene(scene: Scene, script: StoryScript): string {
  switch (scene.type) {
    case "cover":
      return renderCover(scene, script);
    case "chapter_title":
      return renderChapterTitle(scene, script);
    case "narrative":
      return renderNarrative(scene, script);
    case "character_card":
      return renderCharacterCard(scene, script);
    case "dialogue":
      return renderDialogue(scene, script);
    case "emotion_peak":
    case "climax":
      return renderEmotionPeak(scene, script);
    case "ending":
      return renderEnding(scene, script);
    default:
      return renderNarrative(scene, script);
  }
}
