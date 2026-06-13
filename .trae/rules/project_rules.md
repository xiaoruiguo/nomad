# 远程服务器角色定位
远程服务器nomad1,作为数据库服务器，运行PostgreSQL数据库
远程服务器nomad2,作为应用后端服务器
远程服务器nomad3,作为应用前端服务器,root用户密码为vagrant
远程服务器nomad4,作为网关服务器，运行Traefik网关

# 部署要求
不使用容器，使用系统包

# 前端源码目录
原生(Ember)前端源码目录为 ui/
重构(React)后的前端源码目录为 newui/
