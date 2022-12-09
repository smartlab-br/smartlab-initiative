# smartlab-initiative

This repository holds the code for the front-end of the [Smartlab Initiative](https://smartlabbr.org). We invite all the community to join us in our mission and contribute. To do so, we recommend reading [this](https://github.com/MarcDiethelm/contributing/blob/master/README.md) first.

# Creating a local environment

To run the project locally, you'll need to download and install [node (with npm)](https://nodejs.org/en/), if you don't have it, and go through some setup first.

## Step 1. Fork & Clone smartlab-initiative

Please, read [this](https://help.github.com/en/articles/fork-a-repo) to better understand why and how to fork a project.

## Step 2. Create a reference to the platform content repository

### If you don't want to change the content

If you don't want to work in the content, just set an environment variable:

```
GIT_VIEWCONF_TAG_URL=https://raw.githubusercontent.com/smartlab-br/smartlab-initiative-viewconf/master/
```

### To be able to change the content

Otherwise, if you want to be able to change the content and see it working locally, you have to fork and clone [this repository](https://github.com/smartlab-br/smartlab-initiative-viewconf) under the `/app/static/` dir.

## Step 3. Subscribe to datahub-api

At the moment, we're working in a self-service subscription. Until it becomes a reality, please, send us an e-mail (smartlab-dev@mpt.mp.br) - we'll be glad to provide you with an API Key. Remember, though, that the access is not guaranteed - we might want to know you a little better (where you're from, if you're representing an organization, if there are more people in the organization that will use the data and so on...).

## Step 4. Set environment variables

```
DATAHUB_API_BASE_URL = <the endpoint to the datahub-api>
DATAHUB_APP_KEY = <your application credential obtained in the subscription step>
      
```

## Step 5. Run the project

Go to the app folder and run scripts for installing and building the project:

```
$ cd app
$ npm install
$ npm run dev
```

## I can see it running! Now what?

You can start contributing! Just make sure to create a pull request to the **contrib** branch, otherwise it may be dismissed. We strongly recommend adding automated tests to the codebase. Read [this](https://help.github.com/en/articles/creating-a-pull-request) to understand better about pull requests.

We'll do our best to give a quick feedback - bear in mind we're a small team, though.

### How to contribute

There are plenty of ways to contribute to opensource projects, as we can read in [this post](https://opensource.guide/how-to-contribute/). Some examples:

1. Translation of content (editing smartlab-initiative-viewconf yamls);
2. Code optimization;
3. Enhancing unit testing coverage;
4. Proposing new features and
5. Repository and code documentation.

### Attention to the working repository!

If you're working in the `smartlab-initiative-viewconf` repository, make sure you're running git commands (pushes, branching, sending pull-requests) from it. Since in some cases you may have nested repositories, it's a common mistake to change the files and forget that the inner one is actually completely independent.

### Do I need to be in a team to collaborate?

No, you don't! This is an opensource project and we intend to keep it as democratic as we can. Anyone can clone, fork and send pull requests to our repositories. We'll check the PR code quality and if it can be merged without breaking stuff. As long as the PR is clean and sent to the correct branch (```contrib```), we'll do our best to approve it timely.

Eventually, we'll come up with a policy to add people to our ranks, as committers. When we do so, the access will be granted per repository or team (with a set of repositories under their responsibility).

## Some tools you can use

### Git

[Gitkraken](https://www.gitkraken.com/)

[Github Desktop](https://desktop.github.com/)

[Sourcetree](https://www.sourcetreeapp.com/)

### Coding

There are a lot of tools to help in editing the files - some of them offer integration with terminal and other tools. Here are some alternatives:

[VS Code](https://alternativeto.net/software/visual-studio-code/)

[Webstorm](https://www.jetbrains.com/webstorm/promo/?gclid=CjwKCAjwm4rqBRBUEiwAwaWjjFPojlKd6gF4AJaHr79alREonOUlUFzQzLs0H1LqL7ROL5Ps6w4yaxoC1KAQAvD_BwE&gclsrc=aw.ds)

[Atom](https://atom.io/)

# Third-party components used in our platform

**[Font Awesome Free](https://github.com/FortAwesome/Font-Awesome)**\
Copyright © Fonticons, Inc. - [MIT License](https://fontawesome.com/license/free)

**[Ajv](https://github.com/epoberezkin/ajv)**\
Copyright © 2015-2017 Evgeny Poberezkin - [MIT License](https://github.com/epoberezkin/ajv/blob/master/LICENSE)

**[Axios](https://github.com/axios/axios)**\
Copyright © 2014-present Matt Zabriskie - [MIT License](https://github.com/axios/axios/blob/master/LICENSE)

**[Babel/Polyfill](https://babeljs.io/docs/en/babel-polyfill)**\
Copyright © 2014-present Sebastian McKenzie and other contributors - [MIT License](https://github.com/babel/babel/blob/master/LICENSE)

**[Compression](https://github.com/expressjs/compression)**\
Copyright © 2014 Jonathan Ong, Copyright © 2014-2015 Douglas Christopher Wilson - [MIT License](https://github.com/expressjs/compression/blob/HEAD/LICENSE)

**[Cross-Env](https://github.com/kentcdodds/cross-env)**\
Copyright © 2017 Kent C. Dodds - [MIT License](https://github.com/kentcdodds/cross-env/blob/master/LICENSE)

**[D3](https://d3js.org/)**\
Copyright © 2019 Mike Bostock - [BSD 3-Clause License](https://github.com/d3/d3/blob/master/LICENSE)

**[D3-Sankey](https://github.com/d3/d3-sankey)**\
Copyright © 2015 Mike Bostock - [BSD 3-Clause License](https://github.com/d3/d3-sankey/blob/master/LICENSE)

**[D3-Scale-Chromatic](https://github.com/d3/d3-scale-chromatic)**\
Copyright © 2010-2018 Mike Bostock - [BSD 3-Clause License](https://github.com/d3/d3-scale-chromatic/blob/master/LICENSE)

**[D3 Plus](https://d3plus.org/)**\
Copyright © 2013 Alexander Simoes - [MIT License](https://github.com/alexandersimoes/d3plus/blob/master/LICENSE)

**[D3 Bullet](https://github.com/GordonSmith/d3-bullet)**\
Copyright © 2012-2016 Mike Bostock - [BSD 3-Clause License](https://github.com/GordonSmith/d3-bullet/blob/master/LICENSE)

**[ES6-Promise](https://github.com/stefanpenner/es6-promise)**\
Copyright © 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors - [MIT License](https://github.com/stefanpenner/es6-promise/blob/master/LICENSE)

**[Express](https://expressjs.com)**\
Copyright © 2017 StrongLoop, IBM, and other expressjs.com contributors, Copyright © 2014-2015 Douglas Christopher Wilson, Copyright © 2013-2014 Roman Shtylman, Copyright © 2009-2014 TJ Holowaychuk - [MIT License](https://github.com/expressjs/express/blob/master/LICENSE)

**[Extract Text Plugin](https://github.com/webpack-contrib/extract-text-webpack-plugin)**\
Copyright © JS Foundation and other contributors - [MIT License](https://github.com/webpack-contrib/extract-text-webpack-plugin/blob/master/LICENSE)

**[FS Listener](https://github.com/synrc/fs)**\
Copyright © 2013 Vladimir Kirillov - [ISC License](https://github.com/synrc/fs/blob/master/LICENSE)

**[JSON Loader](https://github.com/webpack-contrib/json-loader)**\
Copyright © JS Foundation and other contributors - [MIT License](https://github.com/webpack-contrib/json-loader/blob/master/LICENSE)

**[JSON2CSV](https://github.com/zemirco/json2csv)**\
Copyright © 2012 [Mirco Zeiss] - [MIT License](https://github.com/zemirco/json2csv/blob/master/LICENSE.md)

**[Leaflet](https://leafletjs.com/)**\
Copyright © 2017 Vladimir Agafonkin - [BSD 2-Clause License](https://github.com/Leaflet/Leaflet/blob/master/LICENSE)

**[Leaflet-EasyPrint](https://github.com/rowanwins/leaflet-easyPrint)**\
Copyright © 2015 Rowan Winsemius - [MIT License](https://github.com/rowanwins/leaflet-easyPrint/blob/gh-pages/LICENSE)

**[Leaflet.Heat](https://github.com/Leaflet/Leaflet.heat)**\
Copyright © 2014, Vladimir Agafonkin - [BSD 2-Clause License](https://github.com/Leaflet/Leaflet.heat/blob/gh-pages/LICENSE)

**[Leaflet.MarkerCluster](https://github.com/Leaflet/Leaflet.markercluster)**\
Copyright © 2012 David Leaver - [MIT License](https://github.com/Leaflet/Leaflet.markercluster/blob/master/MIT-LICENCE.txt)

**[Lru Cache](https://github.com/isaacs/node-lru-cache)**\
Copyright © Isaac Z. Schlueter and Contributors - [ISC License](https://github.com/isaacs/node-lru-cache/blob/master/LICENSE)

**[Odometer](https://github.hubspot.com/odometer/docs/welcome/)**\
Copyright © 2013 HubSpot, Inc. - [MIT License](https://github.com/HubSpot/odometer/blob/master/LICENSE)

**[Path](https://github.com/jinder/path)**\
Copyright © Joyent, Inc. and other Node contributors - [MIT License](https://github.com/jinder/path/blob/master/LICENSE)

**[Serialize JavaScript](https://github.com/yahoo/serialize-javascript)**\
Copyright © 2014 Yahoo! Inc. - [BSD 3-Clause License](https://github.com/yahoo/serialize-javascript/blob/master/LICENSE)

**[Serve-Favicon](https://github.com/expressjs/serve-favicon)**\
Copyright © 2010 Sencha Inc., Copyright © 2011 LearnBoost, Copyright © 2011 TJ Holowaychuk, Copyright © 2014-2017 Douglas Christopher Wilson - [MIT License](https://github.com/expressjs/serve-favicon/blob/master/LICENSE)

**[Vue](https://vuejs.org/)**\
Copyright © 2014-2019 Evan You - [MIT License](https://github.com/vuejs/vue/blob/dev/LICENSE)

**[Vue-Analytics](https://github.com/MatteoGabriele/vue-analytics)**\
Copyright © 2016-2017 Matteo Gabriele - [MIT License](https://github.com/MatteoGabriele/vue-analytics/blob/master/LICENCE)

**[Vue-Cookies](https://github.com/cmp-cc/vue-cookies)**\
Copyright © 2016-present, cmp-cc - [MIT License](https://github.com/cmp-cc/vue-cookies/blob/master/LICENSE)

**[Vue Router](https://router.vuejs.org/)**\
Copyright © 2013-present Evan You - [MIT License](https://github.com/vuejs/vue-router/blob/dev/LICENSE)

**[Vue Server Renderer](https://github.com/vuejs/vue/tree/dev/packages/vue-server-renderer)**\
Copyright © 2014-2019 Evan You - [MIT License](https://github.com/vuejs/vue/blob/dev/LICENSE)

**[Vue-SVG_Sprite](https://github.com/thierrymichel/vue-svg-sprite)**\
Copyright © 2016 Thierry Michel - [MIT License](https://github.com/thierrymichel/vue-svg-sprite/blob/master/LICENSE)

**[VueWorker](https://github.com/israelss/vue-worker)**\
Copyright © 2017 Israel Sant'Anna - [MIT License](https://github.com/israelss/vue-worker/blob/master/LICENSE)

**[Vuetify](https://vuetifyjs.com)**\
Copyright © 2016-2019 Vuetify, LLC, Copyright © 2016-2019 John Jeremy Leider - [MIT License](https://github.com/vuetifyjs/vuetify/blob/master/LICENSE.md)

**[Vuex](https://vuex.vuejs.org/)**\
Copyright © 2015-present Evan You - [MIT License](https://github.com/vuejs/vuex/blob/dev/LICENSE)

**[Vuex-Router-Sync](https://github.com/vuejs/vuex-router-sync)**\
Copyright © 2016 Evan You - [MIT License](https://github.com/vuejs/vuex-router-sync/blob/master/LICENSE)

**[Yaml-Loader](https://github.com/okonet/yaml-loader)**\
Copyright © 2014 Andrey Okonetchnikov - [MIT License](https://github.com/okonet/yaml-loader/blob/master/LICENSE)

**[Vue Test Utils](https://vue-test-utils.vuejs.org/)**\
Copyright © 2017-present vuejs - [MIT License](https://github.com/vuejs/vue-test-utils/blob/dev/LICENSE)

**[Autoprefixer](https://github.com/postcss/autoprefixer)**\
Copyright © 2013 Andrey Sitnik - [MIT License](https://github.com/postcss/autoprefixer/blob/master/LICENSE)

**[Babel-Core](https://babeljs.io/docs/en/next/babel-core.html)**\
Copyright © - [MIT License]()

**[Babel-Jest (Jest)](https://github.com/facebook/jest)**\
Copyright © Facebook, Inc. and its affiliates - [MIT License](https://github.com/facebook/jest/blob/master/LICENSE)

**[Babel Loader](https://github.com/babel/babel-loader)**\
Copyright © 2014-2019 Luís Couto - [MIT License](https://github.com/babel/babel-loader/blob/master/LICENSE)

**[Babel-Plugin-Transform-Runtime](https://babeljs.io/docs/en/babel-plugin-transform-runtime)**\
Copyright © - [MIT License]()

**[Babel-Preset-Stage-2](https://babeljs.io/docs/en/babel-preset-stage-2)**\
Copyright © - [MIT License]()

**[Babel-Register](https://babeljs.io/docs/en/babel-register)**\
Copyright © - [MIT License]()

**[CSS Loader](https://github.com/webpack-contrib/css-loader)**\
Copyright © JS Foundation and other contributors - [MIT License](https://github.com/webpack-contrib/css-loader/blob/master/LICENSE)

**[EventSource Polyfill](https://github.com/amvtek/EventSource)**\
Copyright © 2014 AmvTek - [MIT License](https://github.com/amvtek/EventSource/blob/master/LICENSE)

**[File-Loader](https://github.com/webpack-contrib/file-loader)**\
Copyright © JS Foundation and other contributors - [MIT License](https://github.com/webpack-contrib/file-loader/blob/master/LICENSE)

**[Friendly-Errors-Webpack-Plugin](https://github.com/geowarin/friendly-errors-webpack-plugin)**\
Copyright © 2016 Geoffroy Warin - [MIT License](https://github.com/geowarin/friendly-errors-webpack-plugin/blob/master/LICENSE)

**[Highlight.js](https://highlightjs.org/)**\
Copyright © 2006, Ivan Sagalaev - [BSD 3-Clause License](https://github.com/highlightjs/highlight.js/blob/master/LICENSE)

**[HTML Webpack Plugin](https://github.com/jantimon/html-webpack-plugin)**\
Copyright © JS Foundation and other contributors - [MIT License](https://github.com/jantimon/html-webpack-plugin/blob/master/LICENSE)

**[Jest](https://jestjs.io/)**\
Copyright © Facebook, Inc. and its affiliates - [MIT License](https://github.com/facebook/jest/blob/master/LICENSE)

**[Jest-Serializer-Vue](https://github.com/eddyerburgh/jest-serializer-vue)**\
Copyright © 2017 Edd Yerburgh - [MIT License](https://github.com/eddyerburgh/jest-serializer-vue/blob/master/LICENSE)

**[Jest-Sonar-Reporter](https://github.com/3dmind/jest-sonar-reporter)**\
Copyright © 2017-2018 Christian Wlatschiha - [MIT License](https://github.com/3dmind/jest-sonar-reporter/blob/develop/LICENSE)

**[Jest-Junit](https://github.com/jest-community/jest-junit)**\
Copyright © - [Apache License 2.0](https://github.com/jest-community/jest-junit/blob/master/LICENSE)

**[Pug](https://pugjs.org)**\
Copyright © - [MIT License]()

**[Rimraf](https://github.com/isaacs/rimraf)**\
Copyright © Isaac Z. Schlueter and Contributors - [ISC License](https://github.com/isaacs/rimraf/blob/master/LICENSE)

**[Script Extension for HTML Webpack Plugin](https://github.com/numical/script-ext-html-webpack-plugin)**\
Copyright © 2016 numical - [MIT License](https://github.com/numical/script-ext-html-webpack-plugin/blob/master/LICENSE)

**[Style Loader](https://github.com/webpack-contrib/style-loader)**\
Copyright © JS Foundation and other contributors - [MIT License](https://github.com/webpack-contrib/style-loader/blob/master/LICENSE)

**[Stylus](http://stylus-lang.com/)**\
Copyright © Automattic <developer.wordpress.com> - [MIT License](https://github.com/stylus/stylus/blob/dev/LICENSE)

**[Stylus-Loader](https://github.com/shama/stylus-loader)**\
Copyright © 2018 Kyle Robinson Young - [MIT License](https://github.com/shama/stylus-loader/blob/master/LICENSE)

**[SW Precache Webpack Plugin](https://github.com/goldhand/sw-precache-webpack-plugin)**\
Copyright © 2018 Will Farley - [MIT License](https://github.com/goldhand/sw-precache-webpack-plugin/blob/master/LICENSE)

**[URL-Loader](https://github.com/webpack-contrib/url-loader)**\
Copyright © JS Foundation and other contributors - [MIT License](https://github.com/webpack-contrib/url-loader/blob/master/LICENSE)

**[Vue-Jest](https://github.com/vuejs/vue-jest)**\
Copyright © 2017 Edd Yerburgh - [MIT License](https://github.com/vuejs/vue-jest/blob/master/LICENSE)

**[Vue Loader](https://vue-loader.vuejs.org/guide/)**\
Copyright © 2015-present Yuxi (Evan) You - [MIT License](https://github.com/vuejs/vue-loader/blob/master/LICENSE)

**[Vue-Style-Loader](https://github.com/vuejs/vue-style-loader)**\
Copyright © JS Foundation and other contributors - [MIT License](https://github.com/vuejs/vue-style-loader/blob/master/LICENSE)

**[Vue-Template-Compiler](https://github.com/vuejs/vue/tree/dev/packages/vue-template-compiler)**\
Copyright © - [MIT License]()

**[Webpack](https://webpack.js.org/)**\
Copyright © JS Foundation and other contributors - [MIT License](https://webpack.js.org/license)

**[Webpack-Dev-Middleware](https://github.com/webpack/webpack-dev-middleware)**\
Copyright © JS Foundation and other contributors - [MIT License](https://github.com/webpack/webpack-dev-middleware/blob/master/LICENSE)

**[Webpack Hot Middleware](https://github.com/webpack-contrib/webpack-hot-middleware)**\
Copyright © JS Foundation and other contributors - [MIT License](https://github.com/webpack-contrib/webpack-hot-middleware/blob/master/LICENSE)

**[Webpack-Merge](https://github.com/survivejs/webpack-merge)**\
Copyright © 2015 Juho Vepsalainen - [MIT License](https://github.com/survivejs/webpack-merge/blob/master/LICENSE)

**[Webpack node externals](https://github.com/liady/webpack-node-externals)**\
Copyright © 2016 Liad Yosef - [MIT License](https://github.com/liady/webpack-node-externals/blob/master/LICENSE)
