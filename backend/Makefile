-include .env
export

N8N_HOST ?= localhost

.PHONY: up down restart logs build ps shell clean env certs help

up: certs		## 실행 (cert 없으면 자동 생성 → n8n + nginx 시작)
	docker compose up -d

down:			## 컨테이너 중지 (cert 유지)
	docker compose down

restart:		## 재시작
	docker compose restart

logs:			## 로그 확인
	docker compose logs -f

build:			## 이미지 재빌드
	docker compose build --no-cache

ps:			## 컨테이너 상태 확인
	docker compose ps

shell:			## n8n 컨테이너 셸 접속
	docker compose exec n8n sh

clean:			## 컨테이너 + 볼륨 + cert 완전 삭제 (초기화 주의!)
	docker compose down -v
	rm -rf certs

env:			## .env 파일 생성 (.env.example 복사)
	cp -n .env.example .env && echo ".env 생성 완료. 값을 채워주세요."

certs:			## SSL 인증서 생성 (mkcert 없으면 자동 설치, 이미 있으면 스킵)
	@if [ ! -f certs/cert.pem ]; then \
		if ! command -v mkcert &> /dev/null; then \
			echo "mkcert 설치 중..."; \
			brew install mkcert; \
		fi; \
		mkcert -install; \
		mkdir -p certs; \
		mkcert -cert-file certs/cert.pem -key-file certs/cert-key.pem $(N8N_HOST) 127.0.0.1; \
	fi

help:			## 사용 가능한 명령어 목록
	@grep -E '^[a-zA-Z_-]+:.*?##' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'
