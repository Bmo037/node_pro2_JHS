# 빌드 명령어
build:
	docker build -t node_app2 .
# 실행 명령어
run:
	docker run -it -d -p 8500:8500 --name node_app2 --env-file .env node_app2
# Docker 이미지 및 컨테이너의 기록 보기
history:
	docker history node_app2
# 컨테이너 중지
stop:
	docker stop node_app2
# 컨테이너에 SIGTERM 신호 보내기
kill:
	docker kill --signal="SIGTERM" node_app2
# 실행 중인 모든 컨테이너 표시
ps:
	docker ps -a
# 모든 Docker 이미지 표시
img:	
	docker images
# 모든 컨테이너 강제 제거
rm:
	docker rm -f $$(docker ps -aq)
# 모든 Docker 이미지 강제 제거
rmi:
	docker rmi -f $$(docker images -q)