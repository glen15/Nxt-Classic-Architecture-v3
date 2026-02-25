# PyMySQL Lambda Layer 생성 가이드

## 1. Layer 생성

```bash
mkdir -p python
pip install pymysql -t python/
zip -r pymysql-layer.zip python/
```

## 2. AWS CLI로 Layer 업로드

```bash
aws lambda publish-layer-version \
  --layer-name pymysql-layer \
  --zip-file fileb://pymysql-layer.zip \
  --compatible-runtimes python3.12 \
  --description "PyMySQL library for Lambda"
```

## 3. Lambda 함수에 Layer 연결

AWS 콘솔에서 Lambda 함수 설정 > Layers > Add a layer > Custom layers에서 pymysql-layer를 선택합니다.

또는 Terraform에서 `pymysql_layer_arn` 변수에 Layer ARN을 지정합니다.
