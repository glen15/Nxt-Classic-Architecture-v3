#!/bin/bash
set -euo pipefail

# S3 버킷에 정적 파일 배포
# 사용법: ./s3.sh <버킷이름>

if [ $# -eq 0 ]; then
  echo "사용법: ./s3.sh <S3 버킷이름>"
  echo "예시:  ./s3.sh my-todo-bucket"
  exit 1
fi

BUCKET_NAME=$1

echo "=== S3 정적 호스팅 배포 ==="
echo "버킷: ${BUCKET_NAME}"
echo ""

# 1. 버킷 생성 (이미 존재하면 무시)
echo "[1/4] S3 버킷 생성..."
aws s3 mb "s3://${BUCKET_NAME}" 2>/dev/null || echo "  버킷이 이미 존재합니다."

# 2. 퍼블릭 액세스 차단 해제
echo "[2/4] 퍼블릭 액세스 설정..."
aws s3api put-public-access-block \
  --bucket "${BUCKET_NAME}" \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# 3. 버킷 정책 설정 (퍼블릭 읽기)
echo "[3/4] 버킷 정책 설정..."
aws s3api put-bucket-policy \
  --bucket "${BUCKET_NAME}" \
  --policy "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [{
      \"Sid\": \"PublicReadGetObject\",
      \"Effect\": \"Allow\",
      \"Principal\": \"*\",
      \"Action\": \"s3:GetObject\",
      \"Resource\": \"arn:aws:s3:::${BUCKET_NAME}/*\"
    }]
  }"

# 4. 파일 업로드
echo "[4/4] 파일 업로드..."
aws s3 cp index.html "s3://${BUCKET_NAME}/index.html" \
  --content-type "text/html; charset=utf-8"

# 정적 웹 호스팅 활성화
aws s3 website "s3://${BUCKET_NAME}" \
  --index-document index.html

echo ""
echo "=== 배포 완료 ==="
echo "URL: http://${BUCKET_NAME}.s3-website-ap-northeast-2.amazonaws.com"
