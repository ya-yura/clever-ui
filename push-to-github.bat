@echo off
echo Pushing to GitHub...
cd /d "o:\Dev\Cleverence\proto-3"
git add -A
git commit -m "feat: complete warehouse receiving system with full functionality"
git push github master
echo Done!