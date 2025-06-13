### Helm Values

#### Example

```yaml
# This is a YAML-formatted file.
# Declare variables to be passed into your templates.
applicationName: placeholder-app-name
environment: st
replicas: 1
namespace: placeholder-namespace

type: deployment

multiclusterservice:
  enabled: false

# The only use of job_purpose attribute it to define if it is a special job
# one of values secrets_sync
job_purpose: ''

containerPort: 8080

# Set to true if deploying to openshift and want a route created
openshift:
  enabled: false

# TELUS Labels/Annotations
telus:
  cmdbId: '12345'
  costCentre: '12345'
  organization: 'cdo'
  mailingList: 'TBD'

# Configure Pods Security Context
# ref: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/#set-the-security-context-for-a-pod
# @param podSecurityContext.enabled Enabled Deployment pods' Security Context
# @param podSecurityContext.fsGroup Set Deployment pod's Security Context fsGroup
podSecurityContext:
  enabled: true
  fsGroup: 1001
  runAsGroup: 1001
  runAsUser: 1001
  supplementalGroups:
    - 1001

# Configure Container Security Context
# ref: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/#set-the-security-context-for-a-pod
# @param containerSecurityContext.enabled Enabled Deployment containers' Security Context
# @param containerSecurityContext.runAsUser Set Deployment containers' Security Context runAsUser
containerSecurityContext:
  enabled: true
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - NET_RAW
  runAsGroup: 1001
  runAsUser: 1001

# Configure DNS config
# ref: https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#pod-dns-config
# @param dnsConfig.enabled Enabled Deployment pods' DNS config
# @param dnsConfig.searches Set Deployment pods' DNS config search suffixes
dnsConfig:
  enabled: false
  searches:
    - corp.ads

# Allows you set arbitrary env variables.
extraEnvs:
  - name: PORT
    value: 8080

# Custom entries in /etc/hosts
hostAliases:
  - ip: '10.92.4.10'
    hostnames:
      - 'tess-broker-zookeeper-0-pr'
  - ip: '10.92.4.11'
    hostnames:
      - 'tess-broker-zookeeper-1-pr'
  - ip: '10.92.4.12'
    hostnames:
      - 'tess-broker-zookeeper-2-pr'

envFrom:
  - secretRef:
      name: test-secret
  - configMapRef:
      name: special-config

# Allows you to add any config files and specify a path location in the volumeMounts
# such as application.yaml or log4j2.properties. Since this is clear in src control
# please do no use for sensitive data such as keys and passwords. See Secrets.
configmaps:
  key:
    properties:
      key: 'value'
      key2: 'value'
  file:
    application.yaml: |
      key:
        nestedkey: value
    log4j2.properties: |
      key = value

initContainers:
  - name: init-myservice
    image: busybox:1.28
    command:
      [
        'sh',
        '-c',
        'until nslookup myservice.$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace).svc.cluster.local; do echo waiting for myservice; sleep 2; done'
      ]
  - name: init-mydb
    image: busybox:1.28
    command:
      [
        'sh',
        '-c',
        'until nslookup mydb.$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace).svc.cluster.local; do echo waiting for mydb; sleep 2; done'
      ]

# If you add a configmap you must add a volume names "configmap" to mount to a path of your choosing
# you can also mount arbitrary volumes or otherwise leave as an empty array
volumeMounts:
  - name: configmap
    path: /etc/config
  - name: cache-dir
    path: /etc/cache
  - name: test-volume
    path: /etc/gce-pd

startupProbe:
  httpGet:
    path: /
    port: 8080

livenessProbe:
  httpGet:
    path: /
    port: 8080
  httpHeaders:
    - name: Authorization
      value: Basic dGVjaGh1YjpwYXNzdzByZA==

readinessProbe:
  httpGet:
    path: /api/version
    port: 8080
  httpHeaders:
    - name: Authorization
      value: Basic dGVjaGh1YjpwYXNzdzByZA==

# Volume mounts should have an equivalent volume name defined of required type
# this example creates and emptyDir type volume for ephemeral data
volumes:
  - name: cache-dir
    emptyDir: {}
  - name: test-volume
    # This GCE PD must already exist.
    gcePersistentDisk:
      pdName: my-data-disk
      fsType: ext4

# Mount existing secrets to a volume, it is determined the helm chart should not create secrets
# to protect security. Please do not store secret data such as keys, keystores or passwords in Git
# or in a configmap
secretMounts:
  - name: keystores
    secretName: app-keystores
    path: /etc/secrets/keystores

image:
  repository: northamerica-northeast1-docker.pkg.dev/cio-gke-devops-e4993356/applications/placeholder-namespace/placeholder-app-name-st
  tag: latest
  pullPolicy: Always # IfNotPresent

service:
  type: ClusterIP
  port: 8080

# The Nginx ingress is deprecated and teams should user Kong Primavera as the application web ingress.
ingress:
  enabled: true
  path: /bto-react-example/react/?(.*)
  hosts:
    - ''
  tls:
    - secretName: chart-example-tls
      hosts:
        - chart-example.local
  class: nginx-ingress-protected
  # Can disable modsecurity rule 949110 via annotation below to prevent 403 errors common in either of the following cases:
  #   * You wish to allow PUT/DELETE HTTP methods
  #   * Consumers must make repeated requests, to prevent "Inbound Anomaly Score Exceeded" (ie React UIs).
  annotations:
    nginx.ingress.kubernetes.io/modsecurity-snippet: SecRuleRemoveByID 949110

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

# We recommend not specifying any strategy, the default strategy of RollingUpdate will be applied
# with maxSurge:25% and maxUnavailable:25%. If you wish to change these values or change
# the strategy to Recreate then uncomment the following lines and adjust as necessary.
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 25%
    maxUnavailable: 25%

# Enable autoscaling and set utilization targets. For autoscaling on cpu/memory to work you
# must set resource limits
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 5
  targetCPUUtilizationPercentage: 50
  targetMemoryUtilizationPercentage: 75

nodeSelector: {}

tolerations: []

affinity: {}

# Uncomment the snippet of values below to implement CloudSQL proxy for your implementation
# This sidecar implementation would effectively allow you to access your instance host with 'localhost'
cloudsqlproxy:
  enabled: false
  version: '1.29.0'
  instance_connection: cio-cio-lab-eugene-np-0cdac4:northamerica-northeast1:genesys-3b7fae0c
  options: ['-log_debug_stdout=true', '-structured_logs=true']

# Configure arbitrary additional(sidecar) containers
sideCarContainers:
  datadog:
    image: datadog/agent:latest
    env:
      - name: DD_API_KEY
        value: ASDF-1234
      - name: SD_BACKEND
        value: docker

prometheus:
  enable: false
  scrapePath: '/metrics'
  scrapePort: 8080

# Configure PodMonitoring resource to have Managed Prometheus to scrap application metric for view in Cloud Monitoring
# https://cloud.google.com/stackdriver/docs/managed-prometheus/setup-managed#gmp-pod-monitoring
podmonitoring:
  enabled: false
  interval: 30s
  path: '/metrics'
  port: 8080

# Important: this section configures the GKE side for workload identity support. Make sure
# the Terraform side is also completed. Read more about it at the link below
# https://github.com/telus/tf-module-gcp-workload-identity
rbac:
  create: false
  serviceAccountAnnotations:
    {
      iam.gke.io/gcp-service-account: 'ivr-intelligent-routing@cio-smart-ivr-np-4462cd.iam.gserviceaccount.com'
    }
  serviceAccountName: 'chart-service-account'
```
