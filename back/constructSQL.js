import existingKeys from './field.js'; 

const construct = {};

// ======================= UTILS =======================
function getFieldType(tableName, fieldName) {
  const table = existingKeys.data.tableSchema[tableName];
  if (!table) return null;
  const field = table.find(f => f.name === fieldName);
  return field ? field.type : null;
}

function isValidField(tableName, fieldName) {
  const fieldType = getFieldType(tableName, fieldName);
  return fieldType !== null;
}

construct.getAllValidFields = function(tableName) {
  const table = existingKeys.data.tableSchema[tableName];
  return table ? table.map(f => f.name) : [];
}

function convertFieldValue(tableName, fieldName, value) {
  const fieldType = getFieldType(tableName, fieldName);
  if (!fieldType) return value;
  
  if (fieldType.includes('int') || fieldType === 'int') {
    return parseInt(value);
  } else if (fieldType.includes('float')) {
    return parseFloat(value);
  }
  return value;
}

// ======================= CONSTRUCTORS =======================


construct.buildSelect = function (fields, includeLocalisation) {
  if (!fields || fields.length === 0) {
    fields = existingKeys.data.tableSchema.indice.map(f => f.name);
  }
  
  const selectFields = fields.map(f => `p.${f}`).join(', ');
  
  if (includeLocalisation) {
    return `${selectFields}, l.ville, l.pays, l.latitude, l.longitude`;
  }
  
  return selectFields;
}

construct.buildWhere = function (filters, tableName = 'indice') {
  if (!filters || filters.length === 0) {
    return { clause: '', params: [] };
  }
  
  const conditions = [];
  const params = [];
  
  for (const filter of filters) {
    let preField = 'p.';
    if (existingKeys.data.tableSchema.Localisation.some(f => f.name === filter.field)) {
      preField = 'l.';
    }
    
    const opToSQL = existingKeys.filterToSQL;
    const sqlOperator = opToSQL[filter.operator] || '=';
    
    if (filter.operator === 'like') {
      conditions.push(`${preField}${filter.field} ${sqlOperator} %${filter.value}%`);
      params.push(`%${filter.value}%`);
    } else {
      conditions.push(`${preField}${filter.field} ${sqlOperator} ${convertFieldValue(tableName, filter.field, filter.value)}`);
      params.push(convertFieldValue(tableName, filter.field, filter.value));
    }
  }
  
  return {
    clause: 'WHERE ' + conditions.join(' AND '),
    params
  };
}


construct.buildOrder = function (sort, tableName = 'indice') {
  if (!sort) return '';
  
  const sortFields = sort.split(',');
  const orderClauses = [];
  const validFields = construct.getAllValidFields(tableName);
  
  for (const field of sortFields) {
    const newField = field.startsWith('-') ? field.substring(1) : field;
    if (!validFields.includes(newField)) continue;
    
    if (field.startsWith('-')) {
      orderClauses.push(`p.${field.substring(1)} DESC`);
    } else {
      orderClauses.push(`p.${field} ASC`);
    }
  }
  
  return orderClauses.length > 0 ? 'ORDER BY ' + orderClauses.join(', ') : '';
}


construct.parseFilters = function(query, tableName = 'indice') {
    const filters = [];
    const validFields = construct.getAllValidFields(tableName);
    const validFields2 = construct.getAllValidFields('Localisation');
    const validOperators = Object.keys(existingKeys.filterToSQL);
    for (const key in query.filter) {
        const field = key;
        for (const operator in query.filter[key]) {
            const value = query.filter[key][operator];
            if (!validFields.includes(field) && !validFields2.includes(field)) {
                throw new Error(`Champ de filtrage non autorisé ou inexistant: ${field}`);
            }
            if (!validOperators.includes(operator)) {
                throw new Error(`L'opérateur n'existe pas (n'est pas suporté): ${operator}`);
            }
            filters.push({ field, operator, value });
        }
    }
    return filters;
}


construct.formatResults = function(rows, fields, includeLocalisation, tableName = 'indice') {
  const defaultFields = construct.getAllValidFields(tableName);
  
  return rows.map(row => {
    const product = {};
    
    const fieldsToUse = (fields && fields.length > 0) ? fields : defaultFields;
    
    if (fieldsToUse && fieldsToUse.length > 0) {
      fieldsToUse.forEach(field => {
        if (row[field] !== undefined) {
          product[field] = row[field];
        }
      });
    }
    
    if (includeLocalisation && row.localisation_id) {
      product.localisation = {
        id: row.localisation_id,
        ville: row.ville,
        pays: row.pays,
        latitude: row.latitude,
        longitude: row.longitude
      };
    }
    
    return product;
  });
}

export default construct;