FROM smartlab/vuetify

RUN apk update  && \
    apk add --no-cache ca-certificates wget openjdk8-jre && \
    update-ca-certificates && \
    wget https://midia.mpt.mp.br/tmp/zookeeper-cli-1.4.zip --no-check-certificate -P /tmp/ && \
    unzip /tmp/zookeeper-cli-1.4.zip -d /tmp/ && \    
    mv /tmp/zookeeper-cli-1.4 /opt/ && \
    chmod +x /opt/zookeeper-cli-1.4/bin/zk && \
    rm -rf /var/cache/apk/*

EXPOSE 8081
WORKDIR /home/node/app

ARG ZOOKEEPER_HOST
ARG ZOOKEEPER_PORT
ENV ZOOKEEPER_HOST ${ZOOKEEPER_HOST:-zookeeper.mpt.mp.br}
ENV ZOOKEEPER_PORT ${ZOOKEEPER_PORT:-2181}

COPY app /home/node/app
RUN chown -R node:node /home/node/app && \
    chmod a+x /home/node/app/start.sh
USER node
CMD '/home/node/app/start.sh'
