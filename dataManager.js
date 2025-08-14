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
            { id: "juan_perez", nombre: "Juan", apellido: "Pérez", nombreCompleto: "Juan Pérez", taladro: "PAE-002", pozo: "P001", fecha: new Date('2025-01-10'), guardia: "day", scoreGeneral: 85, scorePerforador: 90, numeroActividades: 8, puntosTotales: 175 },
            { id: "carlos_rodriguez", nombre: "Carlos", apellido: "Rodriguez", nombreCompleto: "Carlos Rodriguez", taladro: "PAE-003", pozo: "P002", fecha: new Date('2025-01-10'), guardia: "night", scoreGeneral: 88, scorePerforador: 92, numeroActividades: 7, puntosTotales: 180 },
            { id: "miguel_gonzalez", nombre: "Miguel", apellido: "González", nombreCompleto: "Miguel González", taladro: "PAE-005", pozo: "P003", fecha: new Date('2025-01-10'), guardia: "day", scoreGeneral: 82, scorePerforador: 88, numeroActividades: 9, puntosTotales: 170 },
            { id: "roberto_martinez", nombre: "Roberto", apellido: "Martinez", nombreCompleto: "Roberto Martinez", taladro: "PAE-002", pozo: "P004", fecha: new Date('2025-01-09'), guardia: "night", scoreGeneral: 80, scorePerforador: 85, numeroActividades: 6, puntosTotales: 165 },
            { id: "diego_fernandez", nombre: "Diego", apellido: "Fernández", nombreCompleto: "Diego Fernández", taladro: "PAE-003", pozo: "P005", fecha: new Date('2025-01-09'), guardia: "day", scoreGeneral: 78, scorePerforador: 82, numeroActividades: 7, puntosTotales: 160 }
        ];
    }

    // Obter ranking simples (para página 2)
    getSimpleRanking() {
        if (this.processedData.length === 0) {
            return this.getFallbackData();
        }
        
        // Agrupar por perforador e calcular médias
        const perforadorStats = {};
        
        this.processedData.forEach(record => {
            const key = record.id;
            if (!perforadorStats[key]) {
                perforadorStats[key] = {
                    nombre: record.nombre,
                    apellido: record.apellido,
                    nombreCompleto: record.nombreCompleto,
                    taladro: record.taladro,
                    totalPuntos: 0,
                    totalRegistros: 0,
                    ultimaActividad: record.fecha
                };
            }
            
            perforadorStats[key].totalPuntos += record.puntosTotales;
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
            points: Math.round(stats.totalPuntos / stats.totalRegistros) // Média
        }));
        
        // Ordenar por pontos
        ranking.sort((a, b) => b.points - a.points);
        
        return ranking;
    }

    // Obter ranking avançado (para página 1)
    getAdvancedRanking(filters = {}) {
        if (this.processedData.length === 0) {
            return [];
        }
        
        // Aplicar filtros
        let filteredData = this.applyFilters(this.processedData, filters);
        
        // Agrupar por perforador
        const perforadorStats = {};
        
        filteredData.forEach(record => {
            const key = record.id;
            if (!perforadorStats[key]) {
                perforadorStats[key] = {
                    driller: {
                        id: key,
                        name: record.nombre,
                        surname: record.apellido,
                        employeeId: key.toUpperCase()
                    },
                    records: [],
                    taladros: new Set(),
                    guardias: new Set(),
                    totalActividades: 0,
                    diasActivos: 0
                };
            }
            
            perforadorStats[key].records.push({
                date: record.fecha ? record.fecha.toISOString().split('T')[0] : '',
                rig: record.taladro,
                shift: record.guardia,
                totalPoints: record.puntosTotales,
                tasksCompleted: record.numeroActividades
            });
            
            perforadorStats[key].taladros.add(record.taladro);
            perforadorStats[key].guardias.add(record.guardia);
            perforadorStats[key].totalActividades += record.numeroActividades;
            perforadorStats[key].diasActivos++;
        });
        
        // Calcular ranking final
        const ranking = Object.values(perforadorStats).map(stats => {
            const weightedAverage = this.calculateWeightedAverage(stats.records);
            const mainRig = Array.from(stats.taladros)[0];
            const mainShift = this.getMostCommonShift(stats.records);
            
            return {
                driller: stats.driller,
                points: weightedAverage,
                totalTasks: stats.totalActividades,
                activeDays: stats.diasActivos,
                mainRig: mainRig,
                mainShift: mainShift,
                rigs: Array.from(stats.taladros),
                shifts: Array.from(stats.guardias)
            };
        });
        
        // Ordenar por pontos
        ranking.sort((a, b) => b.points - a.points);
        
        return ranking;
    }

    // Aplicar filtros
    applyFilters(data, filters) {
        return data.filter(record => {
            // Filtro de período
            if (filters.period && record.fecha) {
                const now = new Date();
                const recordDate = record.fecha;
                
                switch (filters.period) {
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        if (recordDate < weekAgo) return false;
                        break;
                    case 'month':
                        if (recordDate.getMonth() !== now.getMonth() || 
                            recordDate.getFullYear() !== now.getFullYear()) return false;
                        break;
                    case 'quarter':
                        const currentQuarter = Math.floor(now.getMonth() / 3);
                        const recordQuarter = Math.floor(recordDate.getMonth() / 3);
                        if (recordQuarter !== currentQuarter || 
                            recordDate.getFullYear() !== now.getFullYear()) return false;
                        break;
                    case 'year':
                        if (recordDate.getFullYear() !== now.getFullYear()) return false;
                        break;
                    case 'custom_15_days':
                        const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
                        if (recordDate < fifteenDaysAgo) return false;
                        break;
                }
            }
            
            // Filtro de taladro
            if (filters.rig && filters.rig !== 'all' && record.taladro !== filters.rig) {
                return false;
            }
            
            // Filtro de guardia
            if (filters.shift && filters.shift !== 'all' && record.guardia !== filters.shift) {
                return false;
            }
            
            // Filtro de data específica
            if (filters.date && record.fecha) {
                const filterDate = new Date(filters.date);
                const recordDate = record.fecha;
                if (recordDate.toDateString() !== filterDate.toDateString()) {
                    return false;
                }
            }
            
            return true;
        });
    }

    // Calcular média ponderada
    calculateWeightedAverage(records) {
        if (records.length === 0) return 0;
        
        let totalWeightedPoints = 0;
        let totalWeight = 0;
        
        records.forEach(record => {
            const weight = record.tasksCompleted || 1;
            totalWeightedPoints += record.totalPoints * weight;
            totalWeight += weight;
        });
        
        return totalWeight > 0 ? Math.round(totalWeightedPoints / totalWeight) : 0;
    }

    // Obter guardia mais comum
    getMostCommonShift(records) {
        const shiftCounts = {};
        records.forEach(record => {
            shiftCounts[record.shift] = (shiftCounts[record.shift] || 0) + 1;
        });
        
        return Object.keys(shiftCounts).reduce((a, b) => 
            shiftCounts[a] > shiftCounts[b] ? a : b, 'day'
        );
    }

    // Obter estatísticas gerais
    getGeneralStats(data = null) {
        const workingData = data || this.processedData;
        
        if (workingData.length === 0) {
            return {
                totalDrillers: 0,
                totalTasks: 0,
                avgPoints: 0,
                lastUpdated: this.lastUpdated ? this.lastUpdated.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }) : '--'
            };
        }
        
        const uniqueDrillers = new Set(workingData.map(r => r.id)).size;
        const totalTasks = workingData.reduce((sum, r) => sum + r.numeroActividades, 0);
        const avgPoints = Math.round(workingData.reduce((sum, r) => sum + r.puntosTotales, 0) / workingData.length);
        
        return {
            totalDrillers: uniqueDrillers,
            totalTasks: totalTasks,
            avgPoints: avgPoints,
            lastUpdated: this.lastUpdated ? this.lastUpdated.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }) : '--'
        };
    }

    // Auto-refresh dos dados
    startAutoRefresh(intervalMinutes = 5) {
        setInterval(() => {
            this.loadCSVData();
        }, intervalMinutes * 60 * 1000);
    }
}

// Instância global do gerenciador de dados
window.dataManager = new DataManager();

// Função utilitária para inicializar os dados
window.initializeData = async function() {
    try {
        await window.dataManager.loadCSVData();
        return true;
    } catch (error) {
        console.error('Erro ao inicializar dados:', error);
        return false;
    }
};