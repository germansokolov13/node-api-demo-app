#!/usr/bin/env bash

mc alias set local http://minio:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

mc mb --ignore-existing local/image-uploads
mc mb --ignore-existing local/image-upload-results
mc mb --ignore-existing local/image-uploads-test
mc mb --ignore-existing local/image-upload-results-test

mc policy set none local/image-uploads
mc policy set none local/image-uploads-test
mc policy set download local/image-upload-results
mc policy set download local/image-upload-results-test
