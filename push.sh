CUR_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo $CUR_BRANCH

git checkout main;
git push;
git checkout $CUR_BRANCH;