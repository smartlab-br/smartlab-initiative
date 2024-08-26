declare global {

  interface Smartlab {
    background_images: string[];
    observatories: Observatory[];
    footer: Footer;
    sections: Section[];
  }

  interface Observatory {
    id: string;
    blocked: boolean;
    title: string;
    short_title: string;
    short_desc: string;
    tooltip: string;
    hash_tag: string;
    to: string;
    external: boolean;
    rippleColor: string;
    dimensions: Dimension[];
    app_icon?: string;
    icon?: string;
    section_title?: string;
    section_description?: string;
    section_image?: string;
    section_background?: string;
    headerClass?: string;
    tagColor?: string;
    status?: string;
    media?: string;
    themeColor?: string;
    btnColor?: string;
  }

  interface Dimension {
    label: string;
    blocked: boolean;
    detail: string;
    tagColor: string;
    to: string;
    id: string;
    icon: string;
    short_desc: string;
    description: string;
    type: string;
    media: string;
    status?: string;
    default?: boolean;
  }
        
  interface Footer {
    title: string;
    description: string;
    images: Image[];
  }

  interface Image {
    src: string;
    class: string;
    title: string;
    url: string;
    height?: string;
    maxHeight?: string;
    minHeight?: string;
  }

  interface Section {
    id: string;
    title: string;
    description: string;
    section_background: string;
    cls?: string;
    complement?: Complement;
  }

  interface Complement {
    cls: string;
    minicards: MiniCard[];
  }

  interface MiniCard {
    relevance: string;
    cls: string;
    rowClass?: string;
    preloaded?: Preloaded;
    args: Arg[];
  }

  interface Preloaded {
    prop: string;
    function: string;
    id: string;
    year: string;
  }

  interface Arg {
    prop: string;
    fixed: string;
    format?: string;
    collapse?: boolean;
  }

  
  interface About {
    smartlab: AboutSmartlab;
    equipe: Team;
    licencas: Licenses;
  }
  
  interface AboutSmartlab {
    tab: string;
    title: string;
    sections: AboutSection[];
  }
  
  interface AboutSection {
    type: string;
    content?: string;
    title?: string;
    list_height?: string;
    list?: ListItem[];
  }
  
  interface ListItem {
    name: string;
    values: string[];
  }
  
  interface Team {
    tab: string;
    title: string;
    sections: AboutSection[];
  }
  
  interface Licenses {
    tab: string;
    title: string;
    sections: AboutSection[];
  }

  interface Place {
    id: number;
    label: string;
    scope: string;
    detail: string;
    icon: string;
    to: string;
    type: string;
    exclude_from: string[];
  }

}

// Este arquivo precisa ter pelo menos uma exportação vazia para ser tratado como um módulo.
export {}