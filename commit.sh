#!/bin/bash

FORCE_FLAG=""
MESSAGE=""

for arg in "$@"; do
  if [ "${arg}" == "-f" ]; then
		FORCE_FLAG="-f"
  else
    CATAGORY="${arg}"
  fi
done

git add .;
git commit -a --allow-empty-message -m "$MESSAGE";
if [[ "$1" != "nop" ]]; then
	git push $FORCE_FLAG;
fi
git pull;
