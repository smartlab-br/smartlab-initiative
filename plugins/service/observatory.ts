class ObservatoryService {
    static identifyObservatory(route: string) {
        if (route.includes('trabalhodecente')) return 'td';
        if (route.includes('diversidade')) return 'des';
        if (route.includes('trabalhoescravo')) return 'te';
        if (route.includes('trabalhoinfantil')) return 'ti';
        if (route.includes('sst')) return 'sst';
        if (route.includes('covid')) return 'cov';
        return "td";
    }

    // Mapeamento dos IDs para os observatorios
    static identifyObservatoryById(idObservatorio: string) {
        switch (idObservatorio){
            case 'td':
            return 'trabalhodecente';
            case 'des':
            return 'diversidade';
            case 'te':
            return 'trabalhoescravo';
            case 'ti':
            return 'trabalhoinfantil';
            case 'sst':
            return 'sst';
            case 'cov':
            return 'covid';
        }
        return "trabalhodecente"
    } 
}

export { ObservatoryService }