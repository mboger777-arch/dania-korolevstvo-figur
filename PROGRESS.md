# Даня и Королевство Фигур — урок 59 «Геометрические фигуры»
Репо: mboger777-arch/dania-korolevstvo-figur · Pages: https://mboger777-arch.github.io/dania-korolevstvo-figur/
Голоса: `nice -n 15 /home/box/tts/qw/bin/python tools/voicegen.py > /tmp/vg59.log` (возобновляемо, хеш d59)
Версия: `tools/setv.sh 20261024cN` · тесты: `python3 tools/play.py` · `python3 tools/voicecheck.py`

## Чек-лист
- [x] каркас, three r160, cannon-es 0.20, шрифты, фоны map/title
- [x] tools/lines.py (115 реплик, +c6_kv), voicegen запущен (возобновляемо)
- [x] core.js (оверлей, голос-очередь, ввод: джойстик/тап/держать/свайп, рука-подсказка, сохранение)
- [x] world.js (сцена, земля, герои, камера, физика cannon, audit3D, LEVELS)
- [x] сцены: титул, интро, карта, chapterWin, drawMedal
- [x] гл.1–3 (levels1.js) — проходятся ботом, 0 ошибок консоли
- [x] гл.4 Город Отверстий (levels2.js) — фигуры без трения cannon (collisionFilter), ручной пол; бот bKick (мягкие таймауты)
- [x] гл.5 Пчелиные соты (levels2.js)
- [x] гл.6 Колёса + гонка (levels2.js, BSTEER)
- [x] босс boss.js (клубки → 6 петель → замкнуть → шестиугольник) + финал домик + медаль
- [x] визуал джойстика (drawJoy в core.js)
- [x] play.py FULL=1 (титул→интро→карта→7 глав→перезагрузка) 844x390 ок
- [x] FULL 667x375, 932x430 — все 7 глав ок, 0 ошибок консоли, feetBad 0; листы sheets/667_*.png, sheets/932_*.png
- [x] адаптивная плотность пикселей (FPS<48 → PR до 1.0)
- [x] голоса: перегенерация, ASR, stress, voicepick, voicecheck; прогон без ?fast (реплики не обрываются)
  - voicecheck 844x390 без fast: 7/7 ok, 121 реплика, cut=[] noend=[], 0 ошибок (tests/voicecheck_844.log); ASR 116/116; stress 41 ok/22 BAD (эвристика, сомнительные — в отчёте)
- [x] setv.sh, push, проверка live
  - live v20261024d1: FULL 844x390 7/7 ok, 0 ошибок консоли (tests/live_844.log)

## Раунд 2 (замечания ревью)
- [x] модели героев по refs/lineup.jpg (world.js: makeDania/Krug/Queen/Kriv): большая голова, волосы-пряди, худи с капюшоном/шнурками/треугольником/карманом, шорты, носки, кеды; Кругляш с большими глазами, ручками, ножками; Королева: пучок, очки, корона, воротник, роба с треугольниками, фиолетовая вставка, циркуль; Кривуля — клубок тонких линий с руками-ногами, глазами и короной; дыхание, моргание, поворот головы, бег. Рендер: `python3 tools/lineup.py /tmp/x.png`
- [x] камера: dist 5.0 / h 2.4 (Даня ≈1/3 высоты экрана, замер `python3 tools/camprobe.py 844x390`), гонка/санки/бой — дальше; в катсценах говорящий крупным планом лицом к камере (talkFrame)
- [x] табличка задания: Nunito 900 52→44 design px (≥23 css px при 844x390), 1–2 строки, тёмный фон, короткие тексты; субтитры 46/38, имя 38
- [x] большие цифры: обводка 26, ставятся на сторону экрана без героя
- [x] c2_t2: «молния, у неё три звена» (ASR wer .07, ударение «звенА» ok)
- [x] FULL 844x390, 667x375, 932x430: 7/7 ok, 0 ошибок консоли (tests/full_*.log); voicecheck 7/7, cut=[] noend=[] (tests/voicecheck_844.log); листы sheets/r2_*.png
- [x] v20261024d2

## Заметки
- бот: js/bot.js (bGo/bPath/bKick/bJumpOn/BSTEER); тест `VP=844x390 CH=3 TMO=250 SHOT=5 python3 tools/play.py`
- контакт-листы: `python3 tools/sheet.py 'shots/844x390/c3_*.png' sheets/c3.png`
