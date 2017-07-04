#!/bin/bash


file='./package.json'
curver()
{
   jq .version $file
}
old_version=`curver`
echo $old_version
temp=${old_version##*.}
new_version=${old_version%.*}'.'$((${temp%\"}+1))
new_version=${new_version#*\"}
echo $new_version
#替换配置文件版本
sed -i  '' 's/\("version":"\).*/\1'"$new_version"'",/g'   $file
npm run build 
exit 0
