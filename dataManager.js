// dataManager.js - Sistema unificado para gerenciar dados CSV
// Para ser usado em ambas as páginas de ranking

class DataManager {
    constructor() {
        this.rawData = [];
        this.processedData = [];
        this.lastUpdated = null;
        this.csvPath = 'data/ranking_data.csv'; // Caminho para o arquivo CSV
    }

    // Carregar dados do CSV
    async loadCSVData() {
        try {
            const response = await fetch(this.csvPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            this.rawData = this.parseCSV(csvText);
            this.processedData = this.processRawData(this.rawData);
            this.lastUpdated = new Date();
            
            console.log('Dados CSV carregados com sucesso:', this.processedData.length, 'registros');
            return this.processedData;
        } catch (error) {
            console.error('Erro ao carregar dados CSV:', error);
            // Retornar dados de exemplo em caso de erro
            return this.getFallbackData();
        }
    }

    // Parser CSV simples
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Mapear colunas esperadas
        const columnMap = {
            'nombre': 'nombre',
            'apellido': 'apellido', 
            'taladro': 'taladro',
            'pozo': 'pozo',
            'fecha': 'fecha',
            'guardia': 'guardia',
            'score general': 'scoreGeneral',
            'score perforador': 'scorePerforador',
            'numero de atividades': 'numeroActividades'
        };
        
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length >= headers.length) {
                const record = {};
                
                headers.forEach((header, index) => {
                    const mappedKey = columnMap[header] || header;
                    let value = values[index];
                    
                    // Conversão de tipos
                    if (mappedKey === 'scoreGeneral' || mappedKey === 'scorePerforador' || mappedKey === 'numeroActividades') {
                        value = parseFloat(value) || 0;
                    } else if (mappedKey === 'fecha') {
                        value = this.parseDate(value);
                    }
                    
                    record[mappedKey] = value;
                });
                
                data.push(record);
            }
        }
        
        return data;
    }

    // Processar dados brutos
    processRawData(rawData) {
        return rawData.map(record => ({
            id: `${record.nombre}_${record.apellido}`.toLowerCase().replace(/\s+/g, '_'),
            nombre: record.nombre || '',
            apellido: record.apellido || '',
            nombreCompleto: `${record.nombre} ${record.apellido}`,
            taladro: record.taladro || '',
            pozo: record.pozo || '',
            fecha: record.fecha,
            guardia: record.guardia || '',
            scoreGeneral: record.scoreGeneral || 0,
            scorePerforador: record.scorePerforador || 0,
            numeroActividades: record.numeroActividades || 0,
            puntosTotales: (record.scoreGeneral || 0) + (record.scorePerforador || 0)
        }));
    }

    // Parser de data flexível
    parseDate(dateString) {
        if (!dateString) return null;
        
        // Tentar diferentes formatos
        const formats = [
            /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
            /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
            /(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
        ];
        
        for (const format of formats) {
            const match = dateString.match(format);
            if (match) {
                if (format === formats[0]) {
                    // YYYY-MM-DD
                    return new Date(match[1], match[2] - 1, match[3]);
                } else {
                    // DD/MM/YYYY ou DD-MM-YYYY
                    return new Date(match[3], match[2] - 1, match[1]);
                }
            }
        }
        
        // Fallback para Date.parse
        const parsed = new Date(dateString);
        return isNaN(parsed.getTime()) ? null : parsed;
    }

    // Dados de fallback em caso de erro
    getFallbackData() {
        return [
            { id: "juan_perez", nombre: "Juan", apellido: "Pérez", nombreCompleto: "Juan Pérez", taladro: "Taladro 1", pozo: "Pozo 1", fecha: "2023-01-01", guardia: "Guarda 1", scoreGeneral: 75, scorePerforador: 80, numeroActividades: 10, puntosTotales: 155 },
            { id: "ana_garcia", nombre: "Ana", apellido: "García", nombreCompleto: "Ana García", taladro: "Taladro 2", pozo: "Pozo 2", fecha: "2023-01-02", guardia: "Guarda 2", scoreGeneral: 85, scorePerforador: 90, numeroActividades: 12, puntosTotales: 175 },
            { id: "luis_lopez", nombre: "Luis", apellido: "López", nombreCompleto: "Luis López", taladro: "Taladro 3", pozo: "Pozo 3", fecha: "2023-01-03", guardia: "Guarda 3", scoreGeneral: 65, scorePerforador: 70, numeroActividades: 8, puntosTotales: 135 }
        ];
    }

    // Obter ranking simples (para página 1)
    getSimpleRanking() {
        const data = this.processedData.length === 0 ? this.getFallbackData() : this.processedData;
        
        // Agrupar por perforador e calcular totais
        const perforadorStats = {};

        data.forEach(record => {
            const key = record.id;
            if (!perforadorStats[key]) {
                perforadorStats[key] = {
                    nombre: record.nombre,
                    apellido: record.apellido,
                    nombreCompleto: record.nombreCompleto,
                    taladro: record.taladro,
                    totalPontos: 0,
                    totalRegistros: 0,
                    ultimaActividad: record.fecha
                };
            }

            perforadorStats[key].totalPontos += record.puntosTotales;
            perforadorStats[key].totalRegistros += 1;

            if (record.fecha && record.fecha > perforadorStats[key].ultimaActividad) {
                perforadorStats[key].ultimaActividad = record.fecha;
                perforadorStats[key].taladro = record.taladro; // Usar taladro mais recente
            }
        });

        // Converter para array
        const ranking = Object.values(perforadorStats);

        // Ordenar por pontos
        ranking.sort((a, b) => b.totalPontos - a.totalPontos);

        return ranking;
    }

    // Obter ranking simples com filtros (para página 2)
    getSimpleRankingWithFilters(filters = {}) {
        let data = this.processedData.length === 0 ? this.getFallbackData() : this.processedData;
        // Aplicar filtros se existirem
        if (filters && Object.keys(filters).length > 0) {
            data = this.applyFilters(data, filters);
        }

        // Agrupar por perforador e calcular médias
        const perforadorStats = {};

        data.forEach(record => {
            const key = record.id;
            if (!perforadorStats[key]) {
                perforadorStats[key] = {
                    nombre: record.nombre,
                    apellido: record.apellido,
                    nombreCompleto: record.nombreCompleto,
                    taladro: record.taladro,
                    totalPontos: 0,
                    totalRegistros: 0,
                    ultimaActividad: record.fecha
                };
            }

            perforadorStats[key].totalPontos += record.puntosTotales;
            perforadorStats[key].totalRegistros += 1;

            if (record.fecha && record.fecha > perforadorStats[key].ultimaActividad) {
                perforadorStats[key].ultimaActividad = record.fecha;
                perforadorStats[key].taladro = record.taladro; // Usar taladro mais recente
            }
        });

        // Converter para array e calcular pontos finais
        const ranking = Object.values(perforadorStats).map(stats => ({
            name: stats.nombre,
            surname: stats.apellido,
            rig: stats.taladro,
            points: Math.round(stats.totalPontos / stats.totalRegistros) // Média
        }));

        // Ordenar por pontos
        ranking.sort((a, b) => b.points - a.points);

        return ranking;
    }

    // Aplicar filtros aos dados
    applyFilters(data, filters) {
        return data.filter(record => {
            for (const key in filters) {
                if (filters[key] && record[key] !== filters[key]) {
                    return false;
                }
            }
            return true;
        });
    }
}

// Exportar uma instância única do DataManager
const dataManager = new DataManager();
export default dataManager;