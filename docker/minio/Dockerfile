FROM minio/minio

COPY --from=minio/mc /usr/bin/mc /usr/bin/mc

ADD image-uploads-policy.json /etc/image-uploads-policy.json

#RUN mc admin policy add local image-uploads-policy /etc/image-uploads-policy.json

CMD ['server', '/data', '--console-address', ':9001']