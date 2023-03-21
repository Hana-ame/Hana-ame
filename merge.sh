echo $1

git checkout main;
git merge $1 --no-ff;
git checkout $1;