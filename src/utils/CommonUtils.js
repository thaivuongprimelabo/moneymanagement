import Constants from '../constants/Constants';
const CommonUtils = {
  formatDatetime:(year, month, day, format) => {
  	month = month.length == 1 ? '0' + month : month;
    day = day.length == 1 ? '0' + day : day;

    format = format.replace('YYYY', year);
  	format = format.replace('MM', month);
  	format = format.replace('DD', day);

    return format;
  },

  getCurrentDate: (format) => {
  	 var date = new Date();
  	 var month = JSON.stringify(month);

  	 var year = date.getFullYear();
  	 var month = date.getMonth() === 11 ? 12 : date.getMonth() + 1;
  	 month = JSON.stringify(month);
  	 month = month.length == 1 ? '0' + month : month;
  	 var day  = JSON.stringify(date.getDate());
  	 day = day.length == 1 ? '0' + day : day;

  	 var hour = JSON.stringify(date.getHours());
  	 hour = hour.length == 1 ? '0' + hour : hour;
  	 var minute = JSON.stringify(date.getMinutes());
  	 minute = minute.length == 1 ? '0' + minute : minute;
  	 var second = JSON.stringify(date.getSeconds());
  	 second = second.length == 1 ? '0' + second : second;

  	 format = format.replace('YYYY', year);
  	 format = format.replace('MM', month);
  	 format = format.replace('DD', day);
  	 format = format.replace('HH', hour);
  	 format = format.replace('II', minute);
  	 format = format.replace('SS', second); 
  	 return format

  },

  formatCurrency: (nStr, decSeperate, groupSeperate) => {
  	if(nStr == null) {
  		return '0 ' + Constants.CURRENCY;
  	}
  	nStr += '';
    x = nStr.split(decSeperate);
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + groupSeperate + '$2');
    }
    return x1 + x2 + ' '  + Constants.CURRENCY;
  },

  cnvNull: (input) => {
    return input == null || input == 'null' ? '--' : input;
  }
}

export default CommonUtils;