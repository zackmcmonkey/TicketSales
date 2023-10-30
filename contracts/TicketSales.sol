// SPDX-License-Identifier: GPL-3.0


pragma solidity >=0.7.0 <0.9.0;



contract TicketSales {

    address public owner;  
    uint public ticketPrice; 
    uint public totalTickets;  
    uint public serviceFeePercentage;  

    mapping(address => uint) public ticketOwners;  
    mapping(address => address) public swapOffers; 

    constructor(uint numTickets, uint price) {
        owner = msg.sender;
        totalTickets = numTickets;
        ticketPrice = price;
        serviceFeePercentage = 10;  
    }

    function buyTicket(uint ticketId) public payable {
        require(msg.sender != owner, "Owner cannot buy tickets");
        require(ticketId > 0 && ticketId <= totalTickets, "Invalid ticket identifier");
        require(ticketOwners[msg.sender] == 0, "You already own a ticket");
        require(msg.value == ticketPrice, "Incorrect amount sent");

        ticketOwners[msg.sender] = ticketId;
    }

    function getTicketOf(address person) public view returns (uint) {
        return ticketOwners[person];
    }

    function offerSwap(address partner) public {
        require(ticketOwners[msg.sender] > 0, "You do not own a ticket");
        require(ticketOwners[partner] > 0, "Partner does not own a ticket");

        swapOffers[msg.sender] = partner;
    }

    function acceptSwap(address partner) public {

        require(ticketOwners[msg.sender] > 0, "You do not own a ticket");
        require(ticketOwners[partner] > 0, "Partner does not own a ticket");
        address offer = swapOffers[partner];
        require(offer == msg.sender, "No swap offer from the partner");

        uint myTicket = ticketOwners[msg.sender];
        uint partnerTicket = ticketOwners[partner];
        ticketOwners[msg.sender] = partnerTicket;
        ticketOwners[partner] = myTicket;

        delete swapOffers[partner];
    }

    function returnTicket(uint ticketId) public {
        require(ticketId != 0, "You do not have a ticket");
        require(ticketOwners[msg.sender] == ticketId, "You do not own this ticket");

        uint ticketRefund = (ticketPrice * (100 - serviceFeePercentage)) / 100;
        payable(msg.sender).call{value: ticketRefund}("");


        delete ticketOwners[msg.sender];
    }
}