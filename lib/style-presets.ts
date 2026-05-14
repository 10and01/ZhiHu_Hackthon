import { StylePreset } from "./types";

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "abyss_gaze",
    name: "深渊凝视",
    description: "高压悬疑风格，以窒息感和不确定性为核心",
    dna: {
      name: "深渊凝视",
      description: "高压悬疑风格，以窒息感和不确定性为核心",
      reference: "《消失的爱人》海报 × 赛博朋克霓虹",
      color_scheme: {
        primary: "#FF2A6D",
        secondary: "#05D9E8",
        bg: "#0D0221",
        bg_gradient: ["#0D0221", "#1A0B2E", "#2D1B4E"],
        text: "#D1D5DB",
        accent: "#FF2A6D",
      },
      typography: {
        heading: "'Noto Serif SC', serif",
        body: "'Noto Sans SC', sans-serif",
        special: "'ZCOOL XiaoWei', serif",
      },
      texture: "noise_overlay + scanline",
      mood_keywords: ["窒息", "未知", "偏执", "脆弱"],
      voice_design_prompt:
        "一个冷静中带一丝不安的女性叙事声音，30岁左右，像在深夜独自讲述恐怖故事，语速偏慢，句子间有明显停顿，紧张时声音略微颤抖",
    },
    voiceMapping: {
      voice: "冰糖",
      styleHint: "紧张，低沉，语速稍慢，带呼吸感",
    },
  },
  {
    id: "paper_warmth",
    name: "纸页温度",
    description: "现实主义风格，纸张纹理与暖褐色调，像在阅读一封旧信",
    dna: {
      name: "纸页温度",
      description: "现实主义风格，纸张纹理与暖褐色调",
      reference: "《请回答1988》片头 × 手账美学",
      color_scheme: {
        primary: "#92400E",
        secondary: "#D97706",
        bg: "#F5F0E8",
        bg_gradient: ["#F5F0E8", "#EDE8D0", "#E5DCC3"],
        text: "#451A03",
        accent: "#D97706",
      },
      typography: {
        heading: "'Noto Serif SC', serif",
        body: "'Noto Sans SC', sans-serif",
        special: "'Ma Shan Zheng', cursive",
      },
      texture: "paper_grain + subtle_noise",
      mood_keywords: ["温暖", "怀旧", "真实", "治愈"],
      voice_design_prompt:
        "一个温柔亲切的女性声音，像老朋友在耳边低语，语速平稳，带微笑感，温暖而真诚",
    },
    voiceMapping: {
      voice: "茉莉",
      styleHint: "温柔，平稳，亲切，像在耳边低语",
    },
  },
  {
    id: "lingza_blood",
    name: "灵山血雾",
    description: "东方奇幻风格，暗金与血红交织，水墨粒子",
    dna: {
      name: "灵山血雾",
      description: "东方奇幻风格，暗金与血红交织",
      reference: "《西游记》× 黑神话悟空",
      color_scheme: {
        primary: "#DC2626",
        secondary: "#F59E0B",
        bg: "#1A0505",
        bg_gradient: ["#1A0505", "#2D1810", "#451A1A"],
        text: "#FDE68A",
        accent: "#DC2626",
      },
      typography: {
        heading: "'ZCOOL XiaoWei', serif",
        body: "'Noto Sans SC', sans-serif",
        special: "'Ma Shan Zheng', cursive",
      },
      texture: "ink_wash + gold_flecks",
      mood_keywords: ["史诗", "诡异", "神圣", "暴烈"],
      voice_design_prompt:
        "一个庄重神秘的男性声音，带有史诗感，像在讲述上古传说，声音浑厚，偶尔带 reverberation",
    },
    voiceMapping: {
      voice: "苏打",
      styleHint: "庄重，史诗感，略带神秘",
    },
  },
  {
    id: "star_ocean",
    name: "星辰大海",
    description: "科幻史诗风格，深蓝与荧光青，几何线条",
    dna: {
      name: "星辰大海",
      description: "科幻史诗风格，深蓝与荧光青",
      reference: "《星际穿越》× 赛博朋克",
      color_scheme: {
        primary: "#22D3EE",
        secondary: "#818CF8",
        bg: "#0F172A",
        bg_gradient: ["#0F172A", "#1E293B", "#0A0E27"],
        text: "#E2E8F0",
        accent: "#22D3EE",
      },
      typography: {
        heading: "'Orbitron', sans-serif",
        body: "'Noto Sans SC', sans-serif",
        special: "'Share Tech Mono', monospace",
      },
      texture: "grid_lines + starfield",
      mood_keywords: ["浩瀚", "理性", "未来", "孤独"],
      voice_design_prompt:
        "一个冷静理性的中性声音，带有未来感，语速均匀，像 AI 助手在播报，偶尔带轻微的电子音效",
    },
    voiceMapping: {
      voice: "mimo_default",
      styleHint: "冷静，理性，未来感，语速均匀",
    },
  },
  {
    id: "beacon_wolf",
    name: "烽火狼烟",
    description: "历史战争风格，赭石与铁锈，粗黑字体",
    dna: {
      name: "烽火狼烟",
      description: "历史战争风格，赭石与铁锈",
      reference: "《亮剑》× 碑刻拓片",
      color_scheme: {
        primary: "#B45309",
        secondary: "#78716C",
        bg: "#1C1917",
        bg_gradient: ["#1C1917", "#292524", "#44403C"],
        text: "#E7E5E4",
        accent: "#B45309",
      },
      typography: {
        heading: "'Noto Serif SC', serif",
        body: "'Noto Sans SC', sans-serif",
        special: "'ZCOOL QingKe HuangYou', sans-serif",
      },
      texture: "stone_texture + battle_worn",
      mood_keywords: ["热血", "悲壮", "铁血", "豪情"],
      voice_design_prompt:
        "一个激昂有力的男性声音，像战场上的将军在鼓舞士气，声音洪亮，慷慨激昂，热血沸腾",
    },
    voiceMapping: {
      voice: "白桦",
      styleHint: "激昂，有力，热血，慷慨激昂",
    },
  },
  {
    id: "palace_bloom",
    name: "深宫海棠",
    description: "宫斗言情风格，胭脂与黛蓝，工笔花纹",
    dna: {
      name: "深宫海棠",
      description: "宫斗言情风格，胭脂与黛蓝",
      reference: "《甄嬛传》× 工笔画",
      color_scheme: {
        primary: "#E11D48",
        secondary: "#1E3A5F",
        bg: "#FFF1F2",
        bg_gradient: ["#FFF1F2", "#FCE7F3", "#FDF2F8"],
        text: "#4A044E",
        accent: "#E11D48",
      },
      typography: {
        heading: "'ZCOOL XiaoWei', serif",
        body: "'Noto Sans SC', sans-serif",
        special: "'Ma Shan Zheng', cursive",
      },
      texture: "silk_pattern + floral_watermark",
      mood_keywords: ["婉转", "细腻", "哀愁", "缠绵"],
      voice_design_prompt:
        "一个婉转细腻的女性声音，带有古典韵味，语速稍慢，像古代宫女在低声细语，温柔而哀伤",
    },
    voiceMapping: {
      voice: "moli",
      styleHint: "婉转，细腻，带古典韵味，稍慢",
    },
  },
  {
    id: "white_robe",
    name: "白袍之下",
    description: "医疗纪实风格，冷白与淡蓝，极简数据可视化",
    dna: {
      name: "白袍之下",
      description: "医疗纪实风格，冷白与淡蓝",
      reference: "《良医》× 医学期刊",
      color_scheme: {
        primary: "#0EA5E9",
        secondary: "#64748B",
        bg: "#F8FAFC",
        bg_gradient: ["#F8FAFC", "#F1F5F9", "#E2E8F0"],
        text: "#0F172A",
        accent: "#0EA5E9",
      },
      typography: {
        heading: "'Inter', sans-serif",
        body: "'Noto Sans SC', sans-serif",
        special: "'JetBrains Mono', monospace",
      },
      texture: "clean_white + subtle_grid",
      mood_keywords: ["专业", "冷静", "克制", "沉重"],
      voice_design_prompt:
        "一个平和专业的男性声音，像医生在客观陈述病例，声音清晰，不带感情波动，专业而克制",
    },
    voiceMapping: {
      voice: "suda",
      styleHint: "平和，专业，客观，清晰",
    },
  },
];

