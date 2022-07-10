// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

contract Marketplace{
    string public name;
    uint public productCount=0;
    mapping(uint => Product) public products;
    struct Product{
        uint id;
        string name;
        uint price;
        address owner;
        bool purchased;
    } 
    event ProductCreated(uint id, string name, uint price, address owner, bool purchased);

    constructor() {
        name="Mouli";
    }

    function createProduct(string memory _name, uint _price) public {
        require(bytes(_name).length > 0);
        require(_price > 0);
        productCount++;
        products[productCount]=Product(productCount,_name,_price,msg.sender,false);
        emit ProductCreated(products[productCount].id, products[productCount].name, products[productCount].price, products[productCount].owner, products[productCount].purchased);
    }

}