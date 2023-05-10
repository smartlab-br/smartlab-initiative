"""
Script para gerar arquivo yaml com estrutura do site Smartlab
"""

import yaml                    
import requests
import pathlib
import traceback
import sys
import os

def read_yaml(file_path):
    with open(file_path, "r", encoding="UTF8") as stream:
        try:
            return(yaml.safe_load(stream))
        except yaml.YAMLError as exc:
            print(exc)

def struct_to_yaml(file_path, struct):
    with open(file_path, 'w') as fout:
        yaml_dumps_str = yaml.dump(struct, indent=2, sort_keys=False, default_flow_style=False)
        print(yaml_dumps_str, file=fout)    
            
def get_indicator(datasource, cd_indicador):
    api_key = os.environ['DATAHUB_APP_KEY']
    api_url = os.environ['DATAHUB_API_BASE_URL']
    headers = {'X-Mpt-Api-Key': api_key,
                      'Content-Type':'application/json'
                     }
    if ((datasource == 'estadicmunic') or (datasource == 'estadicuf')):
        url = f"{api_url}/{datasource}?categorias=spai_ds&filtros=eq-cd_indicador_spai-'{cd_indicador}'&limit=1"
        response = requests.get(url, headers = headers).json()
        return response['dataset'][0]['spai_ds']
    elif not datasource.startswith('indicadores') :
        url = f"{api_url}/thematic/{datasource}?categorias=ds_indicador&filtros=eq-cd_indicador-'{cd_indicador}'&limit=1"
        response = requests.get(url, headers = headers).json()
        return response['dataset'][0]['ds_indicador']
    else:
        url = f"{api_url}/{datasource}?categorias=ds_indicador&filtros=eq-cd_indicador-'{cd_indicador}'&limit=1"
        response = requests.get(url, headers = headers).json()
        return response['dataset'][0]['ds_indicador']


