const mongoose = require('mongoose');

// Valida que um ou mais campos são ObjectIds válidos do Mongo, antes da
// requisição chegar no controller. `source` diz de onde ler ('params',
// 'body' ou 'query'). Aceita campos que são array de IDs (ex: classIds).
// Não trata "campo obrigatório" — se o campo não veio, deixa passar e quem
// decide se isso é erro é o próprio controller, como já faz hoje.
function validateObjectIds(fields, source = 'params') {
  const fieldList = Array.isArray(fields) ? fields : [fields];

  return (req, res, next) => {
    const data = req[source] || {};

    for (const field of fieldList) {
      const value = data[field];
      if (value === undefined || value === null) continue;

      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        if (!mongoose.Types.ObjectId.isValid(v)) {
          return res.status(400).json({ mensagem: 'Formato de ID inválido' });
        }
      }
    }

    next();
  };
}

module.exports = validateObjectIds;