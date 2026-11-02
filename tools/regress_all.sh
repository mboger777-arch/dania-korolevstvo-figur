#!/bin/bash
# Полная регрессия в фоне: nohup bash tools/regress_all.sh > out/regress_all.log 2>&1 &
cd /workspace/l59w
echo "START $(date +%T)"
timeout 600 python3 tools/regress.py > out/regress.log 2>&1; echo "regress exit $? $(date +%T)"
FULL=1 FLAGS='test&fast&mute&notour' VP=915x412 TMO=500 timeout 2700 python3 tools/play.py > out/full_915x412.log 2>&1; echo "full915 exit $? $(date +%T)"
VP=915x412 timeout 3600 python3 tools/voicetest.py > out/voicetest.log 2>&1; echo "voicetest exit $? $(date +%T)"
for vp in 667x375 932x430; do FLAGS='test&fast&mute&notour' VP=$vp CH=7,0,1,2,3,4,5,6 TMO=500 timeout 2700 python3 tools/play.py > out/ch_$vp.log 2>&1; echo "ch$vp exit $? $(date +%T)"; done
echo ALLDONE
