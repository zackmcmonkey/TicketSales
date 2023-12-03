const path = require('path');
const fs = require('fs');
const solc = require('solc');

const TicketSalesPath = path.resolve(__dirname, 'contracts', 'TicketSales.sol');
const source = fs.readFileSync(TicketSalesPath, 'utf8');
//console.log(source);

let input = {
  language: "Solidity",
  sources: {
    "TicketSales.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};
//console.log(JSON.stringify(input))
//console.log(solc.compile(JSON.stringify(input)));
const output = JSON.parse(solc.compile(JSON.stringify(input)));
//console.log(output);
//console.log(output.contracts["TicketSales.sol"].TicketSales);
const contracts = output.contracts["TicketSales.sol"];
const contract=contracts['TicketSales'];
//console.log(contract);
console.log(JSON.stringify(contract.abi));
module.exports= {"abi":contract.abi,"bytecode":contract.evm.bytecode.object};
