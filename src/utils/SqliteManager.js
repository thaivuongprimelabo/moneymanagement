const SqliteManager = {
  getActionList:(db, sql) => {
  	db.transaction((tx) => {
      tx.executeSql(sql, [], (tx, results) => {
          var len = results.rows.length;
          if(len > 0) {
            var actionInDay = [];
              for(var i = 0; i < len; i++) {
                 var row = results.rows.item(i);
                 var obj = {id: row.id, name: row.name, type: row.type_id, cost: CommonUtils.formatCurrency(row.cost, '.', '.'), color: row.color, icon: row.icon, create_at: row.create_at};
                 actionInDay.push(obj);
              }

              return actionInDay;
          }
      });
    });
  },
}

export default SqliteManager;