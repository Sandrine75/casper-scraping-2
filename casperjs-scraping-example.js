// Usage: casperjs --ssl-protocol=any --engine=slimerjs paypal.js
// Open in browser: http://localhost:8083/get

var email = '',
  password = '';

var casper = require('casper').create({
    verbose: true,
    logLevel: "debug"
  }),
  webserverTest = require("webserver").create();

webserverTest.listen(8083, function(request, response) {
  if (request.url == '/get') {
    casper.start();
    casper.userAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36');

    casper.thenOpen('https://www.paypal.com/signin/', function() {
      this.fill('form', {
        'email': email,
        'password': password
      }, true);
    });

    casper.then(function() {
      casper.waitForSelector('.balanceNumeral', function() {
        response.statusCode = 200;

        var myBalance = this.getHTML('div.balanceNumeral span');

        var jsonData = {
          balance: myBalance,
          transactions: []
        };

        var transactionItems = this.getElementsInfo('div.transactionItem');

        var item;
        for (item in transactionItems) {
          jsonData.transactions.push({
            text: transactionItems[item].text
          });
        }

        response.write(JSON.stringify(jsonData));
        response.close();
      });
    });

    casper.run(function() {});
  }
});