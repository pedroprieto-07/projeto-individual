const configuracoes = {
    banco: {
        server: "svrprojetospooll.database.windows.net",
        user: "adminlocal",
        password: "#GfSpooll2020",
        database: "bd_spooll",
        options: {
            encrypt: true
        },
        pool: {
            max: 4,
            min: 1,
            idleTimeoutMillis: 30000,
            connectionTimeout: 5000
        }
    }
}
 
const sql = require('mssql');
sql.on('error', err => {
    console.error(`Erro de Conexão: ${err}`);
});


function conectar() {
  sql.close();
  return sql.connect(configuracoes.banco)
} 

module.exports = {
    conectar: conectar,
    sql: sql
}
