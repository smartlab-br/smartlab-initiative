<script>
import BaseLandingView from './BaseLandingView.vue'

export default {
  extends: BaseLandingView,
  methods: {
    selectCoords (range, scope, id, suffix = '') {
      const topoFile = '/topojson/' + scope + '/' + range + '/' + id + '.json'
      this.$axios.$get(topoFile)
        .then((response) => {
          this['topology' + suffix] = response
        })
    },

    fetchVizLinks (sections) {
      let indxViz = 0
      for (const indxSecao in sections) {
        if (sections[indxSecao].name != '') {
          this.cardLinks[indxViz] = {
            title: sections[indxSecao].name
          }
          indxViz++
        }
        for (const indxCard in sections[indxSecao].cards) {
          if (sections[indxSecao].cards[indxCard].type &&
                sections[indxSecao].cards[indxCard].type == 'headline') {
            this.cardLinks[indxViz] = {
              title: sections[indxSecao].cards[indxCard].title.fixed
            }
            indxViz++
            continue
          }

          if (sections[indxSecao].cards[indxCard].card_template && (sections[indxSecao].cards[indxCard].title == null || sections[indxSecao].cards[indxCard].title == undefined)) {
            // let urlTitle = "/"+ sections[indxSecao].cards[indxCard].datasource+"?categorias=spai_ds&filtros=eq-cd_indicador_spai-'"+sections[indxSecao].cards[indxCard].cd_indicador+"'&limit=1"
            // let title = {template: "{0}",
            //             api: {fixed: urlTitle},
            //             args: [{named_prop: "spai_ds"}]
            //             }
            // sections[indxSecao].cards[indxCard].title = title;
            sections[indxSecao].cards[indxCard].title = { fixed: sections[indxSecao].cards[indxCard].id }
          }
          this.fillDataStructure(
            sections[indxSecao].cards[indxCard].title,
            this.customParams, this.customFunctions,
            this.setCardLink,
            {
              id: sections[indxSecao].cards[indxCard].id,
              pos: indxViz
            }
          )
          indxViz++
        }
      }
    }
  }
}
</script>
<style>
  .dim-menu {
    background-color:rgba(0,0,0,0.8) !important;
    width: 100%;
    position: fixed;
    z-index: 99 !important;
  }

  .bg-transp-10{
    background-color:rgba(256,256,256,0.10) !important;
  }

  .dim-menu .hidden {
    display: none;
  }

  .dim-menu .flex:hover .hidden {
    display: block;
  }

  .dim-menu .flex { cursor: pointer; }

  .bg-black {
    background-color: black;
  }

  .scroll-menu { cursor: pointer; }

  /* .minicard {
    background-color: rgba(0,0,0,0.7);
    align-self: stretch;
    overflow: hidden;
  } */

  .dim-description {
    column-count: 2;
    column-gap: 4.5em;
  }

  .icon-vertical-align-middle i {
    vertical-align: middle !important;
  }
  .table-info th, .table-info td{
    border:1px solid;
    padding: 10px;
  }

  .master-indicator span{
    align-self: auto;
  }

  .loadingPanel {
    width: 100%;
    background-color: rgba(33, 33, 33, 0.9);
    position: absolute;
    z-index:99;
  }
</style>
