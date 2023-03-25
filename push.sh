CUR_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo $CUR_BRANCH

git add .;
git stash;

git checkout master;
git merge origin/master;
git merge $CUR_BRANCH;
git push;
git checkout $CUR_BRANCH;

git stash pop;