const existingKeys = {};

existingKeys.data = {
    tableSchema : {
        "indice" : [
            { name: 'id', type: 'int', nullable: false, primary: true },
            { name: 'date', type: 'datetime', nullable: false },
            { name: 'indice', type: 'float', nullable: false },
            { name: 'localisation_id', type: 'int', nullable: false, foreignKey: { table: 'Localisation', field: 'id' } }
        ],
        "Localisation" : [
            { name: 'id', type: 'int', nullable: false, primary: true },
            { name: 'pays', type: 'varchar(255)', nullable: false },
            { name: 'ville', type: 'varchar(255)', nullable: false }
        ]
    }
}; 

existingKeys.sort = {


};

existingKeys.filterToSQL = {
    'gt': '>',
    'gte': '>=',
    'lt': '<',
    'lte': '<=',
    'eq': '=',
    'ne': '!=',
    'like': 'LIKE'
}; 

existingKeys.table = {
    
};

export default existingKeys;