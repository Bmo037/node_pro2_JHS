# 베이스 이미지로 Node.js 사용
FROM node:16.20.2

# step 2 : Package Install
RUN apt -y update && apt -y upgrade && apt -y install git net-tools vim

# 작업 디렉토리 설정
WORKDIR '/root/Project_2-one'

# 의존성 설치
RUN git clone https://github.com/Bmo037/node_pro2_JHS.git
WORKDIR '/root/Project_2-one/node_pro2_JHS'
RUN npm install
RUN npm install -g nodemon

# # 다른 git 가져오기
# WORKDIR '/root'
# RUN git clone https://github.com/상대 깃 폴더
# WORKDIR '/root/Project_2-one'
# RUN npm install
# RUN npm install -g nodemon

# 애플리케이션이 실행될 포트 설정
EXPOSE 8500

# 애플리케이션 시작 명령어
CMD nodemon /root/Project_2-one/node_pro2_JHS/app.js 
# & nodemon /root/Project_2-one/Frontend/app.js