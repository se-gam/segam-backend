# AWS 리소스 정리 가이드

> **주의**: 이 가이드는 DigitalOcean 마이그레이션 완료 후, 최소 24~48시간 안정성 검증을 마친 뒤에만 실행하세요.

## 사전 확인 체크리스트

실행 전 반드시 확인:

- [ ] DigitalOcean 서버에서 모든 API 엔드포인트 정상 동작
- [ ] HTTPS 인증서 정상 발급 (Let's Encrypt)
- [ ] DNS 전환 완료 및 전파 확인 (`dig <domain>`)
- [ ] RDS 데이터가 새 PostgreSQL에 완전 마이그레이션됨
- [ ] 크론잡(스터디룸 슬롯 크롤러) 24시간 이상 정상 동작
- [ ] 프론트엔드 앱에서 새 서버로 요청 정상 처리

## 삭제 순서 (의존성 고려)

AWS 리소스는 의존성이 있으므로 **반드시 아래 순서대로** 삭제해야 합니다.

### 1단계: Application Load Balancer (ELB) 삭제

**콘솔**:

1. EC2 → Load Balancers
2. 대상 로드밸런서 선택
3. Actions → Delete
4. 확인 후 삭제

**CLI**:

```bash
# 로드밸런서 ARN 확인
aws elbv2 describe-load-balancers --query 'LoadBalancers[*].[LoadBalancerName,LoadBalancerArn]' --output table

# 삭제 (ARN 대체)
aws elbv2 delete-load-balancer --load-balancer-arn <LOAD_BALANCER_ARN>
```

**주의**: Target Group도 함께 삭제해야 합니다:

```bash
aws elbv2 describe-target-groups --query 'TargetGroups[*].[TargetGroupName,TargetGroupArn]' --output table
aws elbv2 delete-target-group --target-group-arn <TARGET_GROUP_ARN>
```

---

### 2단계: EC2 인스턴스 종료

**콘솔**:

1. EC2 → Instances
2. 대상 인스턴스 선택
3. Instance state → Terminate instance

**CLI**:

```bash
# 인스턴스 ID 확인
aws ec2 describe-instances --filters "Name=tag:Name,Values=segam*" --query 'Reservations[*].Instances[*].[InstanceId,Tags[?Key==`Name`].Value|[0],State.Name]' --output table

# 종료 (ID 대체)
aws ec2 terminate-instances --instance-ids <INSTANCE_ID>
```

---

### 3단계: NAT Gateway 삭제

**콘솔**:

1. VPC → NAT Gateways
2. 대상 NAT Gateway 선택
3. Actions → Delete NAT gateway

**CLI**:

```bash
# NAT Gateway ID 확인
aws ec2 describe-nat-gateways --query 'NatGateways[*].[NatGatewayId,State,VpcId]' --output table

# 삭제
aws ec2 delete-nat-gateway --nat-gateway-id <NAT_GATEWAY_ID>
```

**주의**: NAT Gateway 삭제 후 연결된 Elastic IP는 자동 해제되지 않습니다. 6단계에서 별도 릴리스 필요.

---

### 4단계: RDS 인스턴스 삭제 (⚠️ 최종 스냅샷 필수)

**중요**: 삭제 전 반드시 최종 스냅샷을 생성하세요. 최소 30일 이상 보관 권장.

**콘솔**:

1. RDS → Databases
2. 대상 DB 인스턴스 선택
3. Actions → Delete
4. **"Create final snapshot?"** → **Yes** (체크)
5. Final snapshot name: `segam-final-snapshot-YYYYMMDD`
6. **"Retain automated backups?"** → 선택적 (비용 발생)
7. 확인 문구 입력 후 삭제

**CLI**:

```bash
# 최종 스냅샷과 함께 삭제
aws rds delete-db-instance \
  --db-instance-identifier segam2025-db \
  --final-db-snapshot-identifier segam-final-snapshot-$(date +%Y%m%d) \
  --delete-automated-backups
```

**스냅샷 확인**:

```bash
aws rds describe-db-snapshots --db-instance-identifier segam2025-db --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime,Status]' --output table
```

---

### 5단계: EBS 볼륨 정리

EC2 종료 후 `DeleteOnTermination=false`인 볼륨이 남아있을 수 있습니다.

**콘솔**:

1. EC2 → Volumes
2. State: available (연결되지 않은 볼륨)
3. 선택 → Actions → Delete volume

**CLI**:

```bash
# 사용 가능한(미연결) 볼륨 확인
aws ec2 describe-volumes --filters "Name=status,Values=available" --query 'Volumes[*].[VolumeId,Size,CreateTime]' --output table

# 삭제
aws ec2 delete-volume --volume-id <VOLUME_ID>
```

---

### 6단계: Elastic IP 릴리스

**콘솔**:

1. EC2 → Elastic IPs
2. 미연결 IP 선택
3. Actions → Release Elastic IP addresses

**CLI**:

```bash
# Elastic IP 확인
aws ec2 describe-addresses --query 'Addresses[*].[PublicIp,AllocationId,InstanceId]' --output table

# 미연결 IP 릴리스 (InstanceId가 null인 것)
aws ec2 release-address --allocation-id <ALLOCATION_ID>
```

---

### 7단계: VPC 정리

VPC 삭제 전 모든 의존 리소스가 삭제되어야 합니다.

**삭제 순서**:

1. Security Groups (기본 제외)
2. Subnets
3. Route Tables (기본 제외)
4. Internet Gateway (VPC에서 분리 후 삭제)
5. VPC

**콘솔**:

1. VPC → Your VPCs
2. 대상 VPC 선택 (기본 VPC가 아닌 것)
3. Actions → Delete VPC (의존 리소스 함께 삭제 시도)

**CLI**:

```bash
# 보안 그룹 삭제 (기본 제외)
aws ec2 describe-security-groups --filters "Name=vpc-id,Values=<VPC_ID>" --query 'SecurityGroups[?GroupName!=`default`].[GroupId,GroupName]' --output table
aws ec2 delete-security-group --group-id <SECURITY_GROUP_ID>

# 서브넷 삭제
aws ec2 describe-subnets --filters "Name=vpc-id,Values=<VPC_ID>" --query 'Subnets[*].[SubnetId,CidrBlock]' --output table
aws ec2 delete-subnet --subnet-id <SUBNET_ID>

# 인터넷 게이트웨이 분리 및 삭제
aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=<VPC_ID>" --query 'InternetGateways[*].InternetGatewayId' --output text
aws ec2 detach-internet-gateway --internet-gateway-id <IGW_ID> --vpc-id <VPC_ID>
aws ec2 delete-internet-gateway --internet-gateway-id <IGW_ID>

# VPC 삭제
aws ec2 delete-vpc --vpc-id <VPC_ID>
```

---

### 8단계: ACM 인증서 삭제

ELB 삭제 후 더 이상 사용되지 않는 인증서 정리.

**콘솔**:

1. Certificate Manager
2. 대상 인증서 선택
3. Delete

**CLI**:

```bash
# 인증서 목록
aws acm list-certificates --query 'CertificateSummaryList[*].[CertificateArn,DomainName]' --output table

# 삭제
aws acm delete-certificate --certificate-arn <CERTIFICATE_ARN>
```

---

## 비용 절감 예상

| 리소스            | 월 비용 (예상)                     |
| ----------------- | ---------------------------------- |
| EC2 (t3.small)    | ~$15                               |
| RDS (db.t3.micro) | ~$15                               |
| NAT Gateway       | ~$32 (시간당 $0.045 + 데이터 전송) |
| ELB               | ~$16                               |
| **총계**          | **~$60+/월**                       |

마이그레이션 후: **$0/월** (DigitalOcean $12/월은 GitHub Education 크레딧으로 커버)

---

## 롤백 안내

마이그레이션 문제 발생 시:

1. Route 53 A 레코드를 다시 기존 ELB DNS로 변경
2. ELB → EC2 트래픽 복원
3. RDS 최종 스냅샷에서 새 인스턴스 생성 가능

**롤백 기간**: AWS 리소스 삭제 전까지 언제든 가능

---

## 최종 확인

모든 리소스 삭제 후:

```bash
# 남은 리소스 확인
aws ec2 describe-instances --filters "Name=instance-state-name,Values=running,stopped" --query 'Reservations[*].Instances[*].[InstanceId,Tags[?Key==`Name`].Value|[0]]' --output table

aws rds describe-db-instances --query 'DBInstances[*].[DBInstanceIdentifier,DBInstanceStatus]' --output table

aws elbv2 describe-load-balancers --query 'LoadBalancers[*].LoadBalancerName' --output table
```

모든 명령이 빈 결과를 반환하면 정리 완료.
