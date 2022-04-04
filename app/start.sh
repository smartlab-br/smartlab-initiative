#!/bin/sh
set -e
echo $NODE_ENV

npm_run () {
  DATAHUB_API_BASE_URL=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/datahub_url_base" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) DATAHUB_APP_KEY=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/datahub_key" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) MAILER_API_BASE_URL=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/mailer_url_base" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) MAILER_APP_KEY=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/mailer_key" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) GA_ID_BASE=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/ga_id_base" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) GIT_VIEWCONF_TAG_URL=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/git_viewconf_tag_url" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) GA_ID_DV=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/ga_id_dv" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) GRAVITEE_AM_BASE_URL=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/gravitee_am_url_base" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) GRAVITEE_AM_CLIENT_ID=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/gravitee_am_client_id" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) GRAVITEE_AM_REDIRECT_URL=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/gravitee_am_redirect_url" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) GRAVITEE_AM_MANAGER_TOKEN=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/gravitee_am_manager_token" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) GRAVITEE_AM_MANAGER_BASE_URL=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/gravitee_am_manager_base_url" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) NODE_ENV=$NODE_ENV npm run $1
}

if [ $NODE_ENV != 'development' ]; then
  npm_run "build"
  if [ $NODE_ENV = 'production' ]; then
    npm_run start
  else
    npm_run stg
  fi
else
  npm_run "dev"
fi