def generate_structure(view_conf_path):
    obs_yaml = read_yaml(view_conf_path + "/observatorios.yaml") 
    obs = [] 
    for item in obs_yaml['observatorios']:
        if not item['external']:
            obs.append({'id':item['id'], 'type':'observatorio', 'name':item['title'], 'short_title':item['short_title'], 'url': item['to'], 'search_text': item['title'], 'app_icon': item['app_icon']})
    obs_dim = []
    # Observatórios
    for obs_item in obs:
        
        dimensions_yaml = read_yaml(view_conf_path + "/dimensao/" + obs_item['id'] + ".yaml")
        dimensions = [] 
        
        # Apresentação search_text
        obs_item_yaml = read_yaml(view_conf_path + "/observatorio/" + obs_item['id'] + ".yaml")
        obs_search_text = 'Apresentação - ' + obs_item['name']
        for item_desc_obs in obs_item_yaml['prevalencia']['description']:
            if (item_desc_obs['type'] == 'text'):
                if (('title' in item_desc_obs) and (item_desc_obs['title'] != '')):
                    obs_search_text += ' ' + item_desc_obs['title']
                if ('fixed' in item_desc_obs['content']):
                    obs_search_text += ' ' + item_desc_obs['content']['fixed']
                if ('template' in item_desc_obs['content']):
                    obs_search_text += ' ' + item_desc_obs['content']['template']
            if (item_desc_obs['type'] ==  'switch-group'):
                for switch in item_desc_obs['switches']:
                    if ('label' in switch):
                        obs_search_text += ' ' + switch['label']
                    if ('minicards' in switch):
                        for minicard in switch['minicards']:
                            for arg in minicard['args']:
                                if (arg['prop'] != 'value'):
                                    if ('fixed' in arg):
                                        obs_search_text += ' ' + arg['fixed']
                                    if ('template' in arg):
                                        obs_search_text += ' ' + arg['template']
            if (item_desc_obs['type'] ==  'radio'):
                for item in item_desc_obs['items']:
                    if ('label' in item):
                        obs_search_text += ' ' + item['label']
                    if ('minicards' in item):
                        for minicard in item['minicards']:
                            for arg in minicard['args']:
                                if (arg['prop'] != 'value'):
                                    if ('fixed' in arg):
                                        obs_search_text += ' ' + arg['fixed']
                                    if ('template' in arg):
                                        obs_search_text += ' ' + arg['template']
        for item_desc_obs in obs_item_yaml['prevalencia']['description_right']:
            if (item_desc_obs['type']== 'text'):
                if (('title' in item_desc_obs) and (item_desc_obs['title'] != '')):
                    obs_search_text += ' ' + item_desc_obs['title']
                if ('fixed' in item_desc_obs['content']):
                    obs_search_text += ' ' + item_desc_obs['content']['fixed']
                if ('template' in item_desc_obs['content']):
                    obs_search_text += ' ' + item_desc_obs['content']['template']
    
        dimensions.append({'id': obs_item['id'] + '_apresentacao', 'type':'obs_apresentacao','name': 'Apresentação - Observatório ' + obs_item['short_title'], 'url': obs_item['url'], 'search_text': obs_search_text.replace('<br/>', ' ')})

        # Smartmap search_text
        obs_search_text = 'Smartmap - Mapa avançado - ' + obs_item['name']
        for item_desc_obs in obs_item_yaml['prevalencia']['mapa_filtros']:
            if (item_desc_obs['type'] == 'text'):
                if (('title' in item_desc_obs) and (item_desc_obs['title'] != '')):
                    obs_search_text += ' ' + item_desc_obs['title']
                if ('fixed' in item_desc_obs['content']):
                    obs_search_text += ' ' + item_desc_obs['content']['fixed']
                if ('template' in item_desc_obs['content']):
                    obs_search_text += ' ' + item_desc_obs['content']['template']
            if (item_desc_obs['type'] ==  'switch-group'):
                for switch in item_desc_obs['switches']:
                    if ('label' in switch):
                        obs_search_text += ' ' + switch['label']
                    if ('minicards' in switch):
                        for minicard in switch['minicards']:
                            for arg in minicard['args']:
                                if (arg['prop'] != 'value'):
                                    if ('fixed' in arg):
                                        obs_search_text += ' ' + arg['fixed']
                                    if ('template' in arg):
                                        obs_search_text += ' ' + arg['template']
            if (item_desc_obs['type'] ==  'radio'):
                for item in item_desc_obs['items']:
                    if ('label' in item):
                        obs_search_text += ' ' + item['label']
                    if ('minicards' in item):
                        for minicard in item['minicards']:
                            for arg in minicard['args']:
                                if (arg['prop'] != 'value'):
                                    if ('fixed' in arg):
                                        obs_search_text += ' ' + arg['fixed']
                                    if ('template' in arg):
                                        obs_search_text += ' ' + arg['template']
        dimensions.append({'id': obs_item['id'] + '_smartmap', 'type':'obs_smartmap','name': 'Smartmap - Mapa avançado - Observatório ' + obs_item['short_title'], 'url': obs_item['url'] + '/smartmap', 'search_text': obs_search_text.replace('<br/>', ' ')})

        # Dimensões
        for dim_item in dimensions_yaml['dimensoes']:
            if not 'external' in dim_item or ('external' in dim_item and not dim_item['external']):
                dim_yaml = read_yaml(view_conf_path + "/observatorio/" + obs_item['id'] + "/localidade/municipio/" + dim_item['id'] + ".yaml")
                cards = []
                for section in dim_yaml['secoes']:

                    # Cards
                    for card in section['cards']:
                        if (('type' in card) and (card['type'] == 'headline')):
                                continue
                        card_search_text = card['id'] + ' ' + card['title']['fixed']
                        
                        if ('card_template' in card):
                            indicador = get_indicator(card['datasource'],card['cd_indicador'])
                            if (card['title']['fixed'] != indicador):
                                card_search_text += ' ' + indicador
                        else:            
                            for item_desc in card['description']:
                                if(item_desc['type']== 'text'):
                                    if (('title' in item_desc) and (item_desc['title'] != '')):
                                        card_search_text += ' ' + item_desc['title']
                                    if ('fixed' in item_desc['content']):
                                        card_search_text += ' ' + item_desc['content']['fixed']
                                    if ('template' in item_desc['content']):
                                        card_search_text += ' ' + item_desc['content']['template']
                        cards.append({'id': card['id'], 'type':'card', 'name': card['title']['fixed'], 'url': dim_item['to'] + '#' + card['id'],'search_text': card_search_text.replace('<br/>', ' ')})
                dimensions.append({'id': dim_item['id'], 'type':'dimensao','name':dim_item['short_desc'], 'url': dim_item['to'], 'search_text': dim_item['label'], 'children': cards})
        obs_dim.append({**obs_item, 'children': dimensions.copy()})

    # # Sobre
    # about_yaml = read_yaml(view_conf_path + "/about.yaml")
    # about_text = "Sobre a Iniciativa Smartlab"
    # for item_about in about_yaml:
    #     for item_section in about_yaml[item_about]['sections']:
    #         if((item_section['type'] == 'list') | (item_section['type'] == 'list-avatar')):
    #             if (('title' in item_section) and (item_section['title'] != '')):
    #                 about_text += ' ' + item_section['title']
    #                 for item_list in item_section['list']:
    #                     if ('name' in item_list):
    #                         about_text += ' ' + item_list['name']
    #                     if ('values' in item_list):
    #                         about_text += ' ' + ' '.join(item_list['values'])
    #         if(item_section['type'] == 'text'):
    #             about_text += ' ' + item_section['content']
    # obs_dim.append({'id': 'smartlab_sobre', 'type':'sobre','name': 'Sobre a Iniciativa Smartlab (Iniciativa, Equipe e Créditos)', 'url': '/saibamais/smartlab', 'search_text' : about_text.replace('<br/>', ' ')})
    return obs_dim

try:
    view_conf_path =  str(pathlib.Path().resolve()).replace('scripts','static') + '/smartlab-initiative-viewconf/br'   
    struct = generate_structure(view_conf_path)
    file_path = view_conf_path + "/mapa_site.yaml"
    struct_to_yaml(file_path, struct)
except:
    traceback.print_exc()
    sys.exit(1)

