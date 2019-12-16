#!/bin/sh
set -e
echo $NODE_ENV

npm_run () {
  DATAHUB_API_BASE_URL=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/datahub_url_base" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) DATAHUB_APP_KEY=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/datahub_key" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) MAILER_API_BASE_URL=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/mailer_url_base" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) MAILER_APP_KEY=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/mailer_key" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) ACIDENTOMETROS_API_BASE_URL=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/acidentometros_url_base" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) ACIDENTOMETROS_APP_KEY=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/acidentometros_key" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) GA_ID_BASE=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/ga_id_base" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) GIT_VIEWCONF_TAG_URL=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/git_viewconf_tag_url" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) GA_ID_DV=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/ga_id_dv" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) GOOGLE_CLIENTID=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/google_clientid" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) GOOGLE_CLIENTSECRET=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/google_clientsecret" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) FACEBOOK_CLIENTID=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/facebook_clientid" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) FACEBOOK_CLIENTSECRET=$(/opt/zookeeper-cli-1.4/bin/zk -c "get -s /spai/observatoriodecente/$NODE_ENV/facebook_clientsecret" "$ZOOKEEPER_HOST":"$ZOOKEEPER_PORT" | tail -n +3) NODE_ENV=$NODE_ENV npm run $1
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

