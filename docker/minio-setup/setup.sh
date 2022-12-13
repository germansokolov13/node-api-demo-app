#!/usr/bin/env bash

mc alias set local http://minio:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

mc mb --ignore-existing local/image-uploads
mc mb --ignore-existing local/image-upload-results
mc mb --ignore-existing local/image-uploads-test
mc mb --ignore-existing local/image-upload-results-test

mc anonymous set none local/image-uploads
mc anonymous set none local/image-uploads-test
mc anonymous set download local/image-upload-results
mc anonymous set download local/image-upload-results-test
