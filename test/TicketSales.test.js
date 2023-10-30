const Web3 = require('web3');
const assert = require('assert');
const ganache = require('ganache-cli');
const web3 = new Web3(ganache.provider());

const { abi, bytecode } = require('../compile');



let accounts;
let ticketSale;

describe('TicketSale Contract', () => {

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    ticketSale = await new web3.eth.Contract(abi)
      .deploy({ data: bytecode, arguments: [100, 10000] })
      .send({ from: accounts[0], gasPrice: 8000000000, gas: 4700000});
  });

  it('should deploy TicketSale contract', async () => {
    assert.ok(ticketSale.options.address);
  });


  it('should allow buying a ticket with sufficient amount', async () => {
    const ticketPrice = 10000; 
    const sender = accounts[1];
    const senderBalanceBefore = await web3.eth.getBalance(sender);
    const initialTicketOwner = await ticketSale.methods.getTicketOf(sender).call();
  
    const valueSent = ticketPrice;
    await ticketSale.methods.buyTicket(1).send({ from: sender, value: valueSent });
  
    const senderBalanceAfter = await web3.eth.getBalance(sender);
    const newTicketOwner = await ticketSale.methods.getTicketOf(sender).call();
  
    const balanceChange = senderBalanceBefore - senderBalanceAfter;
    assert(balanceChange >= ticketPrice, "Insufficient balance reduction");
  
    assert.notStrictEqual(initialTicketOwner, newTicketOwner, "Ticket ownership not updated");
  });


  it('should allow offering a swap', async () => {
    // Create two user accounts
    const user1 = accounts[1];
    const user2 = accounts[2];

    // Buy a ticket for user1
    const ticketPrice = 10000;
    await ticketSale.methods.buyTicket(1).send({ from: user1, value: ticketPrice });

    // Buy a ticket for user2
    await ticketSale.methods.buyTicket(2).send({ from: user2, value: ticketPrice });

    // Offer a swap from user1 to user2
    await ticketSale.methods.offerSwap(user2).send({ from: user1 });

    // Check if the swap offer was successful
    const swapOffer = await ticketSale.methods.swapOffers(user1).call();
    assert.strictEqual(swapOffer, user2, "Swap offer not recorded correctly");
  });


  it('should allow accepting a swap', async () => {
    // Create two user accounts
    const user1 = accounts[1];
    const user2 = accounts[2];

    // Buy a ticket for user1
    const ticketPrice = 10000;
    await ticketSale.methods.buyTicket(1).send({ from: user1, value: ticketPrice });

    // Buy a ticket for user2
    await ticketSale.methods.buyTicket(2).send({ from: user2, value: ticketPrice });

    // Offer a swap from user1 to user2
    await ticketSale.methods.offerSwap(user2).send({ from: user1 });

    // Accept the swap from user2 to user1
    await ticketSale.methods.acceptSwap(user1).send({ from: user2 });

    // Check if the swap was successful
    const user1Ticket = await ticketSale.methods.getTicketOf(user1).call();
    const user2Ticket = await ticketSale.methods.getTicketOf(user2).call();

    // Assert that the tickets have been swapped correctly
    assert.equal(user2Ticket, 1, "User2's ticket not updated");
    assert.equal(user1Ticket, 2, "User1's ticket not updated");
  });


  it('should allow returning a ticket', async () => { //
    await ticketSale.methods.buyTicket(1).send({ from: accounts[1], value: await ticketSale.methods.ticketPrice().call()});
    await ticketSale.methods.returnTicket(1).send({ from: accounts[1]});
    const ticketOwner = await ticketSale.methods.getTicketOf(accounts[1]).call();
    assert.equal(ticketOwner, 0);
  });
});