export function getStylePresetByGenre(genre: string): StylePreset {
  const genreMap: Record<string, string> = {
    "悬疑": "abyss_gaze",
    "惊悚": "abyss_gaze",
    "犯罪": "abyss_gaze",
    "现实情感": "paper_warmth",
    "家庭": "paper_warmth",
    "原生家庭": "paper_warmth",
    "玄幻奇幻": "lingza_blood",
    "演义": "lingza_blood",
    "西游": "lingza_blood",
    "科幻": "star_ocean",
    "脑洞": "star_ocean",
    "穿越": "star_ocean",
    "权谋": "beacon_wolf",
    "复仇": "beacon_wolf",
    "逆袭": "beacon_wolf",
    "历史": "beacon_wolf",
    "言情": "palace_bloom",
    "宫斗宅斗": "palace_bloom",
    "医疗": "white_robe",
    "纪实": "white_robe",
  };

  const presetId = genreMap[genre] || "abyss_gaze";
  return STYLE_PRESETS.find((p) => p.id === presetId) || STYLE_PRESETS[0];
}

export const EMOJI_SYMBOLS: Record<string, string> = {
  // 悬疑惊悚
  神秘女人: "👺",
  刀: "🔪",
  血: "🩸",
  黑暗: "🌑",
  监控: "📹",
  门锁: "🔒",
  手机: "📱",
  尖叫: "😱",

  // 现实情感
  外婆: "👵",
  枣花糕: "🥮",
  眼泪: "💧",
  拥抱: "🫂",
  家庭: "🏠",
  童年: "🎈",
  哥哥: "👦",
  妹妹: "👧",

  // 玄幻奇幻
  灵山: "⛰️",
  佛经: "📿",
  魔气: "🌫️",
  法术: "✨",
  妖怪: "👹",
  龙: "🐉",
  师徒: "🙏",
  取经: "📜",

  // 科幻
  太空: "🚀",
  月球: "🌙",
  AI: "🤖",
  飞船: "🛸",
  系统: "💻",
  穿越: "🌀",
  秦始皇: "👑",
  地图: "🗺️",

  // 历史战争
  剑: "⚔️",
  战场: "🏹",
  盔甲: "🛡️",
  烽火: "🔥",
  诏书: "📜",
  骑兵: "🐎",
  将军: "🎖️",
  城池: "🏯",

  // 宫斗言情
  宫殿: "🏯",
  花朵: "🌸",
  镜子: "🪞",
  毒药: "🍵",
  珠宝: "💎",
  丝绸: "🧵",
  皇后: "👸",
  皇上: "🤴",

  // 医疗纪实
  医生: "👨‍⚕️",
  医院: "🏥",
  病毒: "🦠",
  药品: "💊",
  检查: "🔬",
  病历: "📋",
  手术: "🩺",
  孩子: "👶",
};
