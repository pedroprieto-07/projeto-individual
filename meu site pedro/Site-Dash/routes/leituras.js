var express = require('express');
var router = express.Router();
var sequelize = require('../models').sequelize;
var Leitura = require('../models').Leitura;

/* Recuperar as últimas N leituras */
router.get('/ultimas', function (req, res, next) {

	// quantas são as últimas leituras que quer? 8 está bom?
	const limite_linhas = 7;

	console.log(`Recuperando as últimas ${limite_linhas} leituras`);

	const instrucaoSql = `select count(h.id_historico ) as ocupadas,vs.vaga 
			from historico h, 
				Vaga_sensor vs where h.ocupacao = 1 
				and vs.id_Sensor = h.fkSensor 
				and h.data_hora >= CONVERT(Datetime, '${hoje()}', 120)
				group by vs.vaga;`;

	sequelize.query(instrucaoSql, {
		model: Leitura,
		mapToModel: true
	})
		.then(resultado => {
			console.log(`Encontrados: ${resultado.length}`);
			res.json(resultado);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});
});


// tempo real (último valor de cada leitura)
router.get('/tempo-real', function (req, res, next) {

	console.log(`Recuperando a última leitura`);

	// const instrucaoSql = `select top 1 fkSensor, ocupacao, FORMAT(data_hora,'HH:mm:ss') as momento_grafico  
	// 					from historico order by id_historico desc`;

	const instrucaoSql = `select 
	(select count(id_historico) from historico where ocupacao = 1 
							and fkSensor in (select id_Sensor from vaga_sensor where fkEstacionamento = 1)) as ocupadas, 						
	(select count(id_historico) from historico where ocupacao = 0
							and fkSensor in (select id_Sensor from vaga_sensor where fkEstacionamento = 1)) as  livres; `;

	sequelize.query(instrucaoSql, { type: sequelize.QueryTypes.SELECT })
		.then(resultado => {
			res.json(resultado[0]);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});

});


// estatísticas (max, min, média, mediana, quartis etc)
router.get('/estatisticas', function (req, res, next) {

	console.log(`Recuperando as estatísticas atuais`);

	const instrucaoSql = `select 
							max(temperatura) as temp_maxima, 
							min(temperatura) as temp_minima, 
							avg(temperatura) as temp_media,
							max(umidade) as umidade_maxima, 
							min(umidade) as umidade_minima, 
							avg(umidade) as umidade_media 
						from leitura`;

	sequelize.query(instrucaoSql, { type: sequelize.QueryTypes.SELECT })
		.then(resultado => {
			res.json(resultado[0]);
		}).catch(erro => {
			console.error(erro);
			res.status(500).send(erro.message);
		});

});

function hoje(){
	const momento1 = new Date();
	return `${momento1.getFullYear()}-${(momento1.getMonth()+1).toString().padStart(2,'0')}-${momento1.getDate().toString().padStart(2,'0')}`;
}
module.exports = router;
