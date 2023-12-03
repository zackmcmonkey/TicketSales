const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { abi, bytecode } = require('./compile');



const provider = new HDWalletProvider(
  'secret pig food enact edge meat fault bulk flat spin human capital',
  // remember to change this to your own phrase!
  'https://goerli.infura.io/v3/04e6c5d6ffc24c4a984edd8d317bb6e8'
  // remember to change this to your own endpoint!
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  ecommerce = await new web3.eth.Contract(abi)
    .deploy({ data: bytecode, arguments: [20, 1000] })
    .send({ from: accounts[0], gasPrice: 8000000000, gas: 4700000});

  console.log('Contract deployed to', ecommerce.options.address);
  provider.engine.stop();
};
deploy();