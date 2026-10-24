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
- [ ] голоса: перегенерация, ASR, stress, voicepick, voicecheck; прогон без ?fast (реплики не обрываются)
- [ ] setv.sh, push, проверка live

## Заметки
- бот: js/bot.js (bGo/bPath/bKick/bJumpOn/BSTEER); тест `VP=844x390 CH=3 TMO=250 SHOT=5 python3 tools/play.py`
- контакт-листы: `python3 tools/sheet.py 'shots/844x390/c3_*.png' sheets/c3.png`
