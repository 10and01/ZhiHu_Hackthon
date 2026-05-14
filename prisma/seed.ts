import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { zhihuUid: "demo_user_001" },
    update: {},
    create: {
      zhihuUid: "demo_user_001",
      screenName: "知乎故事工坊",
      avatarUrl: "https://picx.zhimg.com/v2-abc123_avatar.jpg",
    },
  });

  const existing = await prisma.work.findFirst({
    where: { userId: user.id },
  });
  if (existing) {
    console.log("Demo works already exist, skipping seed.");
    return;
  }

  await prisma.work.createMany({
    data: [
      {
        userId: user.id,
        title: "人脸解锁失败",
        htmlCode: `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script>
<style>@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');
body{font-family:'Noto Serif SC',serif;}</style></head>
<body class="bg-gradient-to-br from-slate-900 via-red-950 to-black text-gray-100 min-h-screen">
<div class="max-w-2xl mx-auto px-6 py-16">
<h1 class="text-4xl font-bold mb-6 text-red-400">人脸解锁失败</h1>
<p class="text-red-300/60 mb-12">凌晨三点的恐怖循环...</p>
<div class="space-y-6 text-lg leading-relaxed">
<p class="p-4 rounded-lg bg-red-950/30 border border-red-500/20">「人脸解锁失败。」凌晨三点，我听到我放在客厅充电的手机发出了语音提示。</p>
<p>我浑身寒毛瞬间竖起。一直以来，我都有一个习惯。睡前手机充电，一定是放在客厅里。</p>
<p class="p-4 rounded-lg bg-black/40">为了更好地照顾八十岁高龄并且有轻微老年痴呆的外婆，我的门一直是虚掩着的。</p>
<p class="text-red-200">我听到了人的喘息声。很轻，就那么一下，但我的耳朵还是清楚地捕捉到了。</p>
</div>
<div class="mt-12 p-6 rounded-xl bg-white/5 border border-white/10">
<h3 class="text-red-300 mb-4">情绪脉搏</h3>
<svg viewBox="0 0 400 80" class="w-full h-20"><path d="M0,60 Q50,30 100,55 T200,20 T300,50 T400,25" fill="none" stroke="#f87171" stroke-width="2"/></svg>
</div>
</div></body></html>`,
        metaJson: JSON.stringify({
          genre: "悬疑惊悚",
          mood_tags: ["紧张", "恐怖", "反转"],
          color_scheme: { primary: "#1a1a2e", secondary: "#ef4444", bg: "#0a0a0a" },
          style_dna: "暗黑悬疑 × 血月霓虹",
          character_count: 3,
          reading_time: 8,
          emotion_curve: [0.3, 0.8, 0.5, 0.9, 0.2],
        }),
        isPublic: true,
      },
      {
        userId: user.id,
        title: "夹心饼干",
        htmlCode: `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script>
<style>@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');
body{font-family:'Noto Serif SC',serif;}</style></head>
<body class="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 text-amber-900 min-h-screen">
<div class="max-w-2xl mx-auto px-6 py-16">
<h1 class="text-4xl font-bold mb-6 text-amber-800">夹心饼干</h1>
<p class="text-amber-600/60 mb-12">原生家庭里的中间女孩</p>
<div class="space-y-6 text-lg leading-relaxed text-amber-900/80">
<p class="p-4 rounded-lg bg-amber-100/50 border border-amber-300/30">你们吃过夹心饼干吗？中间那块奶酪夹心，是饼干被人喜爱的灵魂。我也是家里的夹心，上有哥哥，下有妹妹。</p>
<p>然而我不是饼干里让人垂涎的夹心，而是劣质五仁月饼中那坨被嫌弃的馅。</p>
<p class="p-4 rounded-lg bg-white/60">我跟哥哥相差四岁，生我的时候，乡下查得不严。两年后，妈妈又怀孕了，那会正是风声紧的时候。</p>
</div>
<div class="mt-12 p-6 rounded-xl bg-white/40 border border-amber-200">
<h3 class="text-amber-700 mb-4">情绪脉搏</h3>
<svg viewBox="0 0 400 80" class="w-full h-20"><path d="M0,50 Q100,60 200,40 T400,30" fill="none" stroke="#d97706" stroke-width="2"/></svg>
</div>
</div></body></html>`,
        metaJson: JSON.stringify({
          genre: "现实情感",
          mood_tags: ["治愈", "压抑", "励志"],
          color_scheme: { primary: "#92400e", secondary: "#d97706", bg: "#fffbeb" },
          style_dna: "温暖纸质 × 复古怀旧",
          character_count: 5,
          reading_time: 12,
          emotion_curve: [0.2, 0.3, 0.4, 0.6, 0.8],
        }),
        isPublic: true,
      },
    ],
  });

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
