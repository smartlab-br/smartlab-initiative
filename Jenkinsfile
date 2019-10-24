#!groovy

// Arquivo de define o Pipeline para geração da imagem docker shiny-mpt
pipeline {
    agent {
        label 'master'
    }
    stages {
        stage('Pull Docker image') {
            steps {
                pullDockerImage()
            }
        }

        stage('Execute unit tests') {
            agent {
                docker { 
                    image 'smartlab/vuetify' 
                    args '-u root:root'
                    reuseNode true
                }
            }
            steps {
                executeUnitTests()
            }
            post {
                always {
                    junit 'app/test/coverage/junit/junit.xml'
                    step([$class: 'CoberturaPublisher', coberturaReportFile: 'app/test/coverage/cobertura-coverage.xml'])
                }
            }            
        }

        stage('SonarQube analysis') {
            steps {
                sonarScanner()
            }
        }

        stage('Build and Register Image') {
            steps {
                buildAndRegisterImage()
            }
        }
   }
}

def pullDockerImage() {
    //pull img docker
    def img_vue = docker.image('smartlab/vuetify:latest')
    img_vue.pull()
}

def executeUnitTests() {
    sh "apk update && apk upgrade"
    sh "apk add --no-cache bash git openssh"
    dir ("app") {
        sh "npm install"
        sh "npm run test"
    }
}

def sonarScanner() {
    dir ("app") {
        def scannerHome = tool 'sonar'
        withSonarQubeEnv('Sonar - MPT') {
            sh "${scannerHome}/bin/sonar-scanner -Dproject.settings=../sonar-project.properties"
        }
    }    
}

def buildAndRegisterImage() {
    docker.withRegistry("${DOCKER_REGISTRY}", 'docker-registry.mpt') {
        def img = docker.build("${NOME_IMAGEM_DOCKER}", "--pull --build-arg ZOOKEEPER_HOST=${ZK_HOST} --build-arg ZOOKEEPER_PORT=${ZK_PORT} .")
        img.push("${VERSAO}")
    }
}
