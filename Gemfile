source 'https://rubygems.org'

# You may use http://rbenv.org/ or https://rvm.io/ to install and use this version
ruby ">= 2.6.10"

# Cocoapods 1.15 introduced a bug which break the build. We will remove the upper
# bound in the template on Cocoapods with next React Native release.
gem 'cocoapods', '>= 1.13', '< 1.15'
gem 'activesupport', '>= 6.1.7.5', '< 7.1.0'

# json 2.10에서 quirks_mode 옵션이 제거됐는데, 위에서 묶어 둔 cocoapods(< 1.15)가
# podspec을 쓸 때 이 옵션을 넘긴다("Invalid `Podfile` file: unknown keyword: quirks_mode").
# json은 기본 내장 gem이라 명시하지 않으면 루비에 딸려 온 최신 버전이 쓰인다.
# cocoapods 상한을 올릴 수 있게 되면 이 제약도 함께 걷어낸다.
gem 'json', '< 2.10'
